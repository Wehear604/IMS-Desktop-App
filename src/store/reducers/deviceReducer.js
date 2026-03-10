import { actions } from "../../utils/constants";
import { cleanValue } from "../../utils/main";

const initialState = {
  device_type: null,
  device_side: null,
  mac: null,
  macBeforeOta: null,
  is_Audio_play: false,
  isMic: false,
  connected: false,
  isConnecting: false,
  read_only: false,
  deviceInfo: {
    name: "",
    id: "",
  },
  fotfile: false,
  fotfile1: false,
  version: null,
  latestVersion: null,
};

const deviceReducer = (state = initialState, action) => {
  console.log("action", action);
  switch (action.type) {
    case actions.SET_DEVICE_SELECTED:
      return { ...state, device_type: action.device_type };

    case actions.SET_DEVICE_SIDE:
      return { ...state, device_side: action.device_side };

    case actions.SET_DEVICE_CONNECT:
      return { ...state, isConnecting: action.isConnecting };

    case actions.CONNECT_DEVICE:
      return {
        ...state,
        connected: true,
        read_only: false,
        deviceInfo: action.deviceInfo,
        deviceObj: action.deviceObj,
      };

    case actions.SET_DEVICE_MAC:
      return {
        ...state,
        mac: action.mac,
        // version: action.version,
      };
    case actions.SET_DEVICE_VERSION:
      return {
        ...state,
        version: cleanValue(
          action?.versions ? action?.versions : state?.version,
        ),
        latestVersion: cleanValue(
          action?.latestVersion ? action?.latestVersion : state?.latestVersion,
        ),
      };

    case actions.IS_AUDIO_CHECK:
      return { ...state, is_Audio_play: action.is_Audio_play };

    case actions.FETCH_ISMIC_SAFE_BUDS:
      return { ...state, isMic: action.isMic };

    case actions.DISCONNECT_DEVICE:
      return {
        ...initialState,
        device_type: state.device_type,
        device_side: state.device_side,
        fotfile: state.fotfile,
        fotfile1: state.fotfile1,
        mac: state.mac,
        version: cleanValue(
          action?.versions ? action?.versions : state?.version,
        ),
        latestVersion: cleanValue(
          action?.latestVersion ? action?.latestVersion : state?.latestVersion,
        ),
      };
    case actions.SET_FOT_FILES_VERSION:
      return { ...state, fotfile1: action.fot };
    case actions.SET_FOT_FILES:
      return {
        ...initialState,
        fotfile: true,
        fotfile1: true,
        device_type: state.device_type,
        device_side: state.device_side,
        mac: state.mac,
      };
    case actions.RESET_DEVICE_DATA_STORE:
      return {
        ...initialState,
        device_type: state.device_type,
        device_side: state.device_side,
      };
    case actions.SET_QC_TEST_CLOSE_RESULT:
      return {
        ...initialState,
        device_type: state.device_type,
        device_side: state.device_side,
        fotfile: true,
        fotfile1: true,
        mac: state.mac,
      };
    default:
      return state;
  }
};

export default deviceReducer;
