/**
 * BAQUEANO DIGITAL — PRUEBAS DEL GATEWAY
 * POR QUÉ: impedir acciones inseguras y afirmaciones sin respaldo.
 * CÓMO: prueba funciones puras sin red ni secretos.
 * QUÉ: sanitización, fallback y contrato de acciones.
 */
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const {cleanText, deterministicResponse, sanitizeActions, sanitizeTripProfilePatch} = require("../lib/ai-chat");
const {hasFreshDynamicEvidence} = require("../lib/baqueano-knowledge");
test("limita y limpia mensajes", () => { assert.equal(cleanText("hola\u0000mundo", 20), "hola mundo"); assert.equal(cleanText("123456", 3), "123"); });
test("descarta acciones no permitidas", () => { assert.deepEqual(sanitizeActions([{type: "open_map", label: "Mapa"}, {type: "run_script", label: "No"}]), [{type: "open_map", label: "Mapa", url: undefined, id: undefined}]); });
test("fallback ofrece una acción útil", () => { const result = deterministicResponse("Quiero un mapa", []); assert.equal(result.actions[0].type, "open_map"); });
test("clima se deriva a herramienta dinámica", () => { const result = deterministicResponse("¿Cómo está el clima?", []); assert.equal(result.actions[0].type, "check_weather"); });
test("limita el perfil temporal de viaje", () => { assert.deepEqual(sanitizeTripProfilePatch({travelers: 2, days: 3, budget: 300, currency: "USD", interests: ["cultura", "playa"], privateToken: "no"}), {travelers: 2, budget: 300, days: 3, currency: "USD", interests: ["cultura", "playa"]}); });
test("datos dinámicos exigen verificación reciente", () => { const now = Date.now(); assert.equal(hasFreshDynamicEvidence({verified: true, lastVerified: new Date(now - 1000).toISOString()}, now), true); assert.equal(hasFreshDynamicEvidence({verified: false, lastVerified: new Date(now).toISOString()}, now), false); });
