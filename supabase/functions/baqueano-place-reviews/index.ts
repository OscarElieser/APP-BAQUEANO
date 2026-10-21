// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: VALORACIONES Y OPINIONES DE LUGARES (public.reviews)
// ============================================================================
// 🎯 POR QUÉ (propietario, 2026-10-20):
// - Estrellas y comentarios reales, compartidos entre /mapa, /destinos y la ficha, sin cifras
//   inventadas ni reseñas duplicadas. Nadie puede modificar la opinión de otra persona.
// - La identidad es Firebase: auth.uid() de Supabase NO identifica al autor. Esta función
//   verifica el ID token (RS256, emisor y audiencia app-baqueano) y usa SU uid como dueño.
//   Nada del cuerpo de la petición decide quién escribe.
//
// ⚙️ CÓMO (mismo patrón que baqueano-reviews, opiniones sobre la plataforma):
// 1. Lecturas públicas: RPC place_review_summaries / place_reviews_public (solo lo publicado,
//    solo columnas públicas).
// 2. Escrituras con sesión: una opinión por usuario y lugar (editar actualiza la misma fila y
//    vuelve a moderación). Texto saneado, sin enlaces, correos ni teléfonos. Límites por usuario
//    (historial) y por IP (hash SHA-256 con baqui_consume_budget).
// 3. Banderas antispam para el equipo (no rechazan solas): texto repetido en otros lugares,
//    lenguaje ofensivo, mayúsculas sostenidas. Una opinión crítica NO se marca por sus estrellas.
// 4. Moderación: claim `role` o correo verificado activo en staff_roles + revocación del RBAC
//    (_shared/staff-revocation.ts). Admin y superadmin moderan y responden; el auditor solo lee.
//    Todo cambio deja review_events; las acciones del equipo también audit_logs.
// 5. Nunca se devuelve el UID de otra persona, su correo, IP ni banderas al público.
//
// 📦 QUÉ (POST { action, ... }):
// - Público: summary { targets[] }, list { target, sort, page }.
// - Con sesión: whoami, mine { target }, submit { target, rating, comment, showAvatar, nameMode,
//   consent, consentVersion, language, platform }, withdraw { target }, report { reviewId, reason }.
// - Equipo: mod_list { status, page, q }, moderate { reviewId, decision, reason },
//   respond { reviewId, text | remove }, resolve_report { reportId, outcome, reason }.
// Destinos: 'place:<slug|id>' | 'destination:<alias de review_target_aliases>' | 'business:<id>'.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";
import { notify } from "../_shared/notify.ts";
import { assertPublicSafe, cleanTargetKey, cleanText, HttpError, publicName, spamFlags } from "./helpers.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BODY_BYTES = 16 * 1024;
// Versión del texto de consentimiento del formulario (js/bq-reviews.js). Si cambia el texto, cambia la versión.
const CONSENT_VERSION = "lugares-v1-2026-10-20";

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de", "ko", "zh"]);
const PLATFORMS = new Set(["web", "android", "ios"]);
const SORTS = new Set(["recent", "best", "critical"]);
const REPORT_REASONS = new Set(["insulto", "amenaza", "spam", "ilegal", "datos_personales", "suplantacion",
  "automatizado", "repetido", "enlace_peligroso", "discriminacion", "falso", "otro"]);
const STATUSES = new Set(["pending", "published", "rejected", "hidden", "reported", "withdrawn"]);
const LIMITS = { userWritesPerHour: 8, reportsPerHour: 10, ipPer10Min: 40, pageSize: 10, modPage: 25, targetsPerSummary: 120 };

