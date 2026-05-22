import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import {
  DEVICES,
  DEVICES_NAME,
  LISTENING_SIDE,
  SNACK_BAR_VARIETNS,
} from "../../utils/constants";
import { closeModal, openModal } from "../../store/actions/modalAction";
import {
  CloseDeviceDataStore,
  DeviceContainsAction,
  DeviceStoreAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import { BLE_STORE } from "../../utils/bleStore";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { useDispatch, useSelector } from "react-redux";
import { findObjectKeyByValue } from "../../utils/main";
import {
  Box,
  ButtonGroup,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import ButtonComponentsUi from "../../components/button/ButtonComponentsUi";
import {
  ChangeButtonSide,
  changeRicMode,
  readEqualizer,
  readRicMode,
  readRicVolumeLevel,
  RicDeviceCurrentVolume,
} from "../../store/actions/deviceQcAction";
import StepCard from "../../components/StepCard";
import { createDeviceQcApi } from "../../apis/deviceQc.api";
import { callApiAction } from "../../store/actions/commonAction";
import AudioCheckSafeBudsUi from "./SafebudsUi/AudioCheckSafeBudsUi";
import SafeBudsBodyCheck from "./SafebudsUi/SafeBudsBodyCheck";
import MicCheckUiSafeBudsUi from "./SafebudsUi/MicCheckUiSafeBudsUi";
import useBluetoothHeadsetStatus from "./useBluetoothHeadsetStatus";
import OneViewBox from "../../components/layouts/OneViewBox";
import { center } from "../../assets/css/theme/common";
import MessageDilog from "../../components/texts/MessageDilog";
import { use } from "react";

const Ric16DeviceTesting = (isUpdate) => {
  const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const [isstart, setIsStart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const audioRef = useRef(null);
  const dispatch = useDispatch();
  const [fields, setFields] = useState({
    body1: false,
    body2: false,
    charging: false,
  });
  const hasRun = useRef(false);
  const steps = ["First Mode", "Second Mode", "Third Mode"];
  const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";
  let headset = true;

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
    if (device?.device_type === DEVICES.RIC_OPTIMA) {
      dispatch(
        DeviceContainsAction([
          { charging_Case: false },
          { warranty_Card: false },
          { device_user_guide: false },
          { cleaning_Brush: false },
          { slicone_domes: false },
          { type_c_cable: false },
          { adapter: false },
          { wax_guard: false },
        ]),
      );
    }
  }, [device.device_type]);
  useEffect(() => {
    setIsPlaying(Boolean(device?.is_Audio_play));
  }, [device?.is_Audio_play]);

  const Submit = useCallback(
    (e) => {
      e.preventDefault();
      if (
        device?.device_type &&
        device?.device_side &&
        deviceQc?.modeLeft &&
        deviceDataStore.left.volume.volumeIncrease &&
        deviceDataStore.left.volume.volumeDecrease &&
        deviceDataStore.right.volume.volumeDecrease &&
        deviceDataStore.right.volume.volumeIncrease &&
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

  const handleNext = (e) => {
    e.preventDefault();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStep(step + 1);
  };
  const modecheck = (number) => {
    if (!device?.device_side) return false;
    return device?.device_side === LISTENING_SIDE.LEFT
      ? Array.isArray(deviceQc.modeLeft) && deviceQc.modeLeft.includes(number)
      : Array.isArray(deviceQc.modeRight) &&
          deviceQc.modeRight.includes(number);
  };

  const data = {
    left: {
      device_type: device?.device_type,
      mode: deviceQc.modeLeft,
      volume: {
        volumeIncrease: deviceDataStore.left.volume.volumeIncrease,
        volumeDecrease: deviceDataStore.left.volume.volumeDecrease,
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
        volumeIncrease: deviceDataStore.right.volume.volumeIncrease,
        volumeDecrease: deviceDataStore.right.volume.volumeDecrease,
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
    isNewric16: deviceDataStore?.isNewric16,
    boxImage: deviceDataStore.boxImage ?? "",
  };

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
    console.log("onRejectClick");
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

  const disableNext = () => {
    if (step === 0) {
      return !(
        deviceQc.modeLeft?.length === 3 && deviceQc.modeRight?.length === 3
      );
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

  useEffect(() => {
    if ([0, 1, 2].every((val) => deviceQc.modeRight?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT));
    } else if ([0, 1, 2].every((val) => deviceQc.modeLeft?.includes(val))) {
      dispatch(ChangeButtonSide(LISTENING_SIDE.RIGHT));
    }
  }, [deviceQc.modeLeft, deviceQc.modeRight]);

  useEffect(() => {
    const modeRwite = dispatch(
      readEqualizer(
        LISTENING_SIDE.LEFT,
        device.device_side === LISTENING_SIDE.LEFT
          ? BLE_STORE.LeftdeviceObj
          : BLE_STORE.deviceObj,
      ),
    );
    setIsStart(true);
  }, []);

  useEffect(() => {
    if (!isstart) return;
    if (step !== 0 || !device) return;

    const interval = setInterval(() => {
      dispatch(
        readRicMode(
          device.device_side,
          device.device_side === LISTENING_SIDE.LEFT
            ? BLE_STORE.LeftdeviceObj
            : BLE_STORE.deviceObj,
        ),
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [step, device, deviceQc, deviceDataStore, BLE_STORE]);

  useEffect(() => {
    if (step !== 1 || !device) return;

    const interval = setInterval(() => {
      dispatch(
        readRicVolumeLevel(
          device.device_side,
          device.device_side === LISTENING_SIDE.LEFT
            ? BLE_STORE.LeftdeviceObj
            : BLE_STORE.deviceObj,
        ),
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [step, device, deviceQc, deviceDataStore, BLE_STORE]);

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
      title="RIC QC Checklist"
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
      disabledSubmit={disableNext()}
    >
      {!headset ? (
        <OneViewBox sx={{ ...center }}>
          <CircularProgress size={50} />
          {" Please connect a Bluetooth headset to start the QC process... "}
        </OneViewBox>
      ) : (
        <>
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

            {/* <Typography variant="h6">{device?.mac}</Typography> */}
          </Box>
          {step === 0 && (
            <>
              <Box width="95%" ml={6} mb={4}>
                <Typography variant="h3" fontWeight={700} mb={2}>
                  Mode Check
                </Typography>
              </Box>
              <ButtonGroup sx={{ width: "100%", mb: 2 }}>
                <ButtonComponentsUi
                  onSubmit={() =>
                    dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT))
                  }
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

              <>
                <Box
                  sx={{
                    width: "100%",
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
                        isChecked={true}
                        checked={isChecked}
                        title={isChecked ? `${label} Tested` : `Test ${label}`}
                      />
                    );
                  })}
                </Box>
              </>
            </>
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
                  onSubmit={() =>
                    dispatch(ChangeButtonSide(LISTENING_SIDE.LEFT))
                  }
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
                  <AudioCheckSafeBudsUi
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    audioRef={audioRef}
                    NotuseEffect={false}
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
        </>
      )}
    </CustomDialog>
  );
};

export default Ric16DeviceTesting;
