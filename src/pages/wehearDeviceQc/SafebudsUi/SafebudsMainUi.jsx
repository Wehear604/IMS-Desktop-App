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
import { LISTENING_SIDE } from "../../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import safeBudsGif from "../../../assets/images/Safe Buds Video Final C.mp4";
import { openModal } from "../../../store/actions/modalAction";
import CustomDialog from "../../../components/layouts/common/CustomDialog";

const SafebudsMainUi = () => {
  const dispatch = useDispatch();
  const { device, deviceDataStore } = useSelector((state) => state);
  const [step, setStep] = useState(0);
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

  return (
    <Box sx={{ p: 4 }}>
      <Stepper
        activeStep={step}
        alternativeLabel
      >
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
      {!device.connected && step === 0 && <DeviceConnectUi />}
      {!device.fotfile1 && step === 1 && (
        <SafeBudsFotUpload step={step} setStep={setStep} />
      )}
      {step === 2 && (
        <Box p={6}>
          <TapQCSafebudsUi />
        </Box>
      )}
      {step === 3 && (
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
      {step === 4 && (
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
      {
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              setStep((prev) => prev + 1);
            }}
            sx={{ visibility: step === 1 && "hidden" }}
          >
            <Typography variant="h5">Next</Typography>
          </Button>
        </Box>
      }
    </Box>
  );
};

export default SafebudsMainUi;
