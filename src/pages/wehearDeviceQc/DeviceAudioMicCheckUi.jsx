import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box, Button, Card, List, ListItem, ListItemText, Typography
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import audioUrl from "../../assets/images/AirplaneInterior.mp3";
import {
    CHARACTERISTIC_UUID_READ_WRITE, DEVICES, DEVICES_NAME, LISTENING_SIDE
} from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import { findObjectKeyByValue } from "../../utils/main";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import disabledChecked from "../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../assets/images/checkIconEnabled.svg";
import { BLE_STORE, sendPauseCommand, sendPlayCommand } from "../../utils/bleStore";
import { BteDeviceCurrentVolume, BteDeviceMode, BteDeviceVolume } from "../../store/actions/deviceQcAction";

const StepCard = ({ checked, title, subtitle, action }) => (
    <Card sx={{ width: "40vw", borderRadius: 2, boxShadow: 0, border: "1px solid #e6e6e6", mb: 2 }}>
        <List>
            <ListItem sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box display={"flex"} gap={4} alignItems="center">
                    <img src={checked ? enabledChecked : disabledChecked} alt="check" />
                    <ListItemText
                        primary={<Typography variant="h5">{title}</Typography>}
                        secondary={subtitle ? <Typography variant="h6">{subtitle}</Typography> : null}
                    />
                </Box>
                {action && <Box>{action}</Box>}
            </ListItem>
        </List>
    </Card>
);

const DeviceAudioMicCheckUi = () => {
    const { device = {}, deviceQc = {} } = useSelector((state) => state);
    const dispatch = useDispatch();

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const isReading = useRef(false);
    const readInterval = useRef(null);
    const mounted = useRef(true);
    const stepRef = useRef(step);
    const deviceRef = useRef(device);

    useEffect(() => { stepRef.current = step; }, [step]);
    useEffect(() => { deviceRef.current = device; }, [device]);

    const modecheck = useCallback((number) => {
        if (!deviceRef.current?.device_side) return false;
        return deviceRef.current?.device_side === LISTENING_SIDE.LEFT
            ? Array.isArray(deviceQc.modeLeft) && deviceQc.modeLeft.includes(number)
            : Array.isArray(deviceQc.modeRight) && deviceQc.modeRight.includes(number);
    }, [deviceQc.modeLeft, deviceQc.modeRight]);

    const deviceQcFun = async () => {
        const currentStep = stepRef.current;
        const currentDevice = deviceRef.current;
        if (currentDevice?.device_type === DEVICES.BTE_OPTIMA || currentDevice?.device_type === DEVICES.BTE_PRIME) {
            if (currentStep === 1) {
                dispatch(BteDeviceVolume());
            } else if (currentStep === 2) {
                dispatch(BteDeviceMode());
            }
        }
    }

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
            dispatch(BteDeviceCurrentVolume(device.device_side));
        }
        return () => {
            mounted.current = false;
            stopReading();
        };
    }, [dispatch, device?.device_side, stopReading]);

    const handleNext = useCallback(() => {
        sendPauseCommand(dispatch);
        setIsPlaying(false);
        setStep((s) => Math.min(s + 1, 2));
    }, [dispatch]);

    const handleBack = useCallback(() => {
        setStep((s) => Math.max(s - 1, 0));
    }, []);

    const disabledSubmit = (() => {
        if (step === 0) return !Boolean(device?.is_Audio_play);
        if (step === 1) return !(deviceQc?.volumeIncrease && deviceQc?.volumeDecrease);
        if (step === 2) {
            const modes = device?.device_side === LISTENING_SIDE.LEFT ? deviceQc?.modeLeft : deviceQc?.modeRight;
            return !(Array.isArray(modes) && modes.length === 4);
        }
        return true;
    })();

    const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";
    const sideLabel = findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";

    return (
        <CustomDialog
            id={step === 0 ? `deviceAudioMicCheck` : undefined}
            disabledSubmit={disabledSubmit}
            onSubmit={handleNext}
            onClose={() => {
                if (step === 1) {
                    handleBack();
                }
            }}
            closeText={step === 0 ? "Close" : "Back"}
            confirmText={"Next"}
        >
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", bgcolor: "background.default" }}>
                <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Device Connected <img src={bluetoothIcon} alt="Bluetooth Icon" style={{ marginLeft: 8 }} />
                    </Typography>

                    <Typography variant="h5" sx={{ color: "#DDD" }}>
                        {deviceTitle} {sideLabel}
                    </Typography>

                    <Typography variant="h6">{device?.mac}</Typography>
                </Box>

                {step === 0 && (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <StepCard
                            checked={Boolean(device?.is_Audio_play)}
                            title="Audio Check"
                            subtitle="Test device audio output"
                            action={
                                <Button
                                    variant="contained"
                                    onClick={() => isPlaying ? (setIsPlaying(false), sendPauseCommand(dispatch)) : (setIsPlaying(true), sendPlayCommand(dispatch))}
                                    startIcon={isPlaying ? <PauseIcon sx={{ ml: 2 }} /> : <PlayArrowIcon sx={{ ml: 2 }} />}
                                    sx={{ bgcolor: "#0d5966", borderRadius: "25%", display: "flex", alignItems: "center", justifyContent: "center", p: 0, height: "6vh" }}
                                />
                            }
                        />
                    </Box>
                )}

                {step === 1 && (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <StepCard checked={deviceQc?.volumeIncrease} title={deviceQc?.volumeIncrease ? "Volume Level Increased" : "Increase Volume"} />
                        <StepCard checked={deviceQc?.volumeDecrease} title={deviceQc?.volumeDecrease ? "Volume Level Decreased" : "Decrease Volume"} />
                    </Box>
                )}

                {step === 2 && (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <StepCard checked={modecheck(0)} title={modecheck(0) ? "First Mode Has Been tested." : "Test First Mode"} />
                        <StepCard checked={modecheck(1)} title={modecheck(1) ? "Second Mode Has Been tested." : "Test Second Mode"} />
                        <StepCard checked={modecheck(2)} title={modecheck(2) ? "Third Mode Has Been tested." : "Test Third Mode"} />
                        <StepCard checked={modecheck(3)} title={modecheck(3) ? "Fourth Mode Has Been tested." : "Test Fourth Mode"} />
                    </Box>
                )}
            </Box>
        </CustomDialog>
    );
};

export default DeviceAudioMicCheckUi;
