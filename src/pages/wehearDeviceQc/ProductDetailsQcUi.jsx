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
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";

const ProductDetailsQcUi = ({ setBox, box, isUpdate }) => {
  const [boxContains, setBoxContains] = useState({
    cable: false,
    doms: false,
    manual: false,
    charging_Case: false,
    cleaning_Brush: false,
    warranty_Card: false,
  });
  const [Barcode, setBarcode] = useState(true);
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
      ...box,
      box_Contains: formattedBoxContains ?? [],
      boxId: box_id ?? "",
      deviceColor: deviceColor ?? "",
    });
  }, [boxContains, box_id, deviceColor, setBox]);

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadColors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchColorApi();
        const result = res.data?.result || [];

        if (mounted) {
          setColors(result);
          if (!deviceColor && result.length) setDeviceColor(result[0]._id);
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load colors");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadColors();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, textAlign: { xs: "center", md: "left" } }}
      >
        Package Details
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: "red" }}>
        {box?.err}
      </Typography>
      <Grid container sx={{ padding: 4 }}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={4}>
            {/* LEFT SECTION */}
            <Grid
              item
              xs={12}
              md={12}
            >
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

                  {colors.length === 0 ? (
                    <Typography>No colors available</Typography>
                  ) : (
                    <RadioGroup
                      value={deviceColor}
                      onChange={(e) => setDeviceColor(e.target.value)}
                    >
                      {colors.map((item) => (
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
