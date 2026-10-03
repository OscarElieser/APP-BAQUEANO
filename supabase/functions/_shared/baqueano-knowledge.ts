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

const SEARCH_DOMAINS = [
  {table: "departments", title: "name"}, {table: "municipalities", title: "name"},
  {table: "destinations", title: "name"}, {table: "places", title: "name"},
  {table: "businesses", title: "name"}, {table: "culture", title: "title"},
  {table: "heritage", title: "name"}, {table: "museums", title: "name"},
  {table: "gastronomy", title: "dish_name"}, {table: "communities", title: "name"},
  {table: "experiences", title: "title"}, {table: "routes", title: "title"},
  {table: "events", title: "title"}
] as const;

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
        const request = this.supabase.from(domain.table).select("*");
        const {data, error} = terms.length
          ? await request.or(terms.map((term) => `${domain.title}.ilike.%${term}%`).join(",")).limit(limitPerDomain)
          : await request.ilike(domain.title, `%${safeQuery}%`).limit(limitPerDomain);
        if (error || !Array.isArray(data)) return [];
        return data.map((row: Record<string, unknown>) => ({
          entityType: domain.table, entityId: row.id == null ? null : String(row.id),
          title: String(row[domain.title] || ""), payload: row,
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
