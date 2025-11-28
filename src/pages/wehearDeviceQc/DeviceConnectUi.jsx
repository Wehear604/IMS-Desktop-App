// src/views/DeviceConnectUi/DeviceConnectUi.jsx
import React, { useState } from "react";
import { Box, Typography, Card, CardActionArea, Avatar, CircularProgress, Grid, Divider, Button } from "@mui/material";
import { styled } from "@mui/system";
import leftDevice from "../../assets/images/bteLeft.svg";
import rightDevice from "../../assets/images/bteRight.svg";
import leftSideLogo from "../../assets/images/leftSideSmall.svg";
import rightSideLogo from "../../assets/images/rightSideSmall.svg";
import { LISTENING_SIDE, DEVICES } from "../../utils/constants";
import connectIcon4 from "../../assets/images/connectIcon(4).svg";
import connectIcon1 from "../../assets/images/connectIcon(1).svg";
import { useDispatch, useSelector } from "react-redux";
import { connectDevice, DeviceSideAction, disconnectAction } from "../../store/actions/deviceDataAction";
import BleConnectDeviceModule from "../../components/bluetooth/BleConnectDeviceModule";
import neckbandBlack from "../../assets/images/neckband.svg";
import itePrimeWhite from "../../assets/images/ITE_PRIME_WHITE.svg";
import iteOptimaBlack from "../../assets/images/ITE_OPTIMA_BLACK.svg";
import METALIC_RIC_OPTIMA from "../../assets/images/metalic_ric.svg";
import ric8WithoutDome from "../../assets/images/WITHOUT DOME.svg";
import BTE from "../../assets/images/bteOptima.svg";
import wehearox from "../../assets/images/wehearox.svg";
import SAFE_BUDS from "../../assets/images/safebuds.svg";
import wehear_2_0 from "../../assets/images/wehear 2 0.svg";

const Header = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 600,
    marginBottom: theme.spacing(4),
}));

const CenterArea = styled(Box)(({ theme }) => ({
    maxWidth: 760,
    margin: "0 auto",
    textAlign: "center",
}));

const Instruction = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
}));

const DeviceCard = styled(Card, { shouldForwardProp: (p) => p !== "selected" })(({ selected, theme }) => ({
    width: 165,
    height: 200,
    borderRadius: 8,
    border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    boxShadow: selected ? "0 6px 18px rgba(0,0,0,0.06)" : "none",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    background: selected ? (theme.palette.mode === "light" ? "#eef8fb" : undefined) : theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
}));

const DeviceImage = styled("img")(({ theme }) => ({
    width: 86,
    height: 86,
    objectFit: "contain",
    marginBottom: theme.spacing(1),
}));

const ChipRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    justifyContent: "center",
    marginTop: theme.spacing(1),
}));

