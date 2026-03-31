const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  getVolume: () => ipcRenderer.invoke("get-system-volume"),
  getVersion: () => ipcRenderer.invoke("app-version"),

  // Custom Updater Methods
  downloadAndInstallUpdate: (url) => ipcRenderer.send("download-and-install-update", url),
  onUpdateProgress: (callback) => ipcRenderer.on("update-download-progress", (_event, msg) => callback(msg)),

  // --- Send to Main ---
  selectBluetoothDevice: (deviceId) =>
    ipcRenderer.send("bluetooth-device-selected", deviceId),
  cancelBluetoothRequest: () => ipcRenderer.send("cancel-bluetooth-request"),
  bluetoothPairingResponse: (response) =>
    ipcRenderer.send("bluetooth-pairing-response"),


  // --- NEW: Window Controls ---
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  closeWindow: () => ipcRenderer.send("close-window"), // <-- The missing function

  // --- Receive from Main ---
  onBluetoothDeviceList: (callback) => {
    ipcRenderer.on("bluetooth-device-list", (_event, deviceList) => {
      callback(deviceList);
    });
  },
  onBluetoothPairingRequest: (callback) => {
    ipcRenderer.on("bluetooth-pairing-request", (_event, details) => {
      callback(details);
    });
  },
});
