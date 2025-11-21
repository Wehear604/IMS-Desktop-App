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
    Snackbar
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

    // --- IPC Listeners Setup ---
    useEffect(() => {
        if (!electronAPI) {
            setError("Electron API not loaded. Check preload.js configuration.");
            return;
        }

        // 1. Listen for discovered devices
        const cleanupDeviceListener = electronAPI.onBleDevice((device) => {
            setDiscoveredDevices(prevDevices => {
                if (!prevDevices.some(d => d.id === device.id)) {
                    setStatusMessage(`Scan active. ${prevDevices.length + 1} devices found.`);
                    return [...prevDevices, device];
                }
                return prevDevices;
            });
        });

        // 2. Listen for successful connection
        const cleanupConnectedListener = electronAPI.onBleConnected((dev) => {
            setModalOpen(false);
            setConnected(dev);
            setLoading(false);
            setError(null);
            setConnectingId(null);
            setScanStarted(false);
            setStatusMessage(`Successfully connected to ${dev.name}.`);
            setDiscoveredDevices([]);
            setSnackbarOpen(true);
        });

        // 3. Listen for errors
        const cleanupErrorListener = electronAPI.onBleError((msg) => {
            console.error("BLE Error:", msg);
            setError(msg);
            setLoading(false);
            setConnected(null);
            setConnectingId(null);
            setModalOpen(false);
            setScanStarted(false);
        });

        // 4. Listen for status changes
        const cleanupStatusListener = electronAPI.onBleStatus((msg) => {
            setStatusMessage(msg);
            if (msg.includes("Scanning") || msg.includes("Attempting to connect")) {
                setLoading(true);
            } else if (msg.includes("ready") || msg.includes("disconnected") || msg.includes("timeout") || msg.includes("stopped")) {
                setLoading(false);
            }
        });

        return () => {
            cleanupDeviceListener();
            cleanupConnectedListener();
            cleanupErrorListener();
            cleanupStatusListener();
        };
    }, []);

    // --- IPC Action Handlers ---

    const handleStartScan = () => {
        if (!electronAPI || (loading && !connected)) {
            console.warn("Scan in progress or Electron API not available.");
            return;
        }

        setError(null);
        setConnected(null);
        setDiscoveredDevices([]); // Clear previous list
        setLoading(true);
        setScanStarted(true);
        setModalOpen(true); // OPEN THE MODAL
        setStatusMessage("Initializing Bluetooth and starting scan...");

        // Start the scan via IPC
        electronAPI.startBleScan();
    };

    const handleConnectDevice = (id) => {
        if (!electronAPI || connected || connectingId) return;

        // Stop the scan before connecting
        electronAPI.stopBleScan();
        setScanStarted(false);

        setConnectingId(id);
        setLoading(true);
        const deviceToConnect = discoveredDevices.find(d => d.id === id);
        setStatusMessage(`Attempting to connect to ${deviceToConnect.name}...`);

        // IPC call to initiate manual connection
        electronAPI.connectDevice(id);
    }

    // 🔥 FIX: Immediately restart the scan after a manual disconnect
    const handleDisconnect = () => {
        const wasConnected = connected;
        const connectedId = connected?.id;

        // 1. Send disconnect signal if connected or stop scan if scanning
        if (wasConnected) {
            electronAPI.disconnectDevice(connectedId);
        } else if (scanStarted) {
            electronAPI.stopBleScan();
        }

        // 2. Reset UI state completely
        setConnected(null);
        setError(null);
        setDiscoveredDevices([]);
        setLoading(false);
        setScanStarted(false);
        setConnectingId(null);
        setModalOpen(false);
        setStatusMessage("Device disconnected. Starting new scan...");

        // 3. Restart the scan process (No need for delay now that ble.js handles state cleanup immediately)
        handleStartScan(); // <<< REMOVE setTimeout
    };

    const handleCloseModal = () => {
        if (scanStarted) {
            // Stop scan when the modal is manually closed
            electronAPI.stopBleScan();
            setScanStarted(false);
        }
        setDiscoveredDevices([]);
        setLoading(false);
        setModalOpen(false);
        setStatusMessage("Scan stopped. Ready to scan.");
    }

    // --- Render Logic ---

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
    }

    return (
        <Box sx={{ padding: 3, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                BLE Device QC Connection
            </Typography>

            {/* Display Error/Status Alert */}
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                    Error: {error}
                </Alert>
            )}

            {/* Main Action Button */}
            <Button
                onClick={connected ? handleDisconnect : handleStartScan}
                variant="contained"
                color={connected ? "error" : "primary"}
                startIcon={connected ? null : <SearchIcon />}
                sx={{ mt: 3, mb: 3, borderRadius: 5, padding: '10px 30px' }}
                disabled={loading && !connected}
            >
                {connected ? "Disconnect & Restart Scan" : "Start BLE Scan"}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Status: **{statusMessage}**
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