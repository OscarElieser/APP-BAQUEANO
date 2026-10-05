// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: API ADMINISTRATIVA DEL OPS CENTER (baqueano-ops)
// ============================================================================
// 🎯 POR QUÉ:
// - Auditoría 2026-10-05 (docs/audit/OPS_CENTER_AUDITORIA_2026-10-05.md, C1):
//   el Ops Center no leía ni escribía datos (dependía de Firestore sin SDK).
// - Directiva del propietario (2026-10-05): Supabase es la base de datos
//   principal; Firebase solo identidad y hosting. El panel necesita UNA capa
//   de datos con autorización en el servidor, no tablas expuestas al navegador.
//
// ⚙️ CÓMO:
// 1. Token de Firebase verificado (RS256, emisor/audiencia app-baqueano).
// 2. Rol desde claim `role` o correo VERIFICADO activo en public.staff_roles.
//    Lectura: super_admin, admin, auditor. Escritura: super_admin, admin.
// 3. Solo entidades y columnas en lista blanca; validación estricta de datos.
// 4. Cada escritura deja auditoría en public.audit_logs con UID, rol, IP del
//    servidor, valor anterior, valor nuevo, resultado y origen.
// 5. Las métricas solo se informan si existen: cada una lleva `state`
//    (REAL | SIN_DATOS | NO_CONFIGURADO | ERROR) y `source`.
//
// 📦 QUÉ (POST { action, ... }):
// - Lectura (staff): whoami, overview, health, list, get, audit_list,
//   kpis (kpi_dashboard SMART), db_health (db_health_report), duplicates.
// - Escritura (admin): save, set_status (publish|unpublish|archive|restore),
//   verify (sello "Verificado por BAQUEANO" con trazabilidad), log.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
const MAX_BODY_BYTES = 128 * 1024;
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);

