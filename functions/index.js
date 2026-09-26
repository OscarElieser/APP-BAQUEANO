/**
 * BAQUEANO NICARAGUA — PUNTOS DE ENTRADA DE FIREBASE FUNCTIONS
 * POR QUÉ: Los rewrites necesitan funciones reales separadas del frontend.
 * CÓMO: Admin inicia una vez; el lector se inyecta para pruebas aisladas y el
 * trigger documental registra cada cambio tarifario fuera del navegador.
 * QUÉ: Exporta healthCheck, api y auditoría de tarifas con Functions v2.
 */
"use strict";
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { createApiHandler, createHealthHandler } = require("./lib/http");
const { createAiChatService } = require("./lib/ai-chat");
const { createPublicMetricsReader } = require("./lib/public-metrics");
if (getApps().length === 0) initializeApp();
const runtimeOptions = {region: "us-central1", timeoutSeconds: 30, memory: "256MiB", maxInstances: 10};
// POR QUÉ: Search Grounding requiere una credencial privada que nunca debe
// incluirse en el repositorio, Hosting ni código entregado al navegador.
// CÓMO: Secret Manager inyecta GEMINI_API_KEY únicamente en la función API.
// QUÉ: referencia declarativa al secreto usado por el planificador fundamentado.
const geminiApiKey = defineSecret("GEMINI_API_KEY");

const getApiKey = () => {
  try {
    if (geminiApiKey && typeof geminiApiKey.value === "function") {
      const val = geminiApiKey.value();
      if (val) return val;
    }
  } catch (e) {}
  return "";
};

const db = getFirestore();
const readPublicMetrics = createPublicMetricsReader(db);
const handleAiChat = createAiChatService({db, getApiKey});

exports.healthCheck = onRequest(runtimeOptions, createHealthHandler());
exports.api = onRequest(
  {...runtimeOptions, secrets: [geminiApiKey]},
  createApiHandler({readPublicMetrics, handleAiChat, getApiKey})
);


exports.auditTourismServicePrice = onDocumentWritten(
  {document: "tourism_services/{serviceId}", region: "us-central1", memory: "256MiB", maxInstances: 10},
  async (event) => {
    const before = event.data?.before.exists ? event.data.before.data() : null;
    const after = event.data?.after.exists ? event.data.after.data() : null;
    if (!after) return;
    const tracked = ["precio", "moneda", "precioDesde", "precioHasta", "precioAdulto", "precioNino", "dayPassPrecio", "estadoPrecio", "verificado", "fechaVencimiento", "disponibilidad", "estadoDisponibilidad"];
    const changed = !before || tracked.some((field) => JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null));
    if (!changed) return;
    await event.data.after.ref.collection("priceHistory").doc().set({
      serviceId: event.params.serviceId,
      changedAt: new Date(),
      changedBy: after.updatedBy || after.verificadoPor || "system",
      previous: before ? Object.fromEntries(tracked.map((field) => [field, before[field] ?? null])) : null,
      current: Object.fromEntries(tracked.map((field) => [field, after[field] ?? null])),
      source: after.fuentePrecio || null,
    });
  },
);

