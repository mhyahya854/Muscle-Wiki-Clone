const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'index.html');
const destDir = path.join(root, 'dist', 'client');
const dest = path.join(destDir, 'index.html');

try {
  if (!fs.existsSync(src)) {
    console.error('index.html not found at project root:', src);
    process.exit(1);
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied index.html to', dest);
} catch (err) {
  console.error('Failed to copy index.html:', err);
  process.exit(1);
}
