# 🧭 BAQUEANO EXPERIENCE OS — ARCHITECTURAL BLUEPRINT

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Experience OS es la capa de orquestación transversal que unifica identidad, contexto, itinerarios, mapas, contenido, reservas, concierge digital, Smart Points y pasaporte bajo una misma experiencia fluida e integrada.

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA)
```text
                          BAQUEANO
                             │
                       EXPERIENCE OS
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
     WEB                  ANDROID                  PWA
      │                      │                      │
      └──────────────────────┼──────────────────────┘
                             ▼
                      EXPERIENCE CORE
                             │
      ┌──────────────┬───────┼────────┬──────────────┐
      ▼              ▼       ▼        ▼              ▼
   IDENTITY         TRIP    MAP     CONCIERGE     PASSPORT
      │
      ├── Preferences
      ├── Saved Places
      ├── Reservations
      ├── Notifications
      ├── Smart Points
      ├── Trust
      └── Context
                             │
                             ▼
                      BAQUEANO CLOUD
```

- **Sin Backend Paralelo**: Consume y coordina las fuentes de verdad existentes (Firestore, Cloud Functions, Google Maps, Open-Meteo).
- **Aislamiento Multicanal**: Cada canal (Web, PWA, Kiosco) implementa las capacidades soportadas sin forzar paridad artificial.
- **Resiliencia de Degeneración Elegante**: La indisponibilidad de componentes no esenciales (IA, mapas) no interrumpe la navegación ni la consulta del itinerario.

## 📦 3. QUÉ (WHAT / COMPONENTES)
- `ExperienceContextService`: Mantiene el contexto de sesión y canal.
- `DeepLinkResolverService`: Enrutador canónico seguro.
- `SyncEngineService`: Gestión de sincronización y resolución de conflictos.
- `TripHubService`: Síntesis de paradas, mapa y vista "Hoy".
- `PassportService`: Bitácora y sellos territoriales verificados.
