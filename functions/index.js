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
const readPublicMetrics = createPublicMetricsReader(getFirestore());
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const handleAiChat = createAiChatService({db: getFirestore(), getApiKey: () => geminiApiKey.value()});
exports.healthCheck = onRequest(runtimeOptions, createHealthHandler());
exports.api = onRequest({...runtimeOptions, secrets: [geminiApiKey]}, createApiHandler({readPublicMetrics, handleAiChat}));

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

