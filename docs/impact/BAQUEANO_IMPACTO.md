# BAQUEANO IMPACTO — Integración estratégica y alineación nacional

> 🎯 **POR QUÉ:** demostrar con datos reales y fuentes oficiales cómo BAQUEANO **contribuye** al turismo, la economía local, la identidad, el ambiente, la educación y la transformación digital de Nicaragua, sin atribuirse reconocimientos institucionales.
> ⚙️ **CÓMO:** migración aditiva en Supabase, indicadores calculados en PostgreSQL, panel en Ops Center (vista 26), sección pública en `nosotros.html#impacto`, intención dedicada en BAQUI, i18n en 6 idiomas.
> 📦 **QUÉ:** este documento es el entregable: auditoría, matriz, archivos, migración, pruebas, clasificación y riesgos.

Fecha: 2026-10-05 · Responsable de la sesión: Claude Code · Estado: **implementado en el repositorio, migración NO aplicada en producción** (el propietario rechazó aplicarla en esta sesión).

---

## 1. Auditoría inicial (datos reales consultados en Supabase `heiudfpthqwtjrtluqlm`, 2026-10-05)

| Tabla | Filas | Observación |
|---|---:|---|
| departments | 17 | 15 departamentos + RACCN + RACCS |
| municipalities | 153 | denominador real de la cobertura territorial |
| destinations | 7 | publicados, `pending_review`, **0 con municipio** |
| businesses | 5 | publicados y verificados, con municipio |
| experiences, communities, routes, places | 0 | sin datos |
| emergencies (SOS) | 0 | la tabla existe con teléfono, ubicación, fuente y vigencia |
| heritage, gastronomy, music, crafts, festivals, legends, culture | 0 | el contenido cultural vive en HTML, no en la base |
| travel_plans | 31 | itinerarios guardados |
| ai_sessions / ai_messages | 4 / 8 | BAQUI |
| analytics_events, commercial_actions | 0 | la ingesta existe, sin tráfico aún |

**Hallazgos clave**

1. El portal publica **254 lugares** en `website/js/territories-data.js` (base verificada, INTUR rural 2026, playas, naturaleza), pero **no están en Supabase**. Por regla, los indicadores públicos solo cuentan Supabase: hoy las cifras serán bajas y así se mostrarán. **Migrar ese catálogo a Supabase es el paso de mayor impacto pendiente.**
2. La vista pública existente `public_ecosystem_metrics` **falla para visitantes anónimos** (`permission denied for table travel_plans`). La nueva función `public_impact_summary()` (SECURITY DEFINER, solo agregados) la reemplaza para la web sin tocarla.
3. Ya existían y se reutilizan (no se duplicaron): `analytics_events` + `track_event` (consentimiento, límite por hora, sin PII), `commercial_actions`, `kpi_dashboard`, vista 26 de Ops Center, `municipalities`, `sustainability_attributes`, `verification_status` / `valid_until`, Edge Functions `baqueano-ops` y `baqueano-ai`.

## 2. Fuentes oficiales verificadas (2026-10-05)

| Fuente | Qué se verificó | URL |
|---|---|---|
| PNLCP-DH 2022-2026, Lineamiento "Desarrollar la economía creativa, familiar y emprendedora…" | Texto extraído del PDF: Política Nacional de Turismo (Promoción; Diferenciación y diversificación: turismo creativo y cultural, Estrategia de Desarrollo del Turismo Rural, rutas, mapas); asistencia en digitalización empresarial; Política de Patrimonio Cultural | https://www.pndh.gob.ni/documentos/pndhActualizado/08_LINEAMIENTO_VIII_(19jul21).pdf |
| INTUR — "Así impulsará Intur el turismo en Nicaragua en 2026" | Objetivo y **7 ejes** (no 5): Promoción; Diferenciación y diversificación; Infraestructura; Formación y capacitación; Calidad; Enlazamiento y complementariedad; Presencia y comunicación directa | https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/ |
| INTUR — Turismo Rural y Comunitario | Ley General de Turismo: fortalece economías locales, empleo, oportunidades a mujeres y jóvenes, identidad, biodiversidad, patrimonio | https://www.intur.gob.ni/turismo-rural-y-comunitario/ |
| Estrategia Nacional de Educación "Bendiciones y Victorias" 2024-2026 (PDF) | **16 ejes y 70 lineamientos confirmados**. **121 acciones NO confirmadas**: la extracción automática cuenta 126 marcadores de acción | https://www.unan.edu.ni/wp-content/uploads/Estrategia_Nacional_Educacion-2024-2026.pdf |
| MINED — presentación de la Estrategia | Presentación oficial | https://www.mined.gob.ni/gobierno-de-nicaragua-presenta-nueva-estrategia-nacional-de-educacion/ |
| MARENA | Portal: 76 áreas protegidas (zonas núcleo), 4 reservas de biosfera | https://www.marena.gob.ni/ |

