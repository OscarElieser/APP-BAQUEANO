# REGISTRO DE EXPERIMENTOS PREDICTIVOS & COMPARACIÓN DE CANDIDATOS

## 🧪 1. Experimentos Realizados en Fase 16

| Experimento ID | Algoritmo Evaluado | MAE Obtenido | MAPE | Decisión |
| :--- | :--- | :---: | :---: | :--- |
| `EXP-001-MA7` | Media Móvil Simple 7d | 14.2 pts | 16.5% | Aprobado como **Baseline Oficial**. |
| `EXP-002-MA7-SEASONAL` | Media Móvil 7d + Factor Día-Semana | 9.8 pts | 11.4% | Aprobado como **Modelo Activo v1.2.0**. |
| `EXP-003-ARIMA-PRELIM` | AutoRegressive Integrated Moving Avg | 10.4 pts | 12.1% | Rechazado (mayor latencia computacional sin ganancia de precisión). |
| `EXP-004-REDISTRIB-SIM` | Motor Heurístico de Redistribución | N/A | N/A | Aprobado para **Simulation Lab**. |
