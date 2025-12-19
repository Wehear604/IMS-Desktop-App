const EventEmitter = require("events");

const UUID_SVC = "0000ff12-0000-1000-8000-00805f9b34fb";
const UUID_IN = "0000ff14-0000-1000-8000-00805f9b34fb";
const UUID_OUT = "0000ff15-0000-1000-8000-00805f9b34fb";

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
const INFO_CAP = 0x03;
const INFO_STATUS = 0x04;
const INFO_CHANNEL = 0x06;

const SAFE_PAYLOAD_LIMIT = 200;
const DEFAULT_PACKET_SIZE = 240;
const DEFAULT_BLOCK = 4096;

const IDENTIFICATION = Uint8Array.from([
  0xcc, 0xaa, 0x55, 0xee, 0x12, 0x19, 0xe4,
]);

class DataReader {
  constructor(buffer) {
    this.view = new Uint8Array(buffer);
  }
  size() {
    return this.view.length;
  }
  read(pos, len) {
    return this.view.slice(pos, pos + len);
  }
  isCompressed() {
    return (
      this.view[0] === 0x50 && this.view[1] === 0x4f && this.view[2] === 0x54
    );
  }
  async hashHead4() {
    const crypto = require("crypto");
    const md5 = crypto.createHash("md5").update(this.view).digest();
    return md5.slice(0, 4);
  }
}

class OtaDataProvider {
  constructor(reader) {
    this.reader = reader;
    this.fileOffset = 0;
    this.blockOffset = 0;
    this.blockSize = DEFAULT_BLOCK;
    this.packetSize = DEFAULT_PACKET_SIZE;
  }

  getSize() {
    return this.reader.size();
  }
  getProgress() {
    return Math.floor((this.fileOffset * 100) / this.getSize());
  }
  isDone() {
    return this.fileOffset >= this.getSize();
  }

  beginBlock() {
    this.blockOffset = this.fileOffset;
    const remain = this.reader.size() - this.fileOffset;
    return Math.min(remain, this.blockSize);
  }

  remainingBlock() {
    const sent = this.fileOffset - this.blockOffset;
    return (
      Math.min(this.blockSize, this.reader.size() - this.blockOffset) - sent
    );
  }

  next(maxLen) {
    const len = Math.min(this.remainingBlock(), maxLen);
    const data = this.reader.read(this.fileOffset, len);
    this.fileOffset += len;
    return data;
  }
}

class CommandGen {
  constructor() {
    this.seq = 0;
  }
  s() {
    return this.seq++ & 0xff;
  }

  tlv(t, val) {
    return Uint8Array.from([t, val.length, ...val]);
  }

  getAll() {
    const body = [
      this.tlv(INFO_VERSION, new Uint8Array()),
      this.tlv(INFO_CAP, new Uint8Array()),
      this.tlv(INFO_STATUS, new Uint8Array()),
      this.tlv(INFO_CHANNEL, new Uint8Array()),
    ];
    const len = body.reduce((a, b) => a + b.length, 0);
    const out = new Uint8Array(2 + len);
    out[0] = CMD_GET_INFO_TLV;
    out[1] = this.s();
    let o = 2;
    body.forEach((b) => {
      out.set(b, o);
      o += b.length;
    });
    return out;
  }

  getVersion() {
    return Uint8Array.from([CMD_GET_INFO, this.s(), INFO_VERSION]);
  }

  getUpdate(ver, hash4) {
    const out = new Uint8Array(9);
    const dv = new DataView(out.buffer);
    out[0] = CMD_GET_INFO;
    out[1] = this.s();
    out[2] = INFO_UPDATE;
    dv.setInt16(3, ver, true);
    out.set(hash4, 5);
    return out;
  }

  startBlock(addr, len) {
    const out = new Uint8Array(10);
    const dv = new DataView(out.buffer);
    out[0] = CMD_OTA_INFO;
    out[1] = this.s();
    dv.setInt32(2, addr, true);
    dv.setInt32(6, len, true);
    return out;
  }

  dataHeader() {
    return Uint8Array.from([CMD_SEND_DATA, this.s()]);
  }
}

