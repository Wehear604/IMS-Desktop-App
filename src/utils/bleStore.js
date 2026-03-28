import WriteRicDataToDevice from "../components/bluetooth/WriteRicDataToDevice";
import { DeviceIsAudioCheck } from "../store/actions/deviceDataAction";
import { callSnackBar } from "../store/actions/snackbarAction";
import { DEVICES, LISTENING_SIDE, SNACK_BAR_VARIETNS } from "./constants";
import audioUrl from "../assets/images/slow_instrumental.mp3"; // mp3 file

export const BLE_STORE = {
  deviceObj: null,
  writeFun: null,
  readFun: null,
  disconnectFun: null,
  hardwareData: null,
  BTEdisconnect: false,
  server: null,
  device: null,
  audio: null, // MP3 instance stored here
};
export const SAFE_BUDS_STORE = {
  device: null,
  server: null,
  svc: null,
  chIn: null,
  chOut: null,
};

//------------------------------------------------------
// LAZY INITIALIZE MP3 AUDIO
//------------------------------------------------------
const ensureAudio = () => {
  if (!BLE_STORE.audio) {
    BLE_STORE.audio = new Audio(audioUrl);
  }
  return BLE_STORE.audio;
};

export async function sendPlayCommand(dispatch, device_type, side, value) {
  console.log("sendPlayCommand called with device_type:", device_type);

  if (device_type == DEVICES.BTE_OPTIMA || device_type == DEVICES.BTE_PRIME) {
    if (!BLE_STORE.writeFun || !BLE_STORE.writeFun.writeData) {
      console.error("Write function not ready");
      return;
    }

    const playPacket = [170, 171, 3, 0, 11, 184, 0];

    try {
      await BLE_STORE.writeFun.writeData(playPacket);
      dispatch(DeviceIsAudioCheck(true));
      return;
    } catch (err) {
      console.error("Play write failed:", err);
      dispatch(DeviceIsAudioCheck(true));
      dispatch(
        callSnackBar(`Play write failed ${err}`, SNACK_BAR_VARIETNS.error),
      );
    }
  }
  if (device_type === DEVICES.ITE_PRIME) {
    console.log("Playing MP3 instead of BLE command...");

    try {
      const audio = ensureAudio();
      await audio.play();

      dispatch(DeviceIsAudioCheck(true));
      return; // IMPORTANT: stop here, do NOT send BLE command
    } catch (err) {
      console.error("MP3 play failed:", err);
      dispatch(
        callSnackBar(`MP3 play failed: ${err}`, SNACK_BAR_VARIETNS.error),
      );
      return;
    }
  }

  const command =
    side === LISTENING_SIDE.LEFT
      ? `83 03 01 00 ${value.toString(16).padStart(2, "0")}`
      : `83 03 02 00 ${value.toString(16).padStart(2, "0")}`;

  console.log("Sending BLE play command:", command);

  try {
    await WriteRicDataToDevice(command, side, BLE_STORE.deviceObj);
    dispatch(DeviceIsAudioCheck(true));
  } catch (err) {
    console.error("BLE Play write failed:", err);
    dispatch(DeviceIsAudioCheck(false));
    dispatch(callSnackBar(`BLE Play failed ${err}`, SNACK_BAR_VARIETNS.error));
  }
}

export async function sendPauseCommand(dispatch, device_type) {
  console.log("sendPauseCommand called");

  if (device_type !== DEVICES.BTE_OPTIMA || device_type !== DEVICES.BTE_PRIME) {
    if (BLE_STORE.audio) {
      try {
        BLE_STORE.audio.pause();
        BLE_STORE.audio.currentTime = 0;
        console.log("MP3 paused successfully");
      } catch (err) {
        console.error("MP3 pause error:", err);
      }
    }

    if (!BLE_STORE.writeFun || !BLE_STORE.writeFun.writeData) {
      console.warn("BLE pause skipped: writeFun not available");
      return;
    }
  }

  const pausePacket = [170, 171, 3, 0, 0, 0, 0];

  try {
    await BLE_STORE.writeFun.writeData(pausePacket);
    console.log("BLE pause sent");
  } catch (err) {
    console.error("BLE pause write failed:", err);
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

  if (typeof characteristicOrWrapper.readData === "function") {
    const result = await characteristicOrWrapper.readData();
    if (result instanceof DataView) {
      return { hex: dataViewToHex(result), timestamp: Date.now(), raw: result };
    }
    return { hex: String(result), timestamp: Date.now(), raw: result };
  }

  if (typeof characteristicOrWrapper.readValue === "function") {
    const dataView = await characteristicOrWrapper.readValue();
    const hex = dataViewToHex(dataView);
    return { hex, timestamp: Date.now(), raw: dataView };
  }

  throw new Error("Provided characteristic does not support reading.");
};

export const interpolateValue = (value1, value2, t = 0.5) => {
  const interpolated = value1 + (value2 - value1) * t;
  return Math.round(interpolated);
};
