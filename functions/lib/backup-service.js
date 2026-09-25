// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SERVICIO DE RESPALDO Y SINCRONIZACIÓN (backup-service.js)
// ============================================================================
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proteger cada reserva comunitaria, reseña, favorito y perfil contra pérdidas.
// - Si Firebase falla o está en mantenimiento, la operación se guarda en Supabase
//   y se sincroniza en segundo plano cuando Firestore vuelva a estar disponible.
// - Evitar duplicados mediante `operation_id` único e idempotente.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Inserción en tabla `backup_operations` de Supabase con `operation_id` UUID.
// - Motor de sincronización `syncFirebaseBackup` con reintentos y backoff exponencial:
//   1 min, 5 min, 15 min, 1 hora, 6 horas.
// - Detección de conflictos sin sobreescritura ciega (compara `version` y `updatedAt`).
//
// 📦 3. QUÉ (WHAT / ENTIDADES EXPUESTAS):
// - `recordBackupOperation`: Registra operación en cola de contingencia.
// - `syncFirebaseBackup`: Procesa y sincroniza operaciones pendientes.
// - `getBackupMetrics`: Devuelve métricas reales para el panel Ops Center.
// ============================================================================
"use strict";

const crypto = require("node:crypto");
const { getSupabase } = require("./supabase-client");

// Intervalos de backoff progresivo (en milisegundos)
const BACKOFF_INTERVALS_MS = [
  60 * 1000,        // Reintento 1: 1 minuto
  5 * 60 * 1000,    // Reintento 2: 5 minutos
  15 * 60 * 1000,   // Reintento 3: 15 minutos
  60 * 60 * 1000,   // Reintento 4: 1 hora
  6 * 60 * 60 * 1000 // Reintento 5+: 6 horas
];

function calculateNextRetryAllowed(retryCount, updatedAt) {
  const index = Math.min(retryCount, BACKOFF_INTERVALS_MS.length - 1);
  const backoff = BACKOFF_INTERVALS_MS[index];
  const lastUpdated = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return lastUpdated + backoff;
}

async function recordBackupOperation({
  operationId = crypto.randomUUID(),
  firebaseUid = null,
  entityType,
  entityId,
  operationType = "INSERT",
  payload,
  firebaseStatus = "pending",
  error = null
}) {
  const sb = getSupabase();
  if (!sb) {
    console.warn("[BackupService] Supabase no disponible; operación no registrada en contingencia.");
    return { ok: false, error: "SUPABASE_UNAVAILABLE", operationId };
  }

  const record = {
    operation_id: operationId,
    firebase_uid: firebaseUid,
    entity_type: entityType,
    entity_id: String(entityId),
    operation_type: operationType,
    payload: payload,
    firebase_status: firebaseStatus,
    last_error: error ? String(error) : null,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error: insertError } = await sb
      .from("backup_operations")
      .upsert(record, { onConflict: "operation_id" })
      .select();

    if (insertError) {
      console.error("[BackupService] Error insertando en backup_operations:", insertError.message);
      return { ok: false, error: insertError.message, operationId };
    }

    return { ok: true, operationId, record: data?.[0] };
  } catch (ex) {
    console.error("[BackupService] Excepción al registrar operación de respaldo:", ex.message);
    return { ok: false, error: ex.message, operationId };
  }
}

