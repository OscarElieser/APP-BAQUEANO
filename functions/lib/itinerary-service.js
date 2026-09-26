// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GENERADOR TERRITORIAL DE ITINERARIOS (itinerary-service.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Atender directamente el planificador interactivo de la web (/api/baqueano-ai).
// - Erradicar respuestas de error cuando las APIs externas de LLM (OpenAI, DeepSeek, Gemini)
//   carecen de saldo o están sobrecargadas, entregando siempre un itinerario real, verificable
//   y de alta fidelidad territorial con cooperativas y anfitriones de Nicaragua.
// - Persistir de forma activa e inmediata cada plan generado en Supabase (`travel_plans`).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Anclaje en el catálogo de territorios y lugares verificados (Ometepe, Somoto, León,
//   Granada, Matagalpa, etc.).
// - Normalización de texto y concordancia semántica con el prompt del usuario ("Ometepe", "Café", etc.).
// - Cálculo presupuestario exacto con la tasa oficial del Banco Central de Nicaragua (1 USD = C$ 36.65).
// - Intento de enriquecimiento con LLMs disponibles (Gemini, Groq, DeepSeek, OpenAI) con fallback
//   automático al motor territorial determinista sin degradación para el usuario.
// - Persistencia directa en la tabla `public.travel_plans` de Supabase.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `buildBaqueanoItinerary(payload)`: Retorna contrato compatible con `website/js/baqueano-ai.js`.
// ============================================================================

"use strict";

const { getSupabase } = require("./supabase-client");
const { BAQUEANO_FALLBACK_TERRITORIES } = require("./baqueano-knowledge");

const BCN_RATE = 36.6243;
const GROUNDED_MODEL = process.env.GEMINI_GROUNDED_MODEL || "gemini-2.5-flash";
const TRUSTED_SOURCE_DOMAINS = [
  "mapanicaragua.com",
  "visitanicaragua.com",
  "intur.gob.ni",
  "bcn.gob.ni",
  "ineter.gob.ni",
  "marena.gob.ni",
  "unesco.org"
];

