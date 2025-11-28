import { actions } from "../../utils/constants";

const initialState = {
    device_type: null,
    device_side: null,
    connected: false,
    isConnecting: false,
    hardwareData: [],
    deviceInfo: {
        name: "",
        id: "",
    },
    deviceObj: {},
    read_only: false,
    disconnectFun: undefined,
    writeFun: undefined,

}
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
                hardwareData: action.hardwareData,
                deviceInfo: action.deviceInfo,
                deviceObj: action.deviceObj,
                connected: true,
                read_only: false,
                disconnectFun: action.disconnectFun,
            };
        
        case actions.CHANGE_WRITE_FUN:
            return { ...state, writeFun: action.value };
        
        case actions.DISCONNECT_DEVICE:
            return { ...initialState };
        default: return { ...state }
    }

}
export default deviceReducer