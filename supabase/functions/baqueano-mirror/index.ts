// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: ESPEJO FIRESTORE → SUPABASE (baqueano-mirror)
// ============================================================================
// 🎯 POR QUÉ:
// - Directiva del propietario (2026-10-03): Firestore es la fuente prioritaria y
//   Supabase debe tener la misma información. Hasta hoy la copia se intentaba
//   desde el navegador con la clave pública y Supabase la rechazaba en silencio.
// - Firebase Functions no está disponible (facturación), por eso el espejo vive
//   en Supabase Edge, que ya tiene la clave de servicio.
//
// ⚙️ CÓMO:
// 1. El sitio escribe en Firestore; si la escritura tiene éxito, envía aquí el
//    documento junto con el ID token de Firebase (cabecera x-firebase-token).
// 2. Se verifica el token (RS256) contra las claves públicas de Google:
//    emisor https://securetoken.google.com/app-baqueano y audiencia app-baqueano.
// 3. Se aplican las MISMAS reglas que firestore.rules:
//    - Contenido administrativo → solo administradores (claims o correo
//      verificado activo en public.official_super_admins).
//    - Documentos del usuario → su propio uid (o administrador).
//    - Pagos, reservas confirmadas y conversaciones → nunca desde el cliente.
// 4. Se guarda el documento completo en public.firestore_mirror (privada).
//    Un borrado marca deleted = true y conserva la última copia.
//
// 📦 QUÉ:
// - POST /baqueano-mirror  { path, op, data? }  →  { ok, path, version }
// - Errores claros: 401 token, 403 permiso, 400 datos, 413 tamaño.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const MAX_BYTES = 256 * 1024;
const SEGMENT = /^[A-Za-z0-9_\-.:@]{1,200}$/;

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);

// Mismo mapa que firestore.rules (2026-10-03).
const ADMIN_ONLY = new Set([
  "destinations", "tourism_services", "priceHistory", "tourismPlaces", "reviews", "app_config",
  "multimedia", "countries", "business_subscriptions", "audit_logs", "places", "categories",
  "departments", "municipalities", "experiences", "cultural_items", "gastronomy", "history_timeline",
  "sustainability_initiatives", "emergency_directory", "pages", "sections", "site_pages", "roles",
  "ai_settings", "ai_tasks", "android_releases", "system_settings", "devices",
]);
const OWNER_WRITABLE = new Set([
  "users", "user_saved_places", "travelPlans", "reservation_requests", "sos_logs",
  "environmental_reports", "businesses", "registro_negocios", "messages",
]);
const SERVER_ONLY = new Set([
  "payment_orders", "payment_transactions", "reservations", "conversations", "notifications", "rate_limits",
]);
const OWNER_FIELDS = ["uid", "userId", "user_uid", "userUid", "ownerUid", "owner_uid", "createdBy", "authorUid"];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://baqueanonicaragua.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-firebase-token, apikey, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function reply(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

// "site_pages/inicio/sections/hero" → colección "sections", doc "hero".
function parsePath(path: unknown): { collection: string; docId: string; segments: string[] } | null {
  if (typeof path !== "string") return null;
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2 || segments.length % 2 !== 0 || segments.length > 10) return null;
  if (!segments.every((s) => SEGMENT.test(s))) return null;
  return { collection: segments[segments.length - 2], docId: segments[segments.length - 1], segments };
}

function ownerOf(collection: string, segments: string[], data: Record<string, unknown> | null): string | null {
  if (collection === "users") return segments[1];
  if (segments[0] === "users" && segments.length > 2) return segments[1];
  if (data) {
    for (const field of OWNER_FIELDS) {
      const value = data[field];
      if (typeof value === "string" && value) return value;
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "Usá POST." }, origin);

  // 1. Token de Firebase
  const token = req.headers.get("x-firebase-token") || "";
  let claims: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    claims = verified.payload as Record<string, unknown>;
  } catch (_) {
    return reply(401, { ok: false, error: "Sesión de Firebase inválida o vencida." }, origin);
  }
  const uid = String(claims.sub || "");
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  if (!uid) return reply(401, { ok: false, error: "El token no identifica a ningún usuario." }, origin);

  // 2. Cuerpo
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return reply(413, { ok: false, error: "El documento supera 256 KB." }, origin);
  let body: { path?: unknown; op?: unknown; data?: unknown; source?: unknown };
  try { body = JSON.parse(raw); } catch (_) { return reply(400, { ok: false, error: "JSON inválido." }, origin); }
  const parsed = parsePath(body.path);
  if (!parsed) return reply(400, { ok: false, error: "Ruta de documento inválida." }, origin);
  const op = String(body.op || "");
  if (!["set", "update", "add", "delete"].includes(op)) return reply(400, { ok: false, error: "Operación inválida." }, origin);
  const data = op === "delete" ? null : (body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data as Record<string, unknown> : null);
  if (op !== "delete" && !data) return reply(400, { ok: false, error: "Falta el documento." }, origin);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // 3. Permisos (espejo de firestore.rules)
  let isAdmin = claims.admin === true || claims.role === "admin" || claims.role === "super_admin";
  if (!isAdmin && email && claims.email_verified === true) {
    const { data: admin } = await supabase.from("official_super_admins").select("email").eq("email", email).eq("is_active", true).maybeSingle();
    isAdmin = Boolean(admin);
  }

  const { collection, docId, segments } = parsed;
  const owner = ownerOf(collection, segments, data);
  if (SERVER_ONLY.has(collection)) {
    return reply(403, { ok: false, error: `La colección ${collection} solo la escribe el servidor.` }, origin);
  }
  if (!isAdmin) {
    if (ADMIN_ONLY.has(collection) || !OWNER_WRITABLE.has(collection)) {
      return reply(403, { ok: false, error: `Solo un administrador puede escribir en ${collection}.` }, origin);
    }
    if (owner && owner !== uid) {
      return reply(403, { ok: false, error: "No podés copiar documentos de otra persona." }, origin);
    }
  }

  // 4. Guardar (versión incremental; un borrado conserva la última copia)
  const docPath = segments.join("/");
  const { data: existing } = await supabase.from("firestore_mirror").select("version, data").eq("doc_path", docPath).maybeSingle();
  const row = {
    doc_path: docPath,
    collection,
    doc_id: docId,
    data: op === "delete" ? (existing?.data ?? {}) : data,
    owner_uid: owner ?? (isAdmin ? null : uid),
    written_by_uid: uid,
    written_by_email: email,
    op,
    deleted: op === "delete",
    version: (existing?.version ?? 0) + 1,
    source: typeof body.source === "string" ? body.source.slice(0, 40) : "web",
    mirrored_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("firestore_mirror").upsert(row, { onConflict: "doc_path" });
  if (error) return reply(500, { ok: false, error: "No se pudo guardar la copia.", detail: error.message }, origin);

  return reply(200, { ok: true, path: docPath, version: row.version, deleted: row.deleted }, origin);
});
