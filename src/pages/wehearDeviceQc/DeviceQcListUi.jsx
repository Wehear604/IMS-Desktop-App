/**
 * DeviceQcListUi.jsx
 *
 * Full React component implementing:
 *  - BLE scan/connect UI
 *  - Device type selection
 *  - Live volume updates via notifications
 *  - One-shot readVolumeNow({ id }) request + response handling
 *
 * Reference screenshot (local path): /mnt/data/57ad90bf-6615-4b26-a367-46d6da6ad674.png
 */

import React, { useEffect, useState } from "react";
import {
    Button,
    Typography,
    CircularProgress,
    Alert,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Modal,
    IconButton,
    Snackbar,
    TextField,
    FormControl,
    FormHelperText
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

const { electronAPI } = window;

// Modal style
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default function DeviceQcListUi() {
    const [connected, setConnected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Click 'Start BLE Scan' to begin.");
    const [error, setError] = useState(null);
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [connectingId, setConnectingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [scanStarted, setScanStarted] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Device type
    const [deviceType, setDeviceType] = useState(1);
    const [deviceTypeError, setDeviceTypeError] = useState("");
    const allowedTypes = [1, 6, 8, 9, 11, 12, 13];

    // Volume states
    const [volume, setVolume] = useState(null);

    // --- IPC Listeners Setup ---
    useEffect(() => {
        if (!electronAPI) {
            setError("Electron API not loaded. Check preload.js configuration.");
            return;
        }

        const cleanups = [];

        // discovered devices
        cleanups.push(electronAPI.onBleDevice((device) => {
            setDiscoveredDevices(prevDevices => {
                if (!prevDevices.some(d => d.id === device.id)) {
                    setStatusMessage(`Scan active. ${prevDevices.length + 1} devices found.`);
                    return [...prevDevices, device];
                }
                return prevDevices;
            });
        }));

        // connected
        cleanups.push(electronAPI.onBleConnected((dev) => {
            setModalOpen(false);
            setConnected(dev);
            setLoading(false);
            setError(null);
            setConnectingId(null);
            setScanStarted(false);
            setStatusMessage(`Successfully connected to ${dev.name}.`);
            setDiscoveredDevices([]);
            setSnackbarOpen(true);
            setVolume(null);
        }));

        // errors
        cleanups.push(electronAPI.onBleError((msg) => {
            console.error("BLE Error:", msg);
            setError(msg);
            setLoading(false);
            setConnectingId(null);
            setModalOpen(false);
            setScanStarted(false);
        }));

        // status
        cleanups.push(electronAPI.onBleStatus((msg) => {
            setStatusMessage(msg);
            if (msg.includes("Scanning") || msg.includes("Attempting to connect")) {
                setLoading(true);
            } else if (msg.toLowerCase().includes("ready") ||
                msg.toLowerCase().includes("disconnected") ||
                msg.toLowerCase().includes("timeout") ||
                msg.toLowerCase().includes("stopped")) {
                setLoading(false);
            }
        }));

        // push volume updates from notifications
        cleanups.push(electronAPI.onVolumeUpdated((d) => {
            // d: { id, volume }
            if (connected && d.id === connected.id) {
                setVolume(d.volume);
                setStatusMessage(`Volume updated: ${d.volume}`);
            }
        }));

        // read-volume (existing API)
        cleanups.push(electronAPI.onReadVolumeResponse((resp) => {
            if (!connected || resp.id !== connected.id) return;
            try {
                const hex = String(resp.hex || "");
                const bytes = hex.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || [];
                if (bytes.length === 1 && bytes[0] >= 0 && bytes[0] <= 100) {
                    setVolume(bytes[0]);
                    setStatusMessage(`Volume read: ${bytes[0]}`);
                } else if (bytes.length >= 2 && bytes[1] >= 0 && bytes[1] <= 255) {
                    setVolume(bytes[1]);
                    setStatusMessage(`Volume read: ${bytes[1]}`);
                } else {
                    setStatusMessage(`Read char ${resp.uuid}: ${resp.hex}`);
                }
            } catch (e) {
                console.error("Failed to parse read volume response:", e);
            }
        }));

        // cleanup on unmount
        return () => {
            cleanups.forEach(fn => { try { fn(); } catch (e) { } });
        };
    }, [connected]);

    // --- Helpers ---
    const validateDeviceType = (value) => {
        const num = Number(value);
        if (!allowedTypes.includes(num)) {
            setDeviceTypeError(`Device type must be one of: ${allowedTypes.join(", ")}`);
            return false;
        }
        setDeviceTypeError("");
        return true;
    };

    // --- Actions ---
    const handleStartScan = () => {
        if (!electronAPI || (loading && !connected)) {
            console.warn("Scan in progress or Electron API not available.");
            return;
        }
        const num = Number(deviceType);
        if (!validateDeviceType(num)) return;

        setError(null);
        setConnected(null);
        setDiscoveredDevices([]);
        setLoading(true);
        setScanStarted(true);
        setModalOpen(true);
        setStatusMessage("Initializing Bluetooth and starting scan...");

        electronAPI.startBleScan(num);
    };

    const handleConnectDevice = (id) => {
        if (!electronAPI || connected || connectingId) return;
        const num = Number(deviceType);
        if (!validateDeviceType(num)) return;

        electronAPI.stopBleScan();
        setScanStarted(false);

        setConnectingId(id);
        setLoading(true);
        const deviceToConnect = discoveredDevices.find(d => d.id === id);
        setStatusMessage(`Attempting to connect to ${deviceToConnect?.name || id}...`);
        electronAPI.connectDevice({ id, type: num });
    };

    const handleDisconnect = () => {
        const wasConnected = connected;
        const connectedId = connected?.id;

        if (wasConnected) {
            electronAPI.disconnectDevice(connectedId);
        } else if (scanStarted) {
            electronAPI.stopBleScan();
        }

        setConnected(null);
        setError(null);
        setDiscoveredDevices([]);
        setLoading(false);
        setScanStarted(false);
        setConnectingId(null);
        setModalOpen(false);
        setVolume(null);
        setStatusMessage("Device disconnected. Starting new scan...");

        // restart scan
        handleStartScan();
    };

    const handleCloseModal = () => {
        if (scanStarted) {
            electronAPI.stopBleScan();
            setScanStarted(false);
        }
        setDiscoveredDevices([]);
        setLoading(false);
        setModalOpen(false);
        setStatusMessage("Scan stopped. Ready to scan.");
    };

    // --- One-shot readVolumeNow implementation (uses new IPC) ---
    // This function sends the request and registers a one-time listener that auto-cleans.
    const handleReadVolumeNow = () => {
        if (!connected) {
            setError("No device connected");
            return;
        }
        setStatusMessage("Reading volume (one-shot)...");
        // send request
        electronAPI.readVolumeNow({ id: connected.id });

        // register listener that will cleanup after first call
        const remove = electronAPI.onReadVolumeNowResponse((resp) => {
            try {
                if (resp.error) {
                    console.error("Read-now error:", resp.error);
                    setStatusMessage(`Read error: ${resp.error}`);
                    remove(); // cleanup
                    return;
                }

                // resp: { id, uuid, hex }
                console.log("Read-now result:", resp);
                const hexStr = String(resp.hex || "");
                const bytes = hexStr.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || [];

                console.log("bytes:", bytes);

                if (bytes.length === 1 && bytes[0] >= 0 && bytes[0] <= 100) {
                    setVolume(bytes[0]);
                    setStatusMessage(`Volume read: ${bytes[0]}`);
                } else if (bytes.length >= 2 && typeof bytes[1] === 'number') {
                    setVolume(bytes[1]);
                    setStatusMessage(`Volume read: ${bytes[1]}`);
                } else {
                    setStatusMessage(`Read char ${resp.uuid}: ${resp.hex}`);
                }
            } catch (e) {
                console.error("Error handling read-now response:", e);
                setStatusMessage("Failed to parse read-now response.");
            } finally {
                // ALWAYS remove the listener to avoid leaking handlers
                remove();
            }
        });
    };

    // --- Render helpers ---
    const renderDeviceList = () => {
        if (discoveredDevices.length > 0) {
            return (
                <List dense>
                    {discoveredDevices.map((device, index) => (
                        <React.Fragment key={device.id}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={connectingId === device.id ? <CircularProgress size={16} color="inherit" /> : <BluetoothConnectedIcon />}
                                        onClick={() => handleConnectDevice(device.id)}
                                        disabled={connectingId !== null}
                                    >
                                        {connectingId === device.id ? 'Connecting' : 'Connect'}
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={device.name || `Unnamed Device (${device.id.substring(0, 8)}...)`}
                                    secondary={`ID: ${device.id.substring(0, 10)}... | RSSI: ${device.rssi}`}
                                />
                            </ListItem>
                            {index < discoveredDevices.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            );
        }

        if (loading && discoveredDevices.length === 0) {
            return (
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {statusMessage}
                    </Typography>
                </Box>
            );
        }

        if (scanStarted && !loading && discoveredDevices.length === 0) {
            return (
                <Alert severity="warning" sx={{ mt: 3 }}>
                    No target devices found. Check if Bluetooth is enabled and the device is advertising.
                </Alert>
            );
        }

        return null;
    };

    // --- JSX ---
    return (
        <Box sx={{ padding: 3, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                BLE Device QC Connection
            </Typography>

            {/* Device Type Input */}
            <FormControl sx={{ mt: 2, mb: 1, width: '100%' }} error={Boolean(deviceTypeError)}>
                <TextField
                    label="Device Type"
                    type="number"
                    value={deviceType}
                    onChange={(e) => {
                        const value = e.target.value;
                        setDeviceType(value);
                        if (value !== "") validateDeviceType(value);
                    }}
                    helperText={deviceTypeError || `Allowed: ${allowedTypes.join(", ")}`}
                    size="small"
                />
                {deviceTypeError && (
                    <FormHelperText>{deviceTypeError}</FormHelperText>
                )}
            </FormControl>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                    Error: {error}
                </Alert>
            )}

            {/* Main Action Button */}
            <Button
                onClick={connected ? handleDisconnect : handleStartScan}
                variant="contained"
                color={connected ? "error" : "primary"}
                startIcon={connected ? null : <SearchIcon />}
                sx={{ mt: 2, mb: 3, borderRadius: 5, padding: '10px 30px' }}
                disabled={loading && !connected}
            >
                {connected ? "Disconnect & Restart Scan" : "Start BLE Scan"}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Status: <b>{statusMessage}</b>
            </Typography>

            {/* Connected UI */}
            {connected && (
                <Box sx={{ mt: 2, p: 3, border: '1px solid #4caf50', borderRadius: 2, backgroundColor: '#e8f5e9' }}>
                    <Typography variant="h5" sx={{ color: "green", mb: 2 }} component="div">
                        <CheckCircleOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Connected Successfully!
                    </Typography>
                    <Typography variant="body1" align="left"><b>Device Name:</b> {connected.name}</Typography>
                    <Typography variant="body1" align="left"><b>MAC Address:</b> {connected.mac}</Typography>
                    <Typography variant="body1" align="left"><b>Device ID:</b> {connected.id}</Typography>
                    <Typography variant="body1" align="left"><b>Device Type:</b> {deviceType}</Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button variant="outlined" onClick={handleReadVolumeNow} disabled={loading}>
                            Read Volume Now
                        </Button>
                        <Button variant="outlined" onClick={() => electronAPI.readVolume({ id: connected.id })} disabled={loading}>
                            Read (existing)
                        </Button>
                    </Box>

                    {volume !== null && (
                        <Typography variant="body1" sx={{ mt: 2 }}><b>Volume:</b> {volume}</Typography>
                    )}
                </Box>
            )}

            {/* Scan/Discovery Modal */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="scan-modal-title"
                aria-describedby="scan-modal-description"
            >
                <Box sx={modalStyle}>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography id="scan-modal-title" variant="h6" component="h2" gutterBottom>
                        Scanning for BLE Devices
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography id="scan-modal-description" sx={{ mt: 1, mb: 2 }} color="text.secondary">
                        {statusMessage}
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {renderDeviceList()}
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                    {loading && discoveredDevices.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            *Keep the modal open to continue scanning for new devices.
                        </Typography>
                    )}
                    {!loading && discoveredDevices.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            *Scan finished. Select a device to connect.
                        </Typography>
                    )}
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message="Device Connected!"
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbarOpen(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
}
