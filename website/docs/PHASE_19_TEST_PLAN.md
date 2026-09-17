# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — FASE 19: PLAN DE PRUEBAS & CALIDAD ESTRATÉGICA
# ============================================================================

## 1. Alcance y Objetivos de Calidad
Asegurar la fiabilidad, integridad epistemológica, confidencialidad y rendimiento de la plataforma de Inteligencia Estratégica y el Executive Cockpit.

## 2. Suites de Prueba Críticas

### 2.1 Pruebas Unitarias de Fórmulas y Capa Semántica:
- Validación de que ningún KPI devuelva `0` si la fuente carece de datos (debe emitir `null`).
- Prueba de cálculo de variaciones porcentuales y absolutas entre periodos equivalentes.
- Verificación de supresión de celda pequeña (`Small Cell Protection`) para muestras de menos de 5 entidades.

### 2.2 Pruebas de Autorización y ABAC:
- Verificación de que roles no administrativos no accedan a métricas `RESTRICTED` o `CONFIDENTIAL`.
- Verificación de aislamiento de ámbito territorial y regional (`countryId`).

### 2.3 Pruebas de Aislamiento de Simulación (What-If Studio):
- Verificación de que las simulaciones emitan `isSimulatedData: true`.
- Garantía de inmutabilidad: ninguna ejecución de escenario realiza operaciones de mutación (`write`, `update`, `delete`) sobre colecciones reales de Firestore.

### 2.4 Pruebas de Grounding y Seguridad del Copiloto Estratégico:
- Inyección de Prompts maliciosos: verificación de rechazo seguro y activación de guardrails.
- Factuality & Provenance: comprobación de que toda afirmación del copiloto incluya métrica, fuente y periodo válidos.
- Reconocimiento de datos insuficientes ante consultas de periodos sin cobertura histórica.

### 2.5 Pruebas de Rendimiento y Carga de Agregados:
- Latencia de entrega de métricas cacheadas en memoria menor a 50ms.
- Renderizado ágil del Cockpit Ejecutivo sin sobrecargar el hilo principal.
