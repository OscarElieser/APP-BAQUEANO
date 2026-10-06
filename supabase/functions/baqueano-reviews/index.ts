// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: OPINIONES SOBRE BAQUEANO (platform_reviews)
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario pidió (2026-10-06) opiniones auténticas sobre el uso de la plataforma: solo con
//   sesión, una valoración activa por usuario, moderación con motivo, respuesta institucional y
//   promedio real. La autorización no puede depender del navegador.
// - Esta función es independiente de baqueano-community (testimonios de destinos y experiencias):
//   las dos calificaciones no se mezclan.
//
// ⚙️ CÓMO:
// 1. Identidad: ID token de Firebase verificado (RS256, emisor y audiencia app-baqueano). El UID del
//    token es el dueño de la opinión; nada del cuerpo de la petición decide quién escribe.
// 2. Roles: claim `role` o correo verificado activo en staff_roles, con la revocación del RBAC de
//    Supabase (_shared/staff-revocation.ts). Admin y superadmin moderan; el auditor solo lee.
// 3. Texto saneado, sin enlaces, correos ni teléfonos en lo público. El sitio lo pinta con
//    textContent (nunca HTML).
// 4. Límites: por usuario (historial) y por IP (hash SHA-256, nunca en claro) con
//    baqui_consume_budget.
// 5. Todo cambio deja un evento en platform_review_events. Las acciones del equipo, además, quedan en
//    audit_logs con administrador, acción, fecha y motivo. No existe acción de borrado físico.
// 6. Respuestas públicas: nunca UID, correo, IP, consentimiento ni la sugerencia privada de mejora.
//
// 📦 QUÉ (POST { action, ... }):
// - Público: summary, list.
// - Con sesión: whoami, mine, my_history, submit, withdraw, delete_mine, report.
// - 2026-10-06: aprobar, rechazar o responder crea un aviso en la campana del autor (_shared/notify.ts).
// - Equipo: mod_list (admin y auditor), moderate, respond, resolve_report (solo admin y superadmin).
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";
import { notify } from "../_shared/notify.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BODY_BYTES = 16 * 1024;
// Versión del texto de consentimiento que muestra opiniones.html. Si cambia el texto, cambia la versión.
const CONSENT_VERSION = "opiniones-v1-2026-10-06";
const CONSENT_PURPOSE = "Publicar nombre público, foto (si el usuario la autoriza), calificación y comentario en BAQUEANO; usar la sugerencia de mejora solo internamente.";

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);
const PLATFORMS = new Set(["web", "android", "ios"]);
const REPORT_REASONS = new Set(["insulto", "amenaza", "spam", "ilegal", "datos_personales", "suplantacion",
  "automatizado", "repetido", "enlace_peligroso", "discriminacion", "otro"]);
const STATUSES = new Set(["pending", "approved", "rejected", "hidden", "reported", "withdrawn"]);
const LIMITS = { userWritesPerHour: 6, reportsPerHour: 10, ipPer10Min: 30, pageSize: 12 };

