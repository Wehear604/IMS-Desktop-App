const commandQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) return;

  isProcessing = true;
  const { command, side, deviceObj, resolve, reject } = commandQueue.shift();

  try {
    const device = deviceObj?.device?.device || deviceObj?.device || deviceObj;

    if (!device || !device.gatt) {
      throw new Error("No valid Bluetooth device found!");
    }

    const SERVICE_UUID = "0000fdc2-0000-1000-8000-00805f9b34fb";
    const CHARACTERISTIC_UUID_WRITE = "e49a25e0-f69a-11e8-8eb2-f2801f1b9fd1";
    const CHARACTERISTIC_UUID_READ = "e49a28e1-f69a-11e8-8eb2-f2801f1b9fd1";

    const service = await device.gatt.getPrimaryService(SERVICE_UUID);
    const characteristicWrite = await service.getCharacteristic(CHARACTERISTIC_UUID_WRITE);
    const characteristicRead = await service.getCharacteristic(CHARACTERISTIC_UUID_READ);

    await characteristicRead.startNotifications();

    const dataArray = command.split(" ").map(byte => parseInt(byte, 16)).filter(byte => !isNaN(byte));
    if (dataArray.length === 0) {
      throw new Error("Invalid command format");
    }
    const dataBuffer = new Uint8Array(dataArray);
    await characteristicWrite.writeValue(dataBuffer);
    const onValueChanged = (event) => {

      const value = event.target.value;
      const decodedValue = Array.from(new Uint8Array(value.buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');


      characteristicRead.removeEventListener('characteristicvaluechanged', onValueChanged);
      resolve(decodedValue);
      isProcessing = false;
      processQueue();
    };

    characteristicRead.addEventListener('characteristicvaluechanged', onValueChanged);

    setTimeout(() => {
      characteristicRead.removeEventListener('characteristicvaluechanged', onValueChanged);
      reject(new Error(`Timeout waiting for response from ${side} device`));
      isProcessing = false;
      processQueue();
    }, 5000);
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
    isProcessing = false;
    processQueue();
  }
};

const ReadITEDataFromDevice = (command, side, deviceObj) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({ command, side, deviceObj, resolve, reject });
    processQueue();
  });
};

export default ReadITEDataFromDevice;