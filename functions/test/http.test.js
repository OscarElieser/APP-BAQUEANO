/**
 * BAQUEANO NICARAGUA — PRUEBAS CONTRACTUALES HTTP
 * POR QUÉ: Los consumidores deben distinguir datos reales e indisponibilidad.
 * CÓMO: Invoca handlers con dobles mínimos y dependencias deterministas.
 * QUÉ: Verifica salud, métricas, fallos, IA, métodos y rutas inválidas.
 */
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const { createApiHandler, createHealthHandler } = require("../lib/http");
function responseDouble() {
  return {headers: {}, statusCode: null, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }};
}
const fixedNow = () => new Date("2026-09-17T12:00:00.000Z");
test("healthCheck publica estado verificable", () => {
  const response = responseDouble();
  createHealthHandler({now: fixedNow})({method: "GET"}, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {ok: true, service: "baqueano-functions", timestamp: "2026-09-17T12:00:00.000Z"});
});
test("métricas conserva valores entregados por Firestore", async () => {
  const response = responseDouble();
  const values = {publishedDestinations: 7, verifiedBusinesses: 3, publishedReviews: 11};
  await createApiHandler({now: fixedNow, readPublicMetrics: async () => values})(
    {method: "GET", path: "/api/v1/public/metrics"}, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.source, "firestore-aggregations");
  assert.deepEqual(response.body.data, values);
});
test("fallo Firestore no se reemplaza con cifras inventadas", async () => {
  const response = responseDouble(); const original = console.error; console.error = () => {};
  try {
    await createApiHandler({readPublicMetrics: async () => { throw new Error("offline"); }})(
      {method: "GET", path: "/metrics"}, response);
  } finally { console.error = original; }
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, "METRICS_UNAVAILABLE");
  assert.equal(response.body.data, undefined);
});
test("IA sin configurar responde 503", async () => {
  const response = responseDouble();
  await createApiHandler({readPublicMetrics: async () => ({})})(
    {method: "GET", path: "/api/v1/ai/chat"}, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, "AI_NOT_CONFIGURED");
});
test("chat IA acepta POST y conserva contrato estructurado", async () => {
  const response = responseDouble();
  await createApiHandler({readPublicMetrics: async () => ({}), handleAiChat: async () => ({status: 200, body: {ok: true, message: "Ruta verificada", conversationId: "c1", sources: [], actions: [], tripProfilePatch: {}, mode: "deterministic"}})})(
    {method: "POST", path: "/api/v1/ai/chat", body: {message: "Quiero una ruta"}}, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.mode, "deterministic");
});
test("método inválido y ruta desconocida tienen contratos distintos", async () => {
  const handler = createApiHandler({readPublicMetrics: async () => ({})});
  const methodResponse = responseDouble();
  await handler({method: "POST", path: "/api/metrics"}, methodResponse);
  assert.equal(methodResponse.statusCode, 405);
  assert.equal(methodResponse.headers.Allow, "GET");
  const missingResponse = responseDouble();
  await handler({method: "GET", path: "/api/unknown"}, missingResponse);
  assert.equal(missingResponse.statusCode, 404);
});

