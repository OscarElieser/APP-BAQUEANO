# PERFORMANCE BUDGET

## Why

BAQUEANO sera usado en condiciones moviles y de conectividad variable. El sitio debe ser rapido aun con imagenes turisticas ricas.

## How

Medir con build de produccion, Lighthouse/Web Vitals y pruebas reales cuando exista URL. No inventar puntajes.

## What

| Metrica | Objetivo | Estado |
|---|---:|---:|
| LCP movil | < 2.5 s aspiracional | PENDIENTE medicion real |
| CLS | < 0.1 | PENDIENTE medicion real |
| INP | < 200 ms | PENDIENTE medicion real |
| JS inicial web | Revisar por ruta | PENDIENTE bundle analysis |
| Imagen hero | AVIF/WebP cuando aplique | PARCIAL |
| Admin | Sin 404 en sidebar | PENDIENTE smoke completo |

Acciones actuales: formatos AVIF/WebP habilitados en `apps/web/next.config.mjs`; visual audit local existente para 70 combinaciones ruta/ancho.
