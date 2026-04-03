import ReadITEDataFromDevice from "../../pages/wehearDeviceQc/ite/ReadITEDataFromDevice";
import ReadITEPrimeDataFromDevice from "../../pages/wehearDeviceQc/ite/ReadITEPrimeDataFromDevice";
import ReadRicDataFromDevice from "../../pages/wehearDeviceQc/ric/ReadRicDataToDevice";
import Read from "../../pages/wehearDeviceQc/safebuds/Read";
import ReadBLEName from "../../pages/wehearDeviceQc/safebuds/ReadBLEName";
import ReadVersion from "../../pages/wehearDeviceQc/safebuds/ReadVersion";
import Write from "../../pages/wehearDeviceQc/safebuds/Write";
import WriteBleName from "../../pages/wehearDeviceQc/safebuds/WriteBleName";
import WriteVersion from "../../pages/wehearDeviceQc/safebuds/WriteVersion";
import { BLE_STORE, interpolateValue } from "../../utils/bleStore";
import {
  actions,
  EQ_LEVEL,
  ITE_MODE,
  LISTENING_SIDE,
  MODES,
  VOLUME_COMMANDS_REVERSE,
} from "../../utils/constants";
import { DeviceVersionAction } from "./deviceDataAction";

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
    } catch (err) {
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
        BLE_STORE.deviceObj,
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

export const readRicVolumeLevel = (side, deviceObj, onSuccess = () => {}) => {
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
      if (d1 === 1)
        mode = 0; // Quiet
      else if (d1 === 2)
        mode = 1; // Noise
      else if (d1 === 3)
        mode = 2; // Outdoor
      else {
        console.error(`Unexpected mode value: ${d1}`);
        return;
      }
      console.log("object modeeeeeeeeeeeeee", mode);
      dispatch({
        type: actions.SET_BTE_MODE,
        mode,
      });
    } catch (error) {
      console.error("Error reading mode:", error);
    }
  };
};

