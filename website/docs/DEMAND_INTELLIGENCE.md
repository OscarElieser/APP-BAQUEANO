# 🧭 DEMAND INTELLIGENCE — INTELIGENCIA DE DEMANDA TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Analizar los patrones de búsqueda, reservas, tráfico web y consultas a Baqueano AI para anticipar la concentración de viajeros en Nicaragua, evitando la saturación de destinos frágiles e impulsando el ecoturismo hacia comunidades con capacidad ociosa.

---

## ⚙️ 2. CÓMO (HOW / CÁLCULO DE SEÑALES DE DEMANDA)

La señal de demanda se clasifica en 4 niveles calculados mediante agregación periódica:

- 🟢 `low`: Actividad turística baja; territorio con disponibilidad amplia e ideal para recomendaciones de dispersión.
- 🔵 `medium`: Flujo equilibrado; reservas dentro de promedios históricos normales.
- 🟡 `high`: Afluencia elevada; destinos principales al 75%-90% de capacidad proyectada.
- 🔴 `surging`: Pico atípico de demanda; riesgo de saturación inminente; se activan sugerencias de rutas alternativas en Baqueano AI.

```text
[Búsquedas Web + Consultas Baqueano AI + Reservas Host Portal]
                              │
                              ▼
            [Agregador Ponderado por Territorio]
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
      [Índice de Demanda]       [Recomendador de Dispersión]
```

---

## 📦 3. QUÉ (WHAT / MÉTRICAS CLAVE DE DEMANDA)

1. **`activeExplorersEstimate`**: Volumen estimado de exploradores presentes en el territorio durante las últimas 24 horas.
2. **`demandSignal`**: Nivel sintetizado (`low` | `medium` | `high` | `surging`).
3. **`dispersalFactor`**: Puntuación de idoneidad para redireccionar viajeros desde destinos saturados hacia atractivos comunitarios cercanos.
