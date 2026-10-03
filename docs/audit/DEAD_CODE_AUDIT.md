# 🧹 BAQUEANO — Auditoría de código sin uso aparente (Fase 1)

## 🎯 POR QUÉ

Identificar candidatos a consolidación **sin borrar nada**, siguiendo la regla: MEJORAR > REUTILIZAR > REFACTORIZAR > INTEGRAR antes que BORRAR.

## ⚙️ CÓMO

Script Node que busca el nombre de cada archivo de `website/js` y `website/css` en todas las páginas HTML, en todos los scripts (incluidas inyecciones dinámicas de `global-injector.js` y `navigation.js`) y en `service-worker.js`.

**Limitación:** un archivo cargado mediante un nombre construido por partes (`'js/' + x`) aparecería como falso positivo. Cada candidato debe verificarse en navegador (pestaña Network) antes de cualquier decisión.

## 📦 QUÉ

### JavaScript sin referencia estática (28)

| Archivo | Observación / posible valor a integrar |
| --- | --- |
| `baqui-evolved.js` (42 KB), `baqueano-ai.js`, `ai-assistant.js` | Versiones BAQUI. Integrar lo mejor en el asistente activo (`baqueano-assistant.js`) |
| `supabase-config.js` | **Necesario**: debe activarse cuando se integre Supabase con token Firebase |
| `baqueano-traffic-tracker.js` | Telemetría a Supabase (`traffic_sessions`); activar solo tras corregir RLS y consentimiento de cookies |
| `route-builder.js` (68 KB) | Constructor de rutas: candidato fuerte para "Mi Viaje"/mapa |
| `smart-search.js` | Base para el buscador global |
| `baqueano-3d-map.js`, `nicaragua-real-map.js`, `territory-inspector.js` | Mapas alternativos; comparar con `baqueano-map.js` |
| `tourism-catalog-expansion.js`, `website-business-catalog.js`, `website-operations-catalog.js`, `sonora-data.js`, `destinos-gastronomia.js` | **Datos** turísticos: fuente para la migración a Supabase. No borrar |
| `index-features.js` (62 KB), `definitive-index-interactions.js`, `hero-experience.js` | Generaciones previas del index |
| `epic-music-player.js` | Reproductor alternativo (hay otros 4 reproductores) |
| `environmental.js`, `safety-gallery.js`, `panorama-viewer.js`, `color-gallery.js`, `calculator.js`, `legal-scrollspy.js`, `baqueano-reels.js` | Componentes sueltos |
| `demo-hackathon-tour.js`, `destinos-provenance.js` | Solo referenciados en el Service Worker (precache sin uso) |

### CSS sin referencia estática (13)

`baqueano-3d.css`, `baqueano-ai.css`, `baqui-evolved.css`, `colors.css`, `hero-editorial.css`, `images.css`, `menu-control.css`, `ops-center.css`, `responsive-ecosystem.css`, `theme-colors.css`, `theme-master.css`, `typography.css`; `mobile-first-core.css` solo en el Service Worker.

> `colors.css`, `theme-master.css` y `typography.css` contienen la paleta oficial: **son la semilla natural del Design System**, no código muerto.

### Duplicaciones funcionales

| Dominio | Implementaciones |
| --- | --- |
| Asistente IA | 5 scripts web + Functions + Genkit + Edge Function + Dart |
| Reproductor de audio | `audio-player.js`, `musica-player.js`, `persistent-audio-player.js`, `global-music-player.js`, `epic-music-player.js` |
| Mapas | `baqueano-map.js`, `baqueano-3d-map.js`, `nicaragua-real-map.js`, `madriz-territory-map.js` |
| Panel administrativo | `website/admin.html`, `website/apps/admin` (Next.js), `admin/` (Flutter) |
| Variantes CSS | 18 pares `pagina.css` / `pagina-exact.css` |
| Scripts de parche únicos | ~20 en `website/scripts/` (`update-*.js`, `apply-*.js`, `move-*.js`) que reescribieron HTML una vez |

### Otros

- `website/i18n-test.html` publicada en producción.
- 3 archivos con la palabra prohibida por AGENTS.md: `lib/features/home/widgets/advertise_business_section.dart`, `lib/features/profile/screens/profile_screen.dart`, `supabase/migrations/012_comprehensive_cultural_and_ops_schema.sql` (la migración aplicada no debe editarse; documentar).

### Procedimiento antes de cualquier consolidación

1. Verificar en navegador (Network) que el archivo no se carga.
2. Extraer datos/funciones valiosas e integrarlas.
3. Mover a `website/legacy/` con nota de origen (no borrar), en commit separado.
4. Ejecutar pruebas de humo y capturas.
