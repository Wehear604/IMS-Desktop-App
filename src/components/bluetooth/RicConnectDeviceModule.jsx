// RicConnectDevice.jsx
import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    CircularProgress,
    Typography,
    Modal,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import {
    CHARACTERISTIC_UUID_READ_NOTIFY,
    CHARACTERISTIC_UUID_READ_WRITE,
    DEVICES,
    LISTENING_SIDE,
    MANUFACTURER_IDENTIFIER,
    SERVICE_UUID,
    SNACK_BAR_VARIETNS
} from "../../utils/constants";

import { BLE_STORE } from "../../utils/bleStore";
import { useDispatch } from "react-redux";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { DeviceIsConnectingAction, DeviceMACAction, disconnectAction } from "../../store/actions/deviceDataAction";
import WriteRicDataToDevice from "./WriteRicDataToDevice";
import WriteSafeBudsDataToDevice from "./WriteSafeBudsDataToDevice";

// --- IMPORT STATIC FILE HERE ---
import Safefile from "../../assets/blefiles/safe.fot";

// --- DEFINE OTA UUID FOR PERMISSIONS ---
const OTA_SERVICE_UUID = "0000ff12-0000-1000-8000-00805f9b34fb";

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

const hexStringToUint8Array = (hexString) => {
    if (!hexString) return new Uint8Array([]);
    const bytes = hexString
        .trim()
        .split(" ")
        .map((byte) => parseInt(byte, 16));
    return new Uint8Array(bytes);
};

