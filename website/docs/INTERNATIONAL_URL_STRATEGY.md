# ESTRATEGIA DE URLs, CANONICAL & SEO INTERNACIONAL (HREFLANG)

## 1. Preservación Estricta del SEO Histórico de Nicaragua

Para no perder autoridad de dominio ni romper indexación en buscadores ni deep links de la app Android existente:

1. Las URLs históricas sin prefijo (ej: `https://baqueano.app/destinos/cerro-negro`) se preservan como la ruta canónica para Nicaragua.
2. Para mercados adicionales y versiones internacionales se adopta el esquema de subdirectorio con prefijo de país/idioma:
   - Nicaragua (Canónico): `https://baqueano.app/destinos/cerro-negro` o `https://baqueano.app/ni/destinos/cerro-negro` (con `rel="canonical"` hacia la principal).
   - Costa Rica: `https://baqueano.app/cr/destinos/volcan-arenal`
   - Guatemala: `https://baqueano.app/gt/destinos/lago-de-atitlan`
   - Versión en Inglés: `https://baqueano.app/en/destinations/cerro-negro`

---

## 2. Configuración de Etiquetas `hreflang`

Para páginas con traducciones y equivalencias regionales verificadas:

```html
<link rel="alternate" hreflang="es-NI" href="https://baqueano.app/destinos/cerro-negro" />
<link rel="alternate" hreflang="en" href="https://baqueano.app/en/destinations/cerro-negro" />
<link rel="alternate" hreflang="x-default" href="https://baqueano.app/destinos/cerro-negro" />
```

### Reglas de Calidad SEO:
- **Cero Enlaces Rotos en `hreflang`**: Prohibido emitir etiquetas `hreflang` hacia páginas vacías, borradores o contenidos 404.
- **Auto-referencia**: Toda página debe incluir su propio tag `hreflang` y `rel="canonical"`.
- **Segmentación de Sitemaps**: Sitemaps separados por país (`sitemap-ni.xml`, `sitemap-cr.xml`, `sitemap-gt.xml`) para facilitar el diagnóstico de rastreo en Google Search Console.
