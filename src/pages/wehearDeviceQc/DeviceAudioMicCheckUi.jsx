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
  AllDeviceAudioCheck,
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
  disconnectAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callSnackBar } from "../../store/actions/snackbarAction";
import AudioCheckSafeBudsUi from "./SafebudsUi/AudioCheckSafeBudsUi";
import SafebudsMainUi from "./SafebudsUi/SafebudsMainUi";
import BoxContainsUI from "./AllDevice/BoxContainsUI";
import MessageDilog from "../../components/texts/MessageDilog";
import { createDeviceQcApi } from "../../apis/deviceQc.api";
import { callApiAction } from "../../store/actions/commonAction";

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
  console.log("deviceDataStore", deviceDataStore);
  const dispatch = useDispatch();
  const audioRef = useRef(null);
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
        ? Array.isArray(deviceQc.modeLeft) && deviceQc.modeLeft.includes(number)
        : Array.isArray(deviceQc.modeRight) &&
            deviceQc.modeRight.includes(number);
    },
    [deviceQc.modeLeft, deviceQc.modeRight],
  );

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
      } catch (err) {}
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

  const handleNext = useCallback(
    (e) => {
      e.preventDefault();
      sendPauseCommand(dispatch);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      if (device?.device_type === DEVICES.ITE_PRIME) {
        setStep((s) => Math.min(s == 0 ? s + 2 : s + 1, 3));
      } else {
        setStep((s) => Math.min(s + 1, 3));
      }
    },
    [dispatch],
  );
  const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";
  const sideLabel =
    findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";

  const onComplete = useCallback(
    (e) => {
      e.preventDefault();
      if (
        device?.device_type &&
        device?.device_side &&
        (deviceQc?.device_side === LISTENING_SIDE.LEFT
          ? deviceQc?.modeLeft
          : deviceQc?.modeRight) &&
        (deviceQc?.volumeIncrease || deviceQc?.volumeDecrease) &&
        fields.body1 &&
        fields.body2 &&
        fields.charging &&
        (device?.device_type === DEVICES.BTE_OPTIMA ||
          device?.device_type === DEVICES.BTE_PRIME)
          ? device?.is_Audio_play && device?.isMic
          : device?.isMic && device?.mac
      ) {
        dispatch(
          DeviceStoreAction(
            device?.device_type,
            device?.device_side,
            device?.device_side === LISTENING_SIDE.LEFT
              ? deviceQc.modeLeft
              : deviceQc.modeRight,
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
            device?.mac,
            device?.isMic,
          ),
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

        dispatch(resetDeviceDataStore(false));
        dispatch(
          callSnackBar(
            `${sideLabel} Side Device QC Completed Successfully.`,
            SNACK_BAR_VARIETNS.suceess,
          ),
        );
      } else {
        dispatch(
          callSnackBar(
            `Please complete all steps ${sideLabel} before finishing the QC.`,
            SNACK_BAR_VARIETNS.error,
          ),
        );
      }
    },
    [dispatch, device, deviceQc, fields],
  );

  const disabledSubmit = (() => {
    if (step === 0)
      return !Boolean(device?.is_Audio_play) && !Boolean(device.isMic);
    if (step === 1)
      return device?.device_type === DEVICES.RIC_OPTIMA
        ? !(deviceQc?.volumeIncrease || deviceQc?.volumeDecrease)
        : !(deviceQc?.volumeIncrease && deviceQc?.volumeDecrease);
    if (step === 2) {
      const modes =
        device?.device_side === LISTENING_SIDE.LEFT
          ? deviceQc?.modeLeft
          : deviceQc?.modeRight;
      return device?.device_type === DEVICES.RIC_OPTIMA
        ? !(Array.isArray(modes) && modes.length === 3)
        : !(Array.isArray(modes) && modes.length === 4);
    }
    if (step === 3) {
      return !(fields.body1 && fields.body2 && fields.charging);
    }
    return true;
  })();

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
        30,
      );
    } else {
      if (!audioRef.current) audioRef.current = new Audio(audioUrl);
      audioRef.current
        .play()
        .catch((err) => console.error("MP3 play error:", err));
    }
  };

  const data = {
    left: {
      device_type: device?.device_type,
      mode:
        deviceDataStore?.left?.mode?.length > 0
          ? deviceDataStore?.left?.mode
          : deviceQc.modeLeft,
      volume: {
        volumeIncrease: deviceDataStore?.left.volume.volumeIncrease
          ? deviceDataStore?.left.volume.volumeIncrease
          : deviceQc.volumeIncrease,
        volumeDecrease: deviceDataStore?.left.volume.volumeDecrease
          ? deviceDataStore?.left.volume.volumeDecrease
          : deviceQc.volumeDecrease,
      },
      body: {
        body1: deviceDataStore?.left.body.body1
          ? deviceDataStore?.left.body.body1
          : fields.body1,
        body2: deviceDataStore?.left.body.body2
          ? deviceDataStore?.left.body.body2
          : fields.body2,
      },
      charging: deviceDataStore?.left.charging
        ? deviceDataStore?.left.charging
        : fields.charging,
      audio: deviceDataStore?.left.audio
        ? deviceDataStore?.left.audio
        : device?.is_Audio_play,
      mac: deviceDataStore?.left.mac ? deviceDataStore?.left.mac : device?.mac,
      result: deviceDataStore?.left.result,
      mic: deviceDataStore?.left.mic
        ? deviceDataStore?.left.mic
        : device?.isMic,
    },

    right: {
      device_type: device?.device_type,
      mode:
        deviceDataStore?.right?.mode?.length > 0
          ? deviceDataStore?.right?.mode
          : deviceQc.modeRight,
      volume: {
        volumeIncrease: deviceDataStore?.right.volume.volumeIncrease
          ? deviceDataStore?.right.volume.volumeIncrease
          : deviceQc.volumeIncrease,
        volumeDecrease: deviceDataStore?.right.volume.volumeDecrease
          ? deviceDataStore?.right.volume.volumeDecrease
          : deviceQc.volumeDecrease,
      },
      body: {
        body1: deviceDataStore?.right.body.body1
          ? deviceDataStore?.right.body.body1
          : fields.body1,
        body2: deviceDataStore?.right.body.body2
          ? deviceDataStore?.right.body.body2
          : fields.body2,
      },
      charging: deviceDataStore?.right.charging
        ? deviceDataStore?.right.charging
        : fields.charging,
      audio: deviceDataStore?.right.audio
        ? deviceDataStore?.right.audio
        : device?.is_Audio_play,
      mac: deviceDataStore?.right.mac
        ? deviceDataStore?.right.mac
        : device?.mac,
      result: deviceDataStore?.right.result,
      mic: deviceDataStore?.right.mic
        ? deviceDataStore?.right.mic
        : device?.isMic,
    },
    box_Contains: deviceDataStore.box_Contains ?? [],
    deviceColor: deviceDataStore.deviceColor ?? "69521eea409668adad3cf8e2",
    boxId: deviceDataStore.boxId ?? "0000000000",
    device: device?.device_type,
  };