type Actor = { uid: string; email: string | null; name: string; avatar: string | null; provider: "google" | "password" | "other"; role: string; isAdmin: boolean; isAuditor: boolean };
type Target = { kind: "place" | "business"; ref: string; key: string };

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
function maskUid(uid: string) {
  return uid.length <= 6 ? "******" : `${uid.slice(0, 4)}…${uid.slice(-2)}`;
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
  if (signIn === "anonymous") throw new HttpError(401, "Para opinar necesitás una cuenta con Google o correo.", "login_required");
  const provider = signIn === "google.com" ? "google" : signIn === "password" ? "password" : "other";
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email, emailVerified, role });
  if (!role) role = "explorer";
  // Perfil de viajero (si lo completó): su nombre y foto elegidos tienen prioridad sobre los del token.
  const { data: profile } = await service.from("traveler_profiles").select("display_name, avatar_url").eq("firebase_uid", uid).maybeSingle();
  const rawName = (profile?.display_name as string) || (typeof claims.name === "string" ? claims.name : "");
  const rawAvatar = (profile?.avatar_url as string) || (typeof claims.picture === "string" ? claims.picture : "");
  const avatar = /^https:\/\/[^\s"'<>]+$/.test(rawAvatar) ? rawAvatar.slice(0, 500) : null;
  return { uid, email, name: rawName.replace(/\s+/g, " ").trim().slice(0, 80), avatar, provider, role, isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) {
    throw new HttpError(401, "Para publicar tu opinión necesitás iniciar sesión. Así mantenemos opiniones auténticas.", "login_required");
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
  const hash = (await sha256(`place-reviews:${clientIp(req)}`)).slice(0, 40);
  const { data, error } = await service.rpc("baqui_consume_budget", { p_bucket: `place-reviews:${hash}`, p_limit: LIMITS.ipPer10Min, p_window_seconds: 600 });
  if (!error && data === false) throw new HttpError(429, "Hiciste muchas acciones seguidas. Esperá unos minutos y volvé a intentarlo.", "rate_limited");
}
async function limitUser(service: SupabaseClient, uid: string, actions: string[], max: number) {
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count, error } = await service.from("review_events").select("id", { count: "exact", head: true })
    .eq("actor_ref", uid).in("action", actions).gte("created_at", since);
  if (error) throw new HttpError(500, "No pudimos verificar el límite de publicaciones.", "limit_check_failed");
  if ((count || 0) >= max) throw new HttpError(429, "Llegaste al límite de cambios por hora. Probá más tarde.", "rate_limited");
}

async function resolveTarget(service: SupabaseClient, key: string): Promise<Target> {
  const { data, error } = await service.rpc("review_resolve_target", { p_target: key });
  if (error) throw new HttpError(500, "No se pudo identificar el lugar.", "target_failed");
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) throw new HttpError(404, "Este lugar todavía no recibe opiniones en BAQUEANO.", "target_not_found");
  return { kind: row.kind, ref: row.ref, key };
}
function targetColumn(t: Target) { return t.kind === "place" ? "place_id" : "business_id"; }

async function targetName(service: SupabaseClient, kind: string, ref: string): Promise<string> {
  const table = kind === "business" ? "businesses" : "places";
  const { data } = await service.from(table).select("name").eq("id", ref).maybeSingle();
  return String(data?.name || "");
}
function targetLink(kind: string, ref: string) {
  return kind === "place" ? `/destino.html?lugar=${encodeURIComponent(ref.replace(/^pl-/, ""))}#opiniones` : "/mi-perfil.html";
}

async function logEvent(service: SupabaseClient, e: { review_id: string; actor_type: "user" | "admin" | "system"; actor_ref: string; actor_role?: string; action: string; from_status?: string | null; to_status?: string | null; reason?: string | null; snapshot?: unknown }) {
  const { error } = await service.from("review_events").insert({
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
    module: "resenas_turisticas",
    entity_type: "review",
    entity_id: entry.id,
    target_entity: "reviews",
    target_id: entry.id,
    reason: entry.reason || null,
    description: entry.description.slice(0, 500),
    old_values: (entry.before ?? null) as Record<string, unknown> | null,
    new_values: (entry.after ?? null) as Record<string, unknown> | null,
    payload: { uid: actor.uid, role: actor.role, origin: "ops-center" },
  });
}

const OWN_COLUMNS = "id, place_id, business_id, rating, comment, status, show_avatar, user_name, user_avatar, language, moderation_reason, response_text, response_at, edit_count, created_at, updated_at, published_at";
const MOD_COLUMNS = "id, user_uid, user_name, user_avatar, show_avatar, place_id, business_id, destination_id, rating, comment, status, language, platform, auth_provider, flags, moderation_reason, moderated_by, moderated_at, response_text, response_by, response_at, edit_count, open_reports, created_at, updated_at, published_at";

