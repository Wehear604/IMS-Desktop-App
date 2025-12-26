import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  SERVICE_UUID,
} from "../../../utils/constants";

const commandQueue = [];
let isProcessing = false;
const tap = []

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

    if (type === "Tap") {
      await characteristicRead.startNotifications();

      const onValueChanged = (event) => {
        const value = event.target.value;
        const bytes = Array.from(new Uint8Array(value.buffer));

        if (bytes[0] !== 0x50) return;

        const decoded = {
          raw: bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "),
          device:
            bytes[1] === 0x01
              ? "Left"
              : bytes[1] === 0x02
              ? "Right"
              : "Unknown",
          event:
            bytes[2] === 0x01
              ? "Single Tap"
              : bytes[2] === 0x02
              ? "Double Tap"
              : bytes[2] === 0x03
              ? "Triple Tap"
              : bytes[2] === 0x04
              ? "Long Press"
              : "Unknown",
          action:
            bytes[3] === 0x01
              ? "Play/Pause"
              : bytes[3] === 0x02
              ? "Voice Assistant"
              : bytes[3] === 0x03
              ? "Volume Up"
              : bytes[3] === 0x04
              ? "Volume Down"
              : bytes[3] === 0x05
              ? "Next Track"
              : bytes[3] === 0x06
              ? "Previous Track"
              : "No Action",
        };

        console.log("Tap Notification:", decoded);
        tap.push(decoded);
      };

      characteristicRead.addEventListener(
        "characteristicvaluechanged",
        onValueChanged
      );

      resolve(true);
      isProcessing = false;
      processQueue();
      return;
    }
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
    isProcessing = false;
    processQueue();
  }
};

const Read = (command, side, deviceObj, type) => {
  const promise = new Promise((resolve, reject) => {
    commandQueue.push({ command, side, deviceObj, type, resolve, reject });
    processQueue();
  });

  return {
    promise,
    tap,
  };
};

export default Read;
