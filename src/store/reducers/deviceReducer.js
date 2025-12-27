import { actions } from "../../utils/constants";

const initialState = {
  device_type: null,
  device_side: null,
  mac: null,
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
};

const deviceReducer = (state = initialState, action) => {
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
      return { ...state, mac: action.mac };

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
      };
    case actions.SET_FOT_FILES:
      return {
        ...initialState,
        fotfile: true,
        device_type: state.device_type,
        device_side: state.device_side,
      };

    default:
      return state;
  }
};

export default deviceReducer;
