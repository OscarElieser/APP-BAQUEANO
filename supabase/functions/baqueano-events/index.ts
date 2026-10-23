// ============================================================================
// 🗓️ BAQUEANO — EDGE FUNCTION: AGENDA DE EVENTOS (public.events)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20): «la sección debe poder administrarse sin modificar código
//   cada vez que se anuncie un evento». El equipo crea, revisa, publica, destaca, reprograma o
//   cancela desde el Ops Center y el index se actualiza solo. El público ve únicamente lo aprobado.
//
// ⚙️ CÓMO:
// 1. Lecturas públicas: RPC public_events / public_event (solo publicados, estado temporal con la
//    hora de Nicaragua, coordenadas solo si están verificadas).
// 2. Escrituras: ID token de Firebase verificado (RS256, emisor y audiencia app-baqueano) + rol del
//    equipo (claim `role` o correo verificado activo en staff_roles, con la revocación del RBAC).
//    admin y super_admin editan y publican; auditor solo lee. auth.uid() de Supabase no se usa.
// 3. Publicar exige los datos mínimos (lo controla también un CHECK en la base): slug, inicio,
//    descripción, foto y fuente oficial. Nada se borra: se despublica o se cancela.
// 4. Fotos: URL firmada al bucket event-images; al adjuntar se comprueban tamaño y tipo real
//    (magic bytes). La foto anterior se conserva en el bucket (no se borra).
// 5. Cada cambio queda en event_changes y en audit_logs.
//
// 📦 QUÉ (POST { action, ... }):
// - Público: list { scope, departmentId, category, from, to, page, limit }, get { slug }.
// - Equipo: whoami, mod_list { publication, q, page }, mod_get { id }, save { id?, event },
//   publication { id, to: review|published|unpublished|draft, reason }, status { id, to:
//   scheduled|cancelled|rescheduled|postponed, startDate, startTime, endDate, endTime, note },
//   feature { id, on }, upload_url { id, mime, size }, attach_image { id, path }.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";
import { CATEGORIES, DEPARTMENTS, HttpError, managuaToIso, slugify, validateEvent } from "./helpers.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const BUCKET = "event-images";
const MAX_BODY_BYTES = 64 * 1024;
const IMAGE_MIME: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_IMAGE = 5 * 1024 * 1024;
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com", "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app", "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const PUBLICATION = new Set(["draft", "review", "published", "unpublished"]);
const EVENT_STATUS = new Set(["scheduled", "cancelled", "rescheduled", "postponed"]);
const STAFF_COLUMNS = "id, slug, title, short_description, description, category, cover_image, image_alt, image_credit, start_at, end_at, timezone, time_confirmed, modality, virtual_url, department_id, municipality_id, location_name, address, latitude, longitude, coords_verified, access_type, price, currency, organizer_name, organizer_url, contact_info, official_url, registration_url, program, recommendations, source_name, source_url, event_status, rescheduled_from, status_note, publication_status, is_featured, published_at, created_by, updated_by, approved_by, created_at, updated_at";

type Actor = { uid: string; email: string | null; role: string; isAdmin: boolean; isAuditor: boolean };

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
function reply(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}
function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}
function cleanId(v: unknown): string {
  const s = String(v || "");
  if (!/^[a-z0-9][a-z0-9_-]{2,119}$/.test(s)) throw new HttpError(400, "Evento inválido.", "id_invalid");
  return s;
}
function reasonText(v: unknown, required: boolean): string | null {
  const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
  if (!s && required) throw new HttpError(400, "Escribí el motivo (queda en el historial).", "reason_required");
  if (s.length > 500) throw new HttpError(400, "El motivo supera 500 caracteres.", "reason_long");
  return s || null;
}