const ConnectButton = ({
    connected,
    onClick,
    deviceSide,
    fetchingData,
    loading,
    disconnect = () => { },
}) => {
    const { device } = useSelector((state) => state);
    const isConnected = device.connected
    const dispatch = useDispatch()

    const DeviceType = device?.device_type

    if (!isConnected) {
        return (
            <Button
                onClick={onClick}
                loading={loading}
                disabled={(DeviceType && fetchingData) || device?.isConnecting}
                sx={{
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    border: "2px solid",
                    borderColor: "#DDDDDD",
                    borderRadius: "8px",
                    width: "80%",
                    marginLeft: deviceSide == LISTENING_SIDE.LEFT ? "20%" : "",
                    marginTop: "5px",
                }}
            >
                {!loading ? (
                    <>
                        <img src={connectIcon1} alt="ConnectIcon(1)" />
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "League spartan",
                                padding: "5px",
                            }}
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
                    disconnect();}}
                loading={loading}
                sx={{
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor:
                        deviceSide == LISTENING_SIDE.LEFT ? "#2D3B67" : "#C24747",
                    borderRadius: "8px",
                    width: "80%",
                    marginLeft: deviceSide == LISTENING_SIDE.LEFT ? "20%" : "",
                    backgroundColor:
                        deviceSide == LISTENING_SIDE.LEFT ? "#EDF0F7" : "#FCF7F7",
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
    const [selected, setSelected] = useState("");
    const { device } = useSelector((state) => state);
    const dispatch = useDispatch()

    const devices = [
        { side: "L", label: "BTE", value: LISTENING_SIDE.LEFT },
        { side: "R", label: "BTE", value: LISTENING_SIDE.RIGHT },
    ];

    const getDeviceUI = (deviceType) => {
        switch (deviceType) {
            case DEVICES.BTE_OPTIMA:
            case DEVICES.BTE_PRIME:
                return { img: BTE, name: "BTE" };
            case DEVICES.RIC_OPTIMA_8:
                return { img: ric8WithoutDome, name: "RIC OPTIMA 8" };
            case DEVICES.RIC_OPTIMA:
                return { img: METALIC_RIC_OPTIMA, name: "RIC OPTIMA" };
            case DEVICES.RIC_32:
                return { img: METALIC_RIC_OPTIMA, name: "RIC 32" };
            case DEVICES.ITE_OPTIMA:
                return { img: iteOptimaBlack, name: "ITE OPTIMA" };
            case DEVICES.ITE_PRIME:
                return { img: itePrimeWhite, name: "ITE PRIME" };
            case DEVICES.WEHEAR_OX:
                return { img: wehearox, name: "WeHear OX" };
            case DEVICES.SAFE_BUDS:
                return { img: SAFE_BUDS, name: "Safe Buds" };
            case DEVICES.WEHEAR_2_0:
                return { img: wehear_2_0, name: "WeHear 2.0" };
            case DEVICES.NECKBAND:
                return { img: neckbandBlack, name: "Neckband" };
            default:
                return { img: null, name: "" };
        }
    };

    const selectedDeviceUI = getDeviceUI(device?.device_type);

    return (
        <Box>
            <Header variant="h4">Device Dashboard</Header>

            <CenterArea>
                <Instruction variant="h5">Select device to establish connection</Instruction>

                <Grid container spacing={3} justifyContent="center">
                    {devices.map((item) => {
                        const imageSrc = selectedDeviceUI.img || (item.side === "L" ? leftDevice : rightDevice);
                        const deviceName = selectedDeviceUI.name || item.label;
                        return (
                            <Grid item key={item.side} onClick={() => { setSelected(item.side); dispatch(DeviceSideAction(item.value)) }}>
                                <DeviceCard selected={selected === item.side}>
                                    <CardActionArea
                                        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <DeviceImage src={imageSrc} alt={deviceName} />
                                            <ChipRow>
                                                <Box gap={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                                                    <Avatar sx={{ width: 22, height: 22, bgcolor: selected === item.side ? "primary.main" : "grey.200", color: selected === item.side ? "white" : "text.primary", fontSize: 12 }}>
                                                        {item?.side === "L" ? <img src={leftSideLogo} alt="L" /> : <img src={rightSideLogo} alt="R" />}
                                                    </Avatar>
                                                    <Divider orientation="vertical" variant="middle" flexItem sx={{ color: "#DDD" }} />
                                                    <Typography variant="h6" sx={{ ml: 0.5, fontWeight: "bold" }}>{deviceName}</Typography>
                                                </Box>
                                            </ChipRow>
                                        </Box>
                                    </CardActionArea>
                                </DeviceCard>
                            </Grid>
                        );
                    })}
                </Grid>

                <BleConnectDeviceModule
                    side={device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"}
                    isConnecting={device?.isConnecting}
                    onConnectWithDevice={(
                        data,
                        deviceInfo,
                        deviceObj,
                        disconnectFun
                    ) => {
                        dispatch(
                            connectDevice(
                                data,
                                deviceInfo,
                                deviceObj,
                                disconnectFun,
                                device?.device_side,
                                device?.device_type
                            )
                        );
                    }}
                    Component={ConnectButton}
                    onLoadingChange={(loader, message) => {
                    }}
                    onEnableChange={(val) =>{}}
                    onDisconnect={() => {
                        dispatch(disconnectAction(device.device_side, true));
                    }}
                    fitting={{
                        device_type: device?.device_type,
                        device_side: device?.device_side,
                        connected: device.isConnecting
                    }}
                />
            </CenterArea>
        </Box>
    );
}

export default DeviceConnectUi
