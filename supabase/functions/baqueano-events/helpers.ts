// ============================================================================
// 🗓️ BAQUEANO — baqueano-events: utilidades puras (sin red ni base de datos)
// ============================================================================
// 🎯 POR QUÉ: validar cada evento igual siempre (Ops Center, BAQÜI o la app) y poder probarlo
//   sin levantar la función. Fechas sin ambigüedad: lo que el equipo escribe es hora de
//   Nicaragua (UTC−6 todo el año, sin horario de verano) y se guarda como instante UTC.
// 📦 QUÉ: HttpError, CATEGORIES, slugify, managuaToIso, isoToManagua, validateEvent.
//   Pruebas: deno test supabase/functions/baqueano-events/helpers.test.ts
// ============================================================================

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}

export const CATEGORIES = [
  "feria_turistica", "festival_cultural", "gastronomia", "musica", "tradiciones", "arte_patrimonio",
  "naturaleza", "turismo_comunitario", "deporte_aventura", "exposicion", "tecnologia_emprendimiento", "familiar",
] as const;
export const DEPARTMENTS = ["boaco", "carazo", "chinandega", "chontales", "raccn", "raccs", "esteli", "granada", "jinotega",
  "leon", "madriz", "managua", "masaya", "matagalpa", "nueva_segovia", "rio_san_juan", "rivas"];
const MODALITIES = ["presencial", "virtual", "hibrido"];
const ACCESS = ["free", "paid", "unconfirmed"];

export function slugify(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90).replace(/-+$/g, "");
}

