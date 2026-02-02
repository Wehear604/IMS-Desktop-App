// const { app, BrowserWindow, dialog } = require("electron");
// const path = require("path");

// // FORCE RELOAD: This prevents caching of the HTML file
// app.commandLine.appendSwitch("disable-http-cache");

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   // 1. Get the ABSOLUTE path to your local index.html
//   // __dirname = The folder where main.js lives right now
//   const localFile = path.join(__dirname, "index.html");

//   console.log("--------------------------------------------------");
//   console.log(" TARGET FILE: " + localFile);
//   console.log("--------------------------------------------------");

//   // 2. Load it explicitly
//   win.loadFile(localFile);

//   // 3. Open DevTools immediately so you can verify the path
//   win.webContents.openDevTools();
// }

// app.whenReady().then(createWindow);
