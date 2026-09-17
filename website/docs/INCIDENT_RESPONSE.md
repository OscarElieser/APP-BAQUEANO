# INCIDENT RESPONSE

## Why

BAQUEANO necesita fallar de forma controlada y recuperable.

## How

Seguir el ciclo: Detectar, Contener, Investigar, Corregir, Restaurar, Documentar.

## What

| Severidad | Ejemplos | Accion |
|---|---|---|
| P0 Critical | Auth bypass, data loss, admin expuesto, sitio caido | Rollback o contencion inmediata |
| P1 High | Login roto, publicar roto, 5xx alto, AI rompe flujo principal | Hotfix antes de ampliar lanzamiento |
| P2 Medium | Bug visual, contenido incorrecto no critico | Backlog priorizado |
| P3 Low | Mejora menor | Planificar |

Cada incidente debe registrarse en `INCIDENT_LOG.md` sin secretos ni datos personales innecesarios.
