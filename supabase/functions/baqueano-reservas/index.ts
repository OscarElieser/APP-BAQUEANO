// ============================================================================
// 📅 BAQUEANO — EDGE FUNCTION: SOLICITUDES DE RESERVA (sin pago en línea)
// ============================================================================
// 🎯 POR QUÉ:
// - No hay pasarela de pago (directiva del propietario, 2026-10-05). La reserva
//   es una solicitud trazable: el viajero la registra y coordina con el negocio
//   verificado por WhatsApp o teléfono; precio y pago se acuerdan con él.
// - Antes, la App "enviaba" solicitudes que solo quedaban en memoria y mostraba
//   anfitriones y teléfonos ficticios.
//
// ⚙️ CÓMO:
// 1. Identidad: ID token de Firebase (`x-firebase-token`, RS256, emisor y
//    audiencia app-baqueano). Roles: claim `role` o staff_roles verificado.
// 2. public.reservations (RLS "solo servidor"): esta función valida y escribe
//    con service_role. Solo se reserva con negocios VERIFICADOS y no borrados.
// 3. El código BQ-XXXXXX se genera en el servidor; el negocio y su contacto
//    se devuelven desde la base (nunca desde el cliente).
// 4. Estados: pending (solicitud enviada) → confirmed / rejected / cancelled /
//    completed, con historial (quién, cuándo, nota).
//
// 📦 QUÉ (POST { action, ... }):
// - Con sesión: create, mine, cancel (propia y pendiente).
// - Ops Center: queue (admin y auditor), create_manual/update (solo admin/superadmin).
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BODY_BYTES = 8 * 1024;
const REQUESTS_PER_DAY = 10;

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);

const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const STATES = new Set(["pending", "confirmed", "rejected", "cancelled", "completed"]);
const USER_COLUMNS =
  "id, reservation_code, business_id, service_title, destination_name, travel_date, people_count, status, notes, created_at, updated_at, businesses(name, phone, whatsapp, department)";
const STAFF_COLUMNS =
  "id, reservation_code, business_id, service_title, destination_name, travel_date, people_count, status, notes, contact_name, contact_phone, channel, history, handled_by, handled_at, created_at, updated_at, businesses(name, phone, whatsapp, department)";

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

