# MODELO DE WORKFLOWS AGENTIC & ESTADOS

## 1. Ciclo de Vida del Workflow
```text
[CREATED] ──> [RUNNING] ──┬──> [WAITING_FOR_HUMAN] ──┬──> [RUNNING] ──> [COMPLETED]
                          │                           │
                          │                           └──> [CANCELLED]
                          └──> [FAILED]
```

## 2. Invariantes del Motor de Workflows
- **Idempotencia**: Reanudar o reintentar un paso no duplica acciones en servicios de backend.
- **Control de Ciclos**: Máximo 6 pasos por workflow; aborto automático si se detecta recursión circular.
- **Trazabilidad**: Registro inmutable de cada paso (`agent`, `action`, `resultSummary`, `timestamp`).
- **Aislamiento**: Ningún workflow puede acceder al contexto de memoria de otro usuario.
