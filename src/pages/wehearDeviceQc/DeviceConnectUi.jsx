import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Card, CardActionArea, Avatar, CircularProgress, Grid, Chip, Divider, Paper, Button } from "@mui/material";
import { styled } from "@mui/system";
import leftDevice from "../../assets/images/bteLeft.svg";
import rightDevice from "../../assets/images/bteRight.svg";
import leftSideLogo from "../../assets/images/leftSideSmall.svg";
import rightSideLogo from "../../assets/images/rightSideSmall.svg";
import { LISTENING_SIDE } from "../../utils/constants";
import connectIcon4 from "../../assets/images/connectIcon(4).svg";
import connectIcon1 from "../../assets/images/connectIcon(1).svg";
import { useDispatch, useSelector } from "react-redux";
import { connectDevice, DeviceSideAction, disconnectAction, onWriteFunctionChange } from "../../store/actions/deviceDataAction";
import BleConnectDeviceModule from "../../components/bluetooth/BleConnectDeviceModule";
import RicConnectDevice from "../../components/bluetooth/RicConnectDeviceModule";

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
                    disconnect();
                }}
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
    const [selected, setSelected] = useState("L");
    const { device } = useSelector((state) => state);
    const dispatch = useDispatch()

    const devices = [
        { side: "L", label: "BTE", value: LISTENING_SIDE.LEFT },
        { side: "R", label: "BTE", value: LISTENING_SIDE.RIGHT },
    ];

    const [isReading, setIsReading] = useState(false);
    const readInterval = useRef(null);

    const startReading = () => {
        if (isReading) return;

        setIsReading(true);

        readInterval.current = setInterval(async () => {
            try {
                const data = await device.writeFun.readData();
                console.log("Read Data:", data);
            } catch (error) {
                console.error("Read Error:", error);
            }
        }, 3000);
    };

    const stopReading = () => {
        clearInterval(readInterval.current); 
        readInterval.current = null;
        setIsReading(false);
    };

    useEffect(() => {
        return () => clearInterval(readInterval.current);  
    }, [!device.connected]);


    return (
        <Box>
            <Header variant="h4">Device Dashboard</Header>

            <CenterArea>
                <Instruction variant="h5">Select device to establish connection</Instruction>

                <Grid container spacing={3} justifyContent="center">
                    {devices.map((item) => (
                        <Grid item key={item.side} onClick={() => { setSelected(item.side); dispatch(DeviceSideAction(item.value)) }}>
                            <DeviceCard selected={selected === item.side}>
                                <CardActionArea
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <DeviceImage src={item?.side === "L" ? leftDevice : rightDevice} alt={`device-${item.side}`} />
                                        <ChipRow>
                                            <Box gap={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                                                <Avatar sx={{ width: 22, height: 22, bgcolor: selected === item.side ? "primary.main" : "grey.200", color: selected === item.side ? "white" : "text.primary", fontSize: 12 }}>
                                                    {item?.side === "L" ? <img src={leftSideLogo} alt="L" /> : <img src={rightSideLogo} alt="R" />}
                                                </Avatar>
                                                <Divider orientation="vertical" variant="middle" flexItem sx={{ color: "#DDD" }} />
                                                <Typography variant="h6" sx={{ ml: 0.5, fontWeight: "bold" }}>{item.label}</Typography>
                                            </Box>
                                        </ChipRow>
                                    </Box>
                                </CardActionArea>
                            </DeviceCard>
                        </Grid>
                    ))}
                </Grid>

                <RicConnectDevice
                    side={device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"}
                    // setIsConnecting={setIsConnecting}
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
                        // dispatch(
                        //     changeLoadinfMessages(
                        //         loader,
                        //         message,
                        //         device?.device_side
                        //     )
                        // );
                    }}
                    onWriteFunctionEnabled={(fun) =>
                        dispatch(
                            onWriteFunctionChange(fun, device.device_side)
                        )
                    }
                    onDisconnect={() => {
                        dispatch(disconnectAction(device.device_side));
                    }}
                    // fitting={device?.device_type}
                    fitting={{
                        device_type: device?.device_type,
                        device_side: device?.device_side,
                        connected: device.isConnecting
                    }}
                // fetchingData={fetchingData}
                />
            </CenterArea>
            <Button onClick={startReading}>Start Reading</Button>
            <Button onClick={stopReading}>Stop Reading</Button>
        </Box>
    );
}

export default DeviceConnectUi