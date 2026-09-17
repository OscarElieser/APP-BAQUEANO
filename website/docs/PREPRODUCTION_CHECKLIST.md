# PREPRODUCTION CHECKLIST

## Why

Preproduccion debe demostrar que el sistema es seguro antes de go-live.

## How

No marcar nada como aprobado sin evidencia.

## What

| Item | Estado | Evidencia |
|---|---:|---|
| Secrets | PARCIAL | Plantillas sin secretos; requiere secret manager |
| Firebase rules | PARCIAL | Reglas leidas, sin emulator tests |
| Auth | PENDIENTE | Login real no verificado |
| RBAC | PENDIENTE | Claims no verificados |
| Storage | PARCIAL | Rules leidas, uploads no probados |
| Firestore | PARCIAL | Servicios listos, sin lectura viva |
| AI | PENDIENTE | Endpoint 501 |
| Maps | PENDIENTE | Conceptual |
| SEO | PARCIAL | Metadata base, robots y sitemap existentes |
| Accessibility | PARCIAL | Requiere auditoria manual/automatizada completa |
| Responsive | PARCIAL | Visual audit local parcial |
| Performance | PENDIENTE | Sin Lighthouse real |
| E2E | PENDIENTE | Sin escenarios completos |
| Backup | PENDIENTE | Plan creado, no ejecutado |
| Rollback | PARCIAL | Estrategia documentada |
| Monitoring | PARCIAL | Health check local agregado |
