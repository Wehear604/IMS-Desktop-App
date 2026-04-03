import { BLE_STORE } from "../../utils/bleStore";
import { actions, SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "./snackbarAction";

export const DeviceSelectAction = (device_type) => {
  return { type: actions.SET_DEVICE_SELECTED, device_type };
};

export const DeviceSideAction = (device_side) => {
  return { type: actions.SET_DEVICE_SIDE, device_side };
};
export const DeviceMACAction = (mac) => {
  return { type: actions.SET_DEVICE_MAC, mac };
};
export const DeviceVersionAction = (versions, latestVersion) => {
  return { type: actions.SET_DEVICE_VERSION, versions, latestVersion };
};

export const DeviceIsConnectingAction = (isConnecting) => {
  return { type: actions.SET_DEVICE_CONNECT, isConnecting };
};
export const DeviceIsAudioCheck = (is_Audio_play) => {
  return { type: actions.IS_AUDIO_CHECK, is_Audio_play };
};

export const connectDevice = (deviceInfo, side, deviceObj) => {
  console.log("deviceInfo in action", deviceInfo);
  console.log("deviceObj in action", deviceObj);
  return {
    type: actions.CONNECT_DEVICE,
    deviceInfo,
    side,
    deviceObj,
  };
};

export const disconnectAction = (side, flag = false) => {
  return async (dispatch) => {
    try {
      if (BLE_STORE.deviceObj?.gatt?.connected) {
        BLE_STORE.deviceObj.gatt.disconnect();
      }

      BLE_STORE.deviceObj = null;
      BLE_STORE.disconnectFun = null;
      BLE_STORE.writeFun = null;
      BLE_STORE.hardwareData = null;

      dispatch(callSnackBar("Device Disconnected.", SNACK_BAR_VARIETNS.error));

      if (flag) {
        dispatch(
          callSnackBar(
            "Please try connecting again.",
            SNACK_BAR_VARIETNS.error,
          ),
        );
      }
    } catch (err) {}

    dispatch({
      type: actions.DISCONNECT_DEVICE,
      side,
    });
  };
};

export const onWriteFunctionChange = (value, side) => {
  BLE_STORE.writeFun = value;
  return { type: actions.CHANGE_WRITE_FUN, side };
};

export const DeviceStoreAction = (
  device_type,
  device_side,
  mode,
  volume,
  body,
  charging,
  audio,
  mac,
  isMic,
) => {
  return {
    type: actions.SET_DEVICE_STORAGE,
    device_type,
    device_side,
    mode,
    volume,
    body,
    charging,
    audio,
    mac,
    isMic,
  };
};

export const DeviceBoxDetailsAction = (box_Contains, device_type) => {
  return {
    type: actions.SET_BOX_DETAILS,
    box_Contains,
    device_type,
  };
};
export const DeviceColorAction = (deviceColor) => {
  return {
    type: actions.SET_DEVICE_COLOR_DETAILS,
    deviceColor,
  };
};
export const DeviceBoxIDAction = (boxId) => {
  return {
    type: actions.SET_DEVICE_BOXID_DETAILS,
    boxId,
  };
};

export const resetDeviceDataStore = (reset) => {
  return { type: actions.RESET_DEVICE_DATA_STORE, reset };
};
export const CloseDeviceDataStore = () => {
  return { type: actions.SET_QC_TEST_CLOSE_RESULT };
};
export const SetDeviceFOT = () => {
  return { type: actions.SET_FOT_FILES };
};
export const SetDevicVersionFOT = (fot) => {
  return { type: actions.SET_FOT_FILES_VERSION, fot };
};
