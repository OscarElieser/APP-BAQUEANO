/**
 * BAQUEANO NICARAGUA — PRUEBAS DE ENDPOINTS DE BACKEND
 * POR QUÉ: Validar contratos de salud, catálogo, búsqueda, proximidad e itinerarios IA.
 * CÓMO: Test runner nativo de Node.js con dobles y dependencias controladas.
 * QUÉ: Pruebas unitarias para /api/health, /api/destinations, /api/nearby, /api/search, /api/ai/travel-plan.
 */
"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { createApiHandler } = require("../lib/http");
const { haversineDistanceMeters } = require("../lib/geospatial-service");
const { calculateNextRetryAllowed } = require("../lib/backup-service");
const { CircuitBreaker } = require("../lib/circuit-breaker");

function mockResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

const fixedNow = () => new Date("2026-09-25T12:00:00.000Z");

test("GET /api/health retorna reporte de salud multi-proveedor", async () => {
  const handler = createApiHandler({
    now: fixedNow,
    readPublicMetrics: async () => ({})
  });
  const res = mockResponse();
  await handler({ method: "GET", path: "/api/health" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.service, "BAQUEANO API");
  assert.ok(res.body.firebase);
  assert.ok(res.body.supabase);
  assert.ok(res.body.storage);
  assert.ok(res.body.backup);
  assert.ok(res.body.ai);
  assert.equal(res.body.timestamp, "2026-09-25T12:00:00.000Z");
});

test("GET /api/destinations entrega catálogo oficial de territorios", async () => {
  const handler = createApiHandler({
    now: fixedNow,
    readPublicMetrics: async () => ({})
  });
  const res = mockResponse();
  await handler({ method: "GET", path: "/api/destinations" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.count > 0);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.some(d => d.name === "Madriz" || d.name === "León"));
});

test("GET /api/nearby valida coordenadas geográficas", async () => {
  const handler = createApiHandler({
    now: fixedNow,
    readPublicMetrics: async () => ({})
  });

  // Sin coordenadas -> 400
  const badRes = mockResponse();
  await handler({ method: "GET", path: "/api/nearby", query: {} }, badRes);
  assert.equal(badRes.statusCode, 400);
  assert.equal(badRes.body.error.code, "MISSING_COORDINATES");

  // Con coordenadas válidas de Managua (12.1364, -86.2514)
  const okRes = mockResponse();
  await handler({ method: "GET", path: "/api/nearby", query: { latitude: "12.1364", longitude: "-86.2514", radius: "50000" } }, okRes);
  assert.equal(okRes.statusCode, 200);
  assert.equal(okRes.body.ok, true);
  assert.ok(Array.isArray(okRes.body.results));
});

test("GET /api/search busca lugares con normalización de acentos", async () => {
  const handler = createApiHandler({
    now: fixedNow,
    readPublicMetrics: async () => ({})
  });
  const res = mockResponse();
  await handler({ method: "GET", path: "/api/search", query: { q: "somoto" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.results.some(r => r.name.toLowerCase().includes("somoto")));
});

test("POST /api/ai/travel-plan genera itinerario estructurado", async () => {
  const handler = createApiHandler({
    now: fixedNow,
    readPublicMetrics: async () => ({})
  });
  const res = mockResponse();
  await handler({
    method: "POST",
    path: "/api/ai/travel-plan",
    body: { destination: "Madriz", days: 2, budget: 150, currency: "USD" }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.plan);
  assert.equal(res.body.plan.dias_totales, 2);
  assert.ok(res.body.plan.days.length === 2);
});

test("haversineDistanceMeters calcula distancia correcta", () => {
  // Distancia aproximada Managua (12.1364, -86.2514) a Granada (11.9299, -85.9560) ~40-45 km
  const dist = haversineDistanceMeters(12.1364, -86.2514, 11.9299, -85.9560);
  assert.ok(dist > 35000 && dist < 50000, `Distancia calculada: ${dist}m`);
});

test("calculateNextRetryAllowed aplica backoff progresivo", () => {
  const now = 1000000;
  const retry0 = calculateNextRetryAllowed(0, now);
  assert.equal(retry0, now + 60000); // 1 min

  const retry1 = calculateNextRetryAllowed(1, now);
  assert.equal(retry1, now + 300000); // 5 min

  const retry2 = calculateNextRetryAllowed(2, now);
  assert.equal(retry2, now + 900000); // 15 min
});

test("CircuitBreaker conmuta a OPEN tras superar umbral de fallos", () => {
  const cb = new CircuitBreaker({ name: "test-breaker", failureThreshold: 3, resetTimeoutMs: 1000 });
  assert.equal(cb.state, "CLOSED");
  assert.equal(cb.isOpen(), false);

  cb.recordFailure(new Error("fail 1"));
  assert.equal(cb.state, "CLOSED");
  cb.recordFailure(new Error("fail 2"));
  assert.equal(cb.state, "CLOSED");
  cb.recordFailure(new Error("fail 3"));
  assert.equal(cb.state, "OPEN");
  assert.equal(cb.isOpen(), true);
});
