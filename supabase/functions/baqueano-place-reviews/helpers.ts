// ============================================================================
// 🧭 BAQUEANO — baqueano-place-reviews: utilidades puras (sin red ni base de datos)
// ============================================================================
// 🎯 POR QUÉ: poder probar saneado, antispam y nombre público sin levantar la función.
// 📦 QUÉ: HttpError, cleanText, assertPublicSafe, spamFlags, cleanTargetKey, publicName.
//    Pruebas: deno test supabase/functions/baqueano-place-reviews/helpers.test.ts
// ============================================================================

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}

// Lista corta y conservadora: solo marca para revisión humana, nunca rechaza sola.
const OFFENSIVE = /\b(hijueputa|hijo de puta|puta|put[oa]s?|mierda|culer[oa]|maric[oó]n|pendej[oa]|cabr[oó]n|idiota|imb[eé]cil|est[uú]pid[oa]|fuck|shit|bitch|asshole)\b/i;

export function cleanText(value: unknown, max: number, opts: { required?: boolean; min?: number; label: string; code: string }): string | null {
  if (value == null || value === "") {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${opts.label} no es texto.`, `${opts.code}_invalid`);
  const text = value.normalize("NFC")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[​-‏‪-‮⁦-⁩]/g, "")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) {
    if (opts.required) throw new HttpError(400, `Falta ${opts.label}.`, `${opts.code}_required`);
    return null;
  }
  if (opts.min && text.length < opts.min) throw new HttpError(400, `${opts.label} es demasiado corto (mínimo ${opts.min} caracteres).`, `${opts.code}_short`);
  if (text.length > max) throw new HttpError(400, `${opts.label} supera ${max} caracteres.`, `${opts.code}_long`);
  return text;
}

// Lo público no lleva enlaces ni datos de contacto (spam, enlaces maliciosos, datos personales).
export function assertPublicSafe(text: string, label: string, code: string) {
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ni|io|app|xyz|info|biz|ly|me|co)\b)/i.test(text)) {
    throw new HttpError(400, `Por seguridad, ${label} no puede incluir enlaces.`, `${code}_links`);
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    throw new HttpError(400, `Para proteger tus datos, ${label} no puede incluir correos electrónicos.`, `${code}_email`);
  }
  if (/(?:\+?\d[\s.-]?){8,}/.test(text)) {
    throw new HttpError(400, `Para proteger tus datos, ${label} no puede incluir números de teléfono.`, `${code}_phone`);
  }
  if (/(.)\1{9,}/.test(text)) throw new HttpError(400, `${label} parece spam (caracteres repetidos).`, `${code}_spam`);
}

// Banderas para el equipo. No rechazan: ayudan a priorizar la cola.
export function spamFlags(comment: string): string[] {
  const flags: string[] = [];
  if (comment && OFFENSIVE.test(comment)) flags.push("lenguaje");
  const letters = comment.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length >= 20 && letters === letters.toUpperCase()) flags.push("mayusculas");
  return flags;
}

export function cleanTargetKey(value: unknown): string {
  const key = String(value || "").trim();
  if (!/^(place|destination|business):[a-z0-9][a-z0-9_-]{0,119}$/i.test(key)) {
    throw new HttpError(400, "Destino inválido.", "target_invalid");
  }
  return key;
}

// Nombre público según la elección del autor: completo o abreviado ("Ana M.").
export function publicName(name: string, mode: string): string | null {
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean) return null;
  if (mode !== "short") return clean;
  const parts = clean.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
}

