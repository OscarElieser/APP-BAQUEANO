// ============================================================================
// 🧭 BAQUEANO — MENSAJERÍA VIAJERO ↔ EQUIPO (supabase/functions/baqueano-messages)
// ============================================================================
// 🎯 POR QUÉ:
// - Plan de evolución, F6: mensajería para la web y la app Android con Supabase. El buzón de
//   contacto era de una sola vía; aquí cada consulta es una conversación con respuestas, y la
//   respuesta del equipo llega también a la campana (notifications, F5).
//
// ⚙️ CÓMO:
// - Identidad: ID Token de Firebase verificado (JWKS de Google). El uid sale del token, nunca del
//   cuerpo: cada persona solo ve y escribe en SUS conversaciones (las reglas viven en las
//   funciones SQL msg_* de la migración 20261007230000, sin EXECUTE público).
// - Equipo: rol desde el claim o desde staff_roles con correo verificado, contrastado con el RBAC
//   de Supabase (_shared/staff-revocation.ts). Leer: super_admin, admin, auditor. Responder y
//   cerrar: super_admin, admin; cada respuesta y cierre queda en audit_logs (sin el texto).
// - Escrituras desde navegador: solo orígenes permitidos (la app Android no envía Origin).
// - Límites: 2000 caracteres por mensaje, 10 mensajes cada 10 minutos, 5 conversaciones abiertas.
//
// 📦 QUÉ (POST { action }):
// - Persona: unread, list, thread { id }, start { subject, body }, send { id, body }.
// - Equipo: staff_inbox { status }, staff_thread { id }, staff_reply { id, body }, staff_close { id }.
// ============================================================================
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";
import { notify } from "../_shared/notify.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WRITES = new Set(["start", "send", "staff_reply", "staff_close"]);
const STAFF_ACTIONS = new Set(["staff_inbox", "staff_thread", "staff_reply", "staff_close"]);

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
const reply = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: headers(origin) });

