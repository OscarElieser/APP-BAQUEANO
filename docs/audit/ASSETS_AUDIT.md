# 🖼️ BAQUEANO — Auditoría de recursos (Fase 1)

## 🎯 POR QUÉ

Los recursos multimedia definen la identidad visual pero también el peso del repositorio (852 MB en `.git`) y del sitio.

## ⚙️ CÓMO

`du`, `find -size`, `git ls-files` y verificación HTTP de recursos referenciados.

## 📦 QUÉ

| Ubicación | Tamaño en disco | Archivos | Nota |
| --- | --- | --- | --- |
| `website/assets` | 837 MB | 509 (507 versionados) | Incluye videos no versionados (`assets/videos/` en `.gitignore`) |
| `assets` (Flutter) | 149 MB | 115 versionados | Declarados en `pubspec.yaml` |
| `.snapshots` | 336 MB | 3.154 versionados | Perfiles de navegador (P0) + 8 PNG de evidencia |
| `.git` | 852 MB | — | Inflado por perfiles y binarios históricos |

### Hallazgos

| ID | Prioridad | Hallazgo |
| --- | --- | --- |
| AS-P1-01 | P1 | Videos referenciados (`video nicaragua.mp4`, `destinos.mp4`, `gastronomia.mp4`, `historia.mp4`, `video.mp4`) **no están en producción** (404). Existen en local (p. ej. `video nicaragua.mp4` = 44 MB). |
| AS-P1-02 | P1 | `assets/images/baqui.png` no existe (404). Probablemente renombrada; buscar la imagen correcta de BAQUI en `assets/images/`. |
| AS-P2-01 | P2 | 30 imágenes > 1 MB y solo 6 WebP/AVIF. Generar variantes AVIF/WebP + `srcset` **conservando los originales**. |
| AS-P2-02 | P2 | Copias con sufijo `(1)`, `[preview]` y `20260925_*.mp4` ya excluidas del despliegue en `firebase.json` y `build-hostinger-static.mjs`; mantener excluidas y documentar origen antes de cualquier consolidación. |
| AS-P2-03 | P2 | `website/assets/baqueanonicaragua.apk` versionado (excepción en `.gitignore`): un APK en Git infla el historial; preferir GitHub Releases o Firebase Storage `android/releases/`. |
| AS-P3-01 | P3 | Nombres con espacios y mayúsculas (`Mesa de trabajo 1.webp`, `BAQUENO LOGO.png`, `NICARAGUA AUTENTICA.png`) → obligan a `%20` y causan errores. Crear alias sin espacios manteniendo los originales. |

### Estrategia de videos (sin perder originales)

1. Conservar los originales fuera de Git (disco + respaldo).
2. Generar versiones web (`ffmpeg -crf 28 -vf scale=-2:720 -movflags +faststart`, objetivo < 5 MB) y póster AVIF.
3. Publicarlas en Supabase Storage (`baqueano-media`, una vez corregidas sus políticas) o en Azure/Nginx; referenciarlas desde `video-registry.js`.
