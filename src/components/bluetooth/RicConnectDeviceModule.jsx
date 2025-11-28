import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    CircularProgress,
    Typography,
    Modal, // <-- Added for Electron Modal
    List, // <-- Added for Electron Modal
    ListItem, // <-- Added for Electron Modal
    ListItemButton, // <-- Added for better UI
    ListItemIcon, // <-- Added for better UI
    ListItemText // <-- Added for better UI
} from "@mui/material";
import BluetoothIcon from '@mui/icons-material/Bluetooth'; // <-- Added for better UI
import { CHARACTERISTIC_UUID_READ_NOTIFY, CHARACTERISTIC_UUID_READ_WRITE, DEVICES, LISTENING_SIDE, MANUFACTURER_IDENTIFIER, SERVICE_UUID } from "../../utils/constants";

import { useDispatch, useSelector } from "react-redux";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { DeviceIsConnectingAction, disconnectAction } from "../../store/actions/deviceDataAction";

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
};

// --- Helper Functions (from your file) ---
const hexStringToUint8Array = (hexString) => {
    const bytes = hexString
        .trim()
        .split(" ")
        .map((byte) => parseInt(byte, 16));
    return new Uint8Array(bytes);
};

const RicConnectDevice = ({
    side,
    onConnectWithDevice= ()=>{},
    Component,
    onEnableChange = () => { },
    onDisconnect = () => { },
    fitting,
    // fetchingData,
    // setIsConnecting,
}) => {
    // --- State from your RicConnectDevice ---
    const [leftVolume, setLeftVolume] = useState(40);
    const [rightVolume, setRightVolume] = useState(40);
    const [leftDeviceConnected, setLeftDeviceConnected] = useState(false);
    const [rightDeviceConnected, setRightDeviceConnected] = useState(false);
    const [leftDeviceCharacteristic, setLeftDeviceCharacteristic] =
        useState(null);
    const [rightDeviceCharacteristic, setRightDeviceCharacteristic] =
        useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(
        "Checking Browser Support"
    );
    const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
    const [deviceObj, setDeviceObj] = useState(null);
    const [data, setData] = useState([]);
    const [connected, setConnected] = useState();
    const [enabled, setEnabled] = useState(false);
    const dispatch = useDispatch();
    // const { fitting, fitting } = useSelector((state) => state);

    // --- State for Electron Modal (from our old component) ---
    const [deviceList, setDeviceList] = useState([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectingDeviceId, setSelectingDeviceId] = useState(null);

    // --- Electron API Listeners ---
    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onBluetoothDeviceList((devices) => {
                setDeviceList(devices);
                setIsPickerOpen(true); // Open the modal
            });

            window.electronAPI.onBluetoothPairingRequest((details) => {
                const response = {};
                // (Your pairing logic here)
                window.electronAPI.bluetoothPairingResponse(response);
            });
        } else {
            console.warn('electronAPI is not available. Running in a standard browser.');
        }
    }, []); // Runs once on mount

    // --- Bluetooth Availability Check ---
    useEffect(() => {
        const checkBluetooth = async () => {
            if (window.navigator && window.navigator.bluetooth) {
                try {
                    const isAvailable = await navigator.bluetooth.getAvailability();
                    if (isAvailable) {
                        setLoadingMessage("");
                        setEnabled(true);
                        onEnableChange(true);
                    } else {
                        setLoadingMessage("Bluetooth is turned off. Please turn on Bluetooth in your system settings.");
                        setEnabled(false);
                        onEnableChange(false);
                    }
                } catch (error) {
                    console.error("Error checking Bluetooth availability:", error);
                    setLoadingMessage("Could not check Bluetooth status. Ensure permissions are granted.");
                    setEnabled(false);
                    onEnableChange(false);
                }
            } else {
                setLoadingMessage("Web Bluetooth is not supported by this application.");
                setEnabled(false);
                onEnableChange(false);
            }
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));
        };
        checkBluetooth();
    }, []); // Run once

    // Effect to close modal on main loading
    useEffect(() => {
        if (loading && isPickerOpen) {
            setIsPickerOpen(false);
            setSelectingDeviceId(null);
        }
    }, [loading, isPickerOpen]);


    const connectDeviceFun = async (e) => {
        e.preventDefault(); // This might not be needed if 'e' isn't passed
        // dispatch(closeModal("instruction")); // Removed Redux modal
        try {
            setLoadingMessage("Connecting Device...");
            setLoading(true);
            dispatch(DeviceIsConnectingAction(true));

            const serviceUuid =
                side === "Left"
                    ? SERVICE_UUID[fitting.device_type]
                    : SERVICE_UUID[fitting.device_type];

            const characteristicUuidReadNotify =
                side === "Left"
                    ? CHARACTERISTIC_UUID_READ_NOTIFY[fitting.device_type]
                    : CHARACTERISTIC_UUID_READ_NOTIFY[fitting.device_type];

            const characteristicUuidReadWrite =
                side === "Left"
                    ? CHARACTERISTIC_UUID_READ_WRITE[fitting.device_type]
                    : CHARACTERISTIC_UUID_READ_WRITE[fitting.device_type];

            const filterData = {};
            const filter =
                side === "Left"
                    ? { manufacturerData: [{ companyIdentifier: parseInt(MANUFACTURER_IDENTIFIER[fitting.device_type]) ?? null }] }
                    : { manufacturerData: [{ companyIdentifier: parseInt(MANUFACTURER_IDENTIFIER[fitting.device_type]) ?? null }] };

            if (filter.manufacturerData[0].companyIdentifier) {
                filterData.filters = [filter];
            } else {
                filterData.acceptAllDevices = true;
            }

            // **FIX 1: Removed the .catch() block**
            const device = await navigator.bluetooth
                .requestDevice({
                    ...filterData,
                    optionalServices: [serviceUuid],
                });
            console.log("Device ", device)
            if (!device) {
                setLoadingMessage("No device selected.");
                setLoading(false);
                dispatch(DeviceIsConnectingAction(false));
                return;
            }

            // (Your device name check logic)
            if (
                ((side === "Left" && fitting.device_type === DEVICES.RIC_OPTIMA) ||
                    (side === "Right" && fitting.device_type === DEVICES.RIC_OPTIMA)) &&
                ((side === "Left" && !device.name.endsWith("L")) ||
                    (side === "Right" && !device.name.endsWith("R")))
            ) {
                setLoadingMessage(`Please connect the correct device for the ${side} side.`);
                dispatch(callSnackBar(`Please connect the ${side} side device `, SNACK_BAR_VARIETNS.error));
                setLoading(false);
                dispatch(DeviceIsConnectingAction(false));
                return;
            }

            // (Other device checks...)

            const server = await device.gatt.connect();

            // **FIX 2: Removed the .catch() block**
            const service = await server.getPrimaryService(serviceUuid);
            console.log("Services ", service)
            const characteristicReadNotify = await service.getCharacteristic(
                characteristicUuidReadNotify
            );
            const characteristicReadWrite = await service.getCharacteristic(
                characteristicUuidReadWrite
            );
            console.log("characteristicReadWrite", characteristicReadWrite)

            // Update the connected state
            if (side === "Left") {
                setLeftDeviceConnected(true);
                setLeftDeviceCharacteristic(characteristicReadWrite);
                setConnected(true);
            } else {
                setRightDeviceConnected(true);
                setRightDeviceCharacteristic(characteristicReadWrite);
                setConnected(true);
            }
            setLoadingMessage("Device connected successfully");
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));

            const currentDeviceInfo = { name: device.name, id: device.id };
            setDeviceInfo(currentDeviceInfo);
            device.ongattserverdisconnected = (error) => {
                if (side === "Left") {
                    setLeftDeviceConnected(false);
                    console.log("Disconnected left device");
                    dispatch(disconnectAction(LISTENING_SIDE.LEFT, true));
                } else {
                    console.log("Disconnected right device");
                    setRightDeviceConnected(false);
                    dispatch(disconnectAction(LISTENING_SIDE.RIGHT, true));
                }
                setLoadingMessage("Device disconnected");
            };
            setDeviceObj(device);

            // (Your logic for connecting second device `res?.code == 192`...)
            // ...
            onConnectWithDevice(data, currentDeviceInfo, device.BluetoothDevice, () => disconnect(side));

            // (Your post-connection writes for Volume and Mode)
            // ...

        } catch (error) {
            // **This now correctly catches "User cancelled"**
            console.error("Error:", error);
            setLoadingMessage("Failed to connect: " + error.message);
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));
            if (side === "Left") {
                setLeftDeviceConnected(false);
            } else {
                setRightDeviceConnected(false);
            }
        }
    };

    // --- Disconnect Function (from your file) ---
    const disconnect = (side) => {
        if (deviceObj?.gatt?.connected) {
            deviceObj.gatt.disconnect();
        } else {
            setLoadingMessage("already Disconnected..");
        }
        if (side === "Left") {
            setLeftDeviceConnected(false);
        } else {
            setRightDeviceConnected(false);
        }
        setConnected(false);
        setDeviceInfo({});
        setDeviceObj(null);
        setLoadingMessage("");
        onDisconnect();
    };

    // --- Other functions (handleLeftVolumeChange, etc.) ---
    // ... (Your other functions like handleLeftVolumeChange) ...


    // --- Handlers for Electron Modal ---
    const handleDeviceSelected = (deviceId) => {
        setSelectingDeviceId(deviceId);
        if (window.electronAPI) {
            window.electronAPI.selectBluetoothDevice(deviceId);
        }
    };

    const handleCancelSelect = () => {
        if (selectingDeviceId) return; // Don't cancel while selecting
        setIsPickerOpen(false);
        if (window.electronAPI) {
            window.electronAPI.cancelBluetoothRequest();
        }
    };

    // --- Removed the 'onConnect' function that opened the Redux modal ---

    return (
        <>
            <Component
                loading={loading}
                connected={side === "Left" ? leftDeviceConnected : rightDeviceConnected}
                // **This now calls connectDeviceFun directly**
                onClick={(e)=>connectDeviceFun(e)}
                disconnect={() => disconnect(side)}
                deviceSide={fitting?.device_side}
            />

            {/* --- ELECTRON DEVICE PICKER MODAL --- */}
            <Modal open={loading} onClose={handleCancelSelect}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Select a Bluetooth Device
                    </Typography>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {deviceList.length === 0 && (
                            <ListItem>
                                <ListItemText primary="Searching..." />
                            </ListItem>
                        )}
                        {deviceList.map((device) => {
                            const isLoading = selectingDeviceId === device.deviceId;
                            return (
                                <ListItemButton
                                    key={device.deviceId}
                                    onClick={() => handleDeviceSelected(device.deviceId)}
                                    disabled={!!selectingDeviceId}
                                >
                                    <ListItemIcon>
                                        {isLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <BluetoothIcon />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={device.deviceName || "Unknown Device"}
                                        secondary={device.deviceId}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                    <Button
                        onClick={handleCancelSelect}
                        color="error"
                        sx={{ mt: 2 }}
                        disabled={!!selectingDeviceId}
                    >
                        Cancel
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default RicConnectDevice;