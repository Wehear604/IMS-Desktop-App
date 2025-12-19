// ble.js - main-process BLE handling for Electron (noble + IPC)
// Drop into your Electron main process. Assumes constants are exported from ../src/utils/constants

const noble = require("@abandonware/noble");
const { BrowserWindow, ipcMain } = require("electron");
const {
  SERVICE_UUID,
  MANUFACTURER_IDENTIFIER,
  CHARACTERISTIC_UUID_READ_WRITE,
  CHARACTERISTIC_UUID_READ_NOTIFY,
} = require("../src/utils/constants");

// -------------------- Globals / Config --------------------

let discovered = {};
let isScanning = false;
let isConnected = false;
let currentScanType = 1;
const CONNECT_TIMEOUT_MS = 10000; // Connection timeout

// UUID Configuration
const VOLUME_UUID_BY_TYPE = {
  1: "e093f3b5-00a3-a9e5-9eca-40026e0edc24",
};

// Helper to send messages to all renderer windows
function send(channel, data) {
  BrowserWindow.getAllWindows().forEach((w) => {
    try {
      w.webContents.send(channel, data);
    } catch (e) {
      /* ignore */
    }
  });
}

// Helper: normalize UUID (no dashes, lowercase)
function normalizeUUID(uuid) {
  return String(uuid || "")
    .replace(/-/g, "")
    .toLowerCase();
}

// Helper: parse manufacturer id (0x#### -> integer)
function parseManufHex(hexStr) {
  if (!hexStr) return NaN;
  return parseInt(String(hexStr).replace(/^0x/i, ""), 16);
}

const MANUF_MAP_INT = {};
Object.keys(MANUFACTURER_IDENTIFIER || {}).forEach((k) => {
  try {
    MANUF_MAP_INT[k] = parseManufHex(MANUFACTURER_IDENTIFIER[k]);
  } catch (e) {
    MANUF_MAP_INT[k] = NaN;
  }
});

// -------------------- Activity Logger --------------------

const MAX_LOGS_PER_DEVICE = 500;
const activityStore = {}; // { deviceId: [{ts, level, msg, meta}], "__global": [...] }

function nowIso() {
  return new Date().toISOString();
}
function pushActivity(deviceId, level, msg, meta) {
  const entry = {
    ts: nowIso(),
    level: String(level || "info"),
    deviceId: deviceId || null,
    msg: String(msg || ""),
    meta: meta || null,
  };

  if (!activityStore.__global) activityStore.__global = [];
  activityStore.__global.push(entry);
  if (activityStore.__global.length > MAX_LOGS_PER_DEVICE)
    activityStore.__global.shift();

  const id = deviceId || "__nogadget";
  if (!activityStore[id]) activityStore[id] = [];
  activityStore[id].push(entry);
  if (activityStore[id].length > MAX_LOGS_PER_DEVICE) activityStore[id].shift();

  // broadcast
  try {
    BrowserWindow.getAllWindows().forEach((w) => {
      try {
        w.webContents.send("ble-activity", entry);
      } catch (e) {}
    });
  } catch (e) {
    /* ignore */
  }

  if (entry.level === "error")
    console.error(
      `[BLE][${entry.ts}][${deviceId}] ${entry.msg}`,
      entry.meta || ""
    );
  else
    console.log(
      `[BLE][${entry.ts}][${deviceId}] ${entry.msg}`,
      entry.meta || ""
    );
}
function activityInfo(deviceId, msg, meta) {
  pushActivity(deviceId, "info", msg, meta);
}
function activityWarn(deviceId, msg, meta) {
  pushActivity(deviceId, "warn", msg, meta);
}
function activityError(deviceId, msg, meta) {
  pushActivity(deviceId, "error", msg, meta);
}

ipcMain.handle("ble-activity-get", (event, { deviceId, limit } = {}) => {
  const id = deviceId || "__global";
  const arr = (activityStore[id] || []).slice(-(limit || MAX_LOGS_PER_DEVICE));
  return arr;
});

// -------------------- Noble state change --------------------

