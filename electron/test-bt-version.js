// Standalone test for Bluetooth version detection.
// Run with:  node electron/test-bt-version.js
const { getBluetoothVersion } = require("./bluetooth-version");

(async () => {
  console.log("Requesting Bluetooth adapter info...\n");
  const result = await getBluetoothVersion();
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.adapters && result.adapters.length) {
    const a = result.adapters[0];
    console.log(
      `\nDetected: ${a.manufacturer} ${a.name} | Driver ${a.driverVersion} | Bluetooth ${a.bluetoothVersion} (LMP ${a.lmpVersion})`,
    );
  } else if (result.success) {
    console.log("\nNo Bluetooth radio found on this machine.");
  } else {
    console.log("\nDetection failed:", result.error);
  }
})();
