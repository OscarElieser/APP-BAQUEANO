# 🧭 ARQUITECTURA MODULAR DE PROMPTS — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Evitar la fragilidad e ineficiencia de un "God Prompt" monolítico, dividiendo las instrucciones del sistema en módulos especializados según la intención del usuario y su rol, optimizando la precisión de salida y reduciendo el consumo de tokens.

---

## ⚙️ 2. CÓMO (HOW / ESTRUCTURA MODULAR)

- **Instrucción Maestra de Identidad**: Define la personalidad de Baqueano AI como copiloto territorial nicaragüense, enfocado en respeto cultural, conservación ambiental y soberanía campesina.
- **Módulos de Especialización**:
  - `planner_prompt`: Planificación de rutas, tiempos y presupuestos día a día.
  - `culture_prompt`: Contexto histórico, tradiciones orales y literatura nicaragüense (Rubén Darío, gastronomía local).
  - `risk_prompt`: Análisis de factores de seguridad física, climatológica y senderismo.
  - `host_prompt`: Asistencia editorial para redacción de descripciones y preguntas frecuentes de anfitriones.

---

## 📦 3. QUÉ (WHAT / ESPECIFICACIÓN DE MÓDULOS)

| Módulo de Prompt | Rol / Contexto | Objetivo Principal | Restricciones Específicas |
| --- | --- | --- | --- |
| **Territorial Identity (Base)** | Global | Fijar identidad y tono respetuoso y pinolero. | Prohibido inventar lugares o precios no verificados. |
| **Trip Planner** | Explorador | Construir itinerarios con paradas geolocalizadas. | Salida obligatoria en formato JSON estructurado. |
| **Culture Guide** | Explorador | Narrar historia y gastronomía tradicional. | Distinguir explícitamente entre hecho histórico y leyenda. |
| **Risk & Safety** | Explorador / Host | Informar precauciones de senderos y agua. | Prohibido asegurar "100% de seguridad" o emitir diagnósticos médicos. |
| **Host Copilot** | Anfitrión (Host) | Redactar borradores de servicios turísticos. | Todo contenido generado queda en estado `draft` hasta aprobación del host. |
