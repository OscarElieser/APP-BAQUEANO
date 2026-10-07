#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO — QR DE DESCARGA DE LA APP (scripts/make-download-qr.mjs)
// ============================================================================
// 🎯 POR QUÉ:
// - El banner del inicio y la página /descargar muestran un QR para instalar la app desde la
//   computadora. El QR apunta a la URL estable https://baqueanonicaragua.com/descargar y no al
//   archivo APK: cuando salga una versión nueva, el QR impreso o compartido sigue sirviendo.
//
// ⚙️ CÓMO:
// - Usa el codificador QR que ya trae npm (qrcode-terminal/vendor/QRCode, MIT, Kazuhiko Arase),
//   sin agregar dependencias al proyecto.
// - Escribe un SVG estático (un solo <path>, sin scripts), con corrección de errores M y
//   margen de 4 módulos, que es el mínimo que pide la norma para leerlo bien.
// - El SVG se versiona en el repo: el sitio no ejecuta ningún código de terceros para mostrarlo.
//
// 📦 QUÉ: node scripts/make-download-qr.mjs [url] → assets/images/qr-descargar.svg
// ============================================================================
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_TARGET = process.argv[2] || 'https://baqueanonicaragua.com/descargar';
const OUT = join(ROOT, 'assets/images/qr-descargar.svg');

const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const require = createRequire(import.meta.url);
const QRCode = require(join(npmRoot, 'npm/node_modules/qrcode-terminal/vendor/QRCode/index.js'));
const ErrorLevel = require(join(npmRoot, 'npm/node_modules/qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel.js'));

const qr = new QRCode(-1, ErrorLevel.M);
qr.addData(URL_TARGET);
qr.make();
const n = qr.getModuleCount();
const margin = 4;
const size = n + margin * 2;
let path = '';
for (let r = 0; r < n; r += 1) {
  for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 8}" height="${size * 8}" shape-rendering="crispEdges" role="img" aria-label="QR: ${URL_TARGET}"><rect width="${size}" height="${size}" fill="#FFFFFF"/><path fill="#0F2A33" d="${path}"/></svg>\n`;
writeFileSync(OUT, svg);
console.log(`qr-descargar.svg: ${n}×${n} módulos (+${margin} de margen) → ${URL_TARGET}`);
