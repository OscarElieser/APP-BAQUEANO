# 🧭 FLUJO DE DATOS Y ORQUESTACIÓN — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Documentar el ciclo de vida y la secuencia de transformación de datos en las interacciones asistidas por IA, garantizando un rendimiento óptimo, baja latencia y trazabilidad de extremo a extremo sin fugas de información privada.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA DE FLUJO)

- **Desacoplamiento Cliente-Servidor**: El cliente web interactúa exclusivamente con el endpoint `/api/baqueano-ai`, el cual actúa como Gateway intermediario y orquestador.
- **Validación Bidireccional**: Los datos de entrada se validan con `tripProfileSchema` y la respuesta devuelta se valida con `itineraryResponseSchema`.
- **Degradación Elegante**: Si el proveedor de modelo externo no responde o no está configurado, el motor factual territorial entrega el itinerario estructurado sin interrumpir la experiencia del explorador.

---

## 📦 3. QUÉ (WHAT / DIAGRAMA DE SECUENCIA DE FLUJO DE DATOS)

```text
EXPLORADOR (Browser / Web)
          │
          │ 1. POST /api/baqueano-ai { days, budget, travelStyle }
          ▼
BAQUEANO AI GATEWAY (Next.js Server API)
          │
          │ 2. Valida TripProfile con Zod
          │ 3. Consulta Catálogo Verificado (Firestore / Seed Places)
          │ 4. Invoca Motor de Presupuesto Determinista (calculateBudget)
          │ 5. Evalúa Contexto de Riesgo y Conservación (evaluateRisk)
          │ 6. Valida ItineraryResponse estructurado
          ▼
RESPUESTA JSON 200 OK (Itinerario Estructurado + Paradas + Riesgo + Presupuesto)
          │
          ▼
CLIENTE WEB (Renderizado reactivo en /baqueano-ai con UI segura)
```
