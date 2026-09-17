# ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — FASE 19: IMPLEMENTACIÓN DE INTELIGENCIA ESTRATÉGICA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Consolidar todos los dominios de datos (operaciones, GIS, predicciones, confianza,
//   sostenibilidad, marketplace e IoT) en una plataforma estratégica para la toma de decisiones.
// - Erradicar tableros saturados de métricas inconexas: proveer un sistema que explique
//   qué está pasando, por qué importa y qué opciones viables existen.
// - Proteger la soberanía humana: la plataforma entrega evidencia rigurosa pero NUNCA
//   reemplaza autoridades, no sanciona automáticamente ni asigna fondos públicos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Capa Semántica de Métricas (`StrategicMetricsService`): Single Source of Truth para KPIs.
// - Convención Epistemológica de 4 Estados: ACTUAL (sólido), TARGET (meta), FORECAST (modelo), SIMULATION (what-if).
// - Motor de Señales Estratégicas (`StrategicSignalsService`): Detección de variaciones de demanda y capacidad.
// - Portafolio Territorial Multidimensional (`TerritorialPortfolioService`): Análisis sin reduccionismos numéricos.
// - Copiloto Estratégico (`StrategicToolsService`): Asistente IA fundamentado en herramientas deterministas.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - Módulos en `/admin/strategic` (Cockpit, Scenarios, Scorecard, Briefing).
// - Endpoints `/api/internal/strategic/`.
// - 18 documentos maestros de arquitectura, gobernanza, privacidad y seguridad.
// ============================================================================

## Resumen Ejecutivo de Implementación

La Fase 19 establece la capa de **National Command & Strategic Intelligence** para el ecosistema Baqueano Nicaragua.

### Principales Logros Técnicos:
1. **Capa Semántica de Métricas (Metric Layer)**: Catálogo estandarizado de KPIs donde cada indicador declara fórmula, origen, periodo, cadencia y propietario.
2. **Principio Epistemológico Innegociable**: Desaparición del "0" como sustituto de la ignorancia; cuando no hay datos, se emite explícitamente `SIN DATOS` (`null`).
3. **Sala de Escenarios (What-If Studio)**: Simulador contrafactual aislado con etiqueta estricta `isSimulatedData: true` y cero escritura en bases de datos reales.
4. **Baqueano Strategic Copilot**: Integración de IA explicativa basada 100% en llamadas deterministas a servicios de datos, con neutralización de inyecciones de prompts y sin alucinaciones numéricas.
5. **Aislamiento de Plataforma**: 100% desarrollado dentro de `/website`. Los directorios `/lib`, `/android`, `/test` y `pubspec.yaml` permanecen intactos.
