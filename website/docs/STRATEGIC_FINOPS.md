# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — GESTIÓN FINANCIERA Y FINOPS ESTRATÉGICO
# ============================================================================

## 1. Eficiencia de Costos de la Capa Estratégica
1. **Caching de Agregados**: Las consultas a KPIs estratégicos y portafolios territoriales se resuelven en memoria o mediante vistas agregadas materializadas, evitando lecturas masivas innecesarias a Firestore.
2. **Consultas Asíncronas y Debounce**: La interfaz ejecutiva agrupa solicitudes de telemetría y limita la recarga en tiempo real a una cadencia horaria o diaria según el indicador.
3. **Control de Presupuesto en AI Gateway**: El Copiloto Estratégico utiliza prompts estructurados y tokens acotados, con guardrails de tasa de uso para evitar sobrecostos en inferencia.

## 2. Monitoreo de Costos Unitarios
- Monitoreo del costo mensual promedio por anfitrión activo y por consulta de copiloto.
- Detección de anomalías de consumo en mapas, almacenamiento multimedia e inferencia de lenguaje.
