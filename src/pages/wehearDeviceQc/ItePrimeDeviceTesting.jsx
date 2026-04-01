import React, { useState } from "react";
import bluetoothIcon from "../../assets/images/bluetoothIcon.svg";
import { DEVICES_NAME, LISTENING_SIDE } from "../../utils/constants";
import { useSelector } from "react-redux";
import { findObjectKeyByValue } from "../../utils/main";
import { Box, Typography } from "@mui/material";
import AudioCheckSafeBudsUi from "./SafebudsUi/AudioCheckSafeBudsUi";

const ItePrimeDeviceTesting = () => {
    const { device, deviceQc, deviceDataStore } = useSelector((state) => state);
  const [isPlaying, setIsPlaying] = useState(false);

    const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown device";
    const sideLabel =
      findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";
   
    useEffect(() => {
      setIsPlaying(Boolean(device?.is_Audio_play));
    }, [device?.is_Audio_play]);
  
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        bgcolor: "background.default",
      }}
    >
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Device Connected{" "}
          <img
            src={bluetoothIcon}
            alt="Bluetooth Icon"
            style={{ marginLeft: 8 }}
          />
        </Typography>

        <Typography variant="h5" sx={{ color: "#DDD" }}>
          {deviceTitle} {sideLabel}
        </Typography>

        <Typography variant="h6">{device?.mac}</Typography>
      </Box>
      {step === 0 &&
          <AudioCheckSafeBudsUi
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioRef={audioRef}
          />}
    </Box>
  );
};

export default ItePrimeDeviceTesting;
