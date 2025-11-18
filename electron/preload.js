const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendMessage: (msg) => ipcRenderer.send("message", msg),
});
