// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: BUZÓN REAL (contacto, solicitudes de negocio, denuncias ambientales)
// ============================================================================
// 🎯 POR QUÉ:
// - Tres formularios públicos no guardaban nada (auditoría del Prompt Maestro Integral,
//   2026-10-06). El propietario exige este orden: guardar primero en Supabase, verlo en el Ops
//   Center con un código y usar el correo solo como aviso. Si el correo falla, el registro no se
//   pierde.
// - Las denuncias pueden ser anónimas. Para consultarlas se usa un código más un token privado,
//   nunca solo el número.
//
// ⚙️ CÓMO:
// 1. Origen permitido obligatorio en toda escritura desde el navegador (CSRF). Campo trampa
//    (honeypot), límites por IP (hash SHA-256, nunca en claro) con baqui_consume_budget, y clave de
//    idempotencia contra el doble envío.
// 2. Identidad opcional con el token de Firebase (jose + JWKS). Las solicitudes de negocio exigen
//    sesión para que el solicitante vea "Mis solicitudes" y nadie más.
// 3. Roles del equipo como en el resto del Ops Center (claim o staff_roles con revocación).
//    - Admin y superadmin gestionan; el auditor solo lee.
//    - Las evidencias solo las abre un admin, con URL firmada de 5 minutos.
// 4. Evidencias:
//    - El navegador sube a un bucket privado con una URL de subida firmada.
//    - La función confirma tamaño y tipo real leyendo los primeros bytes (firma del archivo).
// 5. Cada cambio deja un evento inmutable (intake_events). Las acciones del equipo, además, quedan
//    en audit_logs.
// 6. Correo: cola intake_notifications hacia el correo oficial.
//    - Si no hay proveedor configurado (RESEND_API_KEY), queda "not_configured", visible en el Ops
//      Center.
//    - No se afirma nunca un envío que no ocurrió.
//
// 📦 QUÉ (POST { action, ... }):
// - Público: contact_submit, eco_submit, eco_evidence_confirm, eco_status.
// - Con sesión: business_submit, my_applications.
// - Equipo: inbox_counts, inbox_list, inbox_update, eco_evidence_url, retry_notifications.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const OFFICIAL_EMAIL = "baqueanonicaragua@gmail.com";
const MAX_BODY_BYTES = 32 * 1024;
const EVIDENCE_BUCKET = "eco-evidence";
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);
const DEPARTMENTS = new Set(["Boaco", "Carazo", "Chinandega", "Chontales", "Estelí", "Granada", "Jinotega", "León", "Madriz",
  "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Rivas", "Río San Juan", "RACCN", "RACCS"]);
const CONTACT_SUBJECTS = new Set(["alianza", "destino", "negocio", "guia", "reporte", "prensa", "privacidad", "cookies", "otro"]);
const BUSINESS_CATEGORIES = new Set(["alojamiento", "restaurante", "gastronomia", "guia", "transporte", "finca", "turismo_rural",
  "artesania", "cultura", "musica", "experiencia", "day_pass", "alquiler_vehiculos", "otro"]);
const ECO_CATEGORIES = new Set(["tala_ilegal", "quema", "basura", "contaminacion_agua", "caza_trafico_fauna", "mineria",
  "invasion_area_protegida", "ruido", "otro"]);
const EVIDENCE_TYPES: Record<string, { max: number; ext: string }> = {
  "image/jpeg": { max: 10 * 1024 * 1024, ext: "jpg" },
  "image/png": { max: 10 * 1024 * 1024, ext: "png" },
  "image/webp": { max: 10 * 1024 * 1024, ext: "webp" },
  "video/mp4": { max: 50 * 1024 * 1024, ext: "mp4" },
  "video/webm": { max: 50 * 1024 * 1024, ext: "webm" },
  "video/quicktime": { max: 50 * 1024 * 1024, ext: "mov" },
};
const MAX_EVIDENCE = 6;
const STATUS = {
  contact: new Set(["new", "in_review", "answered", "closed"]),
  business: new Set(["submitted", "under_review", "needs_information", "approved", "rejected", "published"]),
  eco: new Set(["received", "under_review", "needs_information", "referred", "closed", "archived"]),
} as const;
const TABLE = { contact: "contact_messages", business: "business_applications", eco: "eco_reports" } as const;
type Kind = keyof typeof TABLE;

type Actor = { uid: string; email: string | null; emailVerified: boolean; name: string; role: string; isAdmin: boolean; isAuditor: boolean };
class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function originAllowed(origin: string | null) {
  return !!origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
}
function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": originAllowed(origin) ? origin! : "https://baqueanonicaragua.com",
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

