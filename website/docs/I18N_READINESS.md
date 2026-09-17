# 🧭 AUDITORÍA DE PREPARACIÓN PARA INTERNACIONALIZACIÓN (I18N READINESS) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Preparar la base arquitectónica de Baqueano para una futura recepción fluida de turistas y exploradores internacionales sin duplicar proyectos ni introducir parches inconsistentes de traducción, priorizando la consolidación del contenido en español nicaragüense antes de la apertura multilingüe.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & ESTÁNDARES)
- **Centralización de Diccionarios**: Evitar textos rígidos incrustados en componentes; estructurar claves semánticas preparadas para librerías de localización (ej. `next-intl` / `formatjs`).
- **Formateo Numérico y Monetario**: Soporte estricto de moneda nacional (Córdoba Oro - `NIO`) y moneda internacional complementaria (`USD`) usando `Intl.NumberFormat('es-NI')` y `Intl.NumberFormat('en-US')`.
- **Zona Horaria y Fechas**: Estandarización de fechas bajo el huso horario oficial de Nicaragua (`America/Managua` / UTC-6) mediante formato ISO 8601 en base de datos.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE PREPARACIÓN I18N)

| Dimensión | Estado Actual | Estrategia de Preparación | Prioridad |
|---|---|---|---|
| **Estructura de Rutas** | Monolingüe (`/destinos`, `/mapa`) | Preparar soporte de prefijos de idioma (`/es/destinos`, `/en/destinations`) mediante Next.js App Router middleware. | Media |
| **Moneda y Precios** | Simbología mixta (C$ / US$) | Helper unificado `formatCurrency(amount, currency, locale)` con tipo `CurrencyCode = 'NIO' \| 'USD'`. | Alta |
| **Manejo de Fechas** | Formato en español local | Componentes de fecha usando `Intl.DateTimeFormat` configurado con timezone `America/Managua`. | Alta |
| **SEO y Metadatos** | `og:locale = "es_NI"` | Soporte de etiquetas `<link rel="alternate" hreflang="en" ...>` cuando existan traducciones oficiales verificadas. | Media |
| **Catálogo de Destinos** | Descripciones en Español | Campo opcional en esquema Firestore: `description_en` y `tips_en` sin romper compatibilidad con la app Android. | Media |
| **Glosario Territorial** | Términos vernáculos (ej. *Baqueano*, *Pinolero*, *Comidería*) | Glosario contextual con notas explicativas en lugar de traducciones literales que diluyan la identidad cultural. | Crítica |
