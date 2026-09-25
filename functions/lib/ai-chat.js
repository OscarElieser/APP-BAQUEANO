/**
 * BAQUEANO DIGITAL — GATEWAY CONVERSACIONAL TERRITORIAL
 * POR QUÉ: responder con contexto verificable sin exponer secretos ni datos privados.
 * CÓMO: consulta catálogos públicos, invoca Gemini en servidor y conserva fallback determinista.
 * QUÉ: servicio POST con contrato estable, fuentes, acciones y perfil incremental.
 */
"use strict";
const {KNOWLEDGE_COLLECTIONS, IDENTITY_RULES, isVerified, verificationDate, hasFreshDynamicEvidence} = require("./baqueano-knowledge");
const ALLOWED_ACTIONS = new Set(["open_destination", "open_department", "open_map", "show_place", "search_places", "search_destination", "search_business", "search_experience", "build_itinerary", "calculate_budget", "calculate_distance", "save_favorite", "show_nearby", "show_emergency", "open_booking", "request_booking", "check_availability", "check_weather", "search_events", "create_route", "share_itinerary", "open_route", "play_audio", "pause_audio", "show_food", "show_history"]);
const ALLOWED_ANIMATIONS = new Set(["idle", "speaking", "explaining", "celebrating", "exploring", "emergency"]);
const buckets = new Map();
function cleanText(value, max = 500) { return String(value || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max); }
function allowRequest(key, now = Date.now()) { const current = buckets.get(key) || {start: now, count: 0}; if (now - current.start > 60000) { current.start = now; current.count = 0; } current.count += 1; buckets.set(key, current); return current.count <= 12; }
function deterministicResponse(message, catalog = []) {
  const query = message.toLocaleLowerCase("es");
  const matches = catalog.filter(item => cleanText(JSON.stringify(item), 3000).toLocaleLowerCase("es").split(/\s+/).some(term => term.length > 3 && query.includes(term))).slice(0, 4);
  if (/emergencia|sos|auxilio/.test(query)) return {message: "Puedo abrir el módulo SOS 24/7. Si existe peligro inmediato, contactá a las autoridades locales.", actions: [{type: "show_emergency", label: "Abrir SOS 24/7"}]};
  if (/cerca|ubicación|ubicacion/.test(query)) return {message: "Puedo buscar opciones cercanas cuando autoricés tu ubicación para esa consulta.", actions: [{type: "show_nearby", label: "Buscar cerca"}]};
  if (/mapa/.test(query)) return {message: "Abramos el mapa territorial para explorar destinos con coordenadas registradas.", actions: [{type: "open_map", label: "Abrir mapa"}]};
  if (/clima|tiempo|pron[oó]stico/.test(query)) return {message: "El clima cambia constantemente; puedo consultarlo en tiempo real sin tratarlo como información permanente.", actions: [{type: "check_weather", label: "Consultar clima"}]};
  if (/evento|festival|actividad hoy/.test(query)) return {message: "Los eventos requieren fecha y fuente vigentes. Puedo buscar únicamente registros actualizados.", actions: [{type: "search_events", label: "Buscar eventos"}]};
  if (/ruta|viaje|itinerario|presupuesto/.test(query)) return {message: "Puedo preparar una ruta usando días, viajeros, intereses y presupuesto. Los costos solo se incluyen cuando están verificados y vigentes.", actions: [{type: "build_itinerary", label: "Planificar viaje"}]};
  if (matches.length) return {message: `Encontré información registrada sobre ${matches.map(item => item.name).join(", ")}. Abrí el catálogo para revisar detalles y fuentes.`, actions: [{type: "search_places", label: "Ver resultados"}], sources: matches.map(item => ({id: item.id, label: item.name, collection: item.collection}))};
  return {message: "No encontré una coincidencia verificable. Puedo ayudarte a explorar el catálogo, abrir el mapa o preparar una ruta sin inventar datos.", actions: [{type: "search_places", label: "Explorar destinos"}]};
}
async function readCatalog(db) {
  const snapshots = await Promise.all(KNOWLEDGE_COLLECTIONS.map(async config => { try { return {collection: config.name, snapshot: await db.collection(config.name).limit(config.limit).get()}; } catch (_) { return {collection: config.name, snapshot: {docs: []}}; } }));
  return snapshots.flatMap(({collection, snapshot}) => snapshot.docs.map(doc => ({id: doc.id, collection, ...doc.data()})))
    .filter(item => item.published !== false && item.publicado !== false && !["draft", "borrador", "pending_review"].includes(String(item.status || item.estado || "").toLowerCase()))
    .map(item => { const verified = isVerified(item); const dynamicFresh = hasFreshDynamicEvidence(item); return {id: item.id, collection: item.collection, name: cleanText(item.title || item.nombre || item.name || item.pregunta, 120), department: cleanText(item.department || item.departamento, 80), municipality: cleanText(item.municipality || item.municipio, 80), category: cleanText(item.category || item.categoria || item.tipo, 80), description: cleanText(item.description || item.descripcion || item.respuesta || item.summary, 420), url: cleanText(item.slug ? `/destinos.html#${item.slug}` : "", 180), verified, verificationDate: verificationDate(item) || null, sourceName: cleanText(item.sourceName || item.fuente_nombre || item.fuente || "", 100), sourceUrl: /^https:\/\//i.test(item.sourceUrl || item.fuente_url || "") ? cleanText(item.sourceUrl || item.fuente_url, 300) : null, price: dynamicFresh && Number(item.precio) > 0 ? `${cleanText(item.moneda, 4)} ${Number(item.precio)}` : null, availability: dynamicFresh ? cleanText(item.disponibilidad || item.availability, 80) : null}; })
    .filter(item => item.name).sort((a, b) => Number(b.verified) - Number(a.verified) || (b.verificationDate || 0) - (a.verificationDate || 0)).slice(0, 320);
}
function sanitizeActions(actions) { return Array.isArray(actions) ? actions.filter(item => item && ALLOWED_ACTIONS.has(item.type)).slice(0, 3).map(item => ({type: item.type, label: cleanText(item.label || "Abrir", 50), url: /^\/[a-z0-9_./?#=&%-]+$/i.test(item.url || "") ? item.url : undefined, id: cleanText(item.id, 120) || undefined})) : []; }
function sanitizeTripProfilePatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const patch = {}; const numeric = ["travelers", "adults", "children", "budget", "days"];
  numeric.forEach(key => { const parsed = Number(value[key]); if (Number.isFinite(parsed) && parsed >= 0) patch[key] = Math.min(parsed, key === "budget" ? 10000000 : 365); });
  ["currency", "origin", "transport", "language"].forEach(key => { const cleaned = cleanText(value[key], 80); if (cleaned) patch[key] = cleaned; });
  ["interests", "accessibility"].forEach(key => { if (Array.isArray(value[key])) patch[key] = value[key].slice(0, 12).map(item => cleanText(item, 60)).filter(Boolean); });
  return patch;
}
async function callGemini(apiKey, payload, catalog, fetchImpl = fetch) {
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED"); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 9000);
  const prompt = `${IDENTITY_RULES}
Respondé solo con datos del CATÁLOGO RECUPERADO. Devolvé JSON estricto: {"message":"...","emotion":"happy|curious|serious|calm","animation":"idle|speaking|explaining|celebrating|exploring|emergency","actions":[{"type":"...","label":"...","url":"/..."}],"sourceIds":["..."],"tripProfilePatch":{"travelers":null,"adults":null,"children":null,"budget":null,"currency":null,"days":null,"origin":null,"transport":null,"interests":[],"accessibility":[]}}. Acciones permitidas: ${Array.from(ALLOWED_ACTIONS).join(", ")}.
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
    const sourceIds = new Set(Array.isArray(result.sourceIds) ? result.sourceIds.map(String) : []); const sources = result.sources || catalog.filter(item => sourceIds.has(item.id)).slice(0, 5).map(item => ({id: item.id, label: item.name, collection: item.collection, verified: item.verified, verifiedAt: item.verificationDate || undefined, sourceName: item.sourceName || undefined, sourceUrl: item.sourceUrl || undefined}));
    return {status: 200, body: {ok: true, message: cleanText(result.message, 1800), emotion: cleanText(result.emotion || "calm", 20), animation: ALLOWED_ANIMATIONS.has(result.animation) ? result.animation : "speaking", conversationId: payload.conversationId, sources, actions: sanitizeActions(result.actions), tripProfilePatch: sanitizeTripProfilePatch(result.tripProfilePatch), mode}};
  };
}
module.exports = {createAiChatService, deterministicResponse, sanitizeActions, sanitizeTripProfilePatch, readCatalog, cleanText};
