# ⚡ BAQUEANO — Auditoría de rendimiento (Fase 1)

## 🎯 POR QUÉ

Objetivos: Lighthouse Performance ≥ 90; LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1, en conexiones rurales nicaragüenses (3G lento, intermitencia).

## ⚙️ CÓMO

Medición de HTML en producción con `curl`, pesos de recursos referenciados por `index.html`, análisis de CSS/JS y del Service Worker. **Pendiente:** Lighthouse real (línea base en el primer lote).

## 📦 QUÉ

### Medido

| Recurso | Valor |
| --- | --- |
| HTML `index.html` en producción | 81 KB (TTFB 0,32 s) |
| HTML `departamento.html` | 73 KB, 16 scripts |
| Imágenes/medios referenciados por index | **≈ 5,5 MB** (excluyendo videos que dan 404) |
| Logo `assets/logos/BAQUENO LOGO.png` | **4,7 MB** |
| `NICARAGUA AUTENTICA.png` | 1,4 MB |
| Póster del hero `isla_de_ometepe.jpg` (probable LCP) | 723 KB, JPEG |
| CSS en index | 15 hojas `<link>` + inyectadas por JS |
| `styles.css` | 254 KB |
| Imágenes > 1 MB en `website/assets` | 30 · solo 6 WebP/AVIF |
| Archivos > 5 MB en `website/assets` | 31 |

### Hallazgos

| ID | Prioridad | Hallazgo |
| --- | --- | --- |
| PERF-P2-01 | P2 | Logo de 4,7 MB y PNG de 1,4 MB en la portada: los recursos más pesados no son contenido. |
| PERF-P2-02 | P2 | Póster LCP en JPEG de 723 KB sin `srcset`/AVIF/WebP ni `fetchpriority="high"`. |
| PERF-P2-03 | P2 | 0 imágenes con `width`/`height` → riesgo CLS. |
| PERF-P2-04 | P2 | Cascada de CSS: 15 hojas en `<head>` + inyección dinámica tras ejecutar JS (FOUC y bloqueo de render). |
| PERF-P2-05 | P2 | 68 scripts clásicos sin `type="module"`; scripts de 60-110 KB en rutas críticas (`territories-data.js`, `navigation.js`, `global-injector.js`). |
| PERF-P2-06 | P2 | `Cache-Control: no-cache` para todos los JS/CSS (`firebase.json`): revalidación en cada visita. Con nombres versionados (`?v=`) se puede usar `max-age=31536000, immutable`. |
| PERF-P2-07 | P2 | Videos de 44 MB en local (cuando se publiquen deben comprimirse a < 5 MB, 720p, H.264/AV1, con `preload="none"` en móvil y póster). |
| PERF-P3-01 | P3 | Service Worker `baqueano-offline-v14` con precache; revisar que no precachee medios pesados ni respuestas autenticadas. |

### Conectividad rural (pendiente de diseñar)

Modo "bajo consumo": detectar `navigator.connection.saveData`/`effectiveType` → sin video, imágenes 480 px, sin mapas 3D; reintentos con backoff y `AbortController` con timeout en `fetch`.

### Android ✅

`flutter analyze` limpio; reglas AGENTS.md (`RepaintBoundary`, `cacheWidth`) documentadas en README. Sin medición de frames en esta fase.