noble.on("stateChange", (state) => {
  console.log("Noble state:", state);
  activityInfo(null, `Adapter state: ${state}`);
  if (state === "poweredOn") {
    send("ble-status", "Bluetooth adapter ready. Click 'Start Scan' to begin.");
  } else {
    if (isScanning) {
      try {
        noble.stopScanning();
      } catch (e) {}
      isScanning = false;
    }
    isConnected = false;
    send("ble-status", `Bluetooth state: ${state}`);
  }
});

// -------------------- Discovery handler (Manufacturer Filter RESTORED) --------------------

noble.on("discover", (peripheral) => {
  try {
    const adv = peripheral.advertisement || {};
    const mfg = adv.manufacturerData;

    if (!mfg || mfg.length < 2) return;

    const companyId = mfg.readUInt16LE(0);
    const expected = MANUF_MAP_INT[currentScanType];

    if (!Number.isNaN(expected) && companyId !== expected) {
      return;
    }

    if (isConnected || peripheral.connecting) return;

    const name = adv.localName || "QC Device";

    discovered[peripheral.id] = {
      peripheral,
      chars: {},
      deviceType: currentScanType,
      discoveryComplete: false,
    };

    activityInfo(
      peripheral.id,
      `Discovered device (${name}) rssi=${peripheral.rssi}`,
      { address: peripheral.address }
    );

    send("ble-device", {
      id: peripheral.id,
      mac: peripheral.address,
      name,
      rssi: peripheral.rssi,
    });
  } catch (err) {
    activityError(null, "Error in discover handler", {
      err: err && err.message,
    });
    console.error("Error in discover handler:", err);
  }
});

function startBleScanWithType(type = 1) {
  if (noble.state !== "poweredOn") {
    send("ble-status", `Bluetooth state: ${noble.state}`);
    return;
  }
  if (isScanning || isConnected) {
    send("ble-status", "Already scanning or connected.");
    return;
  }

  const t = type && SERVICE_UUID && SERVICE_UUID[type] ? type : 1;
  currentScanType = t;

  discovered = {};
  try {
    noble.startScanning([], true);
    isScanning = true;
    activityInfo(null, `Started scanning for device type ${t}`);
    send("ble-status", `Scanning for device type ${t}...`);
    console.log("Started scanning, deviceType:", t);
  } catch (e) {
    console.error("Start scanning error:", e);
    activityError(null, "Start scanning error", { err: e && e.message });
    send("ble-error", "Failed to start scanning.");
    isScanning = false;
  }
}

function stopBleScan() {
  if (isScanning) {
    try {
      noble.stopScanning();
    } catch (e) {}
    isScanning = false;
    activityInfo(null, "Scan stopped by user");
    send("ble-status", "Scan stopped by user.");
    console.log("Stopped scanning.");
  }
}

// -------------------- IPC Handlers --------------------

ipcMain.on("ble-scan-start", (event, type) => {
  const num = Number(type) || 1;
  startBleScanWithType(num);
});
ipcMain.on("ble-scan-stop", () => stopBleScan());

ipcMain.on("ble-disconnect", (event, id) => {
  const rec = discovered[id];
  const p = rec && rec.peripheral;
  if (p && p.state === "connected") {
    activityInfo(id, `Manual disconnect requested`);
    console.log(`Manual disconnect for ${id}`);
    isConnected = false;
    try {
      p.disconnect(() => {});
    } catch (e) {}
  } else {
    if (isScanning) {
      try {
        noble.stopScanning();
      } catch (e) {}
      isScanning = false;
    }
    if (rec) delete discovered[id];
    activityInfo(id, `Device removed from discovered list`);
    send("ble-status", "Ready to scan.");
  }
});

// -------------------- CONNECT LOGIC (Two-Step Discovery) --------------------

