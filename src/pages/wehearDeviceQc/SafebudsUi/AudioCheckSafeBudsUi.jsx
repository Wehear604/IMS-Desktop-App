import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StepCard from "../../../components/StepCard";
import { Box, Button } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const AudioCheckSafeBudsUi = () => {
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);
  const { device, deviceQc } = useSelector((state) => state);
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
    dispatch(DeviceIsAudioCheck(true));
    setIsPlaying((prev) => !prev);
  };
  return (
    <Box>
      <StepCard
        isChecked={true}
        title="Audio Check"
        subtitle="Test device audio output"
        checked={device.is_Audio_play}
        action={
          <Button
            variant="contained"
            onClick={handlePlayPause}
            startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            sx={{
              bgcolor: "#0d5966",
              borderRadius: "25%",
              height: "6vh",
            }}
          />
        }
      />
      <StepCard
        isChecked={true}
        checked={deviceQc.volumeIncrease}
        title={"Volume Level check"}
      />
    </Box>
  );
};

export default AudioCheckSafeBudsUi;
