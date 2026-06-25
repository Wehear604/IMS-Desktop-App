import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import { useDispatch } from "react-redux";
import {
  SERVICE_UUID,
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
} from "../../utils/constants"; // Ensure path matches your constants
import { DeviceIsConnectingAction } from "../../store/actions/deviceDataAction"; // Adjust action imports to match your project paths
import { BLE_STORE } from "../../utils/bleStore";
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
  return new Uint8Array(
    hexString
      .trim()
      .split(" ")
      .map((byte) => parseInt(byte, 16)),
  );
};

const HearNuConnectDeviceModule = ({
  side,
  onConnectWithDevice = () => {},
  Component,
  onEnableChange = () => {},
  onDisconnect = () => {},
  fitting,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectingDeviceId, setSelectingDeviceId] = useState(null);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  // Handle Electron Bluetooth Picker Listeners
  useEffect(() => {
    if (window.electronAPI) {
      const onList = (devices) => {
        setDeviceList(devices);
        setIsPickerOpen(true);
      };
      window.electronAPI.onBluetoothDeviceList(onList);

      const onPair = (details) => {
        window.electronAPI.bluetoothPairingResponse({});
      };
      window.electronAPI.onBluetoothPairingRequest(onPair);
    }
  }, []);

  // Check Bluetooth Availability
  useEffect(() => {
    const checkBluetooth = async () => {
      if (window.navigator && window.navigator.bluetooth) {
        try {
          const isAvailable = await navigator.bluetooth.getAvailability();
          if (isAvailable) {
            onEnableChange(true);
          } else {
            onEnableChange(false);
          }
        } catch (error) {
          onEnableChange(false);
        }
      } else {
        onEnableChange(false);
      }
    };
    checkBluetooth();
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (BLE_STORE.deviceObj?.gatt?.connected) {
          BLE_STORE.deviceObj.gatt.disconnect();
        }
        if (BLE_STORE.LeftdeviceObj?.gatt?.connected) {
          BLE_STORE.LeftdeviceObj.gatt.disconnect();
        }
      } catch (err) {
        // ignore
      }
      // clear BLE_STORE
      BLE_STORE.deviceObj = null;
      BLE_STORE.writeFun = null;
      BLE_STORE.disconnectFun = null;
      BLE_STORE.hardwareData = null;
      BLE_STORE.LeftdeviceObj = null;
      BLE_STORE.writeLeftFun = null;
      BLE_STORE.LeftdisconnectFun = null;
      BLE_STORE.hardwareLeftData = null;
    };
  }, []);

  const connectDeviceFun = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage("Connecting Device...");
      setLoading(true);
      dispatch(DeviceIsConnectingAction(true));

      // Direct dictionary lookup from constant file using the exact HearNU Device Type ID (24)
      const serviceUuid = SERVICE_UUID[DEVICES.HEAR_NU_PRO] || SERVICE_UUID[24];
      const readNotifyUuid =
        CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.HEAR_NU_PRO] ||
        CHARACTERISTIC_UUID_READ_NOTIFY[24];
      const readWriteUuid =
        CHARACTERISTIC_UUID_READ_WRITE[DEVICES.HEAR_NU_PRO] ||
        CHARACTERISTIC_UUID_READ_WRITE[24];

      console.log("🚀 HearNU lookup resolved serviceUuid:", serviceUuid);

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "HearNU" }], // Target HearNU specifically or change to acceptAllDevices: true if required
        optionalServices: [serviceUuid],
      });

      if (!device) {
        setLoadingMessage("No device selected.");
        setLoading(false);
        BLE_STORE.BTEdisconnect = true;
        dispatch(DeviceIsConnectingAction(false));
        return;
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(serviceUuid);
      const chReadNotify = await service.getCharacteristic(readNotifyUuid);
      const chReadWrite = await service.getCharacteristic(readWriteUuid);

      BLE_STORE.deviceObj = device;
      BLE_STORE.writeFun = chReadWrite;
      BLE_STORE.disconnectFun = () => disconnect(side);
      BLE_STORE.hardwareData = data;
      // Setup Disconnection Handler
      device.ongattserverdisconnected = () => {
        setLoading(false);
        onDisconnect();
      };

      setLoading(false);
      dispatch(DeviceIsConnectingAction(false));
      setIsPickerOpen(false);

      // Return success data back to Parent UI layout template context
      const deviceInfo = {
        name: device.name,
        id: device.id,
      };
      onConnectWithDevice([], deviceInfo);
    } catch (error) {
      console.error("❌ HearNU Connection Error:", error);
      setLoading(false);
      dispatch(DeviceIsConnectingAction(false));
    }
  };

  useEffect(() => {
    if (BLE_STORE.BTEdisconnect) {
      disconnect(true);
      BLE_STORE.BTEdisconnect = false;
    }
  }, [BLE_STORE.BTEdisconnect]);

  const handleDeviceSelected = (deviceId) => {
    setSelectingDeviceId(deviceId);
    if (window.electronAPI) {
      window.electronAPI.selectBluetoothDevice(deviceId);
    }
  };

  const handleCancelSelect = () => {
    setIsPickerOpen(false);
    setSelectingDeviceId(null);
    setLoading(false);
    dispatch(DeviceIsConnectingAction(false));
    if (window.electronAPI) {
      window.electronAPI.cancelBluetoothRequest();
    }
  };

  return (
    <>
      <Component
        loading={loading}
        connected={fitting?.connected}
        onClick={(e) => connectDeviceFun(e)}
        disconnect={onDisconnect}
        deviceSide={fitting?.device_side}
      />

      <Modal open={isPickerOpen && loading} onClose={handleCancelSelect}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select HearNU Device
          </Typography>
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {deviceList.length === 0 && (
              <ListItem>
                <ListItemText primary="Searching for devices..." />
              </ListItem>
            )}
            {deviceList.map((device) => {
              const isItemLoading = selectingDeviceId === device.deviceId;
              return (
                <ListItemButton
                  key={device.deviceId}
                  onClick={() => handleDeviceSelected(device.deviceId)}
                  disabled={!!selectingDeviceId}
                >
                  <ListItemIcon>
                    {isItemLoading ? (
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

export default HearNuConnectDeviceModule;
