#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Impedir que páginas o scripts nuevos queden fuera de la capacidad multilingüe global.
 * ⚙️ CÓMO: Compara catálogos, valida el shell público y registra texto HTML/JavaScript que requiere revisión semántica.
 * 📦 QUÉ: Puerta `i18n:audit` con errores estructurales y reporte JSON de deuda editorial no destructiva.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locales = ['es', 'en', 'fr', 'it', 'pt', 'de'];
const ignoredPages = new Set(['admin.html']);
const errors = [];
const warnings = [];
const flatten = (value, prefix = '', output = new Map()) => {
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, output);
    else output.set(next, child);
  }
  return output;
};

const catalogs = new Map(locales.map(locale => [locale, flatten(JSON.parse(fs.readFileSync(path.join(root, 'locales', `${locale}.json`), 'utf8')))]));
const baseKeys = [...catalogs.get('es').keys()].filter(key => key !== 'meta.locale');
for (const locale of locales.slice(1)) {
  const missing = baseKeys.filter(key => !catalogs.get(locale).has(key));
  if (missing.length) errors.push(`${locale}: ${missing.length} claves ausentes (${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', …' : ''})`);
}

const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html') && !ignoredPages.has(file));
for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/js\/global-injector\.js/.test(source)) errors.push(`${file}: no carga el shell global.`);
  if (/js\/global-language\.js/.test(source)) errors.push(`${file}: carga global-language.js directamente.`);
  for (const match of source.matchAll(/data-i18n(?:-(?:placeholder|title|aria-label|alt))?="([^"]+)"/g)) {
    if (!catalogs.get('es').has(match[1])) errors.push(`${file}: clave inexistente ${match[1]}.`);
  }
  const visibleText = [...source.matchAll(/>([^<>{}\n][^<>{}]*)</g)]
    .map(match => match[1].replace(/\s+/g, ' ').trim())
    .filter(value => value.length > 2 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(value));
  const unkeyedCount = visibleText.length - [...source.matchAll(/data-i18n(?:-[\w-]+)?=/g)].length;
  if (unkeyedCount > 0) warnings.push({ file, unkeyedVisibleTextEstimate: unkeyedCount });
}

const dynamicFiles = fs.readdirSync(path.join(root, 'js')).filter(file => file.endsWith('.js'));
for (const file of dynamicFiles) {
  const source = fs.readFileSync(path.join(root, 'js', file), 'utf8');
  const hardcoded = [...source.matchAll(/(?:textContent|innerHTML|insertAdjacentHTML)\s*=\s*(?:`|'|")([^\n]{3,})/g)].length;
  if (hardcoded) warnings.push({ file: `js/${file}`, hardcodedDynamicTextEstimate: hardcoded });
}

const report = { generatedAt: new Date().toISOString(), pages: htmlFiles.length, baseKeys: baseKeys.length, errors, warnings };
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'i18n-audit.json'), JSON.stringify(report, null, 2));
console.log(`I18N audit: ${htmlFiles.length} páginas, ${baseKeys.length} claves base, ${errors.length} errores, ${warnings.length} advertencias editoriales.`);
errors.forEach(error => console.error(`- ${error}`));
if (errors.length) process.exitCode = 1;