No se consultaron (sin verificar en esta sesión): Mapa Nacional de Turismo, Visit Nicaragua, INATEC (documento propio), CNU (documento propio). No se usan como fuente.

## 3. Matriz de alineación nacional (19 filas, `national_alignment`)

`alignment_type` solo admite `direct | supporting | potential`; **"official" está prohibido por restricción CHECK**.

| Marco | Eje / lineamiento | Componente BAQUEANO | Tipo |
|---|---|---|---|
| PNLCP-DH | Política Nacional de Turismo — Promoción Turística | Destinos, mapa, 6 idiomas, SEO | direct |
| PNLCP-DH | Diferenciación y diversificación (turismo creativo, cultural, rural; rutas, mapas) | Rutas, BAQUI, experiencias, mapa por territorio | direct |
| PNLCP-DH | Economía creativa, familiar y emprendedora | Mi Negocio, verificación en Ops Center, Protagonista local | direct |
| PNLCP-DH | Política de Patrimonio Cultural | Historia, música, gastronomía, crónicas | supporting |
| INTUR 2026 | 1 Promoción turística | Destinos, SEO, redes, multilenguaje | direct |
| INTUR 2026 | 2 Diferenciación y diversificación | Rutas, experiencias, BAQUI, turismo rural | direct |
| INTUR 2026 | 3 Infraestructura turística | Catálogo georreferenciado de servicios | supporting |
| INTUR 2026 | 4 Formación y capacitación | BAQUEANO LAB | potential |
| INTUR 2026 | 5 Calidad de los servicios | Verificación con fuente y vigencia | supporting |
| INTUR 2026 | 6 Enlazamiento y complementariedad | Contacto directo, reservas (embudo medible) | direct |
| INTUR 2026 | 7 Presencia y comunicación directa | Testimonios moderados, contacto local | supporting |
| INTUR | Turismo Rural y Comunitario | Insignia "Experiencia Comunitaria", filtros, mapa | direct |
| ENE 2024-2026 | Eje 3 · lineamiento 14 | BAQUEANO LAB | supporting |
| ENE 2024-2026 | Eje 4 · lineamiento 18 | Música, gastronomía, historia | supporting |
| ENE 2024-2026 | Eje 5 · lineamiento 20 | Historia de mi País, crónicas, audioguía | supporting |
| ENE 2024-2026 | Eje 6 · lineamiento 23 | Ficha de Sostenibilidad | potential |
| ENE 2024-2026 | Eje 7 · lineamiento 27 | Sostenibilidad, clima de ruta, áreas protegidas | potential |
| ENE 2024-2026 | Eje 11 · lineamiento 40 (INNOVATEC) | BAQUEANO LAB, BAQUI, Supabase | potential |
| MARENA | SINAP | Catálogo de naturaleza protegida | supporting |

Solo se vincularon **6 de los 16 ejes** educativos (3, 4, 5, 6, 7, 11), los demostrables con funciones reales. Cada fila guarda `source_name`, `source_url`, `verified_at`, `last_verified_at` y `verification_expiry`. Las fuentes de plan anual vencen el 2027-01-31; las demás, el 2027-04-05.

## 4. Archivos modificados o creados

