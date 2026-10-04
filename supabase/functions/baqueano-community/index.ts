// ============================================================================
// 🧭 BAQUEANO — EDGE FUNCTION: COMUNIDAD (EXPERIENCIAS DE VIAJEROS)
// ============================================================================
// 🎯 POR QUÉ:
// - El propietario pide testimonios reales: ver es público; publicar,
//   comentar, reaccionar, subir fotos/videos y denunciar exige sesión, y la
//   moderación vive en el Ops Center. La autorización no puede depender del
//   navegador.
// - Firebase Auth es la identidad oficial; Supabase guarda la comunidad
//   (decisión del propietario, 2026-10-04).
//
// ⚙️ CÓMO:
// 1. Lecturas públicas con la clave anónima → las aplica RLS (solo lo
//    publicado y solo columnas públicas).
// 2. Escrituras: se verifica el ID token de Firebase (RS256, emisor y
//    audiencia app-baqueano); el UID del token es el autor. Se escribe con
//    service role tras validar, sanear y limitar frecuencia.
// 3. Multimedia: URL firmada de subida por archivo; al adjuntar se
//    comprueban tamaño real y "magic bytes" (tipo real, no el declarado).
// 4. Administradores: claims (admin/super_admin) o correo verificado activo
//    en public.official_super_admins (misma regla que el Ops Center).
// 5. Nunca se devuelve el UID de otra persona, su correo ni datos internos.
//
// 📦 QUÉ (POST { action, ... }):
// - Público: list, get, destination_feed.
// - Con sesión: mine, create, update, delete, upload_url, attach_media,
//   remove_media, comment, edit_comment, delete_comment, react, report.
// - Administración: mod_queue, moderate, mod_comment, resolve_report.
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const FIREBASE_PROJECT_ID = "app-baqueano";
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);
const BUCKET = "community-media";
const MAX_BODY_BYTES = 64 * 1024;

const ALLOWED_ORIGINS = new Set([
  "https://baqueanonicaragua.com",
  "https://www.baqueanonicaragua.com",
  "https://app-baqueano.web.app",
  "https://app-baqueano.firebaseapp.com",
]);

const EXPERIENCE_TYPES = new Set([
  "naturaleza", "cultura", "gastronomia", "aventura", "playa", "montana", "comunidad",
  "historia", "ecoturismo", "hospedaje", "restaurante", "tour", "evento", "otro",
]);
const REPORT_REASONS = new Set(["spam", "ofensivo", "falso", "privacidad", "peligroso", "otro"]);
const REACTIONS = new Set(["like", "useful", "inspiring"]);
const MODERATION_STATES = new Set(["draft", "pending_review", "published", "rejected", "hidden", "reported", "archived"]);

const LIMITS = {
  testimonialsPerDay: 5,
  commentsPer10Min: 12,
  reportsPerHour: 10,
  reactionsPerMinute: 60,
  photosPerTestimonial: 6,
  videosPerTestimonial: 1,
  imageBytes: 8 * 1024 * 1024,
  videoBytes: 40 * 1024 * 1024,
  videoSeconds: 90,
  pageSize: 12,
};

const IMAGE_MIME: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const VIDEO_MIME: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm" };

const PUBLIC_COLUMNS = [
  "id", "author_name", "author_avatar", "title", "body", "destination_id", "destination_ref", "destination_name",
  "department_id", "municipality", "business_id", "place_name", "visit_month", "rating", "experience_type", "tags",
  "recommendations", "tips", "status", "featured", "verified_visit", "comments_count", "reactions_count",
  "media_count", "photo_count", "video_count", "published_at", "created_at", "updated_at",
].join(", ");
const MEDIA_COLUMNS = "id, testimonial_id, kind, storage_path, thumb_path, mime_type, width, height, duration_seconds, position";

type Actor = { uid: string; email: string | null; emailVerified: boolean; name: string; avatar: string | null; isAdmin: boolean };
class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
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

