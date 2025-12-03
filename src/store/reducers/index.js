import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import snackBarReducer from "./snackbarReducer";
import modalReducer from "./modalReducer";
import notificationReducer from "./notificationReducer";
import settingsReducer from "./settingsReducer";
import deviceReducer from "./deviceReducer";
import deviceQcReducer from "./deviceQcReducer";

const rootReducer = combineReducers({
    user: userReducer,
    snackBar: snackBarReducer,
    modal: modalReducer,
    notifications: notificationReducer,
    settings: settingsReducer,
    device: deviceReducer,
    deviceQc: deviceQcReducer,
});
export default rootReducer;