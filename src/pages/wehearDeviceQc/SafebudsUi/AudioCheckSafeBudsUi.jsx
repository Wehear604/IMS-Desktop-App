import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StepCard from "../../../components/StepCard";
import { Box, Button } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { FetchVolumeSafebudsDevice } from "../../../store/actions/deviceQcAction";
import audioUrl from "../../../assets/images/slow_instrumental.mp3";

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
  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true; // optional
    audioRef.current.volume = 1;

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (deviceQc.volumeIncrease) return;
    const interval = setInterval(async () => {
      dispatch(FetchVolumeSafebudsDevice());
    }, 1500);

    return () => clearInterval(interval);
  }, [deviceQc.volumeIncrease]);
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
