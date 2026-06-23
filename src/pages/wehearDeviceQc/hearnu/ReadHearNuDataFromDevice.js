import {
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  SERVICE_UUID,
} from "../../../utils/constants";

const hearNuCommandQueue = [];
let hearNuIsProcessing = false;

const processHearNuQueue = async () => {
  if (hearNuIsProcessing || hearNuCommandQueue.length === 0) return;

  hearNuIsProcessing = true;
  const { command, side, deviceObj, resolve, reject } =
    hearNuCommandQueue.shift();

  try {
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;

    if (!device || !device.gatt) {
      throw new Error("No valid Bluetooth device found!");
    }

    const SERVICE_UUId = SERVICE_UUID[DEVICES.HEAR_NU];
    const WRITE_CHAR_UUId = CHARACTERISTIC_UUID_READ_WRITE[DEVICES.HEAR_NU];
    const NOTIFY_CHAR_UUId = CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.HEAR_NU];

    if (!SERVICE_UUId || !WRITE_CHAR_UUId || !NOTIFY_CHAR_UUId) {
      throw new Error(
        "HEAR_NU UUIDs are not configured in constants.js. Please set SERVICE_UUID and CHARACTERISTIC_UUID entries for DEVICES.HEAR_NU.",
      );
    }

    const service = await device.gatt.getPrimaryService(SERVICE_UUId);
    const characteristicWrite =
      await service.getCharacteristic(WRITE_CHAR_UUId);
    const characteristicNotify =
      await service.getCharacteristic(NOTIFY_CHAR_UUId);

    await characteristicNotify.startNotifications();

    if (!Array.isArray(command) || command.length === 0) {
      throw new Error(
        "Invalid command format for HearNu (provide Uint8 array of bytes)",
      );
    }

    const dataBuffer = new Uint8Array(command);

    // 1. Set up the listener for the hardware's response
    const onValueChanged = (event) => {
      const value = event.target.value;
      const decodedValue = new Uint8Array(value.buffer);

      characteristicNotify.removeEventListener(
        "characteristicvaluechanged",
        onValueChanged,
      );
      resolve(decodedValue);

      hearNuIsProcessing = false;
      processHearNuQueue();
    };

    characteristicNotify.addEventListener(
      "characteristicvaluechanged",
      onValueChanged,
    );

    // 2. Write the command to the device (dynamically handling response reqs)
    if (characteristicWrite.properties.write) {
      await characteristicWrite.writeValue(dataBuffer);
    } else {
      await characteristicWrite.writeValueWithoutResponse(dataBuffer);
    }

    // 3. Set a safety timeout in case the device doesn't respond
    setTimeout(() => {
      try {
        characteristicNotify.removeEventListener(
          "characteristicvaluechanged",
          onValueChanged,
        );
      } catch (e) {}
      reject(
        new Error(`Timeout waiting for response from ${side} HearNu device`),
      );

      hearNuIsProcessing = false;
      processHearNuQueue();
    }, 5000);
  } catch (error) {
    console.error(`Error reading data from HearNu device:`, error);
    reject(error);
    hearNuIsProcessing = false;
    processHearNuQueue();
  }
};

const ReadHearNuDataFromDevice = (command, side, deviceObj) => {
  return new Promise((resolve, reject) => {
    hearNuCommandQueue.push({ command, side, deviceObj, resolve, reject });
    processHearNuQueue();
  });
};

export default ReadHearNuDataFromDevice;
