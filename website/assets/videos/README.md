# BAQUEANO — Registro de activos audiovisuales

## 🎯 POR QUÉ

Este directorio conserva las fuentes audiovisuales oficiales del portal. Cada video se asigna a un espacio editorial fijo para evitar cambios inesperados, dependencias externas o rotaciones automáticas.

## ⚙️ CÓMO

`js/video-registry.js` relaciona cada elemento `data-baqueano-video-slot` con este catálogo local. El documento público `app_config/site_videos` puede sustituir una fuente solamente cuando el Ops Center publica una configuración nueva.

La portada carga su fuente de forma prioritaria. Los videos secundarios cargan metadatos y se reproducen únicamente al entrar en el viewport. Cuando el usuario prefiere movimiento reducido, permanece visible el póster.

## 📦 QUÉ

| Slot / uso | Temática | Fuente local |
| :--- | :--- | :--- |
| `indexHero` | Vistas aéreas panorámicas de Nicaragua | `video nicaragua.mp4` · 2244×1586 · 30 fps |
| `destinationsFeature` | Lagos, volcanes, costas y reservas | `destinos.mp4` · 848×478 · 24 fps |
| `cultureMusic` | Música, danza e identidad cultural | `video.mp4` · 848×478 · 30 fps |
| `cultureGastronomy` | Fuego campesino, maíz y cocina ancestral | `gastronomia.mp4` · 848×478 · 24 fps |
| `cultureHistory` | Ciudades, memoria y paisajes históricos | `historia.mp4` · 848×478 · 24 fps |
| Reserva territorial | Material disponible para futura asignación | `video 2.mp4` · 478×850 · 30 fps |

## Estándares técnicos y de gobernanza

- Formato recomendado: MP4 H.264 o H.265 con póster optimizado.
- Calidad requerida para reemplazos principales: 3840×2160 o, como mínimo, 1920×1080 con alta tasa de bits.
- Los clips de 848×478 actuales son aptos únicamente para tarjetas pequeñas; deben sustituirse desde Ops Center para cumplir UHD real.
- La web entrega el archivo fuente original; no reduce ni sustituye su resolución.
- Los slots permanecen fijos hasta una publicación explícita del Ops Center.
- La configuración se registra con `locked: true`, `status: published` y auditoría administrativa.
- Reproducción: `muted`, `loop` y `playsinline`; pausa automática fuera del viewport.
