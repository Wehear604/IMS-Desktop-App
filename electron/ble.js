const noble = require("@abandonware/noble");
const { BrowserWindow, ipcMain } = require("electron");

function send(channel, data) {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, data));
}

let discovered = {};
let isScanning = false;
let isConnected = false;

const CONNECT_TIMEOUT_MS = 10000; // 10 seconds timeout for connecting

// Function to start scanning and send status
function startBleScan() {
    if (noble.state !== "poweredOn") {
        send("ble-status", `Bluetooth state: ${noble.state}`);
        return;
    }
    // Only start if not already scanning and not already connected
    if (isScanning || isConnected) return;

    console.log("Starting BLE Scan...");
    // Clear previous discovery list for a fresh scan
    discovered = {};

    noble.startScanning([], true);
    isScanning = true;
    send("ble-status", "Scanning for target devices...");
}

// Function to stop scanning (exposed to renderer)
function stopBleScan() {
    if (isScanning) {
        noble.stopScanning();
        isScanning = false;
        send("ble-status", "Scan stopped by user.");
        console.log("BLE Scan stopped.");
    }
}

// --- NOBLE EVENT LISTENERS ---

// Listen for state changes (DOES NOT auto-start scan here)
noble.on("stateChange", (state) => {
    console.log("Noble state change:", state);
    if (state === "poweredOn") {
        send("ble-status", "Bluetooth adapter ready. Click 'Start Scan' to begin.");
    } else {
        isScanning = false;
        isConnected = false;
        if (noble.state === "scanning") {
            noble.stopScanning();
        }
        send("ble-status", `Bluetooth state: ${state}`);
    }
});

// Listener for disconnection events
noble.on("disconnect", (peripheralId) => {
    console.log(`Device disconnected: ${peripheralId}`);

    // Check if we need to reset the connection state, as the manual handler might have done it
    if (isConnected) { // Check if we *thought* we were connected
        isConnected = false; // CLEAR GLOBAL STATE
        send("ble-status", `Device disconnected. Ready to scan again.`);
    }

    // FIX: Remove the peripheral object from the discovered map to force cleanup on next scan
    if (discovered[peripheralId]) {
        delete discovered[peripheralId];
    }
});


// DISCOVER: Only filtering and reporting devices to the UI (NO AUTO-CONNECT)
noble.on("discover", (p) => {
    const adv = p.advertisement;

    // 1. Manufacturer Data Filter
    const mfg = adv.manufacturerData;
    if (!mfg || mfg.length < 2) return;

    const companyId = mfg.readUInt16LE(0);
    if (companyId !== 0x0362) return;

    const name = adv.localName || "QC Device";

    // Only process if not already connected/connecting
    if (isConnected || p.connecting) return;

    // Store the peripheral object
    discovered[p.id] = p;

    // Send device to UI
    send("ble-device", {
        id: p.id,
        mac: p.address,
        name,
        rssi: p.rssi
    });
});

// --- IPC HANDLERS ---

// Handler for manual start scan request from Renderer
ipcMain.on("ble-scan-start", () => {
    startBleScan();
});

// Handler for manual stop scan request from Renderer
ipcMain.on("ble-scan-stop", () => {
    stopBleScan();
});

// Handler for manual disconnect request from Renderer
ipcMain.on("ble-disconnect", (event, id) => {
    const p = discovered[id];
    if (p && p.state === 'connected') {
        console.log(`Manual disconnect request for ${p.id}`);
        // IMMEDIATELY reset isConnected before noble.disconnect()
        isConnected = false; // <<< ADD THIS LINE

        p.disconnect((err) => {
            if (err) console.error("Noble manual disconnect error:", err);
            // noble.on("disconnect") will still fire later, but this ensures a quick state reset for new scans.
        });
    } else {
        console.log("Manual disconnect request, but device was not connected. Clearing internal state.");
        isConnected = false; // This is already present and correct for cleanup
        // Optional: Ensure scanning is also stopped if it was scanning instead of connected, though UI logic handles this too.
        if (isScanning) noble.stopScanning();
        isScanning = false;
        send("ble-status", "Ready to scan.");
    }
});
// Handler for manual connect request from Renderer
ipcMain.on("ble-connect-manual", (event, id) => {
    const p = discovered[id];
    if (!p || isConnected || p.connecting) {
        console.error(`Attempted to connect to invalid/busy device ID: ${id}`);
        // If already connected, send a status update to clear any loading spinners
        if (isConnected) send("ble-status", "Already connected to a device.");
        return;
    }

    const deviceName = p.advertisement.localName || "QC Device";
    console.log("Manual connecting to:", deviceName);

    noble.stopScanning();
    isScanning = false;

    p.connecting = true;
    send("ble-status", `Attempting to connect to ${deviceName}...`);

    // Set up a connection timeout
    const connectTimeout = setTimeout(() => {
        if (p.connecting) {
            p.connecting = false;
            console.error(`Connection to ${deviceName} timed out.`);
            send("ble-error", `Connection to ${deviceName} timed out.`);
            p.disconnect(() => { });
        }
    }, CONNECT_TIMEOUT_MS);

    p.connect((err) => {
        clearTimeout(connectTimeout);
        p.connecting = false;

        if (err) {
            console.error("Connection error:", err.message);
            send("ble-error", err.message);
            return;
        }

        isConnected = true;
        send("ble-connected", {
            id: p.id,
            mac: p.address,
            name: deviceName
        });
        console.log(`Successfully connected to ${deviceName}`);
    });
});

// Export is still required by main.js, although its methods are now internal
module.exports = {}