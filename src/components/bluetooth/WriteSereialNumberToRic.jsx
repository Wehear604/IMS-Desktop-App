const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID_WRITE = "0000fff2-0000-1000-8000-00805f9b34fb";
// ASSUMPTION: fff1 is the notify characteristic (common with fff0/fff2 pairs).
// Confirm with your friend / the device docs.
const CHARACTERISTIC_UUID_NOTIFY = "0000fff1-0000-1000-8000-00805f9b34fb";

const encoder = new TextEncoder(); // UTF-8, same as getBytes(UTF8)
const decoder = new TextDecoder("utf-8");

const commandQueue = [];
let isProcessing = false;

const toHex = (bytes) =>
  Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join("-");

const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) return;
  isProcessing = true;

  const { sn, side, deviceObj, resolve, reject } = commandQueue.shift();

  let characteristicNotify;
  let onNotify;

  try {
    if (!deviceObj) throw new Error(`deviceObj is undefined for ${side}`);

    // Extract device safely
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;

    console.log("device", device);
    console.log("device gatt", device.gatt);

    if (!device || !device.gatt)
      throw new Error("No valid Bluetooth device found!!!!");

    const service = await device.gatt.getPrimaryService(SERVICE_UUID);
    const characteristicWrite = await service.getCharacteristic(
      CHARACTERISTIC_UUID_WRITE,
    );
    characteristicNotify = await service.getCharacteristic(
      CHARACTERISTIC_UUID_NOTIFY,
    );

    // Wait for device reply, e.g. 3C-73-6E-3D-30-30-31-3E-00-00-00-00-3E -> "<sn=001>"
    const responsePromise = new Promise((res, rej) => {
      const timer = setTimeout(
        () => rej(new Error("No response from device")),
        5000,
      );
      onNotify = (event) => {
        clearTimeout(timer);
        const bytes = new Uint8Array(event.target.value.buffer);
        console.log(`Raw response (${side}):`, toHex(bytes));
        // strip 0x00 padding
        res(decoder.decode(bytes).replace(/\0/g, ""));
      };
      characteristicNotify.addEventListener(
        "characteristicvaluechanged",
        onNotify,
      );
    });

    await characteristicNotify.startNotifications();

    // Same as Java: String.format("<ST_SN=%s>", sn) -> getBytes(UTF8)
    const command = `<ST_SN=${sn}>`;
    console.log(`Writing to ${side} device:`, command);
    await characteristicWrite.writeValue(new TextEncoder().encode(command));
    const responseText = await responsePromise;
    console.log("first", responseText);
    resolve(responseText);
  } catch (error) {
    console.error(`Error writing SN to ${side} device:`, error);
    reject(error);
  } finally {
    if (characteristicNotify && onNotify) {
      characteristicNotify.removeEventListener(
        "characteristicvaluechanged",
        onNotify,
      );
    }
    isProcessing = false;
    processQueue();
  }
};

const WriteSnToDevice = (sn, side, deviceObj) =>
  new Promise((resolve, reject) => {
    commandQueue.push({ sn, side, deviceObj, resolve, reject });
    processQueue();
  });

export default WriteSnToDevice;
