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
      CHARACTERISTIC_UUID_WRITE,
    );
    const characteristicRead = await service.getCharacteristic(
      CHARACTERISTIC_UUID_READ,
    );

    await characteristicRead.startNotifications();

    function stringToHexWithSpaces(str) {
      return Array.from(str)
        .map((char) =>
          char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
        )
        .join(" ");
    }

    function stringToHexWithSpaces1(str) {
      return Array.from(str)
        .map((char) =>
          char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
        )
        .join(" ");
    }

    function stringLengthHex(str) {
      return str.length.toString(16).toUpperCase().padStart(2, "0");
    }

    const devicename = type == "bleWrite" ? "WeHear" : "SafeBuds";

    function buildNameCommands(name) {
      const lengthHex = stringLengthHex(name);
      const asciiHexValues = stringToHexWithSpaces(name);

      const classic = `20 ${lengthHex} ${asciiHexValues}`;
      const ble = `21 01 ${lengthHex} ${asciiHexValues}`;

      return { classic, ble };
    }
    function buildNameCommands1(name) {
      const lengthHex = "02";
      const asciiHexValues = stringToHexWithSpaces1(name);

      const versionUpdateCommand = `60 01 ${lengthHex} ${asciiHexValues}`;

      return { versionUpdateCommand };
    }

    async function sendHexCommand(characteristic, command) {
      const bytes = command
        .split(" ")
        .map((byte) => parseInt(byte, 16))
        .filter((byte) => !isNaN(byte));

      if (!bytes.length) throw new Error("Invalid command format");

      const buffer = new Uint8Array(bytes);
      await characteristic.writeValue(buffer);
    }

    const version = "V1";
    const { classic, ble } = buildNameCommands(devicename);
    const { versionUpdateCommand } = buildNameCommands1(version);

    await sendHexCommand(characteristicWrite, classic);

    await sendHexCommand(characteristicWrite, ble);
    resolve(true);
    console.log("versionUpdateCommand", versionUpdateCommand);
    // await sendHexCommand(characteristicWrite, versionUpdateCommand);
    // }
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
    isProcessing = false;
    processQueue();
  }
};

const WriteBleName = (command, side, deviceObj, type) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({ command, side, deviceObj, type, resolve, reject });
    processQueue();
  });
};

export default WriteBleName;
