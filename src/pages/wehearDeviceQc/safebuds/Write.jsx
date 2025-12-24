import { Devices } from "@mui/icons-material";
import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  SERVICE_UUID,
} from "../../../utils/constants";

const commandQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) return;

  isProcessing = true;
  const { command, side, deviceObj, type, resolve, reject } =
    commandQueue.shift();

  try {
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;

    if (!device || !device.gatt) {
      throw new Error("No valid Bluetooth device found!");
    }

    const serviceUuid = SERVICE_UUID[DEVICES.SAFE_BUDS];

    const CHARACTERISTIC_UUID_WRITE =
      CHARACTERISTIC_UUID_READ_WRITE[DEVICES.SAFE_BUDS];

    const CHARACTERISTIC_UUID_READ =
      CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.SAFE_BUDS];

    const service = await device.gatt.getPrimaryService(serviceUuid);
    const characteristicWrite = await service.getCharacteristic(
      CHARACTERISTIC_UUID_WRITE
    );
    const characteristicRead = await service.getCharacteristic(
      CHARACTERISTIC_UUID_READ
    );

    await characteristicRead.startNotifications();

    function stringToHexWithSpaces(str) {
      return Array.from(str)
        .map((char) =>
          char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")
        )
        .join(" ");
    }

    function stringLengthHex(str) {
      return str.length.toString(16).toUpperCase().padStart(2, "0");
    }

    const devicename = "SafeBuds";
    let commands;
    console.log("first type", type);
    if (type === "NameChange") {
      console.log("iscdncds");
      const lengthHex = stringLengthHex(devicename);
      const asciiHexValues = stringToHexWithSpaces(devicename);

      commands = `20 ${lengthHex} ${asciiHexValues}`;
    }

    console.log(commands);

    const dataArray = commands
      .split(" ")
      .map((byte) => parseInt(byte, 16))
      .filter((byte) => !isNaN(byte));
    if (dataArray.length === 0) {
      throw new Error("Invalid command format");
    }

    const dataBuffer = new Uint8Array(dataArray);

    await characteristicWrite.writeValue(dataBuffer);
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
    isProcessing = false;
    processQueue();
  }
};

const Write = (command, side, deviceObj, type) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({ command, side, deviceObj, type, resolve, reject });
    processQueue();
  });
};

export default Write;
