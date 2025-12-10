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
import audioUrl from "../../assets/images/AirplaneInterior.mp3";
import {
  CHARACTERISTIC_UUID_READ_WRITE,
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
  readRicMode,
  readRicVolumeLevel,
  RicDeviceCurrentVolume,
} from "../../store/actions/deviceQcAction";
import {
  DeviceStoreAction,
  disconnectAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import { closeModal } from "../../store/actions/modalAction";
import { callSnackBar } from "../../store/actions/snackbarAction";

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

const DeviceAudioMicCheckUi = () => {
  const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const dispatch = useDispatch();

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

  const toggle = (key) => () => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    deviceRef.current = device;
  }, [device]);

  const modecheck = useCallback(
    (number) => {
      if (!deviceRef.current?.device_side) return false;
      return deviceRef.current?.device_side === LISTENING_SIDE.LEFT
        ? Array.isArray(deviceQc.modeLeft) &&
        deviceQc.modeLeft.includes(number)
        : Array.isArray(deviceQc.modeRight) &&
        deviceQc.modeRight.includes(number);
    },
    [deviceQc.modeLeft, deviceQc.modeRight]
  );

  const deviceQcFun = async () => {
    const currentStep = stepRef.current;
    const currentDevice = deviceRef.current;
    if (
      currentDevice?.device_type === DEVICES.BTE_OPTIMA ||
      currentDevice?.device_type === DEVICES.BTE_PRIME
    ) {
      if (currentStep === 1) {
        dispatch(BteDeviceVolume(currentDevice.device_side));
      } else if (currentStep === 2) {
        dispatch(BteDeviceMode());
      }
    } else if (
      currentDevice?.device_type === DEVICES.RIC_OPTIMA_8 ||
      currentDevice?.device_type === DEVICES.RIC_OPTIMA ||
      currentDevice?.device_type === DEVICES.RIC_32
    ) {
      if (currentStep === 1) {
        dispatch(
          readRicVolumeLevel(
            currentDevice.device_side,
            BLE_STORE.deviceObj
          )
        );
      } else if (currentStep === 2) {
        dispatch(
          readRicMode(currentDevice.device_side, BLE_STORE.deviceObj)
        );
      }
    }
  };

  const startReading = useCallback(() => {
    if (isReading.current) return;
    isReading.current = true;

    if (readInterval.current) {
      clearInterval(readInterval.current);
      readInterval.current = null;
    }

    readInterval.current = setInterval(() => {
      if (!mounted.current) return;
      try {
        deviceQcFun();
      } catch (err) { }
    }, 1500);
  }, [dispatch]);

  const stopReading = useCallback(() => {
    isReading.current = false;
    if (readInterval.current) {
      clearInterval(readInterval.current);
      readInterval.current = null;
    }
  }, []);

  useEffect(() => {
    setIsPlaying(Boolean(device?.is_Audio_play));
  }, [device?.is_Audio_play]);

  useEffect(() => {
    if ((step === 1 || step === 2) && deviceQc.start) {
      startReading();
    } else {
      stopReading();
    }
  }, [step, deviceQc.start, startReading, stopReading]);

  useEffect(() => {
    mounted.current = true;
    if (device?.device_side) {
      if (
        device?.device_type === DEVICES.BTE_OPTIMA ||
        device?.device_type === DEVICES.BTE_PRIME
      ) {
        dispatch(BteDeviceCurrentVolume(device.device_side));
      } else if (
        device?.device_type === DEVICES.RIC_OPTIMA_8 ||
        device?.device_type === DEVICES.RIC_OPTIMA ||
        device?.device_type === DEVICES.RIC_32
      ) {
        dispatch(RicDeviceCurrentVolume(device.device_side));
      }
    }
    return () => {
      mounted.current = false;
      stopReading();
    };
  }, [dispatch, device?.device_side, device?.device_type, stopReading]);


  const handleNext = useCallback(() => {
    sendPauseCommand(dispatch);
    setIsPlaying(false);
    setStep((s) => Math.min(s + 1, 3));
  }, [dispatch]);
  const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";
  const sideLabel =
    findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";

  const onComplete = useCallback(() => {
    if (
      device?.device_type &&
      device?.device_side &&
      (deviceQc?.device_side === LISTENING_SIDE.LEFT
        ? deviceQc?.modeLeft
        : deviceQc?.modeRight) &&
      deviceQc?.volumeIncrease &&
      deviceQc?.volumeDecrease &&
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
          deviceQc?.device_side === LISTENING_SIDE.LEFT
            ? deviceQc?.modeLeft
            : deviceQc?.modeRight,
          {
            volumeIncrease: deviceQc?.volumeIncrease,
            volumeDecrease: deviceQc?.volumeDecrease,
          },
          {
            body1: fields.body1,
            body2: fields.body2,
          },
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
  }, [dispatch, device, deviceQc, fields]);

  const disabledSubmit = (() => {
    if (step === 0) return !Boolean(device?.is_Audio_play);
    if (step === 1)
      return !(deviceQc?.volumeIncrease && deviceQc?.volumeDecrease);
    if (step === 2) {
      const modes =
        device?.device_side === LISTENING_SIDE.LEFT
          ? deviceQc?.modeLeft
          : deviceQc?.modeRight;
      return !(Array.isArray(modes) && modes.length === (device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME ? 4 : 3));
    }
    if (step === 3) {
      return !(fields.body1 && fields.body2 && fields.charging);
    }
    return true;
  })();

  return (
    <CustomDialog
      id={step === 0 ? `deviceAudioMicCheck` : undefined}
      disabledSubmit={disabledSubmit}
      onSubmit={step === 3 ? onComplete : handleNext}
      // closeText={step === 0 ? "Close" : "Back"}
      confirmText={step === 3 ? `Complete ${sideLabel} Side Qc` : "Next"}
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
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Device Connected{" "}
            <img
              src={bluetoothIcon}
              alt="Bluetooth Icon"
              style={{ marginLeft: 8 }}
            />
          </Typography>

          <Typography variant="h5" sx={{ color: "#DDD" }}>
            {deviceTitle} {sideLabel}
          </Typography>

          <Typography variant="h6">{device?.mac}</Typography>
        </Box>

        {step === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <StepCard
              isChecked={true}
              checked={Boolean(device?.is_Audio_play)}
              title="Audio Check"
              subtitle="Test device audio output"
              action={
                <Button
                  variant="contained"
                  onClick={() =>
                    isPlaying
                      ? (setIsPlaying(false), sendPauseCommand(dispatch))
                      : (setIsPlaying(false), sendPlayCommand(dispatch, device?.device_type, findObjectKeyByValue(device?.device_side, LISTENING_SIDE), 100))
                  }
                  startIcon={
                    isPlaying ? (
                      <PauseIcon sx={{ ml: 2 }} />
                    ) : (
                      <PlayArrowIcon sx={{ ml: 2 }} />
                    )
                  }
                  sx={{
                    bgcolor: "#0d5966",
                    borderRadius: "25%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0,
                    height: "6vh",
                  }}
                />
              }
            />
          </Box>
        )}

        {step === 1 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            {(device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME) && <StepCard
              isChecked={true}
              checked={deviceQc?.volumeIncrease}
              title={
                deviceQc?.volumeIncrease
                  ? "Volume Level Increased"
                  : "Increase Volume"
              }
            />}
            <StepCard
              isChecked={true}
              checked={deviceQc?.volumeDecrease}
              title={(device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME) ?
                deviceQc?.volumeDecrease
                  ? "Volume Level Decreased"
                  : "Decrease Volume"
                : deviceQc?.volumeDecrease
                  ? "Volume Level Set"
                  : "Set Volume Level"
              }
            />
          </Box>
        )}

        {step === 2 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <StepCard
              isChecked={true}
              checked={modecheck(0)}
              title={
                modecheck(0) ? "First Mode Has Been tested." : "Test First Mode"
              }
            />
            <StepCard
              isChecked={true}
              checked={modecheck(1)}
              title={
                modecheck(1)
                  ? "Second Mode Has Been tested."
                  : "Test Second Mode"
              }
            />
            <StepCard
              isChecked={true}
              checked={modecheck(2)}
              title={
                modecheck(2) ? "Third Mode Has Been tested." : "Test Third Mode"
              }
            />
            {(device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME) && <StepCard
              isChecked={true}
              checked={modecheck(3)}
              title={
                modecheck(3)
                  ? "Fourth Mode Has Been tested."
                  : "Test Fourth Mode"
              }
            />}
          </Box>
        )}

        {step === 3 && (
          <>
            <Box display={"flex"} justifyContent={"flex-start"} width={"100%"}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Body Check
              </Typography>
            </Box>
            <Box
              ml={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <StepCard
                checkBox={
                  <Checkbox checked={fields.body1} onChange={toggle("body1")} />
                }
                title={"Device checked for damage"}
              />
              <StepCard
                checkBox={
                  <Checkbox checked={fields.body2} onChange={toggle("body2")} />
                }
                title={"Body checked for scratches"}
              />
            </Box>
            <Box display={"flex"} justifyContent={"flex-start"} width={"100%"}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Charging
              </Typography>
            </Box>
            <Box
              ml={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <StepCard
                checkBox={
                  <Checkbox
                    checked={fields.charging}
                    onChange={toggle("charging")}
                  />
                }
                title={"Charging function has been verified"}
              />
            </Box>
          </>
        )}
      </Box>
    </CustomDialog>
  );
};

export default DeviceAudioMicCheckUi;
