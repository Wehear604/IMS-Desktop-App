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
    },
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
                    },
                };
            }
            return state;

        default:
            return state;
    }
};

export default deviceDataStorageReducer;