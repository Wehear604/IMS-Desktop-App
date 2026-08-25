const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { execFile } = require("child_process");

// ----------------------------------------------------------------------
//   BLUETOOTH ADAPTER DETECTION (Windows)
//   Returns the radio manufacturer, exact driver version and (when the
//   vendor driver exposes it) the Bluetooth specification version
//   (4.0 - 5.4) derived from the LMP version.
//   Provider detection works for Qualcomm, Intel, Realtek, MediaTek,
//   Broadcom, TP-Link, Marvell and Atheros adapters.
// ----------------------------------------------------------------------
async function getBluetoothVersion() {
  if (process.platform !== "win32") {
    return {
      success: false,
      platform: process.platform,
      error: "Bluetooth adapter detection is only supported on Windows.",
    };
  }

  const psScript = `
$ErrorActionPreference = 'SilentlyContinue'

# LMP (Link Manager Protocol) version -> Bluetooth specification version
$lmpMap = @{
  0='1.0';1='1.1';2='1.2';3='2.0';4='2.1';5='3.0';
  6='4.0';7='4.1';8='4.2';9='5.0';10='5.1';11='5.2';12='5.3';13='5.4'
}

# Enumerate Bluetooth PnP entities and keep only the real radio
# (the entry whose manufacturer is the chip vendor, not "Microsoft").
$entities = Get-CimInstance -ClassName Win32_PnPEntity -Filter "PNPClass='Bluetooth'"
$out = @()
foreach ($e in $entities) {
  if ($e.Manufacturer -like 'Microsoft') { continue }
  if (-not $e.DeviceID) { continue }

  # Real driver version (Win32_PnPEntity.DriverVersion is empty, so we
  # read it from the signed-driver store instead).
  $driverVersion = $null
  try {
    $q = "DeviceID='$($e.DeviceID -replace '\\\\','\\\\')'"
    $sd = Get-CimInstance -ClassName Win32_PnPSignedDriver -Filter $q -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($sd -and $sd.DriverVersion) { $driverVersion = $sd.DriverVersion }
  } catch {}

  # Best-effort Bluetooth spec version. The radio properties are exposed by
  # the Windows Bluetooth stack (BTHUSB) under this DEVPKEY GUID; the LMP
  # version (property id 4) maps to the Bluetooth specification (4.0 - 5.4).
  $lmp = $null
  try {
    $p = Get-PnpDeviceProperty -InstanceId $e.DeviceID -KeyName '{A92F26CA-EDA7-4B1D-9DB2-27B68AA5A2EB} 4' -ErrorAction SilentlyContinue
    if ($p -and $p.Data -ne $null) { $lmp = [int]$p.Data }
  } catch {}

  $bluetoothVersion = $null
  if ($lmp -ne $null) {
    $bluetoothVersion = if ($lmpMap.ContainsKey($lmp)) { $lmpMap[$lmp] } else { "LMP $lmp" }
  }

  $out += [PSCustomObject]@{
    name            = $e.Name
    manufacturer    = $e.Manufacturer
    driverVersion   = $driverVersion
    deviceId        = $e.DeviceID
    bluetoothVersion = $bluetoothVersion
    lmpVersion      = $lmp
  }
}
ConvertTo-Json -InputObject $out -Compress -Depth 3
`;

  const tmp = path.join(os.tmpdir(), `bt-version-${Date.now()}.ps1`);
  fs.writeFileSync(tmp, psScript, "utf8");

  try {
    const stdout = await new Promise((resolve, reject) => {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          tmp,
        ],
        { maxBuffer: 1024 * 1024 },
        (err, so) => (err ? reject(err) : resolve(so)),
      );
    });

    const trimmed = stdout.trim();
    if (!trimmed || trimmed === "[]") {
      return {
        success: true,
        adapters: [],
        message: "No Bluetooth radio adapters were found on this machine.",
      };
    }

    const parsed = JSON.parse(trimmed);
    const adapters = Array.isArray(parsed) ? parsed : [parsed];

    return { success: true, adapters };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch (_) {
      /* ignore cleanup failure */
    }
  }
}

module.exports = { getBluetoothVersion };