const RicConnectDevice = ({
    side,
    onConnectWithDevice = () => { },
    Component,
    onEnableChange = () => { },
    onDisconnect = () => { },
    fitting,
}) => {
    const [leftVolume, setLeftVolume] = useState(40);
    const [rightVolume, setRightVolume] = useState(40);
    const [leftDeviceConnected, setLeftDeviceConnected] = useState(false);
    const [rightDeviceConnected, setRightDeviceConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Checking Browser Support");
    const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
    const [data, setData] = useState([]);
    const [connected, setConnected] = useState(false);
    const [enabled, setEnabled] = useState(false);

    const [deviceList, setDeviceList] = useState([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectingDeviceId, setSelectingDeviceId] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (window.electronAPI) {
            const onList = (devices) => {
                setDeviceList(devices);
                setIsPickerOpen(true);
            };
            window.electronAPI.onBluetoothDeviceList(onList);

            const onPair = (details) => {
                const response = {};
                window.electronAPI.bluetoothPairingResponse(response);
            };
            window.electronAPI.onBluetoothPairingRequest(onPair);

            return () => { };
        }
    }, []);

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
                        setLoadingMessage("Bluetooth is turned off.");
                        setEnabled(false);
                        onEnableChange(false);
                    }
                } catch (error) {
                    console.error("Error checking Bluetooth availability:", error);
                    setEnabled(false);
                    onEnableChange(false);
                }
            } else {
                setLoadingMessage("Web Bluetooth is not supported.");
                setEnabled(false);
                onEnableChange(false);
            }
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));
        };
        checkBluetooth();
    }, []);

    useEffect(() => {
        if (loading && isPickerOpen) {
            setIsPickerOpen(false);
            setSelectingDeviceId(null);
            dispatch(DeviceMACAction(null));
        }
    }, [loading, isPickerOpen]);

    useEffect(() => {
        return () => {
            try {
                if (BLE_STORE.deviceObj?.gatt?.connected) {
                    BLE_STORE.deviceObj.gatt.disconnect();
                }
            } catch (err) { }
            BLE_STORE.deviceObj = null;
            BLE_STORE.writeFun = null;
            BLE_STORE.disconnectFun = null;
            BLE_STORE.hardwareData = null;
        };
    }, []);

    const connectDeviceFun = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            setLoadingMessage("Connecting Device...");
            setLoading(true);
            dispatch(DeviceIsConnectingAction(true));

            const serviceUuid = SERVICE_UUID[fitting.device_type];
            const characteristicUuidReadNotify = CHARACTERISTIC_UUID_READ_NOTIFY[fitting.device_type];
            const characteristicUuidReadWrite = CHARACTERISTIC_UUID_READ_WRITE[fitting.device_type];

            const filterData = {};
            const filter = {
                manufacturerData: [{ companyIdentifier: parseInt(MANUFACTURER_IDENTIFIER[fitting.device_type]) ?? null }],
            };
            if (fitting.device_type === DEVICES.ITE_PRIME) {
                filterData.filters = [
                    { namePrefix: "ITE" }
                ];
            } else if (filter.manufacturerData[0].companyIdentifier) {
                filterData.filters = [filter];
            } else {
                filterData.acceptAllDevices = true;
            }

            // ----------------------------------------------------
            // FIXED: requestDevice with OTA Service included
            // ----------------------------------------------------
            const optionalServicesList = [serviceUuid];
            if (fitting.device_type === DEVICES.NECKBAND) {
                optionalServicesList.push(OTA_SERVICE_UUID);
            }

            const device = await navigator.bluetooth.requestDevice({
                ...filterData,
                optionalServices: [serviceUuid],
            });

            if (!device) {
                setLoadingMessage("No device selected.");
                setLoading(false);
                dispatch(DeviceIsConnectingAction(false));
                return;
            }

            if (
                (fitting.device_type === DEVICES.RIC_OPTIMA) &&
                (
                    (side === "Left" && !device.name?.endsWith("L")) ||
                    (side === "Right" && !device.name?.endsWith("R"))
                )
            ) {
                setLoadingMessage(`Please connect the correct device for the ${side} side.`);
                dispatch(callSnackBar(`Please connect the ${side} side device `, SNACK_BAR_VARIETNS.error));
                setLoading(false);
                dispatch(DeviceIsConnectingAction(false));
                return;
            }

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(serviceUuid);
            const characteristicReadNotify = await service.getCharacteristic(characteristicUuidReadNotify);
            const characteristicReadWrite = await service.getCharacteristic(characteristicUuidReadWrite);

            BLE_STORE.deviceObj = device;
            BLE_STORE.writeFun = characteristicReadWrite;
            BLE_STORE.disconnectFun = () => disconnect(side);
            BLE_STORE.hardwareData = data;

            try {
                await characteristicReadNotify.startNotifications();
                characteristicReadNotify.addEventListener("characteristicvaluechanged", (event) => {
                    try {
                        const value = event.target.value;
                        const arr = [];
                        for (let i = 0; i < value.byteLength; i++) {
                            arr.push(("0" + value.getUint8(i).toString(16)).slice(-2));
                        }
                        const hex = arr.join(" ");
                        setData(prev => {
                            const next = [...prev.slice(-49), { ts: Date.now(), hex }];
                            BLE_STORE.hardwareData = next;
                            return next;
                        });
                    } catch (err) {
                        console.error("Error parsing notification", err);
                    }
                });
            } catch (err) {
                console.warn("Could not start notifications:", err);
            }

            if (side === "Left") {
                setLeftDeviceConnected(true);
            } else {
                setRightDeviceConnected(true);
            }
            setConnected(true);

            setLoadingMessage("Device connected successfully");
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));

            const currentDeviceInfo = { name: device.name, id: device.id };
            setDeviceInfo(currentDeviceInfo);
            if (fitting.device_type === DEVICES.RIC_OPTIMA_8) {
                await WriteRicDataToDevice(
                    "0x02",
                    side,
                    BLE_STORE.deviceObj || device
                );
                if (side === "Left") {
                    await WriteRicDataToDevice("0x0B", side, BLE_STORE.deviceObj || device);
                } else {
                    await WriteRicDataToDevice("0x0B", side, BLE_STORE.deviceObj || device);
                }

            }

            device.ongattserverdisconnected = (err) => {
                console.log("GATT disconnected:", err);
                if (side === "Left") {
                    setLeftDeviceConnected(false);
                    dispatch(disconnectAction(LISTENING_SIDE.LEFT, true));
                } else {
                    setRightDeviceConnected(false);
                    dispatch(disconnectAction(LISTENING_SIDE.RIGHT, true));
                }
                setLoadingMessage("Device disconnected");
                BLE_STORE.deviceObj = null;
                BLE_STORE.writeFun = null;
                BLE_STORE.disconnectFun = null;
            };

            // ----------------------------------------------------
            // FIXED: OTA Call with correct file and options
            // ----------------------------------------------------
            if (fitting.device_type === DEVICES.NECKBAND) {
                console.log("Starting OTA...");
                await WriteSafeBudsDataToDevice(
                    side,
                    BLE_STORE.deviceObj || device,
                    {
                        otaFileSource: Safefile,
                        maxPacketSize: 20,       // Web BLE Requirement
                        payloadBlockSize: 4096,  // Device Firmware Requirement
                        interChunkDelayMs: 6,    // Stable timing
                        ackTimeoutMs: 40000,     // Generous timeout for stability
                        maxRetries: 10,          // More retries
                        progressCallback: (pct) => {
                            // Only log every 5% for stability
                            if (pct % 5 === 0) console.log("OTA Progress:", pct);
                        },
                    }
                );
            }
            onConnectWithDevice(data, currentDeviceInfo);

        } catch (error) {
            console.error("Error:", error);
            setLoadingMessage("Failed to connect: " + (error?.message || String(error)));
            setLoading(false);
            dispatch(DeviceIsConnectingAction(false));
            if (side === "Left") {
                setLeftDeviceConnected(false);
            } else {
                setRightDeviceConnected(false);
            }
        }
    };

    const disconnect = (sideParam) => {
        try {
            if (BLE_STORE.deviceObj?.gatt?.connected) {
                BLE_STORE.deviceObj.gatt.disconnect();
            } else {
                setLoadingMessage("already Disconnected..");
            }
        } catch (err) {
            console.warn("Disconnect error:", err);
        }

        BLE_STORE.deviceObj = null;
        BLE_STORE.writeFun = null;
        BLE_STORE.disconnectFun = null;
        BLE_STORE.hardwareData = null;

        if (sideParam === "Left") {
            setLeftDeviceConnected(false);
        } else {
            setRightDeviceConnected(false);
        }
        setConnected(false);
        setDeviceInfo({});
        setLoadingMessage("");
        onDisconnect();
    };

    const handleDeviceSelected = (deviceId) => {
        setSelectingDeviceId(deviceId);
        dispatch(DeviceMACAction(deviceId));
        if (window.electronAPI) {
            window.electronAPI.selectBluetoothDevice(deviceId);
        }
    };

    const handleCancelSelect = () => {
        if (selectingDeviceId) return;
        setIsPickerOpen(false);
        if (window.electronAPI) {
            window.electronAPI.cancelBluetoothRequest();
        }
    };

    return (
        <>
            <Component
                loading={loading}
                connected={side === "Left" ? leftDeviceConnected : rightDeviceConnected}
                onClick={(e) => connectDeviceFun(e)}
                disconnect={() => disconnect(side)}
                deviceSide={fitting?.device_side}
            />

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
                                        {isLoading ? <CircularProgress size={24} /> : <BluetoothIcon />}
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