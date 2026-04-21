import {
  actions,
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  LISTENING_SIDE,
  SERVICE_UUID,
} from "../../../utils/constants";

const commandQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) return;

  isProcessing = true;
  const { side, deviceObj, type, resolve, reject } = commandQueue.shift();

  try {
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;
    if (!device?.gatt) throw new Error("No valid Bluetooth device found");

    const service = await device.gatt.getPrimaryService(
      SERVICE_UUID[DEVICES.SAFE_BUDS],
    );

    const characteristicWrite = await service.getCharacteristic(
      CHARACTERISTIC_UUID_READ_WRITE[DEVICES.SAFE_BUDS],
    );

    const characteristicRead = await service.getCharacteristic(
      CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.SAFE_BUDS],
    );

    await characteristicRead.startNotifications();
    const onValueChanged = (event) => {
      const bytes = Array.from(new Uint8Array(event.target.value.buffer));

      // ACK
      if (bytes[0] === 0xa0 && bytes[1] === 0x60) return;

      // READ RESPONSE
      if (bytes[0] === 0xb0 && bytes[1] === 0x60) {
        const length = bytes[2];
        const version = String.fromCharCode(...bytes.slice(3, 3 + length));

        console.log("📦 Stored version:", version);

        characteristicRead.removeEventListener(
          "characteristicvaluechanged",
          onValueChanged,
        );

        isProcessing = false;
        resolve(version);
        processQueue();
      }
    };

    characteristicRead.addEventListener(
      "characteristicvaluechanged",
      onValueChanged,
    );

    if (type === "SafeBudsVersionRead") {
      await characteristicWrite.writeValue(new Uint8Array([0x60, 0x02]));
      isProcessing = false;
      resolve("V1");
      processQueue();
      console.log("first VersionRead", type, side);
    }
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    isProcessing = false;
    reject(error);
    processQueue();
  }
};

const ReadVersion = (command, side, deviceObj, type, dispatch) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({
      command,
      side,
      deviceObj,
      type,
      dispatch,
      resolve,
      reject,
    });
    processQueue();
  });
};

export default ReadVersion;
