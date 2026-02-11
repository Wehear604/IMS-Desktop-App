import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import QrScannerPopup from "../../../components/Scanner/QrScannerPopup";
import CustomInput from "../../../components/inputs/CustomInputs";
import BarcodeIcon from "@mui/icons-material/QrCode2";
import { useDispatch, useSelector } from "react-redux";
import { DeviceBoxIDAction } from "../../../store/actions/deviceDataAction";
import qrScanLogo from "../../../assets/images/qrScanLogo.svg";

const SafeBudsBoxIdUi = () => {
  const [Barcode, setBarcode] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const dispatch = useDispatch();
  const { deviceDataStore } = useSelector((state) => state);

  return (
    <>
      <Stack spacing={4}>
        <Paper
          onClick={() => setScannerActive(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "45vh",
            backgroundColor: deviceDataStore?.boxId ? "#515151" : "",
          }}
        >
          {scannerActive ? (
            <QrScannerPopup
              isfull={true}
              onClose={() => setScannerActive(false)}
              onScan={(data) => dispatch(DeviceBoxIDAction(data.text))}
            />
          ) : deviceDataStore?.boxId ? (
            <Box
              sx={{
                p: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EDEDED",
                borderRadius: "8px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  // mb: 3,
                  cursor: "pointer",
                  // textDecoration: "underline",
                  fontFamily: "League Spartan",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                Box ID : {deviceDataStore?.boxId}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "League Spartan",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <img src={qrScanLogo} alt="QR Scan Logo" />
                Scan Box ID
              </Typography>
            </Box>
          )}
        </Paper>
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h4" sx={{ mt: 2 }}>
          OR
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
        }}
      >
        {Barcode ? (
          <CustomInput
            autoFocus
            value={deviceDataStore?.boxId}
            onChange={(e) => dispatch(DeviceBoxIDAction(e.target.value))}
            type="text"
            label="Barcode Scanner"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BarcodeIcon />
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Button
            variant="outlined"
            startIcon={<BarcodeIcon />}
            onClick={() => setBarcode(true)}
            sx={{ width: "50vw", height: "5vh" }}
          >
            <Typography variant="h4" sx={{ textTransform: "none" }}>
              Barcode Scanner
            </Typography>
          </Button>
        )}
      </Box>
    </>
  );
};

export default SafeBudsBoxIdUi;
