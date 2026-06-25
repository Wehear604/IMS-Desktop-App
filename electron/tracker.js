const { exec } = require("child_process");

async function getTrackingData() {
  return new Promise((resolve) => {
    // 1. PowerShell command to find devices with HEARNU in the name and fetch their PnP DeviceID
    const psCommand = `Get-PnpDevice -Class Bluetooth -FriendlyName "*HEARNU*" -ErrorAction SilentlyContinue | Select-Object FriendlyName, DeviceID | ConvertTo-Json`;

    exec(
      `powershell.exe -NoProfile -Command "${psCommand}"`,
      (error, stdout) => {
        if (error || !stdout.trim()) {
          console.error(
            "❌ Failed to query Bluetooth devices or no HearNU found.",
          );
          return resolve([]);
        }

        try {
          const devices = JSON.parse(stdout);
          // PowerShell ConvertTo-Json returns an object if there's only 1 result, or an array if multiple.
          const deviceArray = Array.isArray(devices) ? devices : [devices];
          const connectedHearNuDevices = [];

          for (const dev of deviceArray) {
            if (dev && dev.DeviceID) {
              // 2. Extract the 12-character MAC address from the BTHENUM\DEV_ string
              // Example DeviceID: BTHENUM\DEV_A1B2C3D4E5F6\7&33f...
              const match = dev.DeviceID.match(/DEV_([0-9A-F]{12})/i);

              if (match && match[1]) {
                // 3. Format the raw string (A1B2C3D4E5F6) into a standard MAC (A1:B2:C3:D4:E5:F6)
                const rawMac = match[1];
                const formattedMac = rawMac.match(/.{1,2}/g).join(":");

                connectedHearNuDevices.push({
                  name: dev.FriendlyName,
                  macAddress: formattedMac,
                  rawDeviceId: dev.DeviceID,
                });
              }
            }
          }

          resolve(connectedHearNuDevices);
        } catch (parseError) {
          console.error("❌ Error parsing PowerShell output:", parseError);
          resolve([]);
        }
      },
    );
  });
}

module.exports = {
  getTrackingData,
};
