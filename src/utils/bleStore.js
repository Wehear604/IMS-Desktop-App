export const BLE_STORE = {
    deviceObj: null,      
    writeFun: null,       
    readFun: null,       
    disconnectFun: null, 
    hardwareData: null,  
};

export const dataViewToHex = (dataView) => {
    if (!dataView) return "";
    const arr = [];
    for (let i = 0; i < dataView.byteLength; i++) {
        arr.push(("0" + dataView.getUint8(i).toString(16)).slice(-2));
    }
    return arr.join(" ");
};

export const readCharacteristic = async (characteristicOrWrapper) => {
    if (!characteristicOrWrapper) {
        throw new Error("No characteristic provided for read.");
    }

    // Case A: a custom wrapper with readData()
    if (typeof characteristicOrWrapper.readData === "function") {
        // expected to return parsed payload or DataView-like value
        const result = await characteristicOrWrapper.readData();
        // if result is DataView-like, convert; if string, keep it
        if (result instanceof DataView) {
            return { hex: dataViewToHex(result), timestamp: Date.now(), raw: result };
        }
        // If wrapper returns something already parsed:
        return { hex: (typeof result === "string" ? result : JSON.stringify(result)), timestamp: Date.now(), raw: result };
    }

    // Case B: native BluetoothRemoteGATTCharacteristic with readValue()
    if (typeof characteristicOrWrapper.readValue === "function") {
        const dataView = await characteristicOrWrapper.readValue();
        const hex = dataViewToHex(dataView);
        return { hex, timestamp: Date.now(), raw: dataView };
    }

    throw new Error("Provided characteristic does not support reading.");
};

export const interpolateValue = (value1, value2, t = 0.5) => {
    const interpolated = value1 + (value2 - value1) * t;
    return Math.round(interpolated); // ensures integer output
};