export const readRic8Volume = (side, currentVolume) => {
  return async (dispatch) => {
    try {
      const command = "0x06";
      const response = await ReadRicDataFromDevice(
        command,
        side,
        BLE_STORE.deviceObj,
      );
      const responseParts = response.trim().split(" ");
      console.log("first response", response);
      let eqData = [];
      for (let i = 0; i < 5; i++) {
        if (i == 0 || i == 2 || i == 3) {
          let data = parseInt(responseParts[i], 16) - parseInt(EQ_LEVEL[i], 16);
          let data1 =
            parseInt(responseParts[i + 1], 16) - parseInt(EQ_LEVEL[i + 1], 16);

          let twoDataObj = interpolateValue(data, data1);
          eqData.push(data);
          eqData.push(twoDataObj);
        } else {
          eqData.push(
            parseInt(responseParts[i], 16) - parseInt(EQ_LEVEL[i], 16),
          );
        }
      }

      let volume = VOLUME_COMMANDS_REVERSE[responseParts[5]];

      let mode = MODES[responseParts[6]];
      if (currentVolume) {
        dispatch({
          type: actions.SET_RIC8_CURRENT_VOLUME,
          volume,
          device_side: side,
        });
      } else {
        dispatch({
          type: actions.SET_RIC8_VOLUME,
          side,
          volume,
          mode,
        });
      }

      console.log("{ volume, mode ", volume, mode);
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};

// credit goes to dilip mali
export const getITEOptimaData = (side, currentVolume) => {
  return async (dispatch) => {
    const command = "AA 00 03";
    const response = await ReadITEDataFromDevice(
      command,
      side,
      BLE_STORE.deviceObj,
    );
    const responseParts = response.trim().split(" ");
    console.log("object response", response);
    let eqData = [];

    for (let i = 10; i < 15; i++) {
      if (i == 10 || i == 12 || i == 13) {
        let data = parseInt(responseParts[i], 16);
        let data1 = parseInt(responseParts[i + 1], 16);
        let twoDataObj = interpolateValue(data, data1);
        eqData.push(data);
        eqData.push(twoDataObj);
      } else {
        eqData.push(parseInt(responseParts[i], 16));
      }
    }

    let volume =
      side == LISTENING_SIDE.LEFT ? responseParts[8] : responseParts[9];

    let mode = ITE_MODE[responseParts[7]];

    // let batteryLevel =
    //   device?.device_side == LISTENING_SIDE.LEFT ? responseParts[5] : responseParts[6];

    // dispatch({
    //     type: actions.SET_ITE_OPTIMA_BATTERY,
    //     batteryLevel: parseInt(batteryLevel, 16),
    //     device_side: side
    // });
    console.log("object volume", volume, mode, responseParts);
    if (currentVolume) {
      dispatch({
        type: actions.SET_ITE_OPTIMA_CURRENT_VOLUME,
        volume,
        device_side: side,
      });
    } else {
      dispatch({
        type: actions.SET_ITE_OPTIMA_VOLUME,
        side,
        volume,
        mode,
      });
    }
  };
};

export const getITEPrimeMode = (side, deviceObj) => {
  return async (dispatch) => {
    const command = [0x02, 0x05, 0x00];
    const response = await ReadITEPrimeDataFromDevice(command, side, deviceObj);
    const mode = response[4];
    console.log("mode", mode);
    dispatch({
      type: actions.SET_ITE_PRIME_MODE,
      mode,
      device_side: side,
    });
    console.log("object ite mode", mode);
  };
};

export const getITEPrimeVolume = (side, volume) => {
  return async (dispatch, getState) => {
    const state = getState();
    const command = [0x02, 0x0d, 0x00];
    const response = await ReadITEPrimeDataFromDevice(
      command,
      side,
      BLE_STORE.deviceObj,
    );
    console.log("object ite volume", volume);
  };
};

export const getITEPrimeCurrentVolume = (side, volume) => {
  return (dispatch, getState) => {
    const state = getState();

    dispatch({
      type: !state.deviceQc.start
        ? actions.SET_ITE_PRIME_CURRENT_VOLUME
        : actions.SET_ITE_PRIME_VOLUME,
      volume,
      side,
      device_side: side,
    });

    console.log("ITE volume:", volume);
  };
};
export const SafeBudsDeviceName = ({ type }) => {
  return async (dispatch) => {
    try {
      const command = "0x20";

      const response = await Write(command, "both", BLE_STORE.deviceObj, type);

      console.log(`"response" : - ${type}`, response);
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};
export const SafeBudsBLEDeviceName = ({ type }) => {
  return async (dispatch) => {
    try {
      const command = "0x20";

      const response = await WriteBleName(
        command,
        "both",
        BLE_STORE.deviceObj,
        type,
      );

      console.log(`"response" : - ${type}`, response);
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};

export const SafeBudsTap = ({ type, deviceSide }) => {
  return async (dispatch, getState) => {
    try {
      const command = null;
      const response = await Read(
        command,
        deviceSide == LISTENING_SIDE.LEFT ? "Left" : "Right",
        BLE_STORE.deviceObj,
        type,
        dispatch,
        getState,
      );

      console.log("response1", response);
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};

export const SafeBudsVersionRead = ({
  type,
  isVersionRead = true,
  latestVersion = "",
}) => {
  return async (dispatch) => {
    try {
      const command = 0x60;
      const response = await ReadVersion(
        command,
        "both",
        BLE_STORE.deviceObj,
        type,
        dispatch,
      );
      console.log("version response", latestVersion);
      if (isVersionRead) {
        dispatch(
          SafeBudsVersionUpdate({ type: "ble", currentVersion: latestVersion }),
        );
      } else {
        dispatch(DeviceVersionAction(response, latestVersion));
      }
      return response;
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};
export const SafeBudsBleRead = (payload = {}) => {
  return async (dispatch) => {
    try {
      const command = 0x21;
      const response = await ReadBLEName(
        command,
        "both",
        BLE_STORE.deviceObj,
        dispatch,
      );
      console.log("version response", response);

      return response;
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};

export const ChangeButtonSide = (device_side) => {
  return { type: actions.SET_DEVICE_SIDE, device_side };
};

export const SafebudsDeviceCurrentVolume = () => {
  return async (dispatch) => {
    const data = await window.electronAPI.getVolume();
    console.log("W", data);
    try {
      dispatch({
        type: actions.SET_SAFE_BUDS_CURRENT_VOLUME,
        currentVolume: data.volume,
      });
    } catch (err) {
      console.error("BteDeviceCurrentVolume read failed", err);
    }
  };
};
export const FetchVolumeSafebudsDevice = () => {
  return async (dispatch) => {
    const data = await window.electronAPI.getVolume();
    console.log("System volume data:", data);
    try {
      dispatch({
        type: actions.FETCH_VOLUME_SAFE_BUDS,
        volume: data.volume,
      });
    } catch (err) {
      console.error("BteDeviceCurrentVolume read failed", err);
    }
  };
};

export const SafebudsDeviceAudioCheck = () => {
  return async (dispatch) => {
    try {
      dispatch({
        type: actions.FETCH_ISMIC_SAFE_BUDS,
        isMic: true,
      });
    } catch (err) {
      console.error("BteDeviceCurrentVolume read failed", err);
    }
  };
};

export const SafebudsDeviceQCResultCheck = (result, device_side) => {
  return async (dispatch) => {
    console.log("firstresult", result);
    try {
      dispatch({
        type: actions.SET_QC_TEST_RESULT,
        result,
        device_side,
      });
    } catch (err) {
      console.error("BteDeviceCurrentVolume read failed", err);
    }
  };
};

export const SafeBudsVersionUpdate = ({ type, currentVersion }) => {
  return async (dispatch) => {
    try {
      const command = "0x60";

      const response = await WriteVersion(
        command,
        "both",
        BLE_STORE.deviceObj,
        type,
        currentVersion,
      );

      console.log("response3", response);

      dispatch(DeviceVersionAction(response, currentVersion));

      dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    } catch (err) {
      console.error("RicDeviceCurrentVolume read failed", err);
    }
  };
};

export const AllDeviceAudioCheck = (isMic) => {
  console.log("first isMic", isMic);
  return async (dispatch) => {
    try {
      dispatch({
        type: actions.FETCH_ISMIC_SAFE_BUDS,
        isMic: isMic,
      });
    } catch (err) {
      console.error("read failed", err);
    }
  };
};