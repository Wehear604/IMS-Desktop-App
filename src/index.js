import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import theme from "./assets/css/theme";
import "./App.css";
import rootReducer from "./store/reducers";
import {thunk} from "redux-thunk";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { SnackbarProvider } from "notistack";


  // const store = configureStore({ reducer: rootReducer, middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk) });
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={4} autoHideDuration={2000}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <App />
        </LocalizationProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals())
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
