// ============================================================================
// 🧭 BAQUEANO — EXPORTA LOS TERRITORIOS DE LA WEB A LA APP ANDROID
// ============================================================================
// 🎯 POR QUÉ: la Web y la APK deben mostrar la misma información de los 17
//   territorios (franja viva de lugares con descripción propia, AGENTS.md
//   regla 8). Copiar a mano duplicaría datos y terminarían divergiendo.
// ⚙️ CÓMO: lee `js/territories-data.js` (fuente única) y escribe
//   `assets/data/territories_places.json` en la raíz del proyecto Flutter.
//   Los IDs se normalizan al formato de Supabase (`nueva-segovia` →
//   `nueva_segovia`). Solo se exportan coordenadas de lugar si existen y son
//   válidas: nunca se usa el centro del departamento como posición de un lugar.
//   Con `--check` no escribe: falla si el asset está desactualizado (CI).
// 📦 QUÉ: `npm run export:app-territories` / `npm run test:app-territories`.
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../js/territories-data.js');
const target = resolve(here, '../../assets/data/territories_places.json');

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(source, 'utf8'), sandbox, { filename: source });
const territories = sandbox.window.BAQUEANO_TERRITORIES;
if (!Array.isArray(territories) || territories.length === 0) {
  console.error('❌ No se encontró window.BAQUEANO_TERRITORIES en territories-data.js');
  process.exit(1);
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const coord = (value, min, max) => (Number.isFinite(value) && value >= min && value <= max ? value : null);

const exported = {
  source: 'website/js/territories-data.js',
  territories: territories.map((territory) => {
    const places = (territory.places || [])
      .map((place) => {
        const lat = coord(place.lat ?? place.latitude, 10.6, 15.1);
        const lng = coord(place.lng ?? place.longitude, -87.8, -82.5);
        return {
          name: text(place.name),
          type: text(place.type),
          desc: text(place.desc),
          ...(lat !== null && lng !== null ? { lat, lng } : {}),
        };
      })
      .filter((place) => place.name && place.desc);
    return {
      id: String(territory.id).replace(/-/g, '_'),
      webId: territory.id,
      name: text(territory.name),
      tagline: text(territory.tagline),
      shortDesc: text(territory.shortDesc),
      bestSeason: text(territory.bestSeason),
      howToReach: text(territory.howToReach),
      places,
      gastronomy: (territory.gastronomy || [])
        .map((dish) => ({ name: text(dish.name), desc: text(dish.desc) }))
        .filter((dish) => dish.name),
      activities: (territory.activities || []).map(text).filter(Boolean),
    };
  }),
};

const json = `${JSON.stringify(exported, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(target, 'utf8'); } catch (_) { /* no existe */ }
  if (current !== json) {
    console.error('❌ assets/data/territories_places.json está desactualizado. Ejecutá: npm run export:app-territories');
    process.exit(1);
  }
  const places = exported.territories.reduce((sum, t) => sum + t.places.length, 0);
  console.log(`✅ App y Web comparten ${exported.territories.length} territorios y ${places} lugares con descripción propia.`);
} else {
  writeFileSync(target, json);
  console.log(`Exportado: ${target}`);
}
