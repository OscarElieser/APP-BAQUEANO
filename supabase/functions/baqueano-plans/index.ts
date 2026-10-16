// ============================================================================
// 🧭 BAQUEANO — PLANES PARA NEGOCIOS (supabase/functions/baqueano-plans)
// ============================================================================
// 🎯 POR QUÉ: pedido del propietario (2026-10-15). Tres planes en córdobas y dólares; el
//   cliente deja sus datos, el pago se coordina por WhatsApp, el equipo confirma el pago,
//   sale el comprobante con los datos de BAQUEANO y del cliente, se crea el usuario del
//   propietario y el local entra a la cola de publicación del Ops Center.
// ⚙️ CÓMO:
//   - Público: catalog (precios) y order_create (datos del cliente; límite por IP con hash,
//     origen permitido, sin login). Los montos salen de plan_catalog, nunca del navegador.
//   - Propietario (token de Firebase verificado): my_plans y password_changed.
//   - Equipo (token + staff_roles + revocación RBAC): orders_list, order_status,
//     order_confirm_payment (plan_receipt_issue: número correlativo sin saltos),
//     owner_account_create (crea la cuenta en Firebase Auth con contraseña temporal que se
//     muestra una sola vez y no se guarda; registra el local en business_applications).
//   - Nada se borra: los pedidos se cancelan. Todo cambio del equipo queda en audit_logs.
// 📦 QUÉ: POST { action, ... }.
// ============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";
import { effectiveStaffRole } from "../_shared/staff-revocation.ts";

