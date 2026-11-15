const fs = require('fs');
const path = require('path');

const cjsPackageJson = path.join(__dirname, '..', 'dist', 'cjs', 'package.json');
const esmPackageJson = path.join(__dirname, '..', 'dist', 'esm', 'package.json');

// Ensure dist/cjs exists
if (fs.existsSync(path.dirname(cjsPackageJson))) {
  fs.writeFileSync(cjsPackageJson, JSON.stringify({ type: 'commonjs' }, null, 2));
}

// Ensure dist/esm exists
if (fs.existsSync(path.dirname(esmPackageJson))) {
  fs.writeFileSync(esmPackageJson, JSON.stringify({ type: 'module' }, null, 2));
}

console.log('Postbuild: Successfully generated CJS and ESM package.json manifests.');
