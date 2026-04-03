import React, { useCallback, useEffect, useState } from "react";
import {
  ChangeButtonSide,
  FetchVolumeSafebudsDevice,
  SafebudsDeviceCurrentVolume,
  SafeBudsDeviceName,
  SafebudsDeviceQCResultCheck,
  SafeBudsTap,
  SafeBudsVersionRead,
  SafeBudsVersionUpdate,
} from "../../../store/actions/deviceQcAction";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  ListItem,
  List,
  ListItemText,
  Card,
  ButtonGroup,
  Button,
  Checkbox,
} from "@mui/material";
import CustomDialog from "../../../components/layouts/common/CustomDialog";
import disabledChecked from "../../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../../assets/images/checkIconEnabled.svg";
import MicCheckUi from "./MicCheckUi";
import {
  CloseDeviceDataStore,
  DeviceIsAudioCheck,
  DeviceSideAction,
  DeviceStoreAction,
  resetDeviceDataStore,
} from "../../../store/actions/deviceDataAction";
import { LISTENING_SIDE, SNACK_BAR_VARIETNS } from "../../../utils/constants";
import ButtonComponentsUi from "../../../components/button/ButtonComponentsUi";
import { use } from "react";
import audioUrl from "../../../assets/images/slow_instrumental.mp3";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { closeModal } from "../../../store/actions/modalAction";
import { callSnackBar } from "../../../store/actions/snackbarAction";
import { BLE_STORE } from "../../../utils/bleStore";
import { callApiAction } from "../../../store/actions/commonAction";
import { createDeviceQcApi } from "../../../apis/deviceQc.api";

const StepCard = ({
  isChecked,
  checked,
  title,
  subtitle,
  action,
  checkBox,
}) => (
  <Card
    sx={{
      width: "100%",
      borderRadius: 2,
      boxShadow: 0,
      border: "1px solid #e6e6e6",
      mb: 2,
    }}
  >
    <List>
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display={"flex"} gap={4} alignItems="center">
          {isChecked ? (
            <img src={checked ? enabledChecked : disabledChecked} alt="check" />
          ) : (
            checkBox && <Box>{checkBox}</Box>
          )}
          <ListItemText
            primary={<Typography variant="h5">{title}</Typography>}
            secondary={
              subtitle ? <Typography variant="h6">{subtitle}</Typography> : null
            }
          />
        </Box>
        {action && <Box>{action}</Box>}
      </ListItem>
    </List>
  </Card>
);

