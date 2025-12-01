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
} from "@mui/material";
import { styled } from "@mui/system";
import leftDevice from "../../assets/images/bteLeft.svg";
import rightDevice from "../../assets/images/bteRight.svg";
import leftSideLogo from "../../assets/images/leftSideSmall.svg";
import rightSideLogo from "../../assets/images/rightSideSmall.svg";
import { DEVICES, EQ_LEVEL, LISTENING_SIDE, MODES, VOLUME_COMMANDS_REVERSE } from "../../utils/constants";
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

import { BLE_STORE, interpolateValue, readCharacteristic } from "../../utils/bleStore";
import ReadRicDataFromDevice from "./ric/ReadRicDataToDevice";
import ReadITEDataFromDevice from "./ite/ReadITEDataFromDevice";
import ReadITEPrimeDataFromDevice from "./ite/ReadITEPrimeDataFromDevice";
import BleConnectDeviceModule from "../../components/bluetooth/BleConnectDeviceModule";
import DeviceAudioMicCheckUi from "./DeviceAudioMicCheckUi";
import { closeModal, openModal } from '../../store/actions/modalAction';


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

const DeviceCard = styled(Card, {
    shouldForwardProp: (p) => p !== "selected",
})(({ selected, theme }) => ({
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
    const isConnected = device.connected;
    const dispatch = useDispatch();

    const AudioAndMicCheck = () => {
        dispatch(openModal(
            <DeviceAudioMicCheckUi
                
            />,
            "sm",
            false,
            "deviceAudioMicCheck"
        ));
    };


    useEffect(() => {
        if (isConnected) {
            AudioAndMicCheck();
        }
    }, [isConnected]);

    useEffect(() => {
        if(!isConnected) {
            dispatch(closeModal("deviceAudioMicCheck"));

        }
    }, [!isConnected]);


    if (!isConnected) {
        return (
            <Button
                onClick={onClick}
                disabled={fetchingData || device?.isConnecting}
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
                        <Typography variant="h5" sx={{ fontFamily: "League spartan", padding: "5px" }}>
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
                    borderColor: deviceSide == LISTENING_SIDE.LEFT ? "#2D3B67" : "#C24747",
                    borderRadius: "8px",
                    width: "80%",
                    marginLeft: deviceSide == LISTENING_SIDE.LEFT ? "20%" : "",
                    backgroundColor: deviceSide == LISTENING_SIDE.LEFT ? "#EDF0F7" : "#FCF7F7",
                    marginTop: "5px",
                }}
            >
                <>
                    <img src={connectIcon4} alt="ConnectIcon(3)" />
                    <Typography variant="h5" sx={{ fontFamily: "League spartan", padding: "5px", color: "#2D3B67" }}>
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
    const dispatch = useDispatch();

    const devices = [
        { side: "L", label: "BTE", value: LISTENING_SIDE.LEFT },
        { side: "R", label: "BTE", value: LISTENING_SIDE.RIGHT },
    ];

    const [isReading, setIsReading] = useState(false);
    const readInterval = useRef(null);

    const getVolume = async () => {
        const command = device?.device_side === LISTENING_SIDE.LEFT ? `82 02 01 00` : `82 02 02 00`;

        const response = await ReadRicDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const responseParts = response.split(" ");
        const volumeHex = parseInt(responseParts[4], 16);
        const volumeLevel = Number(volumeHex);
        console.log("first volumeLevel", volumeLevel)
        return volumeLevel || 0
    }

    const getMode = async () => {
        const command = device?.device_side === LISTENING_SIDE.LEFT ? "84 02 02 00" : "84 02 01 00";

        const response = await ReadRicDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const data = response.split(" ");
        const d1 = parseInt(data[4], 16);
        console.log(" d1 ", d1)
        let mode;
        if (d1 === 1) mode = 0;
        else if (d1 === 2) mode = 1;
        else if (d1 === 3) mode = 2;
        else {
            console.error(`Unexpected mode value: ${d1}`);
            return;
        }
        console.log("mode", mode)
        return mode || 0
    }
    const getBattery = async () => {
        const command =
            device?.device_side == LISTENING_SIDE.LEFT
                ? device?.device_type == DEVICES.RIC_OPTIMA ||
                    device?.device_type == DEVICES.RIC_32
                    ? "3C 42 41 54 54 45 52 59 3E 0D 0A"
                    : "0x07"
                : device?.device_type == DEVICES.RIC_OPTIMA ||
                    device?.device_type == DEVICES.RIC_32
                    ? "3C 42 41 54 54 45 52 59 3E 0D 0A"
                    : "0x07"

        const response = await ReadRicDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const responseParts = response.trim().split(" ");
        const batteryHex = responseParts[0];
        const batteryPercentage = parseInt(batteryHex, 16);
        console.log("batteryPercentage", batteryPercentage)
        return batteryPercentage || 0
    }

    const getRic8Data = async () => {
        const command = "0x06";
        const response = await ReadRicDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const responseParts = response.trim().split(" ");
        console.log("first response", response)
        let eqData = [];
        for (let i = 0; i < 5; i++) {
            if (i == 0 || i == 2 || i == 3) {
                let data =
                    parseInt(responseParts[i], 16) - parseInt(EQ_LEVEL[i], 16);
                let data1 =
                    parseInt(responseParts[i + 1], 16) -
                    parseInt(EQ_LEVEL[i + 1], 16);

                let twoDataObj = interpolateValue(data, data1);
                eqData.push(data);
                eqData.push(twoDataObj);
            } else {
                eqData.push(
                    parseInt(responseParts[i], 16) - parseInt(EQ_LEVEL[i], 16)
                );
            }
        }

        let volume = VOLUME_COMMANDS_REVERSE[responseParts[5]];

        let mode = MODES[responseParts[6]];
        console.log("{ volume, mode ",  volume, mode )
        return { volume, mode }
    }

    const getITEOptimaData = async () => {
        const command = "AA 00 03";
        const response = await ReadITEDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const responseParts = response.trim().split(" ");

        let eqData = [];

        for (let i = 10; i < 15; i++) {
            if (i == 10 || i == 12 || i == 13) {
                let data = parseInt(responseParts[i], 16);
                let data1 = parseInt(responseParts[i + 1], 16);
                let twoDataObj = interpolateValue(data, data1);
                eqData.push(data);
                eqData.push(twoDataObj);
            } else {
                eqData.push(parseInt(responseParts[i], 16));
            }
        }

        let volume =
            device?.device_side == LISTENING_SIDE.LEFT ? responseParts[8] : responseParts[9];

        let mode = ITE_MODE[responseParts[7]];

        let batteryLevel =
            device?.device_side == LISTENING_SIDE.LEFT ? responseParts[5] : responseParts[6];

        return { volume, mode, batteryLevel: parseInt(batteryLevel, 16) }
    }

    const getITEPrimeBattery = async () => {
        const command = [0x00, 0x05, 0x00];
        const response = await ReadITEPrimeDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const batteryPercentage =
            device?.device_side == LISTENING_SIDE.LEFT
                ? response[3]
                : response[
                device?.device_type == DEVICES.NECKBAND ? 3 : 4
                ];
        console.log("batteryPercentage", batteryPercentage)
        return { batteryLevel: batteryPercentage }
    }

    const getITEPrimeaMode = async () => {
        const command = [0x02, 0x05, 0x00];
        const response = await ReadITEPrimeDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const mode = response[4];
console.log("mode",mode)
        return { mode: mode }
    }
    const getITEPrimeaVolume = async () => {
        const command = [0x02, 0x0d, 0x00]
        const response = await ReadITEPrimeDataFromDevice(command, device?.device_side, BLE_STORE.deviceObj);
        const parts = response;
        const payload = parts.slice(3);
        let volume = 0;
        console.log("payload", payload)
        let finalVolume = 0
        if (device?.device_side === LISTENING_SIDE.LEFT) {
            volume = payload[4];
        } else {
            volume = payload[22];
        }
        if (parseInt(volume) > 127) {
            finalVolume = volume - 256;
        } else {
            finalVolume = volume;
        }
        return { Volume: finalVolume }
    }

    const startReading = () => {
        if (isReading) return;
        setIsReading(true);

        // poll every 3s
        readInterval.current = setInterval(async () => {
            try {
                if (device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME) {
                    const data = await BLE_STORE.writeFun.readData();
                    console.log("Read Data:", data);
                } else {
                    // await getRic8Data()
                    // await getMode()
                    // await getBattery()
                    // await getVolume()

                    // await getITEPrimeBattery()
                    // await getITEPrimeaMode()
                    // await getITEPrimeaVolume()

                }

            } catch (err) {
                console.error("Read Error:", err);
            }
        }, 3000);
    };

    const stopReading = () => {
        if (readInterval.current) {
            clearInterval(readInterval.current);
            readInterval.current = null;
        }
        setIsReading(false);
    };

    useEffect(() => {
        return () => {
            if (readInterval.current) {
                clearInterval(readInterval.current);
                readInterval.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!device?.connected && readInterval.current) {
            clearInterval(readInterval.current);
            readInterval.current = null;
            setIsReading(false);
        }
    }, [device?.connected]);

    return (
        <Box>
            <Header variant="h4">Device Dashboard</Header>

            <CenterArea>
                <Instruction variant="h5">Select device to establish connection</Instruction>

                <Grid container spacing={3} justifyContent="center">
                    {devices.map((item) => (
                        <Grid
                            item
                            key={item.side}
                            onClick={() => {
                                setSelected(item.side);
                                dispatch(DeviceSideAction(item.value));
                            }}
                        >
                            <DeviceCard selected={selected === item.side}>
                                <CardActionArea sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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

                {(device?.device_type === DEVICES.BTE_OPTIMA || device?.device_type === DEVICES.BTE_PRIME) ?
                    <BleConnectDeviceModule
                        side={device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"}
                        isConnecting={device?.isConnecting}
                        onConnectWithDevice={(data, deviceInfo) => {
                            dispatch(connectDevice(
                                deviceInfo,
                                device?.device_side,
                                device?.device_type
                            ));
                        }}
                        Component={ConnectButton}
                        onLoadingChange={() => { }}
                        onWriteFunctionEnabled={(fun) =>
                            dispatch(onWriteFunctionChange(fun, device.device_side))
                        }
                        onDisconnect={() => {
                            dispatch(disconnectAction(device.device_side));
                        }}
                        fitting={{
                            device_type: device?.device_type,
                            device_side: device?.device_side,
                            connected: device.isConnecting
                        }}
                    /> : <RicConnectDevice
                        side={device?.device_side === LISTENING_SIDE.RIGHT ? "Right" : "Left"}
                        isConnecting={device?.isConnecting}
                        onConnectWithDevice={(data, deviceInfo) => {
                            dispatch(connectDevice(
                                deviceInfo,
                                device?.device_side,
                                device?.device_type
                            ));
                        }}
                        Component={ConnectButton}
                        onLoadingChange={() => { }}
                        onWriteFunctionEnabled={(fun) =>
                            dispatch(onWriteFunctionChange(fun, device.device_side))
                        }
                        onDisconnect={() => {
                            dispatch(disconnectAction(device.device_side));
                        }}
                        fitting={{
                            device_type: device?.device_type,
                            device_side: device?.device_side,
                            connected: device.isConnecting
                        }}
                    />}
            </CenterArea>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
                <Button onClick={startReading} variant="contained" disabled={!BLE_STORE.readFun && !BLE_STORE.writeFun || isReading}>
                    Start Reading
                </Button>
                <Button onClick={stopReading} variant="outlined" disabled={!isReading}>
                    Stop Reading
                </Button>
            </Box>
        </Box>
    );
};

export default DeviceConnectUi;