function cleanText(value: unknown, max: number, opts: { required?: boolean; min?: number; label: string; code: string }): string | null {
  if (value == null || value === "") {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${opts.label} no es texto.`, `${opts.code}_invalid`);
  const text = value.normalize("NFC")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[​-‏‪-‮⁦-⁩]/g, "")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (opts.min && text.length < opts.min) throw new HttpError(400, `${opts.label} es demasiado corto (mínimo ${opts.min} caracteres).`, `${opts.code}_short`);
  if (text.length > max) throw new HttpError(400, `${opts.label} supera ${max} caracteres.`, `${opts.code}_long`);
  return text;
}
function cleanEmail(value: unknown, required: boolean): string | null {
  const text = cleanText(value, 254, { required, label: "el correo electrónico", code: "email" });
  if (!text) return null;
  const email = text.toLowerCase();
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(email)) throw new HttpError(400, "El correo electrónico no es válido.", "email_invalid");
  return email;
}
function cleanPhone(value: unknown, label: string): string | null {
  const text = cleanText(value, 40, { label, code: "phone" });
  if (!text) return null;
  if (!/^\+?[\d\s().-]{7,25}$/.test(text)) throw new HttpError(400, `${label} no es válido.`, "phone_invalid");
  return text;
}
function cleanHttpsUrl(value: unknown, label: string): string | null {
  const text = cleanText(value, 300, { label, code: "url" });
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") throw new Error("no https");
    return url.toString();
  } catch (_) {
    throw new HttpError(400, `${label} debe ser una dirección https:// válida.`, "url_invalid");
  }
}
function cleanDepartment(value: unknown, required: boolean): string | null {
  const text = cleanText(value, 60, { required, label: "el departamento o región", code: "department" });
  if (!text) return null;
  if (!DEPARTMENTS.has(text)) throw new HttpError(400, "Elegí un departamento o región de la lista.", "department_invalid");
  return text;
}
function cleanCoord(lat: unknown, lng: unknown): { lat: number | null; lng: number | null } {
  if (lat == null && lng == null) return { lat: null, lng: null };
  const a = Number(lat), b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 10.5 || a > 15.2 || b < -88 || b > -82.5) {
    throw new HttpError(400, "La ubicación marcada está fuera de Nicaragua. Revisá el punto en el mapa.", "coords_invalid");
  }
  return { lat: Math.round(a * 1e6) / 1e6, lng: Math.round(b * 1e6) / 1e6 };
}
function cleanLang(value: unknown) { return typeof value === "string" && LANGS.has(value) ? value : "es"; }
function cleanUuid(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, `${label} inválido.`, "id_invalid");
  }
  return value.toLowerCase();
}
function cleanKey(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,80}$/.test(value) ? value : null;
}
async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}
function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// ---------------------------------------------------------------------------
// Identidad, permisos y límites
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
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email, emailVerified, role });
  if (!role) role = "explorer";
  const name = (typeof claims.name === "string" ? claims.name : "").replace(/\s+/g, " ").trim().slice(0, 120);
  return { uid, email, emailVerified, name, role, isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}
function requireActor(actor: Actor | null, message: string): Actor {
  if (!actor) throw new HttpError(401, message, "login_required");
  return actor;
}
function requireStaffReader(actor: Actor | null): Actor {
  const a = requireActor(actor, "Iniciá sesión con tu cuenta del equipo.");
  if (!a.isAdmin && !a.isAuditor) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede ver el buzón.", "forbidden");
  return a;
}
function requireAdmin(actor: Actor | null): Actor {
  const a = requireActor(actor, "Iniciá sesión con tu cuenta del equipo.");
  if (!a.isAdmin) throw new HttpError(403, "Solo administradores pueden gestionar el buzón.", "forbidden");
  return a;
}
async function ipHash(req: Request) { return (await sha256Hex(`intake:${clientIp(req)}`)).slice(0, 40); }
async function limitIp(service: SupabaseClient, hash: string, bucket: string, limit: number, windowSeconds: number) {
  const { data, error } = await service.rpc("baqui_consume_budget", { p_bucket: `intake:${bucket}:${hash}`, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) throw new HttpError(503, "No pudimos verificar el límite de envíos. Intentá de nuevo en un momento.", "limit_check_failed");
  if (data === false) throw new HttpError(429, "Recibimos varios envíos seguidos desde tu conexión. Esperá unos minutos y volvé a intentarlo.", "rate_limited");
}

async function logEvent(service: SupabaseClient, e: { kind: Kind; ref_id: string; actor_type: string; actor_ref?: string | null; actor_role?: string | null; action: string; from_status?: string | null; to_status?: string | null; note?: string | null }) {
  const { error } = await service.from("intake_events").insert({
    kind: e.kind, ref_id: e.ref_id, actor_type: e.actor_type, actor_ref: e.actor_ref ?? null, actor_role: e.actor_role ?? null,
    action: e.action, from_status: e.from_status ?? null, to_status: e.to_status ?? null, note: e.note ?? null,
  });
  if (error) console.error("[baqueano-intake] evento no registrado", error.message);
}
async function audit(service: SupabaseClient, req: Request, actor: Actor, entry: { kind: Kind; action: string; id: string; reason?: string | null; before?: unknown; after?: unknown; description: string }) {
  await service.from("audit_logs").insert({
    admin_email: actor.email || actor.uid,
    actor_role: actor.role,
    ip_address: clientIp(req) === "unknown" ? null : clientIp(req),
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action: entry.action,
    module: "buzon",
    entity_type: entry.kind,
    entity_id: entry.id,
    target_entity: TABLE[entry.kind],
    target_id: entry.id,
    reason: entry.reason || null,
    description: entry.description.slice(0, 500),
    old_values: (entry.before ?? null) as Record<string, unknown> | null,
    new_values: (entry.after ?? null) as Record<string, unknown> | null,
    payload: { uid: actor.uid, role: actor.role, origin: "ops-center" },
  });
}

// ---------------------------------------------------------------------------
// Aviso por correo (cola). El registro ya está guardado: un fallo aquí no pierde nada.
// ---------------------------------------------------------------------------
async function notify(service: SupabaseClient, kind: Kind, refId: string, subject: string, lines: string[]) {
  const { data: row } = await service.from("intake_notifications").insert({ kind, ref_id: refId, recipient: OFFICIAL_EMAIL }).select("id").single();
  if (!row) return;
  await deliver(service, row.id, subject, lines);
}
async function deliver(service: SupabaseClient, notificationId: string, subject: string, lines: string[]) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("INTAKE_FROM_EMAIL");
  if (!key || !from) {
    await service.from("intake_notifications").update({ status: "not_configured", error: "Falta configurar RESEND_API_KEY e INTAKE_FROM_EMAIL." }).eq("id", notificationId);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [OFFICIAL_EMAIL], subject,
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0D1B2A">${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}<p style="color:#64748B">Abrí el Ops Center de BAQUEANO para ver el detalle completo.</p></div>`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    const { data: current } = await service.from("intake_notifications").select("attempts").eq("id", notificationId).single();
    await service.from("intake_notifications").update({
      status: res.ok ? "sent" : "failed",
      attempts: Number(current?.attempts || 0) + 1,
      message_id: res.ok ? String((data as Record<string, unknown>).id || "") : null,
      error: res.ok ? null : String((data as Record<string, unknown>).message || `HTTP ${res.status}`).slice(0, 300),
    }).eq("id", notificationId);
  } catch (err) {
    await service.from("intake_notifications").update({ status: "failed", error: (err instanceof Error ? err.message : "error").slice(0, 300) }).eq("id", notificationId);
  }
}