const SafeBudsUi = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const [fields, setFields] = useState({
    body1: false,
    body2: false,
    charging: false,
    err: "",
  });

  const toggle = (key) => () =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const tapcheck = (number) => {
    if (!device?.device_side) return false;

    return device?.device_side === LISTENING_SIDE.LEFT
      ? deviceQc.modeLeft?.includes(number)
      : deviceQc.modeRight?.includes(number);
  };

  useEffect(() => {
    // dispatch(SafeBudsVersionUpdate({ type: "ble" }));
    // dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    dispatch(SafeBudsTap({ type: "Tap" }));
    dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    dispatch(SafebudsDeviceCurrentVolume());
    // dispatch(SafeBudsVersionRead({ type: "SafeBudsVersionRead" }));
  }, []);

  useEffect(() => {
    if (deviceQc.volumeIncrease) return;
    if (step === 1) {
      const interval = setInterval(async () => {
        dispatch(FetchVolumeSafebudsDevice());
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [step, deviceQc.volumeIncrease]);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true; // optional
    audioRef.current.volume = 1;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
    dispatch(DeviceIsAudioCheck(true));
    setIsPlaying((prev) => !prev);
  };

  const onComplete = (e) => {
    e.preventDefault();
    // if (!deviceDataStore.left.result || !deviceDataStore.right.result) {
    //   dispatch(
    //     DeviceStoreAction(
    //       device?.device_type,
    //       LISTENING_SIDE.LEFT,
    //       deviceQc.modeLeft,
    //       {
    //         volumeIncrease: deviceQc.volumeIncrease,
    //         volumeDecrease: true,
    //       },
    //       { body1: fields.body1, body2: fields.body2 },
    //       fields.charging,
    //       device?.is_Audio_play,
    //       device?.mac,
    //       device?.isMic
    //     )
    //   );
    //   dispatch(
    //     DeviceStoreAction(
    //       device?.device_type,
    //       LISTENING_SIDE.RIGHT,
    //       deviceQc.modeRight,
    //       {
    //         volumeIncrease: deviceQc.volumeIncrease,
    //         volumeDecrease: true,
    //       },
    //       { body1: fields.body1, body2: fields.body2 },
    //       fields.charging,
    //       device?.is_Audio_play,
    //       device?.mac,
    //       device?.isMic
    //     )
    //   );
    //   dispatch(closeModal("deviceAudioMicCheck"));
    //   BLE_STORE.BTEdisconnect = true;

    //   dispatch(resetDeviceDataStore());
    // } else
    if (
      device?.device_type &&
      device?.device_side &&
      deviceQc.modeLeft &&
      deviceQc.modeRight &&
      deviceQc.volumeIncrease &&
      fields.body1 &&
      fields.body2 &&
      fields.charging &&
      device?.is_Audio_play &&
      device?.isMic &&
      device?.mac
    ) {
      dispatch(
        DeviceStoreAction(
          device?.device_type,
          LISTENING_SIDE.LEFT,
          deviceQc.modeLeft,
          {
            volumeIncrease: deviceQc.volumeIncrease,
            volumeDecrease: true,
          },
          { body1: fields.body1, body2: fields.body2 },
          fields.charging,
          device?.is_Audio_play,
          device?.mac,
          device?.isMic,
        ),
      );
      dispatch(
        DeviceStoreAction(
          device?.device_type,
          LISTENING_SIDE.RIGHT,
          deviceQc.modeRight,
          {
            volumeIncrease: deviceQc.volumeIncrease,
            volumeDecrease: true,
          },
          { body1: fields.body1, body2: fields.body2 },
          fields.charging,
          device?.is_Audio_play,
          device?.mac,
          device?.isMic,
        ),
      );

      dispatch(closeModal("deviceAudioMicCheck"));

      BLE_STORE.BTEdisconnect = true;
      dispatch(
        callSnackBar(
          `SafeBuds Side Device QC Completed Successfully.`,
          SNACK_BAR_VARIETNS.suceess,
        ),
      );
    } else {
      dispatch(
        callSnackBar(
          `Please complete all steps before finishing the QC.`,
          SNACK_BAR_VARIETNS.error,
        ),
      );
    }
  };

  const isStepValid = () => {
    if (step === 0) {
      return tapcheck(1) && tapcheck(2) && tapcheck(3) && tapcheck(4);
    }

    if (step === 1) {
      return device.is_Audio_play && deviceQc.volumeIncrease;
    }

    if (step === 2) {
      return device?.isMic; // adjust if MicCheckUi updates something else
    }

    if (step === 3) {
      return fields.body1 && fields.body2 && fields.charging;
    }

    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
    if (isPlaying) {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    if ([1, 2, 3, 4].every((val) => deviceQc.modeRight?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    } else if ([1, 2, 3, 4].every((val) => deviceQc.modeLeft?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT));
    }
  }, [deviceQc.modeLeft, deviceQc.modeRight]);

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
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await createDeviceQcApi(data),
        async (response) => {
          setLoading(false);
          setStep(0);
          BLE_STORE.BTEdisconnect = true;
          dispatch(
            callSnackBar("Device QC Rejectes", SNACK_BAR_VARIETNS.warning),
          );
          dispatch(resetDeviceDataStore(true));
          dispatch(closeModal("deviceAudioMicCheck"));
        },
        (err) => {
          setFields({ ...fields, err });
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
        },
      ),
    );
  };

  console.log("object device reducer data", device);

  return (
    <CustomDialog
      err={fields?.err}
      title="SafeBuds QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => (step === 3 ? onComplete(e) : handleNext(e))}
      onClose={() => {
        BLE_STORE.BTEdisconnect = true;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore(true));
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
      {step === 0 && (
        <ButtonGroup sx={{ width: "100%", mb: 2 }}>
          <ButtonComponentsUi
            onSubmit={() => dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT))}
            ButtonGroup
            STATUSWiseData={device?.device_side === LISTENING_SIDE.LEFT}
            Title={"LEFT SIDE"}
          />
          <ButtonComponentsUi
            onSubmit={() => dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT))}
            ButtonGroup
            STATUSWiseData={device?.device_side === LISTENING_SIDE.RIGHT}
            Title={"RIGHT SIDE"}
          />
        </ButtonGroup>
      )}
      {step === 0 && (
        <>
          <StepCard
            isChecked={true}
            checked={tapcheck(1)}
            title="Single Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(2)}
            title="Double Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(3)}
            title="Triple Touch"
            //   subtitle="Test device audio output"
          />

          <StepCard
            isChecked={true}
            checked={tapcheck(4)}
            title="Long Press"
            //   subtitle="Test device audio output"
          />
        </>
      )}

      {step === 1 && (
        <Box>
          <StepCard
            isChecked={true}
            title="Audio Check"
            subtitle="Test device audio output"
            checked={device.is_Audio_play}
            action={
              <Button
                variant="contained"
                onClick={handlePlayPause}
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                sx={{
                  bgcolor: "#0d5966",
                  borderRadius: "25%",
                  height: "6vh",
                }}
              />
            }
          />
          <StepCard
            isChecked={true}
            checked={deviceQc.volumeIncrease}
            title={"Volume Level check"}
          />
        </Box>
      )}
      {step === 2 && <MicCheckUi />}
      {step === 3 && (
        <>
          <Box width="100%">
            <Typography variant="h3" fontWeight={700} mb={2}>
              Body Check
            </Typography>
          </Box>

          <Box ml={2}>
            <StepCard
              checkBox={
                <Checkbox checked={fields.body1} onChange={toggle("body1")} />
              }
              title="Device checked for damage"
            />

            <StepCard
              checkBox={
                <Checkbox checked={fields.body2} onChange={toggle("body2")} />
              }
              title="Body checked for scratches"
            />
          </Box>

          {/* CHARGING CHECK */}
          <Box width="100%">
            <Typography variant="h3" fontWeight={700} mb={2}>
              Charging
            </Typography>
          </Box>

          <Box ml={2}>
            <StepCard
              checkBox={
                <Checkbox
                  checked={fields.charging}
                  onChange={toggle("charging")}
                />
              }
              title="Charging function verified"
            />
          </Box>
        </>
      )}
    </CustomDialog>
  );
};

export default SafeBudsUi;
