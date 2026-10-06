/**
 * 🧭 BAQUEANO — NÚCLEO DE IMPORTACIÓN MARENA (lib/marena-import.mjs)
 *
 * 🎯 POR QUÉ: los cuatro importadores (áreas, planes, normativas+vedas, accesos)
 *   deben aplicar las mismas reglas: no inventar, no duplicar, no publicar.
 * ⚙️ CÓMO:
 *   - Fuentes versionadas en scripts/data/marena/*.json (cada dato con su URL
 *     oficial y fecha de consulta) + instantánea de places publicados.
 *   - Cruce área ↔ lugar existente por nombre normalizado SIN palabras de
 *     categoría; más de un candidato → no se enlaza (se reporta).
 *   - SQL idempotente: upsert por clave natural (legacy_key / area_key /
 *     regulation_key / especie+período) y nunca pisa una fila editada en Ops
 *     Center (updated_by distinto del importador).
 *   - Importar ≠ publicar (Fase 34): todo entra con is_published = false y en
 *     estado partial/pending/conflicting; verificar y publicar es manual.
 * 📦 QUÉ: export { loadMarenaData, matchAreas, build*Sql, runCli }.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DATA = path.join(ROOT, 'website/scripts/data/marena');
export const OUT_DIR = path.join(ROOT, 'supabase/imports/marena');
export const REPORT_DIR = path.join(ROOT, 'website/docs/data-migration');
export const IMPORTER = 'import:marena';
export const LEGACY_SOURCE = 'marena-planes-de-manejo';

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
export function loadMarenaData() {
  return {
    plans: readJson('management-plans.json'),
    vedas: readJson('vedas-2026.json'),
    regulations: readJson('regulations.json'),
    access: readJson('access-points.json'),
    snapshot: readJson('places-snapshot.json'),
  };
}

// ── Utilidades SQL ─────────────────────────────────────────────────────────────
export const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const qn = (v) => (v === null || v === undefined || !Number.isFinite(v) ? 'null' : String(v));
const qd = (v) => (v ? `${q(v)}::date` : 'null');
const qts = (v) => (v ? `${q(v)}::timestamptz` : 'null');
export const normalize = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// ── Cruce área ↔ lugar existente ─────────────────────────────────────────────
const CATEGORY_WORDS = new Set(['reserva', 'natural', 'nacional', 'parque', 'refugio', 'vida', 'silvestre', 'monumento', 'historico', 'paisaje',
  'terrestre', 'protegido', 'recursos', 'geneticos', 'complejo', 'volcanico', 'biosfera', 'biologica', 'de', 'del', 'la', 'las', 'el', 'los', 'y',
  'cerro', 'cerros', 'volcan', 'laguna', 'isla', 'estero', 'serrania', 'serranias', 'macizo', 'rio', 'humedales', 'privada', 'area']);
const core = (v) => normalize(v).split(' ').filter((t) => t.length > 2 && !CATEGORY_WORDS.has(t));
const NATURAL = new Set(['reserva', 'parque', 'volcan', 'laguna', 'lago', 'isla', 'rio', 'cerro', 'cascada', 'canon', 'area_protegida', 'humedal', 'manglar', 'bosque']);

// Enlace automático SOLO si el lugar ya es un área protegida (por nombre o categoría)
// y el núcleo del nombre coincide exactamente. Un volcán o una laguna como atractivo
// no es la misma entidad legal que el área: queda como "posible misma entidad" para
// que una persona decida en Ops Center (nunca se fusiona solo).
const PROTECTED_NAME = /\b(reserva|parque nacional|refugio|monumento|paisaje terrestre)\b/;
const sameSet = (a, b) => a.size === b.size && [...a].every((t) => b.has(t));

export function matchAreas(plans, snapshot) {
  const candidates = snapshot.places.filter((p) => NATURAL.has(p.category));
  return plans.map((plan) => {
    const a = new Set(core(plan.official_name));
    const related = candidates.filter((place) => {
      const b = new Set(core(place.name));
      if (!a.size || !b.size) return false;
      const inter = [...a].filter((t) => b.has(t)).length;
      return inter === a.size || (inter / (a.size + b.size - inter)) >= 0.6;
    });
    const strict = related.filter((place) => sameSet(a, new Set(core(place.name)))
      && (PROTECTED_NAME.test(normalize(place.name)) || ['reserva', 'parque', 'area_protegida'].includes(place.category)));
    const match = strict.length === 1 ? strict[0] : null;
    return {
      plan,
      match,
      ambiguous: strict.length > 1 ? strict.map((h) => h.id) : [],
      possibleSameEntity: match ? [] : related.map((h) => ({ id: h.id, name: h.name, published: h.is_published })),
    };
  });
}

const PLACE_CATEGORY = { parque_nacional: 'parque', reserva_natural: 'reserva', refugio_vida_silvestre: 'reserva', reserva_recursos_geneticos: 'reserva' };
const placeIdFor = (m) => (m.match ? m.match.id : `pl-marena-${m.plan.area_key}`);

// ── 1. Áreas protegidas (places nuevos sin publicar + ficha legal + fuente) ──
export function buildAreasSql({ plans, snapshot }) {
  const verifiedAt = plans.source.retrieved_at;
  const matches = matchAreas(plans.plans, snapshot);
  const sql = [];
  for (const m of matches) {
    const { plan } = m;
    const placeId = placeIdFor(m);
    if (!m.match) {
      // Lugar nuevo: identidad oficial confirmada, ubicación desconocida → sin publicar, sin pin.
      sql.push(`insert into public.places (id, slug, name, category, place_type, location_precision, map_ready, is_published, verification_status, verified_at, source_name, source_url, source_type, legacy_source, legacy_key, created_by, updated_by)
values (${q(placeId)}, ${q(`marena-${plan.area_key}`)}, ${q(plan.official_name)}, ${q(PLACE_CATEGORY[plan.official_category] || 'area_protegida')}, 'protected_area', 'missing', false, false, 'partial', ${qts(verifiedAt)}, ${q(plans.source.source_name)}, ${q(plan.plan_page_url)}, 'official', ${q(LEGACY_SOURCE)}, ${q(plan.area_key)}, ${q(IMPORTER)}, ${q(IMPORTER)})
on conflict (legacy_source, legacy_key) where legacy_key is not null do update set name = excluded.name, source_url = excluded.source_url
where public.places.updated_by = ${q(IMPORTER)};`);
    }
    const status = plan.status === 'conflicting' ? 'conflicting' : 'partial';
    sql.push(`insert into public.protected_area_details (place_id, official_name, official_name_as_published, official_category, legal_framework, ownership_type, source_url, verified_at, verification_status, notes, created_by, updated_by)
values (${q(placeId)}, ${q(plan.official_name)}, ${q(plan.official_name_as_published)}, ${q(plan.official_category)}, null, 'unknown', ${q(plan.plan_page_url)}, ${qts(verifiedAt)}, ${q(status)}, ${q(plan.notes.join(' ') || null)}, ${q(IMPORTER)}, ${q(IMPORTER)})
on conflict (place_id) do update set official_name = excluded.official_name, official_name_as_published = excluded.official_name_as_published,
  official_category = excluded.official_category, source_url = excluded.source_url, verified_at = excluded.verified_at,
  verification_status = excluded.verification_status, notes = excluded.notes
where public.protected_area_details.updated_by = ${q(IMPORTER)};`);
    sql.push(`insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, retrieved_at, notes)
values ('protected_area', ${q(placeId)}, ${q(`MARENA — ${plan.plan_title}`)}, ${q(plan.plan_page_url)}, 'management_plan', ${qts(verifiedAt)}, ${q(IMPORTER)}, 'MARENA', ${q(plan.plan_title)}, ${qts(verifiedAt)}, 'Identidad y categoría legal confirmadas en el listado oficial de planes de manejo.')
on conflict (entity_type, entity_id, source_name, source_url) do nothing;`);
  }
  return { sql, matches };
}

// ── 2. Planes de manejo ────────────────────────────────────────────────────────
export function buildPlansSql({ plans, snapshot }) {
  const verifiedAt = plans.source.retrieved_at;
  const sql = matchAreas(plans.plans, snapshot).map((m) => {
    const p = m.plan;
    return `insert into public.management_plans (place_id, area_key, title, title_as_published, document_url, document_qr_url, approval_reference, gazette_reference, gazette_url, source_name, source_url, verified_at, status, notes, created_by, updated_by)
values (${q(placeIdFor(m))}, ${q(p.area_key)}, ${q(p.plan_title)}, ${q(`Plan de Manejo ${p.official_name_as_published}`)}, ${q(p.document_url)}, null, ${q(p.approval_reference)}, ${q(p.gazette_reference)}, ${q(p.gazette_url)}, ${q(plans.source.source_name)}, ${q(p.plan_page_url)}, ${qts(verifiedAt)}, ${q(p.status === 'conflicting' ? 'conflicting' : 'partial')}, ${q(p.notes.join(' ') || null)}, ${q(IMPORTER)}, ${q(IMPORTER)})
on conflict (area_key, source_url) do update set place_id = excluded.place_id, title = excluded.title, document_url = excluded.document_url,
  approval_reference = excluded.approval_reference, gazette_reference = excluded.gazette_reference, gazette_url = excluded.gazette_url,
  verified_at = excluded.verified_at, status = excluded.status, notes = excluded.notes
where public.management_plans.updated_by = ${q(IMPORTER)};`;
  });
  return { sql };
}

// ── 3. Normativas + vedas ─────────────────────────────────────────────────────
export function buildRegulationsSql({ regulations, vedas }) {
  const at = regulations.retrieved_at;
  // Primero las que no reemplazan a otra (FK superseded_by).
  const ordered = [...regulations.regulations].sort((a, b) => (a.superseded_by ? 1 : 0) - (b.superseded_by ? 1 : 0));
  const sql = ordered.map((r) => `insert into public.environmental_regulations (regulation_key, title, document_type, institution, publication_reference, publication_date, effective_date, source_url, applies_to, summary, superseded_by, verified_at, status)
values (${q(r.regulation_key)}, ${q(r.title)}, ${q(r.document_type)}, ${q(r.institution)}, ${q(r.publication_reference || null)}, ${qd(r.publication_date)}, ${qd(r.effective_date)}, ${q(r.source_url || null)}, ${q(r.applies_to || null)}, ${q(r.summary)}, ${q(r.superseded_by || null)}, ${r.status === 'verified' ? qts(at) : 'null'}, ${q(r.status)})
on conflict (regulation_key) do update set title = excluded.title, publication_reference = excluded.publication_reference, publication_date = excluded.publication_date,
  effective_date = excluded.effective_date, source_url = excluded.source_url, applies_to = excluded.applies_to, summary = excluded.summary,
  superseded_by = excluded.superseded_by, verified_at = excluded.verified_at, status = excluded.status;`);
  sql.push(`insert into public.verification_sources (entity_type, entity_id, source_name, source_url, source_type, verified_at, verified_by, institution, document_title, document_date, retrieved_at)
values ('environmental_regulation', 'rm-016-2026-vedas', 'La Gaceta, Diario Oficial No. 29 (16-02-2026)', ${q(vedas.source.source_url)}, 'regulation', ${qts(at)}, ${q(IMPORTER)}, 'MARENA', ${q(vedas.source.document_title)}, ${qd(vedas.source.publication_date)}, ${qts(at)})
on conflict (entity_type, entity_id, source_name, source_url) do nothing;`);
  for (const w of vedas.restrictions) {
    const status = /conflicting/i.test(w.note || '') ? 'conflicting' : 'verified';
    sql.push(`insert into public.wildlife_restrictions (regulation_key, year, species_group, species_name, common_name, restriction_type, period_text, start_date, end_date, note, source_url, source_date, verified_at, status)
values ('rm-016-2026-vedas', ${vedas.year}, ${q(w.group)}, ${q(w.scientific_name)}, ${q(w.common_name)}, ${q(w.restriction_type)}, ${q(w.period_text)}, ${qd(w.start_date)}, ${qd(w.end_date)}, ${q(w.note || null)}, ${q(vedas.source.source_url)}, ${qd(vedas.source.publication_date)}, ${qts(at)}, ${q(status)})
on conflict (regulation_key, species_group, species_name, common_name, period_text) do update set start_date = excluded.start_date, end_date = excluded.end_date,
  note = excluded.note, verified_at = excluded.verified_at, status = excluded.status;`);
  }
  return { sql };
}

// ── 4. Puntos de acceso (solo verificados con fuente) ────────────────────────
export function buildAccessPointsSql({ access, plans, snapshot }) {
  const byArea = new Map(matchAreas(plans.plans, snapshot).map((m) => [m.plan.area_key, placeIdFor(m)]));
  const rejected = [];
  const sql = [];
  for (const a of access.access_points) {
    const placeId = byArea.get(a.area_key);
    const problems = [];
    if (!placeId) problems.push('área desconocida');
    if (!/^https:\/\//.test(a.source_url || '')) problems.push('sin fuente https');
    if (!a.verified_at) problems.push('sin fecha de verificación');
    if (!(a.latitude >= 10.5 && a.latitude <= 15.2 && a.longitude >= -88 && a.longitude <= -82.5)) problems.push('coordenadas fuera de Nicaragua');
    if (problems.length) { rejected.push({ ...a, problems }); continue; }
    sql.push(`insert into public.access_points (place_id, name, latitude, longitude, access_type, source_url, verified_at, status, map_ready)
values (${q(placeId)}, ${q(a.name)}, ${qn(a.latitude)}, ${qn(a.longitude)}, ${q(a.access_type)}, ${q(a.source_url)}, ${qts(a.verified_at)}, 'verified', true)
on conflict do nothing;`);
  }
  return { sql, rejected };
}

// ── CLI compartida ─────────────────────────────────────────────────────────────
const HEADER = (title, count) => `-- ============================================================================
-- 🧭 BAQUEANO — IMPORTACIÓN MARENA: ${title} (GENERADO — NO editar a mano)
-- 🎯 Fuente oficial trazable. ⚙️ Generado por website/scripts/import-marena-*.mjs; idempotente.
-- 📦 ${count} sentencias. Importar ≠ publicar: nada queda is_published = true.
-- ⚠️ Requiere 20261005090000_environmental_marena_module.sql. Ejecutar en UNA transacción y SOLO con autorización.
-- ============================================================================
`;

export function runCli({ name, title, build, reportExtra }) {
  const args = new Set(process.argv.slice(2));
  const data = loadMarenaData();
  const result = build(data);
  const body = `${HEADER(title, result.sql.length)}${result.sql.join('\n')}\n`;
  const file = path.join(OUT_DIR, `${name}.sql`);
  if (args.has('--check')) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (current !== body) { console.error(`❌ ${path.relative(ROOT, file)} desactualizado: ejecutá node website/scripts/import-${name}.mjs`); process.exit(1); }
    console.log(`✅ ${path.relative(ROOT, file)} al día (${result.sql.length} sentencias).`);
    return result;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(file, body);
  const report = { generated_from: 'website/scripts/data/marena', statements: result.sql.length, ...(reportExtra ? reportExtra(result, data) : {}) };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, `${name}-report.json`), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`🧪 Modo prueba: ${result.sql.length} sentencias → ${path.relative(ROOT, file)}`);
  if (args.has('--apply')) {
    if (!args.has('--confirm') || !process.env.DATABASE_URL) {
      console.error('⛔ --apply exige --confirm y DATABASE_URL (solo con autorización del propietario).');
      process.exit(2);
    }
    const run = spawnSync('psql', [process.env.DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-1', '-f', file], { stdio: 'inherit' });
    process.exit(run.status ?? 1);
  }
  return result;
}
