# 🧭 API PLATFORM — PLATAFORMA DE APIS V1 PARA ALIADOS & TERCEROS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proveer una capa segura, estandarizada y versionada para que instituciones, aplicaciones aliadas y operadores turísticos consuman datos de Baqueano sin exponer directamente la base de datos Firestore ni comprometer la privacidad de exploradores y anfitriones.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA DE API GATEWAY, AUTENTICACIÓN & RATE LIMITING)

```text
[Cliente Externo / Aliado Institucional]
                   │
                   ▼
  [GET /api/v1/places | /api/v1/territories]
                   │
                   ▼
      [Header: x-api-key Verification]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
  [Key Hash Lookup]   [Scope Check]
         │                   │
         └─────────┬─────────┘
                   ▼
       [Rate Limit Enforcement]
                   │
                   ▼
    [Domain Service Execution]
                   │
                   ▼
 [Structured JSON Output + Cache Headers]
```

### Principios de Seguridad de APIs:
1. **Nunca claves maestras**: Cada aliado recibe una credencial con prefijo (`bq_live_...`), scopes limitados y tasa máxima configurable.
2. **Rate Limiting**: Control de solicitudes por minuto (60 a 120 req/min) con encabezados RFC estándar (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
3. **Cero PII expuesta**: Los endpoints públicos y de aliados solo transmiten datos verificados de catálogo y estado territorial.

---

## 📦 3. QUÉ (WHAT / CATÁLOGO DE ENDPOINTS V1)

| Endpoint | Método | Scopes Requeridos | Descripción |
| --- | :---: | --- | --- |
| `/api/v1/places` | `GET` | `places.read` | Catálogo de destinos verificados con filtros por departamento y categoría. |
| `/api/v1/territories` | `GET` | `territories.read` | Estado operacional y alertas de los 17 territorios nacionales. |
| `/api/v1/alerts` | `GET` | `alerts.read` | Avisos tempranos activos y recomendaciones de seguridad. |
