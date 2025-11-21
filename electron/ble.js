const noble = require("@abandonware/noble");
const { BrowserWindow, ipcMain } = require("electron");
function send(channel, data) {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, data));
}

let discovered = {};
let isScanning = false;
let isConnected = false; // Track connection status globally in main process

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
    noble.startScanning([], true);
    isScanning = true;
    send("ble-status", "Scanning for target devices...");
}

// Listen for state changes to start scanning
noble.on("stateChange", (state) => {
    console.log("Noble state change:", state);
    if (state === "poweredOn") {
        send("ble-status", "Bluetooth adapter ready. Starting scan...");
        startBleScan();
    } else {
        isScanning = false;
        isConnected = false;
        // Also stop scanning if the state changes away from 'poweredOn'
        if (noble.state === "scanning") {
            noble.stopScanning();
        }
        send("ble-status", `Bluetooth state: ${state}`);
    }
});

// Listener for disconnection events
noble.on("disconnect", (peripheralId) => {
    console.log(`Device disconnected: ${peripheralId}`);
    isConnected = false;

    // Clear connecting/connected state on peripheral object if it exists
    if (discovered[peripheralId]) {
        discovered[peripheralId].connecting = false;
        discovered[peripheralId].connected = false;
    }

    send("ble-status", `Device disconnected. Resuming scan.`);
    startBleScan(); // Always resume scanning after disconnection
});


// 🔥🔥 AUTO CONNECT LOGIC HERE 🔥🔥
noble.on("discover", (p) => {
    const adv = p.advertisement;

    // 1. Manufacturer Data Filter
    const mfg = adv.manufacturerData;
    if (!mfg || mfg.length < 2) return;

    const companyId = mfg.readUInt16LE(0);
    if (companyId !== 0x0362) return;  // Filter: only process company ID 0x0362

    const name = adv.localName || "QC Device";

    // IMPORTANT: Check global isConnected state and local connecting flag
    if (isConnected || p.connecting) return;

    discovered[p.id] = p;

    // Send device to UI (to show "Device Found")
    send("ble-device", {
        id: p.id,
        mac: p.address,
        name,
        rssi: p.rssi
    });

    // 2. Auto Connect
    if (!p.connected) {
        console.log("Auto connecting to:", name);
        noble.stopScanning(); // Stop scanning immediately before connecting
        isScanning = false;

        p.connecting = true; // Mark as connecting
        send("ble-status", `Attempting to connect to ${name}...`);

        // Set up a connection timeout
        const connectTimeout = setTimeout(() => {
            if (p.connecting) {
                p.connecting = false;
                console.error(`Connection to ${name} timed out.`);
                send("ble-error", `Connection to ${name} timed out.`);
                p.disconnect(() => { // Attempt a clean disconnect if possible
                    startBleScan();
                });
            }
        }, CONNECT_TIMEOUT_MS);

        p.connect((err) => {
            clearTimeout(connectTimeout); // Clear the timeout handler
            p.connecting = false; // Clear connecting flag regardless of outcome

            if (err) {
                console.error("Connection error:", err.message);
                send("ble-error", err.message);
                startBleScan(); // Resume scanning after error
                return;
            }

            isConnected = true; // Set global connection status
            send("ble-connected", {
                id: p.id,
                mac: p.address,
                name: name
            });
            console.log(`Successfully connected to ${name}`);
        });
    }
});

// Handler for disconnect request from Renderer
ipcMain.on("ble-disconnect", (event, id) => {
    const p = discovered[id];
    if (p && p.state === 'connected') {
        console.log(`Manual disconnect request for ${p.id}`);
        p.disconnect((err) => {
            if (err) console.error("Noble manual disconnect error:", err);
            // noble.on("disconnect") will handle the UI status and scan resume
        });
    } else {
        console.log("Manual disconnect request, but device was not connected. Resuming scan.");
        isConnected = false; // Ensure global state is clear
        startBleScan(); // Just make sure we are scanning
    }
});

module.exports = {
    startBleScan // Export for use in main.js
}