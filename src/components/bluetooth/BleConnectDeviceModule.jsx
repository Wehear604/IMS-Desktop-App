import {
  Button,
  CircularProgress,
  Typography,
  Paper,
  Modal,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  LISTENING_SIDE,
  MANUFACTURER_IDENTIFIER,
  SERVICE_UUID,
} from "../../utils/constants";
import { findObjectKeyByValue } from "../../utils/main";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { Bluetooth } from "@mui/icons-material";
import { DeviceMACAction } from "../../store/actions/deviceDataAction";
import { use } from "react";
import { BLE_STORE } from "../../utils/bleStore";

// Style for the modal
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
let controlCharacteristic = null;

const BleConnectDeviceModule = ({
  onEnableChange = (val) => {},
  onLoadingChange = (loader, messages) => {},
  onConnectWithDevice = (hardwareData, deviceInformation, disconnectFun) => {},
  onDisconnect = () => {},
  onWriteFunctionEnabled = (fun) => {},
  // onEqCharacteristicChange = ()=>{},
  Component,
  fitting,
}) => {
  const dispatch = useDispatch();
  const [connected, setConnected] = useState();
  const [loading, setLoading] = useState(true);
  const [deviceObj, setDeviceObj] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
  const [device, setDevices] = useState(null);
  const [selectingDeviceId, setSelectingDeviceId] = useState(null);
  const [deviceFunctions, setDeviceFunctions] = useState(null);
  const [data, setData] = useState(null); // This was `readData` in App.js
  const [deviceList, setDeviceList] = useState([]);
  // console.log("first deviceFunctions", deviceFunctions)
  useEffect(() => {
    onWriteFunctionEnabled(deviceFunctions);
  }, [deviceFunctions]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onBluetoothDeviceList((devices) => {
        setDeviceList(devices);
      });

      window.electronAPI.onBluetoothPairingRequest((details) => {
        const response = {};
        switch (details.pairingKind) {
          case "confirm":
            response.confirmed = window.confirm(
              `Do you want to connect to device ${details.deviceId}?`
            );
            break;
          case "confirmPin":
            response.confirmed = window.confirm(
              `Does the pin ${details.pin} match the pin on device ${details.deviceId}?`
            );
            break;
          case "providePin":
            const pin = window.prompt(
              `Please provide a pin for ${details.deviceId}.`
            );
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
        window.electronAPI.bluetoothPairingResponse(response);
      });
    } else {
      console.warn(
        "electronAPI is not available. Running in a standard browser."
      );
    }
  }, []);

  useEffect(() => {
    const checkBluetooth = async () => {
      setLoading(false);
    };
    checkBluetooth();
  }, []);

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
    setDeviceFunctions({
      // This was `setWriteFunction`
      readData: async () => {
        return await readAndDecodeData(characteristic);
      },
      writeData: async (arr_to_be_write) => {
        console.log("writeData called with:", arr_to_be_write);
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

  const connectDevice = async () => {
    try {
      setLoading(true);
      console.log("Requesting Bluetooth Device...");

      const serviceUUid = "e093f3b5-00a3-a9e5-9eca-40016e0edc24";

      // FIX: Filter by services, not manufacturerData
      const device = await navigator.bluetooth
        .requestDevice({
          filters: [
            { manufacturerData: [{ companyIdentifier: parseInt("0x0362") }] },
          ],
          optionalServices: [serviceUUid],
        })
        .catch((e) => {});
      // FIX: Removed the .catch() block here

      if (!device) {
        setLoading(false);
        return;
      }

      if (
        (fitting.device_side === LISTENING_SIDE.LEFT &&
          !device.name.endsWith("L")) ||
        (fitting.device_side === LISTENING_SIDE.RIGHT &&
          !device.name.endsWith("R"))
      ) {
        const side = findObjectKeyByValue(fitting.device_side, LISTENING_SIDE);
        dispatch(
          callSnackBar(
            `Please connect the ${side} side device `,
            SNACK_BAR_VARIETNS.error
          )
        );
        setLoading(false);
        return;
      }

      setDeviceInfo({ name: device.name, id: device.id });
      device.ongattserverdisconnected = () => disconnect(false); // Pass 'false'
      setDeviceObj(device);

      console.log("Connecting to GATT Server...", device);
      const server = await device.gatt.connect();
      console.log("GATT Server connected:", server);
      const service = await server.getPrimaryService(serviceUUid);
      console.log("Primary service:", service);

      const characteristics = await service.getCharacteristics();
      controlCharacteristic = await service.getCharacteristic(
        "e093f3b5-00a3-a9e5-9eca-40036e0edc24"
      );

      for (const characteristic of characteristics) {
        switch (characteristic.uuid) {
          case window.BluetoothUUID.getCharacteristic("gap.device_name"):
            await readDeviceNameValue(characteristic);
            break;
          case "e093f3b5-00a3-a9e5-9eca-40036e0edc24": // Your specific characteristic
            await readAppearanceValue(characteristic);
            break;
          default:
            break;
        }
      }
      setConnected(true);
      setLoading(false);
    } catch (e) {
      console.error("BLE Connection Failed:", e);
      setLoading(false);
    }
  };

  const disconnect = (isButtonPress) => {
    setSelectingDeviceId(null);
    dispatch(DeviceMACAction(null));
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
    setDevices(null);
    onDisconnect();
    // setCharacteristics(null);
    setData(null);
    setDeviceFunctions(null);
    BLE_STORE.BTEdisconnect = false;
  };
  // --- Handlers for Modal (from App.js) ---
  const handleDeviceSelected = (deviceId) => {
    // setIsPickerOpen(true);
    setSelectingDeviceId(deviceId);
    dispatch(DeviceMACAction(deviceId));
    if (window.electronAPI) {
      window.electronAPI.selectBluetoothDevice(deviceId);
    }
    console.log("object conection done", deviceId);
  };

  const handleCancelSelect = () => {
    // setIsPickerOpen(false);
    setSelectingDeviceId(null);
    dispatch(DeviceMACAction(null));
    if (window.electronAPI) {
      window.electronAPI.cancelBluetoothRequest();
    }
  };

  useEffect(() => {
    if (BLE_STORE.BTEdisconnect) {
      disconnect(true);
    }
  }, [BLE_STORE.BTEdisconnect]);
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
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
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
                    {isLoading ? <CircularProgress size={24} /> : <Bluetooth />}
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
