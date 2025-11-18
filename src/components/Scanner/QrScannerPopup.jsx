import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import QrScanner from "./QrCodeScanner";

const QrScannerPopup = ({ onClose, onScan }) => {
  const [qrData, setQrData] = useState("");

  const handleScan = (data) => {
    if (data) {
      onScan(data);
      handleDone();
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  const handleDone = () => {
    setQrData("");
    onClose && onClose("scanner");
  };

  return (
    <Box sx={{ padding: 2, textAlign: "center" }}>
      <Typography variant="h5" mb={2}>
        Scan QR Code
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: 2,
        }}
      >
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%", height: "100%" }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 115,
            width: "30px",
            height: "30px",
            borderLeft: "7px solid black",
            borderTop: "7px solid black",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 115,
            width: "30px",
            height: "30px",
            borderRight: "7px solid black",
            borderTop: "7px solid black",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 115,
            width: "30px",
            height: "30px",
            borderLeft: "7px solid black",
            borderBottom: "7px solid black",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 115,
            width: "30px",
            height: "30px",
            borderRight: "7px solid black",
            borderBottom: "7px solid black",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 118,
            width: "63%",
            height: "4px",
            background:
              "linear-gradient(to right,rgb(0, 21, 128),rgb(0, 21, 128))",
            boxShadow: "0 0 0pxrgb(4, 0, 255), 0 0 20pxrgb(0, 30, 128)",
            animation: "scan-animation 2s infinite ease-in-out",
            zIndex: 2,
          }}
        />
      </Box>

      <style jsx>{`
        @keyframes scan-animation {
          0% {
            top: 0;
          }
          50% {
            top: 50%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </Box>
  );
};

export default QrScannerPopup;
