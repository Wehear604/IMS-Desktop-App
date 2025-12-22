import * as React from "react";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { SAFE_BUDS_STORE } from "../../utils/bleStore";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const CMD_OTA_INFO = 0xa0;
const CMD_SEND_DATA = 0x20;
const CMD_GET_INFO = 0x91;
const CMD_NOTIFY_STATUS = 0x90;
const CMD_GET_INFO_TLV = 0x92;

const STATE_OK = 0x00;
const STATE_TWS_DISCONNECTED = 0x80;
const STATE_DONE = 0xff;
const STATE_PAUSE = 0xfd;
const STATE_CONTINUE = 0xfe;

const INFO_VERSION = 0x01;
const INFO_UPDATE = 0x02;
const INFO_CAPABILITIES = 0x03;
const INFO_STATUS = 0x04;
const INFO_CHANNEL = 0x06;

const INFO_CAP_TWS = 0x0001;
const INFO_STATUS_TWS_CONNECTED = 0x0001;
const CHANNEL_LEFT = 0x01;

const IDENTIFICATION = Uint8Array.from([
  0xcc, 0xaa, 0x55, 0xee, 0x12, 0x19, 0xe4,
]);

const DEFAULT_BLOCK_SIZE = 5.5 * 1024;
const DEFAULT_PACKET_SIZE = 400;
const SAFE_PAYLOAD_LIMIT = 400;
const TIMEOUT_MS = 15000;
const DELAY_AFTER_IDENT_MS = 10;
const LOG_DATA_FRAMES = false;

/**********************************************************
 * HELPER
 **********************************************************/
function toHex(arr) {
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

/**********************************************************
 * MD5 FALLBACK
 **********************************************************/
function md5Bytes(inputUint8) {
  function toWords(u8) {
    const words = new Uint32Array((((u8.length + 8) >>> 6) + 1) * 16);
    for (let i = 0; i < u8.length; i++) {
      words[i >> 2] |= u8[i] << ((i % 4) * 8);
    }
    const bitLen = u8.length * 8;
    words[u8.length >> 2] |= 0x80 << ((u8.length % 4) * 8);
    words[words.length - 2] = bitLen;
    return words;
  }
  function rotl(x, c) {
    return (x << c) | (x >>> (32 - c));
  }

  function round(fn, a, b, c, d, x, s, t) {
    return (rotl((a + fn(b, c, d) + x + t) >>> 0, s) + b) >>> 0;
  }

  const x = toWords(inputUint8);
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;

  const F = (b, c, d) => (b & c) | (~b & d);
  const G = (b, c, d) => (b & d) | (c & ~d);
  const H = (b, c, d) => b ^ c ^ d;
  const I = (b, c, d) => c ^ (b | ~d);

  for (let i = 0; i < x.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d;

    a = round(F, a, b, c, d, x[i + 0], 7, 0xd76aa478);
    d = round(F, d, a, b, c, x[i + 1], 12, 0xe8c7b756);
    c = round(F, c, d, a, b, x[i + 2], 17, 0x242070db);
    b = round(F, b, c, d, a, x[i + 3], 22, 0xc1bdceee);

    a = round(G, a, b, c, d, x[i + 1], 5, 0xf61e2562);
    d = round(G, d, a, b, c, x[i + 6], 9, 0xc040b340);
    c = round(G, c, d, a, b, x[i + 11], 14, 0x265e5a51);
    b = round(G, b, c, d, a, x[i + 0], 20, 0xe9b6c7aa);

    a = round(H, a, b, c, d, x[i + 5], 4, 0xfffa3942);
    d = round(H, d, a, b, c, x[i + 8], 11, 0x8771f681);
    c = round(H, c, d, a, b, x[i + 11], 16, 0x6d9d6122);
    b = round(H, b, c, d, a, x[i + 14], 23, 0xfde5380c);

    a = round(I, a, b, c, d, x[i + 0], 6, 0xf4292244);
    d = round(I, d, a, b, c, x[i + 7], 10, 0x432aff97);
    c = round(I, c, d, a, b, x[i + 14], 15, 0xab9423a7);
    b = round(I, b, c, d, a, x[i + 5], 21, 0xfc93a039);

    a = (a + oa) >>> 0;
    b = (b + ob) >>> 0;
    c = (c + oc) >>> 0;
    d = (d + od) >>> 0;
  }

  const out = new Uint8Array(16);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, a, true);
  dv.setUint32(4, b, true);
  dv.setUint32(8, c, true);
  dv.setUint32(12, d, true);
  return out;
}

