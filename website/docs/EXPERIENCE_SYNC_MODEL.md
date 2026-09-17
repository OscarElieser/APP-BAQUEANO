# 🧭 BAQUEANO — EXPERIENCE SYNC MODEL & CONFLICT RESOLUTION

## 🎯 1. POR QUÉ (WHY)
Permitir que el explorador modifique su viaje o guarde lugares tanto online como offline, asegurando que los cambios se propaguen coherentemente sin pérdida involuntaria de datos.

## ⚙️ 2. CÓMO (HOW)
- **Estados de Sincronización**:
  - `SYNCED`: Estado local idéntico al servidor cloud.
  - `PENDING`: Modificaciones locales almacenadas en cola de espera para envío al reconectar.
  - `CONFLICT`: Discrepancia detectada entre versión local y remota (ej. edición simultánea en Web y PWA móvil).
  - `FAILED`: Error irrecuperable de validación en servidor.
- **Estrategia de Resolución de Conflictos**:
  - *Itinerarios y Notas*: Fusión asistida mostrando 'Versión del Servidor' vs 'Tu Versión Local'.
  - *Reservas y Pagos*: **Nunca se fusionan en el cliente**; el estado de la reserva reside 100% en el servidor por seguridad financiera.

## 📦 3. QUÉ (WHAT)
- `SyncEngineService` implementado en `website/apps/web/src/services/experience/sync-engine.service.ts` con persistencia en localStorage e IndexedDB.
