import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  CircularProgress,
  Typography,
  Divider,
  Slider,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  LISTENING_SIDE,
  MANUFACTURER_IDENTIFIER,
  SERVICE_UUID,
} from "../../utils/patient.constants";
import {
  disconnectRicDevice,
  readBatteryLevel,
  readEqualizer,
  readMode,
  readNoiseReduction,
} from "../../store/actions/ricFittingActions";
import { useDispatch, useSelector } from "react-redux";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import loadingGifLeft from "../../assets/images/Left Hearing aid V3_optimized.gif";
import loadingGifRight from "../../assets/images/Right Hearing aid V3_optimized.gif";
import { closeModal, openModal } from "../../store/actions/modalAction";
import CustomDialog from "../layouts/common/CustomDialog";
import { connectIteSecondDevice } from "../../store/actions/ricFittingActions";
import { connectDevice } from "../../store/actions/fittingAction";

const hexStringToUint8Array = (hexString) => {
  const bytes = hexString
    .trim()
    .split(" ")
    .map((byte) => parseInt(byte, 16));
  return new Uint8Array(bytes);
};

const writeDataToCharacteristic = async (characteristic, data) => {
  try {
    const value = hexStringToUint8Array(data);

    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(value);
    } else if (characteristic.properties.write) {
      await characteristic.writeValue(value);
    } else {
      console.error(
        "Characteristic does not support write or write without response"
      );
    }
  } catch (error) {
    console.error("Failed to write data to characteristic:", error);
  }
};