| Archivo | Cambio |
|---|---|
| `supabase/migrations/20261005070000_impact_alignment.sql` | **Nuevo.** Tablas, vista, funciones, RLS, siembra de fuentes, matriz e indicadores |
| `supabase/functions/baqueano-ops/index.ts` | Acción `impact` (reporte + matriz + fuentes), lectura para todo el personal |
| `supabase/functions/baqueano-ai/index.ts` | Intención `impact`, `buildImpactAnswer` determinista en 6 idiomas, regla HECHO OFICIAL vs CONTRIBUCIÓN en el prompt |
| `website/js/ops-center/ops-live-data.js` | `strategicView`: 10 paneles, cobertura por territorio, matriz con vencimiento |
| `website/css/ops-matte-theme.css`, `website/admin.html` | Estilos del módulo y versión de caché |
| `website/nosotros.html` | Sección `#impacto` "Nuestro impacto" (sin eliminar nada) |
| `website/js/impact-public.js`, `website/css/pages/impacto.css` | **Nuevos.** Indicadores y matriz públicos |
| `website/js/baqueano-analytics.js` | Eventos `place_view`, `map_open`, `directions_click`, `qr_generated` y canal `baqueano:impact` |
| `website/js/madriz-territory-map.js` | Emite `place_view` al abrir la ficha de un lugar |
| `website/locales/{es,en,fr,it,pt,de}.json`, `assets/i18n/*` | 112 claves × 6 idiomas (exportadas a la App) |
| `website/scripts/impact-section.test.mjs`, `website/package.json` | **Nueva** prueba `npm run test:impact` |

## 5. Migración SQL (resumen)

- **Tablas:** `strategic_sources`, `national_alignment`, `impact_indicators` (definiciones, nunca valores manuales), `sustainability_practices` (`reported` / `verified_baqueano`), `community_impact` (insignia "Experiencia Comunitaria": solo `verified` + vigente, exige `verified_by`), `entity_accessibility` (solo se publica `verified`).
- **`businesses`:** columnas opcionales `protagonist_type` (9 categorías), `women_led`, `youth_led`, `rural_area`, `protagonist_verified_at`. Un valor `NULL` no se cuenta.
- **`impact_events`:** se creó como **VISTA**, no como tabla, sobre `analytics_events` y `commercial_actions` (place_view, business_view, map_open, directions_click, whatsapp_click, call_click, reservation_start, reservation_completed, visit, review, qr_generated). Así se evita duplicar la ingesta y la PII. Nuevos tipos: `place_viewed`, `qr_generated`, `reservation_completed` y `visit_confirmed` (los dos últimos solo los emite el servidor).
- **Funciones:**
  - `strategic_impact_report(desde, hasta)`: requiere `analytics.read`; devuelve los 10 paneles y el embudo.
  - `public_impact_summary()`: anónima, solo agregados.
  - `refresh_impact_verification_status()`: solo `service_role`; pasa a `needs_review` las fuentes y alineaciones vencidas y a `expired` las insignias vencidas.
- **RLS:** el público lee solo lo vigente o verificado; la escritura es exclusiva del servidor.
- **Validación:**
  - 52 sentencias analizadas con libpg_query (`pglast`), y los cuerpos PL/pgSQL con `parse_plpgsql`.
  - Todas las columnas referenciadas se confirmaron contra el esquema en vivo (solo lectura).
  - **No se ejecutó en una base real** porque el propietario rechazó aplicarla.

**Aplicar (cuando el propietario lo autorice):** `supabase db push`, o MCP `apply_migration` con el archivo. Después hay que desplegar `baqueano-ops` y `baqueano-ai`, y programar `select public.refresh_impact_verification_status();` cada día (pg_cron o un workflow).

## 6. Cambios en BAQUI