async function loadMine(service: SupabaseClient, uid: string, t: Target) {
  const { data, error } = await service.from("reviews").select(OWN_COLUMNS).eq("user_uid", uid).eq(targetColumn(t), t.ref).maybeSingle();
  if (error) throw new HttpError(500, "No se pudo leer tu opinión.", "read_failed");
  return data as Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, req: Request, service: SupabaseClient) {
  switch (action) {
    case "summary": {
      const raw = Array.isArray(body.targets) ? body.targets.slice(0, LIMITS.targetsPerSummary) : [];
      const targets = raw.map((t) => { try { return cleanTargetKey(t); } catch (_) { return null; } }).filter(Boolean) as string[];
      if (!targets.length) return { summaries: {} };
      const { data, error } = await service.rpc("place_review_summaries", { p_targets: targets });
      if (error) throw new HttpError(500, "No se pudo calcular el resumen.", "summary_failed");
      const summaries: Record<string, unknown> = {};
      (data || []).forEach((r: Record<string, unknown>) => {
        summaries[String(r.target)] = {
          kind: r.kind, count: Number(r.count) || 0, average: r.average == null ? null : Number(r.average),
          distribution: { 1: r.d1, 2: r.d2, 3: r.d3, 4: r.d4, 5: r.d5 },
        };
      });
      // Los destinos sin equivalencia inequívoca no aparecen: el sitio muestra «Aún sin valoraciones» sin formulario.
      return { summaries, source: "supabase:reviews(status=published)" };
    }
    case "list": {
      const target = cleanTargetKey(body.target);
      const sort = SORTS.has(String(body.sort)) ? String(body.sort) : "recent";
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 200);
      const { data, error } = await service.rpc("place_reviews_public", { p_target: target, p_sort: sort, p_limit: LIMITS.pageSize, p_offset: page * LIMITS.pageSize });
      if (error) throw new HttpError(500, "No se pudieron leer las opiniones.", "list_failed");
      return { reviews: data || [], page, pageSize: LIMITS.pageSize, sort };
    }
    case "whoami": {
      const a = requireActor(actor);
      return { user: { name: a.name || null, avatar: a.avatar, provider: a.provider, role: a.role, canModerate: a.isAdmin, canReadModeration: a.isAdmin || a.isAuditor } };
    }
    case "mine": {
      const a = requireActor(actor);
      const t = await resolveTarget(service, cleanTargetKey(body.target));
      const mine = await loadMine(service, a.uid, t);
      return { review: mine && mine.status !== "withdrawn" ? mine : null, consentVersion: CONSENT_VERSION };
    }
    case "submit": {
      const a = requireActor(actor);
      await limitIp(service, req);
      await limitUser(service, a.uid, ["created", "edited"], LIMITS.userWritesPerHour);
      const t = await resolveTarget(service, cleanTargetKey(body.target));
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Elegí una calificación de 1 a 5 estrellas.", "rating_required");
      const comment = cleanText(body.comment, 1000, { min: 10, label: "tu comentario", code: "comment" }) || "";
      if (comment) assertPublicSafe(comment, "el comentario", "comment");
      if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) {
        throw new HttpError(400, "Para publicar tenés que aceptar que tu nombre público, calificación y comentario se muestren en BAQUEANO.", "consent_required");
      }
      const showAvatar = body.showAvatar !== false;
      const name = publicName(a.name, String(body.nameMode || "full"));
      const language = LANGS.has(String(body.language)) ? String(body.language) : "es";
      const platform = PLATFORMS.has(String(body.platform)) ? String(body.platform) : "web";
      const flags = spamFlags(comment);
      if (comment) {
        // Mismo texto publicado por la misma cuenta en otros lugares en los últimos 30 días.
        const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
        const { count } = await service.from("reviews").select("id", { count: "exact", head: true })
          .eq("user_uid", a.uid).eq("comment", comment).neq(targetColumn(t), t.ref).gte("updated_at", since);
        if ((count || 0) > 0) flags.push("texto_repetido");
      }
      const now = new Date().toISOString();
      const row = {
        user_name: name, user_avatar: a.avatar, show_avatar: showAvatar, auth_provider: a.provider,
        rating, comment, language, platform, status: "pending", flags, moderation_reason: null,
        consent_version: CONSENT_VERSION, consent_at: now,
      };
      const existing = await loadMine(service, a.uid, t);
      if (existing) {
        if (existing.status !== "withdrawn" && existing.comment === comment && Number(existing.rating) === rating && existing.show_avatar === showAvatar && existing.user_name === name) {
          throw new HttpError(409, "Tu opinión no tiene cambios.", "no_changes");
        }
        // Una opinión rechazada u oculta se puede corregir y volver a enviar: el motivo anterior queda en el historial.
        const snapshot = { comment: existing.comment, rating: existing.rating, status: existing.status, updated_at: existing.updated_at };
        const { data, error } = await service.from("reviews").update({ ...row, edit_count: Number(existing.edit_count || 0) + 1 })
          .eq("id", existing.id).eq("user_uid", a.uid).select(OWN_COLUMNS).single();
        if (error) throw new HttpError(500, "No se pudo actualizar tu opinión.", "update_failed");
        await logEvent(service, { review_id: String(existing.id), actor_type: "user", actor_ref: a.uid, action: "edited", from_status: String(existing.status), to_status: "pending", snapshot });
        if (flags.length) await logEvent(service, { review_id: String(existing.id), actor_type: "system", actor_ref: "antispam", action: "flagged", reason: flags.join(",") });
        return { review: data, status: "pending" };
      }
      const { data, error } = await service.from("reviews").insert({ user_uid: a.uid, [targetColumn(t)]: t.ref, ...row }).select(OWN_COLUMNS).single();
      if (error) {
        if (error.code === "23505") throw new HttpError(409, "Ya tenés una opinión sobre este lugar; podés editarla.", "already_exists");
        throw new HttpError(500, "No se pudo guardar tu opinión.", "insert_failed");
      }
      await logEvent(service, { review_id: String(data.id), actor_type: "user", actor_ref: a.uid, action: "created", to_status: "pending" });
      if (flags.length) await logEvent(service, { review_id: String(data.id), actor_type: "system", actor_ref: "antispam", action: "flagged", reason: flags.join(",") });
      return { review: data, status: "pending" };
    }
    case "withdraw": {
      const a = requireActor(actor);
      const t = await resolveTarget(service, cleanTargetKey(body.target));
      const existing = await loadMine(service, a.uid, t);
      if (!existing || existing.status === "withdrawn") throw new HttpError(404, "No tenés una opinión activa sobre este lugar.", "not_found");
      const { error } = await service.from("reviews").update({ status: "withdrawn" }).eq("id", existing.id).eq("user_uid", a.uid);
      if (error) throw new HttpError(500, "No se pudo retirar tu opinión.", "update_failed");
      await logEvent(service, { review_id: String(existing.id), actor_type: "user", actor_ref: a.uid, action: "withdrawn", from_status: String(existing.status), to_status: "withdrawn" });
      return { status: "withdrawn" };
    }
    case "report": {
      const a = requireActor(actor);
      await limitIp(service, req);
      await limitUser(service, a.uid, ["reported"], LIMITS.reportsPerHour);
      const id = cleanUuid(body.reviewId, "la opinión");
      const reason = String(body.reason || "");
      if (!REPORT_REASONS.has(reason)) throw new HttpError(400, "Elegí un motivo de reporte.", "reason_required");
      const details = cleanText(body.details, 500, { label: "el detalle", code: "details" });
      const { data: review } = await service.from("reviews").select("id, user_uid, status, open_reports").eq("id", id).maybeSingle();
      if (!review || review.status !== "published") throw new HttpError(404, "La opinión no está disponible.", "not_found");
      if (review.user_uid === a.uid) throw new HttpError(400, "No podés reportar tu propia opinión.", "own_review");
      const { error } = await service.from("review_reports").insert({ review_id: id, reporter_uid: a.uid, reason, details });
      if (error) {
        if (error.code === "23505") throw new HttpError(409, "Ya reportaste esta opinión. El equipo la va a revisar.", "already_reported");
        throw new HttpError(500, "No se pudo enviar el reporte.", "report_failed");
      }
      await service.from("reviews").update({ open_reports: Number(review.open_reports || 0) + 1 }).eq("id", id);
      await logEvent(service, { review_id: id, actor_type: "user", actor_ref: a.uid, action: "reported", reason });
      return { reported: true };
    }
    case "mod_list": {
      requireStaffReader(actor);
      const status = String(body.status || "pending");
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from("reviews").select(MOD_COLUMNS, { count: "exact" });
      if (status === "reports") q = q.gt("open_reports", 0);
      else if (status === "flagged") q = q.neq("flags", "{}").eq("status", "pending");
      else if (STATUSES.has(status)) q = q.eq("status", status);
      const search = cleanText(body.q, 80, { label: "la búsqueda", code: "q" });
      if (search) q = q.ilike("comment", `%${search.replace(/[%_]/g, "")}%`);
      const { data, error, count } = await q.order("updated_at", { ascending: false }).range(page * LIMITS.modPage, page * LIMITS.modPage + LIMITS.modPage - 1);
      if (error) throw new HttpError(500, "No se pudo leer la cola de moderación.", "mod_failed");
      const rows = (data || []) as Record<string, unknown>[];
      const ids = rows.map((r) => r.id);
      const placeIds = [...new Set(rows.map((r) => r.place_id).filter(Boolean))] as string[];
      const bizIds = [...new Set(rows.map((r) => r.business_id).filter(Boolean))] as string[];
      const [reports, events, places, businesses, totalsRows] = await Promise.all([
        ids.length ? service.from("review_reports").select("id, review_id, reason, details, status, created_at").in("review_id", ids).eq("status", "open") : { data: [] },
        ids.length ? service.from("review_events").select("review_id, actor_type, actor_role, action, from_status, to_status, reason, created_at").in("review_id", ids).order("created_at", { ascending: true }) : { data: [] },
        placeIds.length ? service.from("places").select("id, slug, name, department_id").in("id", placeIds) : { data: [] },
        bizIds.length ? service.from("businesses").select("id, name").in("id", bizIds) : { data: [] },
        service.from("reviews").select("status, open_reports, flags"),
      ]);
      const totals: Record<string, number> = { reports: 0, flagged: 0 };
      ((totalsRows as { data: Record<string, unknown>[] | null }).data || []).forEach((r) => {
        totals[String(r.status)] = (totals[String(r.status)] || 0) + 1;
        if (Number(r.open_reports) > 0) totals.reports += 1;
        if (r.status === "pending" && Array.isArray(r.flags) && r.flags.length) totals.flagged += 1;
      });
      const placeMap = new Map(((places as { data: Record<string, unknown>[] | null }).data || []).map((p) => [p.id, p]));
      const bizMap = new Map(((businesses as { data: Record<string, unknown>[] | null }).data || []).map((b) => [b.id, b]));
      // Cuántas opiniones tiene cada autor en la página (detección de cuentas que opinan en masa).
      const perAuthor: Record<string, number> = {};
      rows.forEach((r) => { perAuthor[String(r.user_uid)] = (perAuthor[String(r.user_uid)] || 0) + 1; });
      return {
        total: count || 0, page, totals,
        items: rows.map((r) => ({
          ...r, user_uid: undefined, user_ref: maskUid(String(r.user_uid)), author_items_on_page: perAuthor[String(r.user_uid)],
          target: r.place_id ? { kind: "place", ...(placeMap.get(r.place_id) || { id: r.place_id }) } : { kind: "business", ...(bizMap.get(r.business_id) || { id: r.business_id }) },
          reports: ((reports as { data: Record<string, unknown>[] | null }).data || []).filter((x) => x.review_id === r.id),
          history: ((events as { data: Record<string, unknown>[] | null }).data || []).filter((x) => x.review_id === r.id),
        })),
      };
    }
    case "moderate": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.reviewId, "la opinión");
      const decision = String(body.decision || "");
      const map: Record<string, { status: string; event: string; needsReason: boolean }> = {
        approve: { status: "published", event: "approved", needsReason: false },
        reject: { status: "rejected", event: "rejected", needsReason: true },
        hide: { status: "hidden", event: "hidden", needsReason: true },
        mark_reported: { status: "reported", event: "marked_reported", needsReason: true },
      };
      const target = map[decision];
      if (!target) throw new HttpError(400, "Acción de moderación desconocida.", "decision_invalid");
      const reason = cleanText(body.reason, 500, { required: target.needsReason, min: target.needsReason ? 5 : 0, label: "el motivo", code: "reason" });
      const { data: before } = await service.from("reviews").select("id, user_uid, status, rating, place_id, business_id").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "La opinión no existe.", "not_found");
      if (before.status === "withdrawn") throw new HttpError(409, "La opinión fue retirada por su autor.", "withdrawn");
      const now = new Date().toISOString();
      const { error } = await service.from("reviews").update({
        status: target.status, moderation_reason: reason, moderated_by: a.email || a.uid, moderated_at: now,
      }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo aplicar la moderación.", "moderate_failed");
      await logEvent(service, { review_id: id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: target.event, from_status: before.status, to_status: target.status, reason });
      await audit(service, req, a, { action: `place_review_${decision}`, id, reason, before: { status: before.status }, after: { status: target.status }, description: `Opinión de lugar ${id}: ${before.status} → ${target.status}` });
      if (target.status === "published" || target.status === "rejected") {
        const kind = before.place_id ? "place" : "business";
        const ref = String(before.place_id || before.business_id);
        const place = await targetName(service, kind, ref);
        await notify(service, {
          recipient: String(before.user_uid), source: "resenas_lugares", refId: id,
          type: target.status === "published" ? "review_approved" : "review_rejected",
          titleKey: target.status === "published" ? "notify.placeReviewApprovedTitle" : "notify.placeReviewRejectedTitle",
          bodyKey: target.status === "published" ? "notify.placeReviewApprovedBody" : "notify.placeReviewRejectedBody",
          params: { place: place.slice(0, 120), ...(target.status === "rejected" && reason ? { reason: reason.slice(0, 300) } : {}) },
          link: targetLink(kind, ref),
          dedupeKey: `place-review:${id}:${target.status}:${now}`,
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
      const { data: before } = await service.from("reviews").select("id, user_uid, response_text, place_id, business_id").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "La opinión no existe.", "not_found");
      const now = new Date().toISOString();
      const { error } = await service.from("reviews").update(remove
        ? { response_text: null, response_by: null, response_at: null }
        : { response_text: text, response_by: a.email || a.uid, response_at: now }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo guardar la respuesta.", "respond_failed");
      await logEvent(service, { review_id: id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: remove ? "response_removed" : "responded" });
      await audit(service, req, a, { action: remove ? "place_review_response_removed" : "place_review_responded", id, before: { response_text: before.response_text }, after: { response_text: text }, description: `Respuesta oficial en opinión de lugar ${id}` });
      if (!remove) {
        const kind = before.place_id ? "place" : "business";
        const ref = String(before.place_id || before.business_id);
        await notify(service, {
          recipient: String(before.user_uid), source: "resenas_lugares", refId: id, type: "review_response",
          titleKey: "notify.placeReviewResponseTitle", bodyKey: "notify.placeReviewResponseBody",
          params: { place: (await targetName(service, kind, ref)).slice(0, 120) },
          link: targetLink(kind, ref), dedupeKey: `place-review:${id}:response:${now}`,
        });
      }
      return { responded: !remove };
    }
    case "resolve_report": {
      const a = requireAdmin(actor);
      const reportId = cleanUuid(body.reportId, "el reporte");
      const outcome = body.outcome === "dismissed" ? "dismissed" : "resolved";
      const reason = cleanText(body.reason, 500, { required: true, min: 5, label: "el motivo", code: "reason" });
      const { data: report } = await service.from("review_reports").select("id, review_id, status").eq("id", reportId).maybeSingle();
      if (!report || report.status !== "open") throw new HttpError(404, "El reporte no está abierto.", "not_found");
      await service.from("review_reports").update({ status: outcome, resolved_by: a.email || a.uid, resolved_at: new Date().toISOString() }).eq("id", reportId);
      const { data: review } = await service.from("reviews").select("open_reports").eq("id", report.review_id).maybeSingle();
      await service.from("reviews").update({ open_reports: Math.max(0, Number(review?.open_reports || 1) - 1) }).eq("id", report.review_id);
      await logEvent(service, { review_id: report.review_id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: "report_resolved", reason: `${outcome}: ${reason}` });
      await audit(service, req, a, { action: "place_review_report_resolved", id: report.review_id, reason, after: { report: reportId, outcome }, description: `Reporte ${reportId} ${outcome}` });
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
    const writes = new Set(["submit", "withdraw", "report", "moderate", "respond", "resolve_report"]);
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
    console.error("[baqueano-place-reviews]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos.", code: "internal" }, origin);
  }
});
