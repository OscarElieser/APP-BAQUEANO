# 🧭 IMPLEMENTACIÓN DE FASE 8 — SISTEMA INTELIGENTE DE EXPLORACIÓN TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Consolidar la evolución de Baqueano AI desde un endpoint experimental hacia un copiloto territorial completo de Nicaragua, fundamentado en datos verificados de Firestore, validación de salida estructurada con Zod, anti-alucinación, cálculo presupuestario determinista y guardarraíles éticos innegociables.

---

## ⚙️ 2. CÓMO (HOW / PILARES TÉCNICOS DE LA FASE 8)

- **AI Gateway Operativo**: Endpoint `/api/baqueano-ai` con soporte de modelos server-side y motor factual determinista.
- **Salida Estructurada y Validada**: Cero renderizado de texto crudo no verificado; la UI renderiza componentes nativos tipados (`ItineraryResponse`).
- **Aislamiento Total de Android**: Toda interoperabilidad ocurre mediante contratos tipados y Deep Links sin modificar el código base de Flutter en `/lib` ni `/android`.

---

## 📦 3. QUÉ (WHAT / ENTREGABLES INTEGRADOS DE LA FASE 8)

1. **Gateway Server-Side**: `website/apps/web/src/app/api/baqueano-ai/route.ts` con respuesta HTTP 200.
2. **Servicio Cliente**: `website/apps/web/src/services/ai.service.ts` con tipado de itinerarios y telemetría.
3. **Planificador Interactivo**: `website/apps/web/src/app/baqueano-ai/page.tsx` con interfaz reactiva día a día.
4. **Esquemas Zod**: `website/packages/validators/src/index.ts` con `tripProfileSchema` e `itineraryResponseSchema`.
5. **Tipos Compartidos**: `website/packages/types/src/index.ts` con contratos `TripProfile`, `ItineraryResponse`, `RiskAssessment`.
6. **12 Documentos de Arquitectura**: En `website/docs/` cubriendo herramientas, seguridad, costos, RAG, riesgos y evals.
