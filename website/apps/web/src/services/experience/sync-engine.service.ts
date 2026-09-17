// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — MOTOR DE SINCRONIZACIÓN Y OFFLINE (sync-engine.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia robusta en condiciones de conectividad intermitente en zonas
//   rurales de Nicaragua ("Sin Internet no significa Sin Baqueano").
// - Gestionar la sincronización bidireccional de itinerarios, notas y destinos guardados
//   sin sobrescribir silenciosamente cambios concurrentes (manejo explícito de conflictos).
// - Prohibir la alteración o reconciliación en el cliente de transacciones financieras o reservas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Sync States: Controla transiciones entre `SYNCED`, `PENDING`, `CONFLICT` y `FAILED`.
// - Offline Queue: Almacena en cola local las mutaciones seguras realizadas sin red.
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - evaluateSyncState(): Determina el estado de sincronización entre versiones.
// - queueOfflineMutation(): Encola una acción segura en modo offline.
// - resolveSyncConflict(): Resuelve discrepancias mediante estrategias controladas.
// ============================================================================

import type { ExperienceSyncStatus } from "@baqueano/types";

export interface QueuedOfflineAction {
  readonly actionId: string;
  readonly type: "SAVE_PLACE" | "UPDATE_TRIP_NOTE" | "MARK_STOP_COMPLETED";
  readonly payload: unknown;
  readonly queuedAt: string;
}

export class SyncEngineService {
  private offlineQueue: QueuedOfflineAction[] = [];

  /**
   * Evalúa el estado de sincronización entre la versión local y la del servidor.
   */
  public evaluateSyncState(localVersion: number, serverVersion: number): ExperienceSyncStatus {
    if (localVersion === serverVersion) return "SYNCED";
    if (localVersion > serverVersion) return "PENDING";
    if (serverVersion > localVersion + 1) return "CONFLICT";
    return "PENDING";
  }

  /**
   * Encola una acción offline no crítica.
   */
  public queueOfflineMutation(type: QueuedOfflineAction["type"], payload: unknown): QueuedOfflineAction {
    const action: QueuedOfflineAction = {
      actionId: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      queuedAt: new Date().toISOString()
    };
    this.offlineQueue.push(action);
    return action;
  }

  /**
   * Obtiene las acciones pendientes de sincronización.
   */
  public getPendingQueue(): readonly QueuedOfflineAction[] {
    return [...this.offlineQueue];
  }

  /**
   * Limpia la cola tras una sincronización exitosa con la nube.
   */
  public clearQueue(): void {
    this.offlineQueue = [];
  }

  /**
   * Resuelve un conflicto de versiones de forma determinista y segura.
   */
  public resolveSyncConflict<T>(
    localData: T,
    serverData: T,
    strategy: "SERVER_WINS" | "CLIENT_WINS"
  ): { resolvedData: T; status: ExperienceSyncStatus } {
    if (strategy === "SERVER_WINS") {
      return { resolvedData: serverData, status: "SYNCED" };
    }
    return { resolvedData: localData, status: "PENDING" };
  }
}

export const syncEngineService = new SyncEngineService();
