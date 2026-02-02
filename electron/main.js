const { app, BrowserWindow, ipcMain, session } = require("electron/main");
const path = require("node:path");
const loudness = require("loudness");
let bluetoothPinCallback = null;
let selectBluetoothCallback = null;

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
    console.log("Bluetooth pairing response received:", response);
    if (bluetoothPinCallback) bluetoothPinCallback(response);
  });

  session.defaultSession.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback;

    console.log("Bluetooth pairing request from system:", details);

    // send pairing request to React UI
    win.webContents.send("bluetooth-pairing-request", details);
  });

  ipcMain.on("bluetooth-device-selected", (event, deviceId) => {
    if (selectBluetoothCallback) {
      console.log("User selected device:", deviceId);
      selectBluetoothCallback(deviceId);
      selectBluetoothCallback = null;
    }
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
