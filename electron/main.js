const { app, BrowserWindow, ipcMain, session } = require("electron/main");
const path = require("node:path");
const loudness = require("loudness");
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

let bluetoothPinCallback = null;
let selectBluetoothCallback = null;
let cachedDeviceToSelect = null;

// Auto reload during development
if (process.env.NODE_ENV === "development") {
  try {
    require("electron-reload")(path.join(__dirname, ".."), {
      electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
      awaitWriteFinish: true,
    });
  } catch (e) {
    console.log("Auto-reload failed:", e);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    frame: true,
    icon: path.join(__dirname, "..", "public", "ims.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.maximize();

  // Auto-check for updates on startup
  win.webContents.on('did-finish-load', () => {
    https.get('https://imsdevelopment.wehear.in/api/version/latest', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code === 200 && parsed.data) {
            const apiMainVersion = parsed.data.main_version;
            const apiSubVersion = parsed.data.sub_version;

            // Format API version, e.g., main: 1, sub: 0.1 -> "1.0.1"
            // Wait, their versioning in package.json is 0.1.0. 
            // Let's just compare the exact strings, or assume if it's different we trigger update.
            // A safer float comparison:
            const apiVersionFloat = parseFloat(`${apiMainVersion}.${apiSubVersion.toString().replace('.', '')}`);
            const currentAppVersion = app.getVersion(); // e.g. "0.1.0"

            // Extract the first two numbers for float comparison, e.g "0.1"
            const match = currentAppVersion.match(/^(\d+)\.(\d+)/);
            const currentVersionFloat = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;

            console.log(`Checking version: App(${currentVersionFloat}) vs API(${apiVersionFloat})`);

            // If API version is strictly greater, trigger auto-update silently
            if (apiVersionFloat > currentVersionFloat) {
              console.log("Update found! Starting background update.");
              startBackgroundUpdate(win.webContents);
            }
          }
        } catch (e) {
          console.error("Auto-update check failed:", e);
        }
      });
    }).on('error', err => console.error("Update request error:", err));
  });

  win.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault();
      selectBluetoothCallback = callback;

      console.log("Sending device list to renderer:", deviceList.length);

      // send device list to React UI
      win.webContents.send("bluetooth-device-list", deviceList);
    },
  );

  ipcMain.on("bluetooth-pairing-response", (event, response) => {
    if (bluetoothPinCallback) bluetoothPinCallback(response);
  });

  session.defaultSession.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback;
    win.webContents.send("bluetooth-pairing-request", details);
  });

  session.defaultSession.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback;

    console.log("Bluetooth pairing request from system:", details);

    // send pairing request to React UI
    win.webContents.send("bluetooth-pairing-request", details);
  });

  // ipcMain.on("bluetooth-device-selected", (event, deviceId) => {
  //   if (selectBluetoothCallback) {
  //     console.log("User selected device:", deviceId);
  //     selectBluetoothCallback(deviceId);
  //     selectBluetoothCallback = null;
  //   }
  // });

  win.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault(); // Stop default Chrome popup
      console.log("Bluetooth scan started. Devices found:", deviceList.length);

      // Get the ID we are looking for (either from cache or null)
      const targetId = cachedDeviceToSelect;

      // FIND THE DEVICE (Case-Insensitive Match)
      const foundDevice = deviceList.find(
        (d) => targetId && d.deviceId.toUpperCase() === targetId.toUpperCase(),
      );

      if (foundDevice) {
        console.log("Auto-selecting found device:", foundDevice.deviceId);
        callback(foundDevice.deviceId);

        // Cleanup
        cachedDeviceToSelect = null;
        selectBluetoothCallback = null;
      } else {
        // Not found? Wait for user or next scan update
        console.log("Target not found yet. Showing picker list...");
        selectBluetoothCallback = callback;
        win.webContents.send("bluetooth-device-list", deviceList);
      }
    },
  );

  ipcMain.handle("check-safe-buds-connected", async () => {
    return await isSafeBudsConnected();
  });

  ipcMain.on("bluetooth-device-selected", (event, deviceId) => {
    console.log("React requested device:", deviceId);

    if (selectBluetoothCallback) {
      // Scenario A: Scan is already running -> Select immediately
      console.log("Scan active. Selecting now.");
      selectBluetoothCallback(deviceId);
      selectBluetoothCallback = null;
      cachedDeviceToSelect = null;
    } else {
      // Scenario B: Scan hasn't started -> Cache it for when it does
      console.log("Scan not active. Caching ID for later.");
      cachedDeviceToSelect = deviceId;
    }
  });

  ipcMain.on("cancel-bluetooth-request", () => {
    if (selectBluetoothCallback) {
      selectBluetoothCallback(""); // Cancel
      selectBluetoothCallback = null;
    }
    cachedDeviceToSelect = null;
  });

  ipcMain.on("cancel-bluetooth-request", () => {
    console.log("User cancelled Bluetooth request");
    if (selectBluetoothCallback) {
      selectBluetoothCallback(""); // cancel request
      selectBluetoothCallback = null;
    }
  });

  ipcMain.handle("get-system-volume", async () => {
    try {
      const volume = await loudness.getVolume(); // 0 – 100
      const isMuted = await loudness.getMuted();

      return {
        volume,
        muted: isMuted,
      };
    } catch (err) {
      console.error("Volume fetch failed:", err);
      return null;
    }
  });

  ipcMain.handle("app-version", () => {
    return app.getVersion();
  });

  if (true) {
    win.loadFile(path.join(__dirname, "..", "build", "index.html"));
    console.log(
      "Forcing static build load from:",
      path.join(__dirname, "..", "build", "index.html"),
    );
  } else {
    win.loadURL("http://localhost:3000");

    win.webContents.openDevTools();
    console.log("Loading development server: http://localhost:3000");
  }

  // --- Custom Auto Update Logic ---
  const startBackgroundUpdate = (webContentsObj) => {
    const exeUrl = "https://testserver3.wehear.in/uploads/DynamicEXE/ims.exe";
    const tempExePath = path.join(app.getPath("temp"), "IMS_Update_Setup.exe");

    // Ensure we replace the existing file instead of creating new ones
    if (fs.existsSync(tempExePath)) {
      try { fs.unlinkSync(tempExePath); } catch (e) { console.error("Could not delete old installer:", e); }
    }

    const file = fs.createWriteStream(tempExePath);
    if (webContentsObj) webContentsObj.send("update-download-progress", "Starting background update download...");

    https.get(exeUrl, (response) => {
      // Check for redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (webContentsObj) webContentsObj.send("update-download-progress", "Redirecting download...");
        https.get(response.headers.location, handleDownload).on("error", handleError);
        return;
      }
      handleDownload(response);
    }).on("error", handleError);

    function handleDownload(response) {
      if (response.statusCode !== 200) {
        return handleError(new Error(`Failed to get file, status code: ${response.statusCode}`));
      }

      const totalBytes = parseInt(response.headers["content-length"], 10);
      let downloadedBytes = 0;

      response.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes) {
          const percent = Math.round((downloadedBytes / totalBytes) * 100);
          if (webContentsObj) webContentsObj.send("update-download-progress", `Downloading Update: ${percent}%`);
        }
      });

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        if (webContentsObj) webContentsObj.send("update-download-progress", "Download complete! Restarting and installing...");

        // Execute the installer silently and detach
        setTimeout(() => {
          // We rely on the NSIS installer's smart registry to find the old installation path automatically.
          // The --force-run flag ensures the newly installed version automatically launches.
          const subprocess = spawn(tempExePath, ["/S", "--force-run"], {
            detached: true,
            stdio: "ignore",
          });
          subprocess.unref();
          app.quit(); // Close the current app to allow replacement
        }, 1500);
      });
    }

    function handleError(err) {
      fs.unlink(tempExePath, () => { }); // Cleanup
      if (webContentsObj) webContentsObj.send("update-download-progress", `Download failed: ${err.message}`);
      console.error("Update download failed:", err);
    }
  };

  ipcMain.on("download-and-install-update", (event) => {
    startBackgroundUpdate(event.sender);
  });

}

// -----------------------------------------------------
//   ELECTRON APP EVENTS
// -----------------------------------------------------
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
