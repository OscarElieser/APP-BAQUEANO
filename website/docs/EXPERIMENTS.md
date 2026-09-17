# 🧪 REGISTRO DE EXPERIMENTOS Y CRO — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Fomentar una cultura de ingeniería de producto orientada a la evidencia empírica. Todo cambio visual, de copy o de jerarquía de llamados a la acción (CTA) debe formularse como una hipótesis verificable con métricas de impacto claras, evitando rediseños por capricho estético.

---

## ⚙️ 2. CÓMO (HOW / METODOLOGÍA & GUARDARRAÍLES)
- **Protocolo de Muestra Mínima**: Se prohíbe declarar variantes ganadoras con tamaños de muestra estadísticamente no significativos (p-value < 0.05 y mínimo 1,000 conversiones por rama).
- **Enfoque Cualitativo Preliminar**: Si el tráfico productivo está en fase temprana (`SIN DATOS SUFICIENTES`), los experimentos se prueban mediante entrevistas de usabilidad moderadas antes de lanzar tests A/B en vivo.
- **Estructura Estándar**: Cada experimento documenta hipótesis, métrica principal, métrica secundaria, variantes, duración y veredicto.

---

## 📦 3. QUÉ (WHAT / INVENTARIO DE EXPERIMENTOS)

### Experimento EXP-001: Redacción del CTA Principal de Descubrimiento
- **Hipótesis**: Un llamado a la acción con anclaje de identidad cultural (*"Explorar Territorios"*) incrementa en un +15% las visualizaciones de destinos (`destination_view`) en comparación con un texto genérico (*"Comenzar Aventura"*).
- **Métrica Primaria**: Tasa de click en CTA Hero (`hero_cta_click_rate`).
- **Métrica Secundaria**: Rebote en página de destinos (`destinos_bounce_rate`).
- **Variante A (Control)**: Botón con texto *"Comenzar Aventura"*.
- **Variante B (Tratamiento)**: Botón con texto *"Explorar Territorios"*.
- **Duración Prevista**: 3 semanas o hasta alcanzar 2,500 sesiones únicas por variante.
- **Resultado Actual**: `SIN DATOS SUFICIENTES` (Registrado para activación en tráfico vivo).
- **Decisión**: Mantener Variante B por coherencia con la identidad territorial de Baqueano.

---

### Experimento EXP-002: Ubicación del Botón de Guardado (`SavePlaceButton`) en Fichas Móviles
- **Hipótesis**: Un botón flotante persistente de guardado en el viewport móvil incrementa el guardado de destinos (`destination_save`) sin obstruir la lectura de la historia y recomendaciones locales.
- **Métrica Primaria**: Tasa de guardado por sesión (`save_rate_mobile`).
- **Métrica Secundaria**: Tiempo de permanencia en ficha de destino (`avg_dwell_time`).
- **Variante A (Control)**: Botón de guardado estático en la cabecera de la ficha.
- **Variante B (Tratamiento)**: Botón de guardado accesible en la barra de acción inferior con backdrop blur.
- **Duración Prevista**: 4 semanas.
- **Resultado Actual**: `SIN DATOS SUFICIENTES`.
- **Decisión**: En evaluación cualitativa en pruebas de usabilidad.

---

### Experimento EXP-003: Acceso Directo al Mapa Territorial vs Listado Grid
- **Hipótesis**: Ofrecer un toggle directo *"Ver en Mapa"* en la barra de búsqueda de destinos incrementa las interacciones con negocios rurales en un +20%.
- **Métrica Primaria**: Clicks a contacto de negocios locales (`business_contact_click`).
- **Métrica Secundaria**: Aperturas del mapa (`map_open`).
- **Variante A (Control)**: Pestañas separadas de navegación (`/destinos` vs `/mapa`).
- **Variante B (Tratamiento)**: Selector de vista Grid / Mapa unificado con sincronización de filtros.
- **Duración Prevista**: 4 semanas.
- **Resultado Actual**: `SIN DATOS SUFICIENTES`.
- **Decisión**: En desarrollo técnico para integración fluida.
