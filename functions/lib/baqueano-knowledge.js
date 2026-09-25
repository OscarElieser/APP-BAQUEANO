/**
 * BAQUEANO DIGITAL — POLÍTICA DE CONOCIMIENTO Y HERRAMIENTAS
 * POR QUÉ: separar la identidad y las reglas de evidencia del prompt conversacional.
 * CÓMO: declara colecciones, campos dinámicos, herramientas y criterios de vigencia.
 * QUÉ: configuración inmutable consumida por el gateway RAG y sus pruebas.
 */
"use strict";

const KNOWLEDGE_COLLECTIONS = Object.freeze([
  {name: "departments", limit: 30}, {name: "municipalities", limit: 170},
  {name: "destinations", limit: 100}, {name: "places", limit: 100},
  {name: "businesses", limit: 100}, {name: "tourism_services", limit: 120},
  {name: "experiences", limit: 100}, {name: "gastronomy", limit: 80},
  {name: "culture", limit: 80}, {name: "history_timeline", limit: 80},
  {name: "legends", limit: 60}, {name: "events", limit: 80},
  {name: "routes", limit: 80}, {name: "emergency_services", limit: 60},
  {name: "travel_tips", limit: 80}, {name: "faqs", limit: 100},
]);

const DYNAMIC_FIELDS = Object.freeze(new Set(["price", "prices", "precio", "horario", "hours", "availability", "disponibilidad", "weather", "clima", "exchangeRate", "tipoCambio", "promotion", "promocion", "eventDate", "fechaEvento", "roadStatus", "estadoCarretera"]));
const TOOL_NAMES = Object.freeze(["search_destination", "search_business", "search_experience", "build_itinerary", "calculate_budget", "calculate_distance", "open_map", "show_destination", "save_favorite", "check_availability", "request_booking", "show_emergency", "check_weather", "search_events", "create_route", "share_itinerary"]);
const IDENTITY_RULES = `Sos Baqueanito IA, guía turístico digital de Nicaragua. Tu personalidad es amable, alegre, respetuosa, conversacional y nicaragüense. Respondé en español natural, salvo que el visitante solicite otro idioma.
Reglas obligatorias:
- Nunca inventés lugares, negocios, precios, horarios, teléfonos, rutas, distancias, disponibilidad ni fuentes.
- Priorizá registros con estado verificado y la fecha de verificación más reciente.
- Si no hay evidencia suficiente, respondé exactamente: "No tengo información verificada para confirmarlo todavía."
- Diferenciá hechos confirmados, recomendaciones, estimaciones y datos pendientes.
- Precios, horarios, disponibilidad, clima, reservas, eventos, carreteras, tipo de cambio, emergencias y promociones requieren fuente dinámica vigente.
- En Nicaragua mostrá siempre el córdoba (C$ / NIO) como moneda principal y el dólar estadounidense (US$ / USD) solo como equivalencia secundaria. Usá la tasa de referencia 1 US$ = C$ 36.65, indicá que es referencial y no invirtás el orden.
- Una estimación nunca se presenta como hecho. Toda afirmación comercial debe citar su registro fuente.`;

function isVerified(record) { return record?.verified === true || record?.verificado === true || ["verified", "verificado", "published", "publicado"].includes(String(record?.status || record?.estado || record?.verificationStatus || "").toLowerCase()); }
function verificationDate(record) { const value = record?.lastVerified || record?.ultima_verificacion || record?.fechaVerificacion || record?.updatedAt || record?.fechaActualizacion; const time = value?.toDate?.()?.getTime?.() || Date.parse(value || 0); return Number.isFinite(time) ? time : 0; }
function hasFreshDynamicEvidence(record, now = Date.now(), maxAgeMs = 86400000) { return isVerified(record) && verificationDate(record) > 0 && now - verificationDate(record) <= maxAgeMs; }

