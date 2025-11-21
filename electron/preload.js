const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // BLE EVENTS (Listeners)
    onBleDevice: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on("ble-device", listener);
        return () => ipcRenderer.removeListener("ble-device", listener);
    },
    onBleConnected: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on("ble-connected", listener);
        return () => ipcRenderer.removeListener("ble-connected", listener);
    },
    onBleError: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on("ble-error", listener);
        return () => ipcRenderer.removeListener("ble-error", listener);
    },
    onBleStatus: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on("ble-status", listener);
        return () => ipcRenderer.removeListener("ble-status", listener);
    },

    // ACTIONS (Senders)
    disconnectDevice: (id) => ipcRenderer.send("ble-disconnect", id),
    startBleScan: () => ipcRenderer.send("ble-scan-start"),
    stopBleScan: () => ipcRenderer.send("ble-scan-stop"),
    connectDevice: (id) => ipcRenderer.send("ble-connect-manual", id),
});