// Texto plano seguro: sin caracteres de control, espacios normalizados y
// longitud acotada. El sitio lo pinta con textContent (nunca como HTML).
function cleanText(value: unknown, max: number, { multiline = false, required = false, min = 0, label = "campo" } = {}): string | null {
  if (value == null || value === "") {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${label} no es texto.`);
  let text = value.normalize("NFC")
    .replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ")
    .replace(/[​-‏‪-‮⁦-⁩]/g, "");
  text = multiline ? text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : text.replace(/\s+/g, " ");
  text = text.trim();
  if (!text) {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (text.length < min) throw new HttpError(400, `${label} es demasiado corto (mínimo ${min} caracteres).`);
  if (text.length > max) throw new HttpError(400, `${label} supera ${max} caracteres.`);
  const links = text.match(/(https?:\/\/|www\.)\S+/gi) || [];
  if (links.length > 2) throw new HttpError(400, `${label} tiene demasiados enlaces.`);
  return text;
}

function cleanId(value: unknown, label: string): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^[A-Za-z0-9_\-]{1,120}$/.test(value)) throw new HttpError(400, `${label} inválido.`);
  return value;
}

function cleanUuid(value: unknown, label: string, required = true): string | null {
  if (value == null || value === "") {
    if (required) throw new HttpError(400, `Falta ${label}.`);
    return null;
  }
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new HttpError(400, `${label} inválido.`);
  }
  return value.toLowerCase();
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function publicUrl(path: string | null): string | null {
  if (!path) return null;
  return `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function shapeMedia(rows: Array<Record<string, unknown>> = []) {
  return rows
    .slice()
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((m) => ({
      id: m.id, kind: m.kind, url: publicUrl(m.storage_path as string), thumb: publicUrl(m.thumb_path as string),
      width: m.width, height: m.height, duration: m.duration_seconds,
    }));
}

// ---------------------------------------------------------------------------
// Identidad
// ---------------------------------------------------------------------------
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
  const emailVerified = claims.email_verified === true;
  let isAdmin = claims.admin === true || claims.role === "admin" || claims.role === "super_admin";
  if (!isAdmin && email && emailVerified) {
    const { data } = await service.from("official_super_admins").select("email").eq("email", email).eq("is_active", true).maybeSingle();
    isAdmin = Boolean(data);
  }
  const rawName = typeof claims.name === "string" ? claims.name : "";
  const name = (rawName.replace(/\s+/g, " ").trim().slice(0, 80)) || "Viajero BAQUEANO";
  const picture = typeof claims.picture === "string" && /^https:\/\//.test(claims.picture) ? claims.picture.slice(0, 500) : null;
  return { uid, email, emailVerified, name, avatar: picture, isAdmin };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new HttpError(401, "Iniciá sesión para participar en la comunidad BAQUEANO.");
  return actor;
}
function requireAdmin(actor: Actor | null): Actor {
  const a = requireActor(actor);
  if (!a.isAdmin) throw new HttpError(403, "Solo el equipo autorizado del Ops Center puede moderar.");
  return a;
}

async function countSince(service: SupabaseClient, table: string, column: string, uid: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await service.from(table).select("id", { count: "exact", head: true }).eq(column, uid).gte("created_at", since);
  return count || 0;
}

async function loadOwned(service: SupabaseClient, id: string, actor: Actor) {
  const { data, error } = await service.from("testimonials").select("id, author_uid, status").eq("id", id).maybeSingle();
  if (error) throw new HttpError(500, "No se pudo leer la experiencia.");
  if (!data) throw new HttpError(404, "La experiencia no existe.");
  if (data.author_uid !== actor.uid && !actor.isAdmin) throw new HttpError(403, "Solo podés modificar tus propias experiencias.");
  return data as { id: string; author_uid: string; status: string };
}

// Campos editables de una experiencia (crear y editar comparten validación).
async function readTestimonialFields(body: Record<string, unknown>, service: SupabaseClient) {
  const title = cleanText(body.title, 120, { required: true, min: 5, label: "el título" })!;
  const text = cleanText(body.body, 4000, { required: true, min: 30, multiline: true, label: "la descripción" })!;
  const departmentId = cleanId(body.department_id, "Departamento");
  if (departmentId) {
    const { data } = await service.from("departments").select("id").eq("id", departmentId).maybeSingle();
    if (!data) throw new HttpError(400, "El departamento no existe.");
  }
  let destinationId = cleanId(body.destination_id, "Destino");
  if (destinationId) {
    const { data } = await service.from("destinations").select("id").eq("id", destinationId).maybeSingle();
    if (!data) destinationId = null;
  }
  let businessId = cleanId(body.business_id, "Negocio");
  if (businessId) {
    const { data } = await service.from("businesses").select("id").eq("id", businessId).maybeSingle();
    if (!data) businessId = null;
  }
  const rating = body.rating == null || body.rating === "" ? null : Number(body.rating);
  if (rating !== null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) throw new HttpError(400, "La valoración va de 1 a 5 estrellas.");
  const type = body.experience_type == null || body.experience_type === "" ? null : String(body.experience_type);
  if (type && !EXPERIENCE_TYPES.has(type)) throw new HttpError(400, "Tipo de experiencia inválido.");
  let visitMonth: string | null = null;
  if (body.visit_month) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(body.visit_month));
    if (!match) throw new HttpError(400, "La fecha de visita debe tener formato AAAA-MM.");
    const year = Number(match[1]);
    const month = Number(match[2]);
    const now = new Date();
    if (year < 1990 || month < 1 || month > 12 || new Date(Date.UTC(year, month - 1, 1)) > now) throw new HttpError(400, "La fecha de visita no es válida.");
    visitMonth = `${match[1]}-${match[2]}-01`;
  }
  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.map((t) => cleanText(t, 30, { label: "una etiqueta" })).filter(Boolean).map((t) => t!.toLowerCase()))].slice(0, 8)
    : [];
  return {
    title,
    body: text,
    destination_id: destinationId,
    destination_ref: cleanId(body.destination_ref, "Destino"),
    destination_name: cleanText(body.destination_name, 120, { label: "el destino" }),
    department_id: departmentId,
    municipality: cleanText(body.municipality, 80, { label: "el municipio" }),
    business_id: businessId,
    place_name: cleanText(body.place_name, 120, { label: "el lugar" }),
    visit_month: visitMonth,
    rating,
    experience_type: type,
    tags,
    recommendations: cleanText(body.recommendations, 1000, { multiline: true, label: "las recomendaciones" }),
    tips: cleanText(body.tips, 1000, { multiline: true, label: "los consejos" }),
  };
}

