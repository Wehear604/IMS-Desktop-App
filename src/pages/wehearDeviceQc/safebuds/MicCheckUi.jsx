import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { SafebudsDeviceAudioCheck } from "../../../store/actions/deviceQcAction";
import { useDispatch, useSelector } from "react-redux";
import disabledChecked from "../../../assets/images/checkIconDisabled.svg";
import enabledChecked from "../../../assets/images/checkIconEnabled.svg";
const StepCard = ({
  isChecked,
  checked,
  title,
  subtitle,
  action,
  checkBox,
}) => (
  <Card
    sx={{
      width: "100%",
      borderRadius: 2,
      boxShadow: 0,
      border: "1px solid #e6e6e6",
      mb: 2,
    }}
  >
    <List>
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display={"flex"} gap={4} alignItems="center">
          {isChecked ? (
            <img src={checked ? enabledChecked : disabledChecked} alt="check" />
          ) : (
            checkBox && <Box>{checkBox}</Box>
          )}
          <ListItemText
            primary={<Typography variant="h5">{title}</Typography>}
            secondary={
              subtitle ? <Typography variant="h6">{subtitle}</Typography> : null
            }
          />
        </Box>
        {action && <Box>{action}</Box>}
      </ListItem>
    </List>
  </Card>
);

const MicCheckUi = () => {
  const dispatch = useDispatch();
  const { device, deviceQc } = useSelector((state) => state);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [devices, setDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission so labels are available
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list.filter((d) => d.kind === "audioinput");

        setDevices(mics);

        if (mics.length) {
          // Prefer "Communication" mic
          const communicationMic = mics.find((m) =>
            m.label.toLowerCase().includes("communication")
          );

          setSelectedMic(
            communicationMic ? communicationMic.deviceId : mics[0].deviceId
          );
        }
      } catch (err) {
        console.error("Mic permission error:", err);
      }
    };

    loadDevices();
  }, []);

  const stopMonitoring = async () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        await audioCtxRef.current.close();
      } catch {}
    }

    audioCtxRef.current = null;
    analyserRef.current = null;
    setIsRunning(false);
  };

  const startMonitoring = async () => {
    if (!selectedMic || isRunning) return;

    await stopMonitoring();

    try {
      audioCtxRef.current = new AudioContext();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: selectedMic } },
      });

      streamRef.current = stream;

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioCtxRef.current.createAnalyser();

      analyserRef.current.fftSize = 1024;
      source.connect(analyserRef.current);

      setMicLevel(0);
      setPeakLevel(0);
      setIsRunning(true);

      const data = new Uint8Array(analyserRef.current.fftSize);

      const draw = () => {
        if (!analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        analyserRef.current.getByteTimeDomainData(data);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0b1225";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#6cc9ff";
        ctx.lineWidth = 2;
        ctx.beginPath();

        let sum = 0;
        const slice = canvas.width / data.length;

        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128 - 1;
          const y = canvas.height / 2 + v * (canvas.height / 3);
          sum += Math.abs(v);

          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * slice, y);
        }

        ctx.stroke();

        const rms = sum / data.length;
        setMicLevel(rms);
        setPeakLevel((p) => (rms > p ? rms : p));

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();

      // ⏱ Auto-stop after 1 minute
      timerRef.current = setTimeout(() => {
        stopMonitoring();
      }, 60000);
    } catch (err) {
      console.error("Failed to start mic:", err);
      stopMonitoring();
    }
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  const currentPercent = (micLevel * 100).toFixed(1);
  const peakPercent = (peakLevel * 100).toFixed(0);

  useEffect(() => {
    if (peakPercent > 10) {
      dispatch(SafebudsDeviceAudioCheck());
    }
  }, [peakPercent]);

  return (
    <>
      <Card
        sx={{
          maxWidth: 520,
          m: "24px auto",
          borderRadius: 4,
          background:
            "linear-gradient(140deg, #0b1225 0%, #0f1c38 60%, #0a1023 100%)",
          color: "#e5e9ff",
        }}
        elevation={8}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography sx={{ fontSize: 11, opacity: 0.7 }}>
                SAFEBUDS QC
              </Typography>
              <Typography variant="h6">Microphone Monitor</Typography>
            </Box>

            <Chip
              label={`${currentPercent}%`}
              sx={{
                fontWeight: 600,
                color: "#0a1225",
                background:
                  "linear-gradient(120deg, #b9f3ff, #8ad5ff, #b7a9ff)",
              }}
            />
          </Stack>

          {/* Mic selector */}
          <FormControl size="small" fullWidth sx={{ mt: 2 }}>
            <InputLabel>Microphone</InputLabel>
            <Select
              label="Microphone"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              disabled={isRunning}
            >
              {devices.map((d) => (
                <MenuItem key={d.deviceId} value={d.deviceId}>
                  {d.label || "Microphone"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start / Stop */}
          {/* Start / Stop Controls */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 2,
              p: 1.2,
              borderRadius: 3,
              background: "rgba(255,255,255,0.04)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* START */}
            <Box
              onClick={!isRunning ? startMonitoring : undefined}
              sx={{
                flex: 1,
                cursor: isRunning ? "default" : "pointer",
                borderRadius: 999,
                py: 1.3,
                textAlign: "center",
                fontWeight: 700,
                letterSpacing: 0.5,
                color: isRunning ? "#9fb3c8" : "#08121f",
                background: isRunning
                  ? "linear-gradient(145deg, #2a3244, #1a2130)"
                  : "linear-gradient(135deg, #7ae4ff, #5bb6ff, #9f8bff)",
                boxShadow: isRunning
                  ? "none"
                  : "0 0 18px rgba(120,200,255,0.55)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: isRunning ? "none" : "translateY(-1px)",
                  boxShadow: isRunning
                    ? "none"
                    : "0 0 28px rgba(120,200,255,0.75)",
                },
              }}
            >
              {isRunning ? "RUNNING" : "START"}
            </Box>

            {/* STOP */}
            <Box
              onClick={isRunning ? stopMonitoring : undefined}
              sx={{
                flex: 1,
                cursor: isRunning ? "pointer" : "default",
                borderRadius: 999,
                py: 1.3,
                textAlign: "center",
                fontWeight: 700,
                letterSpacing: 0.5,
                color: isRunning ? "#2a0a0a" : "#9b6b6b",
                background: isRunning
                  ? "linear-gradient(135deg, #ff9a9a, #ff6b6b)"
                  : "linear-gradient(145deg, #2a1a1a, #1a1010)",
                boxShadow: isRunning
                  ? "0 0 16px rgba(255,120,120,0.45)"
                  : "none",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: isRunning ? "translateY(-1px)" : "none",
                  boxShadow: isRunning
                    ? "0 0 26px rgba(255,120,120,0.7)"
                    : "none",
                },
              }}
            >
              STOP
            </Box>
          </Stack>

          {/* Canvas */}
          <Box
            sx={{
              mt: 2,
              borderRadius: 3,
              overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              p: 1,
            }}
          >
            <canvas
              ref={canvasRef}
              width={460}
              height={140}
              style={{ width: "100%", display: "block" }}
            />
          </Box>

          {/* Metrics */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 11, opacity: 0.6 }}>
                CURRENT
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                {currentPercent}%
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 11, opacity: 0.6 }}>PEAK</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                {peakPercent}%
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <StepCard
        isChecked={true}
        checked={device.isMic}
        title={
          device.isMic
            ? "Microphone Functionality Verified"
            : "Microphone Functionality Not Verified"
        }
      />
    </>
  );
};

export default MicCheckUi;
