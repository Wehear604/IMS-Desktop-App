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
    // Changed dependency array to [] to ensure listeners are registered only once on mount.
    useEffect(() => {
        if (!electronAPI) {
            setError("Electron API not loaded. Check preload.js configuration.");
            setLoading(false);
            return;
        }

        // 1. Listen for discovered devices
        const cleanupDeviceListener = electronAPI.onBleDevice((device) => {
            console.log("Device discovered:", device);

            // The main process (ble.js) handles the auto-connection immediately upon discovery.
            // This UI logic just confirms we found something and updates the status.
            setDiscoveredDeviceId(device.id); // Always update the discovered ID

            // Only update status if not already connected
            setConnected(currentConnected => {
                if (!currentConnected) {
                    // The status will change to "Attempting to connect..." via the onBleStatus listener shortly
                    setStatusMessage(`Device found: ${device.name}. Waiting for connection...`);
                    setLoading(true);
                }
                return currentConnected;
            });
            setLoading(false); // Stop general scanning loader once first device is found
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
            setError(msg);
            setLoading(false);
            setConnected(null);
            setDiscoveredDeviceId(null); // Reset discovery state
            // Status message will be updated via onBleStatus if scan resumes
        });

        // 4. Listen for status changes (from ble.js stateChange/disconnect/timeout)
        const cleanupStatusListener = electronAPI.onBleStatus((msg) => {
            setStatusMessage(msg);
            // We only show the initial loader if the status implies active scanning/connecting
            if (msg.includes("Scanning") || msg.includes("Attempting to connect")) {
                setLoading(true);
            } else if (msg.includes("ready") || msg.includes("disconnected") || msg.includes("timeout")) {
                setLoading(false);
            }
        });

        // Initial setup for the loading state while waiting for the first status
        setLoading(true);

        return () => {
            // Cleanup listeners on component unmount
            cleanupDeviceListener();
            cleanupConnectedListener();
            cleanupErrorListener();
            cleanupStatusListener();
        };
    }, []); // <-- FIX: Empty dependency array ensures listeners are registered only once.

    const handleDisconnect = () => {
        if (connected) {
            // Send IPC message to main process to disconnect
            electronAPI.disconnectDevice(connected.id);
            // Optimistically update UI
            setConnected(null);
            setError(null);
            setStatusMessage("Manual disconnect. Scanning will resume...");
            setDiscoveredDeviceId(null);
            setLoading(true);
        } else {
            // If disconnected, just reload/reset UI, which triggers a fresh scan via main.js
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
            {!loading && !connected && !error && !statusMessage.includes("connected") && (
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography>Current Status: {statusMessage}</Typography>
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