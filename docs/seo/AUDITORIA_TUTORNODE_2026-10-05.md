# Auditoría SEO: "Login - TutorNode" en Google

> 🎯 **POR QUÉ:** Google muestra "Login - TutorNode · Correo Electrónico · Contraseña · Crear una ahora" para baqueanonicaragua.com. Hay que encontrar la causa real antes de tocar nada.
> ⚙️ **CÓMO:** búsqueda en todo el repositorio y su historial de git, descarga del sitio en vivo como Googlebot, inspección del servidor (Azure/nginx, certificado, cabeceras Host), historial público del dominio (RDAP y Wayback Machine) y análisis del build que se publica.
> 📦 **QUÉ:** diagnóstico, cambios propuestos, archivos, riesgos y pruebas. **No se modificó ningún archivo del sitio. No hubo commit, push ni deploy.**

Fecha de la auditoría: 2026-10-05.

## 1. Referencias a TutorNode

| Dónde se buscó | Resultado |
|---|---|
| Todo el repositorio (HTML, JS, JSON, manifest, service worker, sitemap, robots, firebase.json, nginx de `azure/`, build `dist-hostinger/`) | **0** (la única mención es la bitácora de esta solicitud) |
| Historial de git, todas las ramas (`git log --all -S TutorNode`) | **0 commits** |
| Textos del fragmento ("Crear una ahora", "Correo Electrónico" del login) | **0** en el código de BAQUEANO |
| Sitio en vivo con user-agent de Googlebot: `/`, `www`, `http`, `/index.html`, `/login`, `/login.html`, `/auth/login`, `/register` | 0. Las rutas de login responden **404 con la marca BAQUEANO** |
| Servidor Azure `20.80.81.65` con `Host` desconocido o `tutornode.com` | 301 hacia `https://baqueanonicaragua.com/`. El certificado solo cubre `baqueanonicaragua.com` y `www` |
| Firebase Hosting (`app-baqueano.web.app`) | 0 |

