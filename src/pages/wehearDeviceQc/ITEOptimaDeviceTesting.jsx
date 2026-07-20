import React, { useCallback, useEffect, useRef, useState } from "react";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import {
  DEVICES_NAME,
  LISTENING_SIDE,
  SNACK_BAR_VARIETNS,
} from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { findObjectKeyByValue } from "../../utils/main";
import {
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  ButtonGroup,
} from "@mui/material";
import AudioCheckSafeBudsUi from "./SafebudsUi/AudioCheckSafeBudsUi";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { closeModal, openModal } from "../../store/actions/modalAction";
import {
  CloseDeviceDataStore,
  DeviceClassicMacAction,
  DeviceStoreAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import StepCard from "../../components/StepCard";
import ButtonComponentsUi from "../../components/button/ButtonComponentsUi";

import {
  changeITEOptimaMode,
  getITEOptimaData,
  ChangeButtonSide,
} from "../../store/actions/deviceQcAction";
import { BLE_STORE } from "../../utils/bleStore";
import SafeBudsBodyCheck from "./SafebudsUi/SafeBudsBodyCheck";
import MicCheckUiSafeBudsUi from "./SafebudsUi/MicCheckUiSafeBudsUi";
import { callSnackBar } from "../../store/actions/snackbarAction";
import MessageDilog from "../../components/texts/MessageDilog";
import { createDeviceQcApi } from "../../apis/deviceQc.api";
import { callApiAction } from "../../store/actions/commonAction";
import AudioCheckITEUi from "../../pages/wehearDeviceQc/ite/AudioCheckITEUi";

const ITEOptimaDeviceTesting = ({ isUpdate }) => {
  const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const audioRef = useRef(null);
  const dispatch = useDispatch();
  const [fields, setFields] = useState({
    body1: false,
    body2: false,
    charging: false,
  });
  const steps = ["First Mode", "Second Mode", "Third Mode", "Fourth Mode"];
  const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";

  const volumeIncreasecheck =
    device?.device_side === LISTENING_SIDE.LEFT
      ? deviceDataStore.left.volume.volumeIncrease
      : deviceDataStore.right.volume.volumeIncrease;
  const volumeDecreasecheck =
    device?.device_side === LISTENING_SIDE.LEFT
      ? deviceDataStore.left.volume.volumeDecrease
      : deviceDataStore.right.volume.volumeDecrease;
  const sideLabel =
    findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";

  useEffect(() => {
    setIsPlaying(Boolean(device?.is_Audio_play));
  }, [device?.is_Audio_play]);

  const handleNext = (e) => {
    e.preventDefault();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStep(step + 1);
  };
  const modecheck = (number) => {
    return (
      Array.isArray(deviceQc.modeLeft) && deviceQc.modeLeft.includes(number)
    );
  };

  useEffect(() => {
    let timer;

    if (step != 0) {
      return;
    }
    if (step === 0) {
      timer = setTimeout(async () => {
        if (step === 0) {
          dispatch(getITEOptimaData(LISTENING_SIDE.LEFT, true));
        } else {
          dispatch(getITEOptimaData(LISTENING_SIDE.LEFT, false));
        }
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, deviceQc.modeLeft]);

  useEffect(() => {
    if (step !== 1 || !device) return;

    const interval = setInterval(() => {
      dispatch(getITEOptimaData(device.device_side, false));
    }, 1500);

    return () => clearInterval(interval);
  }, [step, device, deviceQc, deviceDataStore, BLE_STORE]);

  useEffect(() => {
    let timer;

    if (step != 0 && step != 1) {
      return;
    }
    if (step === 0 || step === 1) {
      timer = setTimeout(async () => {
        if (step === 0) {
          dispatch(getITEOptimaData(LISTENING_SIDE.LEFT, true));
        } else {
          dispatch(getITEOptimaData(LISTENING_SIDE.LEFT, false));
        }
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, deviceQc.modeLeft]);

  const Submit = useCallback(
    (e) => {
      e.preventDefault();
      if (
        device?.device_type &&
        device?.device_side &&
        deviceQc?.modeLeft &&
        (deviceQc?.volumeIncrease || deviceQc?.volumeDecrease) &&
        fields.body1 &&
        fields.body2 &&
        fields.charging &&
        device?.is_Audio_play &&
        device?.mac
      ) {
        dispatch(
          DeviceStoreAction(
            device?.device_type,
            LISTENING_SIDE.LEFT,
            deviceQc.modeLeft,
            {
              volumeIncrease: true,
              volumeDecrease: true,
            },
            {
              body1: fields.body1,
              body2: fields.body2,
            },
            fields.charging,
            device?.is_Audio_play,
            device?.mac,
            device.isMic,
          ),
        );
        dispatch(
          DeviceStoreAction(
            device?.device_type,
            LISTENING_SIDE.RIGHT,
            deviceQc.modeLeft,
            {
              volumeIncrease: true,
              volumeDecrease: true,
            },
            {
              body1: fields.body1,
              body2: fields.body2,
            },
            fields.charging,
            device?.is_Audio_play,
            device?.mac,
            device.isMic,
          ),
        );
        dispatch(closeModal("deviceAudioMicCheck"));
        // BLE_STORE.BTEdisconnect = true;
        dispatch(resetDeviceDataStore(false));
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
  const isStepValid = () => {
    if (step === 0) {
      return modecheck(3) && modecheck(2) && modecheck(1) && modecheck(0);
    }
    return true;
  };

  const disableNext = () => {
    if (step === 0) {
      return !isStepValid();
    } else if (step === 1) {
      return !(
        deviceDataStore.left.volume.volumeIncrease &&
        deviceDataStore.right.volume.volumeIncrease &&
        deviceDataStore.left.volume.volumeDecrease &&
        deviceDataStore.right.volume.volumeDecrease
      );
    } else if (step === 2) {
      return !(
        device?.device_type &&
        device?.device_side &&
        deviceQc?.modeLeft &&
        (deviceQc?.volumeIncrease || deviceQc?.volumeDecrease) &&
        fields.body1 &&
        fields.body2 &&
        fields.charging &&
        device?.is_Audio_play &&
        device?.mac &&
        device.isMic
      );
    }
    return false;
  };
  console.log(device, "step");
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
    box_Contains: deviceDataStore.box_Contains ?? [],
    deviceColor: deviceDataStore.deviceColor ?? "69521eea409668adad3cf8e2",
    boxId: deviceDataStore.boxId ?? "0000000000",
    boxImage: deviceDataStore.boxImage ?? "",
    device: device?.device_type,
  };

  const windowinfo = async () => {
    if (!window?.electronAPI?.getTrackingData) {
      return null;
    }

    try {
      const data = await window.electronAPI.getTrackingData();

      dispatch(DeviceClassicMacAction(data?.[0]?.macAddress || ""));

      console.log("data", data[0].macAddress);

      return data;
    } catch (error) {
      console.error("Failed to read tracking data", error);
      return null;
    }
  };
  useEffect(() => {
    const load = async () => {
      // if (user?.data?._id) {
      const trackingData = await windowinfo();
      // }
    };

    load();
  }, []);
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

  const [writingMode, setWritingMode] = useState(null);

  const handleModeWrite = async (mode) => {
    try {
      setWritingMode(mode);

      await dispatch(changeITEOptimaMode(mode, LISTENING_SIDE.LEFT));

      // Wait for your polling to detect the mode change.
    } finally {
      setWritingMode(null);
    }
  };

  useEffect(() => {
    if (
      deviceDataStore.right.volume.volumeIncrease &&
      deviceDataStore.right.volume.volumeDecrease
    ) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    } else if (
      deviceDataStore.left.volume.volumeIncrease &&
      deviceDataStore.left.volume.volumeDecrease
    ) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT));
    } else {
      dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    }
  }, [
    deviceDataStore.right.volume.volumeIncrease &&
      deviceDataStore.right.volume.volumeDecrease,
    deviceDataStore.left.volume.volumeIncrease &&
      deviceDataStore.left.volume.volumeDecrease,
  ]);
  return (
    <CustomDialog
      // err={fields?.err}
      title="ITE Optima QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => (step === 2 ? Submit(e) : handleNext(e))}
      onClose={() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        dispatch(closeModal("deviceAudioMicCheck"));
        dispatch(resetDeviceDataStore(true));
        dispatch(CloseDeviceDataStore());
        BLE_STORE.BTEdisconnect = true;
      }}
      onReject={(e) => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        onRejectClick(e);
      }}
      isReject={true}
      closeText={step === 3 ? null : "Reject Qc"}
      confirmText={step === 3 ? (isUpdate ? "Update" : "Finish") : "Next"}
      disabledSubmit={isUpdate ? false : disableNext()}
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
            {deviceTitle}
          </Typography>

          <Typography variant="h6">{device?.mac}</Typography>
        </Box>
        {step === 0 && (
          // <Box sx={{ width: "100%", display: "flex", flexDirection: "row" }}><>
          <>
            <Box width="95%" ml={8}>
              <Typography variant="h3" fontWeight={700} mb={2}>
                Mode Check
              </Typography>
            </Box>
            <Box
              sx={{
                width: "70%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              {steps.map((label, index) => {
                const isChecked = modecheck(index);

                return (
                  <StepCard
                    key={index}
                    isChecked
                    checked={isChecked}
                    title={isChecked ? `${label} Tested` : `Test ${label}`}
                    action={
                      !isChecked && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={writingMode !== null}
                          onClick={() => handleModeWrite(index)}
                        >
                          {writingMode === index ? "Writing..." : "Write"}
                        </Button>
                      )
                    }
                  />
                );
              })}
            </Box>
          </>
          // </Box>
        )}
        {step === 1 && (
          <>
            <Box width="95%" ml={6} mb={4}>
              <Typography variant="h3" fontWeight={700} mb={2}>
                Volume Check
              </Typography>
            </Box>
            <ButtonGroup sx={{ width: "100%", mb: 2 }}>
              <ButtonComponentsUi
                onSubmit={() => dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT))}
                ButtonGroup
                STATUSWiseData={device?.device_side === LISTENING_SIDE.LEFT}
                Title={"LEFT SIDE"}
              />
              <ButtonComponentsUi
                onSubmit={() =>
                  dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT))
                }
                ButtonGroup
                STATUSWiseData={device?.device_side === LISTENING_SIDE.RIGHT}
                Title={"RIGHT SIDE"}
              />
            </ButtonGroup>
            <StepCard
              isChecked={true}
              checked={volumeIncreasecheck}
              title={
                volumeIncreasecheck
                  ? "Volume Level Increased"
                  : "Increase Volume"
              }
            />
            <StepCard
              isChecked={true}
              checked={volumeDecreasecheck}
              title={
                volumeDecreasecheck
                  ? "Volume Level Decreased"
                  : "Decrease Volume"
              }
            />
          </>
        )}
        {step === 2 && (
          <Grid container>
            <Grid item xs={12} md={5.9} mt={2} pr={2}>
              <Box>
                <AudioCheckITEUi
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  audioRef={audioRef}
                  // NotuseEffect={false}
                />
              </Box>
              <Divider />
              <Box mt={2} pr={2}>
                <SafeBudsBodyCheck setFields={setFields} fields={fields} />
              </Box>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={12} md={5.9} mt={2} p={2}>
              <MicCheckUiSafeBudsUi
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                audioRef={audioRef}
              />{" "}
            </Grid>
          </Grid>
        )}
      </Box>
    </CustomDialog>
  );
};

export default ITEOptimaDeviceTesting;
