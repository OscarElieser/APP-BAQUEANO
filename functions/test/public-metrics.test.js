/**
 * BAQUEANO NICARAGUA — PRUEBAS DE AGREGACIÓN FIRESTORE
 * POR QUÉ: Los indicadores deben proceder de count() y filtros explícitos.
 * CÓMO: Un doble encadenable registra cada operación y retorna conteos conocidos.
 * QUÉ: Comprueba consultas, filtros y resultado agregado.
 */
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const { METRIC_QUERIES, createPublicMetricsReader } = require("../lib/public-metrics");
test("usa count con filtros públicos declarados", async () => {
  const calls = []; const counts = [5, 2, 9];
  const firestore = {collection(collectionName) {
    const call = {collection: collectionName}; calls.push(call);
    return {
      where(field, operator, value) { Object.assign(call, {field, operator, value}); return this; },
      count() { call.aggregate = "count"; return this; },
      async get() { return {data: () => ({count: counts[calls.indexOf(call)]})}; }
    };
  }};
  const result = await createPublicMetricsReader(firestore)();
  assert.deepEqual(result, {publishedDestinations: 5, verifiedBusinesses: 2, publishedReviews: 9});
  assert.deepEqual(calls, METRIC_QUERIES.map((query) => ({
    collection: query.collection, field: query.field, operator: "==", value: query.value, aggregate: "count"
  })));
});

