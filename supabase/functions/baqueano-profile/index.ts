// ============================================================================
// 🧭 BAQUEANO — PERFIL EDITABLE DEL VIAJERO (supabase/functions/baqueano-profile)
// ============================================================================
// 🎯 POR QUÉ:
// - Reporte del propietario (2026-10-07): en perfil.html "el usuario no puede editar su perfil en
//   ningún lugar". Los botones "Editar" solo recargaban la página.
// - Supabase es la base principal (directiva 2026-10-05) y las cuentas viven en Firebase Auth, así
//   que el perfil se guarda en public.traveler_profiles (migración 20261007250000) por firebase_uid.
//
// ⚙️ CÓMO:
// - Identidad: ID Token de Firebase verificado (JWKS de Google). El uid sale del token, nunca del
//   cuerpo: cada persona solo lee y escribe SU perfil.
// - Escrituras desde navegador: solo orígenes permitidos (la app Android no envía Origin).
// - Datos: lista blanca de campos, longitudes máximas, idioma/moneda/intereses de listas cerradas;
//   el texto se normaliza y se quitan caracteres de control.
// - Foto ("virus" en archivos): el navegador la reduce a 320×320 y la manda como WebP o JPEG. Aquí
//   se decodifica, se comprueban los bytes reales del formato (no la extensión ni el MIME que dice
//   el cliente) y el tamaño (≤ 300 KB). Cualquier otro archivo se rechaza. Se guarda en el bucket
//   público `avatars` con un nombre derivado del uid (SHA-256), nunca con el nombre del archivo.
// - Límites (baqui_consume_budget): 30 guardados cada 10 min y 10 fotos por hora por cuenta.
//
// - Comunidad (pedido 2026-10-07): la foto aparece en experiencias.html SOLO si la persona activa el
//   permiso `community`. `community_faces` es público y devuelve únicamente nombre de pila + foto de
//   quienes lo activaron (máx. 12) y el total; nunca correo, teléfono ni otros datos.
//
// 📦 QUÉ (POST { action }): get · save { campos } · avatar { image: dataURL } · avatar_remove ·
//    community_faces (público, sin sesión).
// ============================================================================
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);
const WRITES = new Set(["save", "avatar", "avatar_remove"]);
const MAX_BODY = 460 * 1024; // la foto ya llega reducida (≤ 300 KB en binario ≈ 400 KB en base64)
const MAX_IMAGE = 300 * 1024;
const LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);
const CURRENCIES = new Set(["NIO", "USD"]);
const INTERESTS = new Set(["playas", "volcanes", "senderismo", "gastronomia", "cafe", "cascadas", "cultura", "familiar", "fotografia", "aventura"]);
const CONSENTS = ["location", "personalization", "analytics", "community"];
const TEXT_FIELDS: Array<[string, number]> = [
  ["display_name", 120], ["phone", 30], ["city", 80], ["country", 80],
  ["emergency_contact", 120], ["dietary", 300], ["accessibility", 300],
];
const COLUMNS = "display_name, phone, city, country, emergency_contact, dietary, accessibility, language, currency, interests, consents, avatar_url, updated_at";

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