type Actor = { uid: string; email: string; emailVerified: boolean; role: string; canWrite: boolean };
class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// ---------------------------------------------------------------------------
// Entidades administrables (lista blanca). `write` = columnas editables.
// ---------------------------------------------------------------------------
type FieldType = "text" | "longtext" | "number" | "lat" | "lng" | "bool" | "url" | "phone" | "tags" | "status" | "id";
type Entity = {
  table: string;
  select: string;
  search?: string;
  order: string;
  softDelete?: boolean;
  statusColumn?: string;
  write?: Record<string, FieldType>;
  required?: string[];
  idPrefix?: string;
};
const ENTITIES: Record<string, Entity> = {
  destinations: {
    table: "destinations", order: "name", search: "name", softDelete: true, statusColumn: "status", idPrefix: "dest",
    select: "id,name,department_id,municipality_id,category,short_desc,description,latitude,longitude,cover_image,status,verified,confidence_status,verification_status,verified_at,last_verified_at,verification_notes,source_name,source_url,source_type,valid_until,best_season,how_to_reach,vibe_tags,hidden_gem,metadata,created_at,updated_at,deleted_at",
    write: {
      name: "text", department_id: "id", municipality_id: "id", category: "text", short_desc: "longtext", description: "longtext",
      latitude: "lat", longitude: "lng", cover_image: "url", status: "status", source_name: "text", source_url: "url",
      best_season: "longtext", how_to_reach: "longtext", vibe_tags: "tags", hidden_gem: "bool",
    },
    required: ["name", "department_id"],
  },
  businesses: {
    table: "businesses", order: "name", search: "name", softDelete: true, idPrefix: "biz",
    select: "id,name,category,department,municipality,department_id,municipality_id,status,verification_status,verified_at,source_name,source_url,source_type,valid_until,description,email,website_url,opening_hours,sustainability_attributes,phone,whatsapp,address,latitude,longitude,cover_image,verified,host_name,host_story,day_pass_available,hidden_gem,metadata,created_at,updated_at,deleted_at",
    write: {
      name: "text", category: "text", department: "text", municipality: "text", phone: "phone", whatsapp: "phone",
      address: "longtext", latitude: "lat", longitude: "lng", cover_image: "url", host_name: "text", host_story: "longtext",
      day_pass_available: "bool", hidden_gem: "bool", department_id: "id", municipality_id: "id", description: "longtext",
      website_url: "url", source_name: "text", source_url: "url",
    },
    required: ["name"],
  },
  departments: { table: "departments", order: "name", search: "name", select: "id,name,capital,short_desc,banner_image,created_at" },
  municipalities: { table: "municipalities", order: "name", search: "name", select: "id,department_id,name,latitude,longitude,location_precision,source_name,created_at,updated_at" },
  experiences: { table: "experiences", order: "title", search: "title", statusColumn: "status", select: "id,title,category,department_id,destination_id,business_id,price_nio,price_usd,verified,status,latitude,longitude,updated_at" },
  day_passes: { table: "day_passes", order: "title", search: "title", statusColumn: "status", select: "id,business_id,title,price_adult_nio,price_child_nio,price_usd,schedule_hours,requires_reservation,status,updated_at" },
  tourism_services: { table: "tourism_services", order: "title", search: "title", statusColumn: "status", select: "id,title,service_type,destination_id,business_id,price_min,price_max,currency,price_unit,source_name,verified_at,valid_until,status,updated_at" },
  emergencies: { table: "emergencies", order: "entity_name", search: "entity_name", select: "id,department_id,municipality_id,service_type,entity_name,phone_emergency,phone_secondary,address,latitude,longitude,is_24_hours,verified,created_at" },
  culture: { table: "culture", order: "title", search: "title", statusColumn: "status", select: "id,department_id,title,category,short_desc,source_name,source_url,verified,status,updated_at" },
  gastronomy: { table: "gastronomy", order: "dish_name", search: "dish_name", statusColumn: "status", select: "id,department_id,dish_name,category,average_price_nio,status,updated_at" },
  heritage: { table: "heritage", order: "name", search: "name", statusColumn: "status", select: "id,department_id,name,heritage_type,unesco_status,status,latitude,longitude,updated_at" },
  events: { table: "events", order: "start_date", search: "title", statusColumn: "status", select: "id,department_id,title,category,start_date,end_date,location_name,status,updated_at" },
  routes: { table: "routes", order: "title", search: "title", statusColumn: "status", select: "id,title,slug,category,duration_days,difficulty,verified,status,updated_at" },
  verification_requests: { table: "verification_requests", order: "created_at", search: "applicant_name", statusColumn: "status", select: "id,entity_type,entity_id,applicant_name,status,admin_notes,reviewed_by,reviewed_at,created_at" },
};
const STATUS_VALUES = new Set(["draft", "published", "pending_review", "archived"]);

// Conteos del panel ejecutivo: [clave, tabla, filtro opcional]
const COUNTS: Array<[string, string, ((q: any) => any)?]> = [
  ["departments", "departments"],
  ["municipalities", "municipalities"],
  ["destinations", "destinations", (q) => q.is("deleted_at", null)],
  ["destinations_published", "destinations", (q) => q.is("deleted_at", null).eq("status", "published")],
  ["destinations_with_coordinates", "destinations", (q) => q.is("deleted_at", null).not("latitude", "is", null).not("longitude", "is", null)],
  ["businesses", "businesses", (q) => q.is("deleted_at", null)],
  ["businesses_verified", "businesses", (q) => q.is("deleted_at", null).eq("verified", true)],
  ["verification_pending", "verification_requests", (q) => q.eq("status", "pending")],
  ["experiences", "experiences"],
  ["day_passes", "day_passes"],
  ["tourism_services", "tourism_services"],
  ["emergencies", "emergencies"],
  ["reservations", "reservations", (q) => q.is("deleted_at", null)],
  ["reservations_pending", "reservations", (q) => q.is("deleted_at", null).eq("status", "pending")],
  ["profiles", "profiles", (q) => q.is("deleted_at", null)],
  ["travel_plans", "travel_plans"],
  ["testimonials_pending", "testimonials", (q) => q.eq("status", "pending_review")],
  ["testimonials_published", "testimonials", (q) => q.eq("status", "published")],
  ["reports_open", "testimonial_reports", (q) => q.eq("status", "open")],
  ["ai_sessions", "ai_sessions"],
  ["ai_messages", "ai_messages"],
  ["knowledge_documents", "knowledge_documents"],
  ["audit_logs", "audit_logs"],
  ["traffic_sessions_24h", "traffic_sessions", (q) => q.gte("created_at", new Date(Date.now() - 86400000).toISOString())],
  ["firestore_mirror", "firestore_mirror"],
  ["staff_roles_active", "staff_roles", (q) => q.eq("is_active", true)],
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-firebase-token, apikey, x-client-info, authorization",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}
const reply = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

function cleanText(value: unknown, max: number, label: string, multiline = false): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, `${label}: debe ser texto.`);
  let text = value.normalize("NFC").replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ");
  text = (multiline ? text.replace(/[ \t]+/g, " ") : text.replace(/\s+/g, " ")).trim();
  if (text.length > max) throw new HttpError(400, `${label}: supera ${max} caracteres.`);
  return text || null;
}

