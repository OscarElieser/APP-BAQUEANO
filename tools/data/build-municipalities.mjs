#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: el propietario pidió información de CADA municipio de los 15 departamentos y
 *   las 2 regiones autónomas. Hasta hoy, 151 de los 153 municipios eran solo un nombre en
 *   Supabase, sin coordenadas, y la web mostraba nombre + una frase. Regla del proyecto:
 *   nada inventado. Solo se publica lo que se puede calcular o citar.
 * ⚙️ CÓMO:
 *   1. Nombres e ids oficiales: semilla 153 municipios (supabase/migrations/20261005051000).
 *   2. Geometría: geoBoundaries gbOpen NIC ADM2 (OpenStreetMap/Wambacher, ODbL 1.0), copia
 *      en tools/data/sources/ con su sha256. Cada contorno se asigna al departamento cuyo
 *      contorno ADM1 (website/data/nicaragua-departments.geojson) contiene su punto interior,
 *      y al municipio con el MISMO nombre dentro de ese departamento. Las erratas del
 *      contorno OSM ("Dipilito", "Ciudad Darco"…) se resuelven con ALIAS revisados a mano,
 *      1 a 1. Si algo no cuadra (≠ 153 parejas únicas), el script falla.
 *   3. Datos calculados (no inventados): área geodésica en km² del contorno, punto
 *      interior ("centroid": NO es la cabecera municipal) y caja envolvente.
 *   4. Identidad curada existente (territories-data.js) y lugares de BAQUEANO dentro del
 *      municipio: los que el importador enlaza por fuente, más los que tienen pin exacto o
 *      de referencia dentro del contorno.
 *   5. Lo que no tiene fuente accesible (población, historia, fiestas patronales…) se
 *      declara `pending_verification`. Nunca se rellena.
 * 📦 QUÉ: `node tools/data/build-municipalities.mjs` → website/data/municipalities.json
 *   (lo consume js/territory-municipalities.js) y supabase/imports/20261006_municipalities_geo.sql.
 *   `--check` falla si los archivos versionados están desactualizados.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImport, loadTerritories, loadMunicipalities, loadGeocoded, normalize } from '../../website/scripts/migrate-territories-to-supabase.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ADM2_FILE = path.join(ROOT, 'tools/data/sources/geoBoundaries-NIC-ADM2_simplified.geojson');
const ADM1_FILE = path.join(ROOT, 'website/data/nicaragua-departments.geojson');
const OUT_JSON = path.join(ROOT, 'website/data/municipalities.json');
const OUT_SQL = path.join(ROOT, 'supabase/imports/20261006_municipalities_geo.sql');
const SOURCE = {
  name: 'geoBoundaries gbOpen NIC ADM2 (fuente: OpenStreetMap, Wambacher)',
  license: 'Open Data Commons Open Database License 1.0 (ODbL)',
  attribution: '© OpenStreetMap contributors · geoBoundaries (William & Mary geoLab)',
  url: 'https://github.com/wmgeolab/geoBoundaries/tree/main/releaseData/gbOpen/NIC/ADM2',
  boundaryID: 'NIC-ADM2-1004716', buildDate: '2023-12-12'
};
// Erratas del contorno OSM → nombre oficial de la semilla (revisado a mano, 2026-10-06).
const ALIAS = {
  'san juan de cinco pinos': 'cinco pinos', 'san juan de rio coco': 'san juan del rio coco', dipilito: 'dipilto',
  monzonte: 'mozonte', 'el jacaro': 'el jicaro', moyagalpa: 'moyogalpa', 'ciudad darco': 'ciudad dario',
  paiwas: 'bocana de paiwas', waspan: 'waspam', 'puerto cabezas': 'puerto cabezas bilwi',
  'desembocadura de cruz rio grande': 'desembocadura de rio grande', 'el tortugero': 'el tortuguero'
};

