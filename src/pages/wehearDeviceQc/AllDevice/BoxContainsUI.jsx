import React, { useState } from "react";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import { closeModal } from "../../../store/actions/modalAction";
import {
  CloseDeviceDataStore,
  resetDeviceDataStore,
} from "../../../store/actions/deviceDataAction";
import { useDispatch, useSelector } from "react-redux";
import { BLE_STORE } from "../../../utils/bleStore";
import { SNACK_BAR_VARIETNS } from "../../../utils/constants";
import { createDeviceQcApi } from "../../../apis/deviceQc.api";
import { callSnackBar } from "../../../store/actions/snackbarAction";
import { SetStepAction } from "../../../store/actions/stepAction";
import { callApiAction } from "../../../store/actions/commonAction";
import { Box, Grid } from "@mui/material";
import SafeBudsBoxContainsUI from "../SafebudsUi/SafeBudsBoxContainsUI";
import SafeBudsColorUi from "../SafebudsUi/SafeBudsColorUi";
import SafeBudsBoxIdUi from "../SafebudsUi/SafeBudsBoxIdUi";

const BoxContainsUI = ({ fields }) => {
      const { device, deviceQc, deviceDataStore } = useSelector(
        (state) => state,
      );
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
  };

  const onComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      callApiAction(
        async () =>
          await createDeviceQcApi({
            ...data,
            left: {
              ...data.left,
              result: true,
            },
            right: { ...data.right, result: true },
            macBeforeOta: device.mac,
          }),
        async (response) => {
          setLoading(false);
          BLE_STORE.BTEdisconnect = true;
          dispatch(SetStepAction(0));
          dispatch(closeModal("deviceAudioMicCheck"));
          dispatch(
            callSnackBar(
              "Device QC Created Successfully",
              SNACK_BAR_VARIETNS.suceess,
            ),
          );
          dispatch(resetDeviceDataStore(true));
        },
        (err) => {
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
        </Grid>
      </Grid>
    </CustomDialog>
  );
};

export default BoxContainsUI;
