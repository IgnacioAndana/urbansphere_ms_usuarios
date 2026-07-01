const fs = require('fs');
const path = require('path');

const origen = path.join(__dirname, '..', 'src', 'common', 'correo', 'assets');
const destino = path.join(__dirname, '..', 'dist', 'common', 'correo', 'assets');

if (!fs.existsSync(origen)) {
  console.warn('copy-correo-assets: no se encontró', origen);
  process.exit(0);
}

fs.mkdirSync(destino, { recursive: true });
fs.cpSync(origen, destino, { recursive: true });
console.log('copy-correo-assets: assets copiados a', destino);
