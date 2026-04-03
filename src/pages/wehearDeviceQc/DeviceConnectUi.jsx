// src/pages/DeviceConnectUi.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Avatar,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/system";

import leftDevice from "../../assets/images/bteLeft.svg";
import rightDevice from "../../assets/images/bteRight.svg";
import rightRic16 from "../../assets/images/RIC optima 16_Close Dome_left_Biege.png";
import leftRic16 from "../../assets/images/RIC optima 16_Close Dome_right_Biege.png";
import leftRic8 from "../../assets/images/R8 HA all open domes.left.svg";
import rightRic8 from "../../assets/images/R8 HA all open domes.right.svg";
import rightITEOptima from "../../assets/images/ITE_OPTIMA_LEFT_BLACK.svg";
import leftITEOptima from "../../assets/images/ITE_OPTIMA_RIGHT_BLACK.svg";

import itePrimeWhite from "../../assets/images/ITE_PRIME_WHITE.svg";
// import itePrimeWhite from "../../assets/images/ITE_PRIME_LEFT.svg";
// import rightItePrime from "../../assets/images/ITE_PRIME_RIGHT.svg";
import wehearox from "../../assets/images/wehearox.svg";
import wehear_2_0 from "../../assets/images/wehear 2 0.svg";
import safeBuds from "../../assets/images/safebuds.svg";

import leftSideLogo from "../../assets/images/leftSideSmall.svg";
import rightSideLogo from "../../assets/images/rightSideSmall.svg";
import {
  DEVICES,
  EQ_LEVEL,
  LISTENING_SIDE,
  MODES,
  VOLUME_COMMANDS_REVERSE,
} from "../../utils/constants";
import connectIcon4 from "../../assets/images/connectIcon(4).svg";
import connectIcon1 from "../../assets/images/connectIcon(1).svg";
import { useDispatch, useSelector } from "react-redux";
import {
  connectDevice,
  DeviceSideAction,
  disconnectAction,
  onWriteFunctionChange,
} from "../../store/actions/deviceDataAction";
import RicConnectDevice from "../../components/bluetooth/RicConnectDeviceModule";

import BleConnectDeviceModule from "../../components/bluetooth/BleConnectDeviceModule";
import DeviceAudioMicCheckUi from "./DeviceAudioMicCheckUi";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { findObjectKeyByValue } from "../../utils/main";
import SafeBudsFotUpload from "./SafeBudsFotUpload";
import SafeBudsConnectDeviceModule from "../../components/bluetooth/SafeBudsConnectDeviceModule";
// import SafeBudsUi from "./safebuds/SafeBudsUi";
import { SafeBudsVersionRead } from "../../store/actions/deviceQcAction";
import SafebudsMainUi from "./SafebudsUi/SafebudsMainUi";
import { SetStepAction } from "../../store/actions/stepAction";
import ItePrimeDeviceTesting from "./ItePrimeDeviceTesting";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
const Header = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 600,
  marginBottom: theme.spacing(4),
}));

const Instruction = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}));

const DeviceCard = styled(Card, {
  shouldForwardProp: (p) => p !== "selected" && p !== "completed",
})(({ selected, completed, theme }) => ({
  width: 165,
  height: 200,
  borderRadius: 8,

  border: completed
    ? `2px solid ${theme.palette.success.main}` // ✅ green border
    : selected
      ? `2px solid ${theme.palette.primary.main}`
      : `1px solid ${theme.palette.divider}`,

  boxShadow: selected ? "0 6px 18px rgba(0,0,0,0.06)" : "none",

  transition: "transform 160ms ease, box-shadow 160ms ease",

  background: selected
    ? theme.palette.mode === "light"
      ? "#eef8fb"
      : undefined
    : theme.palette.background.paper,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1),
}));

