# ARQUITECTURA AGENTIC & SISTEMA MULTIAGENTE BAQUEANO

## 1. Visión General
La arquitectura multiagente de Baqueano distribuye responsabilidades entre 10 agentes especializados acotados por esquema, herramientas y niveles de autonomía.

```text
                              BAQUEANO
                                 │
                         DIGITAL CONCIERGE
                                 │
                          ORCHESTRATOR & ROUTER
                                 │
       ┌─────────────────────────┼──────────────────────────┐
       │                         │                          │
       ▼                         ▼                          ▼
  TRAVEL AGENTS              HOST AGENTS              OPS AGENTS
       │                         │                          │
       ├── Trip Planner          ├── Host Copilot          ├── Operations Agent
       ├── Destination           ├── Content Reviewer      ├── Trust Agent
       ├── Map & Routing         └── Evidence Organizer    └── Data Quality Agent
       ├── Budget & Math
       ├── Safety & Climate
       ├── Culture & Heritage
       └── Reservation Preparer
                                 │
                                 ▼
                    INDEPENDENT POLICY ENGINE
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
                ALLOW         CONFIRM          DENY
```

## 2. Principio de Especialización
- Cero "God Agent": Ningún agente posee control universal.
- El orquestador coordina la secuencia de llamadas con un límite estricto de 6 pasos.
- El Policy Engine evalúa permisos de backend independientemente del modelo.