/**********************************************************
 * DATA READER
 **********************************************************/
class DataReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new Uint8Array(buffer);
  }
  size() {
    return this.buffer.byteLength;
  }
  read(srcPos, length) {
    return this.view.slice(srcPos, srcPos + length);
  }
  async hashHead4() {
    try {
      const digest = await crypto.subtle.digest("MD5", this.buffer);
      return new Uint8Array(digest).slice(0, 4);
    } catch {
      const digest = md5Bytes(new Uint8Array(this.buffer));
      return digest.slice(0, 4);
    }
  }
  isCompressed() {
    if (this.view.length < 3) return false;
    return (
      this.view[0] === 0x50 && this.view[1] === 0x4f && this.view[2] === 0x54
    );
  }
}

class OtaCommandGenerator {
  constructor() {
    this.seq = 0;
  }
  nextSeq() {
    return this.seq++ & 0xff;
  }
  tlv(type, valueBytes) {
    const len = valueBytes.length;
    const out = new Uint8Array(2 + len);
    out[0] = type;
    out[1] = len;
    out.set(valueBytes, 2);
    return out;
  }
  cmdGetAllInfo() {
    const chunks = [
      this.tlv(INFO_VERSION, new Uint8Array(0)),
      this.tlv(INFO_CAPABILITIES, new Uint8Array(0)),
      this.tlv(INFO_STATUS, new Uint8Array(0)),
      this.tlv(INFO_CHANNEL, new Uint8Array(0)),
    ];
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(2 + totalLen);
    out[0] = CMD_GET_INFO_TLV;
    out[1] = this.nextSeq();
    let off = 2;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
  cmdGetInfoVersion() {
    const out = new Uint8Array(3);
    out[0] = CMD_GET_INFO;
    out[1] = this.nextSeq();
    out[2] = INFO_VERSION;
    return out;
  }
  cmdGetInfoUpdate(version, hash4) {
    const out = new Uint8Array(9);
    const dv = new DataView(out.buffer);
    out[0] = CMD_GET_INFO;
    out[1] = this.nextSeq();
    out[2] = INFO_UPDATE;
    dv.setInt16(3, version, true);
    out.set(hash4, 5);
    return out;
  }
  cmdStartSendHeader(startAddress, totalLength) {
    const out = new Uint8Array(10);
    const dv = new DataView(out.buffer);
    out[0] = CMD_OTA_INFO;
    out[1] = this.nextSeq();
    dv.setInt32(2, startAddress, true);
    dv.setInt32(6, totalLength, true);
    return out;
  }
  cmdSendDataHeader() {
    const out = new Uint8Array(2);
    out[0] = CMD_SEND_DATA;
    out[1] = this.nextSeq();
    return out;
  }
}

class OtaDataProvider {
  constructor(reader) {
    this.reader = reader;
    this.fileOffset = 0;
    this.blockOffset = 0;
    this.blockSize = DEFAULT_BLOCK_SIZE;
    this.packetSize = DEFAULT_PACKET_SIZE;
  }
  setStartAddress(addr) {
    this.fileOffset = addr;
  }
  setBlockSize(sz) {
    if (sz > 0) this.blockSize = sz;
  }
  setPacketSize(sz) {
    if (sz > 0) this.packetSize = sz;
  }
  getSize() {
    return this.reader.size();
  }
  getProgressPct() {
    return Math.floor((this.fileOffset * 100) / this.getSize());
  }
  isAllSent() {
    return this.fileOffset >= this.getSize();
  }
  currentBlockRemaining() {
    const sentInBlock = this.fileOffset - this.blockOffset;
    return (
      Math.min(this.blockSize, this.getSize() - this.blockOffset) - sentInBlock
    );
  }
  beginBlock() {
    this.blockOffset = this.fileOffset;
    const remaining = this.getSize() - this.fileOffset;
    return Math.min(remaining, this.blockSize);
  }
  nextChunk(maxLen) {
    const remaining = Math.min(
      this.getSize() - this.fileOffset,
      this.currentBlockRemaining()
    );
    const len = Math.min(remaining, maxLen);
    const chunk = this.reader.read(this.fileOffset, len);
    this.fileOffset += len;
    return chunk;
  }
}

class OtaSession {
  constructor(opts) {
    this.dev = opts.device;
    this.chIn = opts.chIn;
    this.chOut = opts.chOut;
    this.reader = opts.reader;
    this.onStatus = opts.onStatus;
    this.onProgress = opts.onProgress;
    this.onInfo = opts.onInfo;
    this.log = opts.log;
    this.cmdGen = new OtaCommandGenerator();
    this.dataProvider = new OtaDataProvider(opts.reader);
    this.maxPayload = SAFE_PAYLOAD_LIMIT;
    this.timer = null;
    this.allowedUpdate = false;
    this.blockSize = DEFAULT_BLOCK_SIZE;
    this.packetSize = DEFAULT_PACKET_SIZE;
    this.hash4 = null;
    this.deviceVersion = null;
    this.isPaused = false;
    this.isCompressed = opts.reader.isCompressed();
    this.log(`Firmware compressed: ${this.isCompressed}`);
  }
  async start() {
    this.chIn.addEventListener("characteristicvaluechanged", (e) =>
      this.onNotify(e)
    );
    await this.chIn.startNotifications();
    this.log("Notifications enabled");
    await this.sendCtl(IDENTIFICATION, "identification");
    this.onStatus("sent identification");
    setTimeout(() => this.sendGetAllInfo(), DELAY_AFTER_IDENT_MS);
  }
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  armTimer(label) {
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.onStatus(`timeout waiting after ${label}`);
      this.log(`Timeout after ${label}`);
    }, TIMEOUT_MS);
  }
  async sendRaw(data) {
    if (LOG_DATA_FRAMES || data.length <= 20) {
      this.log(`TX (raw ${data.length}): ${toHex(data)}`);
    }
    await this.chOut.writeValueWithoutResponse(data);
  }

  // For short control commands, use write with response for better reliability
  async sendCtl(data, label = "ctl") {
    this.log(`TX (${label} ${data.length}): ${toHex(data)}`);
    if (this.chOut.writeValue) {
      await this.chOut.writeValue(data);
    } else {
      await this.chOut.writeValueWithoutResponse(data);
    }
  }
  async sendGetAllInfo() {
    const cmd = this.cmdGen.cmdGetAllInfo();
    await this.sendCtl(cmd, "getAllInfo");
    this.onStatus("requested all info");
    this.armTimer("getAllInfo");
  }
  async sendGetInfoVersion() {
    const cmd = this.cmdGen.cmdGetInfoVersion();
    await this.sendCtl(cmd, "getInfoVersion");
    this.onStatus("requested version");
    this.armTimer("getInfoVersion");
  }
  async sendGetInfoUpdate() {
    if (!this.hash4) this.hash4 = await this.reader.hashHead4();
    const cmd = this.cmdGen.cmdGetInfoUpdate(
      this.dataProvider.deviceVersion || 0,
      this.hash4
    );
    await this.sendCtl(cmd, "getInfoUpdate");
    this.onStatus("requested update info");
    this.armTimer("getInfoUpdate");
  }
  async beginOtaBlock() {
    const totalLen = this.dataProvider.beginBlock();
    const header = this.cmdGen.cmdStartSendHeader(
      this.dataProvider.fileOffset,
      totalLen
    );
    const maxData = Math.min(
      this.packetSize - header.length,
      this.maxPayload - header.length
    );
    const chunk = this.dataProvider.nextChunk(maxData);
    const packet = new Uint8Array(header.length + chunk.length);
    packet.set(header, 0);
    packet.set(chunk, header.length);
    await this.sendRaw(packet);
    this.onStatus("sent block start");
    this.onProgress(this.dataProvider.getProgressPct());
    // wait for notify OK/DONE before sending more data of this block
    this.armTimer("blockStatus");
  }
  async sendNextData() {
    if (this.dataProvider.isAllSent()) return;
    const header = this.cmdGen.cmdSendDataHeader();
    const maxData = Math.min(
      this.packetSize - header.length,
      this.maxPayload - header.length,
      this.dataProvider.currentBlockRemaining()
    );
    const chunk = this.dataProvider.nextChunk(maxData);
    const packet = new Uint8Array(header.length + chunk.length);
    packet.set(header, 0);
    packet.set(chunk, header.length);
    await this.sendRaw(packet);
    // Throttle progress updates to reduce UI overhead
    this._progTick = (this._progTick || 0) + 1;
    if (this._progTick % 10 === 0 || this.dataProvider.isAllSent()) {
      this.onProgress(this.dataProvider.getProgressPct());
    }
    // If block not finished, keep sending immediately; otherwise wait for status
    if (this.dataProvider.currentBlockRemaining() > 0) {
      return this.sendNextData();
    }
    this.armTimer("blockStatus");
  }
  async onNotify(e) {
    const data = new Uint8Array(e.target.value.buffer.slice(0));
    this.log(`RX: ${toHex(data)}`);
    if (data.length < 2) return;
    const cmdType = data[0];
    const seq = data[1]; // unused
    if (cmdType === CMD_NOTIFY_STATUS) {
      const status = data[2];
      this.handleStatus(status);
    } else if (cmdType === CMD_GET_INFO || cmdType === CMD_GET_INFO_TLV) {
      this.clearTimer();
      const payload = data.slice(2);
      this.handleInfo(cmdType, payload);
    } else {
      this.log(`RX unknown cmdType 0x${cmdType.toString(16)}`);
    }
  }
  async handleStatus(status) {
    this.clearTimer();
    switch (status) {
      case STATE_OK:
        if (!this.dataProvider.isAllSent()) {
          await this.beginOtaBlock();
          await this.sendNextData();
        } else {
          this.onStatus("all data sent, awaiting DONE");
        }
        break;
      case STATE_DONE:
        if (this.isCompressed) {
          this.onStatus(
            "Data sent; device decompressing/rebooting. Wait for auto-reconnect."
          );
        } else {
          this.onStatus("OTA done");
        }
        this.onProgress(100);
        break;
      case STATE_PAUSE:
        this.isPaused = true;
        this.onStatus("paused by device");
        break;
      case STATE_CONTINUE:
        this.isPaused = false;
        this.onStatus("continue requested");
        await this.sendGetInfoVersion();
        break;
      case STATE_TWS_DISCONNECTED:
        this.onStatus("TWS disconnected");
        break;
      default:
        this.onStatus(`device error code ${status}`);
        break;
    }
  }
  handleInfo(cmdType, payload) {
    // payload is TLV for 0x92, or subtype-prefixed for 0x91
    if (cmdType === CMD_GET_INFO) {
      const subtype = payload[0];
      const info = payload.slice(1);
      this.processInfo(subtype, info);
      if (subtype === INFO_VERSION) {
        this.sendGetInfoUpdate();
      } else if (subtype === INFO_UPDATE) {
        if (this.allowedUpdate) {
          this.beginOtaBlock().then(() => this.sendNextData());
        } else {
          this.onStatus("update refused by device");
        }
      }
    } else if (cmdType === CMD_GET_INFO_TLV) {
      let off = 0;
      while (off + 2 <= payload.length) {
        const type = payload[off];
        const len = payload[off + 1];
        const info = payload.slice(off + 2, off + 2 + len);
        this.processInfo(type, info);
        off += 2 + len;
      }
      // After TLV, we are ready to start the formal OTA start flow
      this.sendGetInfoVersion();
    }
  }
  processInfo(type, info) {
    const dv = new DataView(info.buffer, info.byteOffset, info.byteLength);
    if (type === INFO_VERSION && info.length === 2) {
      this.deviceVersion = dv.getUint16(0, true);
      this.dataProvider.deviceVersion = this.deviceVersion;
      this.onInfo({ version: this.deviceVersion });
    } else if (type === INFO_UPDATE && info.length === 11) {
      const startAddr = dv.getInt32(0, true);
      const blockSize = dv.getInt32(4, true);
      const packetSize = dv.getInt16(8, true);
      const allow = info[10] === 1;
      this.dataProvider.setStartAddress(startAddr);
      this.dataProvider.setBlockSize(blockSize);
      this.dataProvider.setPacketSize(packetSize);
      this.blockSize = blockSize;
      this.packetSize = packetSize;
      this.allowedUpdate = allow;
      this.onInfo({ blockSize, packetSize, allow });
    } else if (type === INFO_CAPABILITIES && info.length === 2) {
      const caps = dv.getUint16(0, true);
      this.onInfo({ isTws: (caps & INFO_CAP_TWS) !== 0 });
    } else if (type === INFO_STATUS && info.length === 2) {
      const st = dv.getUint16(0, true);
      this.onInfo({
        twsConnected: (st & INFO_STATUS_TWS_CONNECTED) !== 0,
      });
    } else if (type === INFO_CHANNEL && info.length === 1) {
      const ch = info[0];
      this.onInfo({ channel: ch === CHANNEL_LEFT ? "L" : "R" });
    }
  }
}