// Revisa el tipo real del archivo leyendo sus primeros bytes (firma), no solo la extensión.
function sniffMime(bytes: Uint8Array): string | null {
  const hex = Array.from(bytes.slice(0, 12)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") return "image/webp";
  if (hex.startsWith("1a45dfa3")) return "video/webm";
  if (hex.slice(8, 16) === "66747970") {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    return brand === "qt  " ? "video/quicktime" : "video/mp4";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Columnas que ve el equipo (sin el hash del token ni la IP)
// ---------------------------------------------------------------------------
const STAFF_COLUMNS: Record<Kind, string> = {
  contact: "id, code, user_id, name, email, phone, subject, department, message, language, status, internal_notes, handled_by, created_at, updated_at, answered_at, closed_at",
  business: "id, code, user_id, business_name, trade_name, owner_name, owner_role, phone, whatsapp, email, website, socials, department, municipality, community, address, lat, lng, category, short_description, description, offerings, audience, schedule, season, capacity, languages, price_info, sustainability, local_impact, consents, language, status, review_notes, applicant_message, reviewed_by, submitted_at, review_started_at, reviewed_at, approved_at, rejected_at, published_at, created_at, updated_at",
  eco: "id, code, user_id, anonymous, contact_name, contact_email, contact_phone, category, severity, description, incident_at, incident_time_unsure, department, municipality, community, reference, lat, lng, location_source, language, status, priority, assignee, internal_notes, public_note, referred_to, referred_at, referred_by, reference_number, delivery_method, delivery_status, created_at, updated_at, closed_at",
};

function maskUid(uid: string | null) {
  if (!uid) return null;
  return uid.length <= 6 ? "******" : `${uid.slice(0, 4)}…${uid.slice(-2)}`;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, req: Request, service: SupabaseClient) {
  switch (action) {
    case "contact_submit": {
      if (typeof body.website === "string" && body.website.trim()) return { accepted: true };
      const hash = await ipHash(req);
      await limitIp(service, hash, "contact", 5, 600);
      const key = cleanKey(body.idempotencyKey);
      if (key) {
        const { data: prior } = await service.from("contact_messages").select("code, status").eq("idempotency_key", key).maybeSingle();
        if (prior) return { code: prior.code, status: prior.status, duplicate: true };
      }
      const subject = String(body.subject || "");
      if (!CONTACT_SUBJECTS.has(subject)) throw new HttpError(400, "Elegí el tipo de consulta.", "subject_required");
      const row = {
        user_id: actor?.uid || null,
        name: cleanText(body.name, 120, { required: true, min: 2, label: "tu nombre", code: "name" }),
        email: cleanEmail(body.email, true),
        phone: cleanPhone(body.phone, "El teléfono"),
        subject,
        department: cleanDepartment(body.department, false),
        message: cleanText(body.message, 4000, { required: true, min: 10, label: "tu mensaje", code: "message" }),
        language: cleanLang(body.language),
        ip_hash: hash,
        idempotency_key: key,
      };
      const { data: code, error: codeError } = await service.rpc("next_intake_code", { p_kind: "contact" });
      if (codeError || !code) throw new HttpError(500, "No pudimos generar el código de tu mensaje. Intentá de nuevo.", "code_failed");
      const { data, error } = await service.from("contact_messages").insert({ ...row, code }).select("id, code, status").single();
      if (error || !data) throw new HttpError(500, "No pudimos guardar tu mensaje. Intentá de nuevo en unos minutos.", "save_failed");
      await logEvent(service, { kind: "contact", ref_id: data.id, actor_type: actor ? "user" : "anonymous", actor_ref: actor?.uid, action: "created", to_status: "new" });
      await notify(service, "contact", data.id, `[BAQUEANO] Nuevo mensaje ${data.code}`, [
        `Código: ${data.code}`, `Tipo: ${subject}`, `Nombre: ${row.name}`, `Correo: ${row.email}`, row.department ? `Territorio: ${row.department}` : "",
      ].filter(Boolean));
      return { code: data.code, status: data.status };
    }

    case "business_submit": {
      const a = requireActor(actor, "Para postular tu negocio necesitás iniciar sesión. Así podés seguir el estado de tu solicitud en “Mis solicitudes”.");
      if (typeof body.website_trap === "string" && body.website_trap.trim()) return { accepted: true };
      const hash = await ipHash(req);
      await limitIp(service, hash, "business", 6, 3600);
      const key = cleanKey(body.idempotencyKey);
      if (key) {
        const { data: prior } = await service.from("business_applications").select("code, status, user_id").eq("idempotency_key", key).maybeSingle();
        if (prior && prior.user_id === a.uid) return { code: prior.code, status: prior.status, duplicate: true };
      }
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      const { count } = await service.from("business_applications").select("id", { count: "exact", head: true }).eq("user_id", a.uid).gte("created_at", since);
      if ((count || 0) >= 3) throw new HttpError(429, "Ya enviaste 3 solicitudes hoy. Si necesitás corregir algo, esperá la respuesta del equipo.", "rate_limited");
      const category = String(body.category || "");
      if (!BUSINESS_CATEGORIES.has(category)) throw new HttpError(400, "Elegí la categoría de tu negocio.", "category_required");
      if (body.consentData !== true || body.consentTruth !== true) {
        throw new HttpError(400, "Para enviar la solicitud tenés que aceptar el tratamiento de datos y confirmar que la información es verdadera.", "consent_required");
      }
      const coords = cleanCoord(body.lat, body.lng);
      const langs = Array.isArray(body.languages) ? body.languages.filter((l) => typeof l === "string" && LANGS.has(l)).slice(0, 6) : [];
      const socials: Record<string, string> = {};
      for (const net of ["instagram", "facebook", "tiktok"]) {
        const value = cleanText((body.socials as Record<string, unknown> | undefined)?.[net], 120, { label: net, code: "social" });
        if (value) socials[net] = value;
      }
      const row = {
        user_id: a.uid,
        business_name: cleanText(body.businessName, 160, { required: true, min: 2, label: "el nombre del negocio", code: "business_name" }),
        trade_name: cleanText(body.tradeName, 160, { label: "el nombre comercial", code: "trade_name" }),
        owner_name: cleanText(body.ownerName, 120, { required: true, min: 2, label: "el nombre del responsable", code: "owner_name" }),
        owner_role: cleanText(body.ownerRole, 80, { label: "el cargo", code: "owner_role" }),
        phone: cleanPhone(body.phone, "El teléfono"),
        whatsapp: cleanPhone(body.whatsapp, "El WhatsApp"),
        email: cleanEmail(body.email, true),
        website: cleanHttpsUrl(body.website, "El sitio web"),
        socials,
        department: cleanDepartment(body.department, true),
        municipality: cleanText(body.municipality, 80, { label: "el municipio", code: "municipality" }),
        community: cleanText(body.community, 120, { label: "la comunidad", code: "community" }),
        address: cleanText(body.address, 300, { label: "la dirección", code: "address" }),
        lat: coords.lat, lng: coords.lng,
        category,
        short_description: cleanText(body.shortDescription, 300, { required: true, min: 20, label: "la descripción corta", code: "short_description" }),
        description: cleanText(body.description, 4000, { label: "la descripción", code: "description" }),
        offerings: cleanText(body.offerings, 2000, { label: "lo que ofrecés", code: "offerings" }),
        audience: cleanText(body.audience, 600, { label: "el público", code: "audience" }),
        schedule: cleanText(body.schedule, 600, { label: "los horarios", code: "schedule" }),
        season: cleanText(body.season, 300, { label: "la temporada", code: "season" }),
        capacity: cleanText(body.capacity, 120, { label: "la capacidad", code: "capacity" }),
        languages: langs,
        price_info: cleanText(body.priceInfo, 1000, { label: "los precios", code: "price_info" }),
        sustainability: cleanText(body.sustainability, 2000, { label: "las prácticas sostenibles", code: "sustainability" }),
        local_impact: cleanText(body.localImpact, 2000, { label: "el impacto local", code: "local_impact" }),
        consents: { data: true, truth: true, contact: body.consentContact === true, version: "red-baqueano-v1-2026-10-06", at: new Date().toISOString() },
        language: cleanLang(body.language),
        idempotency_key: key,
      };
      const { data: code, error: codeError } = await service.rpc("next_intake_code", { p_kind: "business" });
      if (codeError || !code) throw new HttpError(500, "No pudimos generar el código de tu solicitud. Intentá de nuevo.", "code_failed");
      const { data, error } = await service.from("business_applications").insert({ ...row, code }).select("id, code, status").single();
      if (error || !data) throw new HttpError(500, "No pudimos guardar tu solicitud. Intentá de nuevo en unos minutos.", "save_failed");
      await logEvent(service, { kind: "business", ref_id: data.id, actor_type: "user", actor_ref: a.uid, action: "submitted", to_status: "submitted" });
      await notify(service, "business", data.id, `[BAQUEANO] Nueva solicitud de negocio ${data.code}`, [
        `Código: ${data.code}`, `Negocio: ${row.business_name}`, `Categoría: ${category}`, `Territorio: ${row.department}`, `Responsable: ${row.owner_name}`,
      ]);
      return { code: data.code, status: data.status };
    }

    case "my_applications": {
      const a = requireActor(actor, "Iniciá sesión para ver tus solicitudes.");
      const { data, error } = await service.from("business_applications")
        .select("code, business_name, category, department, status, applicant_message, submitted_at, reviewed_at, published_at, updated_at")
        .eq("user_id", a.uid).order("created_at", { ascending: false }).limit(20);
      if (error) throw new HttpError(500, "No se pudieron leer tus solicitudes.", "read_failed");
      return { items: data || [] };
    }

    case "eco_submit": {
      if (typeof body.website === "string" && body.website.trim()) return { accepted: true };
      const hash = await ipHash(req);
      await limitIp(service, hash, "eco", 5, 600);
      const key = cleanKey(body.idempotencyKey);
      if (key) {
        const { data: prior } = await service.from("eco_reports").select("code").eq("idempotency_key", key).maybeSingle();
        if (prior) throw new HttpError(409, `Este reporte ya fue recibido con el código ${prior.code}.`, "duplicate");
      }
      const category = String(body.category || "");
      if (!ECO_CATEGORIES.has(category)) throw new HttpError(400, "Elegí la categoría del problema ambiental.", "category_required");
      const anonymous = body.anonymous !== false;
      const coords = cleanCoord(body.lat, body.lng);
      const locationSource = ["map", "gps", "address"].includes(String(body.locationSource)) && coords.lat != null ? String(body.locationSource) : (body.reference ? "address" : "none");
      let incidentAt: string | null = null;
      if (body.incidentAt) {
        const d = new Date(String(body.incidentAt));
        if (!Number.isFinite(d.getTime()) || d.getTime() > Date.now() + 3600_000 || d.getTime() < Date.now() - 5 * 365 * 24 * 3600_000) {
          throw new HttpError(400, "La fecha del incidente no es válida.", "incident_at_invalid");
        }
        incidentAt = d.toISOString();
      }
      const evidence = Array.isArray(body.evidence) ? body.evidence.slice(0, MAX_EVIDENCE + 1) : [];
      if (evidence.length > MAX_EVIDENCE) throw new HttpError(400, `Podés adjuntar hasta ${MAX_EVIDENCE} archivos.`, "evidence_too_many");
      const files = evidence.map((item) => {
        const type = String((item as Record<string, unknown>)?.type || "");
        const size = Number((item as Record<string, unknown>)?.size || 0);
        const rule = EVIDENCE_TYPES[type];
        if (!rule) throw new HttpError(400, "Solo se aceptan fotos JPG, PNG o WebP y videos MP4, WebM o MOV.", "evidence_type");
        if (!(size > 0) || size > rule.max) throw new HttpError(400, type.startsWith("video") ? "Cada video puede pesar hasta 50 MB." : "Cada foto puede pesar hasta 10 MB.", "evidence_size");
        return { type, size, ext: rule.ext };
      });
      const severity = ["baja", "media", "alta"].includes(String(body.severity)) ? String(body.severity) : null;
      const token = randomToken();
      const row = {
        user_id: actor?.uid || null,
        anonymous,
        contact_name: anonymous ? null : cleanText(body.contactName, 120, { label: "tu nombre", code: "contact_name" }),
        contact_email: anonymous ? null : cleanEmail(body.contactEmail, false),
        contact_phone: anonymous ? null : cleanPhone(body.contactPhone, "El teléfono"),
        category, severity,
        description: cleanText(body.description, 4000, { required: true, min: 20, label: "la descripción", code: "description" }),
        incident_at: incidentAt,
        incident_time_unsure: body.incidentTimeUnsure === true,
        department: cleanDepartment(body.department, true),
        municipality: cleanText(body.municipality, 80, { label: "el municipio", code: "municipality" }),
        community: cleanText(body.community, 120, { label: "la comunidad o comarca", code: "community" }),
        reference: cleanText(body.reference, 600, { label: "la referencia", code: "reference" }),
        lat: coords.lat, lng: coords.lng,
        location_source: locationSource,
        language: cleanLang(body.language),
        lookup_token_hash: await sha256Hex(token),
        ip_hash: hash,
        idempotency_key: key,
      };
      const { data: code, error: codeError } = await service.rpc("next_intake_code", { p_kind: "eco" });
      if (codeError || !code) throw new HttpError(500, "No pudimos generar el código del reporte. Intentá de nuevo.", "code_failed");
      const { data, error } = await service.from("eco_reports").insert({ ...row, code }).select("id, code, status, created_at").single();
      if (error || !data) throw new HttpError(500, "No pudimos guardar el reporte. Intentá de nuevo en unos minutos.", "save_failed");
      await logEvent(service, { kind: "eco", ref_id: data.id, actor_type: actor ? "user" : "anonymous", actor_ref: actor?.uid, action: "received", to_status: "received" });
      const uploads: Array<Record<string, unknown>> = [];
      for (const file of files) {
        const path = `${data.id}/${crypto.randomUUID()}.${file.ext}`;
        const { data: signed, error: signError } = await service.storage.from(EVIDENCE_BUCKET).createSignedUploadUrl(path);
        if (signError || !signed) continue;
        const { data: ev } = await service.from("eco_report_evidence").insert({ report_id: data.id, storage_path: path, file_type: file.type, file_size: file.size }).select("id").single();
        if (ev) uploads.push({ evidenceId: ev.id, path, token: signed.token, signedUrl: signed.signedUrl });
      }
      await notify(service, "eco", data.id, `[BAQUEANO] Nueva denuncia ambiental ${data.code}`, [
        `Código: ${data.code}`, `Categoría: ${category}`, `Territorio: ${row.department}${row.municipality ? " · " + row.municipality : ""}`,
        `Evidencias anunciadas: ${files.length}`, anonymous ? "Reporte anónimo" : "Con datos de contacto (ver en el Ops Center)",
      ]);
      return { code: data.code, status: data.status, createdAt: data.created_at, lookupToken: token, uploads };
    }

    case "eco_evidence_confirm": {
      const code = cleanText(body.code, 40, { required: true, label: "el código", code: "code" })!;
      const token = cleanText(body.lookupToken, 80, { required: true, label: "el token", code: "token" })!;
      const { data: report } = await service.from("eco_reports").select("id, lookup_token_hash").eq("code", code).maybeSingle();
      if (!report || report.lookup_token_hash !== await sha256Hex(token)) throw new HttpError(404, "No encontramos ese reporte.", "not_found");
      const ids = Array.isArray(body.evidenceIds) ? body.evidenceIds.slice(0, MAX_EVIDENCE).map((v) => cleanUuid(v, "La evidencia")) : [];
      const results: Array<Record<string, unknown>> = [];
      for (const id of ids) {
        const { data: ev } = await service.from("eco_report_evidence").select("id, storage_path, file_type, file_size, status").eq("id", id).eq("report_id", report.id).maybeSingle();
        if (!ev || ev.status !== "pending") continue;
        const { data: signed } = await service.storage.from(EVIDENCE_BUCKET).createSignedUrl(ev.storage_path, 60);
        let ok = false;
        let sha: string | null = null;
        if (signed?.signedUrl) {
          const head = await fetch(signed.signedUrl, { headers: { Range: "bytes=0-31" } }).catch(() => null);
          if (head && (head.status === 206 || head.status === 200)) {
            const bytes = new Uint8Array(await head.arrayBuffer());
            const sniffed = sniffMime(bytes);
            const total = Number((head.headers.get("content-range") || "").split("/")[1] || head.headers.get("content-length") || 0);
            const sameFamily = sniffed === ev.file_type || (sniffed === "video/mp4" && ev.file_type === "video/quicktime") || (sniffed === "video/quicktime" && ev.file_type === "video/mp4");
            ok = !!sniffed && sameFamily && total > 0 && total <= Number(ev.file_size) + 1024;
            if (ok && ev.file_type.startsWith("image/")) {
              const full = await fetch(signed.signedUrl).catch(() => null);
              if (full && full.ok) sha = await sha256Hex(new Uint8Array(await full.arrayBuffer()));
            }
          }
        }
        await service.from("eco_report_evidence").update({ status: ok ? "stored" : "rejected", sha256: sha, confirmed_at: new Date().toISOString() }).eq("id", ev.id);
        results.push({ evidenceId: ev.id, stored: ok });
      }
      await logEvent(service, { kind: "eco", ref_id: report.id, actor_type: "system", action: "evidence_confirmed", note: `${results.filter((r) => r.stored).length} de ${results.length} archivos guardados` });
      return { results };
    }

    case "eco_status": {
      const hash = await ipHash(req);
      await limitIp(service, hash, "eco-status", 20, 600);
      const code = cleanText(body.code, 40, { required: true, label: "el código", code: "code" })!;
      const token = cleanText(body.lookupToken, 80, { required: true, label: "el token privado", code: "token" })!;
      const { data: report } = await service.from("eco_reports").select("id, code, category, department, municipality, status, public_note, referred_at, delivery_status, created_at, updated_at, lookup_token_hash").eq("code", code).maybeSingle();
      if (!report || report.lookup_token_hash !== await sha256Hex(token)) throw new HttpError(404, "No encontramos un reporte con ese código y token.", "not_found");
      const { count } = await service.from("eco_report_evidence").select("id", { count: "exact", head: true }).eq("report_id", report.id).eq("status", "stored");
      const { lookup_token_hash: _omit, id: _id, ...publicView } = report;
      return { report: { ...publicView, evidence_count: count || 0 } };
    }

    case "inbox_counts": {
      requireStaffReader(actor);
      const out: Record<string, Record<string, number>> = {};
      for (const kind of Object.keys(TABLE) as Kind[]) {
        const { data } = await service.from(TABLE[kind]).select("status");
        const totals: Record<string, number> = {};
        (data || []).forEach((r: { status: string }) => { totals[r.status] = (totals[r.status] || 0) + 1; });
        out[kind] = totals;
      }
      const { data: notes } = await service.from("intake_notifications").select("status");
      const notifications: Record<string, number> = {};
      (notes || []).forEach((r: { status: string }) => { notifications[r.status] = (notifications[r.status] || 0) + 1; });
      return { counts: out, notifications };
    }

    case "inbox_list": {
      const a = requireStaffReader(actor);
      const kind = String(body.kind || "") as Kind;
      if (!(kind in TABLE)) throw new HttpError(400, "Bandeja desconocida.", "kind_invalid");
      const status = String(body.status || "");
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 500);
      let q = service.from(TABLE[kind]).select(STAFF_COLUMNS[kind], { count: "exact" });
      if (status && STATUS[kind].has(status)) q = q.eq("status", status);
      const { data, error, count } = await q.order("created_at", { ascending: false }).range(page * 20, page * 20 + 19);
      if (error) throw new HttpError(500, "No se pudo leer la bandeja.", "read_failed");
      const rows = (data || []) as Array<Record<string, unknown>>;
      const ids = rows.map((r) => r.id as string);
      const events = ids.length ? (await service.from("intake_events").select("ref_id, actor_type, actor_role, action, from_status, to_status, note, created_at").eq("kind", kind).in("ref_id", ids).order("created_at")).data || [] : [];
      const notifications = ids.length ? (await service.from("intake_notifications").select("ref_id, status, attempts, error, updated_at").eq("kind", kind).in("ref_id", ids)).data || [] : [];
      const evidence = kind === "eco" && ids.length ? (await service.from("eco_report_evidence").select("id, report_id, file_type, file_size, status, sha256, created_at").in("report_id", ids)).data || [] : [];
      return {
        total: count || 0, page, readOnly: !a.isAdmin,
        items: rows.map((r) => ({
          ...r, user_id: undefined, user_ref: maskUid(r.user_id as string | null),
          history: events.filter((e: Record<string, unknown>) => e.ref_id === r.id),
          notification: notifications.find((n: Record<string, unknown>) => n.ref_id === r.id) || null,
          evidence: evidence.filter((e: Record<string, unknown>) => e.report_id === r.id),
        })),
      };
    }

    case "inbox_update": {
      const a = requireAdmin(actor);
      const kind = String(body.kind || "") as Kind;
      if (!(kind in TABLE)) throw new HttpError(400, "Bandeja desconocida.", "kind_invalid");
      const id = cleanUuid(body.id, "El registro");
      const { data: before } = await service.from(TABLE[kind]).select("*").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "El registro no existe.", "not_found");
      const patch: Record<string, unknown> = {};
      const now = new Date().toISOString();
      const note = cleanText(body.note, 1000, { label: "la nota", code: "note" });
      if (body.status != null) {
        const status = String(body.status);
        if (!STATUS[kind].has(status)) throw new HttpError(400, "Estado no válido para esta bandeja.", "status_invalid");
        if (["rejected", "needs_information", "archived"].includes(status) && !note) {
          throw new HttpError(400, "Escribí una nota que explique el cambio de estado (queda en la auditoría).", "note_required");
        }
        patch.status = status;
        if (kind === "contact") {
          if (status === "answered") patch.answered_at = now;
          if (status === "closed") patch.closed_at = now;
        }
        if (kind === "business") {
          if (status === "under_review" && !before.review_started_at) patch.review_started_at = now;
          if (["approved", "rejected", "needs_information"].includes(status)) { patch.reviewed_at = now; patch.reviewed_by = a.email || a.uid; }
          if (status === "approved") patch.approved_at = now;
          if (status === "rejected") patch.rejected_at = now;
          if (status === "published") {
            if (!before.approved_at) throw new HttpError(409, "Primero aprobá la solicitud; publicar es una etapa posterior.", "not_approved");
            patch.published_at = now;
          }
        }
        if (kind === "eco" && ["closed", "archived"].includes(status)) patch.closed_at = now;
      }
      if (body.internalNotes != null) patch[kind === "business" ? "review_notes" : "internal_notes"] = cleanText(body.internalNotes, 4000, { label: "las notas internas", code: "internal_notes" });
      if (kind === "contact") patch.handled_by = a.email || a.uid;
      if (kind === "business" && body.applicantMessage != null) patch.applicant_message = cleanText(body.applicantMessage, 2000, { label: "el mensaje al solicitante", code: "applicant_message" });
      if (kind === "eco") {
        if (body.priority != null) {
          if (!["baja", "normal", "alta", "urgente"].includes(String(body.priority))) throw new HttpError(400, "Prioridad no válida.", "priority_invalid");
          patch.priority = String(body.priority);
        }
        if (body.assignee != null) patch.assignee = cleanText(body.assignee, 120, { label: "el responsable", code: "assignee" });
        if (body.publicNote != null) patch.public_note = cleanText(body.publicNote, 1000, { label: "la nota pública", code: "public_note" });
        if (body.referral && typeof body.referral === "object") {
          const r = body.referral as Record<string, unknown>;
          const method = String(r.deliveryMethod || "");
          if (!["manual", "email", "api", "official_portal", "other"].includes(method)) throw new HttpError(400, "Elegí cómo se derivó el reporte.", "delivery_method_invalid");
          const deliveryStatus = String(r.deliveryStatus || "pending");
          if (!["pending", "sent", "failed", "external_confirmed"].includes(deliveryStatus)) throw new HttpError(400, "Estado de entrega no válido.", "delivery_status_invalid");
          patch.referred_to = cleanText(r.referredTo, 160, { required: true, label: "la institución destino", code: "referred_to" });
          patch.reference_number = cleanText(r.referenceNumber, 80, { label: "el número de referencia", code: "reference_number" });
          patch.delivery_method = method;
          patch.delivery_status = deliveryStatus;
          patch.referred_at = now;
          patch.referred_by = a.email || a.uid;
          patch.status = "referred";
        }
      }
      if (!Object.keys(patch).length) throw new HttpError(400, "No hay cambios para guardar.", "no_changes");
      const { error } = await service.from(TABLE[kind]).update(patch).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo guardar el cambio.", "update_failed");
      await logEvent(service, { kind, ref_id: id, actor_type: "admin", actor_ref: a.email || a.uid, actor_role: a.role, action: patch.referred_to ? "referred" : (patch.status ? "status_changed" : "updated"), from_status: String(before.status), to_status: String(patch.status || before.status), note });
      const keys = Object.keys(patch);
      await audit(service, req, a, {
        kind, action: `intake_${kind}_update`, id, reason: note,
        before: Object.fromEntries(keys.map((k) => [k, before[k] ?? null])), after: patch,
        description: `${before.code}: ${keys.join(", ")}`,
      });
      return { updated: true };
    }

    case "eco_evidence_url": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.evidenceId, "La evidencia");
      const { data: ev } = await service.from("eco_report_evidence").select("id, report_id, storage_path, status").eq("id", id).maybeSingle();
      if (!ev || ev.status !== "stored") throw new HttpError(404, "La evidencia no está disponible.", "not_found");
      const { data: signed } = await service.storage.from(EVIDENCE_BUCKET).createSignedUrl(ev.storage_path, 300);
      if (!signed?.signedUrl) throw new HttpError(500, "No se pudo abrir la evidencia.", "sign_failed");
      await audit(service, req, a, { kind: "eco", action: "intake_eco_evidence_view", id: ev.report_id, description: `Evidencia ${ev.id} abierta` });
      return { url: signed.signedUrl, expiresIn: 300 };
    }

    case "retry_notifications": {
      requireAdmin(actor);
      const { data } = await service.from("intake_notifications").select("id, kind, ref_id").in("status", ["pending", "failed", "not_configured"]).lt("attempts", 5).limit(20);
      let retried = 0;
      for (const n of data || []) {
        const { data: rec } = await service.from(TABLE[n.kind as Kind]).select("code").eq("id", n.ref_id).maybeSingle();
        await deliver(service, n.id, `[BAQUEANO] Registro ${rec?.code || ""} pendiente de revisión`, [`Código: ${rec?.code || "—"}`, `Bandeja: ${n.kind}`]);
        retried += 1;
      }
      return { retried };
    }

    default:
      throw new HttpError(400, "Acción desconocida.", "unknown_action");
  }
}

const WRITES = new Set(["contact_submit", "business_submit", "eco_submit", "eco_evidence_confirm", "inbox_update", "retry_notifications"]);

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
    if (WRITES.has(action) && !originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(action, body, actor, req, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-intake]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos.", code: "internal" }, origin);
  }
});