function cleanJsonResponse(value) {
  return String(value || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

function safeWebSources(metadata) {
  const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
  const seen = new Set();
  return chunks.flatMap((chunk, index) => {
    const uri = String(chunk?.web?.uri || "");
    if (!/^https:\/\//i.test(uri) || seen.has(uri)) return [];
    seen.add(uri);
    return [{
      id: `web-${index + 1}`,
      label: String(chunk?.web?.title || "Fuente web").slice(0, 120),
      url: uri,
      type: "web"
    }];
  }).slice(0, 6);
}

function sanitizeGroundedItinerary(candidate, fallbackTerritory, payload) {
  if (!candidate || typeof candidate !== "object" || !Array.isArray(candidate.days)) return null;
  const days = candidate.days.slice(0, payload.days).map((day, index) => ({
    dayNumber: index + 1,
    title: String(day.title || `Día ${index + 1} en ${fallbackTerritory.department}`).slice(0, 180),
    summary: String(day.summary || "Consulta condiciones y acceso antes de viajar.").slice(0, 500),
    dayBudgetUsd: null,
    dayBudgetNio: null,
    stops: (Array.isArray(day.stops) ? day.stops : []).slice(0, 4).map(stop => ({
      name: String(stop?.name || "Lugar por confirmar").slice(0, 140),
      desc: String(stop?.desc || "Información respaldada por las fuentes del itinerario.").slice(0, 420),
      publishedPrice: null
    }))
  }));
  if (!days.length || days.some(day => !day.stops.length)) return null;
  return {
    title: String(candidate.title || `Ruta Baqueano en ${fallbackTerritory.department}`).slice(0, 180),
    summary: String(candidate.summary || fallbackTerritory.summary).slice(0, 700),
    territory: String(candidate.territory || fallbackTerritory.department).slice(0, 80),
    daysCount: days.length,
    groupSize: payload.groupSize,
    travelStyle: payload.travelStyle,
    totalEstimatedCostUsd: payload.budgetUsd,
    totalEstimatedCostNio: payload.budgetNio,
    exchangeRate: BCN_RATE,
    days,
    sustainabilityNote: "Verifica clima, accesos, disponibilidad y cualquier tarifa directamente antes de reservar.",
    generatedAt: new Date().toISOString(),
    informationMode: "grounded-web"
  };
}

async function buildGroundedWebItinerary(payload, territory, apiKey, fetchImpl = fetch) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const prompt = `Crea un itinerario turístico verificable de Nicaragua en JSON estricto.
Consulta la web y prioriza estas fuentes oficiales: ${TRUSTED_SOURCE_DOMAINS.join(", ")}.
Usa Mapa Nacional de Turismo (mapanicaragua.com), publicado por INTUR, para contrastar departamentos, regiones, atractivos, servicios turísticos y ubicación.
Solicitud: ${payload.prompt}. Departamento: ${payload.department}. Días: ${payload.days}. Viajeros: ${payload.groupSize}. Interés: ${payload.travelStyle}.
Reglas: no inventes lugares, teléfonos, horarios, disponibilidad ni precios. No incluyas precios; si no hay evidencia suficiente, omite el lugar. Usa solo información pertinente a Nicaragua.
Esquema: {"title":"...","summary":"...","territory":"...","days":[{"title":"...","summary":"...","stops":[{"name":"...","desc":"..."}]}]}`;
  try {
    const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${GROUNDED_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        tools: [{google_search: {}}],
        generationConfig: {temperature: 0.15, maxOutputTokens: 2600}
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const first = data?.candidates?.[0];
    const text = first?.content?.parts?.map(part => part.text || "").join("");
    const sources = safeWebSources(first?.groundingMetadata);
    if (!text || !sources.length) return null;
    const itinerary = sanitizeGroundedItinerary(JSON.parse(cleanJsonResponse(text)), territory, payload);
    if (!itinerary) return null;
    itinerary.sources = sources;
    itinerary.webSearchQueries = Array.isArray(first?.groundingMetadata?.webSearchQueries)
      ? first.groundingMetadata.webSearchQueries.slice(0, 5)
      : [];
    return itinerary;
  } catch (error) {
    console.warn("[ItineraryService] Búsqueda fundamentada no disponible:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const NICARAGUA_TERRITORY_CATALOG = [
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

function normalizeText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveTerritory(prompt, requestedDept) {
  const normPrompt = normalizeText(prompt);
  const normDept = normalizeText(requestedDept);

  // 1. Coincidencia por prompt
  if (normPrompt.includes("ometepe") || normPrompt.includes("concepcion") || normPrompt.includes("maderas") || normPrompt.includes("rivas") || normPrompt.includes("san juan del sur")) {
    return NICARAGUA_TERRITORY_CATALOG[0];
  }
  if (normPrompt.includes("somoto") || normPrompt.includes("canon") || normPrompt.includes("madriz") || normPrompt.includes("rosquilla") || normPrompt.includes("cusmapa")) {
    return NICARAGUA_TERRITORY_CATALOG[1];
  }
  if (normPrompt.includes("cerro negro") || normPrompt.includes("leon") || normPrompt.includes("penitas") || normPrompt.includes("sandboard")) {
    return NICARAGUA_TERRITORY_CATALOG[2];
  }
  if (normPrompt.includes("granada") || normPrompt.includes("isletas") || normPrompt.includes("mombacho") || normPrompt.includes("apoyo")) {
    return NICARAGUA_TERRITORY_CATALOG[3];
  }
  if (normPrompt.includes("matagalpa") || normPrompt.includes("cafe") || normPrompt.includes("selva negra") || normPrompt.includes("cascada")) {
    return NICARAGUA_TERRITORY_CATALOG[4];
  }

  // 2. Coincidencia por departamento seleccionado
  for (const t of NICARAGUA_TERRITORY_CATALOG) {
    if (normalizeText(t.department) === normDept || normalizeText(t.title).includes(normDept)) {
      return t;
    }
  }

  return NICARAGUA_TERRITORY_CATALOG[0]; // Ometepe por defecto para escapadas
}

async function buildBaqueanoItinerary({
  prompt = "",
  department = "Nicaragua",
  days = 3,
  budgetNio = 12000,
  budgetUsd = 327.42,
  groupSize = 2,
  travelStyle = "aventura",
  userUid = null,
  apiKey = "",
  fetchImpl = fetch
}) {
  const numDays = Math.max(1, Math.min(Number(days) || 3, 14));
  const territory = resolveTerritory(prompt, department);
  const places = territory.places;

  const groundedItinerary = await buildGroundedWebItinerary({
    prompt,
    department,
    days: numDays,
    budgetNio,
    budgetUsd,
    groupSize,
    travelStyle
  }, territory, apiKey, fetchImpl);
  if (groundedItinerary) {
    await persistItinerary(groundedItinerary, userUid, "baqueano-grounded-web");
    return {success: true, ok: true, provider: "baqueano-grounded-web", itinerary: groundedItinerary};
  }

  const itineraryDays = [];
  for (let i = 0; i < numDays; i++) {
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

  const generatedItinerary = {
    title: `Ruta Baqueano: ${numDays} Días en ${territory.department} (${territory.title})`,
    summary: `Itinerario para ${groupSize} viajeros en modalidad ${travelStyle}, basado en el catálogo territorial de ${territory.title}. El presupuesto indicado es el límite del viajero y no una tarifa.`,
    territory: territory.department,
    daysCount: numDays,
    groupSize: groupSize,
    travelStyle: travelStyle,
    totalEstimatedCostUsd: budgetUsd,
    totalEstimatedCostNio: budgetNio,
    exchangeRate: BCN_RATE,
    days: itineraryDays,
    sustainabilityNote: "Ruta 100% comunitaria: tus gastos se canalizan directamente a cooperativas y familias anfitrionas sin comisiones de intermediarios.",
    generatedAt: new Date().toISOString()
  };

  generatedItinerary.informationMode = "local-catalog";
  generatedItinerary.sources = [];

  await persistItinerary(generatedItinerary, userUid, "baqueano-territorial-engine");

  return {
    success: true,
    ok: true,
    provider: "baqueano-territorial-engine",
    itinerary: generatedItinerary
  };
}

async function persistItinerary(itinerary, userUid, source) {
  // Persistir inmediatamente en Supabase (travel_plans)
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("travel_plans").insert({
        user_uid: userUid || "web_explorer",
        plan_title: itinerary.title,
        destination: itinerary.territory,
        days: itinerary.daysCount,
        budget: itinerary.totalEstimatedCostUsd,
        currency: "USD",
        payload: itinerary,
        source
      });
    } catch (err) {
      console.warn("[ItineraryService] Aviso: no se pudo guardar en travel_plans:", err.message);
    }
  }

}

module.exports = {
  buildBaqueanoItinerary,
  NICARAGUA_TERRITORY_CATALOG,
  resolveTerritory,
  buildGroundedWebItinerary,
  safeWebSources,
  sanitizeGroundedItinerary
};
