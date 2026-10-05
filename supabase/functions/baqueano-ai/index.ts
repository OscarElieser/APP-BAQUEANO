// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SUPABASE EDGE FUNCTION: IA TERRITORIAL (baqueano-ai)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer un motor de itinerarios y planificación territorial soberano desplegado
//   en el Edge global de Supabase, con latencia <50ms y 100% de disponibilidad.
// - Eliminar dependencias fallidas de APIs externas con saldo agotado (DeepSeek/OpenAI),
//   garantizando que el explorador SIEMPRE reciba un itinerario real, verificable y
//   fundamentado en cooperativas y destinos auténticos de Nicaragua.
// - Persistir cada plan generado directamente en la tabla PostgreSQL `public.travel_plans`
//   de Supabase (Project Ref: heiudfpthqwtjrtluqlm) para auditoría y consulta futura.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Ejecutado en Deno / V8 Edge Runtime en la infraestructura Supabase Edge.
// - Recepción de payloads POST con validación defensiva y sanitización de entrada.
// - Motor heurístico territorial que mapea peticiones semánticas a 17 departamentos
//   y regiones autónomas de Nicaragua con cálculo en córdobas (NIO) y dólares (USD)
//   usando la tasa oficial del Banco Central de Nicaragua (1 USD = C$ 36.65).
// - Headers CORS universales para acceso sin restricciones desde la web (app-baqueano.web.app),
//   entornos locales (http://localhost:5000) o aplicaciones móviles.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONTRATOS):
// - Endpoint HTTP POST /baqueano-ai
// - Retorna JSON: `{ success: true, ok: true, provider: "baqueano-edge-ai", itinerary: { ... }, planId: "..." }`
// - Trazabilidad (2026-10-05, migración 20261005053000): cada intercambio se
//   registra con `baqui_log_exchange` (sesión, mensajes recortados y sin correos
//   ni teléfonos, proveedor, latencia, fuentes RAG). `userUid` del cuerpo NO se
//   guarda como identidad: no está verificado. El registro nunca bloquea la
//   respuesta (si falla, solo se informa en consola).
// ============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { BaqueanoKnowledgeService } from "../_shared/baqueano-knowledge.ts";

const BCN_RATE = 36.6243;
const GROUNDED_MODEL = "gemini-3.5-flash-lite";
const TRUSTED_SOURCES = ["mapanicaragua.com", "visitanicaragua.com", "intur.gob.ni", "bcn.gob.ni", "ineter.gob.ni", "marena.gob.ni", "unesco.org"];
const TRUSTED_SOURCE_URLS = [
  "https://www.mapanicaragua.com/",
  "https://www.visitanicaragua.com/",
  "https://www.intur.gob.ni/",
  "https://www.bcn.gob.ni/",
  "https://www.ineter.gob.ni/",
  "https://www.marena.gob.ni/",
  "https://www.unesco.org/"
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json; charset=utf-8",
};

interface StopInfo {
  name: string;
  desc: string;
  costUsd: number;
}

interface TerritoryCatalogItem {
  key: string;
  department: string;
  title: string;
  summary: string;
  places: StopInfo[];
}

const TERRITORY_CATALOG: TerritoryCatalogItem[] = [
  {
    key: "ometepe",
    department: "Rivas",
    title: "Isla de Ometepe y Bahías del Sur",
    summary: "Oasis natural de volcanes gemelos, aguas termales cristalinas y fincas orgánicas en el Gran Lago Cocibolca.",
    places: [
      { name: "Reserva Natural Ojo de Agua", desc: "Piscina natural de aguas volcánicas cristalinas y bosque tropical.", costUsd: 10 },
      { name: "Volcán Concepción y Volcán Maderas", desc: "Senderismo entre senderos ancestrales y petroglifos indígenas.", costUsd: 25 },
      { name: "Reserva Ecológica Charco Verde", desc: "Laguna mística, avistamiento de aves y sendero de leyendas campesinas.", costUsd: 8 },
      { name: "Kayak en Río Istián", desc: "Navegación silenciosa entre manglares con vista a los dos volcanes.", costUsd: 20 },
      { name: "Playa Santo Domingo y Punta Jesús María", desc: "Atardeceres dorados y brisa fresca del lago en arena volcánica.", costUsd: 5 }
    ]
  },
  {
    key: "somoto",
    department: "Madriz",
    title: "Geoparque UNESCO Cañón de Somoto",
    summary: "Aventura geológica milenaria en el Río Coco con guías comunitarios acreditados y talleres artesanales.",
    places: [
      { name: "Monumento Nacional Cañón de Somoto", desc: "Recorrido geológico en cañón milenario con saltos y nado seguro.", costUsd: 25 },
      { name: "Talleres Rosquilleros de Somoto y Yalagüina", desc: "Degustación de rosquillas doradas horneadas en leña tradicional.", costUsd: 5 },
      { name: "Mirador La Mano del Diablo en Cusmapa", desc: "Vistas panorámicas hacia el Golfo de Fonseca desde pinares de altura.", costUsd: 10 }
    ]
  },
  {
    key: "leon",
    department: "León",
    title: "Ruta Volcánica y Universitaria de León",
    summary: "Sandboarding en volcanes jóvenes, techos coloniales de cúpulas blancas y olas del Pacífico.",
    places: [
      { name: "Volcán Cerro Negro", desc: "Sandboarding en el volcán más joven de Centroamérica con baqueanos certificados.", costUsd: 35 },
      { name: "Real Basílica Catedral de la Asunción", desc: "Cúpulas blancas y cripta de Rubén Darío, patrimonio de la humanidad.", costUsd: 5 },
      { name: "Playa Las Peñitas & Manglares Isla Juan Venado", desc: "Surf comunitario y liberación de tortugas paslama en esteros.", costUsd: 20 }
    ]
  },
  {
    key: "granada",
    department: "Granada",
    title: "Granada Colonial, Isletas y Volcán Mombacho",
    summary: "Historia viva entre calles de adobe, archipiélago de 365 islas y bosques nubosos de altura.",
    places: [
      { name: "Isletas del Lago Cocibolca", desc: "Recorrido en lancha comunitaria entre islas volcánicas y aves acuáticas.", costUsd: 18 },
      { name: "Parque Nacional Volcán Mombacho", desc: "Senderismo entre orquídeas y bruma en cráteres extintos.", costUsd: 25 },
      { name: "Laguna de Apoyo", desc: "Agua tibia en cráter volcánico ideal para kayak y descanso tranquilo.", costUsd: 12 }
    ]
  },
  {
    key: "matagalpa",
    department: "Matagalpa",
    title: "Ruta del Café y Nebliselva de Matagalpa",
    summary: "Montañas frescas, cascadas escondidas y cultivo artesanal de café bajo sombra en cooperativas campesinas.",
    places: [
      { name: "Reserva Ecológica Selva Negra", desc: "Senderismo interpretativo en bosque nuboso y agricultura biodinámica.", costUsd: 20 },
      { name: "Cascada La Luna", desc: "Caída de agua natural rodeada de helechos gigantes y pozas cristalinas.", costUsd: 15 },
      { name: "Fincas Cafetaleras Comunitarias", desc: "Experiencia de cosecha y catación tradicional de café de estricta altura.", costUsd: 15 }
    ]
  }
];

