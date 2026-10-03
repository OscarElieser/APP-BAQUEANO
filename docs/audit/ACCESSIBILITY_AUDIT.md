# ♿ BAQUEANO — Auditoría de accesibilidad (Fase 1)

## 🎯 POR QUÉ

Objetivo WCAG 2.2 AA y Lighthouse Accessibility ≥ 95. La rúbrica de Sprint 2 (Diseño) incluye accesibilidad.

## ⚙️ CÓMO

Revisión estática (atributos `alt`, `lang`, enlaces de salto, `prefers-reduced-motion`, `aria-*`) en `index.html` y CSS. **Pendiente:** Lighthouse/axe con Playwright en navegador real (se ejecutará en el primer lote de implementación como línea base).

## 📦 QUÉ

### Bien ✅

- `index.html`: 29 `<img>`, **todas con `alt`**; 24 con `loading="lazy"`.
- 12 hojas CSS respetan `prefers-reduced-motion`; existe `css/accessibility.css`.
- Selector de idioma con `aria-expanded` y marcadores `aria-hidden` (`global-language.js`).
- Claves i18n para `accessibility.skipNav`, `closeModal`, `openMenu`… (preparadas, pocas usadas).
- Android: `ResponsiveScaffold` y pruebas de widget.

### Hallazgos

| ID | Prioridad | Hallazgo |
| --- | --- | --- |
| A11Y-P2-01 | P2 | `index.html` sin enlace "Saltar al contenido" (0 coincidencias de `skip`). |
| A11Y-P2-02 | P2 | Ninguna `<img>` de index declara `width`/`height` → CLS y saltos para usuarios de lupa. |
| A11Y-P2-03 | P2 | `lang` inconsistente en HTML (`es` vs `es-NI`) antes de que cargue JS. |
| A11Y-P2-04 | P2 | 4.423 `!important` y 388 colores: imposible garantizar contraste AA sin tokens. Verificar especialmente `#F65E01` sobre blanco (≈3,2:1, **no cumple** AA para texto normal; sí para texto grande ≥ 24 px o negrita ≥ 18,66 px). |
| A11Y-P2-05 | P2 | Hero con video en bucle: confirmar botón de pausa (WCAG 2.2.2). |
| A11Y-P2-06 | P2 | Ops Center construye UI con `innerHTML` (264 usos en el sitio): revisar etiquetas de formularios y foco en modales. |
| A11Y-P3-01 | P3 | Objetivos táctiles ≥ 24×24 px (WCAG 2.5.8) a verificar en 360 px. |

### Plan de pruebas

Playwright + `@axe-core/playwright` en 9 anchos (360, 375, 390, 412, 768, 1024, 1280, 1440, 1920) para las páginas núcleo; navegación por teclado del menú, modal SOS, selector de idioma y BAQUI.
