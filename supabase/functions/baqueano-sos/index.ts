// ============================================================================
// 🆘 BAQUEANO — EDGE FUNCTION: ALERTAS SOS (App Android + Web → Ops Center)
// ============================================================================
// 🎯 POR QUÉ:
// - Antes, el botón SOS solo abría la llamada o el SMS: el Centro de
//   Operaciones nunca se enteraba de que un viajero pidió ayuda ni dónde.
// - La ubicación es un dato sensible: no puede leerse con la clave publicable
//   ni verla otro usuario.
//
// ⚙️ CÓMO:
// 1. Identidad: ID token de Firebase en `x-firebase-token` (RS256; emisor y
//    audiencia app-baqueano), igual que baqueano-community y baqueano-ops.
// 2. Roles: claim `role` o correo verificado activo en public.staff_roles.
//    Admin/superadmin gestionan; el auditor solo lee.
// 3. Tabla public.sos_events con RLS y sin políticas públicas: solo esta
//    función (service_role) escribe y lee, tras validar.
// 4. Registrar la alerta NUNCA sustituye a la llamada: la App marca primero
//    y registra en paralelo. Límite: 3 alertas por usuario cada 10 minutos.
//
// 📦 QUÉ (POST { action, ... }):
// - Con sesión: report, mine.
// - Ops Center: queue (admin y auditor), update (solo admin/superadmin).
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BODY_BYTES = 8 * 1024;
const REPORTS_PER_10_MIN = 3;

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);

const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const SOS_STATES = new Set(["open", "acknowledged", "resolved", "false_alarm"]);
const LOCATION_STATES = new Set(["gps", "unavailable", "denied", "disabled"]);
const STAFF_COLUMNS =
  "id, created_at, updated_at, reporter_name, reporter_email, channel, latitude, longitude, accuracy_m, location_status, dialed_service, note, status, handled_by, handled_at, history";

type Actor = { uid: string; email: string | null; name: string; role: string; isAdmin: boolean; isAuditor: boolean };

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-firebase-token, apikey, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function reply(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function finiteOrNull(value: unknown, min: number, max: number): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function cleanNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.normalize("NFC").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").replace(/[ \t]+/g, " ").trim();
  if (!text) return null;
  if (text.length > 500) throw new HttpError(400, "La nota supera 500 caracteres.");
  return text;
}

function cleanUuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, "Identificador de alerta inválido.");
  }
  return value.toLowerCase();
}

async function resolveActor(req: Request, service: SupabaseClient): Promise<Actor | null> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) return null;
  let claims: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    claims = verified.payload as Record<string, unknown>;
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.");
  }
  const uid = String(claims.sub || "");
  if (!uid) throw new HttpError(401, "La sesión no identifica a ningún usuario.");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : "";
  if (!role && email && claims.email_verified === true) {
    const { data } = await service.from("staff_roles").select("role").eq("email", email).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (!role) role = "explorer";
  const rawName = typeof claims.name === "string" ? claims.name : "";
  const name = rawName.replace(/\s+/g, " ").trim().slice(0, 80) || "Viajero BAQUEANO";
  return { uid, email, name, role, isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new HttpError(401, "Iniciá sesión para que el Centro de Operaciones reciba tu alerta.");
  return actor;
}

async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, service: SupabaseClient) {
  switch (action) {
    case "report": {
      const a = requireActor(actor);
      const since = new Date(Date.now() - 10 * 60_000).toISOString();
      const { count } = await service.from("sos_events").select("id", { count: "exact", head: true })
        .eq("reporter_uid", a.uid).gte("created_at", since);
      if ((count || 0) >= REPORTS_PER_10_MIN) return { recorded: false, throttled: true };

      const lat = finiteOrNull(body.latitude, -90, 90);
      const lng = finiteOrNull(body.longitude, -180, 180);
      const hasCoords = lat !== null && lng !== null;
      const requested = String(body.location_status || "");
      const locationStatus = hasCoords ? "gps" : (LOCATION_STATES.has(requested) && requested !== "gps" ? requested : "unavailable");
      const dialed = typeof body.dialed_service === "string" && /^[0-9+]{3,15}$/.test(body.dialed_service) ? body.dialed_service : null;

      const { data, error } = await service.from("sos_events").insert({
        reporter_uid: a.uid,
        reporter_email: a.email,
        reporter_name: a.name,
        channel: body.channel === "web" ? "web" : "android",
        latitude: hasCoords ? lat : null,
        longitude: hasCoords ? lng : null,
        accuracy_m: hasCoords ? finiteOrNull(body.accuracy_m, 0, 100000) : null,
        location_status: locationStatus,
        dialed_service: dialed,
        note: cleanNote(body.note),
      }).select("id, status, created_at").single();
      if (error) throw new HttpError(500, "No se pudo registrar la alerta. Llamá directamente a los servicios de emergencia.");
      return { recorded: true, id: data.id, status: data.status, created_at: data.created_at };
    }
    case "mine": {
      const a = requireActor(actor);
      const { data, error } = await service.from("sos_events")
        .select("id, created_at, location_status, dialed_service, status, handled_at")
        .eq("reporter_uid", a.uid).order("created_at", { ascending: false }).limit(20);
      if (error) throw new HttpError(500, "No se pudieron cargar tus alertas.");
      return { items: data || [] };
    }
    case "queue": {
      const a = requireActor(actor);
      if (!a.isAdmin && !a.isAuditor) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede ver las alertas SOS.");
      const status = SOS_STATES.has(String(body.status)) ? String(body.status) : null;
      let query = service.from("sos_events").select(STAFF_COLUMNS).order("created_at", { ascending: false }).limit(100);
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw new HttpError(500, "No se pudo cargar la cola SOS.");
      const counts: Record<string, number> = {};
      for (const s of SOS_STATES) {
        const { count } = await service.from("sos_events").select("id", { count: "exact", head: true }).eq("status", s);
        counts[s] = count || 0;
      }
      return { items: data || [], counts, read_only: !a.isAdmin };
    }
    case "update": {
      const a = requireActor(actor);
      if (!a.isAdmin) throw new HttpError(403, "Solo administradores pueden gestionar alertas SOS.");
      const id = cleanUuid(body.id);
      const status = String(body.status || "");
      if (!SOS_STATES.has(status)) throw new HttpError(400, "Estado inválido.");
      const note = cleanNote(body.note);
      const { data: current } = await service.from("sos_events").select("status, history").eq("id", id).maybeSingle();
      if (!current) throw new HttpError(404, "La alerta no existe.");
      const now = new Date().toISOString();
      const history = Array.isArray(current.history) ? current.history.slice(-49) : [];
      history.push({ at: now, by: a.email || a.uid, from: current.status, to: status, note });
      const { error } = await service.from("sos_events").update({
        status, handled_by: a.email || a.uid, handled_at: now, updated_at: now, history,
      }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo actualizar la alerta.");
      return { id, status, handled_at: now };
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
    try { body = JSON.parse(raw || "{}"); } catch (_) { throw new HttpError(400, "JSON inválido."); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(String(body.action || ""), body, actor, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message }, origin);
    console.error("[baqueano-sos]", error);
    return reply(500, { ok: false, error: "Error interno. Llamá directamente a los servicios de emergencia." }, origin);
  }
});
