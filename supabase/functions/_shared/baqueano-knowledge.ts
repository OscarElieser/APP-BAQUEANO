// ============================================================================
// BAQUEANO — SERVICIO DE CONOCIMIENTO TURÍSTICO INTERNAL-FIRST
// ============================================================================
// 🎯 POR QUÉ: BAQÜI debe conocer el territorio desde BAQUEANO antes de recurrir
//    a fuentes externas que pueden diluir identidad o contradecir datos propios.
// ⚙️ CÓMO: consulta dominios Supabase en paralelo, calcula suficiencia por
//    cobertura y conserva procedencia por registro para permitir fusión auditable.
// 📦 QUÉ: búsqueda transversal, evaluación de suficiencia y fusión donde la
//    información interna prevalece y lo externo solo completa campos ausentes.
// - 2026-10-20 (planes): los negocios con plan vigente se ordenan según lo que promete su plan
//   (planes.html): Mirador y Cumbre van primero en las búsquedas de BAQUI y Cumbre, además, se
//   recomienda cuando piden su tipo de servicio en su departamento. Sendero no tiene prioridad.
//   Cada registro destacado lleva payload.plan_featured para que BAQUI lo diga con transparencia.
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
type Publication = "none" | "status" | "status_not_deleted" | "is_published" | "business" | "event";
const SEARCH_DOMAINS: ReadonlyArray<{table: string; title: string; publication: Publication}> = [
  {table: "departments", title: "name", publication: "none"}, {table: "municipalities", title: "name", publication: "none"},
  {table: "destinations", title: "name", publication: "status_not_deleted"}, {table: "places", title: "name", publication: "is_published"},
  {table: "businesses", title: "name", publication: "business"}, {table: "culture", title: "title", publication: "status"},
  {table: "heritage", title: "name", publication: "status"}, {table: "museums", title: "name", publication: "status"},
  {table: "gastronomy", title: "dish_name", publication: "status"}, {table: "communities", title: "name", publication: "status"},
  {table: "experiences", title: "title", publication: "status"}, {table: "routes", title: "title", publication: "status"},
  {table: "events", title: "title", publication: "event"}
];
const PRIVATE_FIELDS = new Set(["owner_uid", "owner_id", "commission_rate", "metadata", "created_by", "updated_by",
  "legacy_key", "legacy_source", "written_by_uid", "written_by_email", "user_uid", "user_id", "attributes", "internal_notes"]);

