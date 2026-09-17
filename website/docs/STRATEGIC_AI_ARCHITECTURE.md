# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — ARQUITECTURA DE IA ESTRATÉGICA (STRATEGIC COPILOT)
# ============================================================================

## 1. Misión del Copiloto Estratégico
El **Baqueano Strategic Copilot** es una extensión de la arquitectura agéntica (Fase 15) diseñada para sintetizar, comparar y explicar el estado del ecosistema en lenguaje natural a los tomadores de decisiones.

## 2. Principio Innegociable de Grounding (Cero Alucinaciones)
El LLM tiene prohibido inventar o improvisar cifras estadísticas. Cada respuesta se fundamenta en llamadas a herramientas deterministas (`StrategicToolsService`):
1. `getStrategicKPIsTool()`
2. `getTerritoryProfileTool()`
3. `getStrategicSignalsTool()`
4. `getTrustCoverageTool()`
5. `getOperationalSummaryTool()`

## 3. Formato Estructurado de Respuestas
Toda respuesta del copiloto clasifica explícitamente sus conclusiones en:
- **Hechos Medidos (Facts)**: Respaldados con fuente y periodo.
- **Pronósticos (Forecasts)**: Estimados por modelos probabilísticos.
- **Simulaciones (Simulations)**: Suposiciones contrafactuales.
- **Opciones Sugeridas (Recommendations)**: Recomendaciones no vinculantes.

## 4. Defensas de Seguridad
- Sanitización de consultas contra inyecciones de prompts (`dan mode`, `ignore instructions`).
- Bloqueo de consultas sobre datos personales o sesiones individuales de turistas.
