import React, { useCallback, useEffect, useRef, useState } from "react";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import {
  DEVICES_NAME,
  LISTENING_SIDE,
  SNACK_BAR_VARIETNS,
} from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { findObjectKeyByValue } from "../../utils/main";
import { Box, Divider, Grid, Typography } from "@mui/material";
import AudioCheckSafeBudsUi from "./SafebudsUi/AudioCheckSafeBudsUi";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { closeModal, openModal } from "../../store/actions/modalAction";
import {
  CloseDeviceDataStore,
  DeviceStoreAction,
  resetDeviceDataStore,
} from "../../store/actions/deviceDataAction";
import StepCard from "../../components/StepCard";
import {
  getITEPrimeMode,
  getITEPrimeVolume,
} from "../../store/actions/deviceQcAction";
import { BLE_STORE } from "../../utils/bleStore";
import SafeBudsBodyCheck from "./SafebudsUi/SafeBudsBodyCheck";
import MicCheckUiSafeBudsUi from "./SafebudsUi/MicCheckUiSafeBudsUi";
import { callSnackBar } from "../../store/actions/snackbarAction";
import MessageDilog from "../../components/texts/MessageDilog";
import { createDeviceQcApi } from "../../apis/deviceQc.api";
import { callApiAction } from "../../store/actions/commonAction";

const ItePrimeDeviceTesting = ({ isUpdate }) => {
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

    if (deviceQc.modeLeft?.length === 4) {
      return;
    }

    if (step === 0) {
      timer = setTimeout(() => {
        dispatch(getITEPrimeMode(LISTENING_SIDE.LEFT, BLE_STORE.deviceObj));
      }, 1000);
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
              volumeIncrease: deviceQc?.volumeIncrease || true,
              volumeDecrease: deviceQc?.volumeDecrease || true,
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
              volumeIncrease: deviceQc?.volumeIncrease || true,
              volumeDecrease: deviceQc?.volumeDecrease || true,
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
      return modecheck(1) && modecheck(2) && modecheck(3) && modecheck(0);
    }
    return true;
  };

const disableNext = () => {
  if (step === 0) {
    return !isStepValid();
  } else if (step === 1) {
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
};;
console.table(step, "step");
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
    device: device?.device_type,
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

  useEffect(() => {
    let timer;
    if (deviceQc.volumeIncrease) {
      return;
    }
    if (step === 1 && !BLE_STORE.BTEdisconnect) {
      timer = setTimeout(() => {
        dispatch(getITEPrimeVolume(LISTENING_SIDE.LEFT, BLE_STORE.deviceObj));
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, deviceQc]);
  return (
    <CustomDialog
      // err={fields?.err}
      title="ITE QC Checklist"
      id="deviceAudioMicCheck"
      onSubmit={(e) => (step === 1 ? Submit(e) : handleNext(e))}
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
      closeText={step === 2 ? null : "Reject Qc"}
      confirmText={step === 2 ? (isUpdate ? "Update" : "Finish") : "Next"}
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
                    isChecked={true}
                    checked={isChecked}
                    title={isChecked ? `${label} Tested` : `Test ${label}`}
                  />
                );
              })}
            </Box>
          </>
          // </Box>
        )}
        {step === 1 && (
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
      </Box>
    </CustomDialog>
  );
};

export default ItePrimeDeviceTesting;
