import { DeviceIsAudioCheck } from "../store/actions/deviceDataAction";
import { callSnackBar } from "../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "./constants";

export const BLE_STORE = {
    deviceObj: null,
    writeFun: null,
    readFun: null,
    disconnectFun: null,
    hardwareData: null,
};

export async function sendPlayCommand(dispatch) {
    if (!BLE_STORE.writeFun || !BLE_STORE.writeFun.writeData) {
        console.error("Write function not ready");
        return;
    }

    const playPacket = [170, 171, 3, 0, 11, 184, 0];

    try {
        await BLE_STORE.writeFun.writeData(playPacket);
        dispatch(DeviceIsAudioCheck(true));
    } catch (err) {
        console.error("Play write failed:", err);
        dispatch(DeviceIsAudioCheck(true));
        dispatch(
            callSnackBar(
                `Play write failed ${err}`,
                SNACK_BAR_VARIETNS.error
            )
        );
    }
}

export async function sendPauseCommand() {
    const pausePacket = [170, 171, 3, 0, 0, 0, 0];

    try {
        await BLE_STORE.writeFun.writeData(pausePacket);
    } catch (err) {
        console.error("Pause write failed:", err);
    }
}


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