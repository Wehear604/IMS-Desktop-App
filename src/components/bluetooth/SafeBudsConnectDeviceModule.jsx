// SafeBudsConnectDeviceModule.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { callSnackBar } from "../../store/actions/snackbarAction";
import {
  DeviceIsConnectingAction,
  DeviceMACAction,
  DeviceVersionAction,
  disconnectAction,
  SetDeviceFOT,
  SetDevicVersionFOT,
} from "../../store/actions/deviceDataAction";
import WriteRicDataToDevice from "./WriteRicDataToDevice";
import {
  SafeBudsBLEDeviceName,
  SafeBudsBleRead,
  SafeBudsDeviceName,
  SafeBudsVersionRead,
} from "../../store/actions/deviceQcAction";
import ReadBLEName from "../../pages/wehearDeviceQc/safebuds/ReadBLEName";
import { fetchQcMacCheckByIdApi } from "../../apis/qcmac.api";
import { callApiAction } from "../../store/actions/commonAction";
import { runClassicCheck } from "../../utils/classicSocket";
import { CenteredBox } from "../layouts/OneViewBox";
import VersionCheckingLoader from "../../utils/customeloader";
import { SetStepAction } from "../../store/actions/stepAction";
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
  const [loading1, setLoading1] = useState(false);
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
  const selectingDeviceId1 = useRef(null);
  const getMacId = useRef(null);
  const devicedata = useSelector((state) => state.device);

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
      // dispatch(DeviceMACAction(null));
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

      const filters = [];
      const manufacturerIdA = parseInt(MANUFACTURER_IDENTIFIER[50]);
      const manufacturerIdC = parseInt(
        MANUFACTURER_IDENTIFIER[DEVICES.SAFE_BUDS],
      );
      const manufacturerIdB = parseInt(
        MANUFACTURER_IDENTIFIER[fitting.device_type],
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
        filters.push({
          manufacturerData: [{ companyIdentifier: manufacturerIdC }],
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
        BLE_STORE.BTEdisconnect = true;
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

      BLE_STORE.deviceObj = device;
      BLE_STORE.writeFun = characteristicReadWrite;
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
                console.log("object next", next);
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

      setConnected(true);

      setLoadingMessage("Device connected successfully");
      dispatch(DeviceIsConnectingAction(false));

      const currentDeviceInfo = { name: device.name, id: device.id };
      setDeviceInfo(currentDeviceInfo);

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
      console.log(
        " getMacId.current?.currentversion",
        getMacId.current?.currentversion,
      );
      const currentVersion = await dispatch(
        SafeBudsVersionRead({
          type: "SafeBudsVersionRead",
          isVersionRead: false,
          latestVersion: getMacId.current?.currentversion,
        }),
      );
      // dispatch(
      //   DeviceVersionAction(currentVersion, getMacId.current?.currentversion),
      // );
      const checkistrue =
        Number(currentVersion[1]) < Number(getMacId.current?.currentversion[1])
          ? getMacId.current?.version !== getMacId.current?.currentversion
          : Number(currentVersion[1])
            ? Number(currentVersion[1]) <
              Number(getMacId.current?.currentversion[1])
            : getMacId.current?.version !== getMacId.current?.currentversion;
      if (checkistrue) {
        try {
          try {
            if (BLE_STORE.deviceObj?.gatt?.connected) {
              BLE_STORE.deviceObj.gatt.disconnect();
              BLE_STORE.BTEdisconnect = true;
            }
          } catch (err) {}
          setLoadingMessage("Connecting Device...");
          setLoading(true);
          dispatch(DeviceIsConnectingAction(true));

          const targetId = selectingDeviceId1.current;

          if (window.electronAPI) {
            window.electronAPI.selectBluetoothDevice(targetId);
          }
          dispatch(SetDevicVersionFOT(false));

          dispatch(SetStepAction(0));

          const serviceUuid = "0000ff12-0000-1000-8000-00805f9b34fb";
          const UUID_SVC = "0000ff12-0000-1000-8000-00805f9b34fb";
          const UUID_IN = "0000ff14-0000-1000-8000-00805f9b34fb";
          const UUID_OUT = "0000ff15-0000-1000-8000-00805f9b34fb";

          const filters = [];
          const manufacturerIdA = parseInt(MANUFACTURER_IDENTIFIER[50]);
          const manufacturerIdC = parseInt(MANUFACTURER_IDENTIFIER[51]);
          const manufacturerIdB = parseInt(
            MANUFACTURER_IDENTIFIER[fitting.device_type],
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
            filters.push({
              manufacturerData: [{ companyIdentifier: manufacturerIdC }],
            });
          }

          const filterData =
            filters.length > 0 ? { filters } : { acceptAllDevices: true };

          // --- DEVICE RETRIEVAL ---
          let device;

          if (
            navigator.bluetooth &&
            typeof navigator.bluetooth.getDevices === "function"
          ) {
            const devices = await navigator.bluetooth.getDevices();
            device = devices.find((d) => d.id === targetId);
          }

          if (!device) {
            console.log("Requesting device...");
            // Do NOT put 'await wait(5000)' here! It breaks the security context.
            device = await navigator.bluetooth.requestDevice({
              ...filterData,
              optionalServices: [serviceUuid, UUID_SVC, UUID_IN, UUID_OUT],
            });
          }

          if (!device) throw new Error("No device selected.");

          const server = await device.gatt.connect();
          const svc = await server.getPrimaryService(UUID_SVC);
          const chIn = await svc.getCharacteristic(UUID_IN);
          const chOut = await svc.getCharacteristic(UUID_OUT);

          SAFE_BUDS_STORE.device = device;
          SAFE_BUDS_STORE.server = server;
          SAFE_BUDS_STORE.svc = svc;
          SAFE_BUDS_STORE.chIn = chIn;
          SAFE_BUDS_STORE.chOut = chOut;

          BLE_STORE.deviceObj = device;
          BLE_STORE.disconnectFun = () => disconnect(side);
          BLE_STORE.hardwareData = data;

          if (side === "Left") setLeftDeviceConnected(true);
          else setRightDeviceConnected(true);

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
              BLE_STORE.deviceObj || device,
            );
            await WriteRicDataToDevice(
              "0x0B",
              side,
              BLE_STORE.deviceObj || device,
            );
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
          setLoading1(false);
          onConnectWithDevice(data, currentDeviceInfo);
        } catch (error) {
          BLE_STORE.BTEdisconnect = true;
          console.error("Error:", error);
          setLoadingMessage("Failed: " + (error?.message || String(error)));
          setLoading(false);
          dispatch(DeviceIsConnectingAction(false));
          if (side === "Left") setLeftDeviceConnected(false);
          else setRightDeviceConnected(false);
        }
      } else {
        setLoading(false);
        setLoading1(false);
        if (devicedata.fotfile1) {
          console.log("object fotfile1", devicedata?.fotfile1);
          dispatch(SetStepAction(2));
        } else {
          console.log("object step check", devicedata);

          dispatch(SetStepAction(0));
        }
        dispatch(SetDevicVersionFOT(true));
        onConnectWithDevice(data, currentDeviceInfo);
      }
    } catch (error) {
      BLE_STORE.BTEdisconnect = true;
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

  const handleDeviceSelected = (deviceId) => {
    dispatch(
      callApiAction(
        async () =>
          await fetchQcMacCheckByIdApi({
            mac: deviceId,
            device_type: DEVICES.SAFE_BUDS,
          }),
        async (response) => {
          getMacId.current = response;
          runClassicCheck({
            mac: deviceId,
            name: "safe",
          });
        },
        (err) => {
          console.log("first err", err);
        },
      ),
    );
    setSelectingDeviceId(deviceId);
    setLoading1(true);
    selectingDeviceId1.current = deviceId;
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
      <VersionCheckingLoader open={loading1} />
      <Component
        loading={loading}
        connected={side === "Left" ? leftDeviceConnected : rightDeviceConnected}
        onClick={(e) => connectDeviceFun(e)}
        disconnect={() => disconnect(side)}
        deviceSide={fitting?.device_side}
      />
      {!loading1 && (
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
      )}
    </>
  );
};

export default SafeBudsConnectDeviceModule;

// const VersionGet1 = await dispatch(
//   SafeBudsVersionRead({
//     type: "SafeBudsVersionRead",
//     isVersionRead: false,
//   }),
// );

// const bleNameRead = await dispatch(SafeBudsBleRead());
// let checkCondition =
//   bleNameRead === "SafeBuds" && String(VersionGet1).startsWith("V2")
//     ? false
//     : !String(VersionGet1).startsWith("V2")
//       ? bleNameRead === "WeHear"
//         ? false
//         : !String(VersionGet1).startsWith("V2")
//       : !String(VersionGet1).startsWith("V2");

// if (bleNameRead === "WeHear" && !String(VersionGet1).startsWith("V2")) {
//   checkCondition = true;
// }
// console.log("!String(VersionGet).startsWith", checkCondition);
