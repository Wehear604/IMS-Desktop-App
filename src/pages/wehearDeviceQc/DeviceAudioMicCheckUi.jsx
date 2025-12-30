import React, { useEffect, useRef, useState } from "react";
import {
    Box, Button, Card, CardContent, Divider, Grid, List, ListItem,
    ListItemAvatar, ListItemText, Typography, Avatar, Stack
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import audioUrl from "../../assets/images/AirplaneInterior.mp3";
import { CHARACTERISTIC_UUID_READ_WRITE, DEVICES_NAME, LISTENING_SIDE } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import { findObjectKeyByValue } from "../../utils/main";
import PauseIcon from '@mui/icons-material/Pause';
import CustomDialog from "../../components/layouts/common/CustomDialog";
import disabledChecked from "../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../assets/images/checkIconEnabled.svg";
import { sendPauseCommand, sendPlayCommand } from "../../utils/bleStore";

const DeviceAudioMicCheckUi = () => {
    const { device } = useSelector((state) => state);
    const [isPlaying, setIsPlaying] = useState(false);
    const dispatch = useDispatch();

    return (

        <CustomDialog
            id={`deviceAudioMicCheck`}
            // onSubmit={onSubmit}
            closeText="Close"
        // confirmText={`${isUpdate ? "Update" : "Create"}`}
        >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", bgcolor: "background.default", }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Device Connected <img src={bluetoothIcon} alt="Bluetooth Icon" />
                </Typography>

                <Typography variant="h5" sx={{ color: "#DDD" }}>
                    {DEVICES_NAME[device?.device_type]} {findObjectKeyByValue(device?.device_side, LISTENING_SIDE)}
                </Typography>

                <Typography variant="h6" >
                    {device?.mac}
                </Typography>

                <Card sx={{ width: "40vw", borderRadius: 2, boxShadow: 0, border: "1px solid #e6e6e6", }}>
                    <CardContent>
                        <List>
                            <ListItem sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box display={"flex"} gap={4}>
                                    <ListItemText sx={{display:"flex", alignItems:"center"}}>
                                        <img src={device.is_Audio_play ? enabledChecked : disabledChecked} alt="Check Icon" />

                                    </ListItemText>

                                    <ListItemText
                                        primary={<Typography variant="h5">Audio Check</Typography>}
                                        secondary={<Typography variant="h6">Test device audio output </Typography>}
                                    />
                                </Box>

                                <Box>
                                    {<Button
                                        variant="contained"
                                        onClick={() => isPlaying ? (setIsPlaying(false), sendPauseCommand(dispatch)) : (setIsPlaying(true), sendPlayCommand(dispatch))}
                                        startIcon={isPlaying ? <PauseIcon sx={{ ml: 2 }} /> : <PlayArrowIcon sx={{ ml: 2 }} />}
                                        sx={{ bgcolor: "#0d5966", borderRadius: "25%", display: "flex", alignItems: "center", justifyContent: "center", p: 0, height: "6vh" }}
                                    />}
                                </Box>
                            </ListItem>

                            {/* <Divider /> */}
                        </List>
                    </CardContent>
                </Card>


            </Box>
        </CustomDialog>
    );
};

export default DeviceAudioMicCheckUi;
