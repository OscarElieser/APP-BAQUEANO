# 🧭 MOTOR DE EVALUACIÓN DE RIESGOS TERRITORIALES — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Informar al explorador sobre las condiciones físicas, meteorológicas y de terreno asociadas a una ruta en Nicaragua, promoviendo una expedición consciente y segura sin emitir garantías falsas de "seguridad al 100%".

---

## ⚙️ 2. CÓMO (HOW / NIVELES Y REGLAS DE DECISIÓN)

- **Escala de Niveles de Riesgo**:
  - `low`: Senderos planos, zonas urbanas patrimoniales, miradores con acceso vehicular.
  - `moderate`: Caminatas volcánicas con pendiente media, cañones rocosos, cruce de ríos en balsa.
  - `high`: Expediciones avanzadas en selva virgen (Bosawás/Indio Maíz), ascensos a volcanes activos con emanación de gases.
- **Regla Ética Innegociable**: Prohibido emitir diagnósticos médicos individuales; las recomendaciones se enfocan en preparación física, equipo recomendado (calzado, agua) y guías locales.

---

## 📦 3. QUÉ (WHAT / ESQUEMA DE SALIDA DEL MOTOR DE RIESGOS)

```typescript
export interface RiskAssessment {
  readonly level: "low" | "moderate" | "high" | "unknown";
  readonly explanation: string;
  readonly factors: readonly string[];
  readonly recommendations: readonly string[];
}
```
