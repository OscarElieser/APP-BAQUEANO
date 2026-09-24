/**
 * BAQUEANO DIGITAL — GATEWAY CONVERSACIONAL TERRITORIAL
 * POR QUÉ: responder con contexto verificable sin exponer secretos ni datos privados.
 * CÓMO: consulta catálogos públicos, invoca Gemini en servidor y conserva fallback determinista.
 * QUÉ: servicio POST con contrato estable, fuentes, acciones y perfil incremental.
 */
"use strict";
const ALLOWED_ACTIONS = new Set(["open_destination", "open_map", "show_place", "search_places", "build_itinerary", "save_favorite", "show_nearby", "show_emergency", "open_booking", "open_route"]);
const buckets = new Map();
function cleanText(value, max = 500) { return String(value || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max); }
function allowRequest(key, now = Date.now()) { const current = buckets.get(key) || {start: now, count: 0}; if (now - current.start > 60000) { current.start = now; current.count = 0; } current.count += 1; buckets.set(key, current); return current.count <= 12; }
function deterministicResponse(message, catalog = []) {
  const query = message.toLocaleLowerCase("es");
  const matches = catalog.filter(item => cleanText(JSON.stringify(item), 3000).toLocaleLowerCase("es").split(/\s+/).some(term => term.length > 3 && query.includes(term))).slice(0, 4);
  if (/emergencia|sos|auxilio/.test(query)) return {message: "Puedo abrir el módulo SOS 24/7. Si existe peligro inmediato, contactá a las autoridades locales.", actions: [{type: "show_emergency", label: "Abrir SOS 24/7"}]};
  if (/cerca|ubicación|ubicacion/.test(query)) return {message: "Puedo buscar opciones cercanas cuando autoricés tu ubicación para esa consulta.", actions: [{type: "show_nearby", label: "Buscar cerca"}]};
  if (/mapa/.test(query)) return {message: "Abramos el mapa territorial para explorar destinos con coordenadas registradas.", actions: [{type: "open_map", label: "Abrir mapa"}]};
  if (/ruta|viaje|itinerario|presupuesto/.test(query)) return {message: "Puedo preparar una ruta usando días, viajeros, intereses y presupuesto.", actions: [{type: "build_itinerary", label: "Planificar viaje"}]};
  if (matches.length) return {message: `Encontré información registrada sobre ${matches.map(item => item.name).join(", ")}. Abrí el catálogo para revisar detalles y fuentes.`, actions: [{type: "search_places", label: "Ver resultados"}], sources: matches.map(item => ({id: item.id, label: item.name, collection: item.collection}))};
  return {message: "No encontré una coincidencia verificable. Puedo ayudarte a explorar el catálogo, abrir el mapa o preparar una ruta sin inventar datos.", actions: [{type: "search_places", label: "Explorar destinos"}]};
}
async function readCatalog(db) {
  try {
    const [destinations, services] = await Promise.all([db.collection("destinations").limit(80).get(), db.collection("tourism_services").limit(100).get()]);
    const places = destinations.docs.map(doc => ({id: doc.id, collection: "destinations", ...doc.data()})).filter(item => item.published !== false && item.status !== "draft").map(item => ({id: item.id, collection: item.collection, name: cleanText(item.title || item.name, 120), department: cleanText(item.department, 80), category: cleanText(item.category, 80), description: cleanText(item.description, 280), url: cleanText(item.slug ? `/destinos.html#${item.slug}` : "/destinos.html", 180)}));
    const offers = services.docs.map(doc => ({id: doc.id, collection: "tourism_services", ...doc.data()})).filter(item => item.publicado !== false && item.estado !== "draft").map(item => ({id: item.id, collection: item.collection, name: cleanText(item.nombre, 120), department: cleanText(item.departamento, 80), category: cleanText(item.categoria || item.tipo, 80), description: cleanText(item.descripcion, 280), price: item.estadoPrecio === "verificado" && Number(item.precio) > 0 ? `${cleanText(item.moneda, 4)} ${Number(item.precio)}` : null}));
    return [...places, ...offers].filter(item => item.name);
  } catch (_) { return []; }
}
function sanitizeActions(actions) { return Array.isArray(actions) ? actions.filter(item => item && ALLOWED_ACTIONS.has(item.type)).slice(0, 3).map(item => ({type: item.type, label: cleanText(item.label || "Abrir", 50), url: /^\/[a-z0-9_./?#=&%-]+$/i.test(item.url || "") ? item.url : undefined, id: cleanText(item.id, 120) || undefined})) : []; }
async function callGemini(apiKey, payload, catalog, fetchImpl = fetch) {
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED"); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 9000);
  const prompt = `Sos Baqueano Digital, guía turístico nicaragüense cálido y conciso. Respondé solo con datos del CATÁLOGO. No inventés precios, disponibilidad, negocios ni contactos. Si falta evidencia, decilo. Devolvé JSON estricto: {"message":"...","actions":[{"type":"...","label":"...","url":"/..."}],"sourceIds":["..."],"tripProfilePatch":{}}. Acciones permitidas: ${Array.from(ALLOWED_ACTIONS).join(", ")}.
CONTEXTO: ${JSON.stringify(payload.context)}
HISTORIAL: ${JSON.stringify(payload.history)}
CATÁLOGO: ${JSON.stringify(catalog.slice(0, 45))}
PREGUNTA: ${payload.message}`;
  try { const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {method: "POST", headers: {"Content-Type": "application/json"}, signal: controller.signal, body: JSON.stringify({contents: [{parts: [{text: prompt}]}], generationConfig: {temperature: 0.2, maxOutputTokens: 900, responseMimeType: "application/json"}})}); if (!response.ok) throw new Error("AI_UNAVAILABLE"); const data = await response.json(); const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text; if (!raw) throw new Error("AI_EMPTY"); return JSON.parse(raw); } finally { clearTimeout(timer); }
}
function createAiChatService({db, getApiKey = () => "", fetchImpl = fetch}) {
  return async function handleAiChat(request) {
    const clientKey = cleanText(request.ip || request.headers?.["x-forwarded-for"] || "anonymous", 100); if (!allowRequest(clientKey)) return {status: 429, body: {ok: false, error: {code: "RATE_LIMITED"}}};
    const body = request.body && typeof request.body === "object" ? request.body : {}; const message = cleanText(body.message, 500); if (!message) return {status: 400, body: {ok: false, error: {code: "INVALID_MESSAGE"}}};
    const payload = {message, conversationId: cleanText(body.conversationId, 100), history: Array.isArray(body.history) ? body.history.slice(-12).map(item => ({role: item.role === "user" ? "user" : "assistant", content: cleanText(item.content, 700)})) : [], context: body.context && typeof body.context === "object" ? JSON.parse(JSON.stringify(body.context).slice(0, 5000)) : {}};
    const catalog = await readCatalog(db); let result; let mode = "deterministic"; try { result = await callGemini(getApiKey(), payload, catalog, fetchImpl); mode = "gemini"; } catch (_) { result = deterministicResponse(message, catalog); }
    const sourceIds = new Set(Array.isArray(result.sourceIds) ? result.sourceIds.map(String) : []); const sources = result.sources || catalog.filter(item => sourceIds.has(item.id)).slice(0, 5).map(item => ({id: item.id, label: item.name, collection: item.collection}));
    return {status: 200, body: {ok: true, message: cleanText(result.message, 1800), conversationId: payload.conversationId, sources, actions: sanitizeActions(result.actions), tripProfilePatch: result.tripProfilePatch && typeof result.tripProfilePatch === "object" ? result.tripProfilePatch : {}, mode}};
  };
}
module.exports = {createAiChatService, deterministicResponse, sanitizeActions, cleanText};