console.log("first  data ",data)
  const onSubmit = async (e) => {
    e?.preventDefault();
    dispatch(
      callApiAction(
        async () => await createDeviceQcApi(data),
        async (response) => {
          dispatch(
            callSnackBar("Device QC Rejected", SNACK_BAR_VARIETNS.warning),
          );
          dispatch(resetDeviceDataStore(true));
          dispatch(closeModal("deviceAudioMicCheck"));
          dispatch(closeModal("rejectDeviceQc"));
          BLE_STORE.BTEdisconnect = true;
        },
        (err) => {
          console.log("first", err);
        },
      ),
    );
  };

  const onRejectClick = (e) => {
    e?.preventDefault();
    dispatch(
      openModal(
        <MessageDilog
          title="Reject QC"
          message="Are you sure you want to reject this device QC?"
          onSubmit={(e) => onSubmit(e)}
          confirmText="Reject"
          modalId="rejectDeviceQc"
        />,
        "sm",
        false,
        "rejectDeviceQc",
      ),
    );
  };

  return (
    <CustomDialog
      id={step === 0 ? "deviceAudioMicCheck" : undefined}
      disabledSubmit={disabledSubmit}
      onSubmit={(e) => (step === 3 ? onComplete(e) : handleNext(e))}
      onClose={() => {
        sendPauseCommand(dispatch, device?.device_type);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore(true));
        BLE_STORE.BTEdisconnect = true;
      }}
      onReject={(e) => {
        // if (step !== 3) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        onRejectClick(e);
        // }
      }}
      isReject={true}
      closeText={step === 4 ? "Close" : "Reject Qc"}
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

        {/* STEP 0 - AUDIO */}
        {step === 0 &&
          (!(
            device?.device_type === DEVICES.BTE_OPTIMA ||
            device?.device_type === DEVICES.BTE_PRIME
          ) ? (
            <>
              <Box width="100%" ml={6}>
                <Typography variant="h3" fontWeight={700} mb={2}>
                  Mic Check
                </Typography>
              </Box>
              <StepCard
                subtitle="Test device Mic output"
                checkBox={
                  <Checkbox
                    checked={device.isMic}
                    onChange={(e) =>
                      dispatch(AllDeviceAudioCheck(e.target.checked))
                    }
                  />
                }
                title="Device Mic check"
                sx={{
                  bgcolor: "#041416",
                  borderRadius: "25%",
                  height: "6vh",
                }}
              />
            </>
          ) : (
            <>
              <Box width="100%" ml={6}>
                <Typography variant="h3" fontWeight={700} mb={2}>
                  Audio And Mic Check
                </Typography>
              </Box>
              <StepCard
                isChecked={true}
                checked={Boolean(device?.is_Audio_play)}
                title="Audio Check"
                subtitle="Test device audio output"
                action={
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (
                        device?.device_type === DEVICES.BTE_OPTIMA ||
                        device?.device_type === DEVICES.BTE_PRIME
                      ) {
                        isPlaying
                          ? (setIsPlaying(false),
                            sendPauseCommand(dispatch, device?.device_type))
                          : (setIsPlaying(true),
                            sendPlayCommand(dispatch, device?.device_type));
                      } else {
                        handlePlayPause();
                      }
                    }}
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
                checkBox={
                  <Checkbox
                    checked={device.isMic}
                    onChange={(e) =>
                      dispatch(AllDeviceAudioCheck(e.target.checked))
                    }
                  />
                }
                title="Device Mic check"
              />
            </>
          ))}

        {step === 1 && (
          <>
            <Box width="100%" ml={6}>
              <Typography variant="h3" fontWeight={700} mb={2}>
                Volume Check
              </Typography>
            </Box>
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
          </>
        )}

        {step === 2 && (
          <>
            <Box width="100%" ml={6}>
              <Typography variant="h3" fontWeight={700} mb={2}>
                Mode Check
              </Typography>
            </Box>
            <Box>
              <StepCard
                isChecked={true}
                checked={modecheck(0)}
                title={
                  modecheck(0)
                    ? "First Mode Has Been tested."
                    : "Test First Mode"
                }
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
                device?.device_type === DEVICES.ITE_PRIME ||
                device?.device_type === DEVICES.RIC_OPTIMA_8) && (
                <StepCard
                  isChecked={true}
                  checked={modecheck(3)}
                  title={
                    modecheck(3) ? "Fourth Mode Tested" : "Test Fourth Mode"
                  }
                />
              )}
            </Box>
          </>
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
