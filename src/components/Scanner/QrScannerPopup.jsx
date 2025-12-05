import React from "react";
import { Box, Typography } from "@mui/material";
import QrScanner from "./QrCodeScanner";

const QrScannerPopup = ({ onClose, onScan, isfull = false }) => {
  const handleScan = (data) => {
    if (data) {
      onScan(data);
      onClose?.("scanner");
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  // Corner styles for all 4 corners
  const cornerStyle = {
    width: "30px",
    height: "30px",
    borderWidth: "7px",
    borderStyle: "solid",
    position: "absolute",
  };

  const leftPos = isfull ? 0 : 115;

  return (
    <Box sx={{ padding: 2, textAlign: "center" }}>
      <Typography variant="h5" mb={2}>
        Scan QR Code
      </Typography>

      {/* QR Scanner Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: 2,
          backgroundColor: "black",
        }}
      >
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%", height: "100%" }}
        />

        {/* QR Frame Corners */}
        <Box
          sx={{
            ...cornerStyle,
            borderLeftColor: "black",
            borderTopColor: "black",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            top: 0,
            left: leftPos,
          }}
        />

        <Box
          sx={{
            ...cornerStyle,
            borderRightColor: "black",
            borderTopColor: "black",
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            top: 0,
            right: leftPos,
          }}
        />

        <Box
          sx={{
            ...cornerStyle,
            borderLeftColor: "black",
            borderBottomColor: "black",
            borderRightColor: "transparent",
            borderTopColor: "transparent",
            bottom: 0,
            left: leftPos,
          }}
        />

        <Box
          sx={{
            ...cornerStyle,
            borderRightColor: "black",
            borderBottomColor: "black",
            borderLeftColor: "transparent",
            borderTopColor: "transparent",
            bottom: 0,
            right: leftPos,
          }}
        />

        {/* Scanning Line */}
        <Box
          sx={{
            position: "absolute",
            left: "5%",
            width: "90%",
            height: "4px",
            background: "rgb(0,21,128)",
            boxShadow: "0 0 15px rgb(0,30,128)",
            animation: "scanAnimation 2s infinite ease-in-out",
            zIndex: 2,
          }}
        />
      </Box>

      {/* Animation */}
      <style>{`
        @keyframes scanAnimation {
          0% { top: 0; }
          50% { top: 50%; }
          100% { top: 100%; }
        }
      `}</style>
    </Box>
  );
};

export default QrScannerPopup;
