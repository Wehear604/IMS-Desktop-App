import { all } from "axios";
import { actions, LISTENING_SIDE } from "../../utils/constants";

const initialState = {
  left: {
    device_type: null,
    mode: null,
    volume: {
      volumeIncrease: false,
      volumeDecrease: false,
    },
    body: {
      body1: false,
      body2: false,
    },
    charging: false,
    audio: null,
    mac: null,
    result: false,
  },
  right: {
    device_type: null,
    mode: null,
    volume: {
      volumeIncrease: false,
      volumeDecrease: false,
    },
    body: {
      body1: false,
      body2: false,
    },
    charging: false,
    audio: null,
    mac: null,
    result: false,
  },
  box_Contains: [],
  deviceColor: null,
  boxId: null,
  device_type:null
};

const deviceDataStorageReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_DEVICE_STORAGE:
      if (action.device_side === LISTENING_SIDE.LEFT) {
        return {
          ...state,
          left: {
            device_type: action.device_type,
            mode: action.mode,
            volume: action.volume,
            body: {
              body1: action.body?.body1 || false,
              body2: action.body?.body2 || false,
            },
            charging: action.charging || false,
            audio: action.audio,
            mac: action.mac,
            result: true,
          },
        };
      } else if (action.device_side === LISTENING_SIDE.RIGHT) {
        return {
          ...state,
          right: {
            device_type: action.device_type,
            mode: action.mode,
            volume: action.volume,
            body: {
              body1: action.body?.body1 || false,
              body2: action.body?.body2 || false,
            },
            charging: action.charging || false,
            audio: action.audio,
            mac: action.mac,
            result: true,
          },
        };
      }
      return state;

    case actions.SET_BOX_DETAILS:
      return {
        ...state,
        box_Contains: action.box_Contains,
        boxId: action.boxId,
        deviceColor: action.deviceColor, 
        device_type: action.device_type
      };
    default:
      return state;
  }
};

export default deviceDataStorageReducer;