async function syncFirebaseBackup(firestoreDb) {
  const sb = getSupabase();
  if (!sb || !firestoreDb) {
    return { ok: false, error: "RESOURCES_NOT_AVAILABLE", processed: 0, synced: 0, failed: 0 };
  }

  const now = Date.now();
  let processed = 0;
  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  try {
    // 1. Obtener operaciones pendientes o fallidas elegibles
    const { data: operations, error: fetchErr } = await sb
      .from("backup_operations")
      .select("*")
      .in("firebase_status", ["pending", "failed"])
      .lt("retry_count", 10)
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchErr) {
      console.warn("[BackupService] Error obteniendo operaciones pendientes:", fetchErr.message);
      return { ok: false, error: fetchErr.message, processed, synced, failed };
    }

    if (!operations || operations.length === 0) {
      return { ok: true, message: "No hay operaciones pendientes de sincronización.", processed: 0, synced: 0, failed: 0 };
    }

    for (const op of operations) {
      const retryAllowedAt = calculateNextRetryAllowed(op.retry_count, op.updated_at);
      if (now < retryAllowedAt && op.retry_count > 0) {
        // Aún en período de enfriamiento backoff
        continue;
      }

      processed++;

      try {
        const collectionName = op.entity_type;
        const docRef = firestoreDb.collection(collectionName).doc(op.entity_id);
        const existingDoc = await docRef.get();

        // Detección de conflictos
        if (existingDoc.exists) {
          const fbData = existingDoc.data();
          const fbUpdatedAt = fbData.updatedAt ? (fbData.updatedAt.toDate ? fbData.updatedAt.toDate().getTime() : new Date(fbData.updatedAt).getTime()) : 0;
          const opCreatedAt = new Date(op.created_at).getTime();

          if (fbUpdatedAt > opCreatedAt && (fbData.version || 0) > (op.version || 0)) {
            // Existe un conflicto: Firebase tiene una versión más nueva que esta operación
            conflicts++;
            await sb.from("backup_operations").update({
              firebase_status: "conflict",
              last_error: "Conflicto: Firebase contiene una versión más reciente.",
              updated_at: new Date().toISOString()
            }).eq("id", op.id);
            continue;
          }
        }

        // Aplicar operación en Firestore
        const payloadToSave = {
          ...op.payload,
          _syncedFromSupabaseAt: new Date(),
          _operationId: op.operation_id
        };

        if (op.operation_type === "DELETE") {
          await docRef.update({ deletedAt: new Date(), status: "archived" });
        } else {
          await docRef.set(payloadToSave, { merge: true });
        }

        // Marcar sincronizada
        synced++;
        await sb.from("backup_operations").update({
          firebase_status: "synced",
          synced_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString()
        }).eq("id", op.id);

      } catch (applyErr) {
        failed++;
        console.warn(`[BackupService] Fallo sincronizando op ${op.operation_id}:`, applyErr.message);
        await sb.from("backup_operations").update({
          firebase_status: "failed",
          retry_count: (op.retry_count || 0) + 1,
          last_error: applyErr.message,
          updated_at: new Date().toISOString()
        }).eq("id", op.id);
      }
    }

    return { ok: true, processed, synced, failed, conflicts };
  } catch (ex) {
    console.error("[BackupService] Excepción durante sincronización:", ex.message);
    return { ok: false, error: ex.message, processed, synced, failed };
  }
}

async function getBackupMetrics() {
  const sb = getSupabase();
  const metrics = {
    pending_operations: 0,
    synced_operations: 0,
    failed_operations: 0,
    conflicts: 0,
    last_backup: null,
    last_sync: null
  };

  if (!sb) return metrics;

  try {
    const { count: pending } = await sb.from("backup_operations").select("*", { count: "exact", head: true }).eq("firebase_status", "pending");
    const { count: synced } = await sb.from("backup_operations").select("*", { count: "exact", head: true }).eq("firebase_status", "synced");
    const { count: failed } = await sb.from("backup_operations").select("*", { count: "exact", head: true }).eq("firebase_status", "failed");
    const { count: conflict } = await sb.from("backup_operations").select("*", { count: "exact", head: true }).eq("firebase_status", "conflict");

    const { data: latestOp } = await sb.from("backup_operations").select("created_at").order("created_at", { ascending: false }).limit(1);
    const { data: latestSync } = await sb.from("backup_operations").select("synced_at").eq("firebase_status", "synced").order("synced_at", { ascending: false }).limit(1);

    metrics.pending_operations = pending || 0;
    metrics.synced_operations = synced || 0;
    metrics.failed_operations = failed || 0;
    metrics.conflicts = conflict || 0;
    metrics.last_backup = latestOp?.[0]?.created_at || null;
    metrics.last_sync = latestSync?.[0]?.synced_at || null;
  } catch (err) {
    // Si la tabla no está creada aún en Supabase, retorna ceros sin romper
  }

  return metrics;
}

module.exports = {
  recordBackupOperation,
  syncFirebaseBackup,
  getBackupMetrics,
  calculateNextRetryAllowed
};
