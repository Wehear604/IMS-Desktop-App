import { actions } from "../../utils/constants";

const initialState = {
    device_type: null,
    device_side: null,
    mac:null,
    connected: false,
    isConnecting: false,
    read_only: false,
    deviceInfo: {
        name: "",
        id: "",
    }
};

const deviceReducer = (state = initialState, action) => {
    switch (action.type) {

        case actions.SET_DEVICE_SELECTED:
            return { ...state, device_type: action.device_type };

        case actions.SET_DEVICE_SIDE:
            return { ...state, device_side: action.device_side };

        case actions.SET_DEVICE_CONNECT:
            return { ...state, isConnecting: action.isConnecting };
        
        case actions.SET_DEVICE_MAC:
            return { ...state, mac: action.mac };

        case actions.CONNECT_DEVICE:
            return {
                ...state,
                connected: true,
                read_only: false,
                deviceInfo: action.deviceInfo
            };

        case actions.DISCONNECT_DEVICE:
            return {
                ...initialState,
                device_type: state.device_type,
                device_side: state.device_side
            };

        default:
            return state;
    }
};

export default deviceReducer;
