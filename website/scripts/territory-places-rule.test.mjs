#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: REGLA DEL PROYECTO (AGENTS.md, "Franja viva de lugares"): los
 *    15 departamentos y las 2 regiones autónomas —y cualquier territorio que se
 *    agregue— deben tener bajo su mapa la franja de lugares en movimiento
 *    automático y una ficha informativa al tocar cada lugar, con información
 *    PROPIA de ese lugar. Esta prueba impide que un territorio quede sin ella.
 * ⚙️ CÓMO: lee los datos reales (js/territories-data.js) y el módulo del mapa
 *    (js/madriz-territory-map.js) sin navegador; verifica datos, comportamiento
 *    y que las tres plantillas de mapa tengan su franja.
 * 📦 QUÉ: `node scripts/territory-places-rule.test.mjs` (CI: deploy-production).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const REQUIRED = ['leon', 'chinandega', 'managua', 'masaya', 'carazo', 'rivas', 'granada', 'esteli', 'madriz',
  'nueva-segovia', 'jinotega', 'matagalpa', 'chontales', 'boaco', 'rio-san-juan', 'raccn', 'raccs'];

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/territories-data.js'), sandbox);
const territories = sandbox.window.BAQUEANO_TERRITORIES || [];
const errors = [];
const fail = (message) => errors.push(message);

// 1. Datos: los 17 territorios, cada uno con lugares completos.
for (const id of REQUIRED) if (!territories.some((t) => t.id === id)) fail(`Falta el territorio "${id}".`);
let placeCount = 0;
for (const territory of territories) {
  const places = Array.isArray(territory.places) ? territory.places : [];
  if (places.length < 2) fail(`${territory.id}: necesita al menos 2 lugares en la franja (tiene ${places.length}).`);
  for (const place of places) {
    placeCount += 1;
    const where = `${territory.id} · ${place.name || '(sin nombre)'}`;
    if (!String(place.name || '').trim()) fail(`${territory.id}: lugar sin nombre.`);
    if (!String(place.type || '').trim()) fail(`${where}: falta "type" (categoría de la ficha).`);
    if (!/^fa-[a-z0-9-]+$/.test(String(place.icon || ''))) fail(`${where}: "icon" debe ser un ícono fa-*.`);
    const desc = String(place.desc || '').trim();
    if (desc.length < 40) fail(`${where}: falta "desc" (descripción propia de al menos 40 caracteres).`);
    if (/\b(lorem|ipsum|xxx|tbd|placeholder)\b/i.test(desc)) fail(`${where}: "desc" parece texto de relleno.`);
  }
  if (!String(territory.bestSeason || '').trim()) fail(`${territory.id}: falta "bestSeason" (Mejor época en la ficha).`);
  if (!String(territory.howToReach || '').trim()) fail(`${territory.id}: falta "howToReach" (Cómo llegar en la ficha).`);
}

// 2. Comportamiento: el módulo único del mapa mantiene la franja viva y la ficha.
const map = read('js/madriz-territory-map.js');
[
  ['startAutoplay(', 'avance automático de la franja'],
  ['prefers-reduced-motion', 'respeto a "reducir movimiento"'],
  ['IntersectionObserver', 'pausa fuera de pantalla'],
  ["'pointerenter'", 'pausa al pasar el mouse'],
  ['function openPlaceInfo(', 'ficha informativa al tocar'],
  ['openPlaceInfo(place, card)', 'la tarjeta y el pin abren la ficha'],
  ['place.desc', 'la ficha usa la descripción propia del lugar'],
  ["key === 'Escape'", 'cerrar la ficha con Escape'],
  ['stopAutoplay();', 'limpieza al cambiar de territorio']
].forEach(([needle, label]) => { if (!map.includes(needle)) fail(`Mapa: falta ${label} (${needle}).`); });

// 3. Plantillas: toda vista de mapa territorial tiene su franja.
[
  ['departamento.html', 'territoryMapPlacesCarousel'],
  ['js/madriz-experience.js', 'id="mapPlacesCarousel"'],
  ['js/chinandega-experience.js', 'chinandegaMapPlacesCarousel']
].forEach(([file, needle]) => { if (!read(file).includes(needle)) fail(`${file}: falta la franja (${needle}).`); });
const css = read('css/pages/departamento.css');
['.map-places-carousel.is-autoplaying', '.map-place-info {'].forEach((needle) => { if (!css.includes(needle)) fail(`CSS: falta ${needle}.`); });

if (errors.length) {
  console.error(`❌ Regla "Franja viva de lugares" incumplida (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`✅ Regla "Franja viva de lugares": ${territories.length} territorios y ${placeCount} lugares con franja automática y ficha informativa propia.`);
