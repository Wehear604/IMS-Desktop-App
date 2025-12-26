import React, { useState } from "react";

// Renderer-only UI. Implement Classic Bluetooth in main/preload
// (e.g., with `bluetooth-serial-port`) and expose IPC handlers
// `classic-connect` and `classic-disconnect` that return a boolean.

const ClassicConnection = () => {
  const [address, setAddress] = useState("");
  const [channel, setChannel] = useState(1);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleConnect = async () => {
    if (!address) {
      setError("Enter a device MAC/Bluetooth address");
      return;
    }
    setError("");
    setBusy(true);
    setStatus("Connecting…");
    try {
      const ok = await window.electron?.invoke("classic-connect", {
        address,
        channel: Number(channel) || 1,
      });
      if (ok) setStatus(`Connected to ${address}`);
      else setStatus("Connection failed");
    } catch (err) {
      console.error(err);
      setError(err.message || "Connection failed");
      setStatus("Error");
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await window.electron?.invoke("classic-disconnect");
      setStatus("Disconnected");
    } catch (err) {
      console.error(err);
      setError(err.message || "Disconnect failed");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h3>Classic Bluetooth Connect</h3>
      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Device address (MAC)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span>RFCOMM channel (default 1)</span>
          <input
            type="number"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            min={1}
            max={30}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleConnect} disabled={busy}>
            {busy ? "Connecting…" : "Connect"}
          </button>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>

        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
    </div>
  );
};

export default ClassicConnection;