async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor | null> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) return null;
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`, audience: FIREBASE_PROJECT_ID })).payload as Record<string, unknown>;
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
  const uid = String(claims.sub || "");
  if (!uid) throw new HttpError(401, "La sesión no identifica a ningún usuario.", "session_invalid");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  const emailVerified = claims.email_verified === true;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email, emailVerified, role });
  return { uid, email, role: role || "explorer", isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}
function requireReader(a: Actor | null): Actor {
  if (!a) throw new HttpError(401, "Iniciá sesión con tu cuenta del equipo.", "login_required");
  if (!a.isAdmin && !a.isAuditor) throw new HttpError(403, "Solo el equipo autorizado del Ops Center gestiona eventos.", "forbidden");
  return a;
}
function requireEditor(a: Actor | null): Actor {
  const r = requireReader(a);
  if (!r.isAdmin) throw new HttpError(403, "Tu rol permite ver la agenda, no modificarla.", "forbidden");
  return r;
}

async function logChange(service: SupabaseClient, req: Request, a: Actor, id: string, action: string, reason: string | null, snapshot: unknown) {
  const { error } = await service.from("event_changes").insert({ event_id: id, actor: a.email || a.uid, actor_role: a.role, action, reason, snapshot: snapshot ?? null });
  if (error) throw new HttpError(500, "No se pudo registrar el historial; no se aplicó el cambio.", "history_failed");
  await service.from("audit_logs").insert({
    admin_email: a.email || a.uid, actor_role: a.role, ip_address: clientIp(req) === "unknown" ? null : clientIp(req),
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300), action: `event_${action}`, module: "eventos",
    entity_type: "event", entity_id: id, target_entity: "events", target_id: id, reason,
    description: `Evento ${id}: ${action}`.slice(0, 500), payload: { uid: a.uid, role: a.role, origin: "ops-center" },
  });
}

async function loadEvent(service: SupabaseClient, id: string) {
  const { data, error } = await service.from("events").select(STAFF_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new HttpError(500, "No se pudo leer el evento.", "read_failed");
  if (!data) throw new HttpError(404, "El evento no existe.", "not_found");
  return data as Record<string, unknown>;
}

// El campo «Municipio» se escribe a mano («Masaya», «nindiri»…), pero la columna es una clave de
// public.municipalities (p. ej. masaya__nindiri). Se busca por id o por nombre sin tildes; si no
// coincide con ninguno, se guarda vacío en lugar de rechazar el borrador entero.
function plainName(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
async function resolveMunicipality(service: SupabaseClient, raw: string | null, departmentId: string | null): Promise<string | null> {
  if (!raw) return null;
  let q = service.from("municipalities").select("id, name, department_id");
  if (departmentId) q = q.eq("department_id", departmentId);
  const { data, error } = await q.limit(400);
  if (error || !data) return null;
  const wanted = plainName(raw);
  const hit = (data as { id: string; name: string }[]).find((m) => m.id === raw || plainName(m.name) === wanted || plainName(m.id.split("__").pop() || "") === wanted);
  return hit ? hit.id : null;
}

async function uniqueSlug(service: SupabaseClient, base: string, exceptId?: string): Promise<string> {
  const root = base || "evento";
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = service.from("events").select("id").eq("slug", candidate);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}

async function sniff(service: SupabaseClient, path: string): Promise<{ mime: string | null; size: number }> {
  const { data, error } = await service.storage.from(BUCKET).download(path);
  if (error || !data) return { mime: null, size: 0 };
  const bytes = new Uint8Array(await data.slice(0, 16).arrayBuffer());
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const mime = hex.startsWith("ffd8ff") ? "image/jpeg" : hex.startsWith("89504e47") ? "image/png"
    : (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") ? "image/webp" : null;
  return { mime, size: data.size };
}

async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, req: Request, service: SupabaseClient) {
  switch (action) {
    case "list": {
      const scope = ["upcoming", "past", "all"].includes(String(body.scope)) ? String(body.scope) : "upcoming";
      const dept = body.departmentId && DEPARTMENTS.includes(String(body.departmentId)) ? String(body.departmentId) : null;
      const cat = body.category && (CATEGORIES as readonly string[]).includes(String(body.category)) ? String(body.category) : null;
      const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
      const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 60);
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 200);
      const { data, error } = await service.rpc("public_events", {
        p_scope: scope, p_department: dept, p_category: cat, p_from: date(body.from), p_to: date(body.to), p_limit: limit + 1, p_offset: page * limit,
      });
      if (error) throw new HttpError(500, "No se pudo leer la agenda.", "list_failed");
      const rows = (data || []) as unknown[];
      return { events: rows.slice(0, limit), hasMore: rows.length > limit, page, source: "supabase:events(publication_status=published)" };
    }
    case "get": {
      const slug = String(body.slug || "");
      if (!/^[a-z0-9][a-z0-9-]{2,119}$/.test(slug)) throw new HttpError(400, "Evento inválido.", "slug_invalid");
      const { data, error } = await service.rpc("public_event", { p_slug: slug });
      if (error) throw new HttpError(500, "No se pudo leer el evento.", "get_failed");
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) throw new HttpError(404, "No encontramos ese evento publicado.", "not_found");
      return { event: row };
    }
    case "whoami": {
      const a = requireReader(actor);
      return { user: { role: a.role, canEdit: a.isAdmin } };
    }
    case "mod_list": {
      requireReader(actor);
      const pub = String(body.publication || "all");
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from("events").select(STAFF_COLUMNS, { count: "exact" });
      if (PUBLICATION.has(pub)) q = q.eq("publication_status", pub);
      if (pub === "past") q = q.lt("start_at", new Date(Date.now() - 86_400_000).toISOString());
      const search = typeof body.q === "string" ? body.q.replace(/[%_,()]/g, " ").trim().slice(0, 80) : "";
      if (search) q = q.ilike("title", `%${search}%`);
      const { data, error, count } = await q.order("start_at", { ascending: pub !== "past", nullsFirst: false }).range(page * 25, page * 25 + 24);
      if (error) throw new HttpError(500, "No se pudo leer la agenda del equipo.", "mod_failed");
      const { data: all } = await service.from("events").select("publication_status");
      const totals: Record<string, number> = {};
      (all || []).forEach((r: { publication_status: string }) => { totals[r.publication_status] = (totals[r.publication_status] || 0) + 1; });
      return { items: data || [], total: count || 0, totals, page };
    }
    case "mod_get": {
      requireReader(actor);
      const id = cleanId(body.id);
      const event = await loadEvent(service, id);
      const { data: history } = await service.from("event_changes").select("action, actor, actor_role, reason, created_at").eq("event_id", id).order("created_at", { ascending: false }).limit(50);
      return { event, history: history || [] };
    }
    case "save": {
      const a = requireEditor(actor);
      const row = validateEvent((body.event || {}) as Record<string, unknown>);
      row.municipality_id = await resolveMunicipality(service, row.municipality_id as string | null, row.department_id as string | null);
      const id = body.id ? cleanId(body.id) : null;
      if (id) {
        const before = await loadEvent(service, id);
        if (before.publication_status === "published" && row.modality !== "virtual" && (!row.department_id || !row.location_name)) {
          throw new HttpError(400, "Este evento está publicado: necesita el departamento y el lugar exacto.", "publish_requirements");
        }
        // El slug no cambia una vez publicado (los enlaces compartidos no se rompen).
        const patch: Record<string, unknown> = { ...row, updated_by: a.email || a.uid };
        if (!before.published_at) patch.slug = await uniqueSlug(service, slugify(`${row.title} ${String(row.start_at).slice(0, 4)}`), id);
        const { data, error } = await service.from("events").update(patch).eq("id", id).select(STAFF_COLUMNS).single();
        if (error) {
          console.error("[baqueano-events] save", error.code, error.message);
          throw new HttpError(400, error.code === "23514" ? "Faltan datos obligatorios para un evento publicado (foto, descripción o fuente)." : "No se pudo guardar el evento.", "save_failed");
        }
        await logChange(service, req, a, id, "edited", null, { title: before.title, start_at: before.start_at, description: before.description });
        return { event: data };
      }
      const slug = await uniqueSlug(service, slugify(`${row.title} ${String(row.start_at).slice(0, 4)}`));
      const newId = `ev-${slug}`.slice(0, 120);
      const { data, error } = await service.from("events").insert({
        ...row, id: newId, slug, start_date: String(row.start_at).slice(0, 10), publication_status: "draft",
        event_status: "scheduled", created_by: a.email || a.uid, updated_by: a.email || a.uid,
      }).select(STAFF_COLUMNS).single();
      if (error) {
        console.error("[baqueano-events] create", error.code, error.message);
        throw new HttpError(400, "No se pudo crear el evento.", "create_failed");
      }
      await logChange(service, req, a, newId, "created", null, null);
      return { event: data };
    }
    case "publication": {
      const a = requireEditor(actor);
      const id = cleanId(body.id);
      const to = String(body.to || "");
      if (!PUBLICATION.has(to)) throw new HttpError(400, "Estado de publicación inválido.", "publication_invalid");
      const before = await loadEvent(service, id);
      const reason = reasonText(body.reason, to === "unpublished");
      const patch: Record<string, unknown> = { publication_status: to, updated_by: a.email || a.uid };
      if (to === "published") {
        // El borrador puede estar incompleto; publicar un evento presencial exige saber dónde es.
        if (before.modality !== "virtual" && (!before.department_id || !before.location_name)) {
          throw new HttpError(400, "Para publicar falta el departamento y el lugar exacto del evento.", "publish_requirements");
        }
        patch.approved_by = a.email || a.uid;
      }
      const { error } = await service.from("events").update(patch).eq("id", id);
      if (error) {
        if (error.code === "23514") throw new HttpError(400, "Para publicar faltan datos: fecha de inicio, descripción, foto y fuente oficial (nombre y enlace).", "publish_requirements");
        throw new HttpError(500, "No se pudo cambiar la publicación.", "publication_failed");
      }
      const act = to === "published" ? "published" : to === "unpublished" ? "unpublished" : to === "review" ? "submitted" : "edited";
      await logChange(service, req, a, id, act, reason, { from: before.publication_status, to });
      return { publication: to };
    }
    case "status": {
      const a = requireEditor(actor);
      const id = cleanId(body.id);
      const to = String(body.to || "");
      if (!EVENT_STATUS.has(to)) throw new HttpError(400, "Estado del evento inválido.", "status_invalid");
      const before = await loadEvent(service, id);
      const note = reasonText(body.note, to !== "scheduled");
      const patch: Record<string, unknown> = { event_status: to, status_note: note, updated_by: a.email || a.uid };
      if (to === "rescheduled") {
        const confirmed = !!body.startTime;
        const start = managuaToIso(body.startDate, confirmed ? body.startTime : null);
        if (!start) throw new HttpError(400, "Indicá la nueva fecha (y hora si está confirmada).", "start_invalid");
        const end = body.endDate ? managuaToIso(body.endDate, body.endTime || "23:59") : null;
        if (body.endDate && !end) throw new HttpError(400, "Revisá la nueva fecha de finalización.", "end_invalid");
        if (end && Date.parse(end) < Date.parse(start)) throw new HttpError(400, "La finalización no puede ser antes del inicio.", "end_before_start");
        Object.assign(patch, { rescheduled_from: before.start_at, start_at: start, end_at: end, time_confirmed: confirmed });
      }
      const { error } = await service.from("events").update(patch).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo cambiar el estado.", "status_failed");
      await logChange(service, req, a, id, to === "cancelled" ? "cancelled" : to === "rescheduled" ? "rescheduled" : "restored", note, { from: before.event_status, start_at: before.start_at });
      return { status: to };
    }
    case "feature": {
      const a = requireEditor(actor);
      const id = cleanId(body.id);
      await loadEvent(service, id);
      const on = body.on === true;
      const { error } = await service.from("events").update({ is_featured: on, updated_by: a.email || a.uid }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo destacar el evento.", "feature_failed");
      await logChange(service, req, a, id, on ? "featured" : "unfeatured", null, null);
      return { featured: on };
    }
    case "upload_url": {
      requireEditor(actor);
      const id = cleanId(body.id);
      await loadEvent(service, id);
      const ext = IMAGE_MIME[String(body.mime || "")];
      if (!ext) throw new HttpError(400, "Usá una foto WebP, JPG o PNG.", "mime_invalid");
      const size = Number(body.size);
      if (!(size > 0 && size <= MAX_IMAGE)) throw new HttpError(400, "La foto supera 5 MB.", "too_large");
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const { data, error } = await service.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new HttpError(500, "No se pudo preparar la subida.", "upload_failed");
      return { path, upload_url: data.signedUrl };
    }
    case "attach_image": {
      const a = requireEditor(actor);
      const id = cleanId(body.id);
      const path = String(body.path || "");
      if (!path.startsWith(`${id}/`) || path.includes("..") || !/^[a-z0-9_-]+\/[0-9a-f-]{36}\.(webp|jpg|png)$/.test(path)) {
        throw new HttpError(403, "Ruta de archivo no permitida.", "path_forbidden");
      }
      const info = await sniff(service, path);
      if (!info.mime || !(info.size > 0 && info.size <= MAX_IMAGE)) throw new HttpError(400, "El archivo no es una foto válida.", "image_invalid");
      const url = service.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const before = await loadEvent(service, id);
      const { error } = await service.from("events").update({ cover_image: url, updated_by: a.email || a.uid }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo guardar la foto.", "image_failed");
      await logChange(service, req, a, id, "image", null, { previous: before.cover_image });
      return { cover_image: url };
    }
    default:
      throw new HttpError(400, "Acción desconocida.", "unknown_action");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Método no permitido." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, "La solicitud es demasiado grande.", "too_large");
    let body: Record<string, unknown> = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (_) { throw new HttpError(400, "JSON inválido.", "bad_json"); }
    const action = String(body.action || "");
    const reads = new Set(["list", "get"]);
    if (!reads.has(action) && origin && !(ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
      throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = reads.has(action) ? null : await resolveActor(req, service);
    const result = await handle(action, body, actor, req, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-events]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos.", code: "internal" }, origin);
  }
});