const ConnectButton = ({
  connected,
  onClick,
  deviceSide,
  fetchingData,
  loading,
  disconnect = () => {},
  fotfile,
}) => {
  const { device } = useSelector((state) => state);
  const isConnected = device.connected;
  const dispatch = useDispatch();
  //Need to check
  let b = false;

  const AudioAndMicCheck = () => {
    if (device.device_type == DEVICES.ITE_PRIME) {
      dispatch(
        openModal(<ItePrimeDeviceTesting />, "lg", true, "deviceAudioMicCheck"),
      );
    } else if (device.device_type == DEVICES.SAFE_BUDS) {
      if (device.device_type == DEVICES.SAFE_BUDS && !device?.fotfile1) {
        // dispatch(SafeBudsVersionRead({ type: "SafeBudsVersionRead" }));
        dispatch(SetStepAction(0));
        dispatch(
          openModal(
            <SafeBudsFotUpload fotfile={fotfile} />,
            "sm",
            true,
            "deviceAudioMicCheck",
          ),
        );
      } else {
        dispatch(
          SafeBudsVersionRead({
            type: "SafeBudsVersionRead",
            isVersionRead: true,
            latestVersion: device.latestVersion,
          }),
        );
        dispatch(
          openModal(<SafebudsMainUi />, "lg", true, "deviceAudioMicCheck"),
        );
      }
    } else {
      dispatch(
        openModal(<DeviceAudioMicCheckUi />, "sm", true, "deviceAudioMicCheck"),
      );
    }
  };

  useEffect(() => {
    if (isConnected) {
      AudioAndMicCheck();
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) {
      dispatch(closeModal("deviceAudioMicCheck"));
    }
  }, [!isConnected]);
  const isSideSelected =
    deviceSide === LISTENING_SIDE.LEFT ||
    deviceSide === LISTENING_SIDE.RIGHT ||
    deviceSide === true;

  if (!isConnected) {
    return (
      <Button
        onClick={onClick}
        disabled={fetchingData || device?.isConnecting || !isSideSelected}
        sx={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          border: "2px solid",
          borderColor: "#DDDDDD",
          borderRadius: "8px",
          width: "25vw",
          // marginLeft: deviceSide == LISTENING_SIDE.LEFT ? "20%" : "",
          marginTop: "5px",
        }}
      >
        {!loading ? (
          <>
            {isSideSelected && <img src={connectIcon1} alt="ConnectIcon(1)" />}
            <Typography
              variant="h5"
              sx={{ fontFamily: "League spartan", padding: "5px" }}
            >
              CONNECT
            </Typography>
          </>
        ) : (
          <CircularProgress size={25} />
        )}
      </Button>
    );
  } else {
    return (
      <Button
        onClick={() => {
          disconnect();
        }}
        sx={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid",
          borderColor:
            deviceSide == LISTENING_SIDE.LEFT ? "#C24747" : "#2D3B67",
          borderRadius: "8px",
          width: "25vw",
          // marginLeft: deviceSide == LISTENING_SIDE.LEFT ? "20%" : "",
          backgroundColor:
            deviceSide == LISTENING_SIDE.LEFT ? "#FCF7F7" : "#EDF0F7",
          marginTop: "5px",
        }}
      >
        <>
          <img src={connectIcon4} alt="ConnectIcon(3)" />
          <Typography
            variant="h5"
            sx={{
              fontFamily: "League spartan",
              padding: "5px",
              color: "#2D3B67",
            }}
          >
            CONNECTED
          </Typography>
        </>
      </Button>
    );
  }
};

