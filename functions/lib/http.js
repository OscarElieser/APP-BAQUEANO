/**
 * BAQUEANO NICARAGUA — CONTRATO HTTP PÚBLICO
 * POR QUÉ: Las rutas deben ser consistentes y honestas ante indisponibilidad.
 * CÓMO: Normaliza rutas, restringe métodos e inyecta el lector Firestore.
 * QUÉ: Implementa salud, métricas, IA no configurada, 404 y métodos.
 */
"use strict";
function sendJson(response, status, payload, cacheControl = "no-store") {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cacheControl);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.status(status).json(payload);
}
function normalizedPath(request) {
  const rawPath = request.path || request.url || "/";
  const pathname = rawPath.split("?")[0].replace(/\/+$/, "") || "/";
  return pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
}
function createHealthHandler({ now = () => new Date() } = {}) {
  return function healthHandler(request, response) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD");
      return sendJson(response, 405, {ok: false, error: {code: "METHOD_NOT_ALLOWED"}});
    }
    return sendJson(response, 200, {ok: true, service: "baqueano-functions", timestamp: now().toISOString()});
  };
}
function createApiHandler({ readPublicMetrics, now = () => new Date() }) {
  if (typeof readPublicMetrics !== "function") throw new TypeError("readPublicMetrics debe ser una función.");
  return async function apiHandler(request, response) {
    const path = normalizedPath(request);
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      return sendJson(response, 405, {ok: false, error: {code: "METHOD_NOT_ALLOWED"}});
    }
    if (path === "/v1/public/metrics" || path === "/metrics") {
      try {
        const metrics = await readPublicMetrics();
        return sendJson(response, 200, {ok: true, data: metrics, source: "firestore-aggregations", measuredAt: now().toISOString()}, "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
      } catch (error) {
        console.error("No fue posible agregar las métricas públicas.", error);
        return sendJson(response, 503, {ok: false, error: {code: "METRICS_UNAVAILABLE", message: "Las métricas reales no están disponibles temporalmente."}});
      }
    }
    if (path === "/v1/ai" || path.startsWith("/v1/ai/")) {
      return sendJson(response, 503, {ok: false, error: {code: "AI_NOT_CONFIGURED", message: "El servicio de IA no está configurado."}});
    }
    return sendJson(response, 404, {ok: false, error: {code: "NOT_FOUND"}});
  };
}
module.exports = { createApiHandler, createHealthHandler, normalizedPath };

