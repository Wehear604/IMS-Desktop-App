import {
  actions,
  CHARACTERISTIC_UUID_READ_NOTIFY,
  CHARACTERISTIC_UUID_READ_WRITE,
  DEVICES,
  LISTENING_SIDE,
  SERVICE_UUID,
} from "../../../utils/constants";

const tapChanges = (value) => {
  switch (value) {
    case "Single Tap":
      return 1;
    case "Double Tap":
      return 2;
    case "Triple Tap":
      return 3;
    case "Long Press":
      return 4;
    default:
      return null;
  }
};

const commandQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || commandQueue.length === 0) return;

  isProcessing = true;
  const { command, side, deviceObj, type, dispatch, resolve, reject } =
    commandQueue.shift();

  try {
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;

    if (!device || !device.gatt) {
      throw new Error("No valid Bluetooth device found!");
    }

    const serviceUuid = SERVICE_UUID[DEVICES.SAFE_BUDS];

    const CHARACTERISTIC_UUID_WRITE =
      CHARACTERISTIC_UUID_READ_WRITE[DEVICES.SAFE_BUDS];

    const CHARACTERISTIC_UUID_READ =
      CHARACTERISTIC_UUID_READ_NOTIFY[DEVICES.SAFE_BUDS];

    const service = await device.gatt.getPrimaryService(serviceUuid);

    const characteristicWrite = await service.getCharacteristic(
      CHARACTERISTIC_UUID_WRITE
    );

    const characteristicRead = await service.getCharacteristic(
      CHARACTERISTIC_UUID_READ
    );

    // ---- Enable notifications (once per command run) ----
    await characteristicRead.startNotifications();

    // ---- SHARED LISTENER ----
    const onValueChanged = (event) => {
      const bytes = Array.from(new Uint8Array(event.target.value.buffer));

      // ACK for write string (60 01 ...)
      if (bytes[0] === 0xa0 && bytes[1] === 0x60) {
        console.log("✔️ Version write success");
        return;
      }

      // Read response (B0 60 LEN DATA...)
      if (bytes[0] === 0xb0 && bytes[1] === 0x60) {
        const length = bytes[2];
        const version = String.fromCharCode(...bytes.slice(3, 3 + length));
        console.log("📦 Stored version:", version);
        return;
      }

      // Tap events (50 ...)
      if (bytes[0] === 0x50) {
        const decoded = {
          raw: bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "),
          device:
            bytes[1] === 0x01
              ? "Left"
              : bytes[1] === 0x02
              ? "Right"
              : "Unknown",
          event:
            bytes[2] === 0x01
              ? "Single Tap"
              : bytes[2] === 0x02
              ? "Double Tap"
              : bytes[2] === 0x03
              ? "Triple Tap"
              : bytes[2] === 0x04
              ? "Long Press"
              : "Unknown",
          action:
            bytes[3] === 0x01
              ? "Play/Pause"
              : bytes[3] === 0x02
              ? "Voice Assistant"
              : bytes[3] === 0x03
              ? "Volume Up"
              : bytes[3] === 0x04
              ? "Volume Down"
              : bytes[3] === 0x05
              ? "Next Track"
              : bytes[3] === 0x06
              ? "Previous Track"
              : "No Action",
        };

        console.log("Tap Notification:", decoded);

        dispatch({
          type: actions.SET_SAFE_BUDS_TAP,
          mode: tapChanges(decoded?.event),
          tapSide:
            decoded.device === "Left"
              ? LISTENING_SIDE.LEFT
              : LISTENING_SIDE.RIGHT,
        });

        return;
      }
    };

    characteristicRead.addEventListener(
      "characteristicvaluechanged",
      onValueChanged
    );

    // ------------------------------
    // ACTIONS
    // ------------------------------

    if (type === "Tap") {
      resolve(true);
      isProcessing = false;
      processQueue();
      return;
    }

    if (type === "SafeBudsVersionRead") {
      // send read command (60 02)
      await characteristicWrite.writeValue(new Uint8Array([0x60, 0x02]));

      resolve(true);
      isProcessing = false;
      processQueue();
      return;
    }
  } catch (error) {
    console.error(`Error reading data from ${side} device:`, error);
    reject(error);
    isProcessing = false;
    processQueue();
  }
};

const Read = (command, side, deviceObj, type, dispatch) => {
  return new Promise((resolve, reject) => {
    commandQueue.push({
      command,
      side,
      deviceObj,
      type,
      dispatch,
      resolve,
      reject,
    });
    processQueue();
  });
};

export default Read;
