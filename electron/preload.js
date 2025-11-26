// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // ---- SCAN CONTROL ----
    startBleScan: (type) => ipcRenderer.send("ble-scan-start", type),
    stopBleScan: () => ipcRenderer.send("ble-scan-stop"),

    // ---- CONNECT / DISCONNECT ----
    connectDevice: (payload) => ipcRenderer.send("ble-connect-manual", payload),
    disconnectDevice: (id) => ipcRenderer.send("ble-disconnect", id),

    // ---- WRITE ----
    writeToDevice: (payload) => ipcRenderer.send("ble-write", payload),

    // ---- BASIC EVENT STREAM ----
    onBleDevice: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-device", listener);
        return () => ipcRenderer.removeListener("ble-device", listener);
    },
    onBleStatus: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-status", listener);
        return () => ipcRenderer.removeListener("ble-status", listener);
    },
    onBleError: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-error", listener);
        return () => ipcRenderer.removeListener("ble-error", listener);
    },
    onBleConnected: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-connected", listener);
        return () => ipcRenderer.removeListener("ble-connected", listener);
    },
    onBleData: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-data", listener);
        return () => ipcRenderer.removeListener("ble-data", listener);
    },
    onBleWriteReady: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-write-ready", listener);
        return () => ipcRenderer.removeListener("ble-write-ready", listener);
    },

    // ---- VOLUME READ ----
    readVolume: (payload) => ipcRenderer.send("ble-read-volume", payload),
    onReadVolumeResponse: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-read-volume-response", listener);
        return () => ipcRenderer.removeListener("ble-read-volume-response", listener);
    },
    onVolumeUpdated: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-volume-updated", listener);
        return () => ipcRenderer.removeListener("ble-volume-updated", listener);
    },

    // ---- NEW: One-shot readVolumeNow ----
    readVolumeNow: (payload) => ipcRenderer.send("ble-read-volume-now", payload),
    onReadVolumeNowResponse: (cb) => {
        const listener = (ev, d) => cb(d);
        ipcRenderer.on("ble-read-volume-now-response", listener);
        return () => ipcRenderer.removeListener("ble-read-volume-now-response", listener);
    },

    // -------------------------------------------
    // 🔥 NEW: DEVICE ACTIVITY CONSOLE INTEGRATION
    // -------------------------------------------

    // Live stream of activity logs (console-style)
    onBleActivity: (cb) => {
        const listener = (_ev, entry) => cb(entry);
        ipcRenderer.on("ble-activity", listener);
        return () => ipcRenderer.removeListener("ble-activity", listener);
    },

    // Fetch past activity history (IPC handle)
    getBleActivityHistory: (payload) => ipcRenderer.invoke("ble-activity-get", payload),
    getDebugDump: (payload) => ipcRenderer.invoke("ble-debug-dump", payload),

});
