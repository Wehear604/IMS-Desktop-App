import React, { useState } from "react";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import { closeModal } from "../../../store/actions/modalAction";
import {
  CloseDeviceDataStore,
  DeviceBoxImageAction,
  resetDeviceDataStore,
} from "../../../store/actions/deviceDataAction";
import { useDispatch, useSelector } from "react-redux";
import { BLE_STORE } from "../../../utils/bleStore";
import { DEVICES, SNACK_BAR_VARIETNS } from "../../../utils/constants";
import { createDeviceQcApi } from "../../../apis/deviceQc.api";
import { callSnackBar } from "../../../store/actions/snackbarAction";
import { SetStepAction } from "../../../store/actions/stepAction";
import { callApiAction } from "../../../store/actions/commonAction";
import { Box, Grid } from "@mui/material";
import SafeBudsBoxContainsUI from "../SafebudsUi/SafeBudsBoxContainsUI";
import SafeBudsColorUi from "../SafebudsUi/SafeBudsColorUi";
import SafeBudsBoxIdUi from "../SafebudsUi/SafeBudsBoxIdUi";
import CameraCaptureComponent from "../../../components/layouts/upload/CameraCaptureComponent";
import { writeDeviceSn } from "../../../store/actions/deviceQcAction";

const BoxContainsUI = ({ fields }) => {
  const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const data = {
    left: {
      ...deviceDataStore?.left,
    },
    right: {
      ...deviceDataStore?.right,
    },
    box_Contains: deviceDataStore.box_Contains ?? [],
    deviceColor: deviceDataStore.deviceColor ?? "69521eea409668adad3cf8e2",
    boxId: deviceDataStore.boxId ?? "0000000000",
    device: device?.device_type,
    isNewric16: deviceDataStore?.isNewric16,
    boxImage: deviceDataStore?.boxImage,
    classicMac: deviceDataStore?.classicMac,
  };

  const onComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("data", data);
    console.log(
      "deviceQc?.deviceSerialNumber",
      deviceDataStore?.deviceSerialNumber,
    );
    if (
      (data.device == DEVICES.RIC_OPTIMA ||
        data.device == DEVICES.RIC_OPTIMA_8) &&
      deviceDataStore?.deviceSerialNumber
    ) {
      const snResult = await dispatch(
        writeDeviceSn(data.boxId, "RIGHT", BLE_STORE.deviceObj), // see notes below for snValue / deviceSide
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second before writing the left side
      const snResult1 = await dispatch(
        writeDeviceSn(data.boxId, "LEFT", BLE_STORE.LeftdeviceObj), // see notes below for snValue / deviceSide
      );

      if (!snResult1.success) {
        setLoading(false);
        dispatch(
          callSnackBar(
            snResult1.message ||
              "Failed to LEFT SIDE write serial number to device",
            SNACK_BAR_VARIETNS.error,
          ),
        );
        return;
      }
      if (!snResult.success) {
        setLoading(false);
        dispatch(
          callSnackBar(
            snResult.message ||
              "Failed to RIGHT SIDE write serial number to device",
            SNACK_BAR_VARIETNS.error,
          ),
        );
        return;
      }
    }

    dispatch(
      callApiAction(
        async () =>
          await createDeviceQcApi({
            ...data,
            left: { ...data.left, result: true },
            right: { ...data.right, result: true },
            macBeforeOta: device.mac,
          }),
        async (response) => {
          dispatch(
            callSnackBar(
              "Device QC Created Successfully",
              SNACK_BAR_VARIETNS.suceess,
            ),
          );
          setLoading(false);
          BLE_STORE.BTEdisconnect = true;
          dispatch(SetStepAction(0));
          dispatch(closeModal("deviceAudioMicCheck"));

          dispatch(resetDeviceDataStore(true));
        },
        (err) => {
          setLoading(false); // was missing: spinner stayed on after an API error
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
        },
      ),
    );
  };

  return (
    <CustomDialog
      title="QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => onComplete(e)}
      onClose={() => {
        BLE_STORE.BTEdisconnect = true;
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore(true));
        dispatch(CloseDeviceDataStore());
      }}
      confirmText={"Finish"}
      disabledSubmit={!(deviceDataStore?.deviceColor && deviceDataStore?.boxId)}
    >
      <Grid container sx={{ padding: 4 }}>
        <Grid item xs={12} md={4}>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-evenly"}
          >
            <Box>
              <SafeBudsBoxContainsUI />
            </Box>
            <Box>
              <SafeBudsColorUi />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <SafeBudsBoxIdUi />
            </Grid>
          </Grid>
          <CameraCaptureComponent
            defaultFile={deviceDataStore?.boxImage || ""}
            title="Box Image Upload"
            subTitle="Upload a clear image of the box label or packaging"
            onChange={(url) => dispatch(DeviceBoxImageAction(url))}
            onDelete={() => dispatch(DeviceBoxImageAction(null))}
          />
        </Grid>
      </Grid>
    </CustomDialog>
  );
};

export default BoxContainsUI;
