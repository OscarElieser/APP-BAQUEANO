// ============================================================================
// 🧭 BAQUEANO — CENTRO DE NOTIFICACIONES (supabase/functions/baqueano-notifications)
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario pidió una campana 🔔 en la web y en Android, con estados nueva / leída /
//   archivada y un contador que cambie sin F5. Firebase autentica y Supabase registra: esta
//   función es la única puerta, para web y app por igual.
//
// ⚙️ CÓMO:
// - Identidad: ID Token de Firebase verificado (JWKS de Google, issuer y audience
//   app-baqueano). Cada persona solo ve y cambia SUS notificaciones (recipient_uid = sub del
//   token). Nada del cuerpo decide de quién son.
// - Las escrituras desde el navegador exigen un origen permitido (Android no envía Origin).
// - No se borra nada: "eliminar" es archivar (un trigger impide DELETE).
// - Los textos llegan como claves i18n + params: el cliente los pinta con textContent en el
//   idioma activo.
//
// 📦 QUÉ (POST { action }): count, list { box: 'inbox' | 'archived', before }, mark_read
//   { ids | all }, archive { id }, unarchive { id }.
// ============================================================================
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

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
const PAGE = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUMNS = "id, type, title_key, body_key, params, link, status, source, created_at, read_at, archived_at";

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

async function uidFrom(req: Request): Promise<string> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) throw new HttpError(401, "Iniciá sesión para ver tus notificaciones.", "login_required");
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    const uid = String(payload.sub || "");
    if (!uid) throw new Error("sin sub");
    return uid;
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
}

async function handle(action: string, body: Record<string, unknown>, uid: string, service: SupabaseClient) {
  const now = new Date().toISOString();
  switch (action) {
    case "count": {
      const { count, error } = await service.from("notifications").select("id", { count: "exact", head: true })
        .eq("recipient_uid", uid).eq("status", "new");
      if (error) throw new HttpError(500, "No se pudo contar.", "count_failed");
      return { unread: count || 0 };
    }
    case "list": {
      const archived = body.box === "archived";
      let q = service.from("notifications").select(COLUMNS).eq("recipient_uid", uid);
      q = archived ? q.eq("status", "archived") : q.in("status", ["new", "read"]);
      // Paginación por cursor (fecha), no por offset: estable aunque lleguen avisos nuevos.
      if (typeof body.before === "string" && !Number.isNaN(Date.parse(body.before))) q = q.lt("created_at", body.before);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(PAGE + 1);
      if (error) throw new HttpError(500, "No se pudieron leer las notificaciones.", "list_failed");
      const rows = data || [];
      const { count } = await service.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_uid", uid).eq("status", "new");
      return { items: rows.slice(0, PAGE), hasMore: rows.length > PAGE, unread: count || 0 };
    }
    case "mark_read": {
      let q = service.from("notifications").update({ status: "read", read_at: now }).eq("recipient_uid", uid).eq("status", "new");
      if (body.all !== true) {
        const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && UUID_RE.test(x)).slice(0, 50) : [];
        if (!ids.length) throw new HttpError(400, "Faltan las notificaciones a marcar.", "ids_required");
        q = q.in("id", ids);
      }
      const { error } = await q;
      if (error) throw new HttpError(500, "No se pudo marcar como leída.", "update_failed");
      return { ok: true };
    }
    case "archive":
    case "unarchive": {
      const id = String(body.id || "");
      if (!UUID_RE.test(id)) throw new HttpError(400, "Notificación inválida.", "id_invalid");
      const patch = action === "archive" ? { status: "archived", archived_at: now, read_at: now } : { status: "read", archived_at: null };
      const { data, error } = await service.from("notifications").update(patch).eq("id", id).eq("recipient_uid", uid).select("id").maybeSingle();
      if (error) throw new HttpError(500, "No se pudo actualizar.", "update_failed");
      if (!data) throw new HttpError(404, "No existe esa notificación.", "not_found");
      return { ok: true };
    }
    default:
      throw new HttpError(400, "Acción desconocida.", "unknown_action");
  }
}

const WRITES = new Set(["mark_read", "archive", "unarchive"]);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Método no permitido." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > 4096) throw new HttpError(413, "Solicitud demasiado grande.", "too_large");
    let body: Record<string, unknown> = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (_) { throw new HttpError(400, "JSON inválido.", "bad_json"); }
    const action = String(body.action || "");
    if (WRITES.has(action) && origin && !originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    const uid = await uidFrom(req);
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    return reply(200, { ok: true, ...(await handle(action, body, uid, service)) }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-notifications]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno.", code: "internal" }, origin);
  }
});