type Who = { uid: string; email: string; emailVerified: boolean; claims: Record<string, unknown> };
async function identify(req: Request): Promise<Who> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) throw new HttpError(401, "Iniciá sesión para usar los mensajes.", "login_required");
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`, audience: FIREBASE_PROJECT_ID });
    const uid = String(payload.sub || "");
    if (!uid) throw new Error("sin sub");
    return { uid, email: typeof payload.email === "string" ? payload.email.toLowerCase() : "", emailVerified: payload.email_verified === true, claims: payload as Record<string, unknown> };
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
}

async function staffRole(service: SupabaseClient, who: Who): Promise<{ role: string; canWrite: boolean }> {
  const c = who.claims;
  let role = typeof c.role === "string" && STAFF_ROLES.has(c.role) ? c.role : (c.admin === true ? "admin" : "");
  if (!role && who.email && who.emailVerified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", who.email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid: who.uid, email: who.email || null, emailVerified: who.emailVerified, role });
  if (!role) throw new HttpError(403, "Tu cuenta no tiene acceso a la bandeja del equipo.", "forbidden");
  return { role, canWrite: role === "admin" || role === "super_admin" };
}

// Errores de las funciones SQL → respuesta clara (sin detalles internos).
const SQL_ERRORS: Record<string, [number, string]> = {
  not_found: [404, "No existe esa conversación."],
  closed: [409, "La conversación está cerrada."],
  rate_limited: [429, "Enviaste muchos mensajes seguidos. Esperá unos minutos."],
  too_many_open: [429, "Tenés 5 conversaciones abiertas. Esperá respuesta antes de abrir otra."],
  subject_invalid: [400, "El asunto debe tener entre 3 y 120 caracteres."],
  body_invalid: [400, "El mensaje debe tener entre 1 y 2000 caracteres."],
};
async function rpc(service: SupabaseClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await service.rpc(fn, args);
  if (error) {
    const known = SQL_ERRORS[String(error.message || "")];
    if (known) throw new HttpError(known[0], known[1], String(error.message));
    console.error("[baqueano-messages]", fn, error.code || "error");
    throw new HttpError(500, "No se pudo completar la acción.", "rpc_failed");
  }
  return data;
}
function idOf(body: Record<string, unknown>) {
  const id = String(body.id || "");
  if (!UUID_RE.test(id)) throw new HttpError(400, "Conversación inválida.", "id_invalid");
  return id;
}
function text(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max + 1) : "";
}

async function audit(service: SupabaseClient, req: Request, who: Who, role: string, action: string, id: string, description: string) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  await service.from("audit_logs").insert({
    admin_email: who.email || who.uid, ip_address: ip, user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action, module: "messages", target_entity: "conversations", target_id: id, description: description.slice(0, 500),
    payload: { uid: who.uid, role, result: "ok", origin: "ops-center" },
  });
}

async function handle(action: string, body: Record<string, unknown>, who: Who, service: SupabaseClient, req: Request) {
  if (STAFF_ACTIONS.has(action)) {
    const staff = await staffRole(service, who);
    const staffRef = who.email || who.uid;
    switch (action) {
      case "staff_inbox": {
        const status = ["open", "answered", "closed", "all"].includes(String(body.status)) ? String(body.status) : "all";
        return await rpc(service, "msg_staff_inbox", { p_status: status });
      }
      case "staff_thread":
        return { thread: await rpc(service, "msg_staff_thread", { p_id: idOf(body), p_mark_read: staff.canWrite }) };
      case "staff_reply": {
        if (!staff.canWrite) throw new HttpError(403, "Rol de solo lectura: responder requiere un administrador.", "read_only");
        const id = idOf(body);
        const res = await rpc(service, "msg_staff_reply", { p_staff: staffRef, p_id: id, p_body: text(body.body, 2000) }) as Record<string, string>;
        await notify(service, {
          recipient: res.user_uid, type: "reply", titleKey: "messages.notifReplyTitle", bodyKey: "messages.notifReplyBody",
          params: { subject: String(res.subject || "").slice(0, 120) }, link: "/perfil.html#mensajes", source: "messages", refId: id, dedupeKey: `msg:${res.id}`,
        });
        await audit(service, req, who, staff.role, "message_reply", id, "Respondió una conversación de mensajería");
        return { id: res.id };
      }
      case "staff_close": {
        if (!staff.canWrite) throw new HttpError(403, "Rol de solo lectura: cerrar requiere un administrador.", "read_only");
        const id = idOf(body);
        const res = await rpc(service, "msg_staff_close", { p_staff: staffRef, p_id: id });
        await audit(service, req, who, staff.role, "message_close", id, "Cerró una conversación de mensajería");
        return res as Record<string, unknown>;
      }
    }
  }
  switch (action) {
    case "unread":
      return { unread: await rpc(service, "msg_unread", { p_uid: who.uid }) };
    case "list":
      return { items: await rpc(service, "msg_list", { p_uid: who.uid }) };
    case "thread":
      return { thread: await rpc(service, "msg_thread", { p_uid: who.uid, p_id: idOf(body) }) };
    case "start":
      return await rpc(service, "msg_start", {
        p_uid: who.uid, p_email: who.emailVerified ? who.email : null, p_subject: text(body.subject, 120), p_body: text(body.body, 2000),
      }) as Record<string, unknown>;
    case "send":
      return await rpc(service, "msg_send", { p_uid: who.uid, p_id: idOf(body), p_body: text(body.body, 2000) }) as Record<string, unknown>;
    default:
      throw new HttpError(400, "Acción desconocida.", "unknown_action");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Método no permitido." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > 8192) throw new HttpError(413, "Solicitud demasiado grande.", "too_large");
    let body: Record<string, unknown> = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (_) { throw new HttpError(400, "JSON inválido.", "bad_json"); }
    const action = String(body.action || "");
    if (WRITES.has(action) && origin && !originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    const who = await identify(req);
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    return reply(200, { ok: true, ...(await handle(action, body, who, service, req)) }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-messages]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno.", code: "internal" }, origin);
  }
});
