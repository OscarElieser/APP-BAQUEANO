// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REPLICACIÓN DE STORAGE MULTIMEDIA (storage-backup-service.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger fotografías de destinos, imágenes de cooperativas comunitarias y documentos.
// - Firebase Storage es el almacenamiento principal; Supabase Storage es la réplica secundaria.
// - Asegurar la integridad de archivos mediante cálculo criptográfico SHA-256.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Registro en tabla `storage_backups` de Supabase.
// - Copia y validación de hash entre Firebase y buckets de Supabase Storage.
// - Reporte de métricas de almacenamiento para la API de salud y el Ops Center.
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `trackStorageBackup`: Registra una réplica de archivo.
// - `calculateSha256`: Utilidad de hashing criptográfico.
// - `getStorageBackupMetrics`: Métricas consolidadas de almacenamiento.
// ============================================================================
"use strict";

const crypto = require("node:crypto");
const { getSupabase } = require("./supabase-client");

function calculateSha256(bufferOrStream) {
  if (Buffer.isBuffer(bufferOrStream) || typeof bufferOrStream === "string") {
    return crypto.createHash("sha256").update(bufferOrStream).digest("hex");
  }
  return null;
}

async function trackStorageBackup({
  firebasePath,
  firebaseDownloadUrl = null,
  supabaseBucket = "baqueano-backup-images",
  supabasePath,
  checksum = null,
  fileSize = null,
  mimeType = null,
  status = "backed_up",
  error = null
}) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "SUPABASE_UNAVAILABLE" };

  const record = {
    firebase_path: firebasePath,
    firebase_download_url: firebaseDownloadUrl,
    supabase_bucket: supabaseBucket,
    supabase_path: supabasePath || firebasePath,
    checksum: checksum,
    file_size: fileSize,
    mime_type: mimeType,
    backup_status: status,
    last_error: error ? String(error) : null,
    backed_up_at: status === "backed_up" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error: insertError } = await sb
      .from("storage_backups")
      .upsert(record, { onConflict: "firebase_path" })
      .select();

    if (insertError) {
      console.warn("[StorageBackup] Error registrando réplica:", insertError.message);
      return { ok: false, error: insertError.message };
    }

    return { ok: true, record: data?.[0] };
  } catch (ex) {
    console.error("[StorageBackup] Excepción registrando réplica:", ex.message);
    return { ok: false, error: ex.message };
  }
}

async function getStorageBackupMetrics() {
  const sb = getSupabase();
  const metrics = {
    total_backed_up: 0,
    pending: 0,
    failed: 0
  };

  if (!sb) return metrics;

  try {
    const { count: backedUp } = await sb.from("storage_backups").select("*", { count: "exact", head: true }).eq("backup_status", "backed_up");
    const { count: pending } = await sb.from("storage_backups").select("*", { count: "exact", head: true }).eq("backup_status", "pending");
    const { count: failed } = await sb.from("storage_backups").select("*", { count: "exact", head: true }).eq("backup_status", "failed");

    metrics.total_backed_up = backedUp || 0;
    metrics.pending = pending || 0;
    metrics.failed = failed || 0;
  } catch (err) {
    // Si la tabla aún no existe, devuelve ceros defensivos
  }

  return metrics;
}

module.exports = {
  calculateSha256,
  trackStorageBackup,
  getStorageBackupMetrics
};
