# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — CATÁLOGO OFICIAL DE KPIs ESTRATÉGICOS
# ============================================================================

## Catálogo de Indicadores Clave de Rendimiento (Fase 19)

### 1. Dimensión: EXPERIENCE
- **Exploraciones Significativas (`kpi-exp-explorations`)**:
  - *Fórmula*: `count(destination_view where duration >= 30s)`
  - *Fuente*: `analytics_events` &middot; *Periodo*: 30 días &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Planes de Viaje Generados (`kpi-exp-trip-plans`)**:
  - *Fórmula*: `count(active_trips)`
  - *Fuente*: `active_trips` &middot; *Periodo*: 30 días &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Recorridos vía Smart Points (`kpi-exp-qr-journeys`)**:
  - *Fórmula*: `count(smart_point_scans)`
  - *Fuente*: `smart_points` &middot; *Periodo*: 30 días &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED

### 2. Dimensión: MARKETPLACE
- **Negocios Locales Activos (`kpi-mkt-active-biz`)**:
  - *Fórmula*: `count(businesses where status == 'active')`
  - *Fuente*: `businesses` &middot; *Periodo*: Al corte &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Negocios con Verificación de Confianza (`kpi-mkt-verified-biz`)**:
  - *Fórmula*: `count(businesses where trust_badge != null)`
  - *Fuente*: `verifications` &middot; *Periodo*: Al corte &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Tasa de Respuesta de Anfitriones (`kpi-mkt-response-rate`)**:
  - *Fórmula*: `avg(responded / received) * 100`
  - *Fuente*: `reservation_requests` &middot; *Periodo*: 30 días &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED

### 3. Dimensión: TERRITORY
- **Destinos Documentados (`kpi-ter-dest-coverage`)**:
  - *Fórmula*: `count(destinations where is_published == true)`
  - *Fuente*: `destinations` &middot; *Periodo*: Al corte &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Nodos Smart Points en Operación (`kpi-ter-smartpoint-coverage`)**:
  - *Fórmula*: `count(smart_points where status == 'ACTIVE')`
  - *Fuente*: `smart_points` &middot; *Periodo*: Al corte &middot; *Cadencia*: Horaria &middot; *Estado*: VALIDATED

### 4. Dimensión: SUSTAINABILITY & TRUST
- **Recursos Evaluados bajo Marco BRTI (`kpi-sus-assessed-resources`)**:
  - *Fórmula*: `count(sustainability_assessments)`
  - *Fuente*: `sustainability_assessments` &middot; *Periodo*: 90 días &middot; *Cadencia*: Semanal &middot; *Estado*: VALIDATED
- **Cobertura de Verificación de Confianza (`kpi-tru-verified-coverage`)**:
  - *Fórmula*: `(count(verified_places) / count(places)) * 100`
  - *Fuente*: `verifications` &middot; *Periodo*: Al corte &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED
- **Verificaciones por Renovar (`kpi-tru-stale-verifications`)**:
  - *Fórmula*: `count(verifications where days > 180)`
  - *Fuente*: `trust_audits` &middot; *Periodo*: Al corte &middot; *Cadencia*: Diaria &middot; *Estado*: VALIDATED

### 5. Dimensión: OPERATIONS & PLATFORM
- **Incidentes Operativos Activos (`kpi-ops-open-incidents`)**:
  - *Fórmula*: `count(incidents where status in ['OPEN', 'INVESTIGATING'])`
  - *Fuente*: `incidents` &middot; *Periodo*: Tiempo real &middot; *Cadencia*: Tiempo real &middot; *Estado*: VALIDATED
- **Disponibilidad del Ecosistema (`kpi-plt-health-score`)**:
  - *Fórmula*: `avg(uptime_percentage across critical microservices)`
  - *Fuente*: `platform_config` &middot; *Periodo*: 30 días &middot; *Cadencia*: Horaria &middot; *Estado*: VALIDATED
