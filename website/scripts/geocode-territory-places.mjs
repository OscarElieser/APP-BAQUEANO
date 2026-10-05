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
// - Nombres compuestos ("San Juan del Sur y Cristo de la Misericordia",
//   "Laguna La Bruja (Las Sabanas)"): si el nombre completo no aparece, se
//   prueban sus partes, el municipio entre paréntesis y el nombre sin prefijos
//   genéricos. Esos puntos se marcan `approx: true` (el mapa lo indica).
// - Los lugares ya ubicados se conservan: solo se consultan los pendientes.
//
// 📦 QUÉ:
// - data/territory-places.json: { territories: { id: [{ name, lat, lng,
//   osm, label, approx? }] }, unresolved: { id: [nombres] } } con atribución ODbL.
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

const GENERIC_PREFIX = /^(centro hist[oó]rico( y| &)?|ciudad de|comunidad(es)? ind[ií]gena(s)?( de)?|comunidades|pueblo ganadero de|valle f[eé]rtil de|artesan[ií]as de|talleres? de cer[aá]mica de|aguas termales( de)?|playas? de|cascadas?|saltos?|cerros?( y)?|cuevas?|humedales de|muelle de|antigua|bah[ií]a de|isla|reserva( de biosfera| natural| silvestre privada)?|parque (natural|arqueol[oó]gico)|mirador|fincas? (agroecol[oó]gicas? )?de|f[aá]bricas de|galer[ií]a de|murales|centro ecotur[ií]stico|refugio)\s+/i;

// Variantes de búsqueda, de la más precisa a la más general.
function nameVariants(raw) {
  const exact = searchName(raw);
  const variants = [{ q: exact, approx: false }];
  const add = (value, approx = true) => {
    const v = searchName(value).replace(GENERIC_PREFIX, '').trim();
    if (v.length >= 4 && !variants.some((x) => x.q.toLowerCase() === v.toLowerCase())) variants.push({ q: v, approx });
  };
  exact.split(/\s*(?:&|\by\b|–|—|,|\/)\s*/).filter(Boolean).forEach((part) => add(part));
  add(exact);
  (String(raw).match(/\(([^)]+)\)/g) || []).map((m) => m.slice(1, -1)).filter((m) => !/\d/.test(m)).forEach((m) => add(m));
  return variants;
}

// Una coincidencia parcial no puede ser otra cosa: "Maderas" (playa) no es el
// Volcán Maderas; "Catedral de Granada" no es un hotel que la menciona.
const FOREIGN_KINDS = [
  { re: /^volc[aá]n\b/i, unless: /volc[aá]n/i },
  { re: /\b(hotel|hostal|hostel|posada|restaurante?|bar|tienda|farmacia)\b/i, unless: /\b(hotel|hostal|hostel|posada|restaurante?|bar|tienda|farmacia)\b/i }
];
const HOSPITALITY_TYPES = new Set(['hotel', 'guest_house', 'hostel', 'motel', 'restaurant', 'bar', 'cafe', 'fast_food', 'shop', 'supermarket', 'pharmacy']);
function plausible(placeName, label, type) {
  if (HOSPITALITY_TYPES.has(String(type || '')) && !FOREIGN_KINDS[1].unless.test(placeName)) return false;
  return !FOREIGN_KINDS.some((rule) => rule.re.test(String(label || '').split(',')[0].trim()) && !rule.unless.test(placeName));
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

let previous = { territories: {} };
try { previous = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (_) { /* primera ejecución */ }

for (const territory of territories) {
  const feature = boundaries.features.find((f) => f.properties.id === territory.id);
  if (!feature) { console.warn(`Sin contorno: ${territory.id}`); continue; }
  const bbox = feature.properties.bbox;
  result.territories[territory.id] = [];
  result.unresolved[territory.id] = [];
  for (const place of territory.places || []) {
    // Coordenada con fuente en territories-data.js (catálogo geográfico 2026-10-05):
    // se usa tal cual si cae dentro del contorno; no se consulta Nominatim.
    if (Number.isFinite(place.lat) && Number.isFinite(place.lng) && insideFeature(feature, place.lat, place.lng)) {
      result.territories[territory.id].push({ name: place.name, lat: place.lat, lng: place.lng, source: 'catalog', label: place.name, ...(place.precision !== 'exact' ? { approx: true } : {}) });
      continue;
    }
    const known = (previous.territories?.[territory.id] || []).find((p) => p.name === place.name
      && insideFeature(feature, p.lat, p.lng) && plausible(place.name, p.label));
    if (known) { result.territories[territory.id].push(known); continue; }
    let match = null;
    let approx = false;
    for (const variant of nameVariants(place.name)) {
      for (const q of [`${variant.q}, ${territory.name}, Nicaragua`, `${variant.q}, Nicaragua`]) {
        const candidates = await query(q, bbox);
        await sleep(DELAY_MS);
        match = (Array.isArray(candidates) ? candidates : []).find((c) => insideFeature(feature, Number(c.lat), Number(c.lon))
          && plausible(place.name, c.display_name, c.type));
        if (match) break;
      }
      if (match) { approx = variant.approx; break; }
    }
    if (match) {
      result.territories[territory.id].push({
        name: place.name,
        lat: Math.round(Number(match.lat) * 1e5) / 1e5,
        lng: Math.round(Number(match.lon) * 1e5) / 1e5,
        osm: `${match.osm_type}/${match.osm_id}`,
        label: String(match.display_name || '').split(',').slice(0, 3).join(',').trim(),
        ...(approx ? { approx: true } : {})
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
