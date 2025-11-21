const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // BLE EVENTS

    onBleDevice: (callback) => {
        const listener = (_event, data) => callback(data);
        ipcRenderer.on("ble-device", listener);

        // return cleanup function
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

    // ACTIONS
    disconnectDevice: (id) => ipcRenderer.send("ble-disconnect", id),
    // Removed the manual connect/rescan request here as the logic is now fully automated in ble.js
});