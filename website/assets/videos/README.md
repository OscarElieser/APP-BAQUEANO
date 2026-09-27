# BAQUEANO — Registro de activos audiovisuales

## 🎯 POR QUÉ

Este directorio conserva las fuentes audiovisuales oficiales del portal. Cada video se asigna a un espacio editorial fijo para evitar cambios inesperados, dependencias externas o rotaciones automáticas.

## ⚙️ CÓMO

`js/video-registry.js` relaciona cada elemento `data-baqueano-video-slot` con este catálogo local. El documento público `app_config/site_videos` puede sustituir una fuente solamente cuando el Ops Center publica una configuración nueva.

La portada carga su fuente de forma prioritaria. Los videos secundarios cargan metadatos y se reproducen únicamente al entrar en el viewport. Cuando el usuario prefiere movimiento reducido, permanece visible el póster.

## 📦 QUÉ

| Slot / uso | Temática | Fuente local |
| :--- | :--- | :--- |
| `indexHero` | Vistas aéreas panorámicas de Nicaragua | `assets/videos/video nicaragua.mp4` |
| `destinationsFeature` | Lagos, volcanes, costas y reservas | `assets/videos/destinos.mp4` |
| `cultureMusic` | Música, danza e identidad cultural | `assets/videos/video.mp4` |
| `cultureGastronomy` | Fuego campesino, maíz y cocina ancestral | `assets/videos/gastronomia.mp4` |
| `cultureHistory` | Ciudades, memoria y paisajes históricos | `assets/videos/historia.mp4` |
| Reserva territorial | Material disponible para futura asignación | `assets/videos/video 2.mp4` |

## Estándares técnicos y de gobernanza

- Formato recomendado: MP4 H.264 o H.265 con póster optimizado.
- Calidad recomendada para nuevas cargas: 2160p o 1080p con alta tasa de bits.
- La web entrega el archivo fuente original; no reduce ni sustituye su resolución.
- Los slots permanecen fijos hasta una publicación explícita del Ops Center.
- La configuración se registra con `locked: true`, `status: published` y auditoría administrativa.
- Reproducción: `muted`, `loop` y `playsinline`; pausa automática fuera del viewport.
