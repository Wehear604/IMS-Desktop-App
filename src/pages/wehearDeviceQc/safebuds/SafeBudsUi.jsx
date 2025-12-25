import React, { useEffect, useRef, useState } from "react";
import {
  SafeBudsDeviceName,
  SafeBudsTap,
} from "../../../store/actions/deviceQcAction";
import { useDispatch } from "react-redux";

const SafeBudsUi = () => {
  const dispatch = useDispatch();

  const [micLevel, setMicLevel] = useState(0);
  const [maxMicLevel, setMaxMicLevel] = useState(0);

  const rafIdRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    dispatch(SafeBudsDeviceName({ type: "NameChange" }));
    dispatch(SafeBudsTap({ type: "Tap" }));
  }, [dispatch]);

  useEffect(() => {
    let analyser;
    let data;
    let audioCtx;

    const startMicCheck = async () => {
      try {
        audioCtx = new AudioContext();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false },
        });

        streamRef.current = stream;

        const source = audioCtx.createMediaStreamSource(stream);

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;

        data = new Uint8Array(analyser.fftSize);
        source.connect(analyser);

        const tick = () => {
          analyser.getByteTimeDomainData(data);

          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }

          const rms = Math.sqrt(sum / data.length);

          // current live mic level
          setMicLevel(rms);

          // highest value reached so far
          setMaxMicLevel((prev) => (rms > prev ? rms : prev));

          rafIdRef.current = requestAnimationFrame(tick);
        };

        tick();
      } catch (err) {
        console.error("Mic permission/initialization failed", err);
      }
    };

    startMicCheck();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div>
      <h3>SafeBuds UI</h3>

      <div>Mic level: {(micLevel * 100).toFixed(1)}%</div>
      <div>Max mic level: {(maxMicLevel * 100).toFixed(1)}%</div>
    </div>
  );
};

export default SafeBudsUi;