// ── Geometría ────────────────────────────────────────────────────────────────
const polygonsOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
function pointInRing(p, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const insideGeometry = (g, p) => polygonsOf(g).some((rings) => pointInRing(p, rings[0]) && !rings.slice(1).some((h) => pointInRing(p, h)));
// Área geodésica de un anillo (fórmula de Chamberlain & Duquette, la misma de @mapbox/geojson-area).
function ringAreaM2(ring) {
  const R = 6378137; const rad = (d) => (d * Math.PI) / 180; let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
    area += rad(x2 - x1) * (2 + Math.sin(rad(y1)) + Math.sin(rad(y2)));
  }
  return Math.abs((area * R * R) / 2);
}
const areaKm2 = (g) => polygonsOf(g).reduce((sum, rings) => sum + ringAreaM2(rings[0]) - rings.slice(1).reduce((s, h) => s + ringAreaM2(h), 0), 0) / 1e6;
function bbox(g) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  polygonsOf(g).forEach((rings) => rings[0].forEach(([x, y]) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }));
  return b.map((v) => Math.round(v * 1e5) / 1e5);
}
// Punto interior: centroide del polígono mayor; si cae fuera (forma cóncava), el punto medio
// del tramo horizontal más largo dentro del polígono a esa latitud.
function interiorPoint(g) {
  const polys = polygonsOf(g).map((rings) => ({ rings, area: ringAreaM2(rings[0]) })).sort((a, b) => b.area - a.area);
  const ring = polys[0].rings[0];
  let a = 0; let cx = 0; let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1]; const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  let p = [cx / (3 * a), cy / (3 * a)];
  if (!insideGeometry(g, p)) {
    const xs = [];
    for (let i = 0; i < ring.length - 1; i += 1) {
      const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1];
      if ((y1 > p[1]) !== (y2 > p[1])) xs.push(x1 + ((p[1] - y1) * (x2 - x1)) / (y2 - y1));
    }
    xs.sort((m, n) => m - n);
    let best = null;
    for (let i = 0; i + 1 < xs.length; i += 2) if (!best || xs[i + 1] - xs[i] > best[1] - best[0]) best = [xs[i], xs[i + 1]];
    if (best) p = [(best[0] + best[1]) / 2, p[1]];
  }
  return { lat: Math.round(p[1] * 1e5) / 1e5, lng: Math.round(p[0] * 1e5) / 1e5 };
}