type Actor = { uid: string; email: string | null; name: string; avatar: string | null; provider: "google" | "password" | "other"; role: string; isAdmin: boolean; isAuditor: boolean };
class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}

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
function reply(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

// Texto plano: sin caracteres de control ni de dirección, espacios normalizados y largo acotado.
function cleanText(value: unknown, max: number, opts: { required?: boolean; min?: number; label: string; code: string }): string | null {
  if (value == null || value === "") {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${opts.label} no es texto.`, `${opts.code}_invalid`);
  let text = value.normalize("NFC")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (opts.min && text.length < opts.min) throw new HttpError(400, `${opts.label} es demasiado corto (mínimo ${opts.min} caracteres).`, `${opts.code}_short`);
  if (text.length > max) throw new HttpError(400, `${opts.label} supera ${max} caracteres.`, `${opts.code}_long`);
  return text;
}

// Lo que se publica no lleva enlaces ni datos de contacto (spam, enlaces peligrosos, datos personales).
function assertPublicSafe(text: string, label: string, code: string) {
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ni|io|app|xyz|info|biz)\b)/i.test(text)) {
    throw new HttpError(400, `Por seguridad, ${label} no puede incluir enlaces.`, `${code}_links`);
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    throw new HttpError(400, `Para proteger tus datos, ${label} no puede incluir correos electrónicos.`, `${code}_email`);
  }
  if (/(?:\+?\d[\s.-]?){8,}/.test(text)) {
    throw new HttpError(400, `Para proteger tus datos, ${label} no puede incluir números de teléfono.`, `${code}_phone`);
  }
  if (/(.)\1{9,}/.test(text)) throw new HttpError(400, `${label} parece spam (caracteres repetidos).`, `${code}_spam`);
}

function cleanUuid(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, `${label} inválido.`, "id_invalid");
  }
  return value.toLowerCase();
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

// ---------------------------------------------------------------------------
// Identidad y permisos
// ---------------------------------------------------------------------------
async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor | null> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) return null;
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    })).payload as Record<string, unknown>;
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
  const uid = String(claims.sub || "");
  if (!uid) throw new HttpError(401, "La sesión no identifica a ningún usuario.", "session_invalid");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  const emailVerified = claims.email_verified === true;
  const firebase = (claims.firebase || {}) as Record<string, unknown>;
  const signIn = String(firebase.sign_in_provider || "");
  const provider = signIn === "google.com" ? "google" : signIn === "password" ? "password" : "other";
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email, emailVerified, role });
  if (!role) role = "explorer";
  const rawName = typeof claims.name === "string" ? claims.name : "";
  const name = rawName.replace(/\s+/g, " ").trim().slice(0, 80);
  const avatar = typeof claims.picture === "string" && /^https:\/\/[^\s"'<>]+$/.test(claims.picture) ? claims.picture.slice(0, 500) : null;
  return { uid, email, name, avatar, provider, role, isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) {
    throw new HttpError(401, "Para publicar tu opinión necesitás iniciar sesión. Esto nos ayuda a mantener opiniones auténticas y una comunidad más confiable.", "login_required");
  }
  return actor;
}
function requireStaffReader(actor: Actor | null): Actor {
  const a = requireActor(actor);
  if (!a.isAdmin && !a.isAuditor) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede ver la moderación.", "forbidden");
  return a;
}
function requireAdmin(actor: Actor | null): Actor {
  const a = requireActor(actor);
  if (!a.isAdmin) throw new HttpError(403, "Solo administradores pueden moderar opiniones.", "forbidden");
  return a;
}

async function limitIp(service: SupabaseClient, req: Request) {
  const hash = (await sha256(`reviews:${clientIp(req)}`)).slice(0, 40);
  const { data, error } = await service.rpc("baqui_consume_budget", { p_bucket: `reviews:${hash}`, p_limit: LIMITS.ipPer10Min, p_window_seconds: 600 });
  if (!error && data === false) throw new HttpError(429, "Hiciste muchas acciones seguidas. Esperá unos minutos y volvé a intentarlo.", "rate_limited");
}

async function limitUser(service: SupabaseClient, uid: string, actions: string[], max: number) {
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count, error } = await service.from("platform_review_events").select("id", { count: "exact", head: true })
    .eq("actor_ref", uid).in("action", actions).gte("created_at", since);
  if (error) throw new HttpError(500, "No pudimos verificar el límite de publicaciones.", "limit_check_failed");
  if ((count || 0) >= max) throw new HttpError(429, "Llegaste al límite de cambios por hora. Probá más tarde.", "rate_limited");
}

async function logEvent(service: SupabaseClient, e: { review_id: string; actor_type: "user" | "admin" | "system"; actor_ref: string; actor_role?: string; action: string; from_status?: string | null; to_status?: string | null; reason?: string | null; snapshot?: unknown }) {
  const { error } = await service.from("platform_review_events").insert({
    review_id: e.review_id, actor_type: e.actor_type, actor_ref: e.actor_ref, actor_role: e.actor_role || null, action: e.action,
    from_status: e.from_status ?? null, to_status: e.to_status ?? null, reason: e.reason ?? null, snapshot: e.snapshot ?? null,
  });
  if (error) throw new HttpError(500, "No se pudo registrar la trazabilidad; no se aplicó el cambio.", "event_failed");
}

async function audit(service: SupabaseClient, req: Request, actor: Actor, entry: { action: string; id: string; reason?: string | null; before?: unknown; after?: unknown; description: string }) {
  await service.from("audit_logs").insert({
    admin_email: actor.email || actor.uid,
    actor_role: actor.role,
    ip_address: clientIp(req) === "unknown" ? null : clientIp(req),
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action: entry.action,
    module: "opiniones",
    entity_type: "platform_review",
    entity_id: entry.id,
    target_entity: "platform_reviews",
    target_id: entry.id,
    reason: entry.reason || null,
    description: entry.description.slice(0, 500),
    old_values: (entry.before ?? null) as Record<string, unknown> | null,
    new_values: (entry.after ?? null) as Record<string, unknown> | null,
    payload: { uid: actor.uid, role: actor.role, origin: "ops-center" },
  });
}

// Vista de la propia opinión: lo que el usuario necesita ver, sin datos de otros.
const OWN_COLUMNS = "id, rating, comment, improvement, status, show_avatar, display_name_snapshot, avatar_url, moderation_reason, response_text, response_at, edit_count, created_at, updated_at, published_at, consent_version, consent_at";
const MOD_COLUMNS = "id, user_id, auth_provider, display_name_snapshot, avatar_url, show_avatar, rating, comment, improvement, status, platform, language, consent_version, consent_at, moderation_reason, moderated_by, moderated_at, response_text, response_by, response_at, edit_count, open_reports, deletion_requested_at, erased_at, created_at, updated_at, published_at";

function maskUid(uid: string) {
  return uid.length <= 6 ? "******" : `${uid.slice(0, 4)}…${uid.slice(-2)}`;
}

async function loadMine(service: SupabaseClient, uid: string) {
  const { data, error } = await service.from("platform_reviews").select(OWN_COLUMNS).eq("user_id", uid).neq("status", "withdrawn").maybeSingle();
  if (error) throw new HttpError(500, "No se pudo leer tu opinión.", "read_failed");
  return data as Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, req: Request, service: SupabaseClient) {
  switch (action) {
    case "summary": {
      const { data, error } = await service.rpc("platform_review_summary");
      if (error) throw new HttpError(500, "No se pudo calcular el resumen.", "summary_failed");
      return { summary: data };
    }
    case "list": {
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 200);
      const { data, error } = await service.rpc("platform_reviews_public", { p_limit: LIMITS.pageSize, p_offset: page * LIMITS.pageSize });
      if (error) throw new HttpError(500, "No se pudieron leer las opiniones.", "list_failed");
      return { reviews: data || [], page, pageSize: LIMITS.pageSize };
    }
    case "whoami": {
      const a = requireActor(actor);
      return { user: { name: a.name || null, avatar: a.avatar, provider: a.provider, role: a.role, canModerate: a.isAdmin, canReadModeration: a.isAdmin || a.isAuditor } };
    }
    case "mine": {
      const a = requireActor(actor);
      return { review: await loadMine(service, a.uid), consentVersion: CONSENT_VERSION };
    }
    // 2026-10-06 — "Mis opiniones": historial real del propio usuario (versiones, estados y
    // motivos de moderación). Solo lectura; sale de platform_reviews + platform_review_events
    // filtrados por el UID verificado. Lo borrado a pedido (erased) no devuelve texto.
    case "my_history": {
      const a = requireActor(actor);
      const { data: rows, error } = await service.from("platform_reviews")
        .select("id, status, rating, comment, created_at, updated_at, published_at, moderation_reason, erased_at, edit_count")
        .eq("user_id", a.uid).order("created_at", { ascending: false }).limit(20);
      if (error) throw new HttpError(500, "No se pudo leer tu historial.", "read_failed");
      const ids = (rows || []).map((r: Record<string, unknown>) => r.id);
      let events: unknown[] = [];
      if (ids.length) {
        const { data: ev, error: evError } = await service.from("platform_review_events")
          .select("review_id, action, from_status, to_status, reason, snapshot, created_at")
          .in("review_id", ids).order("created_at", { ascending: false }).limit(80);
        if (evError) throw new HttpError(500, "No se pudo leer tu historial.", "read_failed");
        events = (ev || []).map((e: Record<string, unknown>) => {
          const snap = (e.snapshot || null) as Record<string, unknown> | null;
          return { review_id: e.review_id, action: e.action, from_status: e.from_status, to_status: e.to_status, reason: e.reason, at: e.created_at,
            previous: snap ? { rating: snap.rating ?? null, comment: snap.comment ?? null } : null };
        });
      }
      return { reviews: rows || [], events };
    }
    case "submit": {
      const a = requireActor(actor);
      await limitIp(service, req);
      await limitUser(service, a.uid, ["created", "edited"], LIMITS.userWritesPerHour);
      const comment = cleanText(body.comment, 1000, { required: true, min: 10, label: "tu comentario", code: "comment" })!;
      assertPublicSafe(comment, "el comentario", "comment");
      const improvement = cleanText(body.improvement, 600, { label: "la sugerencia", code: "improvement" });
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Elegí una calificación de 1 a 5 estrellas.", "rating_required");
      if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) {
        throw new HttpError(400, "Para publicar tenés que aceptar que tu nombre público, calificación y comentario se muestren en BAQUEANO.", "consent_required");
      }
      const showAvatar = body.showAvatar !== false;
      const language = LANGS.has(String(body.language)) ? String(body.language) : "es";
      const platform = PLATFORMS.has(String(body.platform)) ? String(body.platform) : "web";
      const now = new Date().toISOString();
      const existing = await loadMine(service, a.uid);
      const identity = { display_name_snapshot: a.name || null, avatar_url: a.avatar, show_avatar: showAvatar, auth_provider: a.provider };
      if (existing) {
        if (existing.comment === comment && Number(existing.rating) === rating && (existing.improvement || null) === improvement && existing.show_avatar === showAvatar) {
          throw new HttpError(409, "Tu opinión no tiene cambios.", "no_changes");
        }
        const snapshot = { comment: existing.comment, rating: existing.rating, improvement: existing.improvement, status: existing.status, updated_at: existing.updated_at };
        const { data, error } = await service.from("platform_reviews").update({
          ...identity, comment, rating, improvement, language, platform, status: "pending", moderation_reason: null,
          consent_version: CONSENT_VERSION, consent_at: now, consent_purpose: CONSENT_PURPOSE,
          edit_count: Number(existing.edit_count || 0) + 1,
        }).eq("id", existing.id).eq("user_id", a.uid).select(OWN_COLUMNS).single();
        if (error) throw new HttpError(500, "No se pudo actualizar tu opinión.", "update_failed");
        await logEvent(service, { review_id: String(existing.id), actor_type: "user", actor_ref: a.uid, action: "edited", from_status: String(existing.status), to_status: "pending", snapshot });
        return { review: data, status: "pending" };
      }
      const { data, error } = await service.from("platform_reviews").insert({
        user_id: a.uid, ...identity, comment, rating, improvement, language, platform, status: "pending",
        consent_version: CONSENT_VERSION, consent_at: now, consent_purpose: CONSENT_PURPOSE,
      }).select(OWN_COLUMNS).single();
      if (error) {
        if (error.code === "23505") throw new HttpError(409, "Ya tenés una opinión activa; podés editarla.", "already_exists");
        throw new HttpError(500, "No se pudo guardar tu opinión.", "insert_failed");
      }
      await logEvent(service, { review_id: String(data.id), actor_type: "user", actor_ref: a.uid, action: "created", to_status: "pending" });
      return { review: data, status: "pending" };
    }
    case "withdraw":
    case "delete_mine": {
      const a = requireActor(actor);
      const existing = await loadMine(service, a.uid);
      if (!existing) throw new HttpError(404, "No tenés una opinión activa.", "not_found");
      const erase = action === "delete_mine";
      const now = new Date().toISOString();
      const patch: Record<string, unknown> = { status: "withdrawn" };
      if (erase) Object.assign(patch, { comment: null, improvement: null, display_name_snapshot: null, avatar_url: null, response_text: null, deletion_requested_at: now, erased_at: now });
      const { error } = await service.from("platform_reviews").update(patch).eq("id", existing.id).eq("user_id", a.uid);
      if (error) throw new HttpError(500, "No se pudo completar el pedido.", "update_failed");
      if (erase) {
        // El texto anterior también sale del historial; queda la traza de qué pasó y cuándo.
        await service.from("platform_review_events").update({ snapshot: null }).eq("review_id", existing.id).not("snapshot", "is", null);
      }
      await logEvent(service, { review_id: String(existing.id), actor_type: "user", actor_ref: a.uid, action: erase ? "erased" : "withdrawn", from_status: String(existing.status), to_status: "withdrawn" });
      return { status: "withdrawn", erased: erase };
    }
    case "report": {
      const a = requireActor(actor);
      await limitIp(service, req);
      await limitUser(service, a.uid, ["reported"], LIMITS.reportsPerHour);
      const id = cleanUuid(body.reviewId, "la opinión");
      const reason = String(body.reason || "");
      if (!REPORT_REASONS.has(reason)) throw new HttpError(400, "Elegí un motivo de reporte.", "reason_required");
      const details = cleanText(body.details, 500, { label: "el detalle", code: "details" });
      const { data: review } = await service.from("platform_reviews").select("id, user_id, status, open_reports").eq("id", id).maybeSingle();
      if (!review || review.status !== "approved") throw new HttpError(404, "La opinión no está disponible.", "not_found");
      if (review.user_id === a.uid) throw new HttpError(400, "No podés reportar tu propia opinión.", "own_review");
      const { error } = await service.from("platform_review_reports").insert({ review_id: id, reporter_uid: a.uid, reason, details });
      if (error) {
        if (error.code === "23505") throw new HttpError(409, "Ya reportaste esta opinión. El equipo la va a revisar.", "already_reported");
        throw new HttpError(500, "No se pudo enviar el reporte.", "report_failed");
      }
      await service.from("platform_reviews").update({ open_reports: Number(review.open_reports || 0) + 1 }).eq("id", id);
      await logEvent(service, { review_id: id, actor_type: "user", actor_ref: a.uid, action: "reported", reason });
      return { reported: true };
    }
    case "mod_list": {
      requireStaffReader(actor);
      const status = String(body.status || "pending");
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from("platform_reviews").select(MOD_COLUMNS, { count: "exact" });
      if (status === "reports") q = q.gt("open_reports", 0);
      else if (STATUSES.has(status)) q = q.eq("status", status);
      const { data, error, count } = await q.order("updated_at", { ascending: false }).range(page * 25, page * 25 + 24);
      if (error) throw new HttpError(500, "No se pudo leer la cola de moderación.", "mod_failed");
      const ids = (data || []).map((r: Record<string, unknown>) => r.id);
      const reports = ids.length
        ? (await service.from("platform_review_reports").select("id, review_id, reason, details, status, created_at").in("review_id", ids).eq("status", "open")).data || []
        : [];
      const events = ids.length
        ? (await service.from("platform_review_events").select("review_id, actor_type, actor_role, action, from_status, to_status, reason, created_at").in("review_id", ids).order("created_at", { ascending: true })).data || []
        : [];
      const { data: counts } = await service.from("platform_reviews").select("status");
      const totals: Record<string, number> = {};
      (counts || []).forEach((r: { status: string }) => { totals[r.status] = (totals[r.status] || 0) + 1; });
      return {
        total: count || 0, page, totals,
        items: (data || []).map((r: Record<string, unknown>) => ({
          ...r, user_id: undefined, user_ref: maskUid(String(r.user_id)),
          reports: reports.filter((x: Record<string, unknown>) => x.review_id === r.id),
          history: events.filter((x: Record<string, unknown>) => x.review_id === r.id),
        })),
      };
    }
    case "moderate": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.reviewId, "la opinión");
      const decision = String(body.decision || "");
      const map: Record<string, { status: string; event: string; needsReason: boolean }> = {
        approve: { status: "approved", event: "approved", needsReason: false },
        reject: { status: "rejected", event: "rejected", needsReason: true },
        hide: { status: "hidden", event: "hidden", needsReason: true },
        mark_reported: { status: "reported", event: "marked_reported", needsReason: true },
      };
      const target = map[decision];
      if (!target) throw new HttpError(400, "Acción de moderación desconocida.", "decision_invalid");
      const reason = cleanText(body.reason, 500, { required: target.needsReason, min: target.needsReason ? 5 : 0, label: "el motivo", code: "reason" });
      const { data: before } = await service.from("platform_reviews").select("id, user_id, status, rating, moderation_reason, erased_at").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "La opinión no existe.", "not_found");
      if (before.status === "withdrawn" || before.erased_at) throw new HttpError(409, "La opinión fue retirada por su autor.", "withdrawn");
      const now = new Date().toISOString();
      const { error } = await service.from("platform_reviews").update({
        status: target.status, moderation_reason: reason, moderated_by: a.email || a.uid, moderated_at: now,
      }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo aplicar la moderación.", "moderate_failed");
      await logEvent(service, { review_id: id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: target.event, from_status: before.status, to_status: target.status, reason });
      await audit(service, req, a, { action: `review_${decision}`, id, reason, before: { status: before.status }, after: { status: target.status }, description: `Opinión ${id}: ${before.status} → ${target.status}` });
      // Aviso al autor en su campana (web y Android). No bloquea la moderación si falla.
      if (target.status === "approved" || target.status === "rejected") {
        await notify(service, {
          recipient: String(before.user_id), source: "opiniones", refId: id,
          type: target.status === "approved" ? "review_approved" : "review_rejected",
          titleKey: target.status === "approved" ? "notify.reviewApprovedTitle" : "notify.reviewRejectedTitle",
          bodyKey: target.status === "approved" ? "notify.reviewApprovedBody" : "notify.reviewRejectedBody",
          params: target.status === "rejected" && reason ? { reason: reason.slice(0, 300) } : {},
          link: "/opiniones.html#prHistory",
          dedupeKey: `review:${id}:${target.status}:${now}`,
        });
      }
      return { status: target.status };
    }
    case "respond": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.reviewId, "la opinión");
      const remove = body.remove === true;
      const text = remove ? null : cleanText(body.text, 1000, { required: true, min: 2, label: "la respuesta", code: "response" });
      if (text) assertPublicSafe(text, "la respuesta", "response");
      const { data: before } = await service.from("platform_reviews").select("id, user_id, response_text").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "La opinión no existe.", "not_found");
      const now = new Date().toISOString();
      const { error } = await service.from("platform_reviews").update(remove
        ? { response_text: null, response_by: null, response_at: null }
        : { response_text: text, response_by: a.email || a.uid, response_at: now }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo guardar la respuesta.", "respond_failed");
      await logEvent(service, { review_id: id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: remove ? "response_removed" : "responded" });
      await audit(service, req, a, { action: remove ? "review_response_removed" : "review_responded", id, before: { response_text: before.response_text }, after: { response_text: text }, description: `Respuesta institucional en opinión ${id}` });
      if (!remove) {
        await notify(service, {
          recipient: String(before.user_id), source: "opiniones", refId: id, type: "review_response",
          titleKey: "notify.reviewResponseTitle", bodyKey: "notify.reviewResponseBody",
          link: "/opiniones.html#prHistory", dedupeKey: `review:${id}:response:${now}`,
        });
      }
      return { responded: !remove };
    }
    case "resolve_report": {
      const a = requireAdmin(actor);
      const reportId = cleanUuid(body.reportId, "el reporte");
      const outcome = body.outcome === "dismissed" ? "dismissed" : "resolved";
      const reason = cleanText(body.reason, 500, { required: true, min: 5, label: "el motivo", code: "reason" });
      const { data: report } = await service.from("platform_review_reports").select("id, review_id, status").eq("id", reportId).maybeSingle();
      if (!report || report.status !== "open") throw new HttpError(404, "El reporte no está abierto.", "not_found");
      await service.from("platform_review_reports").update({ status: outcome, resolved_by: a.email || a.uid, resolved_at: new Date().toISOString() }).eq("id", reportId);
      const { data: review } = await service.from("platform_reviews").select("open_reports").eq("id", report.review_id).maybeSingle();
      await service.from("platform_reviews").update({ open_reports: Math.max(0, Number(review?.open_reports || 1) - 1) }).eq("id", report.review_id);
      await logEvent(service, { review_id: report.review_id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: "report_resolved", reason: `${outcome}: ${reason}` });
      await audit(service, req, a, { action: "review_report_resolved", id: report.review_id, reason, after: { report: reportId, outcome }, description: `Reporte ${reportId} ${outcome}` });
      return { outcome };
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
    // Las escrituras desde el navegador exigen un origen permitido (defensa contra CSRF además del token).
    const writes = new Set(["submit", "withdraw", "delete_mine", "report", "moderate", "respond", "resolve_report"]);
    if (writes.has(action) && origin && !(ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
      throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(action, body, actor, req, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-reviews]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos.", code: "internal" }, origin);
  }
});