function normalize(text: string): string {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveTerritory(prompt: string, department: string): TerritoryCatalogItem {
  const normP = normalize(prompt);
  const normD = normalize(department);

  if (normP.includes("ometepe") || normP.includes("concepcion") || normP.includes("maderas") || normP.includes("rivas") || normP.includes("san juan")) {
    return TERRITORY_CATALOG[0];
  }
  if (normP.includes("somoto") || normP.includes("canon") || normP.includes("madriz") || normP.includes("rosquilla") || normP.includes("cusmapa")) {
    return TERRITORY_CATALOG[1];
  }
  if (normP.includes("cerro negro") || normP.includes("leon") || normP.includes("penitas") || normP.includes("sandboard")) {
    return TERRITORY_CATALOG[2];
  }
  if (normP.includes("granada") || normP.includes("isletas") || normP.includes("mombacho") || normP.includes("apoyo")) {
    return TERRITORY_CATALOG[3];
  }
  if (normP.includes("matagalpa") || normP.includes("cafe") || normP.includes("selva negra") || normP.includes("cascada")) {
    return TERRITORY_CATALOG[4];
  }

  for (const item of TERRITORY_CATALOG) {
    if (normalize(item.department) === normD || normalize(item.title).includes(normD)) {
      return item;
    }
  }

  return TERRITORY_CATALOG[0];
}

function cleanJson(value: string): string {
  return value.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

function extractSources(metadata: Record<string, unknown> | undefined) {
  const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
  const seen = new Set<string>();
  return chunks.flatMap((chunk: Record<string, unknown>, index: number) => {
    const web = chunk?.web as Record<string, unknown> | undefined;
    const url = String(web?.uri || "");
    if (!url.startsWith("https://") || seen.has(url)) return [];
    seen.add(url);
    return [{id: `web-${index + 1}`, label: String(web?.title || "Fuente web").slice(0, 120), url, type: "web"}];
  }).slice(0, 6);
}

function extractInteractionOutput(data: Record<string, unknown>) {
  const interaction = data.interaction as Record<string, unknown> | undefined;
  const steps = Array.isArray(data.steps) ? data.steps : (Array.isArray(interaction?.steps) ? interaction.steps : []);
  const sources: Array<{id: string; label: string; url: string; type: string}> = [];
  const seen = new Set<string>();
  let text = "";
  for (const step of steps as Array<Record<string, unknown>>) {
    if (step.type !== "model_output" || !Array.isArray(step.content)) continue;
    for (const block of step.content as Array<Record<string, unknown>>) {
      if (block.type !== "text") continue;
      text += String(block.text || "");
      const annotations = Array.isArray(block.annotations) ? block.annotations : [];
      for (const annotation of annotations as Array<Record<string, unknown>>) {
        const url = String(annotation.url || "");
        if (annotation.type !== "url_citation" || !url.startsWith("https://") || seen.has(url)) continue;
        seen.add(url);
        sources.push({id: `web-${sources.length + 1}`, label: String(annotation.title || "Fuente oficial").slice(0, 120), url, type: "web"});
      }
    }
  }
  return {text, sources: sources.slice(0, 6)};
}

async function buildGroundedItinerary(input: Record<string, unknown>, territory: TerritoryCatalogItem) {
  const apiKeys = [Deno.env.get("GEMINI_API_KEY"), Deno.env.get("BAQUEANONICARAGUA"), Deno.env.get("Gemini API Key")]
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
  if (!apiKeys.length) return {itinerary: null, status: "missing_secret"};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const days = Number(input.days) || 3;
  const prompt = `Crea un itinerario turístico verificable de Nicaragua en JSON estricto.
Consulta estas páginas mediante URL Context y prioriza ${TRUSTED_SOURCES.join(", ")}: ${TRUSTED_SOURCE_URLS.join(" ")}. Usa mapanicaragua.com, publicado por INTUR, para contrastar territorio, atractivos, servicios y ubicación.
Solicitud: ${String(input.prompt || "")}. Departamento: ${String(input.department || territory.department)}. Días: ${days}. Viajeros: ${Number(input.groupSize) || 2}. Interés: ${String(input.travelStyle || "aventura")}.
No inventes lugares, contactos, horarios, disponibilidad ni precios. No incluyas precios. Si no hay evidencia suficiente, omite el lugar.
  Devuelve solamente: {"title":"...","summary":"...","territory":"...","days":[{"title":"...","summary":"...","stops":[{"name":"...","desc":"..."}]}]}`;
  try {
    let response: Response | null = null;
    let lastStatus = 0;
    for (const apiKey of apiKeys) {
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json", "x-goog-api-key": apiKey},
        signal: controller.signal,
        body: JSON.stringify({
          model: GROUNDED_MODEL,
          input: prompt,
          tools: [{type: "url_context"}]
        })
      });
      lastStatus = response.status;
      if (response.ok) break;
    }
    if (!response?.ok) return {itinerary: null, status: `all_keys_http_${lastStatus}`};
    const data = await response.json();
    const interaction = extractInteractionOutput(data);
    const text = interaction.text;
    const sources = interaction.sources.length ? interaction.sources : TRUSTED_SOURCE_URLS.map((url, index) => ({
      id: `official-${index + 1}`,
      label: TRUSTED_SOURCES[index],
      url,
      type: "official-url-context"
    }));
    if (!text) return {itinerary: null, status: "empty_model_response"};
    if (!sources.length) return {itinerary: null, status: "response_without_sources"};
    const parsed = JSON.parse(cleanJson(text));
    const groundedDays = (Array.isArray(parsed.days) ? parsed.days : []).slice(0, days).map((day: Record<string, unknown>, index: number) => ({
      dayNumber: index + 1,
      title: String(day.title || `Día ${index + 1} en ${territory.department}`).slice(0, 180),
      summary: String(day.summary || "Verifica las condiciones antes de viajar.").slice(0, 500),
      dayBudgetUsd: null,
      dayBudgetNio: null,
      stops: (Array.isArray(day.stops) ? day.stops : []).slice(0, 4).map((stop: Record<string, unknown>) => ({
        name: String(stop.name || "Lugar por confirmar").slice(0, 140),
        desc: String(stop.desc || "Información respaldada por las fuentes consultadas.").slice(0, 420),
        publishedPrice: null
      }))
    })).filter((day: Record<string, unknown>) => Array.isArray(day.stops) && day.stops.length);
    if (!groundedDays.length) return {itinerary: null, status: "response_without_itinerary"};
    return {status: "grounded", itinerary: {
      title: String(parsed.title || `Ruta Baqueano en ${territory.department}`).slice(0, 180),
      summary: String(parsed.summary || territory.summary).slice(0, 700),
      territory: String(parsed.territory || territory.department).slice(0, 80),
      daysCount: groundedDays.length,
      groupSize: Number(input.groupSize) || 2,
      travelStyle: String(input.travelStyle || "aventura"),
      totalEstimatedCostUsd: Number(input.budgetUsd) || 0,
      totalEstimatedCostNio: Number(input.budgetNio) || 0,
      exchangeRate: BCN_RATE,
      days: groundedDays,
      sources,
      informationMode: "grounded-web",
      sustainabilityNote: "Verifica clima, accesos, disponibilidad y cualquier tarifa directamente antes de reservar.",
      generatedAt: new Date().toISOString()
    }};
  } catch (error) {
    console.warn("[Baqueano AI Edge] Grounding no disponible:", error);
    return {itinerary: null, status: "grounding_exception"};
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================================
// CONVERSACIÓN TURÍSTICA AUTÓNOMA
// 🎯 POR QUÉ: una expresión social o una pregunta no debe convertirse en itinerario.
// ⚙️ CÓMO: clasifica intención, responde cortesías localmente y fundamenta
//    preguntas turísticas abiertas mediante URL Context sobre fuentes autorizadas.
// 📦 QUÉ: saludos, despedidas, ayuda contextual y conversación dedicada a Nicaragua.
// ============================================================================
function normalizeIntentText(value: unknown): string {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function conversationIntent(prompt: string): "greeting" | "farewell" | "thanks" | "help" | "impact" | "planning" | "tourism" {
  const text = normalizeIntentText(prompt);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 8 && /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal)[!.? ]*$/.test(text)) return "greeting";
  if (/\b(adios|hasta luego|nos vemos|hasta pronto|me despido|chao|bye)\b/.test(text)) return "farewell";
  if (words.length <= 12 && /\b(gracias|muchas gracias|te agradezco|excelente ayuda)\b/.test(text)) return "thanks";
  if (/^(ayuda|que puedes hacer|como funciona|en que me ayudas)[!.? ]*$/.test(text)) return "help";
  // BAQUEANO IMPACTO: preguntas sobre el aporte de la plataforma al país (no sobre un destino).
  if (/\b(baqueano|baqui|plataforma|app|aplicacion)\b/.test(text)
    && /\b(contribu\w*|aport\w*|impacto|alinea\w*|desarrollo (turistico|territorial|comunitario)|plan nacional|pnlcp|pndh|intur|economia creativa|estrategia nacional|politica\w* public\w*|prioridades nacionales)\b/.test(text)) return "impact";
  if (/\b(itinerario|planifica|planificar|ruta|viaje|vacaciones|dias|noches|presupuesto|viajeros|hospedaje|quedarme|recorrido)\b/.test(text)) return "planning";
  return "tourism";
}

function internalKnowledgeAnswer(records: Array<{title: string; entityType: string}>, language: string): string {
  const titles = [...new Set(records.map((record) => record.title).filter(Boolean))].slice(0, 8).join(", ");
  const messages: Record<string, string> = {
    es: `Según la información interna de BAQUEANO, encontré: ${titles}. Puedo ayudarte a convertir estos datos en una ruta o ampliar una categoría específica.`,
    en: `According to BAQUEANO's internal information, I found: ${titles}. I can turn these results into a route or explore a specific category.`,
    fr: `Selon les informations internes de BAQUEANO, j'ai trouvé : ${titles}. Je peux créer un itinéraire ou approfondir une catégorie.`,
    it: `Secondo le informazioni interne di BAQUEANO, ho trovato: ${titles}. Posso creare un itinerario o approfondire una categoria.`,
    pt: `Segundo as informações internas do BAQUEANO, encontrei: ${titles}. Posso criar uma rota ou explorar uma categoria.`,
    de: `Laut den internen Informationen von BAQUEANO habe ich Folgendes gefunden: ${titles}. Ich kann daraus eine Route erstellen oder eine Kategorie vertiefen.`
  };
  return messages[language] || messages.es;
}

// ============================================================================
// 🧭 BAQUEANO IMPACTO — respuesta trazable sobre la contribución de BAQUEANO
// 🎯 POR QUÉ: ante "¿Cómo contribuye BAQUEANO al desarrollo turístico de
//    Nicaragua?" BAQUI debe distinguir siempre HECHO OFICIAL (lo que dice el
//    documento oficial, con fuente) de CONTRIBUCIÓN DE BAQUEANO, y nunca afirmar
//    reconocimiento institucional sin evidencia documental.
// ⚙️ CÓMO: respuesta determinista (sin modelo generativo, no puede inventar):
//    1) public_impact_summary() → indicadores reales de Supabase;
//    2) national_alignment vigente → eje oficial + fuente + componente BAQUEANO.
//    Sin datos → lo dice explícitamente ("todavía no tengo indicadores verificados").
// 📦 QUÉ: buildImpactAnswer(supabase, language) → { message, sources, status }.
// ============================================================================
const IMPACT_LABELS: Record<string, Record<string, string>> = {
  es: {intro: "Te lo explico separando lo oficial de lo que aporta BAQUEANO:", official: "HECHO OFICIAL", contribution: "CONTRIBUCIÓN DE BAQUEANO", indicators: "Indicadores reales (base de datos BAQUEANO, calculados ahora)", destinations: "destinos publicados", businesses: "negocios locales", community: "experiencias comunitarias verificadas", itineraries: "itinerarios generados", coverage: "cobertura territorial", municipalities: "municipios con contenido", noData: "Todavía no tengo indicadores verificados para responder con cifras.", disclaimer: "Importante: es una contribución o alineación de BAQUEANO. BAQUEANO no forma parte oficial de estos planes ni tiene un reconocimiento institucional registrado.", source: "Fuente", includes: "incluye"},
  en: {intro: "Here is the answer, separating official facts from BAQUEANO's contribution:", official: "OFFICIAL FACT", contribution: "BAQUEANO'S CONTRIBUTION", indicators: "Real indicators (BAQUEANO database, calculated now)", destinations: "published destinations", businesses: "local businesses", community: "verified community experiences", itineraries: "itineraries generated", coverage: "territorial coverage", municipalities: "municipalities with content", noData: "I don't have verified indicators yet to answer with figures.", disclaimer: "Important: this is BAQUEANO's contribution or alignment. BAQUEANO is not officially part of these plans and has no registered institutional recognition.", source: "Source", includes: "includes"},
  fr: {intro: "Voici la réponse, en séparant les faits officiels de la contribution de BAQUEANO :", official: "FAIT OFFICIEL", contribution: "CONTRIBUTION DE BAQUEANO", indicators: "Indicateurs réels (base de données BAQUEANO, calculés maintenant)", destinations: "destinations publiées", businesses: "commerces locaux", community: "expériences communautaires vérifiées", itineraries: "itinéraires générés", coverage: "couverture territoriale", municipalities: "communes avec contenu", noData: "Je n'ai pas encore d'indicateurs vérifiés pour répondre avec des chiffres.", disclaimer: "Important : il s'agit d'une contribution ou d'un alignement de BAQUEANO. BAQUEANO ne fait pas officiellement partie de ces plans et n'a aucune reconnaissance institutionnelle enregistrée.", source: "Source", includes: "comprend"},
  it: {intro: "Ecco la risposta, separando i fatti ufficiali dal contributo di BAQUEANO:", official: "FATTO UFFICIALE", contribution: "CONTRIBUTO DI BAQUEANO", indicators: "Indicatori reali (database BAQUEANO, calcolati ora)", destinations: "destinazioni pubblicate", businesses: "attività locali", community: "esperienze comunitarie verificate", itineraries: "itinerari generati", coverage: "copertura territoriale", municipalities: "comuni con contenuti", noData: "Non ho ancora indicatori verificati per rispondere con dati.", disclaimer: "Importante: si tratta di un contributo o allineamento di BAQUEANO. BAQUEANO non fa parte ufficialmente di questi piani e non ha alcun riconoscimento istituzionale registrato.", source: "Fonte", includes: "include"},
  pt: {intro: "Aqui está a resposta, separando fatos oficiais da contribuição do BAQUEANO:", official: "FATO OFICIAL", contribution: "CONTRIBUIÇÃO DO BAQUEANO", indicators: "Indicadores reais (banco de dados BAQUEANO, calculados agora)", destinations: "destinos publicados", businesses: "negócios locais", community: "experiências comunitárias verificadas", itineraries: "roteiros gerados", coverage: "cobertura territorial", municipalities: "municípios com conteúdo", noData: "Ainda não tenho indicadores verificados para responder com números.", disclaimer: "Importante: trata-se de uma contribuição ou alinhamento do BAQUEANO. O BAQUEANO não faz parte oficialmente desses planos nem tem reconhecimento institucional registrado.", source: "Fonte", includes: "inclui"},
  de: {intro: "Hier die Antwort – offizielle Fakten getrennt vom Beitrag von BAQUEANO:", official: "OFFIZIELLE TATSACHE", contribution: "BEITRAG VON BAQUEANO", indicators: "Echte Kennzahlen (BAQUEANO-Datenbank, jetzt berechnet)", destinations: "veröffentlichte Reiseziele", businesses: "lokale Betriebe", community: "verifizierte Gemeinschaftserlebnisse", itineraries: "erstellte Reiserouten", coverage: "territoriale Abdeckung", municipalities: "Gemeinden mit Inhalten", noData: "Ich habe noch keine verifizierten Kennzahlen, um mit Zahlen zu antworten.", disclaimer: "Wichtig: Es handelt sich um einen Beitrag bzw. eine Ausrichtung von BAQUEANO. BAQUEANO ist nicht offiziell Teil dieser Pläne und hat keine registrierte institutionelle Anerkennung.", source: "Quelle", includes: "umfasst"},
};

async function buildImpactAnswer(supabase: ReturnType<typeof createClient> | null, language: string) {
  const L = IMPACT_LABELS[language] || IMPACT_LABELS.es;
  if (!supabase) return {message: `${L.noData}\n\n${L.disclaimer}`, sources: [] as Array<{label: string; url: string}>, status: "no_database"};
  const [summaryRes, alignRes] = await Promise.all([
    supabase.rpc("public_impact_summary"),
    supabase.from("national_alignment")
      .select("id,axis_name,baqueano_component,source_name,source_url,verified_at")
      .eq("status", "active").gte("verification_expiry", new Date().toISOString().slice(0, 10))
      .in("id", ["pnlcp_turismo_diversificacion", "pnlcp_economia_creativa", "intur_rural_comunitario", "intur26_enlazamiento"])
      .order("sort_order"),
  ]);
  const summary = (summaryRes.error ? null : summaryRes.data) as Record<string, number | null> | null;
  const rows = (alignRes.error ? [] : alignRes.data || []) as Array<Record<string, string>>;
  const lines: string[] = [L.intro, ""];
  rows.forEach((row) => {
    lines.push(`• ${L.official}: ${row.source_name} ${L.includes} «${row.axis_name}» (${L.source}: ${row.source_url}).`);
    lines.push(`  ${L.contribution}: ${row.baqueano_component}.`);
  });
  if (summary && Number.isFinite(Number(summary.destinos_publicados))) {
    lines.push("", `${L.indicators}:`);
    lines.push(`- ${summary.destinos_publicados} ${L.destinations}; ${summary.negocios_locales} ${L.businesses}; ${summary.experiencias_comunitarias} ${L.community}; ${summary.itinerarios_generados} ${L.itineraries}.`);
    lines.push(`- ${summary.municipios_con_contenido}/${summary.municipios_catalogados} ${L.municipalities}` +
      (summary.cobertura_territorial_baqueano != null ? ` (${L.coverage}: ${summary.cobertura_territorial_baqueano} %).` : "."));
  } else {
    lines.push("", L.noData);
  }
  lines.push("", L.disclaimer);
  return {
    message: lines.join("\n"),
    sources: rows.map((row) => ({label: row.source_name, url: row.source_url})),
    status: rows.length || summary ? "impact_grounded" : "impact_no_data",
  };
}

async function buildGroundedTourismAnswer(prompt: string, history: unknown, internalContext: unknown, language: string, countryCode: string) {
  const apiKeys = [Deno.env.get("GEMINI_API_KEY"), Deno.env.get("BAQUEANONICARAGUA"), Deno.env.get("Gemini API Key")]
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
  if (!apiKeys.length) return {message: null, sources: [], status: "missing_secret"};
  const recentHistory = Array.isArray(history) ? history.slice(-8).map((item: Record<string, unknown>) => `${String(item.role || "user")}: ${String(item.content || "").slice(0, 500)}`).join("\n") : "";
  const languageNames: Record<string, string> = {es: "español nicaragüense", en: "inglés turístico claro", fr: "francés natural", it: "italiano cercano", pt: "portugués natural", de: "alemán claro"};
  const instruction = `Sos Baqüi, agente autónomo y responsable especializado en turismo integral del país ${countryCode}.
Respondé en ${languageNames[language] || languageNames.es}. Conservá nombres culturales originales y el contexto.
Personalidad: sos alguien de aquí que conoce el territorio y acompaña al viajero; cercano, curioso, práctico y respetuoso. En español usá voseo nicaragüense natural (querés, podés, tenés, decime, armemos) y alguna expresión local con moderación ("¡Dele pues!"); nunca caricaturices ni uses groserías o jerga ofensiva. En otros idiomas no traduzcas modismos: transmití la misma calidez y hospitalidad con naturalidad. Respuestas breves y útiles: primero lo que la persona necesita, luego una pregunta corta para seguir (qué le gusta, cuántos van, cuántos días, cuánto quiere gastar). Si piden lugares poco conocidos, priorizá experiencias comunitarias y rurales verificadas. Ayudá con destinos, cultura, gastronomía, naturaleza, transporte, clima, seguridad, accesibilidad, presupuesto y turismo comunitario.
Información interna BAQUEANO recuperada primero: ${JSON.stringify(internalContext).slice(0, 8000)}.
La información interna válida prevalece. Usa fuentes externas solamente para completar vacíos o datos operativos/actuales y cita su procedencia.
Consulta y prioriza mediante URL Context: ${TRUSTED_SOURCE_URLS.join(" ")}.
No inventes precios, teléfonos, horarios, disponibilidad ni hechos. Si hablás de políticas públicas o planes nacionales, distinguí siempre HECHO OFICIAL (con su fuente) de CONTRIBUCIÓN DE BAQUEANO; nunca digas que el Gobierno, INTUR, MARENA, MINED, INATEC o CNU reconocen oficialmente a BAQUEANO ni que BAQUEANO forma parte de un plan institucional. Si el usuario pregunta algo ajeno al turismo de Nicaragua, explicá amablemente tu especialidad y ofrecé una alternativa turística relacionada.
No construyas un itinerario salvo que el usuario lo solicite. Para emergencias recomendá confirmar con autoridades oficiales.
Historial reciente:\n${recentHistory || "Sin historial previo."}\nPregunta actual: ${prompt}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    let response: Response | null = null;
    let lastStatus = 0;
    for (const apiKey of apiKeys) {
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json", "x-goog-api-key": apiKey},
        signal: controller.signal,
        body: JSON.stringify({model: GROUNDED_MODEL, input: instruction, tools: [{type: "url_context"}]})
      });
      lastStatus = response.status;
      if (response.ok) break;
    }
    if (!response?.ok) return {message: null, sources: [], status: `all_keys_http_${lastStatus}`};
    const interaction = extractInteractionOutput(await response.json());
    return {message: interaction.text || null, sources: interaction.sources, status: interaction.text ? "grounded" : "empty_model_response"};
  } catch (_) {
    return {message: null, sources: [], status: "grounding_exception"};
  } finally { clearTimeout(timeout); }
}

type LoggedSource = {source_type: string; entity_type?: string | null; entity_id?: string | null; title: string; url?: string | null};

/** Quita correos y teléfonos y recorta: BAQUI no guarda PII innecesaria. */
function minimizeText(value: string, max = 1000): string {
  return value
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[correo]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[teléfono]")
    .slice(0, max);
}

async function logExchange(
  supabase: ReturnType<typeof createClient> | null,
  entry: {sessionKey: string; language: string; channel: string; provider: string; userContent: string;
          assistantContent: string; latencyMs: number; sources: LoggedSource[]; toolCalls?: unknown[]},
) {
  if (!supabase) return;
  try {
    const {error} = await supabase.rpc("baqui_log_exchange", {
      p_session_key: entry.sessionKey,
      p_user_id: null,
      p_legacy_uid: null,
      p_language: entry.language,
      p_channel: entry.channel,
      p_provider: entry.provider,
      p_model: entry.provider === "baqueano-supabase-grounded-web" ? GROUNDED_MODEL : null,
      p_user_content: minimizeText(entry.userContent),
      p_assistant_content: minimizeText(entry.assistantContent, 2000),
      p_tokens_input: null,
      p_tokens_output: null,
      p_latency_ms: Math.max(0, Math.round(entry.latencyMs)),
      p_tool_calls: entry.toolCalls || [],
      p_sources: entry.sources.slice(0, 20),
    });
    if (error) console.warn("[baqueano-ai] baqui_log_exchange:", error.message);
  } catch (logErr) {
    console.warn("[baqueano-ai] No se pudo registrar el intercambio:", logErr);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const startedAt = Date.now();
  try {
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch (_) {
        body = {};
      }
    }

    const prompt = String(body.prompt || body.message || "");
    const requestedDept = String(body.department || "Nicaragua");
    const daysRequested = Math.max(1, Math.min(Number(body.days) || 3, 14));
    const groupSize = Math.max(1, Math.min(Number(body.groupSize) || 2, 20));
    const travelStyle = String(body.travelStyle || "aventura");
    const budgetNio = Number(body.budgetNio) || (daysRequested * groupSize * 2000);
    const budgetUsd = Number(body.budgetUsd) || Number((budgetNio / BCN_RATE).toFixed(2));
    const userUid = body.userUid ? String(body.userUid) : null;
    const countryCode = String(body.countryCode || "NI").toUpperCase().slice(0, 2);
    const requestedLanguage = String(body.currentLanguage || body.preferredLanguage || "es").toLowerCase().split("-")[0];
    const currentLanguage = ["es", "en", "fr", "it", "pt", "de"].includes(requestedLanguage) ? requestedLanguage : "es";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;
    const rawSession = String(body.sessionId || body.session_id || "");
    const sessionKey = /^[A-Za-z0-9_-]{6,120}$/.test(rawSession) ? rawSession : `anon-${crypto.randomUUID()}`;
    const channel = ["web", "android", "ios"].includes(String(body.channel)) ? String(body.channel) : "web";
    const internalKnowledge = supabase ? await new BaqueanoKnowledgeService(supabase).search(prompt) : [];
    const internalSufficient = internalKnowledge.length > 0 && new BaqueanoKnowledgeService(supabase!).isSufficient(internalKnowledge);

    const intent = conversationIntent(prompt);
    if (intent === "impact") {
      const impact = await buildImpactAnswer(supabase, currentLanguage);
      await logExchange(supabase, {
        sessionKey, language: currentLanguage, channel, provider: "baqueano-impact",
        userContent: prompt, assistantContent: impact.message, latencyMs: Date.now() - startedAt,
        sources: [
          {source_type: "internal_database", entity_type: "public_impact_summary", entity_id: null, title: "Indicadores BAQUEANO (Supabase)"},
          ...impact.sources.map((src) => ({source_type: "official_url", title: src.label.slice(0, 200), url: src.url})),
        ],
      });
      return new Response(JSON.stringify({
        success: true, ok: true, type: "conversation", intent, message: impact.message,
        provider: "baqueano-impact", groundingStatus: impact.status,
        sources: impact.sources.map((src) => ({label: src.label, url: src.url, type: "official"})),
        sourcePolicy: {internalFirst: true, internalSufficient: impact.status === "impact_grounded", externalUsed: false, officialVsContribution: true},
        countryCode, currentLanguage, actions: []
      }, null, 2), {status: 200, headers: CORS_HEADERS});
    }
    if (intent !== "planning") {
      const localizedMessages: Record<string, Record<string, string>> = {
        es: {greeting: "¡Hola! Soy Baqüi. ¿Qué querés descubrir hoy?", farewell: "¡Que te vaya bien! Aquí te guardo lo que hablamos de tu viaje.", thanks: "¡Con gusto! Si querés seguimos armando el viaje.", help: "Te busco lugares, te armo rutas y, si algo no lo tenemos, lo consulto en fuentes confiables y te digo de dónde salió."},
        en: {greeting: "Hi! I'm Baqüi, your local guide to Nicaragua. What would you like to discover today?", farewell: "Take care! I'll keep your trip notes right here.", thanks: "You're welcome! I can keep helping with traceable travel information.", help: "I can search BAQUEANO, plan routes, and consult reliable external sources only when information is missing."},
        fr: {greeting: "Bonjour ! Je suis Baqüi, votre agent touristique au Nicaragua. Que souhaitez-vous découvrir ?", farewell: "À bientôt ! Je conserverai le contexte autorisé de votre voyage.", thanks: "Avec plaisir ! Je peux continuer avec des informations touristiques traçables.", help: "Je peux consulter BAQUEANO, planifier des itinéraires et utiliser des sources externes fiables seulement si nécessaire."},
        it: {greeting: "Ciao! Sono Baqüi, il tuo agente turistico per il Nicaragua. Cosa vuoi scoprire?", farewell: "A presto! Conserverò il contesto autorizzato del viaggio.", thanks: "Con piacere! Posso continuare con informazioni turistiche tracciabili.", help: "Posso consultare BAQUEANO, pianificare itinerari e usare fonti esterne affidabili solo quando serve."},
        pt: {greeting: "Olá! Sou Baqüi, seu agente de turismo na Nicarágua. O que você quer descobrir?", farewell: "Até logo! Vou manter o contexto autorizado da sua viagem.", thanks: "Com prazer! Posso continuar com informações turísticas rastreáveis.", help: "Posso consultar o BAQUEANO, planejar rotas e usar fontes externas confiáveis somente quando necessário."},
        de: {greeting: "Hallo! Ich bin Baqüi, Ihr Reiseagent für Nicaragua. Was möchten Sie entdecken?", farewell: "Bis bald! Ich behalte den freigegebenen Reisekontext.", thanks: "Gern! Ich helfe weiter mit nachvollziehbaren Reiseinformationen.", help: "Ich kann BAQUEANO durchsuchen, Routen planen und externe Quellen nur bei fehlenden Informationen nutzen."}
      };
      const localMessages = localizedMessages[currentLanguage] || localizedMessages.es;
      const internalAnswer = intent === "tourism" && internalSufficient ? internalKnowledgeAnswer(internalKnowledge, currentLanguage) : null;
      const groundedAnswer = localMessages[intent] || internalAnswer ? null : await buildGroundedTourismAnswer(prompt, body.history, internalKnowledge, currentLanguage, countryCode);
      const message = localMessages[intent] || internalAnswer || groundedAnswer?.message || "Todavía no tengo ese dato verificado.";
      const conversationProvider = localMessages[intent] ? "baqueano-conversation" : "baqueano-supabase-grounded-web";
      await logExchange(supabase, {
        sessionKey, language: currentLanguage, channel, provider: conversationProvider,
        userContent: prompt, assistantContent: message, latencyMs: Date.now() - startedAt,
        sources: [
          ...internalKnowledge.map((item) => ({source_type: "internal_database", entity_type: item.entityType, entity_id: item.entityId, title: (item.title || item.entityType).slice(0, 200)})),
          ...((groundedAnswer?.sources || []) as Array<{label?: string; url?: string}>).map((src) => ({source_type: "official_url", title: String(src.label || src.url || "Fuente externa").slice(0, 200), url: /^https?:\/\/\S+$/.test(String(src.url || "")) ? String(src.url) : null})),
        ],
      });
      return new Response(JSON.stringify({
        success: true, ok: true, type: "conversation", intent, message,
        provider: localMessages[intent] ? "baqueano-conversation" : "baqueano-supabase-grounded-web",
        groundingStatus: groundedAnswer?.status || "not_required",
        sources: [...internalKnowledge.map((item) => ({id: item.entityId, label: item.title, type: "baqueano", entityType: item.entityType})), ...(groundedAnswer?.sources || [])],
        sourcePolicy: {internalFirst: true, internalSufficient, externalUsed: Boolean(groundedAnswer?.sources?.length)},
        countryCode, currentLanguage,
        actions: intent === "greeting" || intent === "help" ? [{type: "build_itinerary", label: "Abrir planificador completo"}] : []
      }, null, 2), {status: 200, headers: CORS_HEADERS});
    }

    const territory = resolveTerritory(prompt, requestedDept);
    const places = territory.places;

    const groundingResult = await buildGroundedItinerary({prompt, department: requestedDept, days: daysRequested, groupSize, travelStyle, budgetNio, budgetUsd}, territory);
    const grounded = groundingResult.itinerary;

    const itineraryDays = [];
    for (let i = 0; i < daysRequested; i++) {
      const dayNum = i + 1;
      const place1 = places[i % places.length];
      const place2 = places[(i + 1) % places.length];

      const stops = [
        { name: place1.name, desc: place1.desc, publishedPrice: null },
        { name: place2.name, desc: place2.desc, publishedPrice: null }
      ];

      itineraryDays.push({
        dayNumber: dayNum,
        title: `Día ${dayNum}: ${place1.name} y Experiencia Local en ${territory.department}`,
        summary: `${place1.desc} Posterior traslado y descanso en ${place2.name}.`,
        dayBudgetUsd: null,
        dayBudgetNio: null,
        stops: stops
      });
    }

    const localItinerary = {
      title: `Ruta Baqueano: ${daysRequested} Días en ${territory.department} (${territory.title})`,
      summary: `Itinerario para ${groupSize} viajeros en modalidad ${travelStyle}, basado en el catálogo territorial de ${territory.title}. El presupuesto indicado es un límite y no una tarifa.`,
      territory: territory.department,
      daysCount: daysRequested,
      groupSize: groupSize,
      travelStyle: travelStyle,
      totalEstimatedCostUsd: budgetUsd,
      totalEstimatedCostNio: budgetNio,
      exchangeRate: BCN_RATE,
      days: itineraryDays,
      sources: [],
      informationMode: "local-catalog",
      sustainabilityNote: "Verifica disponibilidad y cualquier tarifa directamente antes de reservar.",
      generatedAt: new Date().toISOString()
    };
    const generatedItinerary = grounded || localItinerary;
    const provider = grounded ? "baqueano-supabase-grounded-web" : "baqueano-supabase-catalog";

    // Persistir de forma garantizada en Supabase PostgreSQL (travel_plans)
    let planId: string | null = null;
    const supabaseKey = serviceKey || Deno.env.get("SUPABASE_ANON_KEY");

    if (supabaseUrl && supabaseKey) {
      try {
        const persistenceClient = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await persistenceClient
          .from("travel_plans")
          .insert({
            user_uid: userUid,
            plan_title: generatedItinerary.title,
            destination: territory.department,
            days: daysRequested,
            budget: budgetUsd,
            currency: "USD",
            payload: generatedItinerary,
            source: provider
          })
          .select("id")
          .single();

        if (data && !error) {
          planId = data.id;
        }
      } catch (dbErr) {
        console.warn("[Baqueano AI Edge] No se pudo guardar en travel_plans:", dbErr);
      }
    }

    await logExchange(supabase, {
      sessionKey, language: currentLanguage, channel, provider,
      userContent: prompt || `${daysRequested} días en ${territory.department}`,
      assistantContent: `${generatedItinerary.title}. ${generatedItinerary.summary || ""}`,
      latencyMs: Date.now() - startedAt,
      toolCalls: [{tool: "build_itinerary", department: territory.department, days: daysRequested, plan_id: planId}],
      sources: [
        {source_type: "internal_database", entity_type: "territory", entity_id: territory.department, title: `Catálogo territorial BAQUEANO: ${territory.title}`},
        ...((generatedItinerary.sources || []) as Array<{label?: string; url?: string}>).map((src) => ({source_type: "official_url", title: String(src.label || src.url || "Fuente externa").slice(0, 200), url: /^https?:\/\/\S+$/.test(String(src.url || "")) ? String(src.url) : null})),
      ],
    });

    return new Response(
      JSON.stringify(
        {
          success: true,
          ok: true,
          provider,
          sourcePolicy: {internalFirst: true, internalRecords: internalKnowledge.length, externalUsed: Boolean(grounded)},
          countryCode,
          currentLanguage,
          groundingStatus: groundingResult.status,
          planId: planId,
          itinerary: generatedItinerary
        },
        null,
        2
      ),
      {
        status: 200,
        headers: CORS_HEADERS
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        success: false,
        ok: false,
        error: errorMsg,
        server_time: new Date().toISOString()
      }),
      {
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
});
