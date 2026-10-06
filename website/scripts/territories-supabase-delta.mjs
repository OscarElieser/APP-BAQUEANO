#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: la web (territories-data.js + coordenadas geocodificadas) avanza más rápido que
 *   Supabase. Reenviar los 625 KB del SQL completo en cada sincronización es lento y
 *   propenso a errores. Hace falta el DELTA exacto entre lo que publica la web y lo que
 *   tiene la base.
 * ⚙️ CÓMO: reutiliza buildImport() del importador oficial (mismas reglas: sin precios, sin
 *   pines "exact" inventados, municipio solo con coincidencia inequívoca) y lo compara con
 *   una instantánea de la base:
 *     select 'p' k, legacy_key, latitude, longitude, location_precision, municipality_id,
 *            verification_status, map_ready, updated_by, md5(coalesce(description,'')) d, source_url
 *     from public.places where legacy_source='territories-data.js'
 *     union all (lo mismo para public.businesses)
 *   Genera UPDATE … FROM (VALUES …) solo de las filas que cambiaron, y solo si la fila
 *   no fue editada en Ops Center (updated_by = 'migration:territories'). Las filas que
 *   faltan en la base se listan para insertarlas con el SQL completo. No borra nada.
 * 📦 QUÉ: `node scripts/territories-supabase-delta.mjs <snapshot.json> [out.sql]`
 *   → SQL de delta (por defecto en stdout) + resumen en stderr.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImport, loadTerritories, loadMunicipalities, loadGeocoded } from './migrate-territories-to-supabase.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [snapshotFile, outFile] = process.argv.slice(2);
if (!snapshotFile) { console.error('Uso: node scripts/territories-supabase-delta.mjs <snapshot.json> [out.sql]'); process.exit(2); }

// La instantánea puede venir cruda del conector MCP (texto con el JSON entre marcas).
const raw = fs.readFileSync(snapshotFile, 'utf8');
let text = raw;
try { const outer = JSON.parse(raw); if (outer && typeof outer.result === 'string') text = outer.result; } catch (e) { /* ya es JSON plano */ }
const start = text.indexOf('['); const end = text.lastIndexOf(']');
const rows = JSON.parse(text.slice(start, end + 1));
const db = new Map(rows.map((r) => [`${r.k}|${r.legacy_key}`, r]));

const existingFile = path.join(ROOT, 'website/scripts/data/supabase-existing-entities.json');
const existing = fs.existsSync(existingFile) ? JSON.parse(fs.readFileSync(existingFile, 'utf8')) : { businesses: [], destinations: [] };
const { places, businesses } = buildImport({ territories: loadTerritories(), municipalities: loadMunicipalities(), existing, geocoded: loadGeocoded() });

const md5 = (s) => crypto.createHash('md5').update(String(s || ''), 'utf8').digest('hex');
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const qn = (v) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : 'null');
const near = (a, b) => (a == null && b == null) || (a != null && b != null && Math.abs(Number(a) - Number(b)) < 1e-7);

function diff(kind, list) {
  const changed = []; const missing = []; const lockedByOps = [];
  for (const rec of list) {
    const cur = db.get(`${kind}|${rec.legacy_key}`);
    if (!cur) { missing.push(rec.legacy_key); continue; }
    const fields = [];
    if (!near(cur.latitude, rec.latitude) || !near(cur.longitude, rec.longitude)) fields.push('coordenadas');
    if ((cur.location_precision || null) !== (rec.location_precision || null)) fields.push('precisión');
    if ((cur.municipality_id || null) !== (rec.municipality_id || null)) fields.push('municipio');
    if ((cur.verification_status || null) !== (rec.verification_status || null)) fields.push('verificación');
    if (Boolean(cur.map_ready) !== Boolean(rec.map_ready)) fields.push('map_ready');
    if ((cur.source_url || null) !== (rec.source_url || null)) fields.push('fuente');
    if (cur.d !== md5(rec.description)) fields.push('descripción');
    if (!fields.length) continue;
    if (cur.updated_by !== 'migration:territories') { lockedByOps.push({ key: rec.legacy_key, fields }); continue; }
    changed.push({ rec, fields });
  }
  return { changed, missing, lockedByOps };
}

