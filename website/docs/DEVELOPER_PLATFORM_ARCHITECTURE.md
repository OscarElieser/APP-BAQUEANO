# ARQUITECTURA GENERAL DE LA PLATAFORMA PARA DESARROLLADORES (DEVELOPER PLATFORM)

## 1. Topología del Ecosistema Abierto

```
                      [CONSUMIDORES EXTERNOS]
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
[DESARROLLADORES]           [INVESTIGADORES]          [ALIADOS / CANALES]
(Apps cívicas / GIS)       (Universidades / ONGs)    (Cámaras / Municipios)
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 ▼
                     [EDGE API GATEWAY / CDN]
           (Rate Limiting, Scopes, Auth Header, SSG Cache)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
  [/api/open/v1/*]          [/api/v1/*]               [WEBHOOKS]
  (Datos Públicos /        (Partner Auth con          (Notificaciones
   Sin credenciales)        x-api-key)                 firmadas HMAC)
                                 │
                                 ▼
                     [DATA PROJECTION & DTOs]
                 (Sanitización, Exclusión de PII)
                                 │
                                 ▼
                    [BAQUEANO CORE FIRESTORE]
```

---

## 2. Niveles de Acceso y Autenticación

1. **Nivel Público (Open Data API - `/api/open/v1/*`)**:
   - Sin autenticación requerida.
   - Limitación de tasa por IP: 120 peticiones / minuto.
   - Formatos: JSON, GeoJSON (RFC 7946) y CSV.
2. **Nivel Aliado (Partner API - `/api/v1/*`)**:
   - Autenticación obligatoria mediante cabecera `x-api-key: bq_live_...`.
   - Control de scopes granulares (`places.submit`, `businesses.partner.read`).
3. **Nivel Investigación (Research Access)**:
   - Proyectos aprobados por el comité científico.
   - Datos de telemetría y aforo agregados con K-anonymity garantizado.
