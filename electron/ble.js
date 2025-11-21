const noble = require("@abandonware/noble");
const { ipcMain, BrowserWindow } = require("electron");

function send(channel, data) {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, data));
}

let discovered = {};
let isScanning = false;
let isConnected = false; // Track connection status globally in main process

// Function to start scanning and send status
function startBleScan() {
    // Only start if noble is ready and not already scanning
    if (isScanning || noble.state !== "poweredOn" || isConnected) return;
    console.log("Starting BLE Scan...");
    noble.startScanning([], true);
    isScanning = true;
    send("ble-status", "Scanning for target devices...");
}

// Listen for state changes to start scanning
noble.on("stateChange", (state) => {
    if (state === "poweredOn") {
        send("ble-status", "Bluetooth adapter ready. Starting scan...");
        startBleScan();
    } else {
        isScanning = false;
        isConnected = false;
        send("ble-status", `Bluetooth state: ${state}`);
    }
});

// Listener for disconnection events
noble.on("disconnect", (id) => {
    console.log(`Device disconnected: ${id}`);
    isConnected = false;
    send("ble-status", `Device disconnected. Resuming scan.`);
    startBleScan(); // Always resume scanning after disconnection
});


// -------------------------------------------
// 🔥🔥 AUTO CONNECT LOGIC HERE 🔥🔥
// -------------------------------------------
noble.on("discover", (p) => {
    const adv = p.advertisement;

    // 1. Manufacturer Data Filter
    const mfg = adv.manufacturerData;
    if (!mfg || mfg.length < 2) return;

    const companyId = mfg.readUInt16LE(0);
    if (companyId !== 0x0362) return;  // Filter: only process company ID 0x0362

    const name = adv.localName || "QC Device";

    // Check if we are already connected or attempting to connect
    if (isConnected || p.connecting) return;

    // Store device for reference during disconnect
    discovered[p.id] = p;

    // 🔥 Send device to UI (to show "Device Found")
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

        p.connect((err) => {
            p.connecting = false; // Clear connecting flag regardless of outcome

            if (err) {
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
        });
    }
});

// Handler for disconnect request from Renderer
ipcMain.on("ble-disconnect", (event, id) => {
    const p = discovered[id];
    if (p && p.state === 'connected') {
        p.disconnect((err) => {
            if (err) console.error("Noble manual disconnect error:", err);
            // noble.on("disconnect") will handle the UI status and scan resume
        });
    } else {
        isConnected = false;
        startBleScan(); // If already disconnected, just make sure we are scanning
    }
});

// Manual connect request removed as connection is automatic.
// ipcMain.on("ble-connect", ... )