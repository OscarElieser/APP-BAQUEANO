# COST MONITORING

## Why

Firestore, Storage, Maps e IA pueden generar costos variables durante el lanzamiento.

## How

Configurar presupuestos, cuotas y alertas en los proveedores antes de abrir trafico real.

## What

| Servicio | Riesgo | Control | Estado |
|---|---|---|---:|
| Firestore | Lecturas repetidas/listeners | Paginacion, cache, indices | PARCIAL |
| Storage | Imagenes pesadas | Variantes WebP/AVIF y limites | PENDIENTE |
| AI Gateway | Solicitudes largas/abuso | Rate limit, timeout, max payload | PENDIENTE |
| Maps | Carga innecesaria | Dynamic import, quotas, referrer restrictions | PENDIENTE |
| Hosting/CDN | Trafico y cache | Cache publico, no cache admin | PENDIENTE |