function coerce(field: string, type: FieldType, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || value === "") return type === "bool" ? false : (type === "tags" ? [] : null);
  switch (type) {
    case "text": return cleanText(value, 160, field);
    case "longtext": return cleanText(value, 6000, field, true);
    case "id": {
      const v = String(value).trim();
      if (!/^[a-z0-9][a-z0-9_-]{0,80}$/i.test(v)) throw new HttpError(400, `${field}: identificador inválido.`);
      return v;
    }
    case "number": { const n = Number(value); if (!Number.isFinite(n)) throw new HttpError(400, `${field}: número inválido.`); return n; }
    case "lat": { const n = Number(value); if (!Number.isFinite(n) || n < 10.6 || n > 15.1) throw new HttpError(400, `${field}: latitud fuera de Nicaragua (10.6 a 15.1).`); return n; }
    case "lng": { const n = Number(value); if (!Number.isFinite(n) || n < -87.8 || n > -82.5) throw new HttpError(400, `${field}: longitud fuera de Nicaragua (-87.8 a -82.5).`); return n; }
    case "bool": return value === true || value === "true";
    case "url": {
      const v = String(value).trim();
      if (/^assets\/[\w./-]+$/i.test(v)) return v;
      let parsed: URL;
      try { parsed = new URL(v); } catch { throw new HttpError(400, `${field}: URL inválida.`); }
      if (parsed.protocol !== "https:") throw new HttpError(400, `${field}: la URL debe usar https.`);
      return parsed.toString().slice(0, 1000);
    }
    case "phone": {
      const v = String(value).replace(/[^\d+]/g, "");
      if (!/^\+?\d{8,15}$/.test(v)) throw new HttpError(400, `${field}: teléfono inválido (8 a 15 dígitos).`);
      return v;
    }
    case "tags": {
      if (!Array.isArray(value)) throw new HttpError(400, `${field}: debe ser una lista.`);
      return [...new Set(value.map((t) => cleanText(t, 40, field)).filter(Boolean))].slice(0, 12);
    }
    case "status": {
      const v = String(value);
      if (!STATUS_VALUES.has(v)) throw new HttpError(400, `${field}: estado inválido.`);
      return v;
    }
  }
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function entityOf(name: unknown): Entity {
  const entity = ENTITIES[String(name || "")];
  if (!entity) throw new HttpError(400, "Entidad no administrable.");
  return entity;
}

// ---------------------------------------------------------------------------
// Identidad y permisos
// ---------------------------------------------------------------------------
async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) throw new HttpError(401, "Iniciá sesión con tu cuenta autorizada.");
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    })).payload as Record<string, unknown>;
  } catch {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.");
  }
  const uid = String(claims.sub || "");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const emailVerified = claims.email_verified === true;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (!uid || !role) throw new HttpError(403, "Tu cuenta no tiene acceso al Ops Center.");
  return { uid, email, emailVerified, role, canWrite: role === "admin" || role === "super_admin" };
}

