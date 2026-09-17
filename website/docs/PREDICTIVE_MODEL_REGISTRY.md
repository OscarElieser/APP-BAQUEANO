# REGISTRO MAESTRO DE MODELOS PREDICTIVOS (MODEL REGISTRY)

| Modelo ID | Objetivo | Datos de Entrada | Versión | Estado | Baseline MAE | Model MAE | MAPE | Model Card |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `demand-forecast-v1` | Pronóstico de Afluencia e Interés Diario | Señales agregadas de tráfico, favoritos y búsquedas | `v1.2.0` | `ACTIVE` | 14.2 | 9.8 | 11.4% | [demand-forecast-v1.md](file:///c:/Users/PC%201/APP%20BAQUEANO/website/docs/model-cards/demand-forecast-v1.md) |
| `capacity-forecast-v1` | Tasa de Ocupación y Nivel de Saturación | Demanda proyectada + Capacidad validada de cooperativas | `v1.1.0` | `ACTIVE` | 8.5 | 5.2 | 7.1% | [capacity-forecast-v1.md](file:///c:/Users/PC%201/APP%20BAQUEANO/website/docs/model-cards/capacity-forecast-v1.md) |
| `territorial-pressure-v1` | Índice Multidimensional de Presión (0-100) | Demanda (35%), Capacidad (30%), Vulnerabilidad (20%), Estacionalidad (15%) | `v1.0.4` | `ACTIVE` | 12.0 | 6.7 | 8.9% | [territorial-pressure-v1.md](file:///c:/Users/PC%201/APP%20BAQUEANO/website/docs/model-cards/territorial-pressure-v1.md) |
| `cost-forecast-v1` | Proyección Mensual de Costos FinOps | Consumo Firestore, tokens AI Gateway, mapas | `v1.0.1` | `ACTIVE` | 18.0 | 11.5 | 6.8% | [cost-forecast-v1.md](file:///c:/Users/PC%201/APP%20BAQUEANO/website/docs/model-cards/cost-forecast-v1.md) |
