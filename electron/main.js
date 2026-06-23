const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  dialog,
  Menu,
} = require("electron/main");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const loudness = require("loudness");
let hasCheckedForUpdates = false;
let bluetoothPinCallback = null;
let selectBluetoothCallback = null;
let cachedDeviceToSelect = null;

function checkForUpdatesOnce() {
  if (hasCheckedForUpdates || !app.isPackaged) return;
  hasCheckedForUpdates = true;
  autoUpdater.checkForUpdatesAndNotify();
}

function checkForUpdatesManual() {
  if (!app.isPackaged) {
    dialog.showMessageBox({
      type: "info",
      title: "Updates",
      message: "Update checks are available only in packaged builds.",
    });
    return;
  }

  autoUpdater.checkForUpdates();
}

function setupAppMenu() {
  const template = [
    {
      label: "Help",
      submenu: [
        {
          label: "Check for Updates",
          click: () => {
            checkForUpdatesManual();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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

  win.webContents.on("before-input-event", (event, input) => {
    const key = input.key?.toLowerCase();
    if ((input.control || input.meta) && key === "r") {
      event.preventDefault();
      win.reload();
    }

    if (key === "f5") {
      event.preventDefault();
      win.reload();
    }
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

  // Auto-allow camera/microphone permission requests from renderer.
  // This helps packaged desktop builds where the renderer may not trigger
  // the regular Chrome permission UI. Adjust as needed for security.
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      try {
        if (
          permission === "media" ||
          permission === "camera" ||
          permission === "microphone"
        ) {
          callback(true);
          return;
        }
      } catch (e) {
        console.error("Permission handler error:", e);
      }

      // Deny other permissions by default
      callback(false);
    },
  );

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

  if (false) {
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

  win.once("ready-to-show", () => {
    checkForUpdatesOnce();
  });
}

autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info.version);
});

autoUpdater.on("update-not-available", (info) => {
  console.log(
    "No update available. Current/latest:",
    app.getVersion(),
    info.version,
  );
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent.toFixed(1)}%`,
  );
});

autoUpdater.on("update-downloaded", () => {
  console.log("Update downloaded.");
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message:
        "A new version has been downloaded. Restart the application to apply the updates.",
      buttons: ["Restart", "Later"],
    })
    .then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

autoUpdater.on("error", (err) => {
  console.error(
    "Error in auto-updater:",
    err == null ? "unknown" : err.message,
  );
});

ipcMain.handle("check-for-updates-manual", async () => {
  checkForUpdatesManual();
  return { ok: true };
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.disableWebInstaller = true;
// -----------------------------------------------------
//   ELECTRON APP EVENTS
// -----------------------------------------------------
app.whenReady().then(() => {
  setupAppMenu();
  createWindow();

  if (app.isPackaged) {
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "Wehear604",
      repo: "IMS-Desktop-App",
    });

    checkForUpdatesOnce();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
