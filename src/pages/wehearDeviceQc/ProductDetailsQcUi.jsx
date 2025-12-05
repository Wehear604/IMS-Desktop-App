import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  IconButton,
  Divider,
  Stack,
  Paper,
  TextField,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import BarcodeIcon from "@mui/icons-material/QrCode2";
import CloseIcon from "@mui/icons-material/Close";
import QrScannerPopup from "../../components/Scanner/QrScannerPopup";
import qrScanLogo from "../../assets/images/qrScanLogo.svg";
import CustomInput from "../../components/inputs/CustomInputs";

const ProductDetailsQcUi = ({ setBox, box }) => {
  const [boxContains, setBoxContains] = useState({
    Cable: false,
    Doms: false,
    Manual: false,
    "Charging Case": false,
    "Cleaning Brush": false,
    "Warranty Card": false,
  });
  const [Barcode, setBarcode] = useState(false);
  const [deviceColor, setDeviceColor] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [box_id, setBox_id] = useState("");
  const toggleContains = useCallback((key) => {
    setBoxContains((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    const formattedBoxContains = Object.entries(boxContains)
      .filter(([key, value]) => value === true)
      .map(([key]) => ({ [key]: true }));

    setBox({
      box_Contains: formattedBoxContains ?? [],
      boxId: box_id ?? "",
      deviceColor: deviceColor ?? "",
    });
  }, [boxContains, box_id, deviceColor, setBox]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, textAlign: { xs: "center", md: "left" } }}
      >
        Package Details
      </Typography>
      <Grid container sx={{ padding: 4 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={4}>
            {/* LEFT SECTION */}
            <Grid item xs={12} md={12}>
              <Stack spacing={4}>
                {/* BOX CONTAINS */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      minWidth: { sm: "150px" },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Box Contains
                  </Typography>

                  <Box>
                    {Object.keys(boxContains).map((key) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={boxContains[key]}
                            onChange={() => toggleContains(key)}
                            size="small"
                          />
                        }
                        label={key}
                        sx={{ display: "block", ml: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* DEVICE COLOR */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      minWidth: { sm: "150px" },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Device Color
                  </Typography>

                  <RadioGroup
                    value={deviceColor}
                    onChange={(e) => setDeviceColor(e.target.value)}
                  >
                    <FormControlLabel
                      value="Black"
                      control={<Radio />}
                      label="Black"
                    />
                    <FormControlLabel
                      value="Beige"
                      control={<Radio />}
                      label="Beige"
                    />
                    <FormControlLabel
                      value="Silver"
                      control={<Radio />}
                      label="Silver"
                    />
                    <FormControlLabel
                      value="White"
                      control={<Radio />}
                      label="White"
                    />
                  </RadioGroup>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <Stack spacing={4}>
                <Paper
                  onClick={() => setScannerActive(true)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "45vh",
                    backgroundColor: box_id ? "#515151" : "",
                  }}
                >
                  {scannerActive ? (
                    <QrScannerPopup
                      isfull={true}
                      onClose={() => setScannerActive(false)}
                      onScan={(data) => setBox_id(data.text)}
                    />
                  ) : box_id ? (
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
                        Box ID : {box_id}
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
                    autoFocus={true}
                    value={box_id}
                    onChange={(e) => {
                      setBox_id(e.target.value);
                      // setBarcode(false);
                    }}
                    type="text"
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailsQcUi;
