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
    width: 420,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
};

export default function DeviceQcListUi() {
    // BLE states (existing)
    const [connected, setConnected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Click 'Start BLE Scan' to begin.");
    const [error, setError] = useState(null);
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [connectingId, setConnectingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [scanStarted, setScanStarted] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Classic Bluetooth states (new)
    const [classicModalOpen, setClassicModalOpen] = useState(false);
    const [classicScanStarted, setClassicScanStarted] = useState(false);
    const [classicDevices, setClassicDevices] = useState([]);
    const [classicConnectingAddr, setClassicConnectingAddr] = useState(null);
    const [classicConnected, setClassicConnected] = useState(null);

    // --- IPC Listeners Setup ---
    useEffect(() => {
        if (!electronAPI) {
            setError("Electron API not loaded. Check preload.js configuration.");
            return;
        }

        // --- BLE listeners (as in your original setup) ---
        const cleanupDeviceListener = electronAPI.onBleDevice((device) => {
            setDiscoveredDevices(prevDevices => {
                if (!prevDevices.some(d => d.id === device.id)) {
                    setStatusMessage(`Scan active. ${prevDevices.length + 1} devices found.`);
                    return [...prevDevices, device];
                }
                return prevDevices;
            });
        });

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

        const cleanupErrorListener = electronAPI.onBleError((msg) => {
            console.error("BLE Error:", msg);
            setError(msg);
            setLoading(false);
            setConnected(null);
            setConnectingId(null);
            setModalOpen(false);
            setScanStarted(false);
        });

        const cleanupStatusListener = electronAPI.onBleStatus((msg) => {
            setStatusMessage(msg);
            if (msg.includes("Scanning") || msg.includes("Attempting to connect")) {
                setLoading(true);
            } else if (msg.includes("ready") || msg.includes("disconnected") || msg.includes("timeout") || msg.includes("stopped")) {
                setLoading(false);
            }
        });

        // --- Classic listeners (new) ---
        const cleanupClassicDevice = electronAPI.onClassicDevice((dev) => {
            setClassicDevices(prev => {
                if (!prev.some(d => d.address === dev.address)) {
                    return [...prev, dev];
                }
                return prev;
            });
        });

        const cleanupClassicConnected = electronAPI.onClassicConnected((dev) => {
            setClassicModalOpen(false);
            setClassicConnected(dev);
            setClassicConnectingAddr(null);
            setClassicScanStarted(false);
            setSnackbarOpen(true);
            setStatusMessage(`Classic connected to ${dev.name || dev.address}`);
        });

        const cleanupClassicError = electronAPI.onClassicError((msg) => {
            console.error("Classic BT Error:", msg);
            setError(msg);
            setClassicConnectingAddr(null);
            setClassicScanStarted(false);
            setClassicModalOpen(false);
        });

        // cleanup on unmount
        return () => {
            cleanupDeviceListener();
            cleanupConnectedListener();
            cleanupErrorListener();
            cleanupStatusListener();

            cleanupClassicDevice();
            cleanupClassicConnected();
            cleanupClassicError();
        };
    }, []);

    // --- IPC Action Handlers (BLE) ---

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
        setStatusMessage(`Attempting to connect to ${deviceToConnect?.name || id}...`);

        // IPC call to initiate manual connection
        electronAPI.connectDevice(id);
    }

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
        setStatusMessage("Device disconnected. Starting new scan...");

        // Restart new BLE scan
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
    }

    // --- Classic Bluetooth Handlers (new) ---

    const handleClassicScan = () => {
        if (!electronAPI) {
            setError("Electron API not available.");
            return;
        }
        setError(null);
        setClassicDevices([]);
        setClassicConnected(null);
        setClassicScanStarted(true);
        setClassicModalOpen(true);
        setStatusMessage("Starting Classic Bluetooth scan...");
        electronAPI.startClassicScan();
    }

    const handleClassicConnect = (address) => {
        if (!electronAPI || classicConnectingAddr) return;

        setClassicConnectingAddr(address);
        setStatusMessage(`Attempting to connect classic device ${address}...`);
        // Stop scanning (so other discovery events pause)
        electronAPI.stopClassicScan();
        electronAPI.connectClassicDevice(address);
    }

    const handleCloseClassicModal = () => {
        if (classicScanStarted) {
            electronAPI.stopClassicScan();
            setClassicScanStarted(false);
        }
        setClassicDevices([]);
        setClassicModalOpen(false);
        setStatusMessage("Classic scan stopped.");
    }

    // --- Render Helpers ---

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
                                        {connectingId === device.id ? 'Connecting' : 'Connect BLE'}
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

    const renderClassicDeviceList = () => {
        if (classicDevices.length > 0) {
            return (
                <List dense>
                    {classicDevices.map((dev, index) => (
                        <React.Fragment key={dev.address}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={classicConnectingAddr === dev.address ? <CircularProgress size={16} color="inherit" /> : <BluetoothConnectedIcon />}
                                        onClick={() => handleClassicConnect(dev.address)}
                                        disabled={classicConnectingAddr !== null}
                                    >
                                        {classicConnectingAddr === dev.address ? 'Connecting' : 'Connect'}
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={dev.name || `Unknown Device`}
                                    secondary={`MAC: ${dev.address}`}
                                />
                            </ListItem>
                            {index < classicDevices.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            );
        }

        if (classicScanStarted && classicDevices.length === 0) {
            return (
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Scanning for classic Bluetooth devices...
                    </Typography>
                </Box>
            );
        }

        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No classic Bluetooth devices discovered yet.
            </Alert>
        );
    }

    // --- JSX Render ---
    return (
        <Box sx={{ padding: 3, maxWidth: 700, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                BLE & Classic Bluetooth Device QC
            </Typography>

            {/* Display Error/Status Alert */}
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                    Error: {error}
                </Alert>
            )}

            {/* BLE Main Action Button */}
            <Button
                onClick={connected ? handleDisconnect : handleStartScan}
                variant="contained"
                color={connected ? "error" : "primary"}
                startIcon={connected ? null : <SearchIcon />}
                sx={{ mt: 3, mb: 2, borderRadius: 5, padding: '10px 30px' }}
                disabled={loading && !connected}
            >
                {connected ? "Disconnect & Restart Scan" : "Start BLE Scan"}
            </Button>

            {/* Classic Scan Button */}
            <Button
                onClick={handleClassicScan}
                variant="outlined"
                color="secondary"
                sx={{ mt: 1, mb: 3, ml: 2, borderRadius: 5, padding: '10px 30px' }}
            >
                Start Classic Scan
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Status: <strong>{statusMessage}</strong>
            </Typography>

            {/* BLE Connected UI */}
            {connected && (
                <Box sx={{ mt: 2, p: 3, border: '1px solid #4caf50', borderRadius: 2, backgroundColor: '#e8f5e9', textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ color: "green", mb: 1 }} component="div">
                        <CheckCircleOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        BLE Connected Successfully
                    </Typography>
                    <Typography variant="body1"><b>Device Name:</b> {connected.name}</Typography>
                    <Typography variant="body1"><b>MAC Address:</b> {connected.mac}</Typography>
                    <Typography variant="body1"><b>Device ID:</b> {connected.id}</Typography>
                </Box>
            )}

            {/* Classic Connected UI */}
            {classicConnected && (
                <Box sx={{ mt: 3, p: 2, border: "1px solid #1976d2", borderRadius: 2, backgroundColor: '#e3f2fd', textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ color: "#0d47a1", mb: 1 }}>
                        Classic Bluetooth Connected
                    </Typography>
                    <Typography variant="body1"><b>Device Name:</b> {classicConnected.name || 'Unknown'}</Typography>
                    <Typography variant="body1"><b>MAC Address:</b> {classicConnected.address}</Typography>
                </Box>
            )}

            {/* BLE Scan Modal */}
            <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="scan-modal-title">
                <Box sx={modalStyle}>
                    <IconButton aria-label="close" onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography id="scan-modal-title" variant="h6" component="h2" gutterBottom>
                        Scanning for BLE Devices
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
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

            {/* Classic Scan Modal */}
            <Modal open={classicModalOpen} onClose={handleCloseClassicModal} aria-labelledby="classic-scan-modal">
                <Box sx={modalStyle}>
                    <IconButton aria-label="close" onClick={handleCloseClassicModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography id="classic-scan-modal" variant="h6" component="h2" gutterBottom>
                        Scanning for Classic Bluetooth Devices
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
                        {classicScanStarted ? "Scanning for devices..." : "Ready"}
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {renderClassicDeviceList()}
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                    {!classicScanStarted && classicDevices.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            *Select a device to connect.
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
