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
} from "@mui/material";

const MicCheckUi = () => {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);

  const [devices, setDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");

  // ---------- Get mic list ----------
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // ask permission so labels become visible
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list.filter((d) => d.kind === "audioinput");

        setDevices(mics);
        if (mics.length && !selectedMic) setSelectedMic(mics[0].deviceId);
      } catch (e) {
        console.error("Mic permission error:", e);
      }
    };

    loadDevices();
  }, []);

  // ---------- Start monitoring whenever mic changes ----------
  useEffect(() => {
    if (!selectedMic) return;

    let data;

    const stopCurrent = async () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          await audioCtxRef.current.close();
        } catch (e) {
          // ignore double-close
        }
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
    };

    const start = async () => {
      try {
        await stopCurrent();

        audioCtxRef.current = new AudioContext();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: selectedMic },
          },
        });

        streamRef.current = stream;

        const source = audioCtxRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 1024;

        data = new Uint8Array(analyserRef.current.fftSize);
        source.connect(analyserRef.current);

        draw();
      } catch (err) {
        console.error("Error starting audio:", err);
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const analyser = analyserRef.current;

      if (!canvas || !ctx || !analyser || !data) return;

      analyser.getByteTimeDomainData(data);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, "#0b1225");
      bg.addColorStop(1, "#101a33");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#6cc9ff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#59b2ff";

      ctx.beginPath();
      const slice = canvas.width / data.length;

      let sum = 0;

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

    start();

    return () => {
      stopCurrent();
    };
  }, [selectedMic]);

  const currentPercent = (micLevel * 100).toFixed(1);
  const peakPercent = (peakLevel * 100).toFixed(0);

  return (
    <Card
      sx={{
        maxWidth: 520,
        m: "24px auto",
        borderRadius: 4,
        background:
          "linear-gradient(140deg, #0b1225 0%, #0f1c38 60%, #0a1023 100%)",
        color: "#e5e9ff",
        p: 1.5,
      }}
      elevation={8}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Box>
            <Typography sx={{ fontSize: 11, opacity: 0.7 }}>
              SAFEBUDS QC
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              Microphone Monitor
            </Typography>
          </Box>

          <Chip
            label={`${currentPercent}%`}
            sx={{
              fontWeight: 600,
              color: "#0a1225",
              background: "linear-gradient(120deg, #b9f3ff, #8ad5ff, #b7a9ff)",
            }}
          />
        </Stack>

        {/* mic selector */}
        <FormControl size="small" fullWidth sx={{ mt: 1 }}>
          <InputLabel>Microphone</InputLabel>
          <Select
            label="Microphone"
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
          >
            {devices.map((d) => (
              <MenuItem key={d.deviceId} value={d.deviceId}>
                {d.label || "Microphone"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* monitor */}
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

        {/* bottom metrics */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 11, opacity: 0.6 }}>CURRENT</Typography>
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
  );
};

export default MicCheckUi;