const FIREBASE_PROJECT_ID = "app-baqueano";
// Clave web pública de Firebase (la misma de firebase-config.js; no es un secreto).
const FIREBASE_WEB_KEY = Deno.env.get("FIREBASE_WEB_API_KEY") || "AIzaSyCRNrYyqmymNkVvmKNyuhp7J-hIjQXN9pA";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const MAX_BODY = 16 * 1024;
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.oscarelieser-informatica-inatec.workers.dev",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const STAFF_ROLES = new Set(["super_admin", "admin", "auditor"]);
const CATEGORIES = new Set(["alojamiento", "restaurante", "gastronomia", "guia", "transporte", "finca", "turismo_rural", "artesania", "cultura", "musica", "experiencia", "day_pass", "alquiler_vehiculos", "otro"]);
const DEPARTMENTS = ["Boaco", "Carazo", "Chinandega", "Chontales", "Costa Caribe Norte", "Costa Caribe Sur", "Estelí", "Granada", "Jinotega", "León", "Madriz", "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Río San Juan", "Rivas"];
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de", "ko", "zh"]);
const METHODS = new Set(["transferencia", "deposito", "efectivo", "billetera", "otro"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_ORDER_FIELDS = "code, plan_code, billing_period, amount_usd, amount_nio, exchange_rate, client_type, legal_name, id_type, id_number, contact_name, email, phone, billing_address, business_name, business_category, department, municipality, status, payment_method, payment_reference, paid_at, period_start, period_end, receipt_number, receipt_issued_at, must_change_password, business_application_code, created_at";

class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}
function originAllowed(origin: string | null) {
  return !!origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
}
function cors(origin: string | null): Record<string, string> {
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
  new Response(JSON.stringify(body), { status, headers: cors(origin) });

function text(value: unknown, max: number, opts: { required?: boolean; min?: number; label: string }): string | null {
  const v = typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F<>]/g, " ").replace(/\s+/g, " ").trim() : "";
  if (!v) {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, "missing_field");
    return null;
  }
  if (v.length < (opts.min || 0)) throw new HttpError(400, `Revisá ${opts.label}: es muy corto.`, "too_short");
  if (v.length > max) throw new HttpError(400, `Revisá ${opts.label}: es muy largo.`, "too_long");
  return v;
}
function email(value: unknown): string {
  const v = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(v) || v.length > 254) throw new HttpError(400, "Revisá el correo electrónico.", "bad_email");
  return v;
}
function phone(value: unknown): string {
  const v = String(value || "").replace(/[^\d+]/g, "");
  if (v.replace(/\D/g, "").length < 8 || v.length > 20) throw new HttpError(400, "Revisá el número de teléfono o WhatsApp.", "bad_phone");
  return v;
}
async function sha256Hex(value: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

type Who = { uid: string; email: string; emailVerified: boolean; role: string };
async function who(req: Request, service: SupabaseClient, required: boolean): Promise<Who | null> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) {
    if (required) throw new HttpError(401, "Iniciá sesión para continuar.", "login_required");
    return null;
  }
  let claims: Record<string, unknown>;
  try {
    claims = (await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`, audience: FIREBASE_PROJECT_ID })).payload as Record<string, unknown>;
  } catch {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
  const uid = String(claims.sub || "");
  const mail = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const verified = claims.email_verified === true;
  let role = typeof claims.role === "string" && STAFF_ROLES.has(claims.role) ? claims.role : (claims.admin === true ? "admin" : "");
  if (!role && mail && verified) {
    const { data } = await service.from("staff_roles").select("role").eq("email", mail).eq("is_active", true).maybeSingle();
    if (data && STAFF_ROLES.has(data.role)) role = data.role;
  }
  if (role) role = await effectiveStaffRole(service, { uid, email: mail || null, emailVerified: verified, role });
  return { uid, email: mail, emailVerified: verified, role };
}
function requireStaff(w: Who | null, write: boolean): Who {
  if (!w || !STAFF_ROLES.has(w.role)) throw new HttpError(403, "Solo el equipo autorizado del Ops Center.", "forbidden");
  if (write && w.role === "auditor") throw new HttpError(403, "Rol de solo lectura: esta acción requiere un administrador.", "read_only");
  return w;
}

async function audit(service: SupabaseClient, req: Request, w: Who, action: string, target: string, description: string, payload: Record<string, unknown>) {
  await service.from("audit_logs").insert({
    admin_email: w.email || w.uid,
    ip_address: clientIp(req) === "unknown" ? null : clientIp(req),
    user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    action, module: "Planes", target_entity: "plan_orders", target_id: target,
    description: description.slice(0, 500),
    payload: { uid: w.uid, role: w.role, ...payload },
  });
}

function tempPassword() {
  // Sin caracteres que se confunden al dictarlos (0/O, 1/l/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const core = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `Bq-${core.slice(0, 4)}-${core.slice(4, 8)}-${core.slice(8, 12)}`;
}

async function handle(action: string, body: Record<string, unknown>, req: Request, service: SupabaseClient, origin: string | null) {
  switch (action) {
    case "catalog": {
      const { data, error } = await service.from("plan_catalog").select("code, sort_order, monthly_usd, annual_usd, monthly_nio, annual_nio, exchange_rate, photo_limit").eq("is_active", true).order("sort_order");
      if (error) throw new HttpError(500, "No se pudieron leer los planes.", "catalog_failed");
      return { plans: data || [] };
    }

    case "order_create": {
      if (!originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
      const ipHash = (await sha256Hex(`plans:${clientIp(req)}`)).slice(0, 40);
      const { data: allowed, error: limitError } = await service.rpc("baqui_consume_budget", { p_bucket: `plans:${ipHash}`, p_limit: 6, p_window_seconds: 3600 });
      if (limitError) throw new HttpError(503, "No pudimos validar la solicitud. Intentá en unos minutos.", "limit_check_failed");
      if (allowed === false) throw new HttpError(429, "Recibimos varias solicitudes desde tu conexión. Escribinos por WhatsApp.", "rate_limited");

      const key = typeof body.idempotency_key === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(body.idempotency_key) ? body.idempotency_key : null;
      if (key) {
        const { data: prior } = await service.from("plan_orders").select("code, amount_usd, amount_nio, plan_code, billing_period").eq("idempotency_key", key).maybeSingle();
        if (prior) return { order: prior, duplicate: true };
      }
      const planCode = String(body.plan || "");
      const period = body.period === "annual" ? "annual" : body.period === "monthly" ? "monthly" : "";
      if (!period) throw new HttpError(400, "Elegí si el plan es mensual o anual.", "bad_period");
      const { data: plan } = await service.from("plan_catalog").select("*").eq("code", planCode).eq("is_active", true).maybeSingle();
      if (!plan) throw new HttpError(400, "Ese plan no existe.", "bad_plan");
      const category = String(body.business_category || "");
      if (!CATEGORIES.has(category)) throw new HttpError(400, "Elegí el tipo de negocio.", "bad_category");
      const department = DEPARTMENTS.find((d) => d.toLowerCase() === String(body.department || "").trim().toLowerCase());
      if (!department) throw new HttpError(400, "Elegí el departamento.", "bad_department");
      const idType = ["cedula", "ruc", "pasaporte", "residencia"].includes(String(body.id_type)) ? String(body.id_type) : "";
      if (!idType) throw new HttpError(400, "Elegí el tipo de identificación.", "bad_id_type");
      if (body.accept_terms !== true) throw new HttpError(400, "Tenés que aceptar los términos para continuar.", "terms_required");

      const row = {
        plan_code: plan.code,
        billing_period: period,
        amount_usd: period === "annual" ? plan.annual_usd : plan.monthly_usd,
        amount_nio: period === "annual" ? plan.annual_nio : plan.monthly_nio,
        exchange_rate: plan.exchange_rate,
        client_type: body.client_type === "empresa" ? "empresa" : "persona",
        legal_name: text(body.legal_name, 160, { required: true, min: 2, label: "el nombre o razón social" })!,
        id_type: idType,
        id_number: text(body.id_number, 30, { required: true, min: 4, label: "el número de identificación" })!.toUpperCase(),
        contact_name: text(body.contact_name, 120, { required: true, min: 2, label: "el nombre del propietario" })!,
        email: email(body.email),
        phone: phone(body.phone),
        billing_address: text(body.billing_address, 300, { required: true, min: 5, label: "la dirección" })!,
        business_name: text(body.business_name, 160, { required: true, min: 2, label: "el nombre del local" })!,
        business_category: category,
        department,
        municipality: text(body.municipality, 80, { label: "el municipio" }),
        business_description: text(body.business_description, 300, { required: true, min: 20, label: "la descripción del local (mínimo 20 caracteres)" })!,
        notes: text(body.notes, 1000, { label: "las notas" }),
        language: LANGS.has(String(body.language)) ? String(body.language) : "es",
        idempotency_key: key,
      };
      const { data: code, error: codeError } = await service.rpc("plan_order_code");
      if (codeError || !code) throw new HttpError(500, "No pudimos generar el código del pedido.", "code_failed");
      const { data, error } = await service.from("plan_orders").insert({ ...row, code }).select("code, plan_code, billing_period, amount_usd, amount_nio").single();
      if (error || !data) throw new HttpError(500, "No pudimos guardar tu pedido. Intentá de nuevo o escribinos por WhatsApp.", "save_failed");
      return { order: data };
    }

    case "my_plans": {
      const w = await who(req, service, true);
      let q = service.from("plan_orders").select(PUBLIC_ORDER_FIELDS).order("created_at", { ascending: false }).limit(50);
      q = w!.email && w!.emailVerified ? q.or(`owner_uid.eq.${w!.uid},email.eq."${w!.email}"`) : q.eq("owner_uid", w!.uid);
      const { data, error } = await q;
      if (error) throw new HttpError(500, "No se pudieron leer tus planes.", "read_failed");
      return { orders: data || [] };
    }

    case "password_changed": {
      const w = await who(req, service, true);
      await service.from("plan_orders").update({ must_change_password: false }).eq("owner_uid", w!.uid).eq("must_change_password", true);
      return { ok: true };
    }

    case "orders_list": {
      requireStaff(await who(req, service, true), false);
      const status = ["pending", "contacted", "paid", "cancelled"].includes(String(body.status)) ? String(body.status) : null;
      let q = service.from("plan_orders").select("*").order("created_at", { ascending: false }).limit(200);
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw new HttpError(500, "No se pudieron leer los pedidos.", "read_failed");
      const { data: plans } = await service.from("plan_catalog").select("*").order("sort_order");
      return { orders: data || [], plans: plans || [] };
    }

    case "order_status": {
      const w = requireStaff(await who(req, service, true), true);
      const id = String(body.id || "");
      if (!UUID_RE.test(id)) throw new HttpError(400, "Pedido inválido.", "bad_id");
      const next = String(body.status || "");
      if (!["contacted", "cancelled", "pending"].includes(next)) throw new HttpError(400, "Estado inválido.", "bad_status");
      const { data: before } = await service.from("plan_orders").select("code, status, receipt_number").eq("id", id).maybeSingle();
      if (!before) throw new HttpError(404, "No existe ese pedido.", "not_found");
      if (before.receipt_number) throw new HttpError(409, "El pedido ya tiene comprobante: no cambia de estado.", "already_paid");
      const notes = text(body.staff_notes, 2000, { label: "las notas" });
      const patch: Record<string, unknown> = { status: next };
      if (notes) patch.staff_notes = notes;
      const { error } = await service.from("plan_orders").update(patch).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo actualizar.", "update_failed");
      await audit(service, req, w, "PLAN_ORDER_STATUS", before.code, `Pedido ${before.code}: ${before.status} → ${next}`, { before: before.status, after: next });
      return { ok: true };
    }

    case "order_confirm_payment": {
      const w = requireStaff(await who(req, service, true), true);
      const id = String(body.id || "");
      if (!UUID_RE.test(id)) throw new HttpError(400, "Pedido inválido.", "bad_id");
      const method = String(body.payment_method || "");
      if (!METHODS.has(method)) throw new HttpError(400, "Elegí el método de pago.", "bad_method");
      const reference = text(body.payment_reference, 120, { label: "la referencia del pago" });
      const paidAt = typeof body.paid_at === "string" && !Number.isNaN(Date.parse(body.paid_at)) ? new Date(body.paid_at).toISOString() : new Date().toISOString();
      const { data, error } = await service.rpc("plan_receipt_issue", { p_order: id, p_method: method, p_reference: reference, p_paid_at: paidAt, p_issued_by: w.email || w.uid });
      if (error || !data) throw new HttpError(500, `No se pudo emitir el comprobante${error?.message ? `: ${error.message}` : ""}.`, "receipt_failed");
      await audit(service, req, w, "PLAN_RECEIPT_ISSUED", data.code, `Comprobante ${data.receipt_number} del pedido ${data.code}`, { receipt: data.receipt_number, method, amount_usd: data.amount_usd, amount_nio: data.amount_nio });
      return { order: data };
    }

    case "owner_account_create": {
      const w = requireStaff(await who(req, service, true), true);
      const id = String(body.id || "");
      if (!UUID_RE.test(id)) throw new HttpError(400, "Pedido inválido.", "bad_id");
      const { data: order } = await service.from("plan_orders").select("*").eq("id", id).maybeSingle();
      if (!order) throw new HttpError(404, "No existe ese pedido.", "not_found");
      if (!order.receipt_number) throw new HttpError(409, "Primero confirmá el pago y emití el comprobante.", "not_paid");
      if (order.owner_uid) throw new HttpError(409, "Este pedido ya tiene cuenta de propietario.", "already_created");

      const password = tempPassword();
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_KEY}`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: order.email, password, returnSecureToken: true }),
      });
      const auth = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = String(auth?.error?.message || "");
        if (msg.startsWith("EMAIL_EXISTS")) {
          throw new HttpError(409, `Ya existe una cuenta con ${order.email}. El propietario entra con esa cuenta (o con «Olvidé mi contraseña») y ve su plan automáticamente.`, "email_exists");
        }
        throw new HttpError(502, "Firebase no pudo crear la cuenta. Intentá de nuevo.", "auth_failed");
      }
      const uid = String(auth.localId || "");
      if (auth.idToken) {
        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_WEB_KEY}`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken: auth.idToken, displayName: order.contact_name, returnSecureToken: false }),
        }).catch(() => null);
      }

      // El local entra a la cola de revisión y publicación del Ops Center (no se publica solo).
      let appCode: string | null = null;
      const { data: code } = await service.rpc("next_intake_code", { p_kind: "business" });
      if (code) {
        const { error: appError } = await service.from("business_applications").insert({
          code, user_id: uid,
          business_name: order.business_name, owner_name: order.contact_name, owner_role: "Propietario",
          phone: order.phone, whatsapp: order.phone, email: order.email,
          department: order.department, municipality: order.municipality,
          category: order.business_category, short_description: order.business_description,
          consents: { data: true, truth: true, contact: true, version: "plan-baqueano-v1-2026-10-15", plan_order: order.code, at: new Date().toISOString() },
          language: order.language || "es", status: "submitted",
          applicant_message: `Plan ${order.plan_code} (${order.billing_period === "annual" ? "anual" : "mensual"}) · pedido ${order.code} · comprobante ${order.receipt_number}`,
          idempotency_key: `plan-${order.code}`,
        });
        if (!appError) appCode = code;
      }
      await service.from("plan_orders").update({
        owner_uid: uid, owner_email: order.email, account_created_at: new Date().toISOString(),
        must_change_password: true, business_application_code: appCode,
      }).eq("id", id);
      await audit(service, req, w, "PLAN_OWNER_ACCOUNT", order.code, `Cuenta del propietario creada para ${order.email} (pedido ${order.code})`, { owner_uid: uid, application: appCode });
      // La contraseña temporal se devuelve una sola vez y no se guarda en ningún lado.
      return { email: order.email, temp_password: password, application_code: appCode, phone: order.phone, contact_name: order.contact_name };
    }

    default:
      throw new HttpError(400, "Acción no válida.", "unknown_action");
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Usá POST." }, origin);
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) throw new HttpError(413, "La solicitud es demasiado grande.", "too_large");
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw || "{}"); } catch { throw new HttpError(400, "JSON inválido.", "bad_json"); }
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const result = await handle(String(body.action || ""), body, req, service, origin);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-plans]", error instanceof Error ? error.message : "error");
    return reply(500, { ok: false, error: "Error interno.", code: "internal" }, origin);
  }
});
