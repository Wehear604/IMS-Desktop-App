

import {
    Button, CircularProgress, Typography, Paper, Modal, Box, List, ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CHARACTERISTIC_UUID_READ_NOTIFY, CHARACTERISTIC_UUID_READ_WRITE, LISTENING_SIDE, MANUFACTURER_IDENTIFIER, SERVICE_UUID } from "../../utils/constants";
import { findObjectKeyByValue } from "../../utils/main";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { Bluetooth } from "@mui/icons-material";
const getBLEProfile = (deviceType) => {
    return {
        serviceUUID: SERVICE_UUID[deviceType],
        manufacturerId: parseInt(MANUFACTURER_IDENTIFIER[deviceType]),
        charReadWrite: CHARACTERISTIC_UUID_READ_WRITE[deviceType],
        charReadNotify: CHARACTERISTIC_UUID_READ_NOTIFY[deviceType],
    };
};
// Style for the modal
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

const BleConnectDeviceModule = ({
    onConnectWithDevice = (hardwareData, deviceInformation, disconnectFun) => { },
    onDisconnect = () => { },
    Component,
    fitting,
}) => {
    // const [enabled, // setEnabled] = useState(false);
    const dispatch = useDispatch();
    const [connected, setConnected] = useState();
    const [loading, setLoading] = useState(true); // Start true for initial check
    // const [loadingMessage, // setLoadingMessage] = useState("Checking Bluetooth...");
    // const [servers, // setServer] = useState(null);
    // const [services, // setServer] = useState(null);
    // const [charateristic, // setCharacteristics] = useState(null);
    const [deviceObj, setDeviceObj] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
    const [device, setDevices] = useState(null);
    const [selectingDeviceId, setSelectingDeviceId] = useState(null);

    // --- State migrated from App.js ---
    const [deviceFunctions, setDeviceFunctions] = useState(null);
    const [data, setData] = useState(null); // This was `readData` in App.js
    const [deviceList, setDeviceList] = useState([]);
    console.log("first deviceFunctions", deviceFunctions)
    useEffect(() => {
        onWriteFunctionEnabled(deviceFunctions);
    }, [deviceFunctions]);
    
    useEffect(() => {
        // Check if the electronAPI is on the window
        if (window.electronAPI) {
            // Listen for the device list from main.js
            window.electronAPI.onBluetoothDeviceList((devices) => {
                console.log('Received device list in React:', devices);
                setDeviceList(devices);
                // setIsPickerOpen(false); // Open the device picker modal
            });

            // Listen for pairing requests
            window.electronAPI.onBluetoothPairingRequest((details) => {
                const response = {};
                switch (details.pairingKind) {
                    case 'confirm':
                        response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`);
                        break;
                    case 'confirmPin':
                        response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin on device ${details.deviceId}?`);
                        break;
                    case 'providePin':
                        const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`);
                        if (pin) {
                            response.pin = pin;
                            response.confirmed = true;
                        } else {
                            response.confirmed = false;
                        }
                        break;
                    default:
                        response.confirmed = false;
                }
                // Send response back to main process
                window.electronAPI.bluetoothPairingResponse(response);
            });
        } else {
            console.warn('electronAPI is not available. Running in a standard browser.');
        }
    }, []); // Empty array means this runs once on mount


    // --- Bluetooth Availability Check (Fixed) ---
    useEffect(() => {
        const checkBluetooth = async () => {
            if (window.navigator && window.navigator.bluetooth) {
                try {
                    const isAvailable = await navigator.bluetooth.getAvailability();
                    if (isAvailable) {
                        // setLoadingMessage("");
                        // setEnabled(true);
                    } else {
                        // setLoadingMessage("Bluetooth is turned off. Please turn on Bluetooth in your system settings.");
                        // setEnabled(false);
                    }
                } catch (error) {
                    console.error("Error checking Bluetooth availability:", error);
                    // setLoadingMessage("Could not check Bluetooth status. Ensure permissions are granted.");
                    // setEnabled(false);
                }
            } else {
                // setLoadingMessage("Web Bluetooth is not supported by this application.");
                // setEnabled(false);
            }
            setLoading(false);
        };
        checkBluetooth();
    }, []);


    // --- BLE Helper Functions (Original) ---
    const readDeviceNameValue = async (characteristic) => {
        const value = await characteristic.readValue();
        setDevices(new TextDecoder().decode(value));
    };

    const readAndDecodeData = async (characteristic) => {
        const value = await characteristic.readValue();
        let len = value.byteLength;
        var arr_res = new Array(len);
        for (var i = 0; i < len; i++) {
            arr_res[i] = value.getUint8(i, true);
        }
        return arr_res;
    };

    const readAppearanceValue = async (characteristic) => {
        const arr_res = await readAndDecodeData(characteristic);
        setData(arr_res); // Set the data for the UI
        setDeviceFunctions({ // This was `setWriteFunction`
            readData: async () => {
                return await readAndDecodeData(characteristic);
            },
            writeData: async (arr_to_be_write) => {
                return await characteristic.writeValueWithoutResponse(
                    Uint8Array.from(arr_to_be_write)
                );
            },
        });
        return arr_res;
    };

    useEffect(() => {
        if (deviceObj && data?.length > 0 && connected && deviceInfo.id != "")
            onConnectWithDevice(data, deviceInfo, () => disconnect(true));
    }, [deviceObj, data, deviceInfo, connected]);


    // --- Core Connect/Disconnect Logic (Fixed) ---
    const connectDevice = async () => {
        try {
            setLoading(true);

            const deviceType = fitting?.device_type;  // <<--- YOU MUST PASS THIS IN PROPS
            const profile = getBLEProfile(deviceType);

            if (!profile.serviceUUID) {
                console.error("Invalid Device Type UUID mappings not found");
                return;
            }

            console.log("Using BLE Profile:", profile);

            // Request device based on MANUFACTURER ID
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    {
                        manufacturerData: [{ companyIdentifier: profile.manufacturerId }]
                    }
                ],
                optionalServices: [profile.serviceUUID],
            });

            if (!device) return;

            // Validate L / R side
            if (
                (fitting.device_side === LISTENING_SIDE.LEFT && !device.name.endsWith("L")) ||
                (fitting.device_side === LISTENING_SIDE.RIGHT && !device.name.endsWith("R"))
            ) {
                const side = findObjectKeyByValue(fitting.device_side, LISTENING_SIDE);
                dispatch(
                    callSnackBar(`Please connect the ${side} side device`, SNACK_BAR_VARIETNS.error)
                );
                setLoading(false);
                return;
            }

            setDeviceInfo({ name: device.name, id: device.id });
            device.ongattserverdisconnected = () => disconnect(false);

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(profile.serviceUUID);

            const characteristics = await service.getCharacteristics();

            let notifyCharacteristic = null;
            let rwCharacteristic = null;

            for (const char of characteristics) {
                if (char.uuid === profile.charReadNotify) {
                    notifyCharacteristic = char;
                }
                if (char.uuid === profile.charReadWrite) {
                    rwCharacteristic = char;
                }
            }

            if (!notifyCharacteristic || !rwCharacteristic) {
                console.error("Required characteristics not found for device type", deviceType);
            }

            // Setup Read/Write functions
            setDeviceFunctions({
                readData: async () => {
                    const value = await rwCharacteristic.readValue();
                    return Array.from(new Uint8Array(value.buffer));
                },
                writeData: async (arr) => {
                    const buffer = Uint8Array.from(arr);
                    return await rwCharacteristic.writeValueWithoutResponse(buffer);
                }
            });

            // Enable Notify Listener
            await notifyCharacteristic.startNotifications();
            notifyCharacteristic.addEventListener("characteristicvaluechanged", (event) => {
                const v = event.target.value;
                let arr = [];
                for (let i = 0; i < v.byteLength; i++) arr.push(v.getUint8(i));
                setData(arr);
            });

            setConnected(true);
            setDeviceObj(device);
            setLoading(false);
        } catch (e) {
            console.error("BLE Connection Failed:", e);
            setLoading(false);
        }
    };


    const disconnect = (isButtonPress) => {
        setSelectingDeviceId(null);
        if (isButtonPress === true) {
            if (deviceObj?.gatt?.connected) {
                deviceObj.gatt?.disconnect?.();
            } else {
                // setLoadingMessage("Already Disconnected..");
            }
        }
        // This is an automatic disconnect

        setDeviceInfo({});
        setConnected(false);
        setDeviceObj(null);
        // setServer(null);
        setDevices(null);
        onDisconnect();
        // setCharacteristics(null);
        // setServer(null);
        setData(null); // Clear read data
        setDeviceFunctions(null); // Clear functions
        // setLoadingMessage("");
        // No more onDisconnect() callback
    };


    // --- Handlers for Modal (from App.js) ---
    const handleDeviceSelected = (deviceId) => {
        // setIsPickerOpen(true);
        setSelectingDeviceId(deviceId);
        if (window.electronAPI) {
            window.electronAPI.selectBluetoothDevice(deviceId);
        }
    };

    const handleCancelSelect = () => {
        // setIsPickerOpen(false);
        setSelectingDeviceId(null);
        if (window.electronAPI) {
            window.electronAPI.cancelBluetoothRequest();
        }
    };

    // --- Handlers for Read/Write (from App.js) ---



    // --- Merged UI (from App.js and ConnectDevice.js) ---
    return (
        <>
            <Component
                loading={loading}
                connected={fitting?.connected}
                onClick={connectDevice}
                disconnect={() => disconnect(true)}
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
                            const isLoading = selectingDeviceId == device.deviceId;
                            return (
                                <ListItemButton
                                    key={device.deviceId}
                                    onClick={() => handleDeviceSelected(device.deviceId)}
                                    // Disable all buttons if one is being selected
                                    disabled={!!selectingDeviceId}
                                >
                                    <ListItemIcon>
                                        {isLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <Bluetooth />
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
                        // Disable cancel button while loading
                        disabled={!!selectingDeviceId}
                    >
                        Cancel
                    </Button>
                </Box>
            </Modal>
        </>
    );


};
export default memo(BleConnectDeviceModule);