const BAQUEANO_FALLBACK_TERRITORIES = Object.freeze([
  {
    id: "madriz",
    name: "Madriz",
    shortDesc: "Tierra de Cañones Milenarios, Geoparque UNESCO Río Coco y Rosquillas Doradas.",
    capital: "Somoto",
    places: [
      { id: "canon-somoto", name: "Monumento Nacional Cañón de Somoto", category: "Cañones & Ríos", latitude: 13.4833, longitude: -86.5833, avgPriceUsd: 25.0, desc: "Aventura geológica milenaria en el Río Coco con guías acreditados." },
      { id: "talleres-rosquillas", name: "Talleres Rosquilleros de Somoto y Yalagüina", category: "Gastronomía Ancestral", latitude: 13.4800, longitude: -86.5800, avgPriceUsd: 5.0, desc: "Horneado en leña de maíz tostado y queso fresco." },
      { id: "cusmapa-mirador", name: "San José de Cusmapa & Mirador La Mano del Diablo", category: "Montañas & Miradores", latitude: 13.2833, longitude: -86.6500, avgPriceUsd: 10.0, desc: "El punto más alto habitado de Nicaragua con vistas al Golfo de Fonseca." }
    ],
    activities: ["Senderismo Geológico", "Paseo en Bote / Neumático", "Degustación de Rosquillas"]
  },
  {
    id: "leon",
    name: "León",
    shortDesc: "Ciudad Universitaria, Volcanes Activos, Sandboarding y Playas del Pacífico.",
    capital: "León",
    places: [
      { id: "cerro-negro", name: "Volcán Cerro Negro", category: "Volcanes & Aventura", latitude: 12.5061, longitude: -86.7028, avgPriceUsd: 35.0, desc: "El volcán más joven de Centroamérica para sandboarding." },
      { id: "catedral-leon", name: "Real Basílica Catedral de la Asunción", category: "Patrimonio Cultural UNESCO", latitude: 12.4350, longitude: -86.8789, avgPriceUsd: 5.0, desc: "Cúpulas blancas y cripta de Rubén Darío." },
      { id: "las-penitas", name: "Playa Las Peñitas & Reserva Isla Juan Venado", category: "Playas & Manglares", latitude: 12.3556, longitude: -87.0150, avgPriceUsd: 20.0, desc: "Surf, liberación de tortugas y estuarios protegidos." }
    ],
    activities: ["Sandboarding en Cerro Negro", "Recorrido de Techos Coloniales", "Kayak en Manglares"]
  },
  {
    id: "rivas",
    name: "Rivas",
    shortDesc: "Isla de Ometepe, Volcanes Gemelos, Playas de Surf y Bahías Soberanas.",
    capital: "Rivas",
    places: [
      { id: "ometepe-concepcion", name: "Isla de Ometepe & Volcán Concepción", category: "Volcanes & Naturaleza", latitude: 11.5386, longitude: -85.6225, avgPriceUsd: 35.0, desc: "Oasis de paz en el Gran Lago Cocibolca." },
      { id: "san-juan-del-sur", name: "Bahía de San Juan del Sur", category: "Playas & Costas", latitude: 11.2500, longitude: -85.8700, avgPriceUsd: 30.0, desc: "Gastronomía marina y atardeceres del Pacífico." },
      { id: "ojo-de-agua", name: "Reserva Natural Ojo de Agua", category: "Aguas Termales & Manantiales", latitude: 11.5167, longitude: -85.5833, avgPriceUsd: 10.0, desc: "Piscina natural de aguas volcánicas cristalinas." }
    ],
    activities: ["Ascenso Volcánico", "Kayak en Río Istián", "Surf en Playa Popoyo"]
  },
  {
    id: "matagalpa",
    name: "Matagalpa",
    shortDesc: "Perla del Septentrión, Ruta del Café, Bosques Nubosos y Cascadas.",
    capital: "Matagalpa",
    places: [
      { id: "selva-negra", name: "Reserva Ecológica Selva Negra", category: "Bosque Nuboso & Café", latitude: 12.9981, longitude: -85.9125, avgPriceUsd: 20.0, desc: "Senderismo ecológico entre cafetales sostenibles." },
      { id: "cascada-la-luna", name: "Cascada La Luna", category: "Cascadas & Ecoturismo", latitude: 12.9256, longitude: -85.9178, avgPriceUsd: 15.0, desc: "Impresionante caída de agua rodeada de flora nebliselva." }
    ],
    activities: ["Ruta del Café de Altura", "Avistamiento de Quetzales", "Caminatas en Cañadas"]
  },
  {
    id: "granada",
    name: "Granada",
    shortDesc: "La Gran Sultana, Isletas del Cocibolca y Parque Nacional Volcán Mombacho.",
    capital: "Granada",
    places: [
      { id: "isletas-granada", name: "Isletas del Lago Cocibolca", category: "Lagos & Archipiélagos", latitude: 11.9050, longitude: -85.9150, avgPriceUsd: 20.0, desc: "365 islas de origen volcánico con rica avifauna." },
      { id: "volcan-mombacho", name: "Parque Nacional Volcán Mombacho", category: "Volcanes & Bosque Nuboso", latitude: 11.8267, longitude: -85.9819, avgPriceUsd: 25.0, desc: "Cráteres apagados con senderos de orquídeas y bruma." }
    ],
    activities: ["Paseo en Lancha Tradicional", "Canopy en las Faldas del Mombacho", "Vigorón en el Parque Central"]
  },
  {
    id: "managua",
    name: "Managua",
    shortDesc: "Capital Soberana, Malecón Xolotlán, Huellas de Acahualinca y Reservas de Montaña.",
    capital: "Managua",
    places: [
      { id: "reserva-kilimanjaro", name: "Reserva Privada Kilimanjaro (El Crucero)", category: "Ecoturismo de Montaña", latitude: 11.9889, longitude: -86.3111, avgPriceUsd: 20.0, desc: "Clima fresco y senderos entre cafetales de altura." },
      { id: "malecon-xolotlan", name: "Puerto Salvador Allende & Lago Xolotlán", category: "Paseo Lacustre", latitude: 12.1583, longitude: -86.2750, avgPriceUsd: 5.0, desc: "Paseos en barco hacia la Isla del Amor." }
    ],
    activities: ["Recorrido Histórico", "Senderismo en El Crucero", "Gastronomía en Fritangas Típicas"]
  }
]);

module.exports = {
  KNOWLEDGE_COLLECTIONS,
  DYNAMIC_FIELDS,
  TOOL_NAMES,
  IDENTITY_RULES,
  isVerified,
  verificationDate,
  hasFreshDynamicEvidence,
  BAQUEANO_FALLBACK_TERRITORIES
};
