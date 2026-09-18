/**
 * BAQUEANO NICARAGUA — AGREGACIONES PÚBLICAS DE FIRESTORE
 * POR QUÉ: Solo se deben comunicar magnitudes derivadas de registros reales.
 * CÓMO: Cada indicador usa count(); cualquier fallo detiene toda la operación.
 * QUÉ: Cuenta destinos publicados, negocios verificados y reseñas visibles.
 */
"use strict";
const METRIC_QUERIES = Object.freeze([
  Object.freeze({key: "publishedDestinations", collection: "destinations", field: "status", value: "published"}),
  Object.freeze({key: "verifiedBusinesses", collection: "businesses", field: "verificationStatus", value: "verified"}),
  Object.freeze({key: "publishedReviews", collection: "reviews", field: "status", value: "published"})
]);
function createPublicMetricsReader(firestore) {
  if (!firestore || typeof firestore.collection !== "function") throw new TypeError("Se requiere una instancia válida de Firestore.");
  return async function readPublicMetrics() {
    const results = await Promise.all(METRIC_QUERIES.map(async (definition) => {
      const snapshot = await firestore.collection(definition.collection).where(definition.field, "==", definition.value).count().get();
      return [definition.key, snapshot.data().count];
    }));
    return Object.fromEntries(results);
  };
}
module.exports = { METRIC_QUERIES, createPublicMetricsReader };

