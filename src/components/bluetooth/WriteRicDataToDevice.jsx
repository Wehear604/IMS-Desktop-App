const WriteRicDataToDevice = async (command, side, deviceObj) => {
  try {
    if (!deviceObj) {
      console.error("deviceObj is undefined for", side);
      return;
    }

    console.log("command",command)

    // Extract device safely
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;

    if (!device || !device.gatt) {
      console.error("No valid Bluetooth device found!");
      return;
    }

    const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
    const CHARACTERISTIC_UUID = "0000fff2-0000-1000-8000-00805f9b34fb";

    const service = await device.gatt.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);


    // Convert Command to Uint8Array
    const dataArray = command
      .split(" ")
      .map((byte) => parseInt(byte, 16))
      .filter((byte) => !isNaN(byte));

    if (dataArray.length === 0) {
      console.error("Invalid command format:", command);
      return;
    }

    const dataBuffer = new Uint8Array(dataArray);

    // console.log(`Writing to ${side} device:`, dataBuffer);

    // Write to Device
    await characteristic.writeValue(dataBuffer);
  } catch (error) {
    console.error(`Error writing data to ${side} device:`, error);
  }
};
export default WriteRicDataToDevice;
