const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "electron", "main.js");
const targets = [
  path.join(__dirname, "build", "electron.js"),
  path.join(__dirname, "public", "electron.js"),
];

for (const target of targets) {
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
}

console.log("electron.js copied to build/ and public/");
