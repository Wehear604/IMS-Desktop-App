import { Box, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import FOT from "../../../assets/images/fotFile.svg";
import { cleanValue } from "../../../utils/main";

const DeviceVersionUi = ({}) => {
  const { device } = useSelector((state) => state);
  return (
    <Box p={4}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Device Version Information
        </Typography>
      </Box>

      <Box>
        <Typography>Current Device Version:</Typography>
        <Typography>{cleanValue(device?.version)}</Typography>
      </Box>

      <Box>
        <Typography>Latest/Updated Version:</Typography>
        <Typography>{cleanValue(device?.latestVersion)}</Typography>
      </Box>


    </Box>
  );
};

export default DeviceVersionUi;
