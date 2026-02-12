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

const SafebudsMainUi = () => {
  const dispatch = useDispatch();
  const { device, deviceDataStore, step, deviceQc } = useSelector(
    (state) => state,
  );
  console.log("first step", step.step == 2, step);
  // const [step, setStep] = useState(0);
  console.log("object device", device);
  console.log("object deviceDataStore", deviceDataStore);

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

  const isStepValid = () => {
    if (step.step === 0) {
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
    box_Contains: [],
    deviceColor: null,
    boxId: "0000000000",
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

  const onComplete = async () => {
    const validationResponse = validate(validationSchemaForCreate);

    if (validationResponse === true) {
      setLoading(true);
      dispatch(
        callApiAction(
          async () =>
            await createDeviceQcApi({
              ...deviceDataStore,
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
    } else {
      dispatch(callSnackBar(validationResponse, SNACK_BAR_VARIETNS.warning));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    dispatch(SetStepAction(step.step + 1));
  };
  return (
    <CustomDialog
      // err={fields?.err}
      title="SafeBuds QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => (step === 3 ? onComplete(e) : handleNext(e))}
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
      confirmText={step === 3 ? `Finish` : "Next"}
      disabledSubmit={isStepValid() === false}
    >
      <Box sx={{ p: 4 }}>
        <Stepper activeStep={step.step} alternativeLabel>
          <Step>
            <StepLabel>Device Connection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Upload FOT</StepLabel>
          </Step>
          <Step>
            <StepLabel>Functioning Test</StepLabel>
          </Step>
          <Step>
            <StepLabel>Audio and Mic Test</StepLabel>
          </Step>
          <Step>
            <StepLabel>Packaging Details</StepLabel>
          </Step>
        </Stepper>

        <Divider sx={{ my: 4 }} />
        {!device.fotfile1 && step.step === 1 && <SafeBudsFotUpload />}
        {step.step == 2 && (
          <Box p={6}>
            <TapQCSafebudsUi />
          </Box>
        )}
        {step.step === 3 && (
          <Grid container>
            <Grid item xs={12} md={5.9} p={2}>
              <Box>
                <AudioCheckSafeBudsUi />
              </Box>
              <Divider />
              <Box mt={4}>
                <SafeBudsBodyCheck setFields={setFields} fields={fields} />
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid mb={4} item xs={12} md={5.9} p={6}>
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