class OtaSession extends EventEmitter {
  constructor(device, chIn, chOut, buffer) {
    super();
    this.dev = device;
    this.chIn = chIn;
    this.chOut = chOut;
    this.reader = new DataReader(buffer);
    this.dp = new OtaDataProvider(this.reader);
    this.cmd = new CommandGen();
    this.hash4 = null;
    this.allowed = false;
    this.isCompressed = this.reader.isCompressed();
  }

  async start() {
    await this.chIn.startNotifications();
    this.chIn.on("data", (d) => this.onNotify(d));

    this.emit("status", "Notifications enabled");

    await this.writeCtl(IDENTIFICATION);
    this.emit("status", "Identification sent");

    setTimeout(() => this.sendGetAll(), 100);
  }

  async writeCtl(data) {
    await this.chOut.write(data, true);
  }

  async writeRaw(data) {
    await this.chOut.write(data, false);
  }

  async sendGetAll() {
    await this.writeCtl(this.cmd.getAll());
    this.emit("status", "Requested all info");
  }

  async sendVersion() {
    await this.writeCtl(this.cmd.getVersion());
  }

  async sendUpdate() {
    if (!this.hash4) this.hash4 = await this.reader.hashHead4();
    await this.writeCtl(
      this.cmd.getUpdate(this.dp.deviceVersion || 0, this.hash4)
    );
  }

  async beginBlock() {
    const total = this.dp.beginBlock();
    const header = this.cmd.startBlock(this.dp.fileOffset, total);
    const max = Math.min(
      240 - header.length,
      SAFE_PAYLOAD_LIMIT - header.length
    );
    const chunk = this.dp.next(max);

    const pkt = new Uint8Array(header.length + chunk.length);
    pkt.set(header, 0);
    pkt.set(chunk, header.length);

    await this.writeRaw(pkt);
    this.emit("status", "Sent block start");
    this.emit("progress", this.dp.getProgress());
  }

  async sendNext() {
    if (this.dp.isDone()) return;

    const h = this.cmd.dataHeader();
    const max = Math.min(
      this.dp.remainingBlock(),
      SAFE_PAYLOAD_LIMIT - h.length
    );
    const chunk = this.dp.next(max);

    const pkt = new Uint8Array(h.length + chunk.length);
    pkt.set(h);
    pkt.set(chunk, h.length);

    await this.writeRaw(pkt);

    this.emit("progress", this.dp.getProgress());

    if (this.dp.remainingBlock() > 0) return this.sendNext();
  }

  async onNotify(dataBuf) {
    const data = new Uint8Array(dataBuf);
    const type = data[0];

    if (type === CMD_NOTIFY_STATUS) {
      const s = data[2];
      if (s === STATE_OK) {
        await this.beginBlock();
        await this.sendNext();
      } else if (s === STATE_DONE) {
        this.emit("progress", 100);
        this.emit("done", { success: true });
      } else this.emit("status", "Device status " + s);
    } else if (type === CMD_GET_INFO || type === CMD_GET_INFO_TLV) {
      this.handleInfo(type, data.slice(2));
    }
  }

  handleInfo(type, payload) {
    if (type === CMD_GET_INFO_TLV) {
      let o = 0;
      while (o + 2 <= payload.length) {
        const t = payload[o];
        const len = payload[o + 1];
        const v = payload.slice(o + 2, o + 2 + len);
        this.processInfo(t, v);
        o += 2 + len;
      }
      this.sendVersion();
    } else {
      const subtype = payload[0];
      const info = payload.slice(1);
      this.processInfo(subtype, info);

      if (subtype === INFO_VERSION) this.sendUpdate();
    }
  }

  processInfo(type, info) {
    const dv = new DataView(info.buffer);

    if (type === INFO_VERSION) {
      this.dp.deviceVersion = dv.getUint16(0, true);
    }
    if (type === INFO_UPDATE) {
      const start = dv.getInt32(0, true);
      const block = dv.getInt32(4, true);
      const pkt = dv.getInt16(8, true);
      const allow = info[10] === 1;

      this.dp.setStartAddress(start);
      this.dp.setBlockSize(block);
      this.dp.setPacketSize(pkt);

      this.allowed = allow;
    }
  }
}

module.exports = { OtaSession };
