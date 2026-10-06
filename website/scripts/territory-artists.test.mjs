#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: cada artista debe aparecer en Historia dentro de su territorio y
 *    en la guía de ese departamento o región, siempre traducido a los 6 idiomas.
 *    Esta prueba impide un artista sin territorio real, sin clave o huérfano.
 * ⚙️ CÓMO: carga js/territory-artists-data.js y js/territories-data.js en un
 *    contexto aislado (sin navegador) y cruza ids y claves con locales/*.json;
 *    revisa además que historia.html y departamento.html carguen el módulo.
 * 📦 QUÉ: `node scripts/territory-artists.test.mjs` (npm run test:artistas).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];
const BASE = 'pages.historia.artistas.';

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/territories-data.js'), sandbox);
vm.runInContext(read('js/territory-artists-data.js'), sandbox);
const territoryIds = new Set((sandbox.window.BAQUEANO_TERRITORIES || []).map((t) => t.id));
const { groups = [], artists = [] } = sandbox.window.BAQUEANO_TERRITORY_ARTISTS || {};
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

if (artists.length < 14) fail(`Se esperaban al menos 14 artistas (hay ${artists.length}).`);
const groupIds = new Set(groups.map((g) => g.id));
for (const group of groups) {
  if (!territoryIds.has(group.id)) fail(`Grupo "${group.id}" no es un territorio de js/territories-data.js.`);
  requireKey(`${BASE}groups.${group.id}`, `grupo ${group.id}`);
  if (!artists.some((a) => a.group === group.id)) fail(`Grupo "${group.id}" sin artistas.`);
}

const seen = new Set();
for (const artist of artists) {
  const where = `artista ${artist.id || '(sin id)'}`;
  if (seen.has(artist.id)) fail(`${where}: id duplicado.`);
  seen.add(artist.id);
  if (!String(artist.name || '').trim()) fail(`${where}: sin nombre.`);
  if (!groupIds.has(artist.group)) fail(`${where}: grupo "${artist.group}" inexistente.`);
  if (!Array.isArray(artist.depts) || !artist.depts.length) fail(`${where}: sin territorios (depts).`);
  else {
    if (!artist.depts.includes(artist.group)) fail(`${where}: su grupo de Historia debe estar en depts.`);
    for (const id of artist.depts) if (!territoryIds.has(id)) fail(`${where}: territorio "${id}" inexistente.`);
  }
  if (!artist.locality && !artist.localityKey) fail(`${where}: sin localidad.`);
  if (artist.localityKey) requireKey(artist.localityKey, where);
  requireKey(`${BASE}disciplines.${artist.discipline}`, where);
  requireKey(`${BASE}items.${artist.id}.milestone`, where);
}

for (const key of ['kicker', 'title', 'subtitle', 'note', 'deptLink', 'deptTitle', 'deptSubtitle', 'historiaLink']) requireKey(BASE + key, 'sección');

const historia = read('historia.html');
const departamento = read('departamento.html');
for (const [file, html] of [['historia.html', historia], ['departamento.html', departamento]]) {
  for (const asset of ['js/territory-artists-data.js', 'js/territory-artists.js', 'css/components/territory-artists.css']) {
    if (!html.includes(asset)) fail(`${file}: no carga ${asset}.`);
  }
}
if (!historia.includes('id="territoryArtistsGroups"')) fail('historia.html: falta #territoryArtistsGroups.');
if (!departamento.includes('id="territoryArtistsSection"') || !departamento.includes('id="territoryArtistsGrid"')) fail('departamento.html: falta el bloque de artistas.');
if (!departamento.includes('BaqueanoTerritoryArtists.render(dept)')) fail('departamento.html: no pinta artistas al cambiar de territorio.');

if (errors.length) {
  console.error(`❌ Artistas por territorio: ${errors.length} problemas\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✅ Artistas por territorio: ${artists.length} artistas en ${groups.length} territorios, 6 idiomas, ambas páginas conectadas.`);
