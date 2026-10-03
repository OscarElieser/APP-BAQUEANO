# 🎨 BAQUEANO — Auditoría Frontend Website (Fase 1)

## 🎯 POR QUÉ

El Website es la cara pública ante turistas y jurado. Antes de rediseñar o consolidar, hay que saber qué páginas, estilos y scripts existen, cuáles se cargan y cuáles generan deuda.

## ⚙️ CÓMO

Análisis estático de `website/*.html`, `website/css/**`, `website/js/**` y métricas con `grep`/Node. Referencias cruzadas HTML ↔ JS ↔ `global-injector.js` ↔ `navigation.js`.

## 📦 QUÉ

### Páginas (30)

| Grupo | Páginas |
| --- | --- |
| Núcleo turístico | `index` (86 KB), `destinos`, `destino`, `departamento` (73 KB, 16 scripts), `mapa`, `experiencias`, `gastronomia`, `historia`, `musica`, `ambiental`, `cronicas` |
| Usuario | `perfil`, `mi-viaje`, `favoritos` (2,6 KB, mínima), `mi-negocio` (81 KB) |
| BAQUI | `baqueano-ia` (60 KB), `baqueano-ai` (8 KB, destino de redirect `/baqueano-ai`) — **dos páginas para lo mismo** |
| Institucional/legal | `nosotros`, `aliados`, `denuncias`, `ayuda`, `legal`, `terminos`, `privacidad`, `cookies`, `aviso-legal` |
| Sistema | `404`, `offline`, `admin` (Ops Center, 109 KB), `i18n-test` (página de prueba publicada) |

Inconsistencia de `lang`: 22 páginas usan `es`, 8 usan `es-NI` (el motor i18n lo corrige en tiempo de ejecución).

### CSS

| Métrica | Valor | Lectura |
| --- | --- | --- |
| Hojas | 30 en `css/` + 41 en `css/pages/` + `styles.css` (254 KB) + `nicaragua-branding.css` raíz (78 KB) | Dispersión alta |
| `!important` | **4.423** | Guerra de especificidad; cada cambio rompe otra página |
| Colores hex | 4.141 usos, **388 distintos** | Sin tokens efectivos; la paleta oficial solo vive en `variables.css`, `colors.css`, `theme-master.css` |
| Breakpoints | 75 variantes de `@media` | Sin escala común |
| Variantes "-exact" | 18 hojas `*-exact.css` paralelas a su versión base | Capas de parches sucesivos |
| Sin referencia estática | 13 hojas (ver DEAD_CODE_AUDIT) | Candidatas a revisión, **no borrar** |

### JavaScript

| Métrica | Valor | Lectura |
| --- | --- | --- |
| Scripts | 68 + 3 en `ops-center/` | Todos scripts clásicos, **0 ES Modules** |
| Globales `window.X =` | 92 distintos | Acoplamiento implícito |
| `addEventListener` / `removeEventListener` | 514 / 3 | Riesgo de fugas en componentes reinyectados |
| `setInterval` / `clearInterval` | 12 / 8 | 4 intervalos sin limpieza |
| `innerHTML =` | 264 | Riesgo XSS (ver SECURITY_AUDIT) |
| Sin referencia estática | 28 scripts (ver DEAD_CODE_AUDIT) | Incluye 4 de los 5 scripts BAQUI |
| Mayores | `territories-data.js` 111 KB, `firestore-realtime.js` 91 KB, `baqueano-assistant.js` 86 KB, `madriz-experience.js` 82 KB, `navigation.js` 69 KB, `route-builder.js` 68 KB (sin referencia), `global-injector.js` 63 KB, `theme-switcher.js` 59 KB |

Carga transversal: `global-injector.js` (29 páginas) y `navigation.js` (28) inyectan CSS, `global-language.js`, `platform-enhancements.js`, `global-music-player.js` y `user-session.js` dinámicamente.

### Hallazgos

| ID | Prioridad | Hallazgo |
| --- | --- | --- |
| FE-P1-01 | P1 | **Todos los videos** (`video nicaragua.mp4`, `destinos.mp4`, `gastronomia.mp4`, `historia.mp4`, `video.mp4`) devuelven **404 en producción**. `website/assets/videos/` está en `.gitignore`. El hero cae al póster. |
| FE-P1-02 | P1 | `assets/images/baqui.png` referenciada en `index.html` no existe (404 en producción). |
| FE-P1-03 | P1 | El cliente Supabase web (`supabase-config.js`) no se carga y la librería `supabase-js` no está incluida en ninguna página: favoritos, viajes, perfil y telemetría hacia Supabase nunca se ejecutan. |
| FE-P2-01 | P2 | Deuda CSS (4.423 `!important`, 388 colores). Consolidar en tokens progresivamente, página por página, con capturas antes/después. |
| FE-P2-02 | P2 | Dos páginas BAQUI (`baqueano-ia.html`, `baqueano-ai.html`) y `i18n-test.html` publicada. |
| FE-P2-03 | P2 | `nicaragua-branding.css` vive en la raíz del repo, fuera del sitio desplegado: verificar si alguna página la espera. |
| FE-P3-01 | P3 | Navegación: los ítems actuales no siguen la prioridad pedida (Inicio, Explorar, Destinos, Mapa, Experiencias, Cultura, BAQUI, Mi Viaje, Mi Negocio + Buscador/Idioma/Perfil/SOS). Ver `navigation.js` y `navigation-mega.css`. |

### Monorepo Next.js (`website/apps`)

Existe un `web` y un `admin` en Next.js 15 + Tailwind con paquetes compartidos (`design-system`, `ui`, `firebase`, `validators`, `ai-core`). **No está desplegado ni enlazado.** Decisión recomendada: congelarlo como "laboratorio" documentado; no invertir en él antes del Hackathon. No borrar.