// ── Construcción ─────────────────────────────────────────────────────────────
export function build() {
  const rawAdm2 = fs.readFileSync(ADM2_FILE);
  const adm2 = JSON.parse(rawAdm2.toString('utf8'));
  const adm1 = JSON.parse(fs.readFileSync(ADM1_FILE, 'utf8'));
  const seed = loadMunicipalities();
  const territories = loadTerritories();
  const cleanName = (n) => normalize(String(n).replace(/\((Municipio|Muncipio)\)/i, '').replace(/^(Municipio|Muncipio)( de)? /i, ''));

  const byId = new Map();
  for (const f of adm2.features) {
    const p = interiorPoint(f.geometry);
    const dep = adm1.features.find((d) => insideGeometry(d.geometry, [p.lng, p.lat]));
    if (!dep) throw new Error(`Contorno sin departamento: ${f.properties.shapeName}`);
    const departmentId = dep.properties.id.replace(/-/g, '_');
    const name = ALIAS[cleanName(f.properties.shapeName)] || cleanName(f.properties.shapeName);
    const match = seed.filter((m) => m.department_id === departmentId && normalize(m.name) === name);
    if (match.length !== 1) throw new Error(`Sin pareja única: ${f.properties.shapeName} [${departmentId}] → ${name} (${match.length})`);
    if (byId.has(match[0].id)) throw new Error(`Municipio repetido: ${match[0].id}`);
    byId.set(match[0].id, { feature: f, point: p, departmentId });
  }
  if (byId.size !== 153 || seed.length !== 153) throw new Error(`Se esperaban 153 parejas y hay ${byId.size}.`);

  // Lugares de BAQUEANO por municipio: enlace del importador (por fuente) + pin exacto/de referencia dentro del contorno.
  const existingFile = path.join(ROOT, 'website/scripts/data/supabase-existing-entities.json');
  const existing = fs.existsSync(existingFile) ? JSON.parse(fs.readFileSync(existingFile, 'utf8')) : { businesses: [], destinations: [] };
  const { places, businesses } = buildImport({ territories, municipalities: seed, existing, geocoded: loadGeocoded() });
  const placesByMuni = new Map();
  for (const rec of [...places, ...businesses]) {
    let muni = rec.municipality_id;
    if (!muni && rec.latitude != null && ['exact', 'reference'].includes(rec.location_precision)) {
      for (const [id, entry] of byId) if (entry.departmentId === rec.department_id && insideGeometry(entry.feature.geometry, [rec.longitude, rec.latitude])) { muni = id; break; }
    }
    if (!muni) continue;
    if (!placesByMuni.has(muni)) placesByMuni.set(muni, []);
    placesByMuni.get(muni).push(rec.name);
  }

  // Identidad curada existente en la web (sin modificarla).
  const identity = new Map();
  for (const t of territories) for (const m of t.municipalities || []) {
    const id = `${String(t.id).replace(/-/g, '_')}__`;
    const hit = seed.find((s) => s.id.startsWith(id) && normalize(s.name) === normalize(m.name));
    if (hit) identity.set(hit.id, m.identity || m.title || null);
  }

  // Chinandega tiene su experiencia propia (js/chinandega-experience.js) con una línea curada por municipio.
  const chinandegaJs = fs.readFileSync(path.join(ROOT, 'website/js/chinandega-experience.js'), 'utf8');
  for (const [, name, line] of chinandegaJs.matchAll(/\['([^']+)', '([^']+)', 'fa-[a-z-]+'\]/g)) {
    const hit = seed.find((s) => s.department_id === 'chinandega' && normalize(s.name) === normalize(name));
    if (hit && !identity.has(hit.id)) identity.set(hit.id, line.replace(/\.$/, ''));
  }

  const municipalities = seed.map((m) => {
    const entry = byId.get(m.id);
    return {
      id: m.id, department_id: m.department_id, name: m.name,
      identity: identity.get(m.id) || null,
      area_km2: Math.round(areaKm2(entry.feature.geometry) * 10) / 10,
      // Punto interior del contorno: sirve para ubicar el área, NO es la cabecera ni un pin.
      center: { ...entry.point, precision: 'centroid' },
      bbox: bbox(entry.feature.geometry),
      boundary_name_osm: entry.feature.properties.shapeName,
      places: (placesByMuni.get(m.id) || []).sort((a, b) => a.localeCompare(b, 'es')),
      pending_verification: ['population', 'history', 'festivities', 'cabecera_coordinates']
    };
  }).sort((a, b) => a.department_id.localeCompare(b.department_id) || a.name.localeCompare(b.name, 'es'));

  const json = {
    _doc: 'Generado por tools/data/build-municipalities.mjs. NO editar a mano. area_km2 y center se CALCULAN del contorno OSM, que en municipios lacustres o costeros puede incluir agua; center NO es la cabecera municipal ni un pin. identity es texto curado ya publicado en la web. Lo que figura en pending_verification aún no tiene fuente verificada.',
    source: { ...SOURCE, sha256: crypto.createHash('sha256').update(rawAdm2).digest('hex') },
    total: municipalities.length,
    municipalities
  };
  const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
  const sql = [
    '-- ============================================================================',
    '-- 🧭 BAQUEANO — 153 municipios: área y punto interior desde geoBoundaries ADM2 (GENERADO)',
    '-- 🎯 Información verificable de cada municipio sin inventar datos. ⚙️ tools/data/build-municipalities.mjs.',
    '-- 📦 Requiere 20261006040000_municipality_profile.sql. Idempotente. NO toca latitude/longitude',
    '--    (el punto interior de un contorno con agua puede caer en un lago: no es un pin). Sin borrados.',
    '-- ============================================================================',
    'update public.municipalities m set',
    '  area_km2 = v.area_km2, boundary_center_lat = v.lat, boundary_center_lng = v.lng, boundary_bbox = v.bbox,',
    '  boundary_source = v.boundary_source, boundary_source_url = v.boundary_source_url,',
    '  identity = coalesce(m.identity, v.identity), updated_at = now()',
    'from (values',
    municipalities.map((m) => `  (${q(m.id)}, ${m.area_km2}::numeric, ${m.center.lat}::double precision, ${m.center.lng}::double precision, ${q(JSON.stringify(m.bbox))}::jsonb, ${q(m.identity)}, ${q(`${SOURCE.name} · ${SOURCE.license}`)}, ${q(SOURCE.url)})`).join(',\n'),
    ') as v(id, area_km2, lat, lng, bbox, identity, boundary_source, boundary_source_url)',
    'where m.id = v.id;',
    ''
  ].join('\n');
  return { json: JSON.stringify(json, null, 1) + '\n', sql };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { json, sql } = build();
  if (process.argv.includes('--check')) {
    const ok = fs.existsSync(OUT_JSON) && fs.readFileSync(OUT_JSON, 'utf8') === json && fs.existsSync(OUT_SQL) && fs.readFileSync(OUT_SQL, 'utf8') === sql;
    if (!ok) { console.error('❌ municipalities.json o el SQL están desactualizados: node tools/data/build-municipalities.mjs'); process.exit(1); }
    console.log('✅ 153 municipios al día.');
  } else {
    fs.writeFileSync(OUT_JSON, json); fs.writeFileSync(OUT_SQL, sql);
    const data = JSON.parse(json);
    const withPlaces = data.municipalities.filter((m) => m.places.length).length;
    const withIdentity = data.municipalities.filter((m) => m.identity).length;
    const totalArea = data.municipalities.reduce((s, m) => s + m.area_km2, 0);
    console.log(`✅ ${data.total} municipios · área total ${Math.round(totalArea).toLocaleString('es')} km² · con identidad curada ${withIdentity} · con lugares BAQUEANO ${withPlaces}`);
  }
}
