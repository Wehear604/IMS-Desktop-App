const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  dialog,
  shell,
  net,
} = require("electron");
const path = require("node:path");
const loudness = require("loudness");
const pkg = require("../package.json"); // To read your current version

let bluetoothPinCallback = null;
let selectBluetoothCallback = null;

// --- CONFIGURATION ---
// Replace this with the URL where you will host your version.json
const UPDATE_CHECK_URL = "https://your-website.com/version.json";

async function checkForUpdates(win) {
  const request = net.request(UPDATE_CHECK_URL);

  request.on("response", (response) => {
    let body = "";
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => {
      try {
        const data = JSON.parse(body);
        // Compare version in package.json with version in remote JSON
        if (data.latestVersion !== pkg.version) {
          if (data.forceUpdate) {
            // FORCE UPDATE LOGIC
            dialog.showMessageBoxSync(win, {
              type: "error",
              title: "Update Required",
              message: `A mandatory update (v${data.latestVersion}) is available. Please update to continue.`,
              buttons: ["Download & Update"],
            });
            shell.openExternal(data.url);
            app.quit();
          } else {
            // OPTIONAL UPDATE LOGIC
            dialog
              .showMessageBox(win, {
                type: "info",
                title: "Update Available",
                message: `Version ${data.latestVersion} is available. Would you like to update?`,
                buttons: ["Update Now", "Later"],
                cancelId: 1,
              })
              .then((result) => {
                if (result.response === 0) {
                  shell.openExternal(data.url);
                }
              });
          }
        }
      } catch (e) {
        console.error("Update check failed to parse response.");
      }
    });
  });

  request.on("error", (err) => {
    console.error("Network error during update check:", err);
  });

  request.end();
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

  // Trigger update check after window is ready
  win.webContents.once("did-finish-load", () => {
    checkForUpdates(win);
  });

  // --- EXISTING BLUETOOTH & VOLUME LOGIC ---
  win.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault();
      selectBluetoothCallback = callback;
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

  ipcMain.on("bluetooth-device-selected", (event, deviceId) => {
    if (selectBluetoothCallback) {
      selectBluetoothCallback(deviceId);
      selectBluetoothCallback = null;
    }
  });

  ipcMain.handle("get-system-volume", async () => {
    try {
      const volume = await loudness.getVolume();
      const isMuted = await loudness.getMuted();
      return { volume, muted: isMuted };
    } catch (err) {
      return null;
    }
  });

  // Load App
  if (false) {
    win.loadFile(path.join(__dirname, "..", "build", "index.html"));
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