const DeviceConnectUi = () => {
  const [selected, setSelected] = useState("L");
  const { device, step, deviceDataStore } = useSelector((state) => state);
  const dispatch = useDispatch();
  console.log(
    "device?.device_type === DEVICES.SAFE_BUDS && !device?.fotfile",
    device?.fotfile,
  );
  const devices = [
    { side: "L", label: "BTE", value: LISTENING_SIDE.LEFT },
    { side: "R", label: "BTE", value: LISTENING_SIDE.RIGHT },
  ];

  const getLeftDeviceImage = (deviceType) => {
    switch (deviceType) {
      case DEVICES.BTE_OPTIMA:
        return <img src={leftDevice} alt="BTE" />;
      case DEVICES.BTE_PRIME:
        return <img src={leftDevice} alt="BTE" />;
      case DEVICES.RIC_OPTIMA:
        return (
          <img
            style={{ width: 120, height: 120 }}
            src={leftRic16}
            alt="Ric 16"
          />
        );
      case DEVICES.RIC_OPTIMA_8:
        return <img src={leftRic8} alt="Ric 8" />;
      case DEVICES.ITE_OPTIMA:
        return (
          <img
            style={{ width: 100, height: 100 }}
            src={leftITEOptima}
            alt="ITE Optima"
          />
        );
      case DEVICES.RIC_32:
        return (
          <img
            style={{ width: 120, height: 120 }}
            src={leftRic16}
            alt="Ric 16"
          />
        );
      case DEVICES.ITE_PRIME:
        return (
          <img
            style={{ width: 200, height: 120 }}
            src={itePrimeWhite}
            alt="ITE Prime"
          />
        );
      case DEVICES.SAFE_BUDS:
        return (
          <img
            style={{ width: 150, height: 150 }}
            src={safeBuds}
            alt="Safe Buds"
          />
        );
      case DEVICES.WEHEAR_2_0:
        return (
          <img
            style={{ width: 150, height: 150 }}
            src={wehear_2_0}
            alt="Safe Buds"
          />
        );
      case DEVICES.WEHEAR_OX:
        return (
          <img
            style={{ width: 150, height: 150 }}
            src={wehearox}
            alt="Safe Buds"
          />
        );
      default:
        return null;
    }
  };

  const getRightDeviceImage = (deviceType) => {
    switch (deviceType) {
      case DEVICES.BTE_OPTIMA:
        return <img src={rightDevice} alt="BTE" />;
      case DEVICES.BTE_PRIME:
        return <img src={rightDevice} alt="BTE" />;
      case DEVICES.RIC_OPTIMA:
        return (
          <img
            style={{ width: 120, height: 120 }}
            src={rightRic16}
            alt="Ric 16"
          />
        );
      case DEVICES.RIC_OPTIMA_8:
        return <img src={rightRic8} alt="Ric 8" />;
      case DEVICES.ITE_OPTIMA:
        return (
          <img
            style={{ width: 100, height: 100 }}
            src={rightITEOptima}
            alt="ITE Optima"
          />
        );
      case DEVICES.RIC_32:
        return (
          <img
            style={{ width: 120, height: 120 }}
            src={rightRic16}
            alt="Ric 16"
          />
        );
      // case DEVICES.ITE_PRIME:
      //   return (
      //     <img
      //       style={{ width: 120, height: 120 }}
      //       src={rightItePrime}
      //       alt="ITE Prime"
      //     />
      //   );

      default:
        return null;
    }
  };

  const isSingleCardType = [
    DEVICES.SAFE_BUDS,
    DEVICES.WEHEAR_2_0,
    DEVICES.WEHEAR_OX,
    DEVICES.ITE_PRIME,
  ].includes(device.device_type);

  useEffect(() => {
    if (!isSingleCardType) {
      dispatch(DeviceSideAction(LISTENING_SIDE.LEFT));
    }
  }, [!isSingleCardType]);
  return (
    <>
      <Header sx={{ m: 4 }} variant="h4">
        Device Dashboard
      </Header>
      <Divider orientation="horizontal" />

      {device?.device_type === DEVICES.SAFE_BUDS && (
        <Stepper sx={{ p: 2 }} activeStep={step.step} alternativeLabel>
          <Step>
            <StepLabel>Device Version</StepLabel>
          </Step>
          <Step>
            <StepLabel>Upload FOT</StepLabel>
          </Step>
          <Step>
            <StepLabel>Touch Check</StepLabel>
          </Step>
          <Step>
            <StepLabel>Audio and Mic Test</StepLabel>
          </Step>
          <Step>
            <StepLabel>Packaging Details</StepLabel>
          </Step>
        </Stepper>
      )}
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Instruction variant="h4">
          Select device to establish connection
        </Instruction>

        {!isSingleCardType ? (
          <Grid container spacing={3} justifyContent="center">
            {devices.map((item) => {
              const isCompleted =
                item.side === "L"
                  ? deviceDataStore.left.result
                  : deviceDataStore.right.result;

              return (
                <Grid
                  item
                  key={item.side}
                  onClick={() => {
                    setSelected(item.side);
                    dispatch(DeviceSideAction(item.value));
                  }}
                >
                  <DeviceCard
                    completed={isCompleted}
                    selected={selected === item.side}
                    sx={{ width: "14vw", height: "35vh", position: "relative" }}
                  >
                    {isCompleted && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          bgcolor: "success.main",
                          color: "#fff",
                          textAlign: "center",
                          fontSize: 12,
                          py: 0.5,
                          fontWeight: "bold",
                        }}
                      >
                        QC Test Completed
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        height: "100%",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                      }}
                    >
                      {/* Device Image */}
                      <Box sx={{ height: "10vh" }}>
                        {item.side === "L"
                          ? getLeftDeviceImage(device.device_type)
                          : getRightDeviceImage(device.device_type)}
                      </Box>

                      {/* Bottom Section */}
                      <Box
                        gap={2}
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor:
                              selected === item.side
                                ? "primary.main"
                                : "grey.200",
                          }}
                        >
                          <img
                            src={
                              item.side === "L" ? leftSideLogo : rightSideLogo
                            }
                            alt="side"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </Avatar>

                        <Divider orientation="vertical" flexItem />

                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {findObjectKeyByValue(device.device_type, DEVICES)}
                        </Typography>
                      </Box>
                    </Box>
                  </DeviceCard>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Grid
            onClick={() => {
              setSelected(true);
              dispatch(DeviceSideAction(true));
            }}
          >
            <DeviceCard
              selected={selected === true}
              sx={{ width: "14vw", height: "35vh" }}
            >
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <Box sx={{ height: "10vh" }}>
                  {getLeftDeviceImage(device.device_type)}
                </Box>

                <Box
                  gap={2}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {findObjectKeyByValue(device.device_type, DEVICES)}
                  </Typography>
                </Box>
              </Box>
            </DeviceCard>
          </Grid>
        )}

        {device?.device_type === DEVICES.SAFE_BUDS ? (
          <SafeBudsConnectDeviceModule
            side={
              device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"
            }
            isConnecting={device?.isConnecting}
            onConnectWithDevice={(data, deviceInfo) => {
              dispatch(
                connectDevice(
                  deviceInfo,
                  device?.device_side,
                  device?.device_type,
                ),
              );
            }}
            Component={ConnectButton}
            onLoadingChange={() => {}}
            onWriteFunctionEnabled={(fun) =>
              dispatch(onWriteFunctionChange(fun, device.device_side))
            }
            onDisconnect={() => {
              dispatch(disconnectAction(device.device_side));
            }}
            fitting={{
              device_type: device?.device_type,
              device_side: device?.device_side,
              connected: device.isConnecting,
            }}
          />
        ) : device?.device_type === DEVICES.BTE_OPTIMA ||
          device?.device_type === DEVICES.BTE_PRIME ? (
          <BleConnectDeviceModule
            side={
              device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"
            }
            isConnecting={device?.isConnecting}
            onConnectWithDevice={(data, deviceInfo) => {
              dispatch(
                connectDevice(
                  deviceInfo,
                  device?.device_side,
                  device?.device_type,
                ),
              );
            }}
            Component={ConnectButton}
            onLoadingChange={() => {}}
            onWriteFunctionEnabled={(fun) =>
              dispatch(onWriteFunctionChange(fun, device.device_side))
            }
            onDisconnect={() => {
              dispatch(disconnectAction(device.device_side));
            }}
            fitting={{
              device_type: device?.device_type,
              device_side: device?.device_side,
              connected: device.isConnecting,
            }}
          />
        ) : (
          <RicConnectDevice
            side={
              device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"
            }
            isConnecting={device?.isConnecting}
            onConnectWithDevice={(data, deviceInfo) => {
              dispatch(
                connectDevice(
                  deviceInfo,
                  device?.device_side,
                  device?.device_type,
                ),
              );
            }}
            Component={ConnectButton}
            onLoadingChange={() => {}}
            onWriteFunctionEnabled={(fun) =>
              dispatch(onWriteFunctionChange(fun, device.device_side))
            }
            onDisconnect={() => {
              dispatch(disconnectAction(device.device_side));
            }}
            fitting={{
              device_type: device?.device_type,
              device_side: device?.device_side,
              connected: device.isConnecting,
            }}
          />
        )}
      </Box>
    </>
  );
};

export default DeviceConnectUi;
