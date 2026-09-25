// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CLIENTE SUPABASE DE RESPALDO (supabase-client.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar el acceso del backend Node.js al proyecto Supabase oficial
//   (Project Ref: heiudfpthqwtjrtluqlm).
// - Soportar operaciones de persistencia secundaria, failover, PostGIS y Storage backup.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inicialización singleton mediante `@supabase/supabase-js`.
// - Soporte dinámico de credenciales: prioriza SUPABASE_SERVICE_ROLE_KEY (backend seguro)
//   y admite SUPABASE_ANON_KEY como respaldo de solo lectura/público.
// - Método `checkSupabaseHealth` con timeout seguro de 3 segundos para el endpoint /api/health.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `getSupabase()`: Cliente autenticado.
// - `checkSupabaseHealth()`: Diagnóstico en vivo de base de datos y storage de respaldo.
// ============================================================================
"use strict";

const { createClient } = require("@supabase/supabase-js");

const DEFAULT_SUPABASE_URL = "https://heiudfpthqwtjrtluqlm.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d";

let supabaseInstance = null;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  try {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return supabaseInstance;
  } catch (err) {
    console.error("[SupabaseClient] Error inicializando cliente Supabase:", err.message);
    return null;
  }
}

async function checkSupabaseHealth({ timeoutMs = 3000 } = {}) {
  const sb = getSupabase();
  if (!sb) {
    return {
      status: "unconfigured",
      database: "unavailable",
      storage: "unavailable",
      error: "Cliente Supabase no inicializado"
    };
  }

  const result = {
    status: "disconnected",
    database: "offline",
    storage: "offline"
  };

  const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase health timeout")), timeoutMs));

  // 1. Probar Storage
  try {
    const storageCheck = Promise.race([
      sb.storage.listBuckets(),
      timer
    ]);
    const { error } = await storageCheck;
    if (!error) {
      result.storage = "available";
    } else {
      result.storage = "degraded";
    }
  } catch (err) {
    result.storage = "unavailable";
  }

  // 2. Probar Base de Datos (consulta a la tabla de control)
  try {
    const dbCheck = Promise.race([
      sb.from("backup_operations").select("id").limit(1),
      timer
    ]);
    const { error } = await dbCheck;
    if (!error || error.code === "PGRST205") {
      // PGRST205 significa que PostgREST respondió activamente (aunque la tabla aún no esté migrada)
      result.database = "connected";
      result.status = "connected";
    } else {
      result.database = "error";
      result.status = "degraded";
    }
  } catch (err) {
    result.database = "unavailable";
    result.status = result.storage === "available" ? "degraded" : "disconnected";
  }

  return result;
}

module.exports = {
  getSupabase,
  checkSupabaseHealth,
  DEFAULT_SUPABASE_URL
};
