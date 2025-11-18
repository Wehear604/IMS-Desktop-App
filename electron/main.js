const { app, BrowserWindow } = require("electron");
const path = require("path");

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

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        icon: path.join(__dirname, "..", "public", "ims.png"),
        webPreferences: {
            // preload: path.join(__dirname, "preload.js"),
            contextIsolation: false,
            nodeIntegration: true,
            webSecurity: false,
        },
    });
    const isDev = !app.isPackaged;
    // if (isDev) {
        win.loadURL("http://localhost:3000");
    // } else {
    //     win.loadURL("https://ims1.wehear.in/");
    // }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
