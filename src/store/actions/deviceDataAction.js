import { actions, SNACK_BAR_VARIETNS } from "../../utils/constants"
import { callSnackBar } from "./snackbarAction"

export const DeviceSelectAction = (device_type) => {
    return { type: actions.SET_DEVICE_SELECTED, device_type }
}

export const DeviceSideAction = (device_side) => {
    return { type: actions.SET_DEVICE_SIDE, device_side }
}
export const DeviceIsConnectingAction = (isConnecting) => {
    return { type: actions.SET_DEVICE_CONNECT, isConnecting }
}

export const connectDevice = (
    hardwareData,
    deviceInfo,
    deviceObj,
    disconnectFun,
    side
) => {
    console.log("Connecting to device:", deviceInfo);
    console.log("Hardware Data:", hardwareData);
    console.log("Device Object:", deviceObj);
    console.log("Disconnect Function:", disconnectFun);
    console.log("Side:", side);
    return {
        type: actions.CONNECT_DEVICE,
        hardwareData,
        deviceInfo,
        deviceObj,
        disconnectFun,
        side: side,
    };
};

export const disconnectAction = (side, flag = false) => {
    return async (dispatch, getState) => {
        const state = getState();
        const fitting = state.device;

        try {
            if (fitting.deviceObj?.gatt?.connected) {
                fitting.deviceObj.gatt.disconnect();
            }

            dispatch(callSnackBar("Device Disconnected.", SNACK_BAR_VARIETNS.error));

            if (flag) {
                dispatch(callSnackBar("Please try connecting again.", SNACK_BAR_VARIETNS.error));
            }

        } catch (err) {
            console.error("Error disconnecting:", err);
        }

        dispatch({
            type: actions.DISCONNECT_DEVICE,
            side,
        });
    };
};
