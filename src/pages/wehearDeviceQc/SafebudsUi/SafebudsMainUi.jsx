import React, { useEffect, useState } from "react";
import SafeBudsFotUpload from "./SafeBudsFotUpload";
import DeviceConnectUi from "../DeviceConnectUi";
import TapQCSafebudsUi from "./TapQCSafebudsUi";
import MicCheckUiSafeBudsUi from "./MicCheckUiSafeBudsUi";
import AudioCheckSafeBudsUi from "./AudioCheckSafeBudsUi";
import SafeBudsBodyCheck from "./SafeBudsBodyCheck";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import SafeBudsBoxContainsUI from "./SafeBudsBoxContainsUI";
import SafeBudsColorUi from "./SafeBudsColorUi";
import SafeBudsBoxIdUi from "./SafeBudsBoxIdUi";
import {
  ChangeButtonSide,
  FetchVolumeSafebudsDevice,
  SafebudsDeviceCurrentVolume,
  SafeBudsTap,
} from "../../../store/actions/deviceQcAction";
import { LISTENING_SIDE, SNACK_BAR_VARIETNS } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import safeBudsGif from "../../../assets/images/Safe Buds Video Final C.mp4";
import { closeModal, openModal } from "../../../store/actions/modalAction";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import { SetStepAction } from "../../../store/actions/stepAction";
import { createDeviceQcApi } from "../../../apis/deviceQc.api";
import {
  CloseDeviceDataStore,
  resetDeviceDataStore,
} from "../../../store/actions/deviceDataAction";
import { callSnackBar } from "../../../store/actions/snackbarAction";
import { BLE_STORE } from "../../../utils/bleStore";
import useValidate from "../../../store/hooks/useValidator";
import { callApiAction } from "../../../store/actions/commonAction";

const SafebudsMainUi = () => {
  const dispatch = useDispatch();
  const { device, deviceDataStore, step, deviceQc } = useSelector(
    (state) => state,
  );
  const validate = useValidate();
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    body1: false,
    body2: false,
    charging: false,
  });

  useEffect(() => {
    dispatch(SafeBudsTap({ type: "Tap" }));
    dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    dispatch(SafebudsDeviceCurrentVolume());
  }, []);

  const tapcheck = (number) => {
    if (!device?.device_side) return false;

    return device?.device_side === LISTENING_SIDE.LEFT
      ? deviceQc.modeLeft?.includes(number)
      : deviceQc.modeRight?.includes(number);
  };

  const isStepValid = () => {
    if (step.step === 2) {
      return tapcheck(1) && tapcheck(2) && tapcheck(3) && tapcheck(4);
    }
    return true;
  };
  const data = {
    left: {
      device_type: device?.device_type,
      mode: deviceQc.modeLeft,
      volume: {
        volumeIncrease: deviceQc.volumeIncrease,
        volumeDecrease: deviceQc.volumeIncrease,
      },
      body: {
        body1: fields.body1,
        body2: fields.body2,
      },
      charging: fields.charging,
      audio: device?.is_Audio_play,
      mac: device?.mac,
      result: false,
      mic: device?.isMic,
    },
    right: {
      device_type: device?.device_type,
      mode: deviceQc.modeRight,
      volume: {
        volumeIncrease: deviceQc.volumeIncrease,
        volumeDecrease: deviceQc.volumeIncrease,
      },
      body: {
        body1: fields.body1,
        body2: fields.body2,
      },
      charging: fields.charging,
      audio: device?.is_Audio_play,
      mac: device?.mac,
      result: false,
      mic: device?.isMic,
    },
    box_Contains: deviceDataStore.box_Contains ?? [],
    deviceColor: deviceDataStore.deviceColor ?? "69521eea409668adad3cf8e2",
    boxId: deviceDataStore.boxId ?? "0000000000",
    device: device?.device_type,
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(
      callApiAction(
        async () => await createDeviceQcApi(data),
        async (response) => {
          dispatch(SetStepAction(0));
          BLE_STORE.BTEdisconnect = true;
          dispatch(
            callSnackBar("Device QC Rejectes", SNACK_BAR_VARIETNS.warning),
          );
          dispatch(resetDeviceDataStore());
          dispatch(closeModal("deviceAudioMicCheck"));
        },
        (err) => {
          console.log("first", err);
        },
      ),
    );
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
          dispatch(resetDeviceDataStore());
        },
        (err) => {
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
        },
      ),
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    dispatch(SetStepAction(step.step + 1));
  };
console.log("data check",        device.is_Audio_play ,
        deviceQc.volumeIncrease ,
        fields.body1 ,
        fields.body2 ,
        fields.charging ,
        device.isMic);
  const disableNext = () => {
    if (step.step === 2) {
      return !isStepValid();
    } else if (step.step === 3) {
      return !(
        device.is_Audio_play &&
        deviceQc.volumeIncrease &&
        fields.body1 &&
        fields.body2 &&
        fields.charging &&
        device.isMic
      );
    } else if (step.step === 4) {
      return !(deviceDataStore.deviceColor && deviceDataStore.boxId);
    }
    return false;
  };
  return (
    <CustomDialog
      // err={fields?.err}
      title="SafeBuds QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => (step.step === 4 ? onComplete(e) : handleNext(e))}
      onClose={() => {
        BLE_STORE.BTEdisconnect = true;
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore());
        dispatch(CloseDeviceDataStore());
      }}
      onReject={(e) => {
        onSubmit(e);
      }}
      isReject={true}
      closeText="Reject Qc"
      confirmText={step.step === 4 ? `Finish` : "Next"}
      disabledSubmit={disableNext()}
    >
      <Box sx={{ p: 1 }}>
        <Stepper sx={{ p: 2 }} activeStep={step.step} alternativeLabel>
          <Step>
            <StepLabel>Device Connection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Upload FOT</StepLabel>
          </Step>
          <Step>
            <StepLabel>Touch Check</StepLabel>
          </Step>
          <Step>
            <StepLabel>Audio and Mic Test</StepLabel>
          </Step>
          <Step>
            <StepLabel>Packaging Details</StepLabel>
          </Step>
        </Stepper>

        <Divider sx={{}} />
        {!device.fotfile1 && step.step === 1 && <SafeBudsFotUpload />}
        {step.step == 2 && (
          <Box p={6}>
            <TapQCSafebudsUi />
          </Box>
        )}
        {step.step === 3 && (
          <Grid container>
            <Grid item xs={12} md={5.9} mt={2} pr={2}>
              <Box>
                <AudioCheckSafeBudsUi />
              </Box>
              <Divider />
              <Box mt={2} pr={2}>
                <SafeBudsBodyCheck setFields={setFields} fields={fields} />
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={12} md={5.9} mt={2} p={2}>
              <MicCheckUiSafeBudsUi />{" "}
            </Grid>
          </Grid>
        )}
        {step.step === 4 && (
          <>
            {" "}
            <Grid container sx={{ padding: 4 }}>
              <Grid item xs={12} md={4}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Stack spacing={4}>
                      <SafeBudsBoxContainsUI />
                      <SafeBudsColorUi />
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                    <SafeBudsBoxIdUi />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>{" "}
          </>
        )}
      </Box>
    </CustomDialog>
  );
};

export default SafebudsMainUi;
