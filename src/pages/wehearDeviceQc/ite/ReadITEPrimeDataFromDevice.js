import { CHARACTERISTIC_UUID_READ_NOTIFY, CHARACTERISTIC_UUID_READ_WRITE, DEVICES, SERVICE_UUI, SERVICE_UUID } from "../../../utils/constants";

const primeCommandQueue = [];
let primeIsProcessing = false;

const processPrimeQueue = async () => {
    if (primeIsProcessing || primeCommandQueue.length === 0) return;

    primeIsProcessing = true;
    const { command, side, deviceObj, resolve, reject } = primeCommandQueue.shift();

    try {
        const device = deviceObj.device?.device || deviceObj.device || deviceObj;

        if (!device || !device.gatt) {
            throw new Error("No valid Bluetooth device found!");
        }

        const SERVICE_UUId = SERVICE_UUID[DEVICES.ITE_PRIME];
        const WRITE_CHAR_UUId = CHARACTERISTIC_UUID_READ_WRITE[DEVICES.ITE_PRIME];
        const NOTIFY_CHAR_UUId = CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.ITE_PRIME];

        const service = await device.gatt.getPrimaryService(SERVICE_UUId);
        const characteristicWrite = await service.getCharacteristic(WRITE_CHAR_UUId);
        const characteristicNotify = await service.getCharacteristic(NOTIFY_CHAR_UUId);

        await characteristicNotify.startNotifications();



        if (command.length === 0) {
            throw new Error("Invalid command format");
        }

        const dataBuffer = new Uint8Array(command);

        const onValueChanged = (event) => {
            const value = event.target.value;
            const decodedValue = new Uint8Array(value.buffer)
            // console.log(`Response from ${side} device:`, decodedValue);

            characteristicNotify.removeEventListener('characteristicvaluechanged', onValueChanged);
            resolve(decodedValue);
            primeIsProcessing = false;
            processPrimeQueue();
        };

        characteristicNotify.addEventListener('characteristicvaluechanged', onValueChanged);

        const response = await characteristicWrite.writeValueWithResponse(dataBuffer);
        // console.log("this is response", response)

        setTimeout(() => {
            characteristicNotify.removeEventListener('characteristicvaluechanged', onValueChanged);
            reject(new Error(`Timeout waiting for response from ${side} device`));
            primeIsProcessing = false;
            processPrimeQueue();
        }, 5000);

    } catch (error) {
        console.error(`Error reading data from ${side} Prime device:`, error);
        reject(error);
        primeIsProcessing = false;
        processPrimeQueue();
    }
};

const ReadITEPrimeDataFromDevice = (command, side, deviceObj) => {
    return new Promise((resolve, reject) => {
        primeCommandQueue.push({ command, side, deviceObj, resolve, reject });
        processPrimeQueue();
    });
};

export default ReadITEPrimeDataFromDevice;