// Verificación del tipo REAL del archivo por sus primeros bytes.
function detectMime(bytes: Uint8Array): string | null {
  const hex = (start: number, len: number) => Array.from(bytes.slice(start, start + len)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ascii = (start: number, len: number) => String.fromCharCode(...bytes.slice(start, start + len));
  if (hex(0, 3) === "ffd8ff") return "image/jpeg";
  if (hex(0, 8) === "89504e470d0a1a0a") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(4, 4) === "ftyp") return "video/mp4";
  if (hex(0, 4) === "1a45dfa3") return "video/webm";
  return null;
}

async function inspectObject(path: string): Promise<{ size: number; mime: string | null }> {
  const url = publicUrl(path)!;
  const head = await fetch(url, { method: "HEAD" });
  if (!head.ok) throw new HttpError(400, "El archivo no se subió correctamente.");
  const size = Number(head.headers.get("content-length") || 0);
  const res = await fetch(url, { headers: { Range: "bytes=0-63" } });
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { size, mime: detectMime(bytes) };
}

async function removeObjects(service: SupabaseClient, paths: Array<string | null | undefined>) {
  const clean = paths.filter((p): p is string => typeof p === "string" && p.length > 0);
  if (clean.length) await service.storage.from(BUCKET).remove(clean);
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------
async function handle(action: string, body: Record<string, unknown>, actor: Actor | null, anon: SupabaseClient, service: SupabaseClient) {
  switch (action) {
    // ---------- Público ----------
    case "list": {
      const page = Math.min(Math.max(Number(body.page) || 0, 0), 50);
      const limit = Math.min(Math.max(Number(body.limit) || LIMITS.pageSize, 1), 24);
      let query = anon.from("testimonials").select(`${PUBLIC_COLUMNS}, testimonial_media(${MEDIA_COLUMNS})`, { count: "exact" }).eq("status", "published");
      const department = cleanId(body.department, "Departamento");
      const destination = cleanId(body.destination, "Destino");
      if (department) query = query.eq("department_id", department);
      if (destination) query = query.or(`destination_ref.eq.${destination},destination_id.eq.${destination}`);
      if (body.type && EXPERIENCE_TYPES.has(String(body.type))) query = query.eq("experience_type", String(body.type));
      if (body.media === "photos") query = query.gt("photo_count", 0);
      if (body.media === "video") query = query.gt("video_count", 0);
      const q = cleanText(body.q, 80, { label: "la búsqueda" });
      if (q) query = query.textSearch("search_vector", q, { type: "websearch", config: "spanish" });
      const sort = String(body.sort || "recent");
      if (sort === "rating") query = query.order("rating", { ascending: false, nullsFirst: false });
      else if (sort === "comments") query = query.order("comments_count", { ascending: false });
      else if (sort === "reactions") query = query.order("reactions_count", { ascending: false });
      query = query.order("featured", { ascending: false }).order("published_at", { ascending: false }).range(page * limit, page * limit + limit - 1);
      const { data, error, count } = await query;
      if (error) throw new HttpError(500, "No se pudieron cargar las experiencias.");
      const items = (data || []).map((t: Record<string, unknown>) => ({ ...t, media: shapeMedia(t.testimonial_media as Array<Record<string, unknown>>), testimonial_media: undefined }));
      let reacted: string[] = [];
      if (actor && items.length) {
        const { data: mine } = await service.from("testimonial_reactions").select("testimonial_id").eq("author_uid", actor.uid).in("testimonial_id", items.map((i) => i.id as string));
        reacted = (mine || []).map((r: { testimonial_id: string }) => r.testimonial_id);
      }
      return { items: items.map((i) => ({ ...i, reacted: reacted.includes(i.id as string) })), total: count || 0, page, limit };
    }
    case "get": {
      const id = cleanUuid(body.id, "la experiencia")!;
      let testimonial: Record<string, unknown> | null = null;
      const { data } = await anon.from("testimonials").select(`${PUBLIC_COLUMNS}, testimonial_media(${MEDIA_COLUMNS})`).eq("id", id).maybeSingle();
      testimonial = data;
      let isMine = false;
      if (actor) {
        const { data: own } = await service.from("testimonials").select(`${PUBLIC_COLUMNS}, author_uid, moderation_note, testimonial_media(${MEDIA_COLUMNS})`).eq("id", id).maybeSingle();
        if (own && (own.author_uid === actor.uid || actor.isAdmin)) {
          isMine = own.author_uid === actor.uid;
          testimonial = own;
          delete (testimonial as Record<string, unknown>).author_uid;
        }
      }
      if (!testimonial) throw new HttpError(404, "La experiencia no existe o todavía no está publicada.");
      const { data: comments } = await anon.from("testimonial_comments")
        .select("id, parent_id, author_name, author_avatar, body, edited, reactions_count, created_at, updated_at")
        .eq("testimonial_id", id).eq("status", "published").order("created_at", { ascending: true }).limit(300);
      let ownComments: string[] = [];
      let reactedComments: string[] = [];
      let reacted = false;
      if (actor && comments?.length) {
        const ids = comments.map((c: { id: string }) => c.id);
        const { data: own } = await service.from("testimonial_comments").select("id").eq("author_uid", actor.uid).in("id", ids);
        ownComments = (own || []).map((c: { id: string }) => c.id);
        const { data: reactions } = await service.from("testimonial_reactions").select("comment_id").eq("author_uid", actor.uid).in("comment_id", ids);
        reactedComments = (reactions || []).map((r: { comment_id: string }) => r.comment_id);
      }
      if (actor) {
        const { data: r } = await service.from("testimonial_reactions").select("id").eq("author_uid", actor.uid).eq("testimonial_id", id).limit(1);
        reacted = Boolean(r && r.length);
      }
      return {
        item: { ...testimonial, media: shapeMedia(testimonial.testimonial_media as Array<Record<string, unknown>>), testimonial_media: undefined, is_mine: isMine, reacted },
        comments: (comments || []).map((c: Record<string, unknown>) => ({ ...c, is_mine: ownComments.includes(c.id as string), reacted: reactedComments.includes(c.id as string) })),
      };
    }
    case "destination_feed": {
      const limit = Math.min(Math.max(Number(body.limit) || 3, 1), 6);
      const destination = cleanId(body.destination, "Destino");
      const department = cleanId(body.department, "Departamento");
      if (!destination && !department) throw new HttpError(400, "Indicá un destino o departamento.");
      let query = anon.from("testimonials").select(`${PUBLIC_COLUMNS}, testimonial_media(${MEDIA_COLUMNS})`).eq("status", "published");
      if (destination) query = query.or(`destination_ref.eq.${destination},destination_id.eq.${destination}`);
      else query = query.eq("department_id", department!);
      const { data, error } = await query.order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(limit);
      if (error) throw new HttpError(500, "No se pudieron cargar las experiencias del destino.");
      return { items: (data || []).map((t: Record<string, unknown>) => ({ ...t, media: shapeMedia(t.testimonial_media as Array<Record<string, unknown>>), testimonial_media: undefined })) };
    }

    // ---------- Con sesión ----------
    case "mine": {
      const a = requireActor(actor);
      const { data, error } = await service.from("testimonials")
        .select(`${PUBLIC_COLUMNS}, moderation_note, testimonial_media(${MEDIA_COLUMNS})`)
        .eq("author_uid", a.uid).neq("status", "archived").order("created_at", { ascending: false }).limit(50);
      if (error) throw new HttpError(500, "No se pudieron cargar tus experiencias.");
      return { items: (data || []).map((t: Record<string, unknown>) => ({ ...t, media: shapeMedia(t.testimonial_media as Array<Record<string, unknown>>), testimonial_media: undefined, is_mine: true })) };
    }
    case "create": {
      const a = requireActor(actor);
      if ((await countSince(service, "testimonials", "author_uid", a.uid, 24 * 60)) >= LIMITS.testimonialsPerDay) {
        throw new HttpError(429, "Ya compartiste varias experiencias hoy. Volvé mañana para publicar otra.");
      }
      const fields = await readTestimonialFields(body, service);
      const hash = await sha256(`${fields.title}\n${fields.body}`.toLowerCase());
      const row = { ...fields, author_uid: a.uid, author_name: a.name, author_avatar: a.avatar, status: "pending_review", content_hash: hash };
      const { data, error } = await service.from("testimonials").insert(row).select("id, status").single();
      if (error) {
        if (error.code === "23505") throw new HttpError(409, "Ya publicaste una experiencia con ese mismo texto.");
        throw new HttpError(400, "No se pudo guardar la experiencia. Revisá los datos.");
      }
      return { id: data.id, status: data.status };
    }
    case "update": {
      const a = requireActor(actor);
      const id = cleanUuid(body.id, "la experiencia")!;
      const current = await loadOwned(service, id, a);
      if (current.author_uid !== a.uid) throw new HttpError(403, "Solo el autor edita su experiencia.");
      const fields = await readTestimonialFields(body, service);
      const hash = await sha256(`${fields.title}\n${fields.body}`.toLowerCase());
      // Cambiar el contenido devuelve la experiencia a revisión.
      const { error } = await service.from("testimonials").update({ ...fields, content_hash: hash, status: "pending_review" }).eq("id", id);
      if (error) throw new HttpError(400, error.code === "23505" ? "Ya tenés otra experiencia con ese texto." : "No se pudo actualizar la experiencia.");
      return { id, status: "pending_review" };
    }
    case "delete": {
      const a = requireActor(actor);
      const id = cleanUuid(body.id, "la experiencia")!;
      await loadOwned(service, id, a);
      const { data: media } = await service.from("testimonial_media").select("storage_path, thumb_path").eq("testimonial_id", id);
      await removeObjects(service, (media || []).flatMap((m: { storage_path: string; thumb_path: string | null }) => [m.storage_path, m.thumb_path]));
      const { error } = await service.from("testimonials").delete().eq("id", id);
      if (error) throw new HttpError(500, "No se pudo eliminar la experiencia.");
      return { id, deleted: true };
    }
    case "upload_url": {
      const a = requireActor(actor);
      const id = cleanUuid(body.testimonial_id, "la experiencia")!;
      const current = await loadOwned(service, id, a);
      if (current.author_uid !== a.uid) throw new HttpError(403, "Solo el autor agrega fotos o videos.");
      const kind = body.kind === "video" ? "video" : body.kind === "image" ? "image" : null;
      if (!kind) throw new HttpError(400, "Tipo de archivo inválido.");
      const mime = String(body.mime || "");
      const ext = kind === "image" ? IMAGE_MIME[mime] : VIDEO_MIME[mime];
      if (!ext) throw new HttpError(400, kind === "image" ? "Usá fotos WebP, JPG o PNG." : "Usá videos MP4 o WebM.");
      const size = Number(body.size);
      const max = kind === "image" ? LIMITS.imageBytes : LIMITS.videoBytes;
      if (!(size > 0 && size <= max)) throw new HttpError(400, `El archivo supera ${Math.round(max / 1048576)} MB.`);
      const { data: existing } = await service.from("testimonial_media").select("kind").eq("testimonial_id", id);
      const photos = (existing || []).filter((m: { kind: string }) => m.kind === "image").length;
      const videos = (existing || []).filter((m: { kind: string }) => m.kind === "video").length;
      if (kind === "image" && photos >= LIMITS.photosPerTestimonial) throw new HttpError(400, `Máximo ${LIMITS.photosPerTestimonial} fotos por experiencia.`);
      if (kind === "video" && videos >= LIMITS.videosPerTestimonial) throw new HttpError(400, "Máximo un video por experiencia.");
      const base = `${a.uid}/${id}/${crypto.randomUUID()}`;
      const path = `${base}.${ext}`;
      const thumbPath = `${base}-thumb.webp`;
      const store = service.storage.from(BUCKET);
      const main = await store.createSignedUploadUrl(path);
      const thumb = await store.createSignedUploadUrl(thumbPath);
      if (main.error || thumb.error) throw new HttpError(500, "No se pudo preparar la subida.");
      return { path, thumb_path: thumbPath, upload_url: main.data.signedUrl, thumb_upload_url: thumb.data.signedUrl };
    }
    case "attach_media": {
      const a = requireActor(actor);
      const id = cleanUuid(body.testimonial_id, "la experiencia")!;
      const current = await loadOwned(service, id, a);
      if (current.author_uid !== a.uid) throw new HttpError(403, "Solo el autor agrega fotos o videos.");
      const prefix = `${a.uid}/${id}/`;
      const path = String(body.path || "");
      const thumbPath = body.thumb_path ? String(body.thumb_path) : null;
      if (!path.startsWith(prefix) || path.includes("..") || (thumbPath && (!thumbPath.startsWith(prefix) || thumbPath.includes("..")))) {
        throw new HttpError(403, "Ruta de archivo no permitida.");
      }
      const kind = body.kind === "video" ? "video" : "image";
      const info = await inspectObject(path);
      const allowed = kind === "image" ? IMAGE_MIME : VIDEO_MIME;
      const max = kind === "image" ? LIMITS.imageBytes : LIMITS.videoBytes;
      if (!info.mime || !allowed[info.mime] || !(info.size > 0 && info.size <= max)) {
        await removeObjects(service, [path, thumbPath]);
        throw new HttpError(400, "El archivo no es una foto o video válido.");
      }
      let thumbOk = false;
      if (thumbPath) {
        const t = await inspectObject(thumbPath).catch(() => null);
        thumbOk = Boolean(t && t.mime === "image/webp" && t.size <= LIMITS.imageBytes);
        if (!thumbOk) await removeObjects(service, [thumbPath]);
      }
      const duration = body.duration == null ? null : Number(body.duration);
      if (kind === "video" && duration !== null && !(duration > 0 && duration <= LIMITS.videoSeconds)) {
        await removeObjects(service, [path, thumbPath]);
        throw new HttpError(400, `El video debe durar como máximo ${LIMITS.videoSeconds} segundos.`);
      }
      const dim = (v: unknown) => (Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) <= 10000 ? Number(v) : null);
      const { data, error } = await service.from("testimonial_media").insert({
        testimonial_id: id, author_uid: a.uid, kind, storage_path: path, thumb_path: thumbOk ? thumbPath : null,
        mime_type: info.mime, size_bytes: info.size, width: dim(body.width), height: dim(body.height),
        duration_seconds: kind === "video" ? duration : null, position: Math.min(Math.max(Number(body.position) || 0, 0), 20), status: "ready",
      }).select("id").single();
      if (error) {
        await removeObjects(service, [path, thumbPath]);
        throw new HttpError(400, "No se pudo adjuntar el archivo.");
      }
      return { id: data.id, url: publicUrl(path), thumb: thumbOk ? publicUrl(thumbPath) : null };
    }
    case "remove_media": {
      const a = requireActor(actor);
      const mediaId = cleanUuid(body.id, "el archivo")!;
      const { data } = await service.from("testimonial_media").select("id, author_uid, storage_path, thumb_path").eq("id", mediaId).maybeSingle();
      if (!data) throw new HttpError(404, "El archivo no existe.");
      if (data.author_uid !== a.uid && !a.isAdmin) throw new HttpError(403, "Solo el autor quita sus archivos.");
      await removeObjects(service, [data.storage_path, data.thumb_path]);
      await service.from("testimonial_media").delete().eq("id", mediaId);
      return { id: mediaId, removed: true };
    }
    case "comment": {
      const a = requireActor(actor);
      const testimonialId = cleanUuid(body.testimonial_id, "la experiencia")!;
      const parentId = cleanUuid(body.parent_id, "el comentario", false);
      const text = cleanText(body.body, 1500, { required: true, multiline: true, label: "el comentario" })!;
      if ((await countSince(service, "testimonial_comments", "author_uid", a.uid, 10)) >= LIMITS.commentsPer10Min) {
        throw new HttpError(429, "Estás comentando muy rápido. Esperá unos minutos.");
      }
      const { data: t } = await service.from("testimonials").select("id, status").eq("id", testimonialId).maybeSingle();
      if (!t || t.status !== "published") throw new HttpError(404, "Solo se comentan experiencias publicadas.");
      if (parentId) {
        const { data: parent } = await service.from("testimonial_comments").select("testimonial_id, status, parent_id").eq("id", parentId).maybeSingle();
        if (!parent || parent.testimonial_id !== testimonialId || parent.status !== "published") throw new HttpError(400, "El comentario al que respondés no existe.");
      }
      const { data, error } = await service.from("testimonial_comments").insert({
        testimonial_id: testimonialId, parent_id: parentId, author_uid: a.uid, author_name: a.name, author_avatar: a.avatar, body: text,
      }).select("id, parent_id, author_name, author_avatar, body, edited, reactions_count, created_at").single();
      if (error) throw new HttpError(400, "No se pudo publicar el comentario.");
      return { comment: { ...data, is_mine: true, reacted: false } };
    }
    case "edit_comment": {
      const a = requireActor(actor);
      const id = cleanUuid(body.id, "el comentario")!;
      const text = cleanText(body.body, 1500, { required: true, multiline: true, label: "el comentario" })!;
      const { data } = await service.from("testimonial_comments").select("author_uid, status").eq("id", id).maybeSingle();
      if (!data || data.status === "deleted") throw new HttpError(404, "El comentario no existe.");
      if (data.author_uid !== a.uid) throw new HttpError(403, "Solo podés editar tus propios comentarios.");
      const { error } = await service.from("testimonial_comments").update({ body: text, edited: true }).eq("id", id);
      if (error) throw new HttpError(400, "No se pudo editar el comentario.");
      return { id, body: text, edited: true };
    }
    case "delete_comment": {
      const a = requireActor(actor);
      const id = cleanUuid(body.id, "el comentario")!;
      const { data } = await service.from("testimonial_comments").select("author_uid").eq("id", id).maybeSingle();
      if (!data) throw new HttpError(404, "El comentario no existe.");
      if (data.author_uid !== a.uid && !a.isAdmin) throw new HttpError(403, "Solo podés eliminar tus propios comentarios.");
      const { error } = await service.from("testimonial_comments").update({ status: "deleted" }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo eliminar el comentario.");
      return { id, deleted: true };
    }
    case "react": {
      const a = requireActor(actor);
      if ((await countSince(service, "testimonial_reactions", "author_uid", a.uid, 1)) >= LIMITS.reactionsPerMinute) {
        throw new HttpError(429, "Demasiadas reacciones seguidas. Esperá un momento.");
      }
      const kind = REACTIONS.has(String(body.kind)) ? String(body.kind) : "like";
      const testimonialId = cleanUuid(body.testimonial_id, "la experiencia", false);
      const commentId = cleanUuid(body.comment_id, "el comentario", false);
      if (Boolean(testimonialId) === Boolean(commentId)) throw new HttpError(400, "Reaccioná a una experiencia o a un comentario.");
      const column = testimonialId ? "testimonial_id" : "comment_id";
      const target = (testimonialId || commentId)!;
      const { data: existing } = await service.from("testimonial_reactions").select("id").eq(column, target).eq("author_uid", a.uid).eq("kind", kind).maybeSingle();
      if (existing) {
        await service.from("testimonial_reactions").delete().eq("id", existing.id);
      } else {
        const { error } = await service.from("testimonial_reactions").insert({ [column]: target, author_uid: a.uid, kind });
        if (error) throw new HttpError(400, "No se pudo registrar la reacción.");
      }
      const table = testimonialId ? "testimonials" : "testimonial_comments";
      const { data: counts } = await service.from(table).select("reactions_count").eq("id", target).maybeSingle();
      return { reacted: !existing, count: counts?.reactions_count ?? 0 };
    }
    case "report": {
      const a = requireActor(actor);
      if ((await countSince(service, "testimonial_reports", "reporter_uid", a.uid, 60)) >= LIMITS.reportsPerHour) {
        throw new HttpError(429, "Ya enviaste varias denuncias. Gracias: el equipo las revisará.");
      }
      const reason = String(body.reason || "");
      if (!REPORT_REASONS.has(reason)) throw new HttpError(400, "Elegí un motivo de denuncia.");
      const testimonialId = cleanUuid(body.testimonial_id, "la experiencia", false);
      const commentId = cleanUuid(body.comment_id, "el comentario", false);
      if (Boolean(testimonialId) === Boolean(commentId)) throw new HttpError(400, "Denunciá una experiencia o un comentario.");
      const { error } = await service.from("testimonial_reports").insert({
        testimonial_id: testimonialId, comment_id: commentId, reporter_uid: a.uid, reason,
        details: cleanText(body.details, 500, { multiline: true, label: "el detalle" }),
      });
      if (error) {
        if (error.code === "23505") return { reported: true, duplicate: true };
        throw new HttpError(400, "No se pudo enviar la denuncia.");
      }
      return { reported: true };
    }

    // ---------- Moderación (Ops Center) ----------
    case "mod_queue": {
      requireAdmin(actor);
      const status = MODERATION_STATES.has(String(body.status)) ? String(body.status) : "pending_review";
      const { data, error } = await service.from("testimonials")
        .select(`${PUBLIC_COLUMNS}, moderation_note, moderated_at, reports_count, testimonial_media(${MEDIA_COLUMNS}), testimonial_reports(id, reason, details, status, created_at)`)
        .eq("status", status).order("created_at", { ascending: false }).limit(60);
      if (error) throw new HttpError(500, "No se pudo cargar la cola de moderación.");
      const { data: comments } = await service.from("testimonial_comments")
        .select("id, testimonial_id, author_name, body, status, reports_count, created_at")
        .in("status", ["reported", "hidden"]).order("created_at", { ascending: false }).limit(60);
      const counts: Record<string, number> = {};
      for (const s of MODERATION_STATES) {
        const { count } = await service.from("testimonials").select("id", { count: "exact", head: true }).eq("status", s);
        counts[s] = count || 0;
      }
      return {
        items: (data || []).map((t: Record<string, unknown>) => ({ ...t, media: shapeMedia(t.testimonial_media as Array<Record<string, unknown>>), testimonial_media: undefined })),
        comments: comments || [], counts,
      };
    }
    case "moderate": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.id, "la experiencia")!;
      const patch: Record<string, unknown> = { moderated_by: a.email || a.uid, moderated_at: new Date().toISOString() };
      if (body.status != null) {
        const status = String(body.status);
        if (!MODERATION_STATES.has(status)) throw new HttpError(400, "Estado inválido.");
        patch.status = status;
        if (status === "published") {
          const { data } = await service.from("testimonials").select("published_at").eq("id", id).maybeSingle();
          if (!data?.published_at) patch.published_at = new Date().toISOString();
          await service.from("testimonial_reports").update({ status: "reviewed", reviewed_by: a.email || a.uid, reviewed_at: new Date().toISOString() })
            .eq("testimonial_id", id).eq("status", "open");
        }
      }
      if (typeof body.featured === "boolean") patch.featured = body.featured;
      if (typeof body.verified_visit === "boolean") patch.verified_visit = body.verified_visit;
      if (body.note !== undefined) patch.moderation_note = cleanText(body.note, 500, { multiline: true, label: "la nota" });
      const { error } = await service.from("testimonials").update(patch).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo moderar la experiencia.");
      // Contenido rechazado: se borran sus archivos para no ocupar almacenamiento.
      if (patch.status === "rejected") {
        const { data: media } = await service.from("testimonial_media").select("storage_path, thumb_path").eq("testimonial_id", id);
        await removeObjects(service, (media || []).flatMap((m: { storage_path: string; thumb_path: string | null }) => [m.storage_path, m.thumb_path]));
        await service.from("testimonial_media").delete().eq("testimonial_id", id);
      }
      return { id, ...patch };
    }
    case "mod_comment": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.id, "el comentario")!;
      const status = String(body.status || "");
      if (!["published", "hidden", "deleted"].includes(status)) throw new HttpError(400, "Estado inválido.");
      const { error } = await service.from("testimonial_comments").update({ status }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo moderar el comentario.");
      await service.from("testimonial_reports").update({ status: status === "published" ? "dismissed" : "actioned", reviewed_by: a.email || a.uid, reviewed_at: new Date().toISOString() })
        .eq("comment_id", id).eq("status", "open");
      return { id, status };
    }
    case "resolve_report": {
      const a = requireAdmin(actor);
      const id = cleanUuid(body.id, "la denuncia")!;
      const status = String(body.status || "");
      if (!["reviewed", "dismissed", "actioned"].includes(status)) throw new HttpError(400, "Estado inválido.");
      const { error } = await service.from("testimonial_reports").update({ status, reviewed_by: a.email || a.uid, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new HttpError(500, "No se pudo resolver la denuncia.");
      return { id, status };
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
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false } });
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const actor = await resolveActor(req, service);
    const result = await handle(String(body.action || ""), body, actor, anon, service);
    return reply(200, { ok: true, ...result }, origin);
  } catch (error) {
    if (error instanceof HttpError) return reply(error.status, { ok: false, error: error.message }, origin);
    console.error("[baqueano-community]", error);
    return reply(500, { ok: false, error: "Error interno. Intentá de nuevo en unos minutos." }, origin);
  }
});
