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
  FormHelperText,
  LinearProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import BluetoothConnectedIcon from "@mui/icons-material/BluetoothConnected";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";

const { electronAPI } = window;

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function DeviceQcListUi() {
  const [connected, setConnected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Click 'Start BLE Scan' to begin."
  );
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

  // OTA states
  const [otaFile, setOtaFile] = useState(null);
  const [otaStatus, setOtaStatus] = useState("Idle");
  const [otaProgress, setOtaProgress] = useState(0);
  const [otaRunning, setOtaRunning] = useState(false);

  // --- IPC Listeners Setup ---
  useEffect(() => {
    if (!electronAPI) {
      setError("Electron API not loaded. Check preload.js configuration.");
      return;
    }

    const cleanups = [];

    // discovered devices
    cleanups.push(
      electronAPI.onBleDevice((device) => {
        setDiscoveredDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            setStatusMessage(
              `Scan active. ${prevDevices.length + 1} devices found.`
            );
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      })
    );

    // connected
    cleanups.push(
      electronAPI.onBleConnected((dev) => {
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
        setOtaStatus("Idle");
        setOtaProgress(0);
      })
    );

    // errors
    cleanups.push(
      electronAPI.onBleError((msg) => {
        console.error("BLE Error:", msg);
        setError(msg);
        setLoading(false);
        setConnectingId(null);
        setModalOpen(false);
        setScanStarted(false);
      })
    );

    // status
    cleanups.push(
      electronAPI.onBleStatus((msg) => {
        setStatusMessage(msg);
        if (msg.includes("Scanning") || msg.includes("Attempting to connect")) {
          setLoading(true);
        } else if (
          msg.toLowerCase().includes("ready") ||
          msg.toLowerCase().includes("disconnected") ||
          msg.toLowerCase().includes("timeout") ||
          msg.toLowerCase().includes("stopped")
        ) {
          setLoading(false);
        }
      })
    );

    // notifications volume push
    cleanups.push(
      electronAPI.onVolumeUpdated((d) => {
        if (connected && d.id === connected.id) {
          setVolume(d.volume);
          setStatusMessage(`Volume updated: ${d.volume}`);
        }
      })
    );

    // existing read response
    cleanups.push(
      electronAPI.onReadVolumeResponse((resp) => {
        if (!connected || resp.id !== connected.id) return;

        try {
          const hex = String(resp.hex || "");
          const bytes = hex.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || [];

          if (bytes.length === 1 && bytes[0] >= 0 && bytes[0] <= 100) {
            setVolume(bytes[0]);
            setStatusMessage(`Volume read: ${bytes[0]}`);
          } else if (bytes.length >= 2) {
            setVolume(bytes[1]);
            setStatusMessage(`Volume read: ${bytes[1]}`);
          }
        } catch {}
      })
    );

    return () => {
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }, [connected]);

  // --- Validate Type ---
  const validateDeviceType = (value) => {
    const num = Number(value);
    if (!allowedTypes.includes(num)) {
      setDeviceTypeError(
        `Device type must be one of: ${allowedTypes.join(", ")}`
      );
      return false;
    }
    setDeviceTypeError("");
    return true;
  };

  // --- Scan Start ---
  const handleStartScan = () => {
    if (!electronAPI || (loading && !connected)) return;

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

  // --- Connect ---
  const handleConnectDevice = (id) => {
    if (!electronAPI || connected || connectingId) return;

    const num = Number(deviceType);
    if (!validateDeviceType(num)) return;

    electronAPI.stopBleScan();
    setScanStarted(false);

    setConnectingId(id);
    setLoading(true);
    const deviceToConnect = discoveredDevices.find((d) => d.id === id);
    setStatusMessage(
      `Attempting to connect to ${deviceToConnect?.name || id}...`
    );

    electronAPI.connectDevice({ id, type: num });
  };

  // --- Disconnect + Restart Scan ---
  const handleDisconnect = () => {
    const connectedId = connected?.id;

    if (connectedId) electronAPI.disconnectDevice(connectedId);
    else if (scanStarted) electronAPI.stopBleScan();

    setConnected(null);
    setError(null);
    setDiscoveredDevices([]);
    setLoading(false);
    setScanStarted(false);
    setConnectingId(null);
    setModalOpen(false);
    setVolume(null);
    setStatusMessage("Device disconnected. Starting new scan...");
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

  // --- Read Volume (one-shot) ---
  const handleReadVolumeNow = () => {
    if (!connected) {
      setError("No device connected");
      return;
    }

    setStatusMessage("Reading volume...");

    electronAPI.readVolumeNow({ id: connected.id });

    const remove = electronAPI.onReadVolumeNowResponse((resp) => {
      try {
        if (resp.error) {
          setStatusMessage(`Read error: ${resp.error}`);
          remove();
          return;
        }

        const hexStr = String(resp.hex || "");
        const bytes =
          hexStr.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || [];

        if (bytes.length === 1) {
          setVolume(bytes[0]);
        } else if (bytes.length >= 2) {
          setVolume(bytes[1]);
        }

        setStatusMessage("Volume updated");
      } finally {
        remove();
      }
    });
  };

  // --- OTA Start ---
  const handleStartOTA = async () => {
    if (!connected) {
      setOtaStatus("Device not connected");
      return;
    }

    if (!otaFile) {
      setOtaStatus("No OTA file selected");
      return;
    }

    try {
      setOtaRunning(true);
      setOtaStatus("Starting OTA...");
      setOtaProgress(0);

      electronAPI.startOta({
        id: connected.id,
        buffer: otaFile.buffer,
      });

      const off1 = electronAPI.onOtaStatus((msg) => setOtaStatus(msg));
      const off2 = electronAPI.onOtaProgress((pct) => setOtaProgress(pct));
      const off3 = electronAPI.onOtaDone((resp) => {
        setOtaStatus(resp?.success ? "OTA Completed" : "OTA Failed");
        setOtaRunning(false);
        off1();
        off2();
        off3();
      });
    } catch (err) {
      console.error(err);
      setOtaStatus("OTA failed to start");
      setOtaRunning(false);
    }
  };

  // --- Device List Render ---
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
                    startIcon={
                      connectingId === device.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <BluetoothConnectedIcon />
                      )
                    }
                    onClick={() => handleConnectDevice(device.id)}
                    disabled={connectingId !== null}
                  >
                    {connectingId === device.id ? "Connecting" : "Connect"}
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    device.name ||
                    `Unnamed Device (${device.id.substring(0, 8)}...)`
                  }
                  secondary={`ID: ${device.id.substring(0, 10)}... | RSSI: ${
                    device.rssi
                  }`}
                />
              </ListItem>
              {index < discoveredDevices.length - 1 && (
                <Divider component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      );
    }

    if (loading)
      return (
        <Box align="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>{statusMessage}</Typography>
        </Box>
      );

    return null;
  };

  return (
    <Box
      sx={{ padding: 3, maxWidth: 500, margin: "auto", textAlign: "center" }}
    >
      <Typography variant="h4" gutterBottom>
        BLE Device QC Connection
      </Typography>

      {/* Device Type */}
      <FormControl
        sx={{ mt: 2, width: "100%" }}
        error={Boolean(deviceTypeError)}
      >
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
        {deviceTypeError && <FormHelperText>{deviceTypeError}</FormHelperText>}
      </FormControl>

      {error && <Alert severity="error">Error: {error}</Alert>}

      {/* Scan Button */}
      <Button
        onClick={connected ? handleDisconnect : handleStartScan}
        variant="contained"
        color={connected ? "error" : "primary"}
        startIcon={connected ? null : <SearchIcon />}
        sx={{ mt: 2, borderRadius: 5, px: 4 }}
        disabled={loading && !connected}
      >
        {connected ? "Disconnect & Restart Scan" : "Start BLE Scan"}
      </Button>

      <Typography sx={{ mt: 1 }}>
        Current Status: <b>{statusMessage}</b>
      </Typography>

      {/* Connected Section */}
      {connected && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: "1px solid green",
            borderRadius: 2,
            background: "#E8F5E9",
          }}
        >
          <Typography color="green">
            <CheckCircleOutlineIcon /> Connected Successfully
          </Typography>

          <Typography>Device: {connected.name}</Typography>
          <Typography>MAC: {connected.mac}</Typography>
          <Typography>ID: {connected.id}</Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button onClick={handleReadVolumeNow} variant="outlined">
              Read Volume Now
            </Button>

            <Button
              variant="outlined"
              onClick={() => electronAPI.readVolume({ id: connected.id })}
            >
              Read Existing
            </Button>
          </Box>

          {volume !== null && (
            <Typography sx={{ mt: 1 }}>Volume: {volume}</Typography>
          )}

          {/* OTA Section */}
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">OTA Firmware Update</Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button variant="contained" component="label" disabled={otaRunning}>
              Upload .FOT
              <input
                hidden
                type="file"
                accept=".fot"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const buffer = await file.arrayBuffer();
                  setOtaFile({ name: file.name, buffer });
                  setOtaStatus(
                    `Loaded ${file.name} (${buffer.byteLength} bytes)`
                  );
                }}
              />
            </Button>

            <Button
              variant="outlined"
              disabled={!otaFile || otaRunning}
              onClick={handleStartOTA}
            >
              Start OTA
            </Button>
          </Box>

          <Typography sx={{ mt: 1 }}>
            <b>Status:</b> {otaStatus}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={otaProgress}
            sx={{ mt: 1 }}
          />

          <Typography>{otaProgress}%</Typography>
        </Box>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={handleCloseModal}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6">Scanning Devices...</Typography>
          <Divider sx={{ my: 1 }} />
          {renderDeviceList()}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Device Connected!"
      />
    </Box>
  );
}
