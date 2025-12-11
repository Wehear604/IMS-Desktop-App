import Safefile from "../../assets/blefiles/safe.fot";

const OTA_SERVICE = "0000ff12-0000-1000-8000-00805f9b34fb";
const OTA_DATA_IN = "0000ff14-0000-1000-8000-00805f9b34fb";
const OTA_DATA_OUT = "0000ff15-0000-1000-8000-00805f9b34fb";

/* -------------------------
   Minimal MD5 (for getHash() first 4 bytes)
   (same compact md5 from earlier) 
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
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const words = toWords(buf);
  let a0 = 0x67452301, b0 = 0xEFCDAB89, c0 = 0x98BADCFE, d0 = 0x10325476;
  for (let i = 0; i < words.length; i += 16) {
    let A = a0, B = b0, C = c0, D = d0;
    for (let j = 0; j < 64; j++) {
      let F, g;
      if (j < 16) { F = (B & C) | (~B & D); g = j; }
      else if (j < 32) { F = (D & B) | (~D & C); g = (5*j + 1) % 16; }
      else if (j < 48) { F = B ^ C ^ D; g = (3*j + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7*j) % 16; }
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
   OtaCommandGeneratorJS (port)
   ------------------------- */
class OtaCommandGeneratorJS {
  constructor() {
    this.seqNum = 0;
    this.CMD_OTA_IDENTIFICATION = new Uint8Array([0xCC,0xAA,0x55,0xEE,0x12,0x19,0xE4]);
    this.CMD_OTA_INFO = 0xA0;
    this.CMD_SEND_DATA = 0x20;
    this.CMD_GET_INFO = 0x91;
    this.CMD_GET_INFO_TLV = 0x92;
    this.CMD_GET_INFO_TYPE_VERSION = 0x01;
    this.CMD_GET_INFO_TYPE_UPDATE = 0x02;
    this.CMD_GET_INFO_TYPE_CAPABILITIES = 0x03;
    this.CMD_GET_INFO_TYPE_STATUS = 0x04;
    this.CMD_GET_INFO_TYPE_CHANNEL = 0x06;
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
   FileDataReaderJS (simple in-memory reader)
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
   Helper: small event queue for notifications
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
          // remove resolver if still pending
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
   Main uploader: ACK-aware focused flow
   ------------------------- */
const WriteSafeBudsDataToDevice = async ( side, deviceObj, options = {}) => {
  const {
    maxPacketSize = 180,
    payloadBlockSize = 1024,
    progressCallback = null,
    interChunkDelayMs = 2,
    maxRetries = 4,
    ackTimeoutMs = 4000,
    needIdentification = true,
  } = options;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // helper to split and write via characteristic
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
    if (!deviceObj) throw new Error("deviceObj is undefined for " + side);
    const device = deviceObj.device?.device || deviceObj.device || deviceObj;
    if (!device || !device.gatt) throw new Error("No valid Bluetooth device found!");

    const service = await device.gatt.getPrimaryService(OTA_SERVICE);
    const charIn = await service.getCharacteristic(OTA_DATA_IN);
    const charOut = await service.getCharacteristic(OTA_DATA_OUT);

    // notification queue and handler
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

    // load safefile
    let arrayBuffer;
    console.log("typeof Safefile",typeof Safefile);
    if (typeof Safefile === "string") {
      const resp = await fetch(Safefile);
      if (!resp.ok) throw new Error("Failed to fetch Safefile: " + resp.status);
      arrayBuffer = await resp.arrayBuffer();
    } else if (Safefile instanceof File || (Safefile && typeof Safefile.arrayBuffer === "function")) {
      arrayBuffer = await Safefile.arrayBuffer();
    } else {
      throw new Error("Unsupported Safefile type. Expected URL string or File-like object.");
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
    if (!needIdentification) cmdGen.reset(); // keep seq behavior consistent if skipping identification

    const useWithoutResponse = typeof charOut.writeValueWithoutResponse === "function";

    // helper to parse device notifications for progress/ACK/error
    // returns object { type: 'progress'|'ack'|'error'|'info', value }
    const parseNotification = (bytes) => {
      if (!bytes || bytes.length === 0) return null;
      const b0 = bytes[0];
      // Android code and earlier drivers treat single-byte <=100 as progress %
      if (b0 <= 100) return { type: "progress", value: b0 };
      // specific error code marker (example 0xEE used earlier)
      if (b0 === 0xEE) return { type: "error", value: bytes[1] ?? 0 };
      // 0x90 is CMD_NOTIFY_STATUS in generator; status bytes may follow
      if (b0 === 0x90) {
        return { type: "info", value: bytes.length > 1 ? bytes[1] : 0 };
      }
      // some devices may ack with 0x00 or 0x01 first byte
      if (b0 === 0x00 || b0 === 0x01) return { type: "ack", value: b0 };
      // default: return raw
      return { type: "raw", value: bytes };
    };

    // Step 1: optionally send identification
    if (needIdentification) {
      const ident = cmdGen.cmdOtaIdentification();
      await writeTransport(charOut, ident, useWithoutResponse);
      // optionally wait briefly for device response
      try {
        const n = await notifQueue.waitOne(1000);
        const parsed = parseNotification(n);
        if (parsed && parsed.type === "progress") {
          // device may reply with version/progress — ignore here
        }
      } catch (e) {
        // no notification — continue; identification may be fire-and-forget
      }
    }

    // Step 2: send start header with total size
    const startHeader = cmdGen.cmdStartSendHeader(0, totalSize);
    await writeTransport(charOut, startHeader, useWithoutResponse);

    // It is common for device to respond with readiness; wait short for notification
    try {
      const n = await notifQueue.waitOne(2000);
      const parsed = parseNotification(n);
      if (parsed && parsed.type === "progress") {
        // device might send 0 or some percent, ignore
      }
    } catch (e) {
      // no response, still continue (some devices don't ack immediately)
    }

    // Step 3: main loop — send blocks, each block preceded by CMD_SEND_DATA header
    let offset = 0;
    let lastProgress = -1;

    while (offset < totalSize) {
      const blockLen = Math.min(payloadBlockSize, totalSize - offset);

      // send CMD_SEND_DATA header
      const sendHeader = cmdGen.cmdSendDataHeader();
      await writeTransport(charOut, sendHeader, useWithoutResponse);

      // read payload from reader (direct slice available)
      const payload = otaData.subarray(offset, offset + blockLen);

      // send payload in transport-sized chunks
      let attempt = 0;
      let sentOk = false;

      while (attempt <= maxRetries && !sentOk) {
        try {
          await writeTransport(charOut, payload, useWithoutResponse);
        } catch (err) {
          attempt++;
          if (attempt > maxRetries) throw err;
          const backoff = 50 * Math.pow(2, attempt);
          console.warn("transport write failed; retrying payload", attempt, backoff, err);
          await sleep(backoff);
          continue;
        }

        // wait for ACK/progress notification
        try {
          const n = await notifQueue.waitOne(ackTimeoutMs);
          const parsed = parseNotification(n);
          if (!parsed) {
            throw new Error("no useful notification");
          }

          if (parsed.type === "error") {
            // device reported error (CRC or refused)
            throw new Error("device error code: " + parsed.value);
          }

          if (parsed.type === "progress") {
            // progress is percentage (0..100)
            // Only accept if progress increased or indicates successful receipt
            if (parsed.value >= 0) {
              lastProgress = parsed.value;
              if (typeof progressCallback === "function") progressCallback(lastProgress);
              sentOk = true;
              break;
            }
          }

          if (parsed.type === "ack") {
            // device explicitly acked
            sentOk = true;
            break;
          }

          // if raw/info, treat as acceptance and proceed
          if (parsed.type === "info" || parsed.type === "raw") {
            sentOk = true;
            break;
          }

          // otherwise treat as not accepted and retry
          attempt++;
          if (attempt <= maxRetries) {
            const backoff = 50 * Math.pow(2, attempt);
            await sleep(backoff);
            continue;
          } else {
            throw new Error("no valid ACK received after retries");
          }
        } catch (notifErr) {
          // timeout or parse error — retry the payload block
          attempt++;
          if (attempt > maxRetries) {
            throw new Error("ACK timeout; last error: " + String(notifErr));
          }
          const backoff = 50 * Math.pow(2, attempt);
          console.warn("ACK wait failed, retry attempt", attempt, "backoff", backoff, notifErr);
          await sleep(backoff);
          // on retry we will re-send the same payload block
          continue;
        }
      } // end send attempt loop

      // block successfully sent and acked
      offset += blockLen;

      // report progress derived from offset if device didn't provide percent
      if (lastProgress < 0) {
        const approx = Math.round((offset / totalSize) * 100);
        if (typeof progressCallback === "function") progressCallback(approx);
      }

    } // end while offset < totalSize

    // Optionally wait for final device processing notification (some firmwares need time)
    try {
      const finalNotif = await notifQueue.waitOne(2000);
      const parsed = parseNotification(finalNotif);
      if (parsed && parsed.type === "progress") {
        if (typeof progressCallback === "function") progressCallback(parsed.value);
      }
    } catch (e) {
      // ignore
    }

    // cleanup notifications
    try {
      await charIn.stopNotifications();
      charIn.removeEventListener("characteristicvaluechanged", onCharChanged);
    } catch (e) { /* ignore */ }

    // close reader
    await reader.close();

    console.log("OTA upload finished for", side);
    return true;
  } catch (err) {
    console.error(`Error writing data to ${side} device:`, err);
    throw err;
  }
};

export default WriteSafeBudsDataToDevice;
