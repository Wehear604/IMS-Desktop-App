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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import BarcodeIcon from "@mui/icons-material/QrCode2";
import CloseIcon from "@mui/icons-material/Close";
import QrScannerPopup from "../../components/Scanner/QrScannerPopup";
import qrScanLogo from "../../assets/images/qrScanLogo.svg";
import CustomInput from "../../components/inputs/CustomInputs";
import { fetchColorApi } from "../../apis/productColor.api";
import { toTitleCase, toTitleSpaceCase } from "../../utils/main";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { fetchProductColorAction } from "../../store/actions/setting.Action";

const ProductDetailsQcUi = ({ setBox, box, isUpdate }) => {
  const [boxContains, setBoxContains] = useState({
    cable: false,
    doms: false,
    manual: false,
    charging_Case: false,
    cleaning_Brush: false,
    warranty_Card: false,
  });

  const hasUpdatedRef = useRef(false);
  const runCountRef = useRef(0);

  useEffect(() => {
    if (!Array.isArray(box?.box_Contains)) return;
    if (runCountRef.current >= 2) return;

    runCountRef.current += 1;

    if (runCountRef.current === 2) {
      const updatedState = { ...boxContains };

      box.box_Contains.forEach((item) => {
        const [key, value] = Object.entries(item)[0];
        if (key in updatedState && value === true) {
          updatedState[key] = true;
        }
      });
      hasUpdatedRef.current = true;
      setBoxContains(updatedState);
      setDeviceColor(box?.deviceColor?._id);
    }
  }, [box?.box_Contains]);

  const { settings } = useSelector((state) => state);
  const [Barcode, setBarcode] = useState(true);
  const [deviceColor, setDeviceColor] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [box_id, setBox_id] = useState("");
  const toggleContains = useCallback((key) => {
    setBoxContains((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    if (isUpdate ? hasUpdatedRef.current : true) {
      const formattedBoxContains = Object.entries(boxContains)
        .filter(([key, value]) => value === true)
        .map(([key]) => ({ [key]: true }));

      setBox({
        ...box,
        box_Contains: formattedBoxContains ?? [],
        boxId: box_id ?? "",
        deviceColor: deviceColor ?? "",
      });
    }
  }, [boxContains, box_id, deviceColor, setBox]);

  useEffect(() => {
    if (settings?.productColor_data?.result?.length > 0 && !deviceColor) {
      setDeviceColor(settings?.productColor_data?.result?.[0]?._id);
    }
  }, [settings?.productColor_data?.result?.[0]?._id]);

  return (
    <Box sx={{ p: 4 }}>
      {!isUpdate && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Package Details
        </Typography>
      )}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: "red" }}>
        {box?.err}
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
                        label={toTitleSpaceCase(key)}
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

                  {settings?.productColor_data?.result?.length === 0 ? (
                    <Typography>No colors available</Typography>
                  ) : (
                    <RadioGroup
                      value={deviceColor}
                      onChange={(e) => setDeviceColor(e.target.value)}
                    >
                      {settings?.productColor_data?.result?.map((item) => (
                        <FormControlLabel
                          key={item._id}
                          value={item._id}
                          control={<Radio />}
                          label={toTitleCase(item.name)}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        {!isUpdate && (
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
                      autoFocus
                      value={box_id}
                      onChange={(e) => setBox_id(e.target.value)}
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
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProductDetailsQcUi;
