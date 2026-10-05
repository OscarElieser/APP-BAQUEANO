# 🧭 BAQUEANO — Flujo UX, wireframes y accesibilidad

## 🎯 POR QUÉ (Propósito)
Mostrar cómo una persona pasa de "no sé a dónde ir" a "ya tengo mi ruta y publiqué mi experiencia" con el menor esfuerzo posible, y demostrar que el producto es usable por todas las personas (WCAG 2.1 AA).

## ⚙️ CÓMO (Método)
- **Flujos** en Mermaid (se ven directo en GitHub). Corresponden a páginas reales de `website/`.
- **Wireframes** de baja fidelidad (ASCII), móvil primero (360 px). La alta fidelidad es el sitio publicado en `https://baqueanonicaragua.com`.
- **Accesibilidad** verificada con pruebas automáticas del repositorio y revisión manual.

## 📦 QUÉ (Entregables)

### 1. Flujo principal del explorador

```mermaid
flowchart TD
  A[Inicio index.html] -->|"Explorar destinos"| B[destinos.html]
  A -->|Pill de departamento| C[departamento.html?id=…]
  C --> C1[Mapa del territorio: solo sus pines]
  C --> C2[Secciones propias: historia, sabores, fiestas, rutas, SOS]
  C --> D[destino.html?id=…]
  D --> E{¿Quiere planificar?}
  E -->|Sí| F[BAQUI baqueano-ia.html]
  F --> F1[Escribe: 'somos 2 adultos y 3 niños, 500 dólares, Granada y Masaya']
  F1 --> F2{¿Faltan datos?}
  F2 -->|Días| F3[BAQUI pregunta: ¿cuántos días?]
  F3 --> F4[Ruta + mapa + itinerario + presupuesto trazable]
  F2 -->|No| F4
  F4 --> G[Guardar en Mi viaje]
  E -->|No| H[Cómo llegar / WhatsApp del anfitrión]
  G --> I{¿Sesión iniciada?}
  I -->|No| J[Google Sign-In con Firebase Auth]
  J --> G
  I -->|Sí| K[Viaja]
  K --> L[testimonios.html: publica su experiencia con fotos y video]
  L --> M[Moderación en el Ops Center]
  M -->|Aprobada| N[Aparece en inicio, departamento y destino]
```

### 2. Flujo del emprendedor (anfitrión)

```mermaid
flowchart LR
  A[mi-negocio.html: Portal de Anfitriones] --> B[Envía datos y evidencias]
  B --> C[Ops Center: verificación por Admin]
  C -->|Verificado| D[Sello Verificado + ficha pública]
  C -->|Faltan datos| B
  D --> E[Visitantes contactan por WhatsApp / Cómo llegar]
```

### 3. Flujo de moderación y roles

```mermaid
flowchart LR
  U[Explorador publica] --> P[pending_review]
  P -->|Admin aprueba| PUB[published]
  P -->|Admin rechaza| R[rejected: se borran sus archivos]
  PUB -->|3 denuncias| REP[reported]
  REP --> A2[Admin revisa]
  AUD[Auditor] -. solo lectura .-> P
  AUD -. solo lectura .-> REP
```

### 4. Wireframes (móvil, 360 px)

**Inicio**
```text
┌──────────────────────────────┐
│ [≡]  BAQUEANO        [ES ▾]  │  ← barra fija, selector de 6 idiomas
├──────────────────────────────┤
│  ░░░ video del territorio ░░ │
│  DESCUBRÍ LO QUE NO SALE     │
│  EN EL MAPA                  │
│  [ Explorar destinos ]       │  ← acción principal (naranja)
├──────────────────────────────┤
│ (Madriz)(León)(Rivas)(…) →   │  ← píldoras de los 17 territorios
├──────────────────────────────┤
│ DESTINOS QUE  Inspiran       │
│ ┌────┐ ┌────┐ ┌────┐  →      │
├──────────────────────────────┤
│ Experiencias de viajeros     │  ← galería infinita con pausa
│ ◄ [foto][★★★★★][♥ 12] ►      │
│ [ Compartí tu experiencia ]  │
├──────────────────────────────┤
│ SOS 118 · 128 · 115          │
└──────────────────────────────┘
```

**Departamento**
```text
┌──────────────────────────────┐
│ ← RIVAS                      │
│ [foto hero]  Cabecera · Área │
├──────────────────────────────┤
│ 1. Qué es Rivas              │
│ 2. Mapa: solo Rivas  [pines] │
│ 3–6. Municipios, destinos…   │
│ 7. Línea de tiempo           │
│ 8. Lugares emblemáticos      │
│ 9. Sabores (tabla)           │
│ …  Fiestas · Naturaleza ·    │
│    Leyendas · Rutas · Qué    │
│    llevar · SOS · Código     │
│ Experiencias de Rivas        │
└──────────────────────────────┘
```

**BAQUI**
```text
┌──────────────────────────────┐
│ BAQUI 🐦                     │
│ ┌──────────────────────────┐ │
│ │Bot: Contame destinos,    │ │
│ │días, cuántos viajan…     │ │
│ │Vos: somos 2 adultos y 3  │ │
│ │niños, $500, Granada…     │ │
│ │Bot: …me falta saber      │ │
│ │cuántos días.             │ │
│ └──────────────────────────┘ │
│ [ Escribí tu consulta…  ][➤] │
├──────────────────────────────┤
│ [ MAPA con la ruta ]         │
│ Día 1 Granada · Día 2 Masaya │
│ Presupuesto: $500 · pendiente│
└──────────────────────────────┘
```

**Ops Center (Auditor)**
```text
┌──────────────────────────────────────────────┐
│ 👁 Modo Auditor: podés revisar, no modificar │  ← banner fijo
├───────────┬──────────────────────────────────┤
│ Menú      │ Moderación de la comunidad       │
│ · Moder.  │ [Pendientes 3][Publicadas 12]…   │
│ · Auditor.│ ┌ Experiencia … ───────────────┐ │
│ · Respal. │ │ texto · fotos · denuncias     │ │
│           │ │ [Solo lectura (Auditor)]      │ │
│           │ └───────────────────────────────┘ │
└───────────┴──────────────────────────────────┘
```

### 5. Accesibilidad (WCAG 2.1 AA)

| Criterio | Implementación | Evidencia |
|---|---|---|
| 1.1.1 Texto alternativo | Imágenes con `alt`; las decorativas con `alt=""` y `aria-hidden` | Páginas en `website/` |
| 1.4.3 Contraste | Paleta medida (ver `03_MANUAL_DE_MARCA…`, sección 4); fix de títulos sobre fondos oscuros en departamentos | `css/pages/departamento.css` |
| 1.4.10 Reflujo | Sin scroll horizontal a 390 px en los 17 territorios | Prueba E2E del 2026-10-04 (SESSION_LOG) |
| 2.1.1 Teclado | Botones nativos; menú de idioma con roles `menu`/`menuitemradio` | `js/global-language.js` |
| 2.4.1 Saltar bloques | Enlace "Ir al contenido principal" (clave `nav.skipNav` en 6 idiomas) | `locales/*.json` |
| 2.4.7 Foco visible | Anillo naranja de 3 px (`outline`) | `css/baqueano-system.css` |
| 2.3.3 Animaciones | Galería con pausa; se respeta `prefers-reduced-motion` | `js/home-community.js` |
| 3.1.1 / 3.1.2 Idioma | `lang` del documento cambia con el idioma (es-NI, en-US, …) | Prueba `i18n-browser.test.mjs` (19 rutas × 6 idiomas) |
| 4.1.2 Nombre y rol | Los controles sin nombre reciben `aria-label` automático en el Ops Center | `ensureOpsAccessibleControlNames` |
| Táctil | Objetivos de toque de 48×48 px como mínimo | `docs/design/DESIGN.md` |
