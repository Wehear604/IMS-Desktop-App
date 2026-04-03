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

import { BLE_STORE } from "../../utils/bleStore"; // <-- Make sure this file exports BLE_STORE
import { useDispatch } from "react-redux";
import { callSnackBar } from "../../store/actions/snackbarAction";
import {
  DeviceIsConnectingAction,
  DeviceMACAction,
  disconnectAction,
} from "../../store/actions/deviceDataAction";
import WriteRicDataToDevice from "./WriteRicDataToDevice";
import { runClassicCheck } from "../../utils/classicSocket";
import {
  getITEPrimeCurrentVolume,
  getITEPrimeVolume,
} from "../../store/actions/deviceQcAction";
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

const RicConnectDevice = ({
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
    "Checking Browser Support",
  );
  const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
  const [data, setData] = useState([]); // serializable activity data (e.g., parsed notifications)
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Electron picker state
  const [deviceList, setDeviceList] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectingDeviceId, setSelectingDeviceId] = useState(null);
  const arrvolume = [];
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
        "electronAPI is not available. Running in a standard browser.",
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
              "Bluetooth is turned off. Please turn on Bluetooth in your system settings.",
            );
            setEnabled(false);
            onEnableChange(false);
          }
        } catch (error) {
          console.error("Error checking Bluetooth availability:", error);
          setLoadingMessage(
            "Could not check Bluetooth status. Ensure permissions are granted.",
          );
          setEnabled(false);
          onEnableChange(false);
        }
      } else {
        setLoadingMessage(
          "Web Bluetooth is not supported by this application.",
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
    e.preventDefault();
    try {
      setLoadingMessage("Connecting Device...");
      setLoading(true);
      dispatch(DeviceIsConnectingAction(true));

      const serviceUuid = SERVICE_UUID[fitting.device_type];
      const characteristicUuidReadNotify =
        CHARACTERISTIC_UUID_READ_NOTIFY[fitting.device_type];
      const characteristicUuidReadWrite =
        CHARACTERISTIC_UUID_READ_WRITE[fitting.device_type];

      const filterData = {};
      const filter = {
        manufacturerData: [
          {
            companyIdentifier:
              parseInt(MANUFACTURER_IDENTIFIER[fitting.device_type]) ?? null,
          },
        ],
      };
      if (filter.manufacturerData[0].companyIdentifier) {
        filterData.filters = [filter];
      } else {
        filterData.acceptAllDevices = true;
      }

      const device = await navigator.bluetooth.requestDevice({
        ...filterData,
        optionalServices: [serviceUuid],
      });

      if (!device) {
        setLoadingMessage("No device selected.");
        setLoading(false);
        BLE_STORE.BTEdisconnect = true;
        dispatch(DeviceIsConnectingAction(false));
        return;
      }

      // Device name check for R/L suffix (RIC_OPTIMA)
      if (
        fitting.device_type === DEVICES.RIC_OPTIMA &&
        ((side === "Left" && !device.name?.endsWith("L")) ||
          (side === "Right" && !device.name?.endsWith("R")))
      ) {
        setLoadingMessage(
          `Please connect the correct device for the ${side} side.`,
        );
        dispatch(
          callSnackBar(
            `Please connect the ${side} side device `,
            SNACK_BAR_VARIETNS.error,
          ),
        );
        setLoading(false);
        dispatch(DeviceIsConnectingAction(false));
        return;
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(serviceUuid);
      const characteristicReadNotify = await service.getCharacteristic(
        characteristicUuidReadNotify,
      );
      const characteristicReadWrite = await service.getCharacteristic(
        characteristicUuidReadWrite,
      );

      // store non-serializable bluetooth objects in BLE_STORE (not in React state)
      BLE_STORE.deviceObj = device;
      BLE_STORE.writeFun = characteristicReadWrite; // use BLE_STORE.writeFun.writeValue(...) when writing
      BLE_STORE.disconnectFun = () => disconnect(side);
      BLE_STORE.hardwareData = data;

      try {
        await characteristicReadNotify.startNotifications();
        characteristicReadNotify.addEventListener(
          "characteristicvaluechanged",
          (event) => {
            try {
              const value = event.target.value; // DataView
              const arr = [];
              for (let i = 0; i < value.byteLength; i++) {
                arr.push(("0" + value.getUint8(i).toString(16)).slice(-2));
              }

              const hex = arr.join(" ");
              // console.log("hex notification", hex);
              // Keep `data` serializable and small
              setData((prev) => {
                const next = [...prev.slice(-49), { ts: Date.now(), hex }];
                BLE_STORE.hardwareData = next;
                const value = next[next.length - 1].hex;
                const bytes = value.split(" ");

                if (
                  fitting.device_type === DEVICES.ITE_PRIME &&
                  bytes[0] === "42" &&
                  bytes[1] === "1d" &&
                  bytes[2] === "02"
                ) {
                  const lastValue = parseInt(bytes.at(-1), 16);
                  const secondValue = parseInt(bytes.at(-2), 16);
                  arrvolume.push([lastValue, secondValue]);
                  function getChange(arr) {
                    if (arr.length < 2) return null;

                    const prev = arr[arr.length - 2];
                    const curr = arr[arr.length - 1];

                    for (let i = 0; i < curr.length; i++) {
                      if (curr[i] !== prev[i]) {
                        return curr[i]; // return changed value
                      }
                    }

                    return null;
                  }
                  const result = getChange(arrvolume);
                  console.log("result", result);
                  // if (result !== null) {
                  dispatch(
                    getITEPrimeCurrentVolume(
                      LISTENING_SIDE.BOTH,
                      result !== null ? result : 0,
                    ),
                  );
                  // }
                }
                return next;
              });
            } catch (err) {
              console.error("Error parsing notification", err);
            }
          },
        );
      } catch (err) {
        console.warn("Could not start notifications:", err);
      }

      // Update UI-connected flags (serializable booleans)
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
            BLE_STORE.deviceObj || device,
          );
        } else {
          await WriteRicDataToDevice(
            "0x0B",
            side,
            BLE_STORE.deviceObj || device,
          );
        }
      }

      // if (fitting.device_type === DEVICES.NECKBAND) {
      //     await WriteSafeBudsDataToDevice(
      //         side,
      //         BLE_STORE.deviceObj || device,
      //         {
      //             chunkSize: 100,
      //             interChunkDelayMs: 5,
      //             progressCallback: (pct) => console.log("progress", pct),
      //         }
      //     );
      // }

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
      // Notify parent with serializable data and BLE_STORE device object reference if they want it
      onConnectWithDevice(data, currentDeviceInfo);

      // Optionally perform initial writes (example: volume/mode)
      // Example: write leftVolume/rightVolume to device (uncomment & adapt if needed)
      // if (BLE_STORE.writeFun && side === "Left") {
      //     const payload = hexStringToUint8Array("01 02 ...");
      //     await BLE_STORE.writeFun.writeValue(payload);
      // }
    } catch (error) {
      console.error("Error:", error);
      setLoadingMessage(
        "Failed to connect: " + (error?.message || String(error)),
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
  useEffect(() => {
    if (BLE_STORE.BTEdisconnect) {
      disconnect(true);
      BLE_STORE.BTEdisconnect = false;
    }
  }, [BLE_STORE.BTEdisconnect]);
  // Electron modal handlers
  const handleDeviceSelected = (deviceId) => {
    setSelectingDeviceId(deviceId);
    // if (fitting.device_type === DEVICES.ITE_PRIME) {
    //   runClassicCheck({
    //     mac: deviceId,
    //     name: "safe",
    //   });
    // }
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

export default RicConnectDevice;