// deno-lint-ignore no-explicit-any
function published(request: any, publication: Publication) {
  if (publication === "status") return request.eq("status", "published");
  if (publication === "status_not_deleted") return request.eq("status", "published").is("deleted_at", null);
  if (publication === "is_published") return request.eq("is_published", true);
  if (publication === "event") return request.in("status", ["published", "historical"]);
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
    const found = await this.searchDomains(query, limitPerDomain);
    return await this.applyPlanPriority(query, found);
  }

  // Planes vigentes (solo id del negocio y plan; ningún dato del cliente). Sin datos → sin cambios.
  private async applyPlanPriority(query: string, records: KnowledgeRecord[]): Promise<KnowledgeRecord[]> {
    try {
      const {data, error} = await this.supabase.rpc("public_plan_tiers");
      if (error || !Array.isArray(data) || !data.length) return records;
      const tiers = new Map<string, string>();
      for (const row of data as Array<{business_id: string; plan_code: string}>) tiers.set(String(row.business_id), String(row.plan_code));
      const out = [...records];
      // Cumbre: «BAQUI te recomienda primero cuando piden tu servicio en tu zona».
      const zone = planZone(query);
      const cumbreIds = [...tiers].filter(([, plan]) => plan === "cumbre").map(([id]) => id)
        .filter((id) => !out.some((r) => r.entityType === "businesses" && r.entityId === id));
      if (zone.department && zone.categories.length && cumbreIds.length) {
        const {data: extra} = await published(this.supabase.from("businesses").select("*"), "business")
          .in("id", cumbreIds).eq("department_id", zone.department).in("category", zone.categories).limit(3);
        const retrievedAt = new Date().toISOString();
        for (const row of (extra || []) as Record<string, unknown>[]) {
          out.push({entityType: "businesses", entityId: String(row.id), title: String(row.name || ""), payload: publicPayload(row),
            sourceType: "baqueano", sourceUrl: null, retrievedAt, confidence: row.verified === true ? 1 : 0.82});
        }
      }
      const rank = (r: KnowledgeRecord) => {
        if (r.entityType !== "businesses" || !r.entityId) return 3;
        const plan = tiers.get(r.entityId);
        return plan === "cumbre" ? 0 : plan === "mirador" ? 1 : 3;
      };
      for (const r of out) {
        const plan = r.entityId && r.entityType === "businesses" ? tiers.get(r.entityId) : undefined;
        if (plan === "cumbre" || plan === "mirador") r.payload = {...r.payload, plan_featured: plan};
      }
      // Orden estable: los destacados pasan adelante; el resto conserva su orden.
      return out.map((r, i) => ({r, i})).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i).map((x) => x.r);
    } catch (_) {
      return records;
    }
  }

  private async searchDomains(query: string, limitPerDomain: number): Promise<KnowledgeRecord[]> {
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

// Departamento y tipo de servicio que pide la persona («hospedaje en León», «dónde comer en Granada»).
const ZONE_DEPARTMENTS: Array<[string, RegExp]> = [
  ["boaco", /\bboaco\b/], ["carazo", /\bcarazo\b|\bjinotepe\b|\bdiriamba\b/], ["chinandega", /\bchinandega\b/],
  ["chontales", /\bchontales\b|\bjuigalpa\b/], ["raccn", /\bcaribe norte\b|\bbilwi\b|\bpuerto cabezas\b/],
  ["raccs", /\bcaribe sur\b|\bbluefields\b|\bcorn island\b/], ["esteli", /\besteli\b/], ["granada", /\bgranada\b/],
  ["jinotega", /\bjinotega\b/], ["leon", /\bleon\b/], ["madriz", /\bmadriz\b|\bsomoto\b/], ["managua", /\bmanagua\b/],
  ["masaya", /\bmasaya\b/], ["matagalpa", /\bmatagalpa\b/], ["nueva_segovia", /\bnueva segovia\b|\bocotal\b/],
  ["rio_san_juan", /\brio san juan\b|\bsan carlos\b/], ["rivas", /\brivas\b|\bsan juan del sur\b|\bometepe\b/],
];
const ZONE_CATEGORIES: Array<[RegExp, string[]]> = [
  [/\b(hospedajes?|hotel(es)?|hostal(es)?|alojamientos?|dormir|quedarme|posadas?|cabanas?)\b/, ["hospedaje", "alojamiento"]],
  [/\b(restaurantes?|comer|comida|almorzar|cenar|desayunar|comedor(es)?|fritanga)\b/, ["restaurante", "comedor", "kiosco", "gastronomia"]],
  [/\b(guias?|tours?|excursion(es)?|recorridos? guiados?)\b/, ["guia", "experiencia"]],
  [/\b(transporte|traslados?|taxi|shuttle)\b/, ["transporte"]],
];
export function planZone(query: string): {department: string | null; categories: string[]} {
  const t = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const dept = ZONE_DEPARTMENTS.find(([, re]) => re.test(t));
  const categories = ZONE_CATEGORIES.filter(([re]) => re.test(t)).flatMap(([, c]) => c);
  return {department: dept ? dept[0] : null, categories};
}

export function mergeKnowledgeSources(internal: Record<string, unknown>, external: Record<string, unknown>) {
  const operationalFields = new Set(["address", "phone", "schedule", "coordinates", "website", "operational_status"]);
  const merged: Record<string, unknown> = {...internal};
  for (const [field, value] of Object.entries(external)) {
    if (merged[field] == null && operationalFields.has(field)) merged[field] = value;
  }
  return merged;
}
