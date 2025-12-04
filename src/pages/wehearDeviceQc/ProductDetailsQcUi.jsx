import React, { useState, useCallback, useRef, useEffect } from 'react';
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
} from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import BarcodeIcon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import QrScannerPopup from '../../components/Scanner/QrScannerPopup';

// ProductDetailsQcUi
// Updated: the QR scanning happens inline — the dashed scan container is replaced
// with the live camera view when the user clicks "Scan Box ID". No modal is used.
// Uses native BarcodeDetector where available; otherwise shows a manual input fallback.

const ProductDetailsQcUi = () => {
  const [qcExecutive, setQcExecutive] = useState('');
  const [boxContains, setBoxContains] = useState({
    Cable: false,
    Doms: false,
    Manual: false,
    'Charging Case': false,
    'Cleaning Brush': false,
    'Warranty Card': false,
  });
  const [deviceColor, setDeviceColor] = useState('');
  const [scannerActive, setScannerActive] = useState(false); // inline scanner flag
  const [scannedValue, setScannedValue] = useState('');
  const [scanError, setScanError] = useState('');
  const [manualInput, setManualInput] = useState('');

  // Refs for video and canvas used by the scanner
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);

  const toggleContains = useCallback((key) => {
    setBoxContains((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Start/stop camera when scannerActive changes
  useEffect(() => {
    let rafId = null;
    let intervalId = null;
    let supportsDetector = false;

    async function startCameraAndScan() {
      setScanError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Try to instantiate BarcodeDetector if available
        if (window.BarcodeDetector) {
          try {
            const formats = await window.BarcodeDetector.getSupportedFormats();
            detectorRef.current = new window.BarcodeDetector({ formats: formats.includes('qr_code') ? ['qr_code'] : formats });
            supportsDetector = true;
          } catch (e) {
            detectorRef.current = null;
            supportsDetector = false;
          }
        }

        scanningRef.current = true;

        const scanFrame = async () => {
          if (!scanningRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
            rafId = requestAnimationFrame(scanFrame);
            return;
          }

          const width = video.videoWidth;
          const height = video.videoHeight;
          if (width === 0 || height === 0) {
            rafId = requestAnimationFrame(scanFrame);
            return;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, width, height);

          try {
            if (detectorRef.current) {
              const barcodes = await detectorRef.current.detect(canvas);
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue || '';
                if (rawValue) {
                  setScannedValue(rawValue);
                  stopScanning();
                  return;
                }
              }
            } else {
              // No BarcodeDetector -> show helpful message and stop active scanning attempts
              setScanError('BarcodeDetector API not available in this browser. Please use Chrome/Edge or enter ID manually.');
              scanningRef.current = false;
              return;
            }
          } catch (err) {
            console.error('Scanning error', err);
            setScanError('Error while scanning.');
            scanningRef.current = false;
            return;
          }

          rafId = requestAnimationFrame(scanFrame);
        };

        rafId = requestAnimationFrame(scanFrame);

        if (!supportsDetector) {
          intervalId = setTimeout(() => {
            setScanError('BarcodeDetector API not supported in this browser. Please use Chrome/Edge or paste the ID manually.');
          }, 1200);
        }
      } catch (err) {
        console.error('Camera start failed', err);
        setScanError('Could not access camera. Please allow camera access or use manual entry.');
      }
    }

    function stopScanning() {
      scanningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch (e) { }
        videoRef.current.srcObject = null;
      }
      detectorRef.current = null;
      setScannerActive(false);
    }

    if (scannerActive) {
      startCameraAndScan();
    }

    return () => {
      scanningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (rafId) cancelAnimationFrame(rafId);
      if (intervalId) clearTimeout(intervalId);
    };
  }, [scannerActive]);

  const handleManualSubmit = () => {
    if (manualInput.trim() !== '') {
      setScannedValue(manualInput.trim());
      setManualInput('');
      setScanError('');
      // If scanner was active, stop it
      if (scannerActive) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        setScannerActive(false);
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 3, textAlign: { xs: "center", md: "left" } }}
          >
            Package Details
          </Typography>
      <Grid container sx={{padding:4}}>
        <Grid item xs={12} md={4} >

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
                    <FormControlLabel value="Black" control={<Radio />} label="Black" />
                    <FormControlLabel value="Beige" control={<Radio />} label="Beige" />
                    <FormControlLabel value="Silver" control={<Radio />} label="Silver" />
                    <FormControlLabel value="White" control={<Radio />} label="White" />
                  </RadioGroup>
                </Box>

              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={8} >
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <Stack spacing={4} >
                <Paper onClick={() => setScannerActive(true)}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: '45vh' }}>
                  {scannerActive ? <QrScannerPopup onClose={() => setScannerActive(false)} onScan={(data) => console.log(data)} /> : <Box sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 3 }}
                    
                    >
                      Box ID Scan
                    </Typography>
                  </Box>}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailsQcUi;
