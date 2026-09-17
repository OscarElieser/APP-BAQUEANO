# ARQUITECTURA DE INTELIGENCIA PREDICTIVA & FLUJO DE DATOS

## 🧭 1. Diagrama de Flujo

```text
                             BAQUEANO
                                │
                       REAL DATA PLATFORM
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
      ANALYTICS            CONTROL TOWER             IoT
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                         FEATURE PIPELINE
                                │
                                ▼
                      PREDICTIVE PLATFORM
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
       DEMAND                CAPACITY              PRESSURE
       MODEL                 MODEL                 MODEL
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                        SIMULATION ENGINE
                                │
                  ┌─────────────┼─────────────┐
                  ▼             ▼             ▼
               WHAT-IF        ROUTES        SCENARIOS
                  │
                  ▼
                        DECISION SUPPORT
                  │
         ┌────────┼────────────┐
         ▼        ▼            ▼
     CONTROL    BAQUEANO      HUMAN
      TOWER        AI        DECISION
```

---

## 🛡️ 2. Separación Epistemológica de 5 Estados

1. **OBSERVADO**: Datos históricos y telemetría confirmada en tiempo real.
2. **ESTIMADO**: Cálculo indirecto con factores conocidos (ej. gasto promedio o presión territorial).
3. **PRONOSTICADO**: Extrapolación estadística a 24h, 7d o 30d con bandas de incertidumbre `[min, max]`.
4. **SIMULADO**: Escenario hipotético ejecutado en el Simulation Lab sin mutar datos de producción.
5. **DESCONOCIDO**: Estado honesto cuando no existen suficientes datos de entrada.
