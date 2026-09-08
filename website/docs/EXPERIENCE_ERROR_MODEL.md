# 🧭 BAQUEANO — EXPERIENCE ERROR MODEL & FAULT TOLERANCE

## 🎯 1. POR QUÉ (WHY)
Asegurar que los errores en servicios secundarios no impidan el disfrute del viaje y que el usuario reciba mensajes claros con acciones de recuperación concretas.

## ⚙️ 2. CÓMO (HOW)
- **Clasificación de Errores**:
  - `NETWORK_ERROR`: Sin conexión a internet -> Activa modo offline con aviso informativo no intrusivo.
  - `AUTH_REQUIRED`: Recurso privado -> Redirige al login preservando la intención en `lastIntent`.
  - `PERMISSION_DENIED`: Usuario no autorizado -> Muestra pantalla de solicitud de acceso sin filtrar detalles internos.
  - `CONFLICT`: Desincronización en ediciones concurrentes -> Ofrece visualización comparada para resolver el conflicto.
  - `SERVICE_DEGRADED`: Mapas o IA fuera de línea -> Despliega vista textual o itinerario estático sin bloquear la pantalla.

## 📦 3. QUÉ (WHAT)
- Límites de Error (Error Boundaries) por componente independiente (`TripHubErrorBoundary`, `MapErrorBoundary`).
- Cero mensajes técnicos crudos expuestos al usuario final (ej. `FirebaseError: permission-denied`).
