#!/usr/bin/env node
// ============================================================================
// 🧭 BAQUEANO — MANIFIESTO DE LA APP ANDROID (scripts/app-release-manifest.mjs)
// ============================================================================
// 🎯 POR QUÉ:
// - La página /descargar, el banner del inicio y el Ops Center muestran versión, tamaño,
//   requisitos y permisos de la APK. El propietario pidió no inventar nada (por ejemplo, el
//   Android mínimo): todo sale del archivo APK real que se publica.
//
// ⚙️ CÓMO:
// - Lee website/assets/BaqueanoNicaragua.apk (la misma que azure/deploy.sh publica en la URL
//   estable /downloads/baqueano-android.apk) con un lector ZIP mínimo (zlib de Node, sin
//   dependencias).
// - Decodifica el AndroidManifest.xml binario: versionName, versionCode, package, minSdk,
//   targetSdk y permisos.
// - Calcula el SHA-256 del archivo y toma la fecha del último commit de la APK (git log).
// - El historial se conserva: si la versión cambia, la anterior pasa a "history" (no se borra).
//
// 📦 QUÉ: node scripts/app-release-manifest.mjs [ruta.apk] → website/data/app-release.json
// ============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APK = resolve(process.argv[2] || `${ROOT}/assets/BaqueanoNicaragua.apk`);
const OUT = `${ROOT}/data/app-release.json`;
// API level → versión de Android (fuente: developer.android.com/tools/releases/platforms).
const ANDROID = { 21: '5.0', 22: '5.1', 23: '6.0', 24: '7.0', 25: '7.1', 26: '8.0', 27: '8.1', 28: '9', 29: '10', 30: '11', 31: '12', 32: '12L', 33: '13', 34: '14', 35: '15', 36: '16' };

function readZipEntry(buf, name) {
  // End of central directory: firma 0x06054b50 en los últimos 64 KB.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('No es un ZIP válido');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i += 1) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const entry = buf.toString('utf8', p + 46, p + 46 + nlen);
    if (entry === name) {
      const lnl = buf.readUInt16LE(local + 26), lxl = buf.readUInt16LE(local + 28);
      const data = buf.subarray(local + 30 + lnl + lxl, local + 30 + lnl + lxl + csize);
      return method === 0 ? data : inflateRawSync(data);
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error(`Falta ${name} en la APK`);
}

// Android Binary XML (AXML): pool de cadenas + elementos con atributos tipados.
function parseManifest(data) {
  const strings = [];
  const out = { permissions: [] };
  let pos = 8;
  while (pos < data.length) {
    const type = data.readUInt16LE(pos), size = data.readUInt32LE(pos + 4);
    if (type === 0x0001) {
      const n = data.readUInt32LE(pos + 8), flags = data.readUInt32LE(pos + 16), start = data.readUInt32LE(pos + 20);
      const utf8 = (flags & 0x100) !== 0;
      for (let i = 0; i < n; i += 1) {
        let off = pos + start + data.readUInt32LE(pos + 28 + i * 4);
        if (utf8) {
          off += (data[off] & 0x80) ? 2 : 1;
          let len = data[off];
          if (len & 0x80) { len = ((len & 0x7f) << 8) | data[off + 1]; off += 2; } else off += 1;
          strings.push(data.toString('utf8', off, off + len));
        } else {
          const len = data.readUInt16LE(off);
          strings.push(data.toString('utf16le', off + 2, off + 2 + len * 2));
        }
      }
    } else if (type === 0x0102) {
      const tag = strings[data.readUInt32LE(pos + 20)];
      const attrStart = pos + 16 + data.readUInt16LE(pos + 24), attrCount = data.readUInt16LE(pos + 28);
      for (let i = 0; i < attrCount; i += 1) {
        const a = attrStart + i * 20;
        const name = strings[data.readUInt32LE(a + 4)];
        const raw = data.readUInt32LE(a + 8), dtype = data[a + 15], dval = data.readUInt32LE(a + 16);
        const value = raw !== 0xffffffff ? strings[raw] : ((dtype === 0x10 || dtype === 0x11) ? dval : null);
        if (tag === 'manifest' && ['versionCode', 'versionName', 'package', 'compileSdkVersion'].includes(name)) out[name] = value;
        if (tag === 'uses-sdk' && ['minSdkVersion', 'targetSdkVersion'].includes(name)) out[name] = value;
        if (tag === 'uses-permission' && name === 'name' && typeof value === 'string') out.permissions.push(value);
      }
    }
    pos += size || 8;
  }
  return out;
}

// Permisos que la persona ve al instalar, explicados en lenguaje claro (clave i18n por permiso).
const PERMISSION_KEYS = {
  'android.permission.INTERNET': 'internet',
  'android.permission.ACCESS_NETWORK_STATE': 'network',
  'android.permission.ACCESS_FINE_LOCATION': 'location',
  'android.permission.ACCESS_COARSE_LOCATION': 'location',
  'android.permission.CALL_PHONE': 'call',
  'android.permission.CAMERA': 'camera',
  'android.permission.READ_MEDIA_IMAGES': 'photos',
  'android.permission.READ_EXTERNAL_STORAGE': 'photos',
  'android.permission.WAKE_LOCK': 'wakelock',
  'com.google.android.gms.permission.AD_ID': 'adid',
  'android.permission.ACCESS_ADSERVICES_AD_ID': 'adid',
  'android.permission.ACCESS_ADSERVICES_ATTRIBUTION': 'adid',
  'com.google.android.c2dm.permission.RECEIVE': 'push',
};

function gitDate(file) {
  try { return execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim() || null; } catch { return null; }
}

if (!existsSync(APK)) { console.error(`No existe la APK: ${APK}`); process.exit(1); }
const apk = readFileSync(APK);
const manifest = parseManifest(readZipEntry(apk, 'AndroidManifest.xml'));
const minSdk = Number(manifest.minSdkVersion);
const current = {
  versionName: String(manifest.versionName),
  versionCode: Number(manifest.versionCode),
  package: manifest.package,
  minSdk,
  minAndroid: ANDROID[minSdk] || null,
  targetSdk: Number(manifest.targetSdkVersion),
  targetAndroid: ANDROID[Number(manifest.targetSdkVersion)] || null,
  sizeBytes: apk.length,
  sha256: createHash('sha256').update(apk).digest('hex'),
  publishedAt: gitDate(APK),
  permissions: [...new Set(manifest.permissions.map((p) => PERMISSION_KEYS[p]).filter(Boolean))],
  rawPermissions: manifest.permissions,
  source: 'website/assets/BaqueanoNicaragua.apk',
};

let previous = null;
try { previous = JSON.parse(readFileSync(OUT, 'utf8')); } catch { previous = null; }
const history = Array.isArray(previous?.history) ? previous.history : [];
if (previous?.current && previous.current.sha256 !== current.sha256) {
  history.unshift({ ...previous.current, status: 'superseded' });
}
const release = {
  generatedAt: new Date().toISOString(),
  stableUrl: 'https://baqueanonicaragua.com/descargar',
  apkUrl: '/downloads/baqueano-android.apk',
  // Firma: se completa a mano solo con la huella verificada (openssl), nunca se inventa.
  signer: previous?.signer || null,
  current: { ...current, status: 'published', notesKey: previous?.current?.versionName === current.versionName ? (previous.current.notesKey || null) : null },
  history,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(release, null, 2)}\n`);
console.log(`app-release.json: ${current.versionName} (${current.versionCode}) · minSdk ${minSdk} (Android ${current.minAndroid}) · ${(apk.length / 1e6).toFixed(1)} MB · ${current.sha256.slice(0, 12)}…`);
