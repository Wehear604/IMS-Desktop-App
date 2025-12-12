import { actions, LISTENING_SIDE } from "../../utils/constants";

const initialState = {
    volumeLeft: null,
    volumeRight: null,
    modeLeft: [],
    modeRight: [],
    device_side: null,
    currentVolume: 0,
    start: false,
    volumeDecrease: false,
    volumeIncrease: false
};

const deviceQcReducer = (state = initialState, action) => {
    switch (action.type) {

        case actions.SET_BTE_VOLUME:
            return {
                ...state,
                volumeLeft: action.device_side === LISTENING_SIDE.LEFT ? action.volume : state.volumeLeft,
                volumeRight: action.device_side === LISTENING_SIDE.RIGHT ? action.volume : state.volumeRight,
                volumeIncrease: state.currentVolume > action.volume ? true : state.volumeIncrease,
                volumeDecrease: state.currentVolume < action.volume ? true : state.volumeDecrease,
                currentVolume: action.volume
            };

        case actions.SET_BTE_MODE:
            return {
                ...state,
                modeLeft: state.device_side === LISTENING_SIDE.LEFT ? [...new Set([...state.modeLeft, action.mode])] : state.modeLeft,
                modeRight: state.device_side === LISTENING_SIDE.RIGHT ? [...new Set([...state.modeRight, action.mode])] : state.modeRight,

            };
        case actions.SET_BTE_CURRENT_VOLUME:
            return {
                ...state,
                currentVolume: action.currentVolume,
                start: true,
                device_side: action.device_side
            };
        case actions.RESET_DEVICE_DATA_STORE:
            return {
                ...initialState,
            };

        // ---------- RIC VOLUME ----------
        case actions.SET_VOLUME_LEVEL:
            return {
                ...state,
                volumeLeft:
                    action.side === LISTENING_SIDE.LEFT
                        ? action.volume
                        : state.volumeLeft,
                volumeRight:
                    action.side === LISTENING_SIDE.RIGHT
                        ? action.volume
                        : state.volumeRight,
                volumeIncrease:
                    state.currentVolume > action.volume
                        ? true
                        : state.volumeIncrease,
                volumeDecrease:
                    state.currentVolume < action.volume
                        ? true
                        : state.volumeDecrease,
                currentVolume: action.volume,
            };

        case actions.SET_RIC8_CURRENT_VOLUME:
            return {
                ...state,
                currentVolume: action.volume,
                start: true,
                device_side: action.device_side,
            };
        case actions.SET_RIC8_VOLUME:
            return {
                ...state,
                volumeLeft: action.device_side === LISTENING_SIDE.LEFT ? action.volume : state.volumeLeft,
                volumeRight: action.device_side === LISTENING_SIDE.RIGHT ? action.volume : state.volumeRight,
                volumeIncrease: state.currentVolume < action.volume ? true : state.volumeIncrease,
                volumeDecrease: state.currentVolume > action.volume ? true : state.volumeDecrease,
                currentVolume: action.volume,
                modeLeft: state.device_side === LISTENING_SIDE.LEFT ? [...new Set([...state.modeLeft, action.mode])] : state.modeLeft,
                modeRight: state.device_side === LISTENING_SIDE.RIGHT ? [...new Set([...state.modeRight, action.mode])] : state.modeRight,
            }

        case actions.SET_ITE_OPTIMA_CURRENT_VOLUME:
            return {
                ...state,
                currentVolume: action.volume,
                start: true,
                device_side: action.device_side,
            };

        case actions.SET_ITE_OPTIMA_VOLUME:
            return {
                ...state,
                volumeLeft: action.device_side === LISTENING_SIDE.LEFT ? action.volume : state.volumeLeft,
                volumeRight: action.device_side === LISTENING_SIDE.RIGHT ? action.volume : state.volumeRight,
                volumeIncrease: state.currentVolume < action.volume ? true : state.volumeIncrease,
                volumeDecrease: state.currentVolume > action.volume ? true : state.volumeDecrease,
                currentVolume: action.volume,
                modeLeft: state.device_side === LISTENING_SIDE.LEFT ? [...new Set([...state.modeLeft, action.mode])] : state.modeLeft,
                modeRight: state.device_side === LISTENING_SIDE.RIGHT ? [...new Set([...state.modeRight, action.mode])] : state.modeRight,
            }
        default:
            return state;
    }
};

export default deviceQcReducer;
