move - electron.js

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'electron', 'main.js');
const destDir = path.join(__dirname, 'build');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, path.join(destDir, 'electron.js'));
console.log('✅ electron.js copied to build/');