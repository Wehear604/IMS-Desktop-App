import React, { useEffect, useRef, useState } from "react";
import {
    Box, Button, Card, CardContent, Divider, Grid, List, ListItem,
    ListItemAvatar, ListItemText, Typography, Avatar, Stack
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import audioUrl from "../../assets/images/AirplaneInterior.mp3";
import { CHARACTERISTIC_UUID_READ_WRITE } from "../../utils/constants";
import { useSelector } from "react-redux";
import { sendPauseCommand, sendPlayCommand } from "../../components/bluetooth/BleConnectDeviceModule";

const DeviceAudioMicCheckUi = () => {
    const audioRef = useRef(null);
    const { device } = useSelector((state) => state);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <Box sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", bgcolor: "background.default", p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Device Connected <span style={{ color: "#28a745" }}>▸</span>
            </Typography>

            <Card sx={{ width: 550, borderRadius: 2, boxShadow: 0, border: "1px solid #e6e6e6", mt: 2 }}>
                <CardContent>
                    <List>
                        <ListItem sx={{ alignItems: "center" }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "transparent" }} />
                            </ListItemAvatar>

                            <ListItemText
                                primary={<Typography variant="h6">Audio Check</Typography>}
                                secondary={<Typography variant="body2">Test device audio output </Typography>}
                            />

                            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 2 }}>
                                    {/* visual levels or icons could go here */}
                                </Stack>

                                <Button
                                    variant="contained"
                                    onClick={sendPlayCommand}
                                    startIcon={<PlayArrowIcon />}
                                    sx={{ bgcolor: "#0d5966", textTransform: "none", borderRadius: 1, px: 2, mr: 1, "&:hover": { bgcolor: "#0b4a52" } }}
                                >
                                    {isPlaying ? "Playing" : "Start"}
                                </Button>

                                <Button variant="outlined" onClick={sendPauseCommand} sx={{ textTransform: "none", borderRadius: 1, px: 2 }}>
                                    Stop
                                </Button>
                            </Box>
                        </ListItem>

                        <Divider />
                    </List>
                </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ width: 640, mt: 4, justifyContent: "space-between" }}>
                <Grid item>
                    <Button variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                </Grid>

                <Grid item>
                    <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                        Start QC
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DeviceAudioMicCheckUi;
