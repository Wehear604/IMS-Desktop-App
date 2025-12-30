// SafeBudsConnectDeviceModule.jsx
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
  ListItemText,
} from "@mui/material";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  LISTENING_SIDE,
  MANUFACTURER_IDENTIFIER,
  SERVICE_UUID,
  SNACK_BAR_VARIETNS,
} from "../../utils/constants";

import { BLE_STORE, SAFE_BUDS_STORE } from "../../utils/bleStore"; // <-- Make sure this file exports BLE_STORE
import { useDispatch } from "react-redux";
import { callSnackBar } from "../../store/actions/snackbarAction";
import {
  DeviceIsConnectingAction,
  DeviceMACAction,
  disconnectAction,
} from "../../store/actions/deviceDataAction";
import WriteRicDataToDevice from "./WriteRicDataToDevice";
// import WriteSafeBudsDataToDevice from "./WriteSafeBudsDataToDevice";

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
};

const hexStringToUint8Array = (hexString) => {
  if (!hexString) return new Uint8Array([]);
  const bytes = hexString
    .trim()
    .split(" ")
    .map((byte) => parseInt(byte, 16));
  return new Uint8Array(bytes);
};

const SafeBudsConnectDeviceModule = ({
  side,
  onConnectWithDevice = () => {},
  Component,
  onEnableChange = () => {},
  onDisconnect = () => {},
  fitting,
}) => {
  // UI / serializable state only
  const [leftVolume, setLeftVolume] = useState(40);
  const [rightVolume, setRightVolume] = useState(40);
  const [leftDeviceConnected, setLeftDeviceConnected] = useState(false);
  const [rightDeviceConnected, setRightDeviceConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Checking Browser Support"
  );
  const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
  const [data, setData] = useState([]); // serializable activity data (e.g., parsed notifications)
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Electron picker state
  const [deviceList, setDeviceList] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectingDeviceId, setSelectingDeviceId] = useState(null);

  const dispatch = useDispatch();

  // Electron API listeners
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

      return () => {
        // if the electronAPI provides off/unsubscribe, use it — otherwise cleanup local handlers
        // (no-op here)
      };
    } else {
      console.warn(
        "electronAPI is not available. Running in a standard browser."
      );
    }
  }, []);

  // Bluetooth availability
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
            setLoadingMessage(
              "Bluetooth is turned off. Please turn on Bluetooth in your system settings."
            );
            setEnabled(false);
            onEnableChange(false);
          }
        } catch (error) {
          console.error("Error checking Bluetooth availability:", error);
          setLoadingMessage(
            "Could not check Bluetooth status. Ensure permissions are granted."
          );
          setEnabled(false);
          onEnableChange(false);
        }
      } else {
        setLoadingMessage(
          "Web Bluetooth is not supported by this application."
        );
        setEnabled(false);
        onEnableChange(false);
      }
      setLoading(false);
      dispatch(DeviceIsConnectingAction(false));
    };
    checkBluetooth();
    // cleanup not necessary
  }, []); // run once

  // Close electron picker if main loading starts
  useEffect(() => {
    if (loading && isPickerOpen) {
      setIsPickerOpen(false);
      setSelectingDeviceId(null);
      dispatch(DeviceMACAction(null));
    }
  }, [loading, isPickerOpen]);

  // Cleanup when component unmounts: disconnect any active BLE device
  useEffect(() => {
    return () => {
      try {
        if (BLE_STORE.deviceObj?.gatt?.connected) {
          BLE_STORE.deviceObj.gatt.disconnect();
        }
      } catch (err) {
        // ignore
      }
      // clear BLE_STORE
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

      const serviceUuid = "0000ff12-0000-1000-8000-00805f9b34fb";
      const characteristicUuidReadNotify =
        CHARACTERISTIC_UUID_READ_NOTIFY[fitting.device_type];
      const characteristicUuidReadWrite =
        CHARACTERISTIC_UUID_READ_WRITE[fitting.device_type];

      const filters = [];

      const manufacturerIdA = parseInt(MANUFACTURER_IDENTIFIER[50]);
      const manufacturerIdB = parseInt(
        MANUFACTURER_IDENTIFIER[fitting.device_type]
      );

      if (!Number.isNaN(manufacturerIdA)) {
        filters.push({
          manufacturerData: [{ companyIdentifier: manufacturerIdA }],
        });
      }

      if (!Number.isNaN(manufacturerIdB)) {
        filters.push({
          manufacturerData: [{ companyIdentifier: manufacturerIdB }],
        });
      }

      const filterData =
        filters.length > 0 ? { filters } : { acceptAllDevices: true };

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
      const UUID_SVC = "0000ff12-0000-1000-8000-00805f9b34fb";
      const UUID_IN = "0000ff14-0000-1000-8000-00805f9b34fb";
      const UUID_OUT = "0000ff15-0000-1000-8000-00805f9b34fb";

      const server = await device.gatt.connect();
      const svc = await server.getPrimaryService(UUID_SVC);
      const chIn = await svc.getCharacteristic(UUID_IN);
      const chOut = await svc.getCharacteristic(UUID_OUT);

      SAFE_BUDS_STORE.device = device;
      SAFE_BUDS_STORE.server = server;
      SAFE_BUDS_STORE.svc = svc; // <-- IMPORTANT
      SAFE_BUDS_STORE.chIn = chIn;
      SAFE_BUDS_STORE.chOut = chOut;

      BLE_STORE.deviceObj = device;
      // BLE_STORE.writeFun = characteristicReadWrite;
      BLE_STORE.disconnectFun = () => disconnect(side);
      BLE_STORE.hardwareData = data;

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
        await WriteRicDataToDevice("0x02", side, BLE_STORE.deviceObj || device);
        if (side === "Left") {
          await WriteRicDataToDevice(
            "0x0B",
            side,
            BLE_STORE.deviceObj || device
          );
        } else {
          await WriteRicDataToDevice(
            "0x0B",
            side,
            BLE_STORE.deviceObj || device
          );
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
        // clear BLE_STORE
        BLE_STORE.deviceObj = null;
        BLE_STORE.writeFun = null;
        BLE_STORE.disconnectFun = null;
      };
      console.log("BLE_STORE.deviceObj", BLE_STORE.deviceObj);
      onConnectWithDevice(data, currentDeviceInfo);
    } catch (error) {
      console.error("Error:", error);
      setLoadingMessage(
        "Failed to connect: " + (error?.message || String(error))
      );
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

    // clear BLE_STORE
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

  // Electron modal handlers
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
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
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

export default SafeBudsConnectDeviceModule;
