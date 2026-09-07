# LEGACY WEB PLAN

## Why

La web estatica anterior puede tener URLs, assets o valor SEO que no deben borrarse de golpe.

## How

Clasificar antes de retirar y preparar redirects cuando exista dominio real.

## What

| Area | Clasificacion | Accion |
|---|---|---|
| `index.html` legacy | Mantener temporal | Comparar con Next home antes de retiro |
| `destinos.html` legacy | Migrar | Mapear a `/destinos` |
| `admin.html` legacy | Reemplazar | Control Center Next tras Auth/RBAC |
| Assets compartidos | Mantener | Reusar hasta confirmar duplicados |
| JS legacy | Retirar gradualmente | Auditar dependencias por pagina |
| SEO URLs | Migrar | Preparar 301 cuando dominio exista |