function requireWriter(actor: Actor) {
  if (!actor.canWrite) throw new HttpError(403, "Rol de solo lectura: esta acción requiere un administrador.");
}

// ---------------------------------------------------------------------------
// Auditoría en el servidor (UID, rol, IP real, antes/después, resultado)
// ---------------------------------------------------------------------------
async function audit(service: SupabaseClient, req: Request, actor: Actor, entry: {
  action: string; module: string; entity?: string; id?: string; description: string;
  before?: unknown; after?: unknown; result?: "ok" | "error"; extra?: Record<string, unknown>;
}) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  await service.from("audit_logs").insert({
    admin_email: actor.email || actor.uid,
    ip_address: ip,
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action: entry.action,
    module: entry.module,
    target_entity: entry.entity || null,
    target_id: entry.id || null,
    description: entry.description.slice(0, 500),
    payload: {
      uid: actor.uid, role: actor.role, result: entry.result || "ok", origin: "ops-center",
      before: entry.before ?? null, after: entry.after ?? null, ...(entry.extra || {}),
    },
  });
}

// ---------------------------------------------------------------------------
// Salud de servicios: solo se informa lo que se comprueba de verdad.
// ---------------------------------------------------------------------------
type Check = { id: string; label: string; state: "OPERATIVO" | "DEGRADADO" | "ERROR" | "SIN_CONFIGURAR" | "DESCONOCIDO"; detail: string; latency_ms?: number; source: string };
async function timed<T>(fn: () => Promise<T>): Promise<[T | null, number, unknown]> {
  const start = performance.now();
  try { const v = await fn(); return [v, Math.round(performance.now() - start), null]; }
  catch (e) { return [null, Math.round(performance.now() - start), e]; }
}
async function fetchStatus(url: string, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(t); }
}