export default function UploadButtonSafeBuds() {
  const [file, setFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState("");
  const [logs, setLogs] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const logRef = React.useRef(null);
  let session = null;

  const log = (msg) => {
    const ts = new Date().toISOString().substr(11, 8);
    setLogs((prev) => prev + `[${ts}] ${msg}\n`);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 10);
  };

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const buf = await f.arrayBuffer();
    setFile(f);
    setBuffer(buf);
    log(`Selected: ${f.name}`);
  };

  const Start = async () => {
    if (!buffer) return alert("Select firmware file");

    if (!SAFE_BUDS_STORE.device) {
      setStatus("Device not connected");
      return;
    }
    setIsUploading(true);
    const reader = new DataReader(buffer);

    session = new OtaSession({
      device: SAFE_BUDS_STORE.device,
      chIn: SAFE_BUDS_STORE.chIn,
      chOut: SAFE_BUDS_STORE.chOut,
      reader,
      onStatus: setStatus,
      onProgress: setProgress,
      onInfo: (i) => log("Info: " + JSON.stringify(i)),
      log,
    });

    setDeviceInfo(`Device: ${SAFE_BUDS_STORE.device.name}`);
    session.start();
  };

  return (
    <>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        <Typography variant="h6">
          {file ? file.name : "Upload Firmware"}
        </Typography>
        <VisuallyHiddenInput type="file" onChange={handleFileChange} />
      </Button>

      <Button
        disabled={!file}
        sx={{ ml: 3 }}
        variant="outlined"
        onClick={Start}
      >
        <Typography variant="h6">Start OTA</Typography>
      </Button>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Status: {status}</Typography>
        <Typography variant="h6">Progress: {progress}%</Typography>
        <Typography variant="h6">{deviceInfo}</Typography>
      </Box>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Logs</Typography>
        <pre
          ref={logRef}
          style={{
            maxHeight: 300,
            overflow: "auto",
            background: "#111",
            color: "#0f0",
            padding: 10,
          }}
        >
          {logs}
        </pre>
      </Paper>
    </>
  );
}
