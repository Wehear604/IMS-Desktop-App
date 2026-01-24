import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import audioUrl from "../../assets/images/slow_instrumental.mp3";
import {
  DEVICES,
  DEVICES_NAME,
  LISTENING_SIDE,
  SNACK_BAR_VARIETNS,
} from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import { findObjectKeyByValue } from "../../utils/main";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import disabledChecked from "../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../assets/images/checkIconEnabled.svg";
import {
  BLE_STORE,
  sendPauseCommand,
  sendPlayCommand,
} from "../../utils/bleStore";
import {
  BteDeviceCurrentVolume,
  BteDeviceMode,
  BteDeviceVolume,
  getITEOptimaData,
  getITEPrimeMode,
  getITEPrimeVolume,
  readRic8Volume,
  readRicMode,
  readRicVolumeLevel,
  RicDeviceCurrentVolume,
} from "../../store/actions/deviceQcAction";
import {
  DeviceStoreAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import { closeModal } from "../../store/actions/modalAction";
import { callSnackBar } from "../../store/actions/snackbarAction";

//--------------------------------------------
// REUSABLE STEPCARD COMPONENT
//--------------------------------------------
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
      width: "40vw",
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

//--------------------------------------------
// MAIN COMPONENT
//--------------------------------------------
const DeviceAudioMicCheckUi = () => {
  const { device, deviceQc } = useSelector((state) => state);
  const dispatch = useDispatch();

  //-----------------------------
  // AUDIO REF (LAZY INSTANTIATION)
  //-----------------------------
  const audioRef = useRef(null); // SAFE: does NOT break BLE

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const isReading = useRef(false);
  const readInterval = useRef(null);
  const mounted = useRef(true);
  const stepRef = useRef(step);
  const deviceRef = useRef(device);

  const [fields, setFields] = useState({
    body1: false,
    body2: false,
    charging: false,
  });

  const toggle = (key) => () =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    deviceRef.current = device;
  }, [device]);

  //--------------------------------------------
  // MODE CHECK FOR STEP 2
  //--------------------------------------------
  const modecheck = useCallback(
    (number) => {
      if (!deviceRef.current?.device_side) return false;

      return deviceRef.current?.device_side === LISTENING_SIDE.LEFT
        ? deviceQc.modeLeft?.includes(number)
        : deviceQc.modeRight?.includes(number);
    },
    [deviceQc.modeLeft, deviceQc.modeRight]
  );

  //--------------------------------------------
  // DEVICE QC LOGIC
  //--------------------------------------------
  const deviceQcFun = async () => {
    const step = stepRef.current;
    const dev = deviceRef.current;

    if (
      dev?.device_type === DEVICES.BTE_OPTIMA ||
      dev?.device_type === DEVICES.BTE_PRIME
    ) {
      if (step === 1) dispatch(BteDeviceVolume(dev.device_side));
      if (step === 2) dispatch(BteDeviceMode());
    }

    if (
      dev?.device_type === DEVICES.RIC_OPTIMA ||
      dev?.device_type === DEVICES.RIC_32
    ) {
      if (step === 1)
        dispatch(readRicVolumeLevel(dev.device_side, BLE_STORE.deviceObj));
      if (step === 2)
        dispatch(readRicMode(dev.device_side, BLE_STORE.deviceObj));
    }

    if (dev?.device_type === DEVICES.RIC_OPTIMA_8) {
      if (step === 1 || step === 2) dispatch(readRic8Volume(dev.device_side));
    }

    if (dev?.device_type === DEVICES.ITE_OPTIMA) {
      if (step === 1 || step === 2) dispatch(getITEOptimaData(dev.device_side));
    }

    if (
      dev?.device_type === DEVICES.ITE_PRIME ||
      dev?.device_type === DEVICES.NECKBAND
    ) {
      if (step === 1)
        dispatch(getITEPrimeVolume(dev.device_side, BLE_STORE.deviceObj));
      if (step === 2)
        dispatch(getITEPrimeMode(dev.device_side, BLE_STORE.deviceObj));
    }
  };

  //--------------------------------------------
  // START/STOP QC READING
  //--------------------------------------------
  const startReading = useCallback(() => {
    if (isReading.current) return;
    isReading.current = true;

    readInterval.current = setInterval(() => {
      if (!mounted.current) return;
      deviceQcFun();
    }, 1500);
  }, []);

  const stopReading = useCallback(() => {
    isReading.current = false;
    clearInterval(readInterval.current);
  }, []);

  //--------------------------------------------
  // START/STOP INTERVAL BASED ON STEP
  //--------------------------------------------
  useEffect(() => {
    if ((step === 1 || step === 2) && deviceQc.start) startReading();
    else stopReading();
  }, [step, deviceQc.start]);

  //--------------------------------------------
  // INIT READS
  //--------------------------------------------
  useEffect(() => {
    mounted.current = true;

    if (device?.device_side) {
      if (
        device?.device_type === DEVICES.BTE_OPTIMA ||
        device?.device_type === DEVICES.BTE_PRIME
      )
        dispatch(BteDeviceCurrentVolume(device.device_side));

      if (
        device?.device_type === DEVICES.RIC_OPTIMA ||
        device?.device_type === DEVICES.RIC_32
      )
        dispatch(RicDeviceCurrentVolume(device.device_side));

      if (device?.device_type === DEVICES.RIC_OPTIMA_8)
        dispatch(readRic8Volume(device.device_side, true));

      if (device?.device_type === DEVICES.ITE_OPTIMA)
        dispatch(getITEOptimaData(device.device_side, true));

      if (
        device?.device_type === DEVICES.ITE_PRIME ||
        device?.device_type === DEVICES.NECKBAND
      )
        dispatch(getITEPrimeVolume(device.device_side, true));
    }

    return () => {
      mounted.current = false;
      stopReading();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [device]);

  //--------------------------------------------
  // NEXT BUTTON
  //--------------------------------------------
  const handleNext = () => {
    sendPauseCommand(dispatch);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
    setStep((s) => Math.min(s + 1, 3));
  };

  //--------------------------------------------
  // PLAY/PAUSE LOGIC (FIXED & WORKING)
  //--------------------------------------------
  const handlePlayPause = () => {
    const hasDevice = Boolean(device?.device_type);

    if (isPlaying) {
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (hasDevice) sendPauseCommand(dispatch);
      return;
    }

    setIsPlaying(true);

    if (hasDevice) {
      sendPlayCommand(
        dispatch,
        device?.device_type,
        device?.device_side,
        LISTENING_SIDE,
        30
      );
    } else {
      if (!audioRef.current) audioRef.current = new Audio(audioUrl);
      audioRef.current
        .play()
        .catch((err) => console.error("MP3 play error:", err));
    }
  };

  //--------------------------------------------
  // STEP SUBMIT DISABLED STATE
  //--------------------------------------------
  const disabledSubmit = (() => {
    if (step === 0) return !Boolean(device?.is_Audio_play);

    if (step === 1)
      return device?.device_type === DEVICES.BTE_OPTIMA ||
        device?.device_type === DEVICES.BTE_PRIME ||
        device?.device_type === DEVICES.RIC_OPTIMA_8
        ? !(deviceQc?.volumeIncrease && deviceQc?.volumeDecrease)
        : !deviceQc?.volumeDecrease;

    if (step === 2) {
      const modes =
        device?.device_side === LISTENING_SIDE.LEFT
          ? deviceQc.modeLeft
          : deviceQc.modeRight;

      return !(
        Array.isArray(modes) &&
        modes.length ===
          (device?.device_type === DEVICES.BTE_OPTIMA ||
          device?.device_type === DEVICES.BTE_PRIME ||
          device?.device_type === DEVICES.RIC_OPTIMA_8
            ? 4
            : 3)
      );
    }

    if (step === 3) return !(fields.body1 && fields.body2 && fields.charging);

    return true;
  })();

  //--------------------------------------------
  // FINAL COMPLETE QC SUBMIT
  //--------------------------------------------
  const sideLabel =
    findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";
  const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown Device";

  //--------------------------------------------
  // STEP 3 COMPLETE HANDLER
  //--------------------------------------------
  const onComplete = () => {
    if (
      device?.device_type &&
      device?.device_side &&
      (deviceQc.device_side === LISTENING_SIDE.LEFT
        ? deviceQc.modeLeft
        : deviceQc.modeRight) &&
      deviceQc.volumeIncrease &&
      deviceQc.volumeDecrease &&
      fields.body1 &&
      fields.body2 &&
      fields.charging &&
      device?.is_Audio_play &&
      device?.mac
    ) {
      dispatch(
        DeviceStoreAction(
          device?.device_type,
          device?.device_side,
          device?.device_side === LISTENING_SIDE.LEFT
            ? deviceQc.modeLeft
            : deviceQc.modeRight,
          {
            volumeIncrease: deviceQc.volumeIncrease,
            volumeDecrease: deviceQc.volumeDecrease,
          },
          { body1: fields.body1, body2: fields.body2 },
          fields.charging,
          device?.is_Audio_play,
          device?.mac
        )
      );

      dispatch(closeModal("deviceAudioMicCheck"));

      if (
        device?.device_type === DEVICES.RIC_OPTIMA_8 ||
        device?.device_type === DEVICES.RIC_OPTIMA ||
        device?.device_type === DEVICES.RIC_32
      ) {
        BLE_STORE.disconnectFun();
      } else {
        BLE_STORE.BTEdisconnect = true;
      }

      dispatch(resetDeviceDataStore());

      dispatch(
        callSnackBar(
          `${sideLabel} Side Device QC Completed Successfully.`,
          SNACK_BAR_VARIETNS.suceess
        )
      );
    } else {
      dispatch(
        callSnackBar(
          `Please complete all steps ${sideLabel} before finishing the QC.`,
          SNACK_BAR_VARIETNS.error
        )
      );
    }
  };


  //--------------------------------------------
  // RETURN JSX (ALL 4 STEPS INCLUDED)
  //--------------------------------------------
  return (
    <CustomDialog
      id={step === 0 ? "deviceAudioMicCheck" : undefined}
      disabledSubmit={disabledSubmit}
      onSubmit={step === 3 ? onComplete : handleNext}
      onClose={() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        sendPauseCommand(dispatch);
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore());
      }}
      confirmText={step === 3 ? `Complete ${sideLabel} Side QC` : "Next"}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          bgcolor: "background.default",
        }}
      >
        {/* HEADER */}
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700}>
            Device Connected{" "}
            <img
              src={bluetoothIcon}
              alt="Bluetooth"
              style={{ marginLeft: 8 }}
            />
          </Typography>
          <Typography variant="h5" sx={{ color: "#DDD" }}>
            {deviceTitle} {sideLabel}
          </Typography>
          <Typography variant="h6">{device?.mac}</Typography>
        </Box>

        {/* STEP 0 - AUDIO */}
        {step === 0 && (
          <StepCard
            isChecked={true}
            checked={Boolean(device?.is_Audio_play)}
            title="Audio Check"
            subtitle="Test device audio output"
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
        )}

        {/* STEP 1 - VOLUME */}
        {step === 1 && (
          <Box>
            {(device?.device_type === DEVICES.BTE_OPTIMA ||
              device?.device_type === DEVICES.BTE_PRIME ||
              device?.device_type === DEVICES.RIC_OPTIMA_8) && (
              <StepCard
                isChecked={true}
                checked={deviceQc.volumeIncrease}
                title={
                  deviceQc.volumeIncrease
                    ? "Volume Level Increased"
                    : "Increase Volume"
                }
              />
            )}
            <StepCard
              isChecked={true}
              checked={deviceQc.volumeDecrease}
              title={
                device?.device_type === DEVICES.BTE_OPTIMA ||
                device?.device_type === DEVICES.BTE_PRIME ||
                device?.device_type === DEVICES.RIC_OPTIMA_8
                  ? deviceQc.volumeDecrease
                    ? "Volume Level Decreased"
                    : "Decrease Volume"
                  : deviceQc.volumeDecrease
                  ? "Volume Level Set"
                  : "Set Volume Level"
              }
            />
          </Box>
        )}

        {/* STEP 2 - MODES */}
        {step === 2 && (
          <Box>
            <StepCard
              isChecked={true}
              checked={modecheck(0)}
              title={modecheck(0) ? "First Mode Tested" : "Test First Mode"}
            />
            <StepCard
              isChecked={true}
              checked={modecheck(1)}
              title={modecheck(1) ? "Second Mode Tested" : "Test Second Mode"}
            />
            <StepCard
              isChecked={true}
              checked={modecheck(2)}
              title={modecheck(2) ? "Third Mode Tested" : "Test Third Mode"}
            />
            {(device?.device_type === DEVICES.BTE_OPTIMA ||
              device?.device_type === DEVICES.BTE_PRIME ||
              device?.device_type === DEVICES.RIC_OPTIMA_8) && (
              <StepCard
                isChecked={true}
                checked={modecheck(3)}
                title={modecheck(3) ? "Fourth Mode Tested" : "Test Fourth Mode"}
              />
            )}
          </Box>
        )}

        {/* STEP 3 - BODY + CHARGING */}
        {step === 3 && (
          <>
            {/* BODY CHECK */}
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
      </Box>
    </CustomDialog>
  );
};

export default DeviceAudioMicCheckUi;