**Conclusión:** TutorNode no existe ni existió en el código de BAQUEANO, y hoy el dominio no sirve nada de TutorNode. TutorNode es un proyecto abierto de terceros: [marianakibuuka/TutorNode](https://github.com/marianakibuuka/TutorNode) (marketplace de tutorías).

## 2. Causa del resultado de Google

**Evidencia:**

| Fuente | Dato |
|---|---|
| RDAP Verisign | Dominio registrado el **2026-09-30 23:08 UTC**; última modificación el 2026-10-01 17:25 UTC |
| Wayback Machine | Dos capturas, 2026-10-01 09:57 y 17:18 UTC: **"Parked Domain name on Hostinger DNS system"** |
| Bitácora | La VM de Azure (`vm-baqueano-prod`) se creó el 2026-10-02; primero se configuró a mano y luego con `azure/` (migrate-from-manual.sh) |
| `/health.json` en vivo | Release `56bd236`, desplegada el 2026-10-05 00:27 UTC |

**Diagnóstico:** el dominio tiene 5 días. Entre que el registro A pasó a apuntar a un servidor web (1–2 oct) y que nginx quedó configurado solo para BAQUEANO, Google rastreó `baqueanonicaragua.com` y recibió **un login de TutorNode servido por otro servidor o por otra configuración en esa IP**. Las causas más probables, en orden:

1. **IP pública reutilizada de Azure:** el A apuntó a una IP que en ese momento usaba otra máquina con TutorNode, o la VM estuvo un tiempo con otra IP.
2. **Configuración inicial de la VM** (antes de `azure/`): un sitio por defecto respondiendo a cualquier `Host`.

Google guardó ese título y ese fragmento y **todavía no volvió a rastrear**. Un dominio nuevo, sin sitemap enviado ni propiedad verificada hasta hoy, se rastrea con poca frecuencia.

**Factor que lo agrava (hallazgo real del sitio):** la release en vivo (`56bd236`) declara `<link rel="canonical" href="https://app-baqueano.web.app/">` y su `og:image` apunta a `web.app`. Le está diciendo a Google que `baqueanonicaragua.com` es un duplicado de `app-baqueano.web.app`, así que Google no tiene motivo para refrescar el dominio como página principal. El build actual de `main` ya corrige esto (canonical = `https://baqueanonicaragua.com/`), pero **no está desplegado**.

**Para confirmarlo al 100 %:** en Search Console, Inspección de URL de la URL exacta que muestra el resultado (y "Ver página rastreada") da la fecha y el HTML que Google recibió. Pasame esa URL o una captura de esa pantalla.

Lo descartado:

| Hipótesis | Estado |
|---|---|
| Página de login de BAQUEANO indexada | Descartada: no existe `login.html` (el acceso es un panel dentro de las páginas) |
| Title o description antiguos en el código | Descartado |
| Service worker | Descartado: `baqueano-offline-v14` solo precachea archivos de BAQUEANO, y Googlebot no ejecuta service workers |
| Sitemap con URLs ajenas | Descartado: 23 URLs, todas de BAQUEANO |
| Duplicidad entre `/` e `/index.html` | No causa el problema; se resuelve con el canonical del build nuevo |
| Firebase Hosting viejo | Descartado: no tiene TutorNode |

## 3. Estado actual del SEO del build (`dist-hostinger/`, lo que publica `azure/deploy.sh`)

| Elemento | Estado en el build | Estado en vivo (`56bd236`) |
|---|---|---|
| Canonical único por página | ✅ 28 páginas | ❌ canonical a `app-baqueano.web.app` |
| Open Graph (7 propiedades) | ✅ | Parcial (dominio `web.app`) |
| Twitter Cards (4) | ✅ | ❌ |
| JSON-LD | ✅ WebSite + Organization (inicio); WebPage + BreadcrumbList (resto) | ❌ |
| Un solo H1 por página pública | ✅ (admin.html tiene 37 H1, pero es noindex) | — |
| Sitemap | ✅ 23 URLs públicas con `lastmod`; excluye admin, perfil, favoritos, mi-viaje y offline | — |
| robots.txt | ✅ bloquea admin, scripts, docs, api y logs; permite CSS, JS y assets; declara el sitemap | — |
| `GovernmentOrganization` | ✅ no se usa | — |
| Manifest y favicon | ✅ "Baqueano Nicaragua"; favicon 200 | ✅ |
| 404 | ✅ marca BAQUEANO, sin TutorNode | ✅ |

## 4. Cambios propuestos (pendientes de tu autorización)

| # | Cambio | Archivo(s) | Motivo |
|---|---|---|---|
| P1 | **Desplegar el build actual** en Azure (y en Firebase como respaldo) | `azure/deploy.sh` en la VM; `firebase deploy --only hosting` | Corrige el canonical a `web.app`, que es lo más urgente |
| P2 | Titles y descriptions exactos de tu brief para: inicio, nosotros, destinos, gastronomía, historia, música, mapa, BAQUI (`baqueano-ia.html`) y mi-negocio | Esos 9 `.html` (`<title>`, `meta description`) + claves `meta.*` en los 6 idiomas | Marca y posicionamiento |
| P3 | `noindex,follow` en páginas personales: `perfil.html`, `favoritos.html`, `mi-viaje.html` | 3 `.html` | Páginas de cuenta, no deben posicionarse (equivalen al "login") |
| P4 | JSON-LD de inicio: agregar `TouristInformationCenter` (nombre, url, descripción, eslogan, `areaServed` Nicaragua) junto a WebSite y Organization | `website/scripts/lib/seo-normalize.mjs` (o donde se genere) | Pedido explícito |
| P5 | **hreflang:** hoy apunta a `?lang=xx`, pero el canonical de esas URL es la página base, y Google ignora alternates que no son canónicos. Propuesta: quitar los alternates `?lang=` y dejar el contenido en español como canónico (el idioma cambia dinámicamente en la misma página), hasta tener URLs por idioma (`/en/…`) | normalizador SEO | Tu regla: "no inventar hreflang falso" |
| P6 | Titles y descriptions por departamento en `departamento.html?id=…` (17 territorios), generados con los datos del catálogo y luego desde Supabase | `js/` del departamento + normalizador | Fase 15 |
| P7 | Schema `TouristAttraction`, `Restaurant` u `Hotel` solo para fichas verificadas, con `geo` únicamente si `map_ready` | ficha de destino y sección verificada | Fases 7 y 16 (cuando lean de Supabase) |
| P8 | `mapa.html`: H1 "Mapa turístico de Nicaragua", texto introductorio y lista de categorías en HTML | `mapa.html` (otra sesión lo está editando: coordinar) | Fase 17 |
| P9 | Redirecciones 301 de URLs antiguas | — | **No aplica:** ninguna URL de TutorNode existió en el dominio; no se inventan redirecciones (`/login` ya da 404 con marca) |

**No se tocará:** `google5c73d71f3e5f8337.html`, el registro CNAME de verificación en Hostinger, el diseño visual, el login ni el Ops Center (salvo que siga en noindex).

## 5. Riesgos

- Mientras no se despliegue P1, el canonical en vivo sigue apuntando a `web.app`.
- Google puede tardar de días a semanas en reemplazar el fragmento, aun con reindexación solicitada.
- Si la causa fue la IP reutilizada, nada en el código lo habría evitado. Verificar el dominio en Search Console (ya hecho, por CNAME) permite pedir la retirada rápida.
- `mapa.html` y otros archivos tienen cambios sin commit de otra sesión: hay que coordinar antes de editarlos.

## 6. Pruebas previstas, una vez autorizado

- `seo-normalize.test.mjs`, `production-audit.mjs` y la búsqueda global de TutorNode (que debe dar 0).
- Re-ejecutar la auditoría SEO sobre `dist-hostinger/` y sobre el sitio en vivo después del deploy.
- Responsive en 320, 390, 768, 1024, 1440 y 1920 px con `browser-qa`.
- `npm run i18n`.
- Lighthouse antes y después (no ejecutado todavía).

## 7. Google Search Console (después del deploy)

1. Abrí https://search.google.com/search-console y elegí la propiedad de dominio `baqueanonicaragua.com`.
2. **Sitemaps** → enviá `sitemap.xml`.
3. **Inspección de URL** → pegá `https://baqueanonicaragua.com/` → **Probar URL publicada**. Confirmá que el título dice BAQUEANO y que el canonical declarado por el usuario es `https://baqueanonicaragua.com/` → **Solicitar indexación**.
4. Repetí el paso 3 con las URLs prioritarias:
   - https://baqueanonicaragua.com/nosotros.html
   - https://baqueanonicaragua.com/destinos.html
   - https://baqueanonicaragua.com/gastronomia.html
   - https://baqueanonicaragua.com/baqueano-ia.html
   - https://baqueanonicaragua.com/mapa.html
   - https://baqueanonicaragua.com/mi-negocio.html
5. Si el fragmento de TutorNode sigue apareciendo después de la reindexación: **Retiradas → Eliminar contenido obsoleto o "Borrar URL en caché"** para la URL afectada.
6. Revisá **Páginas** (indexadas y excluidas), **Mejoras** (rutas de exploración / breadcrumbs) y **Métricas web principales** a los 7–28 días.

Enlaces externos usados en la auditoría: [Wayback Machine](https://web.archive.org/web/2026*/baqueanonicaragua.com) · [RDAP Verisign](https://rdap.verisign.com/com/v1/domain/baqueanonicaragua.com) · [TutorNode en GitHub](https://github.com/marianakibuuka/TutorNode)
