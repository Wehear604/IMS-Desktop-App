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
  const { side, deviceObj, resolve, reject } = commandQueue.shift();

  try {
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;
    if (!device?.gatt?.connected) throw new Error("Device not connected");

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
      console.log(
        "Raw Notification Received:",
        bytes.map((b) => b.toString(16)).join(" "),
      );

      // Match the Documentation: Response starts with B0 21
      if (bytes[0] === 0xb0 && bytes[1] === 0x21) {
        const length = bytes[2];
        const name = String.fromCharCode(...bytes.slice(3, 3 + length));

        console.log("Parsed BLE Name:", name);

        // Cleanup
        characteristicRead.removeEventListener(
          "characteristicvaluechanged",
          onValueChanged,
        );
        isProcessing = false;
        resolve(name);
        processQueue(); // Process next item in queue
      }
    };

    characteristicRead.addEventListener(
      "characteristicvaluechanged",
      onValueChanged,
    );

    // --- THE MISSING STEP: SEND THE READ REQUEST ---
    // According to your doc: Byte 0: 0x21, Byte 1: 0x02 (Read)
    const readRequest = new Uint8Array([0x21, 0x02]);

    // OR if using the Query Configuration Status (0x30):
    // const readRequest = new Uint8Array([0x30, 0x03]);

    await characteristicWrite.writeValueWithResponse(readRequest);
    console.log("Read request sent: 21 02");
  } catch (error) {
    console.error(`Error reading data:`, error);
    isProcessing = false;
    reject(error);
    processQueue();
  }
};

const ReadBLEName = (command, side, deviceObj, dispatch) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({
      command,
      side,
      deviceObj,
      dispatch,
      resolve,
      reject,
    });
    processQueue();
  });
};

export default ReadBLEName;
