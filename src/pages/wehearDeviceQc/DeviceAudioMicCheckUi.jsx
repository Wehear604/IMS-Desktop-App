import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Avatar,
    Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MicIcon from "@mui/icons-material/Mic";
import audioUrl from "../../assets/images/AirplaneInterior.mp3";

const DeviceAudioMicCheckUi = () => {
    const handlePlayAudio = () => {
        const audio = new Audio(audioUrl);
        audio.play();
    };
    return (
        <Box
            sx={{
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                bgcolor: "background.default",
                p: 4,
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Device Connected <span style={{ color: "#28a745" }}>▸</span>
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700, color: "text.secondary" }}>
                RIC OPT R
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 3 }}>
                16:4T:5758:UGERF:HGB
            </Typography>

            <Card sx={{ width: 550, borderRadius: 2, boxShadow: 0, border: "1px solid #e6e6e6" }}>
                <CardContent>
                    <List>
                        <ListItem sx={{ alignItems: "center" }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "transparent" }}>
                                    {/* {audioPassed ? <CheckCircleIcon sx={{ color: "#6aa0a7" }} /> : <CheckCircleIcon sx={{ color: "#bfc7c7" }} />} */}
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                primary={<Typography variant="h6">Audio Check</Typography>}
                                secondary={<Typography variant="body2">Test device audio output</Typography>}
                            />

                            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                                <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ width: 220, mr: 2 }}>
                                    {/* {levels.map((l, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: `${Math.max(6, Math.round(l * 60))}px`,
                        bgcolor: i % 3 === 0 ? "primary.main" : "grey.500",
                        borderRadius: 1,
                        transition: "height 80ms linear",
                      }}
                    />
                  ))} */}
                                </Stack>

                                <Button
                                    variant="contained"
                                    onClick={handlePlayAudio}
                                    startIcon={<PlayArrowIcon />}
                                    //   disabled={audioPlaying}
                                    sx={{
                                        bgcolor: "#0d5966",
                                        textTransform: "none",
                                        borderRadius: 1,
                                        px: 2,
                                        mr: 1,
                                        "&:hover": { bgcolor: "#0b4a52" },
                                    }}
                                >
                                    {"Start"}
                                </Button>

                                {/* Stop button (keeps UI consistent layout) */}
                                {/* <Button
                  variant="outlined"
                  onClick={handleStopAudio}
                  disabled={!audioPlaying}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                    px: 2,
                    mr: 1,
                  }}
                >
                  Stop
                </Button> */}

                                {/* no <audio> element here - Audio is managed via the audioObj */}
                            </Box>
                        </ListItem>

                        <Divider />

                        <ListItem sx={{ alignItems: "center" }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "transparent" }}>
                                    {/* {micPassed ? <CheckCircleIcon sx={{ color: "#6aa0a7" }} /> : <CheckCircleIcon sx={{ color: "#bfc7c7" }} />} */}
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                primary={<Typography variant="h6">Mic Check</Typography>}
                                secondary={<Typography variant="body2">Test device microphone input</Typography>}
                            />

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                {/* <Button
                  variant="contained"
                  onClick={handleMicTest}
                  startIcon={<MicIcon />}
                  disabled={micTesting}
                  sx={{
                    bgcolor: "#0d5966",
                    textTransform: "none",
                    borderRadius: 1,
                    px: 2,
                    mr: 1,
                    "&:hover": { bgcolor: "#0b4a52" },
                  }}
                >
                  {micTesting ? "Testing..." : "Start"}
                </Button> */}
                            </Box>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ width: 640, mt: 4, justifyContent: "space-between" }}>
                <Grid item>
                    <Button variant="outlined"
                        //   onClick={handleCancel}
                        sx={{ textTransform: "none", borderRadius: 2 }}>
                        Cancel
                    </Button>
                </Grid>

                <Grid item>
                    <Button
                        variant="contained"
                        // disabled={!(audioPassed && micPassed)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            //   bgcolor: audioPassed && micPassed ? "#9aa" : "#aeb6b8",
                        }}
                    >
                        Start QC
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DeviceAudioMicCheckUi;
