# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — GOBERNANZA DE DATOS ESTRATÉGICOS
# ============================================================================

## 1. Clasificación de Sensibilidad de Métricas
- `PUBLIC`: Indicadores agregados aptos para el Observatorio y portales abiertos (ej. destinos documentados).
- `INTERNAL`: Indicadores de gestión y rendimiento del equipo de operaciones (ej. tasa de respuesta de anfitriones).
- `CONFIDENTIAL`: Datos operativos sensibles y métricas comerciales agregadas (ej. volumen total de reservas).
- `RESTRICTED`: Casos de integridad, auditorías de fraude y telemetría de seguridad (solo `super_admin` y `auditor`).

## 2. Control de Cambios en Definición de KPIs
- Queda prohibida la modificación manual de cifras estadísticas desde la interfaz de usuario.
- Toda modificación de fórmula o método de agregación requiere versión formal (`version: "1.1.0"`), registro en el historial de auditoría y justificación técnica.

## 3. Linaje de Datos (Data Lineage)
```text
Evento / Telemetría (analytics_events / smart_points)
       ↓
Pipeline de Agregación & Normalización
       ↓
Capa Semántica de Métricas (`StrategicMetricsService`)
       ↓
Visualización en Executive Cockpit & Copiloto
```
