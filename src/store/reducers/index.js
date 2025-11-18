import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userReducer";
import snackBarReducer from "./snackbarReducer";
import modalReducer from "./modalReducer";
import notificationReducer from "./notificationReducer";
import settingsReducer from "./settingsReducer";

const rootReducer = combineReducers({
    user: userReducer,
    snackBar: snackBarReducer,
    modal: modalReducer,
    notifications: notificationReducer,
    settings : settingsReducer,
});
export default rootReducer;