async function health(service: SupabaseClient): Promise<Check[]> {
  const checks: Check[] = [];
  const [db, dbMs, dbErr] = await timed(async () => {
    const { count, error } = await service.from("departments").select("id", { count: "exact", head: true });
    if (error) throw error; return count;
  });
  checks.push({ id: "supabase_db", label: "Supabase PostgreSQL", source: "Supabase", latency_ms: dbMs,
    state: dbErr ? "ERROR" : (dbMs > 1500 ? "DEGRADADO" : "OPERATIVO"),
    detail: dbErr ? "Sin respuesta de la base de datos." : `Consulta real a departments: ${db} registros.` });

  const [geo, , geoErr] = await timed(async () => {
    const { count, error } = await service.from("destinations").select("id", { count: "exact", head: true }).not("geom", "is", null);
    if (error) throw error; return count;
  });
  checks.push({ id: "postgis", label: "PostGIS (geometrías)", source: "Supabase",
    state: geoErr ? "ERROR" : "OPERATIVO",
    detail: geoErr ? "La columna geom no respondió." : `${geo} destinos con geometría calculada.` });

  const [buckets, stMs, stErr] = await timed(async () => {
    const { data, error } = await service.storage.listBuckets();
    if (error) throw error; return data;
  });
  checks.push({ id: "supabase_storage", label: "Supabase Storage", source: "Supabase", latency_ms: stMs,
    state: stErr ? "ERROR" : ((buckets || []).length ? "OPERATIVO" : "SIN_CONFIGURAR"),
    detail: stErr ? "Storage no respondió." : `${(buckets || []).length} buckets: ${(buckets || []).map((b: { name: string }) => b.name).join(", ") || "ninguno"}.` });

  const [jwks, authMs, authErr] = await timed(async () => {
    const res = await fetchStatus(JWKS_URL);
    if (!res.ok) throw new Error(String(res.status)); return (await res.json()).keys?.length || 0;
  });
  checks.push({ id: "firebase_auth", label: "Firebase Authentication (claves de firma)", source: "Firebase", latency_ms: authMs,
    state: authErr ? "ERROR" : "OPERATIVO",
    detail: authErr ? "No se pudieron obtener las claves públicas de Google." : `${jwks} claves públicas vigentes; tokens verificables.` });

  const [site, siteMs, siteErr] = await timed(async () => {
    const res = await fetchStatus("https://baqueanonicaragua.com/health");
    if (!res.ok) throw new Error(String(res.status)); return await res.json();
  });
  checks.push({ id: "azure_web", label: "Web en Azure (baqueanonicaragua.com)", source: "Azure /health", latency_ms: siteMs,
    state: siteErr ? "ERROR" : (siteMs > 2500 ? "DEGRADADO" : "OPERATIVO"),
    detail: siteErr ? "El sitio no respondió /health." : `Commit desplegado: ${(site as Record<string, unknown>)?.commit || "desconocido"}.` });

  const [hosting, hostMs, hostErr] = await timed(async () => {
    const res = await fetchStatus("https://app-baqueano.web.app/", 6000); return res.status;
  });
  checks.push({ id: "firebase_hosting", label: "Firebase Hosting (respaldo)", source: "Firebase", latency_ms: hostMs,
    state: hostErr ? "ERROR" : (hosting === 200 ? "OPERATIVO" : "DEGRADADO"),
    detail: hostErr ? "Sin respuesta." : `HTTP ${hosting}.` });

  const [lastAi, , aiErr] = await timed(async () => {
    const { data, error } = await service.from("ai_messages").select("created_at, provider_used, latency_ms").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error; return data;
  });
  checks.push({ id: "baqui", label: "BAQUI (registro de interacciones)", source: "Supabase ai_messages",
    state: aiErr ? "ERROR" : (lastAi ? "OPERATIVO" : "SIN_CONFIGURAR"),
    detail: aiErr ? "No se pudo leer ai_messages." : (lastAi ? `Última respuesta: ${lastAi.created_at} (${lastAi.provider_used || "proveedor no informado"}).` : "BAQUI aún no registra interacciones en ai_messages: sin datos de uso, tokens ni latencia.") });

  checks.push({ id: "android", label: "App Android (telemetría)", source: "Android", state: "SIN_CONFIGURAR",
    detail: "La app todavía no transmite versión, dispositivos ni sesiones a Supabase. Integración pendiente." });
  return checks;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(action: string, body: Record<string, unknown>, actor: Actor, service: SupabaseClient, req: Request) {
  switch (action) {
    case "whoami":
      return { role: actor.role, can_write: actor.canWrite, email: actor.email };

    case "overview": {
      const metrics: Record<string, { value: number | null; state: string; source: string; table: string }> = {};
      await Promise.all(COUNTS.map(async ([key, table, filter]) => {
        let q = service.from(table).select("*", { count: "exact", head: true });
        if (filter) q = filter(q);
        const { count, error } = await q;
        metrics[key] = error
          ? { value: null, state: "ERROR", source: "Supabase", table }
          : { value: count ?? 0, state: (count ?? 0) > 0 ? "REAL" : "SIN_DATOS", source: "Supabase", table };
      }));
      const { data: ai } = await service.from("ai_messages").select("latency_ms, tokens_used, provider_used").order("created_at", { ascending: false }).limit(500);
      const rows = (ai || []) as Array<{ latency_ms: number | null; tokens_used: number | null; provider_used: string | null }>;
      const lat = rows.map((r) => r.latency_ms).filter((n): n is number => Number.isFinite(n));
      const providers: Record<string, number> = {};
      rows.forEach((r) => { const k = r.provider_used || "desconocido"; providers[k] = (providers[k] || 0) + 1; });
      const { data: lastAudit } = await service.from("audit_logs").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle();
      return {
        generated_at: new Date().toISOString(),
        metrics,
        ai: rows.length
          ? { state: "REAL", source: "Supabase ai_messages", sample: rows.length,
              avg_latency_ms: lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : null,
              tokens: rows.reduce((a, r) => a + (r.tokens_used || 0), 0), providers }
          : { state: "SIN_DATOS", source: "Supabase ai_messages", sample: 0 },
        last_audit_at: lastAudit?.created_at || null,
      };
    }

    case "health":
      return { generated_at: new Date().toISOString(), checks: await health(service) };

    case "list": {
      const entity = entityOf(body.entity);
      const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 100);
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from(entity.table).select(entity.select, { count: "exact" });
      if (entity.softDelete) q = body.archived === true ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);
      const search = cleanText(body.q, 80, "búsqueda");
      if (search && entity.search) q = q.ilike(entity.search, `%${search.replace(/[%_]/g, "")}%`);
      if (body.status && entity.statusColumn && STATUS_VALUES.has(String(body.status))) q = q.eq(entity.statusColumn, String(body.status));
      const { data, error, count } = await q.order(entity.order, { ascending: entity.order !== "created_at" }).range(page * limit, page * limit + limit - 1);
      if (error) throw new HttpError(500, `No se pudo leer ${entity.table}.`);
      return { entity: body.entity, items: data || [], total: count || 0, page, limit, source: "Supabase", state: (count || 0) > 0 ? "REAL" : "SIN_DATOS" };
    }

    case "get": {
      const entity = entityOf(body.entity);
      const id = cleanText(body.id, 120, "id");
      if (!id) throw new HttpError(400, "Falta el id.");
      const { data, error } = await service.from(entity.table).select(entity.select).eq("id", id).maybeSingle();
      if (error) throw new HttpError(500, "No se pudo leer el registro.");
      if (!data) throw new HttpError(404, "El registro no existe.");
      return { item: data };
    }

    case "audit_list": {
      const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 200);
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from("audit_logs").select("id,admin_email,action,module,target_entity,target_id,description,payload,created_at", { count: "exact" });
      const mod = cleanText(body.module, 60, "módulo"); if (mod) q = q.eq("module", mod);
      const act = cleanText(body.action_filter, 60, "acción"); if (act) q = q.eq("action", act);
      const who = cleanText(body.admin, 120, "administrador"); if (who) q = q.ilike("admin_email", `%${who.replace(/[%_]/g, "")}%`);
      const term = cleanText(body.q, 80, "búsqueda"); if (term) q = q.ilike("description", `%${term.replace(/[%_]/g, "")}%`);
      if (body.from) q = q.gte("created_at", new Date(String(body.from)).toISOString());
      if (body.to) q = q.lte("created_at", new Date(String(body.to)).toISOString());
      const { data, error, count } = await q.order("created_at", { ascending: false }).range(page * limit, page * limit + limit - 1);
      if (error) throw new HttpError(500, "No se pudo leer la auditoría.");
      return { items: data || [], total: count || 0, page, limit };
    }

    case "save": {
      requireWriter(actor);
      const entity = entityOf(body.entity);
      if (!entity.write) throw new HttpError(400, "Esta entidad todavía no admite edición desde el Ops Center.");
      const values = (body.values && typeof body.values === "object") ? body.values as Record<string, unknown> : {};
      const patch: Record<string, unknown> = {};
      for (const [field, type] of Object.entries(entity.write)) {
        const v = coerce(field, type, values[field]);
        if (v !== undefined) patch[field] = v;
      }
      if ((patch.latitude == null) !== (patch.longitude == null) && ("latitude" in patch || "longitude" in patch)) {
        throw new HttpError(400, "Coordenadas incompletas: indicá latitud y longitud juntas.");
      }
      const id = cleanText(body.id, 120, "id");
      let before: Record<string, unknown> | null = null;
      if (id) {
        const { data } = await service.from(entity.table).select(entity.select).eq("id", id).maybeSingle();
        if (!data) throw new HttpError(404, "El registro no existe.");
        before = data as Record<string, unknown>;
      } else {
        for (const field of entity.required || []) if (patch[field] == null) throw new HttpError(400, `Falta ${field}.`);
      }
      if (patch.department_id) {
        const { data } = await service.from("departments").select("id").eq("id", patch.department_id).maybeSingle();
        if (!data) throw new HttpError(400, "El departamento no existe.");
      }
      if (patch.municipality_id) {
        // El municipio debe existir y pertenecer al departamento indicado (o al ya guardado).
        const { data } = await service.from("municipalities").select("id,department_id").eq("id", patch.municipality_id).maybeSingle();
        if (!data) throw new HttpError(400, "El municipio no existe.");
        const department = patch.department_id || (before && before.department_id);
        if (department && data.department_id !== department) throw new HttpError(400, "El municipio no pertenece al departamento indicado.");
        if (!department) patch.department_id = data.department_id;
      }
      patch.updated_at = new Date().toISOString();
      let saved;
      if (before) {
        const { data, error } = await service.from(entity.table).update(patch).eq("id", id!).select(entity.select).single();
        if (error) throw new HttpError(400, "No se pudo guardar el cambio.");
        saved = data;
      } else {
        const base = slugify(String(patch.name || patch.title || "registro")) || "registro";
        const newId = `${base}-${crypto.randomUUID().slice(0, 6)}`;
        const { data, error } = await service.from(entity.table).insert({ id: newId, ...(entity.statusColumn ? { status: "draft" } : {}), ...patch }).select(entity.select).single();
        if (error) throw new HttpError(400, error.code === "23505" ? "Ya existe un registro con ese identificador." : "No se pudo crear el registro.");
        saved = data;
      }
      await audit(service, req, actor, {
        action: before ? "update" : "create", module: String(body.entity), entity: entity.table, id: String((saved as Record<string, unknown>).id),
        description: `${before ? "Editó" : "Creó"} ${entity.table}: ${(saved as Record<string, unknown>).name || (saved as Record<string, unknown>).title || ""}`,
        before, after: saved,
      });
      return { item: saved };
    }

    case "set_status": {
      requireWriter(actor);
      const entity = entityOf(body.entity);
      const id = cleanText(body.id, 120, "id");
      const op = String(body.op || "");
      if (!id) throw new HttpError(400, "Falta el id.");
      if (!["publish", "unpublish", "archive", "restore"].includes(op)) throw new HttpError(400, "Operación inválida.");
      if ((op === "archive" || op === "restore") && !entity.softDelete) throw new HttpError(400, "Esta entidad no admite archivo.");
      if ((op === "publish" || op === "unpublish") && !entity.statusColumn) throw new HttpError(400, "Esta entidad no tiene estado de publicación.");
      const { data: before } = await service.from(entity.table).select(entity.select).eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "El registro no existe.");
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (op === "publish") patch[entity.statusColumn!] = "published";
      if (op === "unpublish") patch[entity.statusColumn!] = "draft";
      if (op === "archive") patch.deleted_at = new Date().toISOString();
      if (op === "restore") patch.deleted_at = null;
      const { data: after, error } = await service.from(entity.table).update(patch).eq("id", id).select(entity.select).single();
      if (error) throw new HttpError(500, "No se pudo cambiar el estado.");
      await audit(service, req, actor, { action: op, module: String(body.entity), entity: entity.table, id, description: `${op} ${entity.table}: ${(after as Record<string, unknown>).name || id}`, before, after });
      return { item: after };
    }

    case "verify": {
      requireWriter(actor);
      const entity = entityOf(body.entity);
      if (!["destinations", "businesses"].includes(String(body.entity))) throw new HttpError(400, "El sello aplica a destinos y negocios.");
      const id = cleanText(body.id, 120, "id");
      if (!id) throw new HttpError(400, "Falta el id.");
      const verified = body.verified === true;
      const source = cleanText(body.source, 300, "fuente");
      const evidence = body.evidence ? coerce("evidencia", "url", body.evidence) : null;
      const notes = cleanText(body.notes, 1000, "observaciones", true);
      if (verified && !source) throw new HttpError(400, "Para verificar indicá la fuente (visita, documento, llamada…).");
      const nextReview = body.next_review ? new Date(String(body.next_review)) : null;
      if (nextReview && Number.isNaN(nextReview.getTime())) throw new HttpError(400, "Fecha de próxima revisión inválida.");
      const { data: before } = await service.from(entity.table).select(entity.select).eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "El registro no existe.");
      const now = new Date().toISOString();
      const trace = { verified, verified_by: actor.email, verified_uid: actor.uid, verified_at: now, source, evidence, notes, next_review: nextReview ? nextReview.toISOString().slice(0, 10) : null };
      const metadata = { ...((before as Record<string, unknown>).metadata as Record<string, unknown> || {}), verification: trace };
      const patch: Record<string, unknown> = { verified, metadata, updated_at: now };
      if (body.entity === "destinations") {
        patch.last_verified_at = verified ? now : null;
        patch.verification_notes = notes;
        // El CHECK de destinations admite verified_baqueano/confirmed/pending/community.
        patch.confidence_status = verified ? "verified_baqueano" : "pending";
        if (source) patch.source_name = source.slice(0, 160);
      }
      // Trazabilidad homogénea (migración 20261005052100): estado, fecha, fuente y vigencia.
      patch.verification_status = verified ? "verified" : "pending_review";
      patch.verified_at = verified ? now : null;
      if (source) { patch.source_name = source.slice(0, 160); patch.source_type = "field_audit"; }
      if (evidence) patch.source_url = evidence;
      if (nextReview) patch.valid_until = nextReview.toISOString().slice(0, 10);
      if (body.entity === "businesses") patch.status = verified ? "published" : "pending_review";
      const { data: after, error } = await service.from(entity.table).update(patch).eq("id", id).select(entity.select).single();
      if (error) throw new HttpError(500, "No se pudo registrar la verificación.");
      await audit(service, req, actor, { action: verified ? "verify" : "unverify", module: String(body.entity), entity: entity.table, id, description: `${verified ? "Verificó" : "Retiró verificación de"} ${(after as Record<string, unknown>).name || id}`, before, after });
      return { item: after };
    }

    case "kpis": {
      // KPIs SMART calculados en PostgreSQL (kpi_dashboard). Lectura: todo el personal.
      const to = body.to ? new Date(String(body.to)) : new Date();
      const from = body.from ? new Date(String(body.from)) : new Date(to.getTime() - 30 * 86400000);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) throw new HttpError(400, "Período inválido.");
      if (to.getTime() - from.getTime() > 366 * 86400000) throw new HttpError(400, "El período máximo es de un año.");
      const { data, error } = await service.rpc("kpi_dashboard", { p_from: from.toISOString(), p_to: to.toISOString() });
      if (error) throw new HttpError(500, "No se pudieron calcular los KPIs.");
      return { report: data };
    }

    case "db_health": {
      const { data, error } = await service.rpc("db_health_report");
      if (error) throw new HttpError(500, "No se pudo generar el reporte de salud de la base de datos.");
      return { report: data };
    }

    case "duplicates": {
      const [biz, dest, phones] = await Promise.all([
        service.from("v_possible_duplicate_businesses").select("*").limit(50),
        service.from("v_possible_duplicate_destinations").select("*").limit(50),
        service.from("v_shared_business_phones").select("*").limit(50),
      ]);
      if (biz.error || dest.error || phones.error) throw new HttpError(500, "No se pudieron consultar los posibles duplicados.");
      // Solo sugerencias: nunca se fusiona automáticamente.
      return { businesses: biz.data, destinations: dest.data, shared_phones: phones.data };
    }

    case "log": {
      // Eventos del cliente que deben quedar trazados (inicio de sesión, exportaciones).
      const kind = String(body.kind || "");
      if (!["login", "export_backup", "view_sensitive"].includes(kind)) throw new HttpError(400, "Evento no permitido.");
      await audit(service, req, actor, { action: kind, module: cleanText(body.module, 60, "módulo") || "ops-center", description: cleanText(body.description, 300, "descripción") || kind });
      return { logged: true };
    }

    default:
      throw new HttpError(400, "Acción desconocida.");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Usá POST." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, "La solicitud es demasiado grande.");
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw || "{}"); } catch { throw new HttpError(400, "JSON inválido."); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(String(body.action || ""), body, actor, service, req);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message }, origin);
    console.error("[baqueano-ops]", error);
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos." }, origin);
  }
});
