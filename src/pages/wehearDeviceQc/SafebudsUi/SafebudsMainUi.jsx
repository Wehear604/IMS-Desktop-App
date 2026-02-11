import React, { useState } from "react";
import SafeBudsFotUpload from "./SafeBudsFotUpload";
import DeviceConnectUi from "../DeviceConnectUi";
import TapQCSafebudsUi from "./TapQCSafebudsUi";
import MicCheckUiSafeBudsUi from "./MicCheckUiSafeBudsUi";
import AudioCheckSafeBudsUi from "./AudioCheckSafeBudsUi";
import SafeBudsBodyCheck from "./SafeBudsBodyCheck";
import { Grid, Stack } from "@mui/material";
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

const SafebudsMainUi = () => {
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
    <>
      <SafeBudsFotUpload />
      <></>
      <DeviceConnectUi />
      <TapQCSafebudsUi />
      <AudioCheckSafeBudsUi />
      <MicCheckUiSafeBudsUi />
      <SafeBudsBodyCheck setFields={setFields} fields={fields} />

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
      </Grid>
    </>
  );
};

export default SafebudsMainUi;
