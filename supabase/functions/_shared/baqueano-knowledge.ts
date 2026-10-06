// ============================================================================
// BAQUEANO — SERVICIO DE CONOCIMIENTO TURÍSTICO INTERNAL-FIRST
// ============================================================================
// 🎯 POR QUÉ: BAQÜI debe conocer el territorio desde BAQUEANO antes de recurrir
//    a fuentes externas que pueden diluir identidad o contradecir datos propios.
// ⚙️ CÓMO: consulta dominios Supabase en paralelo, calcula suficiencia por
//    cobertura y conserva procedencia por registro para permitir fusión auditable.
// 📦 QUÉ: búsqueda transversal, evaluación de suficiencia y fusión donde la
//    información interna prevalece y lo externo solo completa campos ausentes.
// ============================================================================
import type { SupabaseClient } from "@supabase/supabase-js";

export interface KnowledgeRecord {
  entityType: string;
  entityId: string | null;
  title: string;
  payload: Record<string, unknown>;
  sourceType: "baqueano" | "official" | "google_places" | "external";
  sourceUrl: string | null;
  retrievedAt: string;
  confidence: number;
}

// Auditoría de seguridad 2026-10-06 (knowledge-service-role-bypasses-publication-rls): el cliente de
// BAQUI usa service_role, que salta RLS. Cada dominio reaplica aquí el MISMO predicado de publicación
// que RLS aplica al público (columnas verificadas en la base), y los campos privados nunca llegan al
// modelo ni a la respuesta.
type Publication = "none" | "status" | "status_not_deleted" | "is_published" | "business";
const SEARCH_DOMAINS: ReadonlyArray<{table: string; title: string; publication: Publication}> = [
  {table: "departments", title: "name", publication: "none"}, {table: "municipalities", title: "name", publication: "none"},
  {table: "destinations", title: "name", publication: "status_not_deleted"}, {table: "places", title: "name", publication: "is_published"},
  {table: "businesses", title: "name", publication: "business"}, {table: "culture", title: "title", publication: "status"},
  {table: "heritage", title: "name", publication: "status"}, {table: "museums", title: "name", publication: "status"},
  {table: "gastronomy", title: "dish_name", publication: "status"}, {table: "communities", title: "name", publication: "status"},
  {table: "experiences", title: "title", publication: "status"}, {table: "routes", title: "title", publication: "status"},
  {table: "events", title: "title", publication: "status"}
];
const PRIVATE_FIELDS = new Set(["owner_uid", "owner_id", "commission_rate", "metadata", "created_by", "updated_by",
  "legacy_key", "legacy_source", "written_by_uid", "written_by_email", "user_uid", "user_id", "attributes", "internal_notes"]);

// deno-lint-ignore no-explicit-any
function published(request: any, publication: Publication) {
  if (publication === "status") return request.eq("status", "published");
  if (publication === "status_not_deleted") return request.eq("status", "published").is("deleted_at", null);
  if (publication === "is_published") return request.eq("is_published", true);
  if (publication === "business") return request.eq("status", "published").is("deleted_at", null);
  return request;
}
function publicPayload(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) if (!PRIVATE_FIELDS.has(key)) out[key] = value;
  return out;
}

export class BaqueanoKnowledgeService {
  constructor(private readonly supabase: SupabaseClient) {}

  async search(query: string, limitPerDomain = 4): Promise<KnowledgeRecord[]> {
    const safeQuery = query.replace(/[%_,()]/g, " ").trim().slice(0, 120);
    if (safeQuery.length < 2) return [];
    const terms = safeQuery.split(/\s+/).map((term) => term.replace(/[^\p{L}\p{N}-]/gu, ""))
      .filter((term) => term.length >= 4).slice(-6);
    const retrievedAt = new Date().toISOString();
    const results = await Promise.all(SEARCH_DOMAINS.map(async (domain) => {
      try {
        const request = published(this.supabase.from(domain.table).select("*"), domain.publication);
        const {data, error} = terms.length
          ? await request.or(terms.map((term) => `${domain.title}.ilike.%${term}%`).join(",")).limit(limitPerDomain)
          : await request.ilike(domain.title, `%${safeQuery}%`).limit(limitPerDomain);
        if (error || !Array.isArray(data)) return [];
        return data.map((row: Record<string, unknown>) => ({
          entityType: domain.table, entityId: row.id == null ? null : String(row.id),
          title: String(row[domain.title] || ""), payload: publicPayload(row),
          sourceType: "baqueano" as const, sourceUrl: null, retrievedAt,
          confidence: row.verified === true ? 1 : 0.82
        }));
      } catch (_) { return []; }
    }));
    return results.flat();
  }

  isSufficient(records: KnowledgeRecord[]): boolean {
    const domains = new Set(records.map((record) => record.entityType));
    return records.length >= 2 && (domains.has("destinations") || domains.has("departments") || domains.has("municipalities"));
  }
}

export function mergeKnowledgeSources(internal: Record<string, unknown>, external: Record<string, unknown>) {
  const operationalFields = new Set(["address", "phone", "schedule", "coordinates", "website", "operational_status"]);
  const merged: Record<string, unknown> = {...internal};
  for (const [field, value] of Object.entries(external)) {
    if (merged[field] == null && operationalFields.has(field)) merged[field] = value;
  }
  return merged;
}
