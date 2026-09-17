# EVALUACIÓN DE MODELOS, BACKTESTING & PREVENCIÓN DE LEAKAGE

## 🎯 1. Estrategia de Time-Series Splitting (Sin Data Leakage)

En el entrenamiento y validación de series de tiempo turísticas, queda terminantemente prohibido el uso de particiones aleatorias (*Random Train/Test Split*).

```text
[   ENTRENAMIENTO (Pasado)   ] → [   VALIDACIÓN (Intermedio)   ] → [   TEST (Futuro Retenido)   ]
   Día 1 a Día 90                    Día 91 a Día 110                  Día 111 a Día 120
```

---

## 📊 2. Métricas de Evaluación Utilizadas

- **MAE (Mean Absolute Error)**: Mide el error promedio absoluto en puntos de afluencia.
- **MAPE (Mean Absolute Percentage Error)**: Mide la desviación porcentual relativa.
- **RMSE (Root Mean Squared Error)**: Penaliza fuertemente los errores atípicos en picos de demanda.

---

## 🛡️ 3. Regla: ML Must Beat Baseline

Ningún modelo entra a producción si su MAE o MAPE no supera holgadamente a la media móvil simple de 7 días. Si un modelo degrada su rendimiento, se activa el Kill-Switch y el sistema recurre al baseline.
