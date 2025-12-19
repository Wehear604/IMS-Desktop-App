const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// --- START: Auto-reload setup for development ---
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
// --- END: Auto-reload setup for development ---

// BLE System
const { getConnectedDeviceGatt } = require("./ble");

// OTA Engine
const { OtaSession } = require("./otaSession");

let win = null;

function createWindow() {
  win = new BrowserWindow({
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
  win.loadURL("http://localhost:3000");
  console.log("Loading development server: http://localhost:3000");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ------------------------------------------
//  OTA IPC CONTROLLER
// ------------------------------------------
ipcMain.on("ota-start", async (event, payload) => {
  try {
    const { id, buffer } = payload;

    if (!id || !buffer) {
      win.webContents.send("ota-status", "Invalid OTA payload");
      return;
    }

    const dev = getConnectedDeviceGatt(id);
    if (!dev || !dev.inChar || !dev.outChar) {
      win.webContents.send(
        "ota-status",
        "Device not connected or OTA chars missing"
      );
      return;
    }

    win.webContents.send("ota-status", "OTA starting...");

    const reader = {
      buffer,
      size() {
        return buffer.byteLength;
      },
      read(offset, length) {
        return Buffer.from(buffer).slice(offset, offset + length);
      },
    };

    const session = new OtaSession({
      device: dev.device,
      chIn: dev.inChar,
      chOut: dev.outChar,
      reader,
      onStatus: (msg) => win.webContents.send("ota-status", msg),
      onProgress: (pct) => win.webContents.send("ota-progress", pct),
      onInfo: (info) =>
        win.webContents.send("ota-status", "Info: " + JSON.stringify(info)),
      onDone: () => win.webContents.send("ota-done", { success: true }),
      onError: (err) =>
        win.webContents.send("ota-done", { success: false, error: err }),
      log: (msg) => win.webContents.send("ota-status", msg),
    });
    console.log("first session", session);
    session.start();
  } catch (err) {
    console.error("OTA error", err);
    win.webContents.send("ota-status", "OTA failed");
    win.webContents.send("ota-done", { success: false });
  }
});
