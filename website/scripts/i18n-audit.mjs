#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: impedir que páginas, scripts o componentes queden fuera de la
 *   internacionalización global (es-NI fuente/respaldo, en, fr, it, pt, de).
 *   Antes el texto sin clave solo generaba advertencias y nada lo frenaba.
 *
 * ⚙️ CÓMO:
 *   1. Paridad de catálogos: toda clave de es.json existe y no está vacía en
 *      los otros cinco (ERROR).
 *   2. Claves usadas (data-i18n*, BaqueanoLanguage.t, t("…"), <T k>) deben
 *      existir en es.json (ERROR).
 *   3. Páginas HTML públicas cargan el shell global (ERROR).
 *   4. Cobertura por archivo (HTML, JS de interfaz, TSX/JSX). Puerta trinquete
 *      contra `scripts/i18n-baseline.json`: un archivo NUNCA puede tener más
 *      textos sin clave que su línea base, y todo archivo NUEVO debe tener 0
 *      (ERROR). La línea base solo puede bajar (`--update-baseline`).
 *   5. Exentos: nombres propios/marcas (scripts/i18n-proper-nouns.json), URLs,
 *      correos, teléfonos, precios, números, `data-no-translate`,
 *      `translate="no"`, `.notranslate`. Los archivos de contenido editorial
 *      (`js/*-data.js`) se reportan aparte: se traducen como contenido, no UI.
 *
 * 📦 QUÉ: `npm run i18n` → errores + `docs/i18n-audit.json` +
 *   `docs/i18n-coverage.md` (archivo, total, traducidos, sin traducir, %).
 */
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, flatten, scanHtml, scanJs, scanTsx } from './lib/i18n-scan.mjs';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const updateBaseline = args.has('--update-baseline');
const allowIncrease = args.has('--allow-increase');
const baselinePath = path.join(root, 'scripts', 'i18n-baseline.json');
const errors = [];
const SHELL_EXEMPT = new Set(['admin.html', 'i18n-test.html']);
const EDITORIAL_JS = /(^|\/)([\w-]+-data|data|catalog[\w-]*)\.js$/;

// 1) Paridad de catálogos -----------------------------------------------------
const catalogs = new Map(LANGS.map((lang) => [lang, flatten(JSON.parse(fs.readFileSync(path.join(root, 'locales', `${lang}.json`), 'utf8')))]));
const es = catalogs.get('es');
const baseKeys = [...es.keys()].filter((key) => key !== 'meta.locale');
for (const lang of LANGS.slice(1)) {
  const catalog = catalogs.get(lang);
  const missing = baseKeys.filter((key) => typeof catalog.get(key) !== 'string' || !catalog.get(key).trim());
  if (missing.length) errors.push(`${lang}: ${missing.length} claves ausentes o vacías (${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', …' : ''})`);
}

// 2–4) Escaneo de archivos ----------------------------------------------------
const walk = (dir, filter, output = []) => {
  if (!fs.existsSync(dir)) return output;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist-hostinger', 'out', 'build'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, output);
    else if (filter(full)) output.push(full);
  }
  return output;
};
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

const files = [];
// Los archivos de verificación de Google Search Console (googleXXXX.html) deben
// conservar su contenido exacto: no son páginas de interfaz ni cargan el shell.
const isSiteVerification = (name) => /^google[0-9a-f]{8,}\.html$/.test(name);
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html') && !isSiteVerification(name))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!SHELL_EXEMPT.has(file) && !/js\/global-injector\.js/.test(source)) errors.push(`${file}: no carga el shell global (js/global-injector.js).`);
  if (/js\/global-language\.js/.test(source)) errors.push(`${file}: carga global-language.js directamente (debe cargarlo el shell).`);
  const scan = scanHtml(source, { root, catalog: es });
  files.push({ file, type: 'html', total: scan.total + scan.attrTotal, translated: scan.keyed + scan.attrKeyed, untranslated: scan.untranslated + scan.attrUntranslated, legacyPhrase: scan.legacy, missingKeys: scan.missingKeys });
}
for (const full of walk(path.join(root, 'js'), (file) => file.endsWith('.js') && !file.endsWith('.min.js'))) {
  const file = rel(full);
  const source = fs.readFileSync(full, 'utf8');
  const scan = scanJs(source, { catalog: es });
  const editorial = EDITORIAL_JS.test(file);
  files.push({ file, type: editorial ? 'js-editorial' : 'js', total: scan.keyed + scan.hardcoded, translated: scan.keyed, untranslated: editorial ? 0 : scan.hardcoded, editorialStrings: editorial ? scan.hardcoded : 0, missingKeys: scan.missingKeys });
}
for (const full of [...walk(path.join(root, 'apps'), (file) => /\.(tsx|jsx)$/.test(file)), ...walk(path.join(root, 'packages'), (file) => /\.(tsx|jsx)$/.test(file))]) {
  const file = rel(full);
  const scan = scanTsx(fs.readFileSync(full, 'utf8'), { root, catalog: es });
  files.push({ file, type: 'tsx', total: scan.total, translated: scan.keyed, untranslated: scan.untranslated, missingKeys: scan.missingKeys });
}