type Who = { uid: string; email: string };
async function identify(req: Request): Promise<Who> {
  const token = req.headers.get("x-firebase-token") || "";
  if (!token) throw new HttpError(401, "Iniciá sesión para editar tu perfil.", "login_required");
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`, audience: FIREBASE_PROJECT_ID });
    const uid = String(payload.sub || "");
    if (!uid) throw new Error("sin sub");
    return { uid, email: typeof payload.email === "string" ? payload.email.toLowerCase().slice(0, 254) : "" };
  } catch (_) {
    throw new HttpError(401, "Tu sesión venció. Volvé a iniciar sesión.", "session_expired");
  }
}

async function budget(service: SupabaseClient, bucket: string, limit: number, seconds: number) {
  const { data, error } = await service.rpc("baqui_consume_budget", { p_bucket: bucket, p_limit: limit, p_window_seconds: seconds });
  if (error) throw new HttpError(503, "No pudimos guardar en este momento. Probá en unos minutos.", "budget_unavailable");
  if (data !== true) throw new HttpError(429, "Hiciste muchos cambios seguidos. Esperá unos minutos.", "rate_limited");
}

function cleanText(value: unknown, max: number, label: string): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, `${label}: debe ser texto.`, "invalid");
  const text = value.normalize("NFC").replace(/[\u0000-\u001F\u007F<>]/g, " ").replace(/\s+/g, " ").trim();
  if (text.length > max) throw new HttpError(400, `${label}: máximo ${max} caracteres.`, "too_long");
  return text || null;
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Formato real por los primeros bytes (firma), no por lo que diga el cliente.
function sniffImage(bytes: Uint8Array): "image/webp" | "image/jpeg" | null {
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  if (bytes.length > 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return "image/jpeg";
  return null;
}

async function loadProfile(service: SupabaseClient, who: Who) {
  const { data, error } = await service.from("traveler_profiles").select(COLUMNS).eq("firebase_uid", who.uid).maybeSingle();
  if (error) throw new HttpError(500, "No se pudo leer tu perfil.", "read_failed");
  return data;
}

async function handle(action: string, body: Record<string, unknown>, who: Who, service: SupabaseClient) {
  switch (action) {
    case "get":
      return { profile: await loadProfile(service, who) };

    case "save": {
      await budget(service, `profile:save:${who.uid}`, 30, 600);
      const patch: Record<string, unknown> = {};
      const labels: Record<string, string> = {
        display_name: "Nombre", phone: "Teléfono", city: "Ciudad", country: "País",
        emergency_contact: "Contacto de emergencia", dietary: "Alergias o restricciones", accessibility: "Accesibilidad",
      };
      for (const [key, max] of TEXT_FIELDS) {
        if (key in body) patch[key] = cleanText(body[key], max, labels[key]);
      }
      if (patch.phone && !/^[0-9+ ()-]{7,30}$/.test(String(patch.phone))) throw new HttpError(400, "Teléfono: usá solo números, espacios, +, ( ) o guiones.", "phone_invalid");
      if ("display_name" in patch && !patch.display_name) throw new HttpError(400, "Nombre: no puede quedar vacío.", "name_required");
      if ("language" in body) {
        if (!LANGS.has(String(body.language))) throw new HttpError(400, "Idioma no disponible.", "language_invalid");
        patch.language = String(body.language);
      }
      if ("currency" in body) {
        if (!CURRENCIES.has(String(body.currency))) throw new HttpError(400, "Moneda no disponible.", "currency_invalid");
        patch.currency = String(body.currency);
      }
      if ("interests" in body) {
        const list = Array.isArray(body.interests) ? body.interests.map(String) : [];
        if (list.length > 12 || list.some((i) => !INTERESTS.has(i))) throw new HttpError(400, "Intereses no válidos.", "interests_invalid");
        patch.interests = [...new Set(list)];
      }
      if ("consents" in body) {
        const raw = body.consents && typeof body.consents === "object" ? body.consents as Record<string, unknown> : {};
        const consents: Record<string, boolean> = {};
        for (const key of CONSENTS) if (key in raw) consents[key] = raw[key] === true;
        patch.consents = consents;
      }
      // Foto de la cuenta de Google como respaldo cuando la persona no subió una propia.
      if (typeof body.provider_photo === "string" && /^https:\/\/lh3\.googleusercontent\.com\/[\w\-./=?&%]{1,400}$/.test(body.provider_photo)) {
        const current = await loadProfile(service, who);
        if (!current || !current.avatar_url) patch.avatar_url = body.provider_photo;
      }
      if (!Object.keys(patch).length) throw new HttpError(400, "No hay cambios para guardar.", "empty");
      const { data, error } = await service.from("traveler_profiles")
        .upsert({ firebase_uid: who.uid, email: who.email || null, ...patch }, { onConflict: "firebase_uid" })
        .select(COLUMNS).single();
      if (error) throw new HttpError(400, "No se pudo guardar. Revisá los datos.", "save_failed");
      return { profile: data, saved: Object.keys(patch) };
    }

    case "avatar": {
      await budget(service, `profile:avatar:${who.uid}`, 10, 3600);
      const dataUrl = typeof body.image === "string" ? body.image : "";
      const match = /^data:image\/(webp|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
      if (!match) throw new HttpError(400, "La foto debe ser una imagen JPG, PNG o WebP.", "image_invalid");
      let bytes: Uint8Array;
      try { bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0)); } catch (_) { throw new HttpError(400, "La imagen está dañada.", "image_corrupt"); }
      if (bytes.length > MAX_IMAGE) throw new HttpError(413, "La foto es demasiado grande (máximo 300 KB después de reducirla).", "image_too_large");
      const type = sniffImage(bytes);
      if (!type) throw new HttpError(400, "El archivo no es una imagen válida.", "image_invalid");
      const path = `${await sha256Hex("avatar:" + who.uid)}.${type === "image/webp" ? "webp" : "jpg"}`;
      const { error: upError } = await service.storage.from("avatars").upload(path, bytes, { contentType: type, upsert: true, cacheControl: "3600" });
      if (upError) throw new HttpError(500, "No se pudo subir la foto.", "upload_failed");
      const { data: pub } = service.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?v=${Date.now()}`;
      const { data, error } = await service.from("traveler_profiles")
        .upsert({ firebase_uid: who.uid, email: who.email || null, avatar_url: url }, { onConflict: "firebase_uid" })
        .select(COLUMNS).single();
      if (error) throw new HttpError(500, "No se pudo guardar la foto en tu perfil.", "save_failed");
      return { profile: data };
    }

    case "avatar_remove": {
      await budget(service, `profile:save:${who.uid}`, 30, 600);
      const { data, error } = await service.from("traveler_profiles")
        .upsert({ firebase_uid: who.uid, email: who.email || null, avatar_url: null }, { onConflict: "firebase_uid" })
        .select(COLUMNS).single();
      if (error) throw new HttpError(500, "No se pudo quitar la foto.", "save_failed");
      return { profile: data };
    }

    default:
      throw new HttpError(400, "Acción desconocida.", "unknown_action");
  }
}

