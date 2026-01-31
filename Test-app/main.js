const { app, BrowserWindow, dialog, shell, net } = require("electron");
const pkg = require("./package.json");

const UPDATE_API_URL =
  "https://imsdevelopment.wehear.in/api/version-control/dynamic-json?filename=version";

// Helper to compare versions (returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal)
function compareVersions(v1, v2) {
  const a = v1.split(".").map(Number);
  const b = v2.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return 1;
    if ((a[i] || 0) < (b[i] || 0)) return -1;
  }
  return 0;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 450,
    height: 350,
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  win.loadFile("index.html");

  // Fetch update data
  const request = net.request(UPDATE_API_URL);
  request.on("response", (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      try {
        const remoteData = JSON.parse(body);
        const localVersion = pkg.version;
        const remoteVersion = remoteData.version;

        // Compare versions
        if (compareVersions(remoteVersion, localVersion) === 1) {
          const choice = dialog.showMessageBoxSync(win, {
            type: "warning",
            title: "Update Required",
            message: `A new version (v${remoteVersion}) is available.\nYou are currently on v${localVersion}.`,
            buttons: ["Download Update", "Exit App"],
            defaultId: 0,
          });

          if (choice === 0) {
            // Open a download link (using a dummy link for testing)
            shell.openExternal("https://your-download-link.com/app.exe");
          }
          app.quit(); // Force close for testing purposes
        } else {
          console.log("App is up to date.");
        }
      } catch (e) {
        console.error("Failed to parse update JSON:", e);
      }
    });
  });
  request.on("error", (err) => console.error("Update check failed:", err));
  request.end();
}

app.whenReady().then(createWindow);
