const fs = require('fs');
const path = require('path');

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (['node_modules', '.git', 'dist', '.gemini', 'brain', 'scratch'].includes(entry.name)) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

try {
  copyDir(process.cwd(), path.join(process.cwd(), 'dist'));
  console.log('✅ Static assets & HTML pages copied to dist/ successfully.');
} catch (err) {
  console.error('❌ Asset copy failed:', err);
}