- La intención `impact` se activa solo si se menciona la plataforma (baqueano, baqui, plataforma, app) junto con contribución, impacto, plan nacional, INTUR o economía creativa. Prueba de detección: **7/7**, sin falsos positivos con preguntas turísticas como "playa en Rivas" o "impacto ambiental del volcán Masaya".
- La respuesta es **determinista**: no usa el modelo generativo. Lista `HECHO OFICIAL: <fuente> incluye «eje» (Fuente: URL)` → `CONTRIBUCIÓN DE BAQUEANO: <componente>`, luego los indicadores reales de Supabase y la advertencia de que BAQUEANO no forma parte oficial de esos planes.
- Sin datos, dice "Todavía no tengo indicadores verificados". Queda registrada en `baqui_log_exchange` con sus fuentes.
- El prompt general prohíbe afirmar reconocimiento institucional y exige distinguir el hecho oficial de la contribución.

## 7. Indicadores implementados (calculados al consultar, 0 = sin registros)

| Panel | Indicadores |
|---|---|
| Turismo | destinos publicados y verificados, rutas, experiencias, servicios, visitas generadas |
| Economía local | negocios locales y verificados, emprendimientos familiares, mujeres, jóvenes, cooperativas, rurales, sin categoría |
| Comunidad | comunidades, experiencias comunitarias verificadas y pendientes |
| Cultura | patrimonio, gastronomía, música, artesanía, festividades, personajes, leyendas, cultura |
| Ambiente | prácticas reportadas y verificadas, oferta con criterio responsable |
| Educación | lineamientos vinculados, evidencias de sprint (BAQUEANO LAB) |
| Tecnología | usuarios, consultas y sesiones de BAQUI, itinerarios, fichas, negocios vistos, mapa, cómo llegar, WhatsApp, llamar, reservas iniciadas y completadas, QR |
| Inclusión | atributos y lugares con accesibilidad verificada, 6 idiomas |
| Seguridad | contactos de emergencia (total, verificados, con ubicación), alertas SOS |
| Cobertura | departamentos y municipios catalogados y con contenido, `cobertura_territorial_baqueano` = municipios con contenido / 153 × 100, contenido en la Costa Caribe, tabla por territorio |

## 8. Evidencias de funcionamiento (ejecutadas el 2026-10-05)

| Prueba | Resultado |
|---|---|
| `npm run test:impact` (nueva, Playwright) | **26/26**: "Sin datos suficientes" sin servidor; valores exactos con respuesta simulada (`9 / 17`, `5 / 153`, `3,3 %`, `0` visible); 7 anchos de 320 a 1920 px sin desbordes ni objetivos táctiles < 44 px; contraste AA; foco visible; h2 etiquetado; 6 idiomas; sin afirmaciones de reconocimiento oficial |
| `npm run i18n` | 3814 claves × 6, 0 faltantes, 0 errores; App y Web sincronizadas |
| `npm test` (smoke) | OK |
| `npm run test:shell` | 3535 comprobaciones, 0 fallos |
| `npm run test:baqui` | 20/20 |
| `npm run test:territorios` | 17 territorios, 254 lugares OK |
| `seo-normalize.test.mjs` | 12/12 |
| `production-audit.mjs` | 31 páginas, **0 críticos**, 64 advertencias (previas) |
| Detección de intención de BAQUI | 7/7 |
| Migración | sintaxis SQL y PL/pgSQL válidas; columnas verificadas; **sin ejecutar** |

## 9. Clasificación de requisitos

