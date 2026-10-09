// ============================================================================
// 🌐 BAQUEANO — EXPORTA LOS IDIOMAS DE LA WEB A LA APP ANDROID
// ============================================================================
// 🎯 POR QUÉ: Web y APK deben hablar los mismos 8 idiomas (es, en, fr, it, pt,
//   de, ko, zh) con una sola fuente de traducciones; copiar a mano haría divergir.
// ⚙️ CÓMO: lee `website/locales/<idioma>.json` (incluida la sección `app.*`
//   para textos propios de la App), los aplana a claves con puntos
//   (`nav.home`) y escribe `assets/i18n/<idioma>.json` en el proyecto Flutter.
//   Con `--check` no escribe: falla si los assets están desactualizados o si
//   a algún idioma le falta una clave del español (fuente de referencia).
// 📦 QUÉ: `npm run export:app-locales` / `npm run test:app-locales`.
// ============================================================================

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh'];
const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = resolve(here, '../locales');
const targetDir = resolve(here, '../../assets/i18n');

function flatten(node, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, out);
    else if (typeof value === 'string') out[path] = value;
  }
  return out;
}

const flat = Object.fromEntries(
  LANGS.map((lang) => [lang, flatten(JSON.parse(readFileSync(resolve(sourceDir, `${lang}.json`), 'utf8')))]),
);

const reference = Object.keys(flat.es).filter((key) => key.startsWith('app.'));
const missing = LANGS.flatMap((lang) => reference.filter((key) => !flat[lang][key]).map((key) => `${lang}:${key}`));
if (missing.length) {
  console.error(`❌ Faltan traducciones de la App: ${missing.slice(0, 20).join(', ')}`);
  process.exit(1);
}

const check = process.argv.includes('--check');
let stale = [];
for (const lang of LANGS) {
  const sorted = Object.fromEntries(Object.keys(flat[lang]).sort().map((key) => [key, flat[lang][key]]));
  const json = `${JSON.stringify(sorted, null, 2)}\n`;
  const target = resolve(targetDir, `${lang}.json`);
  if (check) {
    let current = '';
    try { current = readFileSync(target, 'utf8'); } catch (_) { /* no existe */ }
    if (current !== json) stale.push(lang);
  } else {
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(target, json);
  }
}

if (check) {
  if (stale.length) {
    console.error(`❌ assets/i18n desactualizado (${stale.join(', ')}). Ejecutá: npm run export:app-locales`);
    process.exit(1);
  }
  console.log(`✅ App y Web comparten ${LANGS.length} idiomas · ${Object.keys(flat.es).length} claves (${reference.length} propias de la App).`);
} else {
  console.log(`Exportados ${LANGS.length} idiomas a ${targetDir}`);
}
