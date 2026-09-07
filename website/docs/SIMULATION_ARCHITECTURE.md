# ARQUITECTURA DEL LABORATORIO DE SIMULACIÓN (SIMULATION LAB)

## 🏛️ 1. Arquitectura de Ejecución en Memoria

```text
  [ BASELINE SNAPSHOT ] (Read-Only)
           │
           ▼
  [ PARAMETER SANITIZER ] (Cotas SIMULATION_BOUNDS_CONFIG)
           │
           ▼
  [ WHAT-IF SIMULATION ENGINE ] (In-Memory Pure Computations)
      ├── Variación de Demanda
      ├── Ajuste de Capacidad
      ├── Cierres Temporales por Clima
      └── Algoritmo de Redistribución Solidaria
           │
           ▼
  [ SCENARIO IMMUTABLE RESULT ] (Etiquetado isSimulatedData: true)
           │
           ▼
  [ SIMULATION LAB UI (/admin/simulation) ]
```

---

## 🛡️ 2. Restricciones Operacionales

1. **Cero mutaciones en base de datos**: No actualiza disponibilidad de alojamientos ni reservas.
2. **Banner visual permanente**: El usuario siempre ve el aviso de **MODO SIMULACIÓN**.
3. **Reproducibilidad determinística**: Mismos parámetros sobre el mismo snapshot generan idénticos resultados.
