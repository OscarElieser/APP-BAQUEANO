/**
 * 🎯 POR QUÉ: el centro de notificaciones (web y Android) recibe avisos de varios módulos
 *   (opiniones, buzón, mensajes). Este helper es el único punto que los crea, así todos
 *   respetan el mismo formato y la deduplicación.
 * ⚙️ CÓMO: inserta en public.notifications con service_role. Los textos van como claves i18n
 *   + params, para que la campana los muestre en el idioma de cada persona. dedupe_key evita
 *   duplicados masivos: el índice único hace que un mismo aviso no se repita.
 *   Si falla, NO rompe la acción principal: devuelve false y lo registra en el log.
 * 📦 QUÉ: notify(service, { recipient, type, titleKey, bodyKey, params, link, source, refId, dedupeKey }).
 */
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type NotifyInput = {
  recipient: string;
  type: string;
  titleKey: string;
  bodyKey?: string | null;
  params?: Record<string, string | number | null>;
  link?: string | null;
  source: string;
  refId?: string | null;
  dedupeKey?: string | null;
};

export async function notify(service: SupabaseClient, n: NotifyInput): Promise<boolean> {
  if (!n.recipient) return false;
  const { error } = await service.from("notifications").insert({
    recipient_uid: n.recipient,
    type: n.type,
    title_key: n.titleKey,
    body_key: n.bodyKey ?? null,
    params: n.params ?? {},
    link: n.link ?? null,
    source: n.source,
    ref_id: n.refId ?? null,
    dedupe_key: n.dedupeKey ?? null,
  });
  if (error && error.code !== "23505") {
    console.error("[notify]", n.type, error.code || "error");
    return false;
  }
  return true;
}
