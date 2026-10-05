#!/usr/bin/env node
/**
 * 🧭 BAQUEANO — IMPORTADOR territories-data.js → Supabase (places + businesses)
 *
 * 🎯 POR QUÉ: Supabase es la fuente principal de verdad. Los 266 lugares que la
 *   web publica viven solo en js/territories-data.js; hay que llevarlos a
 *   Supabase sin duplicar, sin perder información y sin inventar datos.
 * ⚙️ CÓMO (parser → normalización → validación → SQL idempotente):
 *   1. Lee territories-data.js en un sandbox VM (sin ejecutar nada del sitio) y
 *      los 153 municipios del seed oficial (20261005051000_territory_municipalities.sql).
 *   2. Clasifica: hospedajes, restaurantes, comedores y kioscos → businesses; el
 *      resto → places. Categoría: la del catálogo o inferida del tipo; si no es
 *      clara → "atractivo" (no se adivina).
 *   3. Normaliza: slug único, departamento (nueva-segovia → nueva_segovia),
 *      municipio enlazado SOLO con coincidencia inequívoca (si no, zone_text),
 *      coordenadas dentro de Nicaragua (fuera → se descartan y se reporta),
 *      map_ready solo con pin exacto, verification_status desde la fuente
 *      (sin fuente → pending_review), fuentes → verification_sources.
 *      Precios: NUNCA en places/businesses; el texto de precio de la fuente queda
 *      como nota fechada para estructurarlo en `prices` desde Ops Center.
 *   4. Duplicados: misma clave heredada (territorio + nombre normalizado) dentro
 *      de la fuente; nombre normalizado igual a un registro existente de
 *      Supabase en el mismo departamento (no se inserta: se reporta); nombre
 *      parecido o pin a < 150 m → se inserta y se reporta para revisión.
 *   5. Genera SQL idempotente: INSERT … ON CONFLICT (legacy_source, legacy_key)
 *      DO UPDATE solo si el registro no fue editado en Ops Center
 *      (updated_by = 'migration:territories'). Reejecutar no duplica.
 * 📦 QUÉ:
 *   node scripts/migrate-territories-to-supabase.mjs            → dry-run: reporte + SQL
 *   node scripts/migrate-territories-to-supabase.mjs --check    → falla si el SQL versionado está desactualizado
 *   DATABASE_URL=… node scripts/migrate-territories-to-supabase.mjs --apply --confirm
 *     → ejecuta el SQL con psql (SOLO con autorización del propietario).
 *   Salidas: ../supabase/imports/20261005_territories_import.sql y
 *            docs/data-migration/territories-import-report.json
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_FILE = path.join(ROOT, 'website/js/territories-data.js');
const MUNI_SEED = path.join(ROOT, 'supabase/migrations/20261005051000_territory_municipalities.sql');
const EXISTING = path.join(ROOT, 'website/scripts/data/supabase-existing-entities.json');
const SQL_OUT = path.join(ROOT, 'supabase/imports/20261005_territories_import.sql');
const REPORT_OUT = path.join(ROOT, 'website/docs/data-migration/territories-import-report.json');
const LEGACY_SOURCE = 'territories-data.js';
const MIGRATOR = 'migration:territories';
const RUN_KEY = 'territories-2026-10-05';
const args = new Set(process.argv.slice(2));

// ── Utilidades ────────────────────────────────────────────────────────────────
export const normalize = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
export const slugify = (v) => normalize(v).replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90).replace(/-+$/g, '');
const STOP = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'a', 'al', 'san', 'santa', 'restaurante', 'hotel', 'comedor', 'kiosco', 'reserva', 'natural', 'volcan', 'laguna', 'playa', 'rio', 'isla']);
const tokens = (v) => new Set(normalize(v).split(' ').filter((t) => t.length > 2 && !STOP.has(t)));
function jaccard(a, b) {
  const A = tokens(a); const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0; A.forEach((t) => { if (B.has(t)) inter += 1; });
  return inter / (A.size + B.size - inter);
}
function meters(a, b) {
  const R = 6371000; const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat); const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const inNicaragua = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= 10.5 && lat <= 15.2 && lng >= -88 && lng <= -82.5;
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const qj = (v) => `${q(JSON.stringify(v))}::jsonb`;
const qn = (v) => (v === null || v === undefined || !Number.isFinite(v) ? 'null' : String(v));
const qb = (v) => (v ? 'true' : 'false');

// ── Categorías ────────────────────────────────────────────────────────────────
const BUSINESS_CATEGORIES = new Set(['hospedaje', 'restaurante', 'comedor', 'kiosco']);
const PLACE_CATEGORIES = new Set(['playa', 'rio', 'isla', 'cascada', 'laguna', 'lago', 'volcan', 'cerro', 'reserva', 'cueva', 'canon', 'mirador', 'parque',
  'museo', 'sitio_historico', 'centro_cultural', 'mercado', 'turismo_rural', 'turismo_comunitario', 'agroturismo', 'atractivo']);
// Orden importa: la primera regla que coincide gana. Solo palabras explícitas del tipo o nombre.
const INFER = [
  [/\bmuseo\b/, 'museo'], [/\bmercado\b/, 'mercado'], [/\bplaya\b|\bsurf\b/, 'playa'], [/\bcascada|salto\b/, 'cascada'],
  [/\bcueva|\bcanon\b|\bcañon\b/, 'cueva'], [/\bmirador\b/, 'mirador'], [/\bvolcan|crater|caldera/, 'volcan'], [/\blaguna\b/, 'laguna'],
  [/\blago\b/, 'lago'], [/\bisla|isleta|archipielago/, 'isla'], [/\brio\b|\bnavegacion\b/, 'rio'], [/\breserva\b|refugio|humedal|bosque nuboso/, 'reserva'],
  [/\bparque\b|area protegida|geoparque|geositio/, 'parque'], [/\bcerro\b|\bmonta[nñ]a\b/, 'cerro'],
  [/turismo rural y comunitario|turismo comunitario|comunidad/, 'turismo_comunitario'], [/agroturismo|cafetal|finca/, 'agroturismo'],
  [/turismo rural/, 'turismo_rural'], [/patrimonio|historia|colonial|catedral|iglesia|arqueolog|petroglifo|fortaleza|memoria/, 'sitio_historico'],
  [/cultura|musica|arte|teatro|literatura|artesania|alfareria/, 'centro_cultural']
];
export function placeCategory(place) {
  if (place.category && PLACE_CATEGORIES.has(place.category)) return { category: place.category, inferred: false };
  const hay = normalize(`${place.type || ''} ${place.name || ''}`);
  for (const [re, cat] of INFER) if (re.test(hay)) return { category: cat, inferred: true };
  return { category: 'atractivo', inferred: true };
}
export function businessType(place) {
  const v = place.verification || {};
  if (place.category === 'hospedaje') {
    const lt = normalize(v.lodgingType || place.type);
    if (/hostel|hostal/.test(lt)) return 'hostal';
    if (/treehouse|arbol/.test(lt)) return 'casa_arbol';
    if (/eco/.test(lt)) return 'ecolodge';
    if (/resort/.test(lt)) return 'resort';
    if (/caba/.test(lt)) return 'cabana';
    if (/hotel/.test(lt)) return 'hotel';
    return 'hospedaje';
  }
  return place.category; // restaurante | comedor | kiosco
}
function sourceType(src) {
  const url = String(src.url || '').toLowerCase(); const label = normalize(src.label);
  if (/\.gob\.ni|intur|marena|mined|inatec|inifom|ineter/.test(url) || /intur|marena|alcaldia|gobierno|inifom|ineter/.test(label)) return 'government';
  if (/wikidata\.org/.test(url)) return 'wikidata';
  if (/openstreetmap|mapcarta|osm\.org/.test(url) || /openstreetmap|mapcarta/.test(label)) return 'osm';
  if (/sitio oficial|official/.test(label)) return 'business_official';
  if (/near-place|restaurantguru|tripadvisor|google/.test(url) || /google business|directorio/.test(label)) return 'directory';
  return 'media';
}

// ── Municipios (seed oficial, mismos 153 de Supabase) ───────────────────────────
export function loadMunicipalities(file = MUNI_SEED) {
  const sql = fs.readFileSync(file, 'utf8');
  const rx = /\(\s*'([a-z0-9_]+__[a-z0-9_]+)'\s*,\s*'([a-z_]+)'\s*,\s*'((?:[^']|'')+)'/g;
  const list = []; let m;
  while ((m = rx.exec(sql))) list.push({ id: m[1], department_id: m[2], name: m[3].replace(/''/g, "'") });
  return list;
}
export function matchMunicipality(text, departmentId, municipalities) {
  if (!text) return null;
  const candidates = municipalities.filter((mu) => mu.department_id === departmentId);
  const t = normalize(text);
  const exact = candidates.filter((mu) => normalize(mu.name) === t);
  if (exact.length === 1) return exact[0].id;
  // "Altagracia / Balgüe, Isla de Ometepe" → Altagracia: el nombre del municipio aparece completo y es el único.
  const contained = candidates.filter((mu) => new RegExp(`(^| )${normalize(mu.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(t));
  if (contained.length === 1) return contained[0].id;
  return null;
}

// ── Transformación ───────────────────────────────────────────────────────────
export function buildImport({ territories, municipalities, existing }) {
  const report = {
    run_key: RUN_KEY, generated_at: null, source: `website/js/${LEGACY_SOURCE}`,
    totals: { total_fuente_original: 0, places: 0, businesses: 0, total_insertados: 0, total_actualizados: 0, total_duplicados: 0,
      total_pendientes: 0, total_parciales: 0, total_verificados: 0, total_sin_coordenadas: 0, total_coordenadas_descartadas: 0,
      total_sin_fuente: 0, total_map_ready: 0, total_sin_municipio: 0, total_categoria_inferida: 0, total_notas_precio: 0 },
    duplicates: [], review: [], discarded_coordinates: [], unmatched_municipalities: [], existing_without_source: []
  };
  const places = []; const businesses = []; const sources = [];
  const seenKeys = new Set(); const slugs = new Map();
  const existingAll = [...(existing.businesses || []).map((e) => ({ ...e, kind: 'business' })), ...(existing.destinations || []).map((e) => ({ ...e, kind: 'destination' }))];
  (existing.businesses || []).filter((b) => !b.source_url).forEach((b) => report.existing_without_source.push({ id: b.id, name: b.name }));

  function uniqueSlug(base, departmentId) {
    let slug = base || 'lugar';
    if (slugs.has(slug)) slug = `${base}-${departmentId.replace(/_/g, '-')}`;
    let n = 2; const root = slug;
    while (slugs.has(slug)) { slug = `${root}-${n}`; n += 1; }
    slugs.set(slug, true);
    return slug;
  }

  for (const territory of territories) {
    const departmentId = String(territory.id).replace(/-/g, '_');
    for (const place of territory.places || []) {
      report.totals.total_fuente_original += 1;
      const v = place.verification || null;
      const nameNorm = normalize(place.name);
      const legacyKey = `${territory.id}::${nameNorm}`;
      const isBusiness = BUSINESS_CATEGORIES.has(place.category);
      if (seenKeys.has(legacyKey)) {
        report.totals.total_duplicados += 1;
        report.duplicates.push({ reason: 'misma_clave_en_fuente', territory: territory.id, name: place.name });
        continue;
      }
      seenKeys.add(legacyKey);

      // Duplicado exacto con registros ya existentes en Supabase (mismo departamento).
      const exactExisting = existingAll.find((e) => e.department_id === departmentId && normalize(e.name) === nameNorm);
      if (exactExisting) {
        report.totals.total_duplicados += 1;
        report.duplicates.push({ reason: 'ya_existe_en_supabase', territory: territory.id, name: place.name, existing_id: exactExisting.id, existing_kind: exactExisting.kind });
        continue;
      }

      // Coordenadas: solo dentro de Nicaragua.
      let lat = typeof place.lat === 'number' ? place.lat : null;
      let lng = typeof place.lng === 'number' ? place.lng : null;
      if (lat !== null && !inNicaragua(lat, lng)) {
        report.totals.total_coordenadas_descartadas += 1;
        report.discarded_coordinates.push({ territory: territory.id, name: place.name, lat, lng });
        lat = null; lng = null;
      }
      const precisionRaw = place.precision || (v && v.precision) || (lat !== null ? 'approximate' : 'missing');
      const precision = ['exact', 'reference', 'approximate', 'centroid', 'address', 'pending', 'missing'].includes(precisionRaw) ? precisionRaw : 'approximate';
      const mapReady = lat !== null && precision === 'exact' && !(v && v.mapReady === false);
      if (lat === null) report.totals.total_sin_coordenadas += 1;
      if (mapReady) report.totals.total_map_ready += 1;

      // Verificación (sin fuente → pendiente; con pin pendiente → partial).
      const srcList = (v && Array.isArray(v.sources) ? v.sources : []).filter((s) => s && s.label);
      let status = 'pending_review';
      if (v && srcList.length) status = (v.verificationStatus === 'partial' || v.status === 'verified_pin_pending') ? 'partial' : 'verified';
      if (!srcList.length) report.totals.total_sin_fuente += 1;
      if (status === 'pending_review') report.totals.total_pendientes += 1;
      if (status === 'partial') report.totals.total_parciales += 1;
      if (status === 'verified') report.totals.total_verificados += 1;
      const verifiedAt = status === 'pending_review' ? null : (v.verifiedAt || v.checkedAt || null);
      const primary = srcList.find((s) => s.url) || srcList[0] || null;

      const zone = (v && (v.zone || v.municipality)) || null;
      const municipalityId = matchMunicipality(zone, departmentId, municipalities);
      if (!municipalityId) {
        report.totals.total_sin_municipio += 1;
        if (zone) report.unmatched_municipalities.push({ territory: territory.id, name: place.name, zone });
      }

      // Revisión de posibles duplicados (no se descarta nada automáticamente).
      for (const e of existingAll) {
        if (e.department_id !== departmentId) continue;
        const sim = jaccard(e.name, place.name);
        const near = lat !== null && e.latitude != null && meters({ lat, lng }, { lat: e.latitude, lng: e.longitude }) < 150;
        if (sim >= 0.5 || near) report.review.push({ territory: territory.id, name: place.name, similar_to: e.id, existing_name: e.name, similarity: Number(sim.toFixed(2)), near_150m: near });
      }

      const attributes = {};
      if (v) {
        ['activities', 'services', 'hours', 'modality', 'facts', 'note', 'map'].forEach((k) => { if (v[k]) attributes[k] = v[k]; });
        if (Array.isArray(v.amenities) && v.amenities.length) attributes.amenities = v.amenities;
        if (v.contact) attributes.contact_note = v.contact;
        if (v.price) {
          // Precio = dato dinámico: se conserva como nota fechada, nunca como precio vigente.
          attributes.price_note = { text: v.price, checked_at: v.checkedAt || v.verifiedAt || null, status: 'por_estructurar_en_prices' };
          report.totals.total_notas_precio += 1;
        }
      }
      const desc = String(place.desc || '').trim();
      const short = desc.split(/(?<=[.!?])\s/)[0].slice(0, 200);
      const slug = uniqueSlug(slugify(place.name), departmentId);
      const common = {
        slug, name: place.name, department_id: departmentId, municipality_id: municipalityId, zone_text: municipalityId ? null : zone,
        description: desc, latitude: lat, longitude: lng, location_precision: precision, map_ready: mapReady, address: (v && v.address) || null,
        verification_status: status, verified_at: verifiedAt, source_name: primary ? String(primary.label).slice(0, 300) : null,
        source_url: primary && /^https?:\/\/\S+$/.test(primary.url || '') ? primary.url : null, attributes, legacy_key: legacyKey,
        type_label: place.type || null, icon: place.icon || null, short_description: short
      };
      if (isBusiness) {
        report.totals.businesses += 1;
        const phones = (v && Array.isArray(v.phones)) ? v.phones : [];
        businesses.push({ ...common, id: `biz-${slug}`, business_type: businessType(place), category: place.category,
          phone: phones[0] || null, whatsapp: (v && v.whatsapp) || null, email: (v && v.email) || null,
          website_url: v && /^https?:\/\/\S+$/.test(v.website || '') ? v.website : null });
      } else {
        report.totals.places += 1;
        const cat = placeCategory(place);
        if (cat.inferred) report.totals.total_categoria_inferida += 1;
        places.push({ ...common, id: `pl-${slug}`, category: cat.category, subcategory: place.category && !PLACE_CATEGORIES.has(place.category) ? place.category : null });
      }
      const entityType = isBusiness ? 'business' : 'place';
      const entityId = isBusiness ? `biz-${slug}` : `pl-${slug}`;
      for (const s of srcList) {
        const vAt = (v && (v.verifiedAt || v.checkedAt)) || null;
        if (!vAt) continue;
        sources.push({ entity_type: entityType, entity_id: entityId, source_name: String(s.label).slice(0, 300),
          source_url: /^https?:\/\/\S+$/.test(s.url || '') ? s.url : null, source_type: sourceType(s), verified_at: vAt });
      }
      report.totals.total_insertados += 1;
    }
  }
  return { places, businesses, sources, report };
}

// ── SQL idempotente ───────────────────────────────────────────────────────────
export function toSql({ places, businesses, sources, report }) {
  const lines = [];
  lines.push('-- ============================================================================');
  lines.push('-- 🧭 BAQUEANO — IMPORTACIÓN territories-data.js → places / businesses (GENERADO)');
  lines.push('-- 🎯 Una sola fuente de verdad. ⚙️ Generado por website/scripts/migrate-territories-to-supabase.mjs;');
  lines.push('--    idempotente (ON CONFLICT legacy_source+legacy_key) y no pisa ediciones hechas en Ops Center.');
  lines.push(`-- 📦 ${places.length} places · ${businesses.length} businesses · ${sources.length} fuentes. NO editar a mano.`);
  lines.push('-- ⚠️ Requiere 20261005070000 y 20261005080000 aplicadas. Ejecutar SOLO con autorización del propietario.');
  lines.push('-- ============================================================================');
  lines.push('begin;');
  for (const p of places) {
    lines.push(`insert into public.places (id, slug, name, category, subcategory, type_label, icon, department_id, municipality_id, zone_text, description, short_description, latitude, longitude, location_precision, map_ready, address, verification_status, verified_at, source_name, source_url, source_type, attributes, is_published, legacy_source, legacy_key, created_by, updated_by)
values (${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.category)}, ${q(p.subcategory)}, ${q(p.type_label)}, ${q(p.icon)}, ${q(p.department_id)}, ${q(p.municipality_id)}, ${q(p.zone_text)}, ${q(p.description)}, ${q(p.short_description)}, ${qn(p.latitude)}, ${qn(p.longitude)}, ${q(p.location_precision)}, ${qb(p.map_ready)}, ${q(p.address)}, ${q(p.verification_status)}, ${p.verified_at ? `${q(p.verified_at)}::timestamptz` : 'null'}, ${q(p.source_name)}, ${q(p.source_url)}, ${p.source_name ? "'other'" : 'null'}, ${qj(p.attributes)}, true, ${q(LEGACY_SOURCE)}, ${q(p.legacy_key)}, ${q(MIGRATOR)}, ${q(MIGRATOR)})
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set
  name = excluded.name, category = excluded.category, subcategory = excluded.subcategory, type_label = excluded.type_label, icon = excluded.icon,
  municipality_id = excluded.municipality_id, zone_text = excluded.zone_text, description = excluded.description, short_description = excluded.short_description,
  latitude = excluded.latitude, longitude = excluded.longitude, location_precision = excluded.location_precision, map_ready = excluded.map_ready,
  address = excluded.address, verification_status = excluded.verification_status, verified_at = excluded.verified_at, source_name = excluded.source_name,
  source_url = excluded.source_url, attributes = excluded.attributes
where public.places.updated_by = ${q(MIGRATOR)};`);
  }
  for (const b of businesses) {
    lines.push(`insert into public.businesses (id, slug, name, category, business_type, department_id, municipality_id, municipality, description, latitude, longitude, location_precision, map_ready, address, phone, whatsapp, email, website_url, verification_status, verified, verified_at, source_name, source_url, source_type, attributes, status, legacy_source, legacy_key, created_by, updated_by)
values (${q(b.id)}, ${q(b.slug)}, ${q(b.name)}, ${q(b.category)}, ${q(b.business_type)}, ${q(b.department_id)}, ${q(b.municipality_id)}, ${q(b.zone_text)}, ${q(b.description)}, ${qn(b.latitude)}, ${qn(b.longitude)}, ${q(b.location_precision)}, ${qb(b.map_ready)}, ${q(b.address)}, ${q(b.phone)}, ${q(b.whatsapp)}, ${q(b.email)}, ${q(b.website_url)}, ${q(b.verification_status)}, ${qb(b.verification_status === 'verified')}, ${b.verified_at ? `${q(b.verified_at)}::timestamptz` : 'null'}, ${q(b.source_name)}, ${q(b.source_url)}, ${b.source_name ? "'other'" : 'null'}, ${qj(b.attributes)}, 'published', ${q(LEGACY_SOURCE)}, ${q(b.legacy_key)}, ${q(MIGRATOR)}, ${q(MIGRATOR)})
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set
  name = excluded.name, business_type = excluded.business_type, municipality_id = excluded.municipality_id, description = excluded.description,
  latitude = excluded.latitude, longitude = excluded.longitude, location_precision = excluded.location_precision, map_ready = excluded.map_ready,
  address = excluded.address, phone = excluded.phone, whatsapp = excluded.whatsapp, email = excluded.email, website_url = excluded.website_url,
  verification_status = excluded.verification_status, verified = excluded.verified, verified_at = excluded.verified_at,
  source_name = excluded.source_name, source_url = excluded.source_url, attributes = excluded.attributes
where public.businesses.updated_by = ${q(MIGRATOR)};`);
  }
  for (const s of sources) {
    lines.push(`insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, expires_at, verified_by, status)
values (${q(s.entity_type)}, ${q(s.entity_id)}, ${q(s.source_name)}, ${q(s.source_url)}, ${q(s.source_type)}, ${q(s.verified_at)}::timestamptz, ${q(s.verified_at)}::timestamptz + interval '1 year', ${q(MIGRATOR)}, 'active')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;`);
  }
  lines.push(`insert into public.data_migration_runs (run_key, source, mode, finished_at, totals, status)
values (${q(RUN_KEY)}, ${q(report.source)}, 'apply', now(), ${qj(report.totals)}, 'ok')
on conflict (run_key) do update set finished_at = now(), totals = excluded.totals, status = 'ok';`);
  lines.push('commit;');
  return `${lines.join('\n')}\n`;
}

// ── Ejecución ─────────────────────────────────────────────────────────────────
function loadTerritories(file = DATA_FILE) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { timeout: 5000 });
  const t = sandbox.window.BAQUEANO_TERRITORIES;
  return Array.isArray(t) ? t : Object.values(t || {});
}

function main() {
  const territories = loadTerritories();
  const municipalities = loadMunicipalities();
  const existing = fs.existsSync(EXISTING) ? JSON.parse(fs.readFileSync(EXISTING, 'utf8')) : { businesses: [], destinations: [] };
  if (territories.length !== 17) throw new Error(`Se esperaban 17 territorios y hay ${territories.length}.`);
  if (municipalities.length !== 153) throw new Error(`Se esperaban 153 municipios en el seed y hay ${municipalities.length}.`);
  const result = buildImport({ territories, municipalities, existing });
  const t = result.report.totals;
  // Debe cuadrar: cada registro de la fuente termina insertado o descartado como duplicado.
  if (t.total_insertados + t.total_duplicados !== t.total_fuente_original) throw new Error('Los totales no cuadran.');
  if (t.places + t.businesses !== t.total_insertados) throw new Error('places + businesses ≠ insertados.');
  const sql = toSql(result);
  if (args.has('--check')) {
    const current = fs.existsSync(SQL_OUT) ? fs.readFileSync(SQL_OUT, 'utf8') : '';
    if (current !== sql) { console.error('❌ supabase/imports/20261005_territories_import.sql está desactualizado. Ejecutá: node scripts/migrate-territories-to-supabase.mjs'); process.exit(1); }
    console.log(`✅ SQL de importación al día (${t.places} places · ${t.businesses} businesses).`);
    return;
  }
  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_OUT), { recursive: true });
  fs.writeFileSync(SQL_OUT, sql, 'utf8');
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify({ ...result.report, generated_at: undefined }, null, 2)}\n`, 'utf8');
  console.log('📦 Importación territories-data.js → Supabase (dry-run, no toca la base):');
  Object.entries(t).forEach(([k, val]) => console.log(`   ${k.padEnd(32)} ${val}`));
  console.log(`   revisión de posibles duplicados  ${result.report.review.length}`);
  console.log(`   SQL: ${path.relative(ROOT, SQL_OUT)} · Reporte: ${path.relative(ROOT, REPORT_OUT)}`);

  if (args.has('--apply')) {
    if (!args.has('--confirm') || !process.env.DATABASE_URL) {
      console.error('⛔ --apply requiere --confirm y DATABASE_URL (solo con autorización del propietario).');
      process.exit(2);
    }
    const run = spawnSync('psql', [process.env.DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-f', SQL_OUT], { stdio: 'inherit' });
    if (run.status !== 0) process.exit(run.status || 1);
    console.log('✅ Importación aplicada. Validá conteos con: select public.data_source_status();');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
