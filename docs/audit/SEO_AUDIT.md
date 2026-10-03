# 🔎 BAQUEANO — Auditoría SEO (Fase 1)

## 🎯 POR QUÉ

Posicionar BAQUEANO en búsquedas como "Turismo Nicaragua", "Playas Nicaragua" o "Qué hacer en Granada" con `https://baqueanonicaragua.com` como dominio canónico.

## ⚙️ CÓMO

Inspección de `<head>` de las 30 páginas, `robots.txt`, `sitemap.xml` y respuesta HTTP de ambos dominios.

## 📦 QUÉ

| ID | Prioridad | Hallazgo | Evidencia |
| --- | --- | --- | --- |
| SEO-P1-01 | P1 | El dominio canónico deseado **no sirve el sitio** (página "Parked Domain" de Hostinger) | `curl https://www.baqueanonicaragua.com` → `<title>Parked Domain name on Hostinger DNS system</title>`; HTTPS raíz falla |
| SEO-P1-02 | P1 | Canonical, sitemap y robots apuntan a `app-baqueano.web.app` (lo contrario de lo pedido) | `index.html`, `ayuda.html`, `sitemap.xml`, `robots.txt` |
| SEO-P2-01 | P2 | Solo 2 de 30 páginas tienen `<link rel="canonical">` | — |
| SEO-P2-02 | P2 | **`robots.txt` bloquea `/css/`**: Google no puede renderizar las páginas como un usuario | `Disallow: /css/` |
| SEO-P2-03 | P2 | 0 `hreflang` en todo el sitio | — |
| SEO-P2-04 | P2 | Open Graph solo en `index.html`; sin Twitter Cards | — |
| SEO-P2-05 | P2 | 0 bloques JSON-LD (`Organization`, `WebSite`, `TouristDestination`, `TouristAttraction`, `BreadcrumbList`…) | — |
| SEO-P2-06 | P2 | `sitemap.xml` con 9 URLs para 30 páginas y 17 territorios (`departamento.html?depto=…` no listado) | — |
| SEO-P2-07 | P2 | `baqueano-ai.html` y `offline.html` sin `meta description`; `i18n-test.html` indexable | — |
| SEO-P3-01 | P3 | URLs con querystring (`departamento.html?depto=madriz`). Evaluar `/es/nicaragua/madriz` con rewrites, manteniendo las actuales | — |

### Lo que ya está bien ✅

- `meta description` en 27 páginas.
- `admin.html` con `X-Robots-Tag: noindex` y `Disallow`.
- HTTPS y HSTS en Firebase Hosting.

### Plan

1. (P1) Publicar en `baqueanonicaragua.com` (Azure + DNS Hostinger). Redirección 301 `www → apex` o viceversa.
2. (P1) Canonical absoluto a `https://baqueanonicaragua.com/...` en todas las páginas; sitemap y robots con el dominio principal.
3. (P2) Quitar `Disallow: /css/` (y revisar `/scripts/`, que solo bloquea fuentes no desplegadas).
4. (P2) `hreflang` para los 9 idiomas + `x-default`. Mientras no haya URLs por idioma, usar `?lang=xx` y hacer que el motor i18n lo respete.
5. (P2) JSON-LD `Organization` + `WebSite` (con `SearchAction`) en index; `TouristDestination` en `departamento`; `TouristAttraction` en `destino`; `BreadcrumbList` global.
6. (P2) Sitemap generado por script con las 17 fichas territoriales y destinos publicados.
