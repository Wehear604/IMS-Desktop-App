import React from "react";
import { Box } from "@mui/material";
import QrReader from "react-qr-scanner";

const QrScanner = ({ onScan, onError, delay = 300, style = {} }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <QrReader
        delay={delay}
        onError={onError}
        onScan={onScan}
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "auto",
          ...style,
        }}
      />
    </Box>
  );
};

export default QrScanner;