// Público: solo personas que activaron el permiso "community" y tienen foto.
async function communityFaces(service: SupabaseClient) {
  const base = () => service.from("traveler_profiles").select("display_name, avatar_url", { count: "exact" })
    .eq("consents->>community", "true");
  const { count, error: countError } = await base().limit(1);
  if (countError) throw new HttpError(500, "No se pudo leer la comunidad.", "read_failed");
  const { data, error } = await base().not("avatar_url", "is", null).order("updated_at", { ascending: false }).limit(12);
  if (error) throw new HttpError(500, "No se pudo leer la comunidad.", "read_failed");
  const faces = (data || []).map((r: { display_name: string | null; avatar_url: string }) => ({
    name: String(r.display_name || "").trim().split(/\s+/)[0].slice(0, 40) || "Viajero",
    avatar: r.avatar_url,
  }));
  return { total: count || 0, faces };
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
    const action = String(body.action || "");
    if (action === "community_faces") {
      const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
      const res = reply(200, { ok: true, ...(await communityFaces(service)) }, origin);
      res.headers.set("Cache-Control", "public, max-age=120");
      return res;
    }
    if (WRITES.has(action) && origin && !originAllowed(origin)) throw new HttpError(403, "Origen no permitido.", "origin_forbidden");
    const who = await identify(req);
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    return reply(200, { ok: true, ...(await handle(action, body, who, service)) }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message, code: error.code }, origin);
    console.error("[baqueano-profile]", error instanceof Error ? error.name : "error");
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos." }, origin);
  }
});
