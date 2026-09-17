# MODEL CARD: DEMAND FORECAST V1 (`demand-forecast-v1`)

## 📋 Resumen del Modelo
- **Propósito**: Pronosticar el interés y afluencia agregada diaria de viajeros a nivel de destino en horizontes de 24h, 7d y 30d.
- **Versión**: `v1.2.0`
- **Algoritmo**: Media móvil ponderada de 7 días con ajuste de estacionalidad por día de la semana y tendencia.
- **Métricas de Rendimiento**: MAE: 9.8 pts | MAPE: 11.4% (Supera al Baseline MAE de 14.2 pts).

## 🚫 Usos Prohibidos
- Prohibido para predecir comportamiento, solvencia o gasto de personas individuales.
- Prohibido para fijación dinámica y especulativa de tarifas.
- Prohibido como único criterio para cerrar accesos públicos sin supervisión humana.

## ⚠️ Limitaciones Conocidas
- Alta sensibilidad a alertas meteorológicas imprevistas (huracanes o lluvias torrenciales) no capturadas en el historial reciente.
