// ============================================================================
// 🧭 BAQUEANO — GEOCODIFICACIÓN ÚNICA DE LOS LUGARES DE CADA TERRITORIO
// ============================================================================
// 🎯 POR QUÉ:
// - El mapa de departamento.html geocodificaba los 181 lugares de la guía en
//   el navegador de cada visitante (Nominatim, 1 consulta/s). Era lento, la
//   CSP lo bloqueaba y un nombre ambiguo podía ubicarse en OTRO departamento.
//
// ⚙️ CÓMO:
// - Lee js/territories-data.js (lugares) y data/nicaragua-departments.geojson
//   (contornos oficiales geoBoundaries ADM1).
// - Consulta Nominatim (OpenStreetMap) restringido al rectángulo del
//   territorio (viewbox + bounded=1), respeta 1 consulta por segundo y acepta
//   un resultado SOLO si cae dentro del polígono del territorio.
// - Se ejecuta en GitHub Actions (.github/workflows/geocode-territories.yml),
//   no en el navegador del usuario.
//
// 📦 QUÉ:
// - data/territory-places.json: { territories: { id: [{ name, lat, lng,
//   osm, label }] }, unresolved: { id: [nombres] } } con atribución ODbL.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'territory-places.json');
const USER_AGENT = 'BAQUEANO-territory-geocoder/1.0 (+https://baqueanonicaragua.com)';
const DELAY_MS = 1100;

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'territories-data.js'), 'utf8'), sandbox);
const territories = sandbox.window.BAQUEANO_TERRITORIES || [];
const boundaries = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'nicaragua-departments.geojson'), 'utf8'));

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function insideFeature(feature, lat, lng) {
  const g = feature.geometry;
  const polygons = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polygons.some((rings) => pointInRing([lng, lat], rings[0]) && !rings.slice(1).some((hole) => pointInRing([lng, lat], hole)));
}

function searchName(value) {
  return String(value || '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/^(reserva silvestre|reserva natural|monumento nacional|parque nacional)\s+/i, '')
    .replace(/^museo nacional\s+/i, 'Museo ')
    .replace(/\s*\/\s*.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function query(q, bbox) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', 'ni');
  url.searchParams.set('accept-language', 'es');
  url.searchParams.set('viewbox', bbox.join(','));
  url.searchParams.set('bounded', '1');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
      if (response.status === 429) { await sleep(5000); continue; }
      if (!response.ok) return [];
      return await response.json();
    } catch (_) {
      await sleep(2000);
    }
  }
  return [];
}

const result = {
  generatedAt: new Date().toISOString(),
  source: 'OpenStreetMap Nominatim — © OpenStreetMap contributors (ODbL). Contornos: geoBoundaries ADM1 (CC BY 4.0).',
  rule: 'Cada punto se acepta solo si cae dentro del contorno oficial de su territorio.',
  territories: {},
  unresolved: {}
};

for (const territory of territories) {
  const feature = boundaries.features.find((f) => f.properties.id === territory.id);
  if (!feature) { console.warn(`Sin contorno: ${territory.id}`); continue; }
  const bbox = feature.properties.bbox;
  result.territories[territory.id] = [];
  result.unresolved[territory.id] = [];
  for (const place of territory.places || []) {
    const name = searchName(place.name);
    let match = null;
    for (const q of [`${name}, ${territory.name}, Nicaragua`, `${name}, Nicaragua`]) {
      const candidates = await query(q, bbox);
      await sleep(DELAY_MS);
      match = (Array.isArray(candidates) ? candidates : []).find((c) => insideFeature(feature, Number(c.lat), Number(c.lon)));
      if (match) break;
    }
    if (match) {
      result.territories[territory.id].push({
        name: place.name,
        lat: Math.round(Number(match.lat) * 1e5) / 1e5,
        lng: Math.round(Number(match.lon) * 1e5) / 1e5,
        osm: `${match.osm_type}/${match.osm_id}`,
        label: String(match.display_name || '').split(',').slice(0, 3).join(',').trim()
      });
      console.log(`✓ ${territory.id} · ${place.name}`);
    } else {
      result.unresolved[territory.id].push(place.name);
      console.log(`· ${territory.id} · ${place.name} (sin coincidencia dentro del territorio)`);
    }
  }
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
const ok = Object.values(result.territories).reduce((n, list) => n + list.length, 0);
const missing = Object.values(result.unresolved).reduce((n, list) => n + list.length, 0);
console.log(`\nUbicados: ${ok} · Sin ubicar: ${missing} → ${path.relative(ROOT, OUT)}`);
