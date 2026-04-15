import { useEffect, useState } from "react";

export default function useBluetoothHeadsetStatus() {
  const [connectedHeadset, setConnectedHeadset] = useState(null);

  const checkHeadset = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");

      for (const mic of mics) {
        if (isBluetoothHeadset(mic)) {
          const active = await isDeviceActive(mic.deviceId);

          if (active) {
            setConnectedHeadset(mic);
            console.log("🎧 Connected:", mic.label);
            return;
          }
        }
      }

      setConnectedHeadset(null);
      console.log("❌ No Bluetooth headset connected");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkHeadset();

    const handleChange = () => {
      console.log("🔄 Device change detected");
      checkHeadset();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleChange);
    };
  }, []);

  return connectedHeadset;
}

// helper functions
const isBluetoothHeadset = (device) => {
  const label = device.label.toLowerCase();
  return (
    label.includes("bluetooth") ||
    label.includes("headset") ||
    label.includes("airpods") ||
    label.includes("buds")
  );
};

const isDeviceActive = async (deviceId) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });

    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
};