function cleanText(value: unknown, max: number, label: string, required = false): string | null {
  if (value == null || value === "") {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${label} no es texto.`);
  const text = value.normalize("NFC").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").replace(/[ \t]+/g, " ").trim();
  if (!text) {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (text.length > max) throw new HttpError(400, `${label} supera ${max} caracteres.`);
  return text;
}

function cleanUuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, "Identificador de reserva inválido.");
  }
  return value.toLowerCase();
}

function reservationCode(): string {
  // Sin caracteres ambiguos (0/O, 1/I) para dictarlo por teléfono.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "BQ-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function parseTravelDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400, "La fecha debe tener formato AAAA-MM-DD.");
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new HttpError(400, "La fecha no es válida.");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setUTCFullYear(max.getUTCFullYear() + 2);
  if (date < today) throw new HttpError(400, "La fecha del viaje ya pasó.");
  if (date > max) throw new HttpError(400, "La fecha del viaje está demasiado lejos.");
  return value;
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
  // Revocación y suspensión en el RBAC de Supabase también aplican aquí (auditoría 2026-10-06).
  if (role) role = await effectiveStaffRole(service, { uid, email: email, emailVerified: claims.email_verified === true, role });
  if (!role) role = "explorer";
  const rawName = typeof claims.name === "string" ? claims.name : "";
  const name = rawName.replace(/\s+/g, " ").trim().slice(0, 80) || "Viajero BAQUEANO";
  return { uid, email, name, role, isAdmin: role === "admin" || role === "super_admin", isAuditor: role === "auditor" };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new HttpError(401, "Iniciá sesión para registrar tu solicitud de reserva.");
  return actor;
}

async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, service: SupabaseClient) {
  switch (action) {
    case "create": {
      const a = requireActor(actor);
      const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
      const { count } = await service.from("reservations").select("id", { count: "exact", head: true })
        .eq("user_uid", a.uid).gte("created_at", since);
      if ((count || 0) >= REQUESTS_PER_DAY) throw new HttpError(429, "Ya enviaste varias solicitudes hoy. Coordiná directamente con el negocio por WhatsApp.");

      const businessId = cleanText(body.business_id, 120, "el negocio", true)!;
      const { data: business } = await service.from("businesses")
        .select("id, name, phone, whatsapp, department, verified, deleted_at").eq("id", businessId).maybeSingle();
      if (!business || business.verified !== true || business.deleted_at) {
        throw new HttpError(400, "Ese negocio no está verificado para recibir reservas.");
      }
      const people = Number(body.people_count);
      if (!Number.isInteger(people) || people < 1 || people > 50) throw new HttpError(400, "Indicá entre 1 y 50 personas.");
      const phone = cleanText(body.contact_phone, 20, "tu teléfono", true)!;
      if (!/^[0-9+ ()-]{7,20}$/.test(phone)) throw new HttpError(400, "El teléfono de contacto no es válido.");

      const row = {
        reservation_code: reservationCode(),
        user_uid: a.uid,
        business_id: business.id,
        service_title: cleanText(body.service_title, 120, "el servicio") || `Reserva con ${business.name}`,
        destination_name: cleanText(body.destination_name, 120, "el destino"),
        travel_date: parseTravelDate(body.travel_date),
        people_count: people,
        total_price: null,
        status: "pending",
        notes: cleanText(body.notes, 500, "la nota"),
        contact_name: cleanText(body.contact_name, 80, "tu nombre") || a.name,
        contact_phone: phone,
        channel: body.channel === "web" ? "web" : "android",
        history: [{ at: new Date().toISOString(), by: "viajero", to: "pending", note: "Solicitud enviada" }],
      };
      let inserted: Record<string, unknown> | null = null;
      for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
        const { data, error } = await service.from("reservations").insert(row).select("id, reservation_code, status, created_at").single();
        if (!error) inserted = data;
        else if (error.code === "23505") row.reservation_code = reservationCode();
        else throw new HttpError(500, "No se pudo registrar la solicitud. Podés coordinar directamente con el negocio.");
      }
      if (!inserted) throw new HttpError(500, "No se pudo generar el código de reserva. Intentá de nuevo.");
      return {
        reservation: inserted,
        business: { id: business.id, name: business.name, phone: business.phone, whatsapp: business.whatsapp, department: business.department },
      };
    }
    case "create_manual": {
      const a = requireActor(actor);
      if (!a.isAdmin) throw new HttpError(403, "Solo administradores pueden registrar reservas recibidas por teléfono o WhatsApp.");
      const channel = String(body.channel || "");
      if (channel !== "phone" && channel !== "whatsapp") throw new HttpError(400, "Seleccioná teléfono o WhatsApp como canal.");

      const businessId = cleanText(body.business_id, 120, "el negocio", true)!;
      const { data: business } = await service.from("businesses")
        .select("id, name, phone, whatsapp, department, verified, deleted_at").eq("id", businessId).maybeSingle();
      if (!business || business.verified !== true || business.deleted_at) {
        throw new HttpError(400, "Ese negocio no está verificado para recibir reservas.");
      }
      const people = Number(body.people_count);
      if (!Number.isInteger(people) || people < 1 || people > 50) throw new HttpError(400, "Indicá entre 1 y 50 personas.");
      const phone = cleanText(body.contact_phone, 20, "el teléfono del viajero", true)!;
      if (!/^[0-9+ ()-]{7,20}$/.test(phone)) throw new HttpError(400, "El teléfono de contacto no es válido.");
      const contactName = cleanText(body.contact_name, 80, "el nombre del viajero", true)!;
      const now = new Date().toISOString();
      const row = {
        reservation_code: reservationCode(),
        user_uid: `manual:${a.uid}`,
        business_id: business.id,
        service_title: cleanText(body.service_title, 120, "el servicio") || `Reserva con ${business.name}`,
        destination_name: cleanText(body.destination_name, 120, "el destino"),
        travel_date: parseTravelDate(body.travel_date),
        people_count: people,
        total_price: null,
        status: "pending",
        notes: cleanText(body.notes, 500, "la nota"),
        contact_name: contactName,
        contact_phone: phone,
        channel,
        handled_by: a.email || a.uid,
        handled_at: now,
        history: [{ at: now, by: a.email || a.uid, to: "pending", note: `Solicitud recibida por ${channel === "whatsapp" ? "WhatsApp" : "teléfono"}` }],
      };
      let inserted: Record<string, unknown> | null = null;
      for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
        const { data, error } = await service.from("reservations").insert(row).select(STAFF_COLUMNS).single();
        if (!error) inserted = data;
        else if (error.code === "23505") row.reservation_code = reservationCode();
        else throw new HttpError(500, "No se pudo registrar la solicitud recibida.");
      }
      if (!inserted) throw new HttpError(500, "No se pudo generar el código de reserva. Intentá de nuevo.");
      return { reservation: inserted };
    }
    case "mine": {
      const a = requireActor(actor);
      const { data, error } = await service.from("reservations").select(USER_COLUMNS)
        .eq("user_uid", a.uid).is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
      if (error) throw new HttpError(500, "No se pudieron cargar tus solicitudes.");
      return { items: data || [] };
    }
    case "cancel": {
      const a = requireActor(actor);
      const id = cleanUuid(body.id);
      const { data: current } = await service.from("reservations").select("user_uid, status, history").eq("id", id).maybeSingle();
      if (!current || current.user_uid !== a.uid) throw new HttpError(404, "La solicitud no existe.");
      if (current.status !== "pending" && current.status !== "confirmed") throw new HttpError(400, "Esta solicitud ya no se puede cancelar.");
      const now = new Date().toISOString();
      const history = Array.isArray(current.history) ? current.history.slice(-49) : [];
      history.push({ at: now, by: "viajero", from: current.status, to: "cancelled", note: cleanText(body.note, 300, "el motivo") });
      const { error } = await service.from("reservations").update({ status: "cancelled", updated_at: now, history }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo cancelar la solicitud.");
      return { id, status: "cancelled" };
    }
    case "queue": {
      const a = requireActor(actor);
      if (!a.isAdmin && !a.isAuditor) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede ver las reservas.");
      const status = STATES.has(String(body.status)) ? String(body.status) : null;
      let query = service.from("reservations").select(STAFF_COLUMNS).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw new HttpError(500, "No se pudo cargar la cola de reservas.");
      const counts: Record<string, number> = {};
      for (const s of STATES) {
        const { count } = await service.from("reservations").select("id", { count: "exact", head: true }).eq("status", s).is("deleted_at", null);
        counts[s] = count || 0;
      }
      const { data: businesses, error: businessesError } = await service.from("businesses")
        .select("id, name, phone, whatsapp, department")
        .eq("verified", true).is("deleted_at", null).order("name", { ascending: true }).limit(500);
      if (businessesError) throw new HttpError(500, "No se pudieron cargar los negocios disponibles.");
      return { items: data || [], counts, businesses: businesses || [], read_only: !a.isAdmin };
    }
    case "update": {
      const a = requireActor(actor);
      if (!a.isAdmin) throw new HttpError(403, "Solo administradores pueden gestionar reservas.");
      const id = cleanUuid(body.id);
      const status = String(body.status || "");
      if (!STATES.has(status)) throw new HttpError(400, "Estado inválido.");
      const note = cleanText(body.note, 300, "la nota");
      const { data: current } = await service.from("reservations").select("status, history").eq("id", id).maybeSingle();
      if (!current) throw new HttpError(404, "La reserva no existe.");
      const now = new Date().toISOString();
      const history = Array.isArray(current.history) ? current.history.slice(-49) : [];
      history.push({ at: now, by: a.email || a.uid, from: current.status, to: status, note });
      const { error } = await service.from("reservations").update({
        status, handled_by: a.email || a.uid, handled_at: now, updated_at: now, history,
      }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo actualizar la reserva.");
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
    console.error("[baqueano-reservas]", error);
    return reply(500, { ok: false, error: "Error interno. Podés coordinar directamente con el negocio por WhatsApp." }, origin);
  }
});
