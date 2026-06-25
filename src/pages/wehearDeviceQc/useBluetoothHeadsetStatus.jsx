import { useEffect, useState, useRef } from "react";

export default function useBluetoothHeadsetStatus() {
  const [connectedHeadset, setConnectedHeadset] = useState(null);
  const isMounted = useRef(true);
  const stopChecking = useRef(false); // process stop control

  const checkHeadset = async () => {
    if (stopChecking.current) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      console.log("mics", mics);
      for (const mic of mics) {
        if (stopChecking.current) return;

        if (isBluetoothHeadset(mic)) {
          const active = await isDeviceActive(mic.deviceId);

          if (active && isMounted.current) {
            setConnectedHeadset(mic);
            console.log("🎧 Connected:", mic.label);

            // headset found → stop further process
            stopChecking.current = true;
            return;
          }
        }
      }

      if (isMounted.current) {
        setConnectedHeadset(null);
        console.log("❌ No Bluetooth headset connected");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkHeadset();

    const handleChange = () => {
      console.log("🔄 Device change detected");

      // restart checking on device change
      stopChecking.current = false;
      checkHeadset();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleChange);

    return () => {
      isMounted.current = false;
      stopChecking.current = true;
      navigator.mediaDevices.removeEventListener("devicechange", handleChange);
    };
  }, []);

  return connectedHeadset;
}

// Detect bluetooth headset
const isBluetoothHeadset = (device) => {
  const label = device.label.toLowerCase();

  return (
    label.includes("bluetooth") ||
    label.includes("headset") ||
    label.includes("airpods") ||
    label.includes("buds")
  );
};

// Check active device
const isDeviceActive = async (deviceId) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });

    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
};
