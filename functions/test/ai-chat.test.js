/**
 * BAQUEANO DIGITAL — PRUEBAS DEL GATEWAY
 * POR QUÉ: impedir acciones inseguras y afirmaciones sin respaldo.
 * CÓMO: prueba funciones puras sin red ni secretos.
 * QUÉ: sanitización, fallback y contrato de acciones.
 */
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const {cleanText, deterministicResponse, sanitizeActions} = require("../lib/ai-chat");
test("limita y limpia mensajes", () => { assert.equal(cleanText("hola\u0000mundo", 20), "hola mundo"); assert.equal(cleanText("123456", 3), "123"); });
test("descarta acciones no permitidas", () => { assert.deepEqual(sanitizeActions([{type: "open_map", label: "Mapa"}, {type: "run_script", label: "No"}]), [{type: "open_map", label: "Mapa", url: undefined, id: undefined}]); });
test("fallback ofrece una acción útil", () => { const result = deterministicResponse("Quiero un mapa", []); assert.equal(result.actions[0].type, "open_map"); });
