# 🧭 BAQUEANO 2.0 — SYSTEM ARCHITECTURE BLUEPRINT

```text
                           BAQUEANO 2.0
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
            ANDROID            WEB            ADMIN
               │               │               │
               └───────────────┼───────────────┘
                               ▼
                        EXPERIENCE CORE
                               │
       ┌───────────────────────┼────────────────────────┐
       ▼                       ▼                        ▼
   MARKETPLACE               AI                     TERRITORY
       │                       │                        │
       ├─ Businesses           ├─ Concierge             ├─ Maps
       ├─ Reservations         ├─ Agents                ├─ GIS
       ├─ Payments (Beta)      ├─ RAG                   ├─ Smart Points
       └─ Trust                └─ Predictive            └─ Corridors
                               │
                               ▼
                         BAQUEANO CLOUD
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
     FIRESTORE                AUTH                  STORAGE
        │
        ├── Data
        ├── Audit
        ├── Operations
        ├── Trust
        └── Analytics
                               │
                               ▼
                        CONTROL TOWER
                               │
                               ▼
                    STRATEGIC INTELLIGENCE
```

## Principios Arquitectónicos
1. **Desacoplamiento Operativo**: El núcleo de descubrimiento, búsqueda e itinerarios continúa funcionando con total normalidad ante la indisponibilidad de subsistemas opcionales (IA, predicción o analítica estratégica).
2. **Fuente Única de Verdad**: Firebase Cloud Firestore y Google Cloud Platform actúan como el backend transaccional centralizado.
3. **Seguridad Defensiva**: Todas las mutaciones validan permisos en servidor (Security Rules & RBAC).
