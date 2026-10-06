// ============================================================================
// 🧭 BAQUEANO — PRESENCIA REAL (supabase/functions/baqueano-presence/index.ts)
// ============================================================================
// 🎯 POR QUÉ:
// - El Ops Center no veía a las personas conectadas. La analítica depende del consentimiento,
//   no había ninguna métrica de "ahora", la sesión de Firebase nunca llegaba como usuario y
//   Android no enviaba nada. Esta función es la única puerta de la presencia operativa.
//
// ⚙️ CÓMO:
// - heartbeat (público):
//   - recibe un tab_id y un browser_id aleatorios que no se guardan en el dispositivo;
//   - plataforma, tipo de dispositivo, ruta e idioma;
//   - si llega x-firebase-token, se verifica con JWKS y se resuelve el rol del equipo
//     (effectiveStaffRole, con caché de 5 min); un token inválido no rompe: cuenta como visitante;
//   - límite de 240 latidos cada 10 min por IP (hash SHA-256, nunca en claro) y origen
//     permitido para la web; Android no manda Origin;
//   - sin IP, sin user agent y sin geolocalización en la base.
// - snapshot (equipo): personas, sesiones y pestañas en línea, plataformas, páginas ahora,
//   hoy, pico y feed "Actividad en vivo". Solo admin, superadmin o auditor.
// - v2 (2026-10-06): estados online/inactivo/offline, desglose Firebase (Google, correo,
//   invitados), tabla de usuarios conectados (nombre del token verificado; UID solo con sus
//   últimos 6 caracteres para la sección técnica) y etiqueta pública de página (p. ej. "granada").
//
// 📦 QUÉ: POST { action: 'heartbeat' | 'snapshot', ... }.
// ============================================================================
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
const PLATFORMS = new Set(["web", "pwa", "android"]);
const DEVICES = new Set(["mobile", "tablet", "desktop"]);
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);
const MAX_BODY = 4096;
const roleCache = new Map<string, { role: string; exp: number }>();

class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}
function originAllowed(origin: string | null) {
  return !!origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
}
function headers(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": originAllowed(origin) ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-firebase-token, apikey, x-client-info, authorization",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}
function reply(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}
async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}
function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Solo la ruta: sin query ni hash (pueden traer búsquedas o tokens).
  const path = value.split(/[?#]/)[0].replace(/[^A-Za-z0-9/_.\-]/g, "").slice(0, 200);
  return path || "/";
}

type Who = { uid: string; role: string; provider: string; name: string | null } | null;
const PROVIDERS: Record<string, string> = { "google.com": "google", password: "password", phone: "phone", "apple.com": "apple", anonymous: "anonymous", custom: "custom" };
async function resolveWho(req: Request, service: SupabaseClient, strict: boolean): Promise<Who> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) return null;
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    })).payload as Record<string, unknown>;
  } catch (_) {
    if (strict) throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
    return null;
  }
  const uid = String(claims.sub || "");
  if (!uid) return null;
  // Proveedor y nombre salen del token verificado, nunca de lo que diga el navegador.
  const fb = (claims.firebase || {}) as Record<string, unknown>;
  const provider = PROVIDERS[String(fb.sign_in_provider || "")] || "other";
  const name = typeof claims.name === "string" ? claims.name.replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || null : null;
  const cached = roleCache.get(uid);
  if (cached && cached.exp > Date.now()) return { uid, role: cached.role, provider, name };
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  const emailVerified = claims.email_verified === true;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && email && emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email, emailVerified, role });
  if (!role) role = "explorer";
  roleCache.set(uid, { role, exp: Date.now() + 5 * 60 * 1000 });
  if (roleCache.size > 5000) roleCache.clear();
  return { uid, role, provider, name };
}

async function heartbeat(body: Record<string, unknown>, req: Request, service: SupabaseClient, origin: string | null) {
  const platform = PLATFORMS.has(String(body.platform)) ? String(body.platform) : "web";
  if (platform !== "android" && !originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
  const tab = String(body.tab_id || ""), browser = String(body.browser_id || "");
  if (!ID_RE.test(tab) || !ID_RE.test(browser)) throw new HttpError(400, "Identificadores inválidos.", "bad_ids");

  const ipHash = (await sha256Hex(`presence:${clientIp(req)}`)).slice(0, 40);
  const { data: allowed, error: limitError } = await service.rpc("baqui_consume_budget", {
    p_bucket: `presence:${ipHash}`, p_limit: 240, p_window_seconds: 600,
  });
  if (limitError) throw new HttpError(503, "Límite no disponible.", "limit_check_failed");
  if (allowed === false) throw new HttpError(429, "Demasiados latidos.", "rate_limited");

  const who = await resolveWho(req, service, false);
  const label = typeof body.label === "string" && /^[A-Za-z0-9 _.-]{1,60}$/.test(body.label) ? body.label : null;
  const { error } = await service.rpc("presence_heartbeat_v2", {
    p_tab_id: tab,
    p_browser_id: browser,
    p_user_uid: who?.uid ?? null,
    p_user_role: who?.role ?? null,
    p_auth_provider: who?.provider ?? null,
    p_display_name: who?.name ?? null,
    p_label: label,
    p_platform: platform,
    p_device_class: DEVICES.has(String(body.device)) ? String(body.device) : "desktop",
    p_app_version: typeof body.app_version === "string" ? body.app_version.replace(/[^A-Za-z0-9._+-]/g, "").slice(0, 40) || null : null,
    p_path: cleanPath(body.path),
    p_language: LANGS.has(String(body.language)) ? String(body.language) : null,
    p_visible: body.visible !== false,
    p_leave: body.leave === true,
  });
  if (error) throw new HttpError(500, "No se pudo registrar la presencia.", "presence_failed");
  return { interval_visible: 25, interval_hidden: 60 };
}

async function snapshot(req: Request, service: SupabaseClient) {
  const who = await resolveWho(req, service, true);
  if (!who) throw new HttpError(401, "Iniciá sesión con tu cuenta del equipo.", "login_required");
  if (!STAFF_ROLES.has(who.role)) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede ver la presencia.", "forbidden");
  const [snap, feed] = await Promise.all([service.rpc("presence_snapshot_v2"), service.rpc("presence_feed_v2", { p_limit: 80 })]);
  if (snap.error || feed.error) throw new HttpError(500, "No se pudo leer la presencia.", "snapshot_failed");
  return { snapshot: snap.data, feed: feed.data, role: who.role };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Método no permitido." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) throw new HttpError(413, "Solicitud demasiado grande.", "too_large");
    let body: Record<string, unknown> = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (_) { throw new HttpError(400, "JSON inválido.", "bad_json"); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const action = String(body.action || "");
    if (action === "heartbeat") return reply(200, { ok: true, ...(await heartbeat(body, req, service, origin)) }, origin);
    if (action === "snapshot") return reply(200, { ok: true, ...(await snapshot(req, service)) }, origin);
    throw new HttpError(400, "Acción desconocida.", "unknown_action");
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-presence]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno.", code: "internal" }, origin);
  }
});