for (const entry of files) {
  for (const key of new Set(entry.missingKeys)) errors.push(`${entry.file}: clave inexistente en es.json → ${key}`);
}

// Puerta trinquete --------------------------------------------------------------
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : { files: {} };
const increases = [];
for (const entry of files) {
  const allowed = baseline.files[entry.file];
  if (allowed == null) {
    if (entry.untranslated > 0) increases.push(`${entry.file}: archivo nuevo con ${entry.untranslated} textos de interfaz sin clave i18n (debe ser 0).`);
  } else if (entry.untranslated > allowed) {
    increases.push(`${entry.file}: ${entry.untranslated} textos sin clave (línea base ${allowed}). No se permite agregar texto de interfaz sin clave.`);
  }
}

if (updateBaseline) {
  if (increases.length && !allowIncrease) {
    console.error('❌ La línea base no puede subir. Corregí estos archivos:');
    increases.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }
  const next = { description: 'Textos de interfaz sin clave i18n permitidos por archivo (deuda a eliminar). Solo puede bajar: npm run i18n:baseline.', updatedAt: new Date().toISOString(), files: {} };
  for (const entry of files.sort((a, b) => a.file.localeCompare(b.file))) if (entry.untranslated > 0) next.files[entry.file] = entry.untranslated;
  fs.writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Línea base actualizada: ${Object.keys(next.files).length} archivos con deuda.`);
} else {
  errors.push(...increases);
}

// Reportes ---------------------------------------------------------------------
const pct = (entry) => (entry.total ? Math.round((entry.translated / entry.total) * 1000) / 10 : 100);
const sum = (type, field) => files.filter((entry) => !type || entry.type === type).reduce((total, entry) => total + (entry[field] || 0), 0);
const summary = {
  generatedAt: new Date().toISOString(),
  languages: LANGS,
  keysPerLanguage: Object.fromEntries(LANGS.map((lang) => [lang, [...catalogs.get(lang).values()].filter((value) => typeof value === 'string' && value.trim()).length])),
  html: { files: files.filter((e) => e.type === 'html').length, total: sum('html', 'total'), translated: sum('html', 'translated'), untranslated: sum('html', 'untranslated') },
  js: { files: files.filter((e) => e.type === 'js').length, translated: sum('js', 'translated'), untranslated: sum('js', 'untranslated') },
  jsEditorial: { files: files.filter((e) => e.type === 'js-editorial').length, strings: sum('js-editorial', 'editorialStrings') },
  tsx: { files: files.filter((e) => e.type === 'tsx').length, total: sum('tsx', 'total'), translated: sum('tsx', 'translated'), untranslated: sum('tsx', 'untranslated') },
  fullyCovered: files.filter((e) => e.untranslated === 0 && e.type !== 'js-editorial').map((e) => e.file),
  errors,
};
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'i18n-audit.json'), `${JSON.stringify({ ...summary, files: files.map(({ missingKeys, ...rest }) => ({ ...rest, coverage: pct(rest) })) }, null, 2)}\n`);
const rows = files
  .filter((entry) => entry.type !== 'js-editorial')
  .sort((a, b) => b.untranslated - a.untranslated || a.file.localeCompare(b.file))
  .map((entry) => `| ${entry.file} | ${entry.type} | ${entry.total} | ${entry.translated} | ${entry.untranslated} | ${pct(entry)} % |`);
fs.writeFileSync(
  path.join(root, 'docs', 'i18n-coverage.md'),
  [
    '# Cobertura i18n por archivo',
    '',
    `Generado: ${summary.generatedAt} · Idiomas: ${LANGS.join(', ')} · Claves por idioma: ${Object.entries(summary.keysPerLanguage).map(([k, v]) => `${k} ${v}`).join(' · ')}`,
    '',
    `HTML: ${summary.html.translated}/${summary.html.total} textos con clave (${summary.html.untranslated} pendientes) · JS: ${summary.js.untranslated} textos dinámicos pendientes · TSX: ${summary.tsx.untranslated} pendientes · Contenido editorial JS: ${summary.jsEditorial.strings} cadenas (estrategia de contenido).`,
    '',
    '| Archivo | Tipo | Textos | Con clave | Sin traducir | Cobertura |',
    '|---|---|---:|---:|---:|---:|',
    ...rows,
    '',
  ].join('\n'),
);

console.log(`I18N: HTML ${summary.html.translated}/${summary.html.total} · JS pendientes ${summary.js.untranslated} · TSX ${summary.tsx.translated}/${summary.tsx.total} · ${summary.fullyCovered.length} archivos al 100 % · ${errors.length} errores.`);
errors.slice(0, 60).forEach((error) => console.error(`- ${error}`));
if (errors.length > 60) console.error(`… y ${errors.length - 60} errores más (ver docs/i18n-audit.json).`);
if (errors.length) process.exitCode = 1;