function updateSql(table, changed) {
  if (!changed.length) return '';
  const values = changed.map(({ rec }) => `(${q(rec.legacy_key)}, ${qn(rec.latitude)}::double precision, ${qn(rec.longitude)}::double precision, ${q(rec.location_precision)}, ${rec.map_ready ? 'true' : 'false'}, ${q(rec.municipality_id)}, ${q(rec.zone_text)}, ${q(rec.verification_status)}, ${rec.verified_at ? `${q(rec.verified_at)}::timestamptz` : 'null::timestamptz'}, ${q(rec.source_name)}, ${q(rec.source_url)}, ${q(JSON.stringify(rec.attributes || {}))}::jsonb, ${q(rec.description)})`);
  const zone = table === 'places' ? 'zone_text = v.zone_text,' : 'municipality = v.zone_text,';
  return `update public.${table} t set latitude = v.lat, longitude = v.lng, location_precision = v.prec, map_ready = v.ready,
  municipality_id = v.muni, ${zone} verification_status = v.status, verified_at = v.verified_at,
  source_name = v.source_name, source_url = v.source_url, attributes = v.attributes, description = v.description, updated_at = now()
from (values
${values.join(',\n')}
) as v(legacy_key, lat, lng, prec, ready, muni, zone_text, status, verified_at, source_name, source_url, attributes, description)
where t.legacy_source = 'territories-data.js' and t.legacy_key = v.legacy_key and t.updated_by = 'migration:territories';
`;
}

// Cambios solo geográficos (coordenadas/precisión/municipio): UPDATE compacto que no reenvía
// descripciones; attributes.geo_source se agrega con || (fusión jsonb, no reemplaza).
const GEO_ONLY = new Set(['coordenadas', 'precisión', 'municipio', 'map_ready']);
function geoSql(table, changed) {
  if (!changed.length) return '';
  const values = changed.map(({ rec }) => `(${q(rec.legacy_key)}, ${qn(rec.latitude)}::double precision, ${qn(rec.longitude)}::double precision, ${q(rec.location_precision)}, ${rec.map_ready ? 'true' : 'false'}, ${q(rec.municipality_id)}, ${q(rec.zone_text)}, ${rec.attributes && rec.attributes.geo_source ? `${q(JSON.stringify(rec.attributes.geo_source))}::jsonb` : 'null::jsonb'})`);
  const zone = table === 'places' ? 'zone_text = v.zone_text,' : 'municipality = v.zone_text,';
  return `update public.${table} t set latitude = v.lat, longitude = v.lng, location_precision = v.prec, map_ready = v.ready,
  municipality_id = v.muni, ${zone} attributes = case when v.geo is null then t.attributes else coalesce(t.attributes, '{}'::jsonb) || jsonb_build_object('geo_source', v.geo) end, updated_at = now()
from (values
${values.join(',\n')}
) as v(legacy_key, lat, lng, prec, ready, muni, zone_text, geo)
where t.legacy_source = 'territories-data.js' and t.legacy_key = v.legacy_key and t.updated_by = 'migration:territories';
`;
}
const split = (changed) => ({ geo: changed.filter((c) => c.fields.every((f) => GEO_ONLY.has(f))), full: changed.filter((c) => !c.fields.every((f) => GEO_ONLY.has(f))) });
const p = diff('p', places); const b = diff('b', businesses);
const ps = split(p.changed); const bs = split(b.changed);
const sql = [`-- Delta territories-data.js → Supabase (${new Date().toISOString()}). Generado por website/scripts/territories-supabase-delta.mjs. Sin borrados.`,
  geoSql('places', ps.geo), updateSql('places', ps.full), geoSql('businesses', bs.geo), updateSql('businesses', bs.full)].filter(Boolean).join('\n');
if (outFile) fs.writeFileSync(outFile, sql); else process.stdout.write(sql);
const count = (list) => list.reduce((acc, c) => { c.fields.forEach((f) => { acc[f] = (acc[f] || 0) + 1; }); return acc; }, {});
console.error(JSON.stringify({ places: { cambiados: p.changed.length, faltan: p.missing, editados_en_ops: p.lockedByOps.length, campos: count(p.changed) },
  businesses: { cambiados: b.changed.length, faltan: b.missing, editados_en_ops: b.lockedByOps.length, campos: count(b.changed) }, bytes: sql.length }, null, 1));
