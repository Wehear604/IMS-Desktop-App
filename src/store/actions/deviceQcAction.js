import { BLE_STORE } from "../../utils/bleStore";
import { actions } from "../../utils/constants";

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