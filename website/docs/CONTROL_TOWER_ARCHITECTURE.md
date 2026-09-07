# 🧭 CONTROL TOWER ARCHITECTURE — ARQUITECTURA DE LA TORRE DE CONTROL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proveer una arquitectura técnica desacoplada, reactiva y resiliente que procese eventos territoriales, telemetría de red, flujo de reservas e incidentes en tiempo real, permitiendo a los operadores tomar decisiones informadas en segundos sin degradar el rendimiento del ecosistema móvil y web.

---

## ⚙️ 2. CÓMO (HOW / FLUJO DE DATOS & CAPAS DEL SISTEMA)

```text
[Sensores / Hosts / Exploradores / APIs Externas]
                     │
                     ▼
       [Cloud Functions Ingestion Gateway]
                     │
                     ├──────────────┬──────────────┐
                     ▼              ▼              ▼
           [Incidents Stream] [Alerts Engine] [Demand Aggregator]
                     │              │              │
                     └──────────────┼──────────────┘
                                    ▼
                      [Firestore Realtime Snapshot]
                                    │
                                    ▼
                [Control Tower UI (Next.js Admin App)]
```

- **Capa de Ingestión**: Recibe reportes autenticados mediante Cloud Functions y valida con Zod schemas.
- **Motor de Agregación**: Procesa el volumen de exploradores y carga de destinos cada 5 minutos.
- **Capa de Notificación y Despacho**: Emite alertas operativas inmediatas ante eventos críticos (`emergency`, `critical`).
- **Capa de Presentación**: Next.js App Router con componentes optimizados para evitar re-renderizados innecesarios.

---

## 📦 3. QUÉ (WHAT / COMPONENTES & CONTRATOS TÉCNICOS)

1. **`control-tower.service.ts`**: Servicio centralizado que abstrae la lectura de estados de territorios, lista de incidencias y alertas.
2. **`TerritoryOperationalState`**: Modelo integral que unifica demanda, capacidad, clima, conectividad y estado vial.
3. **`IncidentRecord`**: Registro inmutable de incidentes con bitácora cronológica auditada (`actionLog`).
4. **`SystemHealthStatus`**: Observabilidad de latencia P95, tasa de error y disponibilidad de dependencias distribuidas.
