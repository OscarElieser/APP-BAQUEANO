/**
 * BAQUEANO NICARAGUA — PUNTOS DE ENTRADA DE FIREBASE FUNCTIONS
 * POR QUÉ: Los rewrites necesitan funciones reales separadas del frontend.
 * CÓMO: Admin inicia una vez y el lector se inyecta para permitir pruebas aisladas.
 * QUÉ: Exporta healthCheck y api en Functions v2 con Node 20.
 */
"use strict";
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { createApiHandler, createHealthHandler } = require("./lib/http");
const { createPublicMetricsReader } = require("./lib/public-metrics");
if (getApps().length === 0) initializeApp();
const runtimeOptions = {region: "us-central1", timeoutSeconds: 30, memory: "256MiB", maxInstances: 10};
const readPublicMetrics = createPublicMetricsReader(getFirestore());
exports.healthCheck = onRequest(runtimeOptions, createHealthHandler());
exports.api = onRequest(runtimeOptions, createApiHandler({ readPublicMetrics }));

