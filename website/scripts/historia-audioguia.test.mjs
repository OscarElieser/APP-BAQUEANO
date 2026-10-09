#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: la biblioteca sonora de historia.html solo puede narrar hechos
 *    con fuente; un capítulo sin fuente, sin traducción o con un tipo que
 *    mezcle tradición oral con historia rompe la regla "no data = no invention".
 * ⚙️ CÓMO: carga js/historia-audioguia-data.js sin navegador y cruza capítulos,
 *    períodos, chips de historia.html y claves de locales/*.json.
 * 📦 QUÉ: `node scripts/historia-audioguia.test.mjs` (npm run test:audioguia).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh'];
const TYPES = new Set(['historical_fact', 'heritage', 'oral_tradition']);

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/territories-data.js'), sandbox);
vm.runInContext(read('js/historia-audioguia-data.js'), sandbox);
const territoryIds = new Set((sandbox.window.BAQUEANO_TERRITORIES || []).map((t) => t.id));
const { periods = [], chapters = [] } = sandbox.window.BAQUEANO_HISTORY_AUDIO || {};
const catalogs = Object.fromEntries(LANGS.map((lang) => [lang, JSON.parse(read(`locales/${lang}.json`))]));
const get = (catalog, key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), catalog);

const errors = [];
const fail = (message) => errors.push(message);
const requireKey = (key, where) => {
  for (const lang of LANGS) {
    const value = get(catalogs[lang], key);
    if (typeof value !== 'string' || !value.trim()) fail(`${where}: falta "${key}" en ${lang}.`);
  }
};

const html = read('historia.html');
const periodIds = new Set(periods.map((p) => p.id));
for (const period of periods) {
  requireKey(period.label, `período ${period.id}`);
  if (!html.includes(`data-period="${period.id}"`)) fail(`historia.html: falta el chip data-period="${period.id}".`);
  if (!chapters.some((c) => c.period === period.id)) fail(`período ${period.id} sin capítulos.`);
}

const seen = new Set();
for (const chapter of chapters) {
  const where = `capítulo ${chapter.id}`;
  if (seen.has(chapter.id)) fail(`${where}: id duplicado.`);
  seen.add(chapter.id);
  if (!periodIds.has(chapter.period)) fail(`${where}: período "${chapter.period}" inexistente.`);
  if (!TYPES.has(chapter.type)) fail(`${where}: tipo "${chapter.type}" inválido.`);
  requireKey(`pages.historia.audio.chapters.${chapter.id}.title`, where);
  requireKey(`pages.historia.audio.chapters.${chapter.id}.text`, where);
  requireKey(`pages.historia.audio.types.${chapter.type}`, where);
  if (!Array.isArray(chapter.sources) || !chapter.sources.length) fail(`${where}: sin fuente (no se narra sin fuente).`);
  for (const source of chapter.sources || []) {
    if (!String(source.name || '').trim()) fail(`${where}: fuente sin nombre.`);
    if (!/^https:\/\/[^\s]+$/.test(String(source.url || ''))) fail(`${where}: fuente sin URL https ("${source.name}").`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(chapter.verifiedAt || ''))) fail(`${where}: sin fecha de verificación.`);
  if (chapter.date && !/^\d{4}-\d{2}-\d{2}$/.test(chapter.date)) fail(`${where}: fecha con formato inválido.`);
  if (chapter.dept && !territoryIds.has(chapter.dept)) fail(`${where}: departamento "${chapter.dept}" inexistente.`);
}
// Chips sin capítulo (p. ej. un período de tradición oral sin relatos) no deben quedar visibles.
for (const match of html.matchAll(/data-period="([^"]+)"/g)) if (!periodIds.has(match[1])) fail(`historia.html: chip "${match[1]}" sin período en los datos.`);
for (const key of ['counter', 'pause', 'end', 'noVoice', 'next', 'map', 'sources', 'verified', 'people', 'chaptersLabel']) requireKey(`pages.historia.audio.${key}`, 'interfaz');
for (const asset of ['js/historia-audioguia-data.js', 'js/historia-audioguia.js']) if (!html.includes(asset)) fail(`historia.html: no carga ${asset}.`);

if (errors.length) {
  console.error(`❌ Biblioteca sonora: ${errors.length} problemas\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✅ Biblioteca sonora: ${chapters.length} capítulos en ${periods.length} períodos, todos con fuente https, fecha de verificación y ${LANGS.length} idiomas.`);