// "2026-11-14" + "18:30" (hora de Nicaragua) → "2026-11-15T00:30:00.000Z". Sin hora → 00:00 local.
export function managuaToIso(date: unknown, time?: unknown): string | null {
  const d = String(date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = time == null || time === "" ? "00:00" : String(time).trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return null;
  const ms = Date.parse(`${d}T${t}:00-06:00`);
  if (!Number.isFinite(ms)) return null;
  // Rechaza fechas que JavaScript "corrige" (31 de febrero, etc.).
  const back = isoToManagua(new Date(ms).toISOString());
  if (back.date !== d) return null;
  return new Date(ms).toISOString();
}

export function isoToManagua(iso: string): { date: string; time: string } {
  const local = new Date(Date.parse(iso) - 6 * 3600_000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

function text(v: unknown, max: number, label: string, opts: { required?: boolean; min?: number } = {}): string | null {
  if (v == null || v === "") {
    if (opts.required) throw new HttpError(400, `Falta ${label}.`, "field_required");
    return null;
  }
  if (typeof v !== "string") throw new HttpError(400, `${label} no es texto.`, "field_invalid");
  const clean = v.normalize("NFC").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) {
    if (opts.required) throw new HttpError(400, `Falta ${label}.`, "field_required");
    return null;
  }
  if (opts.min && clean.length < opts.min) throw new HttpError(400, `${label} es demasiado corto (mínimo ${opts.min}).`, "field_short");
  if (clean.length > max) throw new HttpError(400, `${label} supera ${max} caracteres.`, "field_long");
  return clean;
}
function https(v: unknown, label: string): string | null {
  const s = text(v, 500, label);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") throw new Error("x");
    return u.toString();
  } catch (_) {
    throw new HttpError(400, `${label} debe ser un enlace https:// válido.`, "url_invalid");
  }
}
function oneOf(v: unknown, list: readonly string[], label: string, fallback?: string): string {
  const s = String(v == null || v === "" ? (fallback ?? "") : v);
  if (!list.includes(s)) throw new HttpError(400, `${label} no es válido.`, "field_invalid");
  return s;
}

export type EventRow = Record<string, unknown>;

// Valida lo que llega del Ops Center y devuelve las columnas de public.events.
// No decide la publicación ni el estado (cancelado/reprogramado): eso son acciones aparte.
export function validateEvent(p: Record<string, unknown>): EventRow {
  const title = text(p.title, 160, "el nombre del evento", { required: true, min: 3 })!;
  const category = oneOf(p.category, CATEGORIES, "La categoría");
  const modality = oneOf(p.modality, MODALITIES, "La modalidad", "presencial");
  const timeConfirmed = p.timeConfirmed === true && !!p.startTime;
  const startAt = managuaToIso(p.startDate, timeConfirmed ? p.startTime : null);
  if (!startAt) throw new HttpError(400, "Revisá la fecha y la hora de inicio.", "start_invalid");
  let endAt: string | null = null;
  if (p.endDate) {
    endAt = managuaToIso(p.endDate, p.endTime || "23:59");
    if (!endAt) throw new HttpError(400, "Revisá la fecha y la hora de finalización.", "end_invalid");
    if (Date.parse(endAt) < Date.parse(startAt)) throw new HttpError(400, "La finalización no puede ser antes del inicio.", "end_before_start");
  }
  const departmentId = p.departmentId ? oneOf(p.departmentId, DEPARTMENTS, "El departamento") : null;
  if (modality !== "virtual" && !departmentId) throw new HttpError(400, "Elegí el departamento del evento.", "department_required");
  const access = oneOf(p.accessType, ACCESS, "El tipo de acceso", "unconfirmed");
  let price: number | null = null;
  let currency: string | null = null;
  if (access === "paid" && p.price !== "" && p.price != null) {
    price = Number(p.price);
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000) throw new HttpError(400, "El precio no es válido.", "price_invalid");
    currency = oneOf(p.currency, ["NIO", "USD"], "La moneda");
  }
  let lat: number | null = null;
  let lng: number | null = null;
  if (p.latitude !== "" && p.latitude != null && p.longitude !== "" && p.longitude != null) {
    lat = Number(p.latitude);
    lng = Number(p.longitude);
    if (!(lat >= 10.5 && lat <= 15.2 && lng >= -88 && lng <= -82.5)) {
      throw new HttpError(400, "Las coordenadas no están en Nicaragua.", "coords_invalid");
    }
  }
  const program = Array.isArray(p.program) ? p.program.slice(0, 40).map((item, i) => {
    const r = (item || {}) as Record<string, unknown>;
    const what = text(r.what, 200, `la actividad ${i + 1} del programa`, { required: true })!;
    const time = r.time ? String(r.time).trim() : "";
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new HttpError(400, `Hora inválida en la actividad ${i + 1}.`, "program_invalid");
    const day = r.date ? String(r.date).trim() : "";
    if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new HttpError(400, `Fecha inválida en la actividad ${i + 1}.`, "program_invalid");
    return { date: day || null, time: time || null, what };
  }) : [];
  const venue = text(p.locationName, 160, "el lugar", { required: modality !== "virtual" }) || (modality === "virtual" ? "En línea" : null);
  return {
    title,
    short_description: text(p.shortDescription, 280, "la descripción breve"),
    description: text(p.description, 8000, "la descripción"),
    category,
    modality,
    virtual_url: modality === "presencial" ? null : https(p.virtualUrl, "El enlace de transmisión"),
    start_at: startAt,
    end_at: endAt,
    timezone: "America/Managua",
    time_confirmed: timeConfirmed,
    department_id: departmentId,
    municipality_id: text(p.municipalityId, 80, "el municipio"),
    location_name: venue,
    address: text(p.address, 300, "la dirección"),
    latitude: lat,
    longitude: lng,
    coords_verified: lat != null && p.coordsVerified === true,
    access_type: access,
    price,
    currency,
    organizer_name: text(p.organizerName, 160, "el organizador"),
    organizer_url: https(p.organizerUrl, "El sitio del organizador"),
    contact_info: text(p.contactInfo, 300, "el contacto"),
    official_url: https(p.officialUrl, "El enlace oficial"),
    registration_url: https(p.registrationUrl, "El enlace de inscripción o entradas"),
    program,
    recommendations: text(p.recommendations, 2000, "las recomendaciones"),
    source_name: text(p.sourceName, 160, "la fuente"),
    source_url: https(p.sourceUrl, "El enlace de la fuente"),
    image_alt: text(p.imageAlt, 200, "la descripción de la foto"),
    image_credit: text(p.imageCredit, 160, "el crédito de la foto"),
  };
}