ipcMain.on("ble-connect-manual", (event, payload) => {
  let id, deviceType;
  if (typeof payload === "string") {
    id = payload;
    deviceType = currentScanType || 1;
  } else if (payload && typeof payload === "object") {
    id = payload.id;
    deviceType = payload.type || currentScanType || 1;
  } else {
    send("ble-error", "Invalid connect payload");
    return;
  }

  const rec = discovered[id];
  const p = rec && rec.peripheral;
  if (!p) {
    activityWarn(id, "Device not found when attempting connect");
    send("ble-error", "Device not found. Start scan and try again.");
    return;
  }
  if (isConnected || p.connecting) {
    send("ble-status", "Already connected or connecting to a device.");
    return;
  }

  if (isScanning) {
    try {
      noble.stopScanning();
    } catch (e) {}
    isScanning = false;
  }

  send("ble-status", `Connecting to ${p.advertisement.localName || p.id}...`);
  p.connecting = true;

  const connectTimeout = setTimeout(() => {
    if (p.connecting) {
      p.connecting = false;
      console.error("Connection timed out for", id);
      activityError(id, "Connection timed out");
      send("ble-error", `Connection to ${id} timed out.`);
      try {
        p.disconnect(() => {});
      } catch (e) {}
    }
  }, CONNECT_TIMEOUT_MS);

  p.connect((err) => {
    clearTimeout(connectTimeout);
    p.connecting = false;
    if (err) {
      console.error("Connect error:", err);
      activityError(id, "Connect error", { err: err && err.message });
      send("ble-error", `Connection error: ${err.message || err}`);
      return;
    }

    isConnected = true;
    rec.deviceType = deviceType;
    rec.discoveryComplete = false;

    activityInfo(p.id, "Connected", { mac: p.address });
    send("ble-connected", {
      id: p.id,
      mac: p.address,
      name: p.advertisement.localName || "QC Device",
    });
    console.log("Connected to", p.id, "MAC:", p.address);

    p.once("disconnect", () => {
      console.log("Peripheral disconnected:", p.id);
      activityWarn(p.id, "Peripheral disconnected");
      isConnected = false;
      if (discovered[p.id]) {
        try {
          const nc = discovered[p.id].chars.notifyChar;
          if (nc && nc.unsubscribe) nc.unsubscribe();
        } catch (e) {}
        delete discovered[p.id];
      }
      send("ble-status", "Device disconnected. Ready to scan again.");
    });

    // --- Targeted Discovery Setup ---
    const serviceUuidRaw = SERVICE_UUID[deviceType] || SERVICE_UUID[1];
    const notifyUuidRaw =
      CHARACTERISTIC_UUID_READ_NOTIFY[deviceType] ||
      CHARACTERISTIC_UUID_READ_NOTIFY[1];
    const writeUuidRaw =
      CHARACTERISTIC_UUID_READ_WRITE[deviceType] ||
      CHARACTERISTIC_UUID_READ_WRITE[1];

    const serviceNormalized = normalizeUUID(serviceUuidRaw);
    const notifyNormalized = normalizeUUID(notifyUuidRaw);
    const writeNormalized = normalizeUUID(writeUuidRaw);

    // --- STEP 1: Discover ALL Services to check target UUID ---
    console.log("Starting full service discovery...");
    activityInfo(p.id, "Starting full service discovery");
    send("ble-status", "Discovering all services...");

    p.discoverServices([], (err, services) => {
      if (err) {
        console.error("Full Service discovery error:", err);
        rec.discoveryComplete = true;
        activityError(p.id, "Full Service discovery error", {
          err: err && err.message,
        });
        send("ble-error", "Service discovery failed.");
        return;
      }

      if (!services || services.length === 0) {
        console.error("FATAL: discoverServices found ZERO services.");
        rec.discoveryComplete = true;
        activityError(p.id, "Service discovery returned zero services");
        send("ble-error", "Service discovery failed: Zero services found.");
        return;
      }

      console.log(
        "Discovered ALL Services:",
        services.map((s) => s.uuid)
      );
      activityInfo(p.id, `Discovered ${services.length} services`, {
        services: services.map((s) => s.uuid),
      });
      send(
        "ble-status",
        `Discovered ${services.length} services. Fetching characteristics...`
      );

      // --- STEP 2: Discover Characteristics ONLY for the target service ---
      const targetService = services.find(
        (s) => normalizeUUID(s.uuid) === serviceNormalized
      );

      if (!targetService) {
        console.error(
          `Target service ${serviceNormalized} not in the discovered list. Check constants.`
        );
        rec.discoveryComplete = true;
        activityError(p.id, `Target service ${serviceNormalized} not found`);
        send("ble-error", `Target service ${serviceNormalized} not found.`);
        return;
      }

      targetService.discoverCharacteristics([], (err, characteristics) => {
        rec.discoveryComplete = true;

        if (err) {
          console.log("Characteristic discovery error:", err);
          return;
        }
        console.log("---- CHARACTERISTICS FOUND ----");
        characteristics.forEach((c) => {
          console.log("UUID:", c.uuid, " Properties:", c.properties);
        });
        console.log("---- END ----");
        rec.peripheral.characteristics = characteristics;
        try {
          rec.peripheral.characteristics = characteristics;
        } catch (e) {}

        // --- Robust Characteristic Mapping ---
        const byUuidMap = {};
        characteristics.forEach((c) => {
          if (c && c.uuid) byUuidMap[normalizeUUID(c.uuid)] = c;
        });

        let notifyChar = byUuidMap[notifyNormalized];
        let writeChar = byUuidMap[writeNormalized];

        if (!notifyChar)
          notifyChar = characteristics.find((c) =>
            normalizeUUID(c.uuid).includes(notifyNormalized)
          );
        if (!writeChar)
          writeChar = characteristics.find((c) =>
            normalizeUUID(c.uuid).includes(writeNormalized)
          );

        rec.chars = Object.assign({ notifyChar, writeChar }, byUuidMap);

        if (notifyChar) {
          notifyChar.on("data", (data, isNotification) => {
            const hex = Buffer.from(data).toString("hex");
            activityInfo(p.id, `Notify data received: ${hex}`, {
              isNotification,
            });
            send("ble-data", { id: p.id, hex });
            try {
              const bytes = Buffer.from(hex, "hex");
              if (bytes.length >= 2) {
                const vol = bytes[1];
                activityInfo(p.id, `Volume update via notify: ${vol}`, { hex });
                send("ble-volume-updated", { id: p.id, volume: vol });
              }
            } catch (e) {
              activityWarn(p.id, "Error parsing notification volume", {
                err: e && e.message,
              });
            }
          });

          notifyChar.subscribe((err) => {
            if (!err) {
              activityInfo(p.id, "Notifications enabled on characteristic", {
                uuid: notifyChar.uuid,
              });
              send("ble-status", "Notifications enabled.");
            } else {
              activityWarn(p.id, "Failed to enable notifications", {
                err: err && err.message,
              });
            }
          });
        }

        if (writeChar) {
          activityInfo(p.id, "Write characteristic available", {
            uuid: writeChar.uuid,
          });
          send("ble-write-ready", { id: p.id, canWrite: true });
        }
      });
    });
  });
});

// -------------------- Write handler --------------------

ipcMain.on("ble-write", (event, payload) => {
  if (!payload || !payload.id || payload.data === undefined) {
    activityWarn(null, "Invalid write payload");
    send("ble-error", "Invalid write payload.");
    return;
  }
  const rec = discovered[payload.id];
  if (!rec || !rec.peripheral) {
    activityWarn(payload.id, "Device not found for write");
    send("ble-error", "Device not found / not connected.");
    return;
  }
  const writeChar = rec.chars && rec.chars.writeChar;
  if (!writeChar) {
    activityWarn(payload.id, "Write characteristic not available");
    send("ble-error", "Write characteristic not available.");
    return;
  }
  let buffer;
  if (Buffer.isBuffer(payload.data)) buffer = payload.data;
  else if (typeof payload.data === "string") {
    const hex = payload.data.replace(/^0x/i, "");
    buffer = Buffer.from(hex, "hex");
  } else {
    activityWarn(payload.id, "Unsupported write data format", {
      dataType: typeof payload.data,
    });
    send("ble-error", "Unsupported write data format.");
    return;
  }
  writeChar.write(buffer, !!payload.withoutResponse, (err) => {
    if (err) {
      console.error("Write error:", err);
      activityError(payload.id, "Write failed", {
        err: err && err.message,
        hex: buffer.toString("hex"),
      });
      send("ble-error", `Write failed: ${err.message || err}`);
    } else {
      activityInfo(payload.id, "Write successful", {
        hex: buffer.toString("hex"),
      });
      send("ble-write-done", { id: payload.id });
    }
  });
});

// -------------------- Read / Polling Logic --------------------

function tryReadChar(char) {
  return new Promise((resolve, reject) => {
    if (!char) return reject(new Error("Characteristic is null"));
    if (!char.read || typeof char.read !== "function")
      return reject(new Error("No read function"));

    try {
      char.read((err, data) => {
        if (err) return reject(err);
        try {
          const hex = Buffer.from(data).toString("hex");
          resolve({ uuid: char.uuid, hex });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

function collectReadCandidates(rec, normalizedUuid) {
  const map = new Map();

  if (rec.chars) {
    Object.values(rec.chars).forEach((c) => {
      if (c && c.uuid) map.set(normalizeUUID(c.uuid), c);
    });
  }

  if (rec.peripheral && Array.isArray(rec.peripheral.characteristics)) {
    rec.peripheral.characteristics.forEach((c) => {
      if (c && c.uuid) map.set(normalizeUUID(c.uuid), c);
    });
  }

  const allChars = Array.from(map.values());
  const exact = [],
    others = [];

  allChars.forEach((c) => {
    if (normalizedUuid && normalizeUUID(c.uuid) === normalizedUuid)
      exact.push(c);
    else others.push(c);
  });

  return [...exact, ...others];
}

async function tryReadCandidatesSequential(candidates) {
  for (const c of candidates) {
    try {
      const result = await tryReadChar(c);
      return result;
    } catch (err) {
      continue;
    }
  }
  throw new Error("All candidate reads failed");
}

function parseVolumeFromHex(hex) {
  try {
    const bytes = Buffer.from(hex, "hex");
    if (bytes.length >= 2) return bytes[1];
    if (bytes.length === 1) return bytes[0];
  } catch (e) {
    return null;
  }
  return null;
}

function detectChangeInHistory(hexHistory, byteIndexPreference = [1, 0]) {
  const bytesList = hexHistory
    .filter((h) => typeof h === "string" && h.length > 0)
    .map((h) => h.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []);

  if (bytesList.length <= 1)
    return {
      changed: false,
      reason: "insufficient samples",
      chosenIndex: null,
    };

  for (const preferredIdx of byteIndexPreference) {
    const vals = bytesList.map((b) =>
      b.length > preferredIdx ? b[preferredIdx] : null
    );
    if (vals.every((v) => v === null)) continue;
    const unique = Array.from(new Set(vals));
    if (unique.length > 1)
      return { changed: true, chosenIndex: preferredIdx, values: vals };
  }

  const maxLen = bytesList.reduce((m, b) => Math.max(m, b.length), 0);
  for (let idx = 0; idx < maxLen; idx++) {
    const vals = bytesList.map((b) => (b.length > idx ? b[idx] : null));
    const unique = Array.from(new Set(vals));
    if (unique.length > 1)
      return { changed: true, chosenIndex: idx, values: vals };
  }

  return { changed: false, reason: "no variation detected", chosenIndex: null };
}

async function readVolumeNowPromise(peripheralId, opts = {}) {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  opts = Object.assign(
    {
      notifyTimeoutMs: 3000,
      pollCount: 5,
      pollIntervalMs: 400,
      discoveryWaitMs: 2500,
      discoveryMaxAttempts: 40,
      extendDiscoveryWithAllChars: true, // try discoverAllServicesAndCharacteristics fallback
      debug: true, // emit verbose activity logs
    },
    opts || {}
  );

  const rec = discovered[peripheralId];
  if (!rec || !rec.peripheral)
    throw new Error("Device not found or not connected.");

  const p = rec.peripheral;

  if (opts.debug)
    activityInfo(peripheralId, "readVolumeNowPromise START", { opts });

  // If discovery hasn't started/complete, attempt to kick off a targeted discover to avoid hang.
  try {
    if (!rec.discoveryComplete) {
      activityInfo(
        peripheralId,
        "Discovery not complete - attempting to discover services (targeted) now"
      );
      // attempt targeted discovery quickly (safe if discovery already in progress)
      try {
        await new Promise((resolve, reject) => {
          p.discoverServices([], (err, services) => {
            if (err) return reject(err);
            try {
              activityInfo(
                peripheralId,
                `discoverServices immediate returned ${services.length} services`,
                { uuids: services.map((s) => s.uuid) }
              );
            } catch (e) {}
            resolve(services || []);
          });
        });
      } catch (e) {
        activityWarn(
          peripheralId,
          "Immediate discoverServices attempt failed (nonfatal)",
          { err: e && e.message }
        );
      }
    }
  } catch (e) {
    // non-fatal
    activityWarn(peripheralId, "Error during forced discoverServices attempt", {
      err: e && e.message,
    });
  }

  // Wait for the `rec.discoveryComplete` flag but keep verbose logs so we can see progress
  let attempts = 0;
  while (!rec.discoveryComplete && attempts < opts.discoveryMaxAttempts) {
    if (opts.debug)
      activityInfo(
        peripheralId,
        `Waiting for discoveryComplete (${attempts + 1}/${
          opts.discoveryMaxAttempts
        })`
      );
    await sleep(opts.discoveryWaitMs);
    attempts++;
  }

  if (!rec.discoveryComplete) {
    // attempt robust fallback: call discoverAllServicesAndCharacteristics if available
    activityWarn(
      peripheralId,
      "Service discovery timed out. Attempting forced discoverAllServicesAndCharacteristics fallback."
    );
    if (
      typeof p.discoverAllServicesAndCharacteristics === "function" &&
      opts.extendDiscoveryWithAllChars
    ) {
      try {
        const [services, characteristics] = await new Promise(
          (resolve, reject) => {
            p.discoverAllServicesAndCharacteristics((err, svcs, chars) => {
              console.log("=== FULL BLE MAP ===");
              svcs.forEach((s) => console.log("SERVICE:", s.uuid));
              chars.forEach((c) =>
                console.log("CHAR:", c.uuid, " props:", c.properties)
              );
              console.log("====== END MAP ======");
            });
          }
        );
        rec.discoveryComplete = true;
        try {
          rec.peripheral.characteristics = characteristics;
        } catch (e) {}
        activityInfo(
          peripheralId,
          `discoverAllServicesAndCharacteristics returned ${services.length} services and ${characteristics.length} characteristics`,
          {
            services: services.map((s) => s.uuid),
            charCount: characteristics.length,
          }
        );
      } catch (e) {
        activityError(
          peripheralId,
          "Forced discoverAllServicesAndCharacteristics failed",
          { err: e && e.message }
        );
        throw new Error(
          "Service discovery timed out. Please check device connection."
        );
      }
    } else {
      throw new Error(
        "Service discovery timed out. Please check device connection."
      );
    }
  }

  // Rebuild candidates`
  const deviceType = rec.deviceType || currentScanType || 1;
  const volumeUuid = CHARACTERISTIC_UUID_READ_NOTIFY[deviceType];
  const preferredNormalized = volumeUuid ? normalizeUUID(volumeUuid) : null;

  // Log available services and characteristics for debug
  try {
    if (rec.peripheral && Array.isArray(rec.peripheral.services)) {
      activityInfo(peripheralId, "Peripheral.services (post-discovery)", {
        services: rec.peripheral.services.map((s) => s.uuid),
      });
    }
  } catch (e) {}

  const candidates = collectReadCandidates(rec, preferredNormalized);
  if (!candidates || candidates.length === 0) {
    activityWarn(
      peripheralId,
      "No readable/notify characteristics available after discovery",
      { preferredNormalized }
    );
    throw new Error("No readable/notify characteristics available.");
  }

  if (opts.debug)
    activityInfo(peripheralId, `Read candidates count=${candidates.length}`, {
      uuids: candidates.map((c) => c.uuid),
      preferredNormalized,
    });

  // Attempt quick sequential read (up to 3 tries)
  const maxRetries = Math.min(candidates.length, 3);
  for (let i = 0; i < maxRetries; i++) {
    const char = candidates[i];
    try {
      activityInfo(
        peripheralId,
        `Trying quick read on candidate ${i + 1}/${maxRetries}`,
        { uuid: char.uuid, properties: char.properties }
      );
      const res = await tryReadChar(char);
      const volume = parseVolumeFromHex(res.hex);
      activityInfo(peripheralId, `Volume read (single): ${volume}`, {
        uuid: res.uuid,
        hex: res.hex,
      });
      return Object.assign(res, { volume, changed: false, via: "read" });
    } catch (err) {
      activityWarn(peripheralId, `Quick read failed for candidate ${i + 1}`, {
        uuid: char && char.uuid,
        err: err && err.message,
      });
      continue;
    }
  }

  // Polling fallback with verbose history logging
  try {
    const pollCandidates = candidates;
    const primary = pollCandidates[0];
    const history = [];

    activityInfo(
      peripheralId,
      `Starting polling fallback: count=${opts.pollCount}, interval=${opts.pollIntervalMs}ms`,
      { primaryUuid: primary.uuid }
    );

    for (let i = 0; i < opts.pollCount; i++) {
      try {
        const res = await tryReadChar(primary).catch((err) =>
          tryReadCandidatesSequential(pollCandidates)
        );
        history.push(res.hex);
        activityInfo(peripheralId, `Poll ${i + 1}/${opts.pollCount} success`, {
          hex: res.hex,
          uuid: res.uuid,
        });
      } catch (err) {
        history.push(null);
        activityWarn(peripheralId, `Poll ${i + 1}/${opts.pollCount} failed`, {
          err: err && err.message,
        });
      }
      if (i < opts.pollCount - 1) await sleep(opts.pollIntervalMs);
    }

    const detection = detectChangeInHistory(history, [1, 0]);
    const finalHex = history.find((h) => h !== null);
    const finalVolume = finalHex ? parseVolumeFromHex(finalHex) : null;

    activityInfo(peripheralId, `Polling result`, {
      finalVolume,
      changed: detection.changed,
      chosenIndex: detection.chosenIndex,
      history,
    });

    return Object.assign(
      {
        uuid: primary.uuid,
        hex: finalHex,
        volume: finalVolume,
        changed: detection.changed,
        chosenIndex: detection.chosenIndex,
        via: "poll",
      },
      { hexHistory: history }
    );
  } catch (err) {
    activityWarn(
      peripheralId,
      "Polling fallback failed, attempting notify fallback",
      { err: err && err.message }
    );
  }

  // Notify fallback
  try {
    let notifyChar = candidates.find(
      (c) =>
        (c.properties || [])
          .map((x) => String(x).toLowerCase())
          .includes("notify") ||
        (c.properties || [])
          .map((x) => String(x).toLowerCase())
          .includes("indicate")
    );
    if (notifyChar) {
      activityInfo(peripheralId, "Using notify fallback", {
        uuid: notifyChar.uuid,
      });
      let timeoutHandle = null;
      return await new Promise((resolve, reject) => {
        const onData = (data) => {
          try {
            if (timeoutHandle) clearTimeout(timeoutHandle);
            notifyChar.removeListener("data", onData);
            const hex = Buffer.from(data).toString("hex");
            const volume = parseVolumeFromHex(hex);
            activityInfo(
              peripheralId,
              `Volume via notify fallback: ${volume}`,
              { uuid: notifyChar.uuid, hex }
            );
            resolve({
              uuid: notifyChar.uuid,
              hex,
              volume,
              changed: true,
              via: "notify",
            });
          } catch (e) {
            reject(e);
          }
        };
        let lastVolume = null;

        console.log("SUBSCRIBING TO NOTIFY:", notifyChar.uuid);

        notifyChar.subscribe((err) => {
          if (err) {
            console.log("FAILED TO SUBSCRIBE:", err);
          } else {
            console.log("NOTIFY ENABLED ON:", notifyChar.uuid);
          }
        });

        notifyChar.on("data", (data) => {
          const hex = data.toString("hex");
          console.log("NOTIFY DATA:", hex);

          const vol = data[1];
          console.log("LIVE VOLUME:", vol);
        });
      });
    } else {
      activityWarn(
        peripheralId,
        "No notify characteristic available for notify fallback"
      );
    }
  } catch (e) {
    activityError(peripheralId, "Notify fallback error", {
      err: e && e.message,
    });
  }

  throw new Error("Read failed on all available characteristics.");
}

// -------------------- Exports / IPC --------------------

ipcMain.on("ble-read-volume-now", async (event, payload) => {
  if (!payload || !payload.id) {
    send("ble-read-volume-now-response", { error: "Invalid payload" });
    return;
  }
  const id = payload.id;
  try {
    const result = await readVolumeNowPromise(id);

    activityInfo(id, `IPC read complete: volume=${result.volume}`, {
      via: result.via,
    });

    send("ble-read-volume-now-response", Object.assign({ id }, result));
  } catch (err) {
    console.error("ble-read-volume-now error:", err && err.message);
    activityError(id, "ble-read-volume-now error", { err: err && err.message });
    send("ble-read-volume-now-response", {
      id,
      error: err.message || String(err),
    });
  }
});

// Helper for existing simple read
function readCharacteristic(
  peripheralId,
  characteristicUuidNormalized,
  replyChannel
) {
  const rec = discovered[peripheralId];
  if (!rec || !rec.peripheral) return;
  const candidates = collectReadCandidates(rec, characteristicUuidNormalized);
  tryReadCandidatesSequential(candidates)
    .then((result) => {
      activityInfo(peripheralId, "Read characteristic success", {
        uuid: result.uuid,
        hex: result.hex,
      });
      send(replyChannel, {
        id: peripheralId,
        uuid: result.uuid,
        hex: result.hex,
      });
    })
    .catch((err) => {
      activityWarn(peripheralId, "Read failed", { err: err && err.message });
      send("ble-error", "Read failed");
    });
}

ipcMain.on("ble-read-volume", (event, payload) => {
  if (!payload || !payload.id) return;
  const id = payload.id;
  const deviceType =
    payload.type || (discovered[id] && discovered[id].deviceType) || 1;
  if (payload.uuid) {
    readCharacteristic(
      id,
      normalizeUUID(payload.uuid),
      "ble-read-volume-response"
    );
  } else {
    const volumeUuid = VOLUME_UUID_BY_TYPE[deviceType];
    readCharacteristic(
      id,
      normalizeUUID(volumeUuid),
      "ble-read-volume-response"
    );
  }
});

// Debug: return a sanitized snapshot of discovered[ id ]
ipcMain.handle("ble-debug-dump", async (event, { id } = {}) => {
  const rec = discovered[id];
  if (!rec) return { error: "device-not-found", id };
  // sanitize: don't return functions or circular references
  const safe = {
    id,
    deviceType: rec.deviceType,
    discoveryComplete: !!rec.discoveryComplete,
    peripheralState: rec.peripheral && rec.peripheral.state,
    address: rec.peripheral && rec.peripheral.address,
    adv: (() => {
      try {
        const a = rec.peripheral && rec.peripheral.advertisement;
        if (!a) return null;
        return {
          localName: a.localName,
          manufacturerDataHex: a.manufacturerData
            ? Buffer.from(a.manufacturerData).toString("hex")
            : null,
          serviceUuids: a.serviceUuids || [],
        };
      } catch (e) {
        return null;
      }
    })(),
    services: (() => {
      try {
        if (!rec.peripheral || !Array.isArray(rec.peripheral.services))
          return null;
        return rec.peripheral.services.map((s) => ({
          uuid: s.uuid,
          characteristics: (s.characteristics || []).map((c) => c.uuid),
        }));
      } catch (e) {
        return null;
      }
    })(),
    chars: (() => {
      try {
        const out = {};
        Object.keys(rec.chars || {}).forEach((k) => {
          const c = rec.chars[k];
          out[k] = c ? { uuid: c.uuid, properties: c.properties } : null;
        });
        // also include any peripheral.characteristics list
        if (rec.peripheral && Array.isArray(rec.peripheral.characteristics)) {
          out._peripheral_list = rec.peripheral.characteristics.map((c) => ({
            uuid: c.uuid,
            properties: c.properties,
          }));
        }
        return out;
      } catch (e) {
        return null;
      }
    })(),
  };
  return safe;
});
function getConnectedDeviceGatt(id) {
  const rec = discovered[id];
  if (!rec || !rec.peripheral) return null;

  return {
    device: rec.peripheral,
    inChar: rec.chars && rec.chars.notifyChar,
    outChar: rec.chars && rec.chars.writeChar,
  };
}

module.exports = {
  getConnectedDeviceGatt,
};
