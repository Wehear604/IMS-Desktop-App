const { app, BrowserWindow } = require("electron");
const path = require("path");

// --- START: Auto-reload setup for development ---
// Enable auto-reload in development
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

require("./ble");

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
        }
    });

    win.maximize();

    // Check if the app is packaged OR if the environment variable is set to force static loading
    // const FORCE_STATIC_BUILD = process.env.LOAD_STATIC_BUILD === 'true';
    // if (app.isPackaged || FORCE_STATIC_BUILD) {
    //     // Load the static index.html from the build folder
    //     win.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
    //     console.log("Forcing static build load from:", path.join(__dirname, '..', 'build', 'index.html'));

    //     // Open DevTools, as you might need them for debugging the static build
    //     win.webContents.openDevTools();
    // } else {
        // Load the React development server for local testing
        win.loadURL("http://localhost:3000");
        // win.webContents.openDevTools();
        console.log("Loading development server: http://localhost:3000");
    // }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});