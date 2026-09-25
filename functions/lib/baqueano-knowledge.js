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
- Una estimación nunca se presenta como hecho. Toda afirmación comercial debe citar su registro fuente.`;

function isVerified(record) { return record?.verified === true || record?.verificado === true || ["verified", "verificado", "published", "publicado"].includes(String(record?.status || record?.estado || record?.verificationStatus || "").toLowerCase()); }
function verificationDate(record) { const value = record?.lastVerified || record?.ultima_verificacion || record?.fechaVerificacion || record?.updatedAt || record?.fechaActualizacion; const time = value?.toDate?.()?.getTime?.() || Date.parse(value || 0); return Number.isFinite(time) ? time : 0; }
function hasFreshDynamicEvidence(record, now = Date.now(), maxAgeMs = 86400000) { return isVerified(record) && verificationDate(record) > 0 && now - verificationDate(record) <= maxAgeMs; }

module.exports = {KNOWLEDGE_COLLECTIONS, DYNAMIC_FIELDS, TOOL_NAMES, IDENTITY_RULES, isVerified, verificationDate, hasFreshDynamicEvidence};
