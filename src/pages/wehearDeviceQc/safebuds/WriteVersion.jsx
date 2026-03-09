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
  const { command, side, deviceObj, type, currentVersion, resolve, reject } =
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
    function buildNameCommands1(name) {
      const lengthHex = stringLengthHex(name);
      const asciiHexValues = stringToHexWithSpaces1(name);
      const versionUpdateCommand = `60 01 ${lengthHex} ${asciiHexValues} 00`;
      console.log("Write command for versionUpdate", versionUpdateCommand);
      return { versionUpdateCommand };
    }

    async function sendHexCommand(characteristic, command) {
      const bytes = command
        .split(" ")
        .map((byte) => parseInt(byte, 16))
        .filter((byte) => !isNaN(byte));

      if (!bytes.length) throw new Error("Invalid command format");

      await characteristic.writeValue(new Uint8Array(bytes));
    }

    const version =currentVersion ;
    console.log("version of latest",version);

    const { versionUpdateCommand } = buildNameCommands1(version);

    await sendHexCommand(characteristicWrite, versionUpdateCommand);

    resolve(version);
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
  } finally {
    isProcessing = false;
    processQueue(); // process next queued command
  }
};

const WriteVersion = (command, side, deviceObj, type, currentVersion) => {
  console.log("deviceObj", deviceObj);
  return new Promise((resolve, reject) => {
    commandQueue.push({
      command,
      side,
      deviceObj,
      type,
      currentVersion,
      resolve,
      reject,
    });
    processQueue();
  });
};

export default WriteVersion;
