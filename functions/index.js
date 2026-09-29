/**
 * BAQUEANO NICARAGUA — PUNTOS DE ENTRADA DE FIREBASE FUNCTIONS
 * POR QUÉ: Los rewrites necesitan funciones reales separadas del frontend.
 * CÓMO: Admin inicia una vez; el lector se inyecta para pruebas aisladas y el
 * trigger documental registra cada cambio tarifario fuera del navegador.
 * QUÉ: Exporta healthCheck, api y auditoría de tarifas con Functions v2.
 */
"use strict";
const { getApps, initializeApp } = require("firebase-admin/app");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { createApiHandler, createHealthHandler } = require("./lib/http");
if (getApps().length === 0) initializeApp();
const runtimeOptions = {region: "us-central1", timeoutSeconds: 30, memory: "256MiB", maxInstances: 10};
// POR QUÉ: Search Grounding requiere una credencial privada que nunca debe
// incluirse en el repositorio, Hosting ni código entregado al navegador.
// CÓMO: Secret Manager inyecta GEMINI_API_KEY únicamente en la función API.
// QUÉ: referencia declarativa al secreto usado por el planificador fundamentado.
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const supabaseServiceRoleKey = defineSecret("SUPABASE_SERVICE_ROLE_KEY");

const getApiKey = () => {
  try {
    if (geminiApiKey && typeof geminiApiKey.value === "function") {
      const val = geminiApiKey.value();
      if (val) return val;
    }
  } catch (e) {}
  return "";
};

async function readPublicMetrics() {
  const { getSupabase } = require("./lib/supabase-client");
  const database = getSupabase();
  if (!database) throw new Error("Supabase no está configurado.");
  const { data, error } = await database.from("public_ecosystem_metrics").select("*").single();
  if (error) throw error;
  return data;
}

exports.healthCheck = onRequest(runtimeOptions, createHealthHandler());
exports.api = onRequest(
  {...runtimeOptions, secrets: [geminiApiKey, supabaseServiceRoleKey]},
  createApiHandler({readPublicMetrics, getApiKey})
);

