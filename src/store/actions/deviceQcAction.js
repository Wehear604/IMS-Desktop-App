import ReadRicDataFromDevice from "../../pages/wehearDeviceQc/ric/ReadRicDataToDevice";
import { BLE_STORE } from "../../utils/bleStore";
import { actions, LISTENING_SIDE } from "../../utils/constants";

const gattLock = (() => {
  let busy = false;
  return async (fn) => {
    while (busy) await new Promise((r) => setTimeout(r, 20));
    busy = true;
    try {
      return await fn();
    } finally {
      busy = false;
    }
  };
})();

export const BteDeviceVolume = (side) => {
  return async (dispatch) => {
    try {
      const volume = await gattLock(() => BLE_STORE.writeFun.readData());
      dispatch({
        type: actions.SET_BTE_VOLUME,
        volume: volume?.[1] ?? null,
      });
    } catch (err) {
      console.error("BteDeviceVolume read failed", err);
      dispatch({
        type: actions.SET_BTE_VOLUME,
        volume: null,
        side,
        error: err,
      });
    }
  };
};

export const BteDeviceCurrentVolume = (device_side) => {
  return async (dispatch) => {
    try {
      const currentVolume = await gattLock(() => BLE_STORE.writeFun.readData());
      dispatch({
        type: actions.SET_BTE_CURRENT_VOLUME,
        currentVolume: currentVolume?.[1] ?? null,
        device_side,
      });
    } catch (err) {
      console.error("BteDeviceCurrentVolume read failed", err);
      dispatch({
        type: actions.SET_BTE_CURRENT_VOLUME,
        currentVolume: null,
        device_side,
        error: err,
      });
    }
  };
};


export const BteDeviceMode = () => {
  return async (dispatch) => {
    try {
      const mode = await gattLock(() => BLE_STORE.writeFun.readData());
      console.log("object mode", mode[0]);
      dispatch({
        type: actions.SET_BTE_MODE,
        mode: mode[0] ?? null,
      });
    }
    catch (err) {
      console.error("BteDeviceMode read failed", err);
      dispatch({
        type: actions.SET_BTE_MODE,
        mode: null,
        error: err,
      });
    }
  };
};


export const RicDeviceCurrentVolume = (side) => {
  return async (dispatch) => {
    try {
      const command =
        side === LISTENING_SIDE.LEFT ? `82 02 01 00` : `82 02 02 00`;

      const response = await ReadRicDataFromDevice(
        command,
        side,
        BLE_STORE.deviceObj
      );

      if (response && response.startsWith("82 03")) {
        const responseParts = response.split(" ");
        const volumeHex = parseInt(responseParts[4], 16);
        const volumeLevel = Number(volumeHex);
        const normalizedVolume = 20 - volumeLevel;

        dispatch({
          type: actions.SET_BTE_CURRENT_VOLUME,
          currentVolume: normalizedVolume,
          device_side: side,
        });
      } else {
        console.warn("Invalid RIC current volume response:", response);
      }
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
      dispatch({
        type: actions.SET_BTE_CURRENT_VOLUME,
        currentVolume: 0,
        device_side: side,
        error: err,
      });
    }
  };
};

export const readRicVolumeLevel = (side, deviceObj, onSuccess = () => { }) => {
  return async (dispatch) => {
    try {
      const command =
        side === LISTENING_SIDE.LEFT ? `82 02 01 00` : `82 02 02 00`;

      const response = await ReadRicDataFromDevice(command, side, deviceObj);
      console.log("this is volume response", response);

      if (response && response.startsWith("82 03")) {
        const responseParts = response.split(" ");
        const volumeHex = parseInt(responseParts[4], 16);
        console.log("this is volume hex", volumeHex);
        const volumeLevel = Number(volumeHex);
        console.log("this is volume", volumeLevel);

        const normalizedVolume = 20 - volumeLevel;

        dispatch({
          type: actions.SET_VOLUME_LEVEL,
          side,
          volume: normalizedVolume,
        });
        onSuccess();
      } else {
        // retry
        dispatch(readRicVolumeLevel(side, deviceObj, onSuccess));
      }
    } catch (error) {
      console.error("readRicVolumeLevel error:", error);
      dispatch({
        type: actions.SET_VOLUME_LEVEL,
        side,
        volume: 15,
      });
    }
  };
};

// ---------- RIC MODE ----------
export const readRicMode = (side, deviceObj) => {
  return async (dispatch) => {
    try {
      const command =
        side === LISTENING_SIDE.RIGHT ? "84 02 02 00" : "84 02 01 00";

      const response = await ReadRicDataFromDevice(command, side, deviceObj);

      if (!response || !response.startsWith("84 03")) {
        console.warn(`Invalid mode response: ${response}`);
        return;
      }

      const data = response.split(" ");
      const d1 = parseInt(data[4], 16);

      let mode;
      if (d1 === 1) mode = 0; // Quiet
      else if (d1 === 2) mode = 1; // Noise
      else if (d1 === 3) mode = 2; // Outdoor
      else {
        console.error(`Unexpected mode value: ${d1}`);
        return;
      }

      dispatch({
        type:
          side === LISTENING_SIDE.RIGHT
            ? actions.CHANGE_RIC_MODE_RIGHT
            : actions.CHANGE_RIC_MODE_LEFT,
        mode,
      });
    } catch (error) {
      console.error("Error reading mode:", error);
    }
  };
};