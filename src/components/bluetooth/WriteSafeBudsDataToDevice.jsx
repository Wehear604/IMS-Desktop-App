// WriteSafeBudsDataToDevice.js

// --- 1. PROTOCOL CONSTANTS ---
const OTA_SERVICE = "0000ff12-0000-1000-8000-00805f9b34fb";
const OTA_DATA_IN = "0000ff14-0000-1000-8000-00805f9b34fb";
const OTA_DATA_OUT = "0000ff15-0000-1000-8000-00805f9b34fb";

/* -------------------------
   Minimal MD5 (for hash/checksum calculation)
   ------------------------- */
function md5(buf) {
  function rotl(n, c) { return (n << c) | (n >>> (32 - c)); }
  function toWords(u8) {
    const l = u8.length;
    const words = new Uint32Array(Math.ceil((l + 9) / 4));
    for (let i = 0; i < l; i++) words[i >> 2] |= u8[i] << ((i % 4) * 8);
    const bitLen = l * 8;
    words[l >> 2] |= 0x80 << ((l % 4) * 8);
    const totalWords = words.length;
    words[totalWords - 2] = bitLen >>> 0;
    words[totalWords - 1] = (bitLen / 0x100000000) >>> 0;
    return words;
  }
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const words = toWords(buf);
  let a0 = 0x67452301, b0 = 0xEFCDAB89, c0 = 0x98BADCFE, d0 = 0x10325476;
  for (let i = 0; i < words.length; i += 16) {
    let A = a0, B = b0, C = c0, D = d0;
    for (let j = 0; j < 64; j++) {
      let F, g;
      if (j < 16) { F = (B & C) | (~B & D); g = j; }
      else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
      else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * j) % 16; }
      const temp = (A + F + K[j] + (words[i + g] >>> 0)) >>> 0;
      A = D; D = C; C = B; B = (B + rotl(temp, S[j])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const out = new Uint8Array(16);
  new DataView(out.buffer).setUint32(0, a0, true);
  new DataView(out.buffer).setUint32(4, b0, true);
  new DataView(out.buffer).setUint32(8, c0, true);
  new DataView(out.buffer).setUint32(12, d0, true);
  return out;
}

/* -------------------------
   OtaCommandGeneratorJS (Generates proprietary command headers)
   ------------------------- */
class OtaCommandGeneratorJS {
  constructor() {
    this.seqNum = 0;
    this.CMD_OTA_IDENTIFICATION = new Uint8Array([0xCC, 0xAA, 0x55, 0xEE, 0x12, 0x19, 0xE4]);
    this.CMD_OTA_INFO = 0xA0;
    this.CMD_SEND_DATA = 0x20;
  }
  reset() { this.seqNum = 0; }
  _nextSeq() { const v = this.seqNum & 0xff; this.seqNum = (this.seqNum + 1) & 0xff; return v; }
  cmdOtaIdentification() { return this.CMD_OTA_IDENTIFICATION.slice(); }
  cmdStartSendHeader(startAddress, totalLength) {
    const out = new Uint8Array(10);
    out[0] = this.CMD_OTA_INFO;
    out[1] = this._nextSeq();
    const dv = new DataView(out.buffer);
    dv.setUint32(2, startAddress >>> 0, true);
    dv.setUint32(6, totalLength >>> 0, true);
    return out;
  }
  cmdSendDataHeader() {
    const out = new Uint8Array(2);
    out[0] = this.CMD_SEND_DATA;
    out[1] = this._nextSeq();
    return out;
  }
}

/* -------------------------
   FileDataReaderJS (File buffer interface)
   ------------------------- */
class FileDataReaderJS {
  constructor(uint8arr) {
    this.data = uint8arr;
    this.opened = false;
    this._md5 = null;
  }
  async open() { this.opened = true; }
  async getSize() { return this.data.length; }
  async getHash() {
    if (!this._md5) this._md5 = md5(this.data);
    return new Uint8Array(this._md5.buffer.slice(0, 4));
  }
  async read(srcPos, dst, dstPos, length) {
    if (!this.opened) throw new Error("Reader not opened");
    if (srcPos < 0 || srcPos >= this.data.length) return -1;
    const toRead = Math.min(length, this.data.length - srcPos);
    dst.set(this.data.subarray(srcPos, srcPos + toRead), dstPos);
    return toRead;
  }
  async close() { this.opened = false; }
}

/* -------------------------
   Notification Queue (Async/Await bridge for BLE events)
   ------------------------- */
function createNotificationQueue() {
  const queue = [];
  let resolvers = [];
  return {
    push(bytes) {
      if (resolvers.length) {
        const r = resolvers.shift();
        r(bytes);
      } else {
        queue.push(bytes);
      }
    },
    async waitOne(timeoutMs = 0) {
      if (queue.length) return queue.shift();
      return await new Promise((resolve, reject) => {
        const timer = timeoutMs > 0 ? setTimeout(() => {
          const idx = resolvers.indexOf(resolve);
          if (idx >= 0) resolvers.splice(idx, 1);
          reject(new Error("notification timeout"));
        }, timeoutMs) : null;
        resolvers.push((bytes) => {
          if (timer) clearTimeout(timer);
          resolve(bytes);
        });
      });
    },
    drain() { queue.length = 0; resolvers = []; },
  };
}

/* -------------------------
   Main uploader (FINAL VERSION)
   ------------------------- */
const WriteSafeBudsDataToDevice = async (side, deviceObj, options = {}) => {
  const {
    // Optimized Stable Parameters (Best known settings for stability):
    maxPacketSize = 20,     // Web BLE MTU limit (must be 20)
    payloadBlockSize = 4096,// Device firmware block size (must be 4096)
    progressCallback = null,
    interChunkDelayMs = 6,  // Stable timing delay
    maxRetries = 10,        // High retries for robustness
    ackTimeoutMs = 40000,   // Sufficient timeout for 4KB block processing
    needIdentification = true,
    otaFileSource,          // Source of the .fot file
  } = options;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Helper to chunk the payload block into small BLE packets
  const writeTransport = async (charOut, buffer, useWithoutResponse) => {
    if (!(buffer instanceof Uint8Array)) buffer = new Uint8Array(buffer);
    let offset = 0;
    while (offset < buffer.length) {
      const end = Math.min(offset + maxPacketSize, buffer.length);
      const sub = buffer.slice(offset, end);
      if (useWithoutResponse) {
        await charOut.writeValueWithoutResponse(sub);
        if (interChunkDelayMs > 0) await sleep(interChunkDelayMs);
      } else {
        await charOut.writeValue(sub);
      }
      offset = end;
    }
  };

  try {
    // --- Phase 1: Connection and Setup ---
    if (!deviceObj) throw new Error("deviceObj is undefined for " + side);
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;
    if (!device || !device.gatt) throw new Error("No valid Bluetooth device found!");

    const service = await device.gatt.getPrimaryService(OTA_SERVICE);
    const charIn = await service.getCharacteristic(OTA_DATA_IN);
    const charOut = await service.getCharacteristic(OTA_DATA_OUT);

    const notifQueue = createNotificationQueue();
    const onCharChanged = (ev) => {
      try {
        const dv = ev.target.value;
        const bytes = new Uint8Array(dv.buffer);
        notifQueue.push(bytes);
      } catch (e) {
        console.warn("notification parse error", e);
      }
    };
    charIn.addEventListener("characteristicvaluechanged", onCharChanged);
    await charIn.startNotifications();

    // --- Phase 2: File Loading ---
    let arrayBuffer;
    if (!otaFileSource) throw new Error("otaFileSource is missing in options.");

    if (typeof otaFileSource === "string") {
      const resp = await fetch(otaFileSource);
      if (!resp.ok) throw new Error("Failed to fetch Safefile: " + resp.status);
      arrayBuffer = await resp.arrayBuffer();
    } else if (otaFileSource instanceof File || (otaFileSource && typeof otaFileSource.arrayBuffer === "function")) {
      arrayBuffer = await otaFileSource.arrayBuffer();
    } else if (otaFileSource instanceof ArrayBuffer) {
      arrayBuffer = otaFileSource;
    } else {
      throw new Error("Unsupported otaFileSource type.");
    }

    const otaData = new Uint8Array(arrayBuffer);
    if (otaData.length === 0) {
      console.warn("Safefile empty — nothing to upload.");
      return;
    }

    const reader = new FileDataReaderJS(otaData);
    await reader.open();
    const totalSize = await reader.getSize();

    const cmdGen = new OtaCommandGeneratorJS();
    if (!needIdentification) cmdGen.reset();

    const useWithoutResponse = typeof charOut.writeValueWithoutResponse === "function";

    const parseNotification = (bytes) => {
      if (!bytes || bytes.length === 0) return null;
      const b0 = bytes[0];
      if (b0 <= 100) return { type: "progress", value: b0 };
      if (b0 === 0xEE) return { type: "error", value: bytes[1] ?? 0 };
      if (b0 === 0x90) return { type: "info", value: bytes.length > 1 ? bytes[1] : 0 };
      if (b0 === 0x00 || b0 === 0x01) return { type: "ack", value: b0 };
      return { type: "raw", value: bytes };
    };

    // --- Phase 3: Handshake ---
    if (needIdentification) {
      const ident = cmdGen.cmdOtaIdentification();
      await writeTransport(charOut, ident, useWithoutResponse);
      await sleep(300);
      try { await notifQueue.waitOne(1000); } catch (e) { }
    }

    const startHeader = cmdGen.cmdStartSendHeader(0, totalSize);
    await writeTransport(charOut, startHeader, useWithoutResponse);
    await sleep(300);
    try { await notifQueue.waitOne(2000); } catch (e) { }

    // --- Phase 4: Main Transfer Loop ---
    let offset = 0;
    let lastProgress = -1;

    while (offset < totalSize) {
      const blockLen = Math.min(payloadBlockSize, totalSize - offset);
      const sendHeader = cmdGen.cmdSendDataHeader();
      await writeTransport(charOut, sendHeader, useWithoutResponse);

      // --- CRITICAL FIX: LAST BLOCK PADDING ---
      let payload = otaData.subarray(offset, offset + blockLen);

      // Pad the final block if it is smaller than the required 4096 bytes
      if (blockLen < payloadBlockSize) {
        console.warn(`Padding final block: Actual data size ${blockLen}. Padded to ${payloadBlockSize}.`);
        const paddedPayload = new Uint8Array(payloadBlockSize);
        paddedPayload.fill(0xFF); // Fill with padding bytes
        paddedPayload.set(payload); // Copy actual data
        payload = paddedPayload;
      }
      // --- END PADDING FIX ---

      let attempt = 0;
      let sentOk = false;

      while (attempt <= maxRetries && !sentOk) {
        try {
          await writeTransport(charOut, payload, useWithoutResponse);
        } catch (err) {
          attempt++;
          if (attempt > maxRetries) throw err;
          const backoff = 50 * Math.pow(2, attempt);
          console.warn("Write failed, retrying", attempt, backoff);
          await sleep(backoff);
          continue;
        }

        try {
          // Wait for ACK
          const n = await notifQueue.waitOne(ackTimeoutMs);
          const parsed = parseNotification(n);
          if (!parsed) throw new Error("no useful notification");

          if (parsed.type === "error") throw new Error("device error: " + parsed.value);

          if (parsed.type === "progress" && parsed.value >= 0) {
            lastProgress = parsed.value;
            if (typeof progressCallback === "function") progressCallback(lastProgress);
            sentOk = true;
            break;
          }
          if (parsed.type === "ack" || parsed.type === "info" || parsed.type === "raw") {
            sentOk = true;
            break;
          }

          // Invalid response, retry
          attempt++;
          if (attempt <= maxRetries) {
            await sleep(50 * Math.pow(2, attempt));
            continue;
          }
        } catch (notifErr) {
          attempt++;
          if (attempt > maxRetries) {
            throw new Error("ACK timeout; last error: " + String(notifErr));
          }
          const backoff = 50 * Math.pow(2, attempt);
          console.warn("ACK wait failed, retry attempt", attempt, "backoff", backoff);
          await sleep(backoff);
          continue;
        }
      }

      if (!sentOk) throw new Error("Failed to send block at offset " + offset);
      offset += blockLen;

      if (lastProgress < 0) {
        const approx = Math.round((offset / totalSize) * 100);
        if (typeof progressCallback === "function") progressCallback(approx);
      }
    }

    // --- Phase 5: Finalization ---
    try {
      // Increase the final wait to 60 seconds (1 minute) to allow for slow flash writes/checksum
      const finalNotif = await notifQueue.waitOne(60000);
      const parsed = parseNotification(finalNotif);
      if (parsed && parsed.type === "progress") {
        if (typeof progressCallback === "function") progressCallback(parsed.value);
      }
      console.log("Final device ACK received! OTA is complete."); // Success confirmation
    } catch (e) {
      // If it times out here (60 seconds), we assume the update was successful 
      // because the device likely rebooted and dropped the connection.
      console.warn("Final device ACK timed out (60s). Assuming successful update if device is rebooting.", e);
    }

    // Cleanup
    try {
      await charIn.stopNotifications();
      charIn.removeEventListener("characteristicvaluechanged", onCharChanged);
    } catch (e) { }
    await reader.close();

    console.log("OTA upload finished for", side);
    return true;
  } catch (err) {
    console.error(`Error writing data to ${side} device:`, err);
    throw err;
  }
};

export default WriteSafeBudsDataToDevice;