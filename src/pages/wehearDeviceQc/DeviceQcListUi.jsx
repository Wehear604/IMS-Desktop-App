// 🔥 ALL IMPORTS AT TOP
import React, { useEffect, useState } from "react";
import { Button, Typography, CircularProgress, Alert, Box } from "@mui/material";

// IMPORTANT: Do NOT use window.require('electron'). Use the global API exposed by preload.js
const { electronAPI } = window;

export default function DeviceQcListUi() {
    const [connected, setConnected] = useState(null); // Stores device info on success
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState("Initializing Bluetooth...");
    const [error, setError] = useState(null);
    const [discoveredDeviceId, setDiscoveredDeviceId] = useState(null); // The ID of the first device found

    // --- IPC Listeners and Auto-Connect Logic ---
    useEffect(() => {
        if (!electronAPI) {
            setError("Electron API not loaded. Check preload.js configuration.");
            setLoading(false);
            return;
        }

        // 1. Listen for discovered devices
        const cleanupDeviceListener = electronAPI.onBleDevice((device) => {
            console.log("Device discovered:", device);
            // This is the "Auto-Connect" logic: connect to the first device found
            if (!connected && !discoveredDeviceId) {
                setDiscoveredDeviceId(device.id);
                setStatusMessage(`Device found: ${device.name}. Attempting to connect...`);
                setLoading(true);
                // Trigger the connection via IPC
                electronAPI.connectDevice(device.id);
            } else {
                setLoading(false); // Stop general scanning loader once first device is found
            }
        });

        // 2. Listen for successful connection
        const cleanupConnectedListener = electronAPI.onBleConnected((dev) => {
            console.log("Connected:", dev);
            setConnected(dev);
            setLoading(false);
            setError(null);
            setStatusMessage(`Successfully connected to ${dev.name}.`);
        });

        // 3. Listen for errors
        const cleanupErrorListener = electronAPI.onBleError((msg) => {
            console.error("BLE Error:", msg);
            // Replaced alert(msg) with proper MUI Alert
            setError(msg);
            setLoading(false);
            setStatusMessage("Connection failed. Check logs for details.");
            setConnected(null);
            setDiscoveredDeviceId(null); // Reset discovery state
        });

        // 4. Listen for status changes (from ble.js stateChange/disconnect)
        const cleanupStatusListener = electronAPI.onBleStatus((msg) => {
            setStatusMessage(msg);
        });

        return () => {
            // Cleanup listeners on component unmount
            cleanupDeviceListener();
            cleanupConnectedListener();
            cleanupErrorListener();
            cleanupStatusListener();
            // Note: Noble scanning continues in main process unless explicitly stopped
        };
    }, [connected, discoveredDeviceId]);

    const handleDisconnect = () => {
        if (connected) {
            // Send IPC message to main process to disconnect
            electronAPI.disconnectDevice(connected.id);
            setConnected(null);
            setError(null);
            setStatusMessage("Manual disconnect. Scanning will resume.");
            setDiscoveredDeviceId(null);
            setLoading(true); // Show loader for a moment while scan resumes
        } else {
            // For disconnected state, just reload/reset UI if needed, or trigger rescan
            window.location.reload();
        }
    };

    return (
        <Box sx={{ padding: 3, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                BLE Device QC Auto Connect
            </Typography>

            {/* Display Error/Status Alert */}
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                    Error: {error}
                </Alert>
            )}

            {/* Loading / Scanning UI */}
            {loading && !connected && (
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {statusMessage}
                    </Typography>
                </Box>
            )}

            {/* Connected UI */}
            {connected && (
                <Box sx={{ mt: 4, p: 3, border: '1px solid #4caf50', borderRadius: 2, backgroundColor: '#e8f5e9' }}>
                    <Typography variant="h5" sx={{ color: "green", mb: 2 }}>Connected Successfully!</Typography>
                    <Typography variant="body1" align="left"><b>Device Name:</b> {connected.name}</Typography>
                    <Typography variant="body1" align="left"><b>MAC Address:</b> {connected.mac}</Typography>
                    <Typography variant="body1" align="left"><b>Device ID:</b> {connected.id}</Typography>

                    <Button
                        onClick={handleDisconnect}
                        variant="contained"
                        color="error"
                        sx={{ mt: 3, borderRadius: 5, padding: '10px 30px' }}
                    >
                        Disconnect & Rescan
                    </Button>
                </Box>
            )}

            {/* Fallback/Idle UI (e.g., if scanning finished and nothing found) */}
            {!loading && !connected && !error && (
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography>Scan finished or failed to auto-connect. Status: {statusMessage}</Typography>
                    <Button
                        onClick={() => window.location.reload()}
                        sx={{ mt: 1 }}
                        size="small"
                    >
                        Click to Initiate New Scan
                    </Button>
                </Alert>
            )}
        </Box>
    );
}