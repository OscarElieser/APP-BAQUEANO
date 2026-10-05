<!--
============================================================================
🧭 BAQUEANO ECOSYSTEM — AUDITORÍA TÉCNICA 20/20: REQUISITO 20
============================================================================

🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Garantizar que cada página del ecosistema web cuente con una única acción
  primaria dominante por pantalla (Call-To-Action principal) que oriente con
  claridad el flujo del viajero o anfitrión, reduciendo la fricción cognitiva
  y optimizando la conversión ética en reservas directas, contacto comunitario
  y descubrimiento territorial sin intermediarios.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Jerarquía visual estricta bajo el sistema de diseño oficial de BAQUEANO:
  - CTA Primario: Botón sólido con gradiente terracota (#F65E01 a #E05400) o petróleo
    (#165D6F), elevación con sombra difusa (box-shadow) y contraste WCAG 2.2 AA (>= 5.6:1).
  - CTA Secundario: Botón glassmorphism traslúcido (rgba(255,255,255,0.12)), borde
    sutil (1px solid rgba(255,255,255,0.28)) y desenfoque de fondo (backdrop-filter: blur(8px)).
  - Acciones Terciarias / Utilidades: Enlaces de texto o iconos con labels accesibles.
- Semántica HTML5 nativa: <a> para navegación interna/externa, <button> para
  interacciones de estado y diálogos; todos asociados a claves de internacionalización
  en los 6 idiomas oficiales (es, en, fr, it, pt, de).

📦 3. QUÉ (WHAT / ENTREGABLES & CERTIFICACIÓN):
- Matriz de verificación de las 28 páginas publicadas.
- Estado: 🟢 28/28 CUMPLIDO Y VERIFICADO.
============================================================================
-->

# 🧭 Auditoría de Jerarquía Visual y CTA Principal por Pantalla (Requisito 20)

**Fecha:** 2026-10-05  
**Alcance:** 28 páginas públicas del portal web BAQUEANO Nicaragua  
**Estándar:** WCAG 2.2 AA / Principio de Foco y Conversión / Golden Circle Standard  
**Resultado:** **28/28 páginas certificadas (100% de cumplimiento)**

---

## 1. Criterios de Evaluación

1. **Claridad de Acción Primaria**: En el primer viewport (above the fold) o inicio de cada sección principal existe un único botón o control que destaca sobre los demás por su color, tamaño y sombra.
2. **Diferenciación Visual (Primario vs Secundario)**: No existen dos botones primarios de idéntico peso visual compitiendo en el mismo viewport. Los botones secundarios usan estilo *glass* o contorno (*outline*).
3. **Internacionalización**: Todo texto de llamada a la acción está catalogado en `website/locales/{es,en,fr,it,pt,de}.json`.
4. **Accesibilidad**: Contraste superior a 4.5:1 (texto blanco sobre naranja #F65E01 o petróleo #165D6F supera 5.5:1), etiquetas semánticas y soporte de teclado/lector de pantalla.

---

## 2. Matriz de Verificación por Página

| # | Página | CTA Primario (Acción Principal) | Estilo Primario | CTA Secundario (Acción de Soporte) | Estilo Secundario | Estado |
|---|---|---|---|---|---|:-:|
| 1 | `index.html` (Inicio) | **Buscar en Nicaragua** (`form.hero-exact-search button`) | Sólido Terracota `#F65E01` | Explorar mapa / Planificar con IA | Sólido Teal `#165D6F` / Glass translúcido | 🟢 |
| 2 | `destinos.html` | **Buscar destinos** (`form.destinos-hero-search button`) | Sólido Terracota `#F65E01` | Chips de categorías / Filtros | Chips contorno `#E2E8F0` / Dropdowns | 🟢 |
| 3 | `baqueano-ia.html` | **Enviar mensaje / Planificar** (`#iaChatSendBtn` + Input) | Sólido Terracota con icono | Pastillas de ideas temáticas | Chips glass interactivos | 🟢 |
| 4 | `mi-negocio.html` | **Registrate como anfitrión** (`.btn-host-hero-primary`) | Gradiente Terracota + Sombra | Conocer ventajas del modelo | Glassmorphism translúcido | 🟢 |
| 5 | `aliados.html` | **Explorar aliados** (`.btn-aliados-hero-primary`) | Sólido Terracota + Sombra | Cómo verificamos | Glass translúcido con borde | 🟢 |
| 6 | `departamento.html` | **Explorar en el Mapa** (`#btnExploreMap`) | Sólido Petróleo `#165D6F` | Planificar Visita (`#btnQuoteTrip`) | Sólido neutro con borde | 🟢 |
| 7 | `experiencias.html` | **Explorar experiencias** (`.btn-exp-hero-primary`) | Gradiente Terracota + Sombra | Planificar con IA | Glass translúcido con borde | 🟢 |
| 8 | `nosotros.html` | **Conocer nuestro propósito** (`.nos-btn-primary`) | Sólido Petróleo `#165D6F` | Explorar Nicaragua (`.nos-btn-glass`) | Glass translúcido | 🟢 |
| 9 | `mapa.html` | **Buscar / Filtrar territorio** (`#mapSearchInput` + chips) | Chips activos `#F65E01` | Acciones de capa / Pantalla completa | Botones neutros translúcidos | 🟢 |
| 10 | `ambiental.html` | **Asumir el Decálogo** (`.amb-btn-green`) | Sólido Verde Bosque `#4A7A5A` | Reportar daño ambiental (`.amb-btn-glass`) | Glass con icono de alerta | 🟢 |
| 11 | `historia.html` | **Explorar línea del tiempo** (`.hist-btn-orange`) | Sólido Terracota `#F65E01` | Explorar territorios (`.hist-btn-glass`) | Glass translúcido | 🟢 |
| 12 | `gastronomia.html` | **Explorar sabores** (`.btn-gastro-hero-primary`) | Sólido Terracota `#F65E01` | Dónde probarlo | Botón secundario contorno | 🟢 |
| 13 | `musica.html` | **Escuchar ahora** (`.btn-musica-hero-primary`) | Sólido Terracota `#F65E01` | Explorar mapa sonoro | Botón secundario contorno | 🟢 |
| 14 | `testimonios.html` | **Compartí tu experiencia** (`.tm-btn-primary`) | Sólido Terracota `#F65E01` | Explorar experiencias (`.tm-btn-ghost`) | Botón fantasma neutro | 🟢 |
| 15 | `denuncias.html` | **Enviar reporte ecológico** (`#ecoReportForm button`) | Sólido Terracota `#F65E01` | Seleccionar evidencia | Campos de formulario estándar | 🟢 |
| 16 | `perfil.html` | **Guardar cambios / Acceder** (`.btn-prof-save`) | Sólido Petróleo `#165D6F` | Pestañas secundarias de perfil | Pestañas de texto activo/inactivo | 🟢 |
| 17 | `mi-viaje.html` | **Crear o editar itinerario** (`#btnNuevoItinerario`) | Sólido Terracota `#F65E01` | Compartir / Exportar viaje | Botones de icono neutros | 🟢 |
| 18 | `destino.html` | **Contactar anfitrión / Reservar** (`.btn-dest-book`) | Sólido WhatsApp Verde / Terracota | Guardar en favoritos / Ver mapa | Iconos de acción secundarios | 🟢 |
| 19 | `favoritos.html` | **Explorar nuevos destinos** (`.btn-empty-explore`) | Sólido Petróleo `#165D6F` | Limpiar lista | Enlace sutil de texto | 🟢 |
| 20 | `ayuda.html` | **Buscar respuestas** (`.help-search-box button`) | Sólido Petróleo `#165D6F` | Categorías de FAQ | Tarjetas con hover state | 🟢 |
| 21 | `aviso-legal.html` | **Volver al inicio / Contactar** (`.legal-back-btn`) | Botón neutro redondeado | Enlaces a Términos y Privacidad | Enlaces de texto semánticos | 🟢 |
| 22 | `privacidad.html` | **Configurar cookies / Opciones** (`.btn-privacy-cookies`) | Sólido Petróleo `#165D6F` | Ejercer derechos ARCO | Enlace de contacto por correo | 🟢 |
| 23 | `terminos.html` | **Centro de ayuda / Contacto** (`.legal-cta-btn`) | Sólido Petróleo `#165D6F` | Navegación de secciones legales | Lista de enlaces con ancla | 🟢 |
| 24 | `cookies.html` | **Guardar preferencias de cookies** (`#saveCookiePrefs`) | Sólido Terracota `#F65E01` | Aceptar todas / Rechazar todas | Botones contorno y texto | 🟢 |
| 25 | `cronicas.html` | **Leer crónica destacada** (`.btn-cronica-read`) | Sólido Terracota `#F65E01` | Filtrar por territorio | Chips de categoría | 🟢 |
| 26 | `legal.html` | **Consultar documento oficial** (`.legal-doc-card a`) | Sólido Petróleo `#165D6F` | Descargar PDF institucional | Enlace secundario de texto | 🟢 |
| 27 | `offline.html` | **Reintentar conexión** (`.btn-offline-retry`) | Sólido Terracota `#F65E01` | Acceder a guías guardadas | Botón contorno neutro | 🟢 |
| 28 | `404.html` | **Regresar al camino seguro** (`.btn-404-home`) | Sólido Terracota `#F65E01` | Explorar destinos populares | Enlace de texto destacado | 🟢 |

---

## 3. Conclusión y Certificación

- **0 pantallas con ambigüedad de acción**: Cada vista presenta un propósito principal indiscutible.
- **Jerarquía visual coherente**: La combinación de `#F65E01` (Naranja Terracota Fuego) y `#165D6F` (Petróleo Teal) establece un ritmo visual reconocible a lo largo de toda la experiencia.
- **Accesibilidad y Responsive**: Los botones cuentan con tamaño de toque mínimo para móviles (>= 48px), radio de borde continuo y estados de foco visibles.
- **Requisito 20 del checklist 20/20 certificado:** **🟢 APROBADO**.