| # | Requisito | Estado | Evidencia o motivo |
|---|---|---|---|
| — | Auditoría previa y reutilización | 🟢 | sección 1 |
| — | Fuentes oficiales con `source_name`, `source_url` y `verified_at` | 🟢 | `strategic_sources` y sección 2 |
| — | "Contribución", nunca "oficial" | 🟢 | CHECK en `alignment_type`, textos y prueba de la sección |
| 1 | Turismo: indicadores | 🟡 | código listo; sin aplicar en producción |
| 2 | Economía creativa / Protagonista local | 🟡 | columnas e indicadores listos; falta el selector en el formulario de Mi Negocio |
| 3 | Turismo rural: filtros e insignia "Experiencia Comunitaria" | 🟡 | tabla e insignia con verificación listas; falta el flujo de verificación en Ops Center y la insignia en la ficha |
| 4 | Cultura: relaciones destino ↔ historia ↔ música ↔ … | 🔴 | las tablas culturales están vacías; el contenido sigue en HTML |
| 5 | Ficha de Sostenibilidad | 🟡 | tabla y estados (reportada / verificada) listos; falta la interfaz en la ficha |
| 6 | BAQUEANO LAB | 🟡 | en la matriz e indicadores; falta la sección visible |
| 7 | Digital Impact Dashboard | 🟡 | panel Tecnología en Ops Center; depende de la migración y del despliegue de `baqueano-ops` |
| 8 | Trazabilidad del embudo | 🟡 | vista `impact_events` y eventos web (`place_view`, `map_open`, `directions_click`); faltan `qr_generated` (no hay generador de QR en la web) y `reservation_completed`/`visit` desde el servidor |
| 9 | SOS: contactos con distancia, fuente y `verified_at` | 🔴 | `emergencies` tiene 0 filas; no se cargaron contactos (no se inventan teléfonos) |
| 10 | Cobertura territorial | 🟡 | fórmula real y tabla por territorio listas; falta el mapa coroplético |
| 11 | Accesibilidad: filtros verificados | 🟡 | `entity_accessibility` lista; faltan filtros en la interfaz y datos |
| 12 | Costa Caribe | 🔴 | indicador `contenido_costa_caribe` listo; no se agregó contenido de RACCN/RACCS (requiere fuentes verificadas) |
| — | Matriz INTUR 2026 | 🟢 | 7 ejes con fuente (en repo; publicación pendiente de la migración) |
| — | Matriz de la Estrategia de Educación | 🟢 | 6 ejes demostrables, lineamientos citados textualmente |
| — | Ops Center: módulo de 10 paneles | 🟡 | implementado; sin datos en vivo hasta aplicar la migración |
| — | Página pública "Nuestro impacto" | 🟢 | `test:impact` 26/26; hoy muestra "Sin datos suficientes" (correcto) |
| — | BAQUI | 🟡 | implementado y probado (detección); falta desplegar `baqueano-ai` |
| — | i18n en 6 idiomas | 🟢 | `npm run i18n` |
| — | Vencimiento → `needs_review` | 🟡 | función lista; falta la programación diaria |
| — | Lighthouse antes y después | 🔴 | no ejecutado en esta sesión |
| — | Pruebas del mapa | 🟡 | `test:territorios` OK; `place_view` emitido sin prueba E2E propia |

**Avance real estimado: 55 %.** El código cubre casi todo el alcance de datos, panel, página pública y BAQUI, pero nada está en producción, y faltan las interfaces de verificación (insignia, sostenibilidad, accesibilidad, protagonista), los datos culturales, de SOS y del Caribe, y Lighthouse.

## 10. Riesgos pendientes

1. **Migración sin aplicar:** la página pública y BAQUI muestran "Sin datos suficientes" hasta aplicarla y desplegar las dos Edge Functions.
2. **Catálogo duplicado:** los 254 lugares del portal no están en Supabase, así que los indicadores subestiman la realidad hasta migrarlos.
3. `public_ecosystem_metrics` sigue rota para los visitantes anónimos (no se tocó; ya no la usa ninguna pantalla nueva).
4. Los atributos de mujer y joven son **autodeclarados**: se necesita consentimiento explícito en el formulario y publicarlos solo de forma agregada.
5. Las fuentes de plan anual (INTUR 2026, ENE 2024-2026) vencen el 2027-01-31 y requieren revisión.
6. Las 121 acciones de la Estrategia de Educación no se confirmaron.

## 11. Elementos que requieren convenio institucional

- Cualquier uso de "oficial", "aval", "parte del plan" o de logos de INTUR, MARENA, MINED, INATEC o CNU.
- Presentar BAQUEANO LAB como práctica o programa de INATEC, o inscripción en INNOVATEC o Hackathon Nicaragua.
- Una conexión directa del SOS con Policía, Bomberos, Cruz Roja o Cruz Blanca, MINSA o guardaparques (hoy solo hay "Información para contacto de emergencia").
- Sellos o certificaciones ambientales (solo "Práctica reportada" o "Práctica verificada por BAQUEANO").
- Uso de datos del Mapa Nacional de Turismo o de Visit Nicaragua más allá de citarlos como fuente.