const RicConnectDevice = ({
  side,
  onConnectWithDevice,
  Component,
  onEnableChange,
  onDisconnect = () => {},
  fitting,
  fetchingData,
  setIsConnecting,
}) => {
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
  const [leftMode, setLeftMode] = useState(null);
  const [rightMode, setRightMode] = useState(null);
  const [leftNoiseReductionEnabled, setLeftNoiseReductionEnabled] =
    useState(false);
  const [rightNoiseReductionEnabled, setRightNoiseReductionEnabled] =
    useState(false);
  const [leftFeedBackCancellationEnabled, setLeftFeedBackCancellationEnabled] =
    useState(false);
  const [
    rightFeedBackCancellationEnabled,
    setRightFeedBackCancellationEnabled,
  ] = useState(false);
  const [data, setData] = useState([]);
  const [connected, setConnected] = useState();
  const [enabled, setEnabled] = useState(false);
  const dispatch = useDispatch();

  const { ricLeftFitting, ricRightFitting } = useSelector((state) => state);

  const connectDeviceFun = async (e) => {
    e.preventDefault();
    dispatch(closeModal("instruction"));
    try {
      setLoadingMessage("Connecting Device...");
      setLoading(true);
      setIsConnecting(true);

      // const serviceUuid = "0000fff0-0000-1000-8000-00805f9b34fb";

      const serviceUuid =
        side == "Left"
          ? SERVICE_UUID[ricLeftFitting.device_type]
          : SERVICE_UUID[ricRightFitting.device_type];

      const characteristicUuidReadNotify =
        side == "Left"
          ? CHARACTERISTIC_UUID_READ_NOTIFY[ricLeftFitting.device_type]
          : CHARACTERISTIC_UUID_READ_NOTIFY[ricRightFitting.device_type];

      const characteristicUuidReadWrite =
        side == "Left"
          ? CHARACTERISTIC_UUID_READ_WRITE[ricLeftFitting.device_type]
          : CHARACTERISTIC_UUID_READ_WRITE[ricRightFitting.device_type];

      //RIC
      // const characteristicUuidReadNotify =
      //   "0000fff1-0000-1000-8000-00805f9b34fb";
      // const characteristicUuidReadWrite =
      //   "0000fff2-0000-1000-8000-00805f9b34fb";

      //ITE
      // const characteristicUuidReadNotify =
      //   "e49a28e1-f69a-11e8-8eb2-f2801f1b9fd1";
      // const characteristicUuidReadWrite =
      //   "e49a25e0-f69a-11e8-8eb2-f2801f1b9fd1";

      const filterData = {};

      const filter =
        side == "Left"
          ? {
              manufacturerData: [
                {
                  companyIdentifier:
                    parseInt(
                      MANUFACTURER_IDENTIFIER[ricLeftFitting.device_type]
                    ) ?? null,
                },
              ],
            }
          : {
              manufacturerData: [
                {
                  companyIdentifier:
                    parseInt(
                      MANUFACTURER_IDENTIFIER[ricRightFitting.device_type]
                    ) ?? null,
                },
              ],
            };

      if (filter.manufacturerData[0].companyIdentifier) {
        filterData.filters = [filter];
      } else {
        filterData.acceptAllDevices = true;
      }

      //manufacture id is required for the filter to work properly

      console.log("this is serviceUuid", serviceUuid);

      const device = await navigator.bluetooth
        .requestDevice({
          // // filters: [filter],
          // acceptAllDevices: true,
          ...filterData,
          optionalServices: [serviceUuid],
        })

        .catch((e) => {
          console.error("Failed to request device:", e);
          setLoadingMessage(
            "Failed to connect: " + (e.message ?? "User cancelled the request")
          );
          setLoading(false);
          setIsConnecting(false);
          return null;
        });

      if (!device) {
        setLoadingMessage("No device selected.");
        setLoading(false);
        setIsConnecting(false);
        return;
      }
      if (
        ((side == "Left" && ricLeftFitting.device_type == DEVICES.RIC_OPTIMA) ||
          (side == "Right" &&
            ricRightFitting.device_type == DEVICES.RIC_OPTIMA)) &&
        ((side === "Left" && !device.name.endsWith("L")) ||
          (side === "Right" && !device.name.endsWith("R")))
      ) {
        setLoadingMessage(
          `Please connect the correct device for the ${side} side.`
        );
        dispatch(
          callSnackBar(
            `Please connect the ${side} side device `,
            SNACK_BAR_VARIETNS.error
          )
        );
        setLoading(false);
        setIsConnecting(false);
        return;
      }

      // if (
      //   ricLeftFitting.device_type == DEVICES.RIC_OPTIMA_8 &&
      //   ((side === "Left" &&
      //     (device.name.charAt(device.name.length - 4) +
      //       device.name.charAt(device.name.length - 3)) %
      //       2 !=
      //       0) ||
      //     (side === "Right" &&
      //       (device.name.charAt(device.name.length - 4) +
      //         device.name.charAt(device.name.length - 3)) %
      //         2 ==
      //         0))
      // ) {
      //   setLoadingMessage(
      //     `Please connect the correct device for the ${side} side.`
      //   );
      //   dispatch(
      //     callSnackBar(
      //       `Please connect the ${side} side device `,
      //       SNACK_BAR_VARIETNS.error
      //     )
      //   );
      //   setLoading(false);
      setIsConnecting(false);
      //   return;
      // }

      const server = await device.gatt.connect();

      const service = await server
        .getPrimaryService(serviceUuid)
        .catch((error) => {
          console.error("Error getting service:", error);
          setLoadingMessage("Failed to connect: " + error.message);
        });
      const characteristicReadNotify = await service.getCharacteristic(
        characteristicUuidReadNotify
      );
      const characteristicReadWrite = await service.getCharacteristic(
        characteristicUuidReadWrite
      );

      let res = null;
      if (
        (side === "Left" && ricLeftFitting.device_type == DEVICES.ITE_PRIME) ||
        (side == "Right" && ricRightFitting.device_type == DEVICES.ITE_PRIME)
      ) {
        res = await connectIteSecondDevice(
          side == "Left" ? LISTENING_SIDE.LEFT : LISTENING_SIDE.RIGHT,
          device
        ); // Connect the second device if needed
      }

      console.log("Connection response:", res);

      if (res && !res?.status) {
        await device.gatt.disconnect();
        setLoadingMessage(
          `Please connect the correct device for the ${side} side.`
        );
        dispatch(
          callSnackBar(
            `Please connect the ${side} side device `,
            SNACK_BAR_VARIETNS.error
          )
        );
        setLoading(false);
        setIsConnecting(false);
        return;
      }

      // Log characteristic properties

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
      setIsConnecting(false);

      // Set device info and handle disconnection
      // setDeviceInfo({
      //   name: device.name,
      //   id: device.id,
      // });

      const currentDeviceInfo = {
        name: device.name,
        id: device.id,
      };
      setDeviceInfo(currentDeviceInfo);
      device.ongattserverdisconnected = (error) => {
        if (side === "Left") {
          setLeftDeviceConnected(false);
          console.log("Disconnected left device");
          dispatch(disconnectRicDevice(LISTENING_SIDE.LEFT));
        } else {
          console.log("Disconnected right device");
          setRightDeviceConnected(false);
          dispatch(disconnectRicDevice(LISTENING_SIDE.RIGHT));
        }
        setLoadingMessage("Device disconnected");
      };
      setDeviceObj(device);

      if (
        res?.code == 192 ||
        res?.code == 193 ||
        (side === "Left" && ricLeftFitting.device_type == DEVICES.NECKBAND) ||
        (side == "Right" && ricRightFitting.device_type == DEVICES.NECKBAND)
      ) {
        console.log("Connecting with second device...");
        dispatch(
          connectDevice(
            data,
            currentDeviceInfo, // deviceInfo,
            device,
            () => disconnect(side == "Left" ? "Right" : "Left"),
            side == "Left" ? LISTENING_SIDE.RIGHT : LISTENING_SIDE.LEFT,
            ricRightFitting.device_type
          )
        );
      }

      onConnectWithDevice(data, currentDeviceInfo, device, () =>
        disconnect(side)
      ); // Pass disconnect function
      // onConnectWithDevice(data, deviceInfo, device, () => disconnect(side)); // Pass disconnect function

      let setFullVolumeData;
      if (side === "Left") {
        setFullVolumeData = "83 03 01 00 05";
      } else {
        setFullVolumeData = "83 03 02 00 05";
      }
      await writeDataToCharacteristic(
        characteristicReadWrite,
        setFullVolumeData
      );

      let setModeData;
      if (side === "Left") {
        if (
          ricLeftFitting.device_type == DEVICES.ITE_PRIME ||
          ricLeftFitting.device_type == DEVICES.NECKBAND
        ) {
          setModeData = "0x82 0x05 0x01 0x00";
        } else {
          setModeData = "85 03 01 00 01";
        }
      } else {
        if (
          ricLeftFitting.device_type == DEVICES.ITE_PRIME ||
          ricLeftFitting.device_type == DEVICES.NECKBAND
        ) {
          setModeData = "0x82 0x05 0x01 0x00`";
        } else {
          setModeData = "85 03 02 00 01";
        }
      }
      await writeDataToCharacteristic(characteristicReadWrite, setModeData);

      // let setNoiseReductionOn;
      // if (side === "Left") {
      //   setNoiseReductionOn = '87 03 01 00 01';
      // } else {
      //   setNoiseReductionOn = '87 03 02 00 01';
      // }
      // await writeDataToCharacteristic(characteristicReadWrite, setNoiseReductionOn);
    } catch (error) {
      console.error("Error:", error);
      setLoadingMessage("Failed to connect: " + error.message);
      setLoading(false);
      setIsConnecting(false);
      if (side === "Left") {
        setLeftDeviceConnected(false);
      } else {
        setRightDeviceConnected(false);
      }
    }
  };

  const RicConnectionInstruction = () => {
    return (
      <CustomDialog
        id={"instruction"}
        loading={false}
        title={`Connection Instruction`}
        // closeText="Cancel"
        // onCancel={() => {
        //   dispatch(closeModal("instruction"));
        // }}
        hideClose={true}
        onSubmit={(e) => {
          connectDeviceFun(e);
        }}
        confirmText="Connect"
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <img
            src={side == "Left" ? loadingGifLeft : loadingGifRight}
            alt="Connecting..."
            style={{ maxWidth: "100%", maxHeight: "400px" }}
          />
        </Box>
      </CustomDialog>
    );
  };

  // useEffect(() => {
  //   if (deviceObj) {
  //     dispatch(readNoiseReduction(LISTENING_SIDE.LEFT, deviceObj));
  //     dispatch(readNoiseReduction(LISTENING_SIDE.RIGHT, deviceObj));
  //   }
  // }, [deviceObj]); // Only run when deviceObj changes

  // ...existing code...
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
    setConnected(false); // Ensure connected state is updated
    setDeviceInfo({});
    setDeviceObj(null);
    setLoadingMessage("");
    onDisconnect(); // Call the onDisconnect callback to update the parent component
  };

  useEffect(() => {
    if (window.navigator && window.navigator.bluetooth) {
      setLoading(false);
      setIsConnecting(false);
      setLoadingMessage("");
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    // if (!loading)
    onEnableChange(enabled);
  }, [enabled]);

  const handleLeftVolumeChange = async (event, newValue) => {
    setLeftVolume(newValue);
    if (leftDeviceCharacteristic) {
      const volumeHex = newValue.toString(16).padStart(2, "0");
      const data = `83 03 01 ${volumeHex} 03`;
      await writeDataToCharacteristic(leftDeviceCharacteristic, data);
    }
  };

  const handleRightVolumeChange = async (event, newValue) => {
    setRightVolume(newValue);
    if (rightDeviceCharacteristic) {
      const volumeHex = newValue.toString(16).padStart(2, "0");
      const data = `83 03 02 ${volumeHex} 03`;
      await writeDataToCharacteristic(rightDeviceCharacteristic, data);
    }
  };
  useEffect(() => {
    if (connected && deviceInfo.id != "")
      onConnectWithDevice(data, deviceInfo, deviceObj, () => disconnect(true));
  }, [connected]);

  useEffect(() => {
    if (fitting.device_side === side && fitting.disconnect) {
      disconnect(side);
    }
  }, [fitting.disconnect]);

  const onConnect = (e) => {
    if (
      fitting.device_type == DEVICES.RIC_OPTIMA_8 &&
      ((side == "Left" && !ricRightFitting.connected) ||
        (side == "Right" && !ricLeftFitting.connected))
    ) {
      dispatch(
        openModal(<RicConnectionInstruction />, "md", true, "instruction")
      );
    } else {
      connectDeviceFun(e);
    }
  };

  return (
    <Component
      loading={loading}
      connected={side === "Left" ? leftDeviceConnected : rightDeviceConnected}
      onClick={onConnect}
      disconnect={() => disconnect(side)}
      deviceSide={fitting?.device_side}
      fetchingData={fetchingData}
    />
  );
};

export default RicConnectDevice;
