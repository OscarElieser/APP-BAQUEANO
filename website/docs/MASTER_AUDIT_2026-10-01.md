# Auditoría maestra de BAQUEANO — 2026-10-01

## 🎯 POR QUÉ

Establecer una línea base reproducible antes de intervenir profundamente BAQUEANO, separando defectos comprobados de suposiciones y protegiendo contenido, identidad, Firebase Authentication y Supabase.

## ⚙️ CÓMO

Se ejecutaron lint, typecheck, pruebas smoke, auditorías Playwright existentes y búsquedas estáticas dirigidas sobre las 29 páginas HTML públicas. No se eliminó ni corrigió código durante esta fase; cada hallazgo incluye impacto, riesgo y método de validación.

## 📦 QUÉ

Inventario priorizado P0–P3, puntuación técnica, fallos de la propia infraestructura QA y orden recomendado de corrección incremental.

## Veredicto de integridad

**Resultado: requiere correcciones antes de publicación.** La identidad BAQUEANO es coherente y existen sistemas globales de navegación, accesibilidad, datos y trazabilidad. Sin embargo, la suite de producción no está limpia, el auditor E2E no completa su recorrido y persisten patrones heredados que impiden demostrar ausencia de regresiones.

## Puntuación de salud

| Dimensión | Puntuación | Evidencia principal |
|---|---:|---|
| Accesibilidad | 2/4 | 35 botones sin `type`; controles heredados con iconos Unicode; auditoría E2E incompleta. |
| Rendimiento | 1/4 | 322 imágenes HTML y ninguna coincidencia de `loading="lazy"`; abundante carga global por página. |
| Responsive | 2/4 | Existen breakpoints y capturas previas, pero la corrida actual multirresolución no completó. |
| Theming | 2/4 | Paleta consistente, con numerosos colores y estilos inline fuera de tokens. |
| Integridad | 2/4 | Lint/typecheck limpios, pero smoke y auditoría funcional fallan. |
| **Total** | **9/20** | **Deficiente: necesita correcciones mayores verificadas.** |

## Resumen ejecutivo

- P0 confirmados: 0.
- P1: 5.
- P2: 4.
- P3: 1.
- `pnpm lint`: aprobado para web y admin.
- `pnpm typecheck`: aprobado para web y admin.
- `production-smoke.test.mjs`: falló con 12 incidencias.
- `final-website-audit.mjs`: no completa por selector Playwright ambiguo.
- `visual-audit.mjs`: espera un servidor diferente en `localhost:3000` y no es autocontenido.

## Hallazgos P1

### P1 — La suite smoke de producción no está limpia

- **Ubicación:** `website/scripts/production-smoke.test.mjs` y 10 páginas HTML.
- **Causa:** enlaces a la portada genérica de YouTube, una referencia a `pasaporte.html` inexistente y clasificación incorrecta del canonical absoluto de `ayuda.html` como enlace local ausente.
- **Impacto:** no puede aprobarse una entrega ni distinguir regresiones nuevas de deuda existente.
- **Riesgo al corregir:** bajo si se conserva cada enlace y solo se apunta al recurso canónico correcto; medio para `pasaporte.html`, porque debe resolverse su destino funcional sin borrar el acceso.
- **Prueba:** `corepack pnpm test`.
- **Acción recomendada:** `$impeccable harden`.

### P1 — El auditor funcional falla antes de terminar

- **Ubicación:** `website/scripts/final-website-audit.mjs:40`.
- **Causa:** `.bq-comment-form button` coincide con cerrar, cancelar y publicar; Playwright strict mode exige un objetivo único.
- **Impacto:** navegación, comentarios y regresiones posteriores quedan sin cobertura real.
- **Riesgo:** bajo; cambiar a un selector semántico del submit no altera producto.
- **Prueba:** ejecutar el servidor en `127.0.0.1:4179` y luego `node scripts/final-website-audit.mjs`.
- **Acción recomendada:** `$impeccable harden`.

### P1 — Imágenes sin política declarativa de carga

- **Ubicación:** conjunto de 29 archivos HTML; inventario estático: 322 etiquetas `img`, 0 coincidencias de `loading="lazy"`.
- **Causa:** contenido heredado carga imágenes sin clasificación above/below-the-fold.
- **Impacto:** mayor transferencia inicial, competencia por red y peor experiencia móvil.
- **Riesgo:** medio; héroes y contenido crítico deben conservar carga prioritaria mientras galerías y tarjetas pasan a carga diferida.
- **Prueba:** inventario HTML, waterfall y LCP por ruta.
- **Acción recomendada:** `$impeccable optimize`.

### P1 — Botones heredados sin tipo explícito

- **Ubicación:** 484 botones HTML; 449 declaran `type`; las 35 coincidencias restantes incluyen `admin.html`, `index.html`, páginas legales, departamento y negocio.
- **Causa:** controles agregados progresivamente sin contrato uniforme.
- **Impacto:** dentro de formularios pueden ejecutar submit accidental, duplicar operaciones o romper flujos.
- **Riesgo:** bajo si se clasifica cada control; los submit reales deben permanecer como tales.
- **Prueba:** búsqueda PCRE2 y pruebas de formularios.
- **Acción recomendada:** `$impeccable harden`.

### P1 — Auditoría visual no autocontenida

- **Ubicación:** `website/scripts/visual-audit.mjs`.
- **Causa:** espera `localhost:3000` pero no inicia ni valida el servidor requerido.
- **Impacto:** CI y desarrolladores obtienen falsos fallos o no pueden repetir capturas responsive.
- **Riesgo:** bajo al parametrizar `BASE_URL` y comprobar disponibilidad.
- **Prueba:** `node scripts/visual-audit.mjs` sin preparación manual.
- **Acción recomendada:** `$impeccable adapt`.

## Hallazgos P2

### P2 — Enlaces sociales genéricos e inconsistentes

- **Ubicación:** ambiental, aviso legal, BAQÜI, cookies, destinos, historia, nosotros, perfil, privacidad y términos.
- **Impacto:** el usuario abandona BAQUEANO hacia una portada genérica y la navegación social pierde credibilidad.
- **Recomendación:** mantener cada enlace, pero unificarlo con el canal canónico ya utilizado en otras páginas.

### P2 — Configuración Firebase duplicada

- **Ubicación:** `website/js/firebase-config.js` y `website/js/user-session.js`.
- **Impacto:** dos identificadores públicos distintos pueden producir autenticación o analítica contra proyectos diferentes.
- **Seguridad:** una clave web Firebase pública no es por sí sola un secreto; el control real depende de App Check, reglas y dominios autorizados. Debe verificarse la coherencia sin reemplazar credenciales a ciegas.
- **Recomendación:** consolidar la lectura de configuración y auditar Rules/App Check por separado.

### P2 — Uso extendido de estilos inline y controles Unicode

- **Ubicación:** páginas legales, `index.html`, `admin.html` y componentes heredados.
- **Impacto:** dificulta theming, estados focus consistentes y mantenimiento responsive.
- **Recomendación:** migración progresiva hacia clases existentes; no reemplazar contenido ni iconografía válida sin inventario.

### P2 — Cobertura visual actual no demostrada

- **Ubicación:** matriz requerida 320–1440 px.
- **Impacto:** existen capturas históricas, pero no una corrida actual completa posterior a cambios globales de i18n y BAQÜI.
- **Recomendación:** reparar primero el runner y ejecutar una sola ronda agrupada desktop/mobile.

## Hallazgo P3

### P3 — Alertas de normalización LF/CRLF

- **Ubicación:** archivos modificados reportados por `git diff --check`.
- **Impacto:** no altera ejecución, pero genera ruido de revisión.
- **Recomendación:** mantener la política Git existente y no reformatear masivamente archivos no relacionados.

## Fortalezas verificadas

- TypeScript y ESLint limpios en aplicaciones web y admin.
- Paleta BAQUEANO consistente y componentes globales reutilizables presentes.
- Firebase Authentication y Supabase conservan responsabilidades diferenciadas.
- RLS y escritura backend-only están presentes en las migraciones recientes.
- El motor i18n dispone de seis catálogos estructuralmente equivalentes.
- BAQÜI ya separa sesión de viaje, conocimiento y candidatos de aprendizaje.

## Orden recomendado

1. **P1 — `$impeccable harden`:** reparar runners QA, botones sin tipo y rutas/enlaces fallidos.
2. **P1 — `$impeccable optimize`:** clasificar imágenes críticas y diferidas; medir LCP y transferencia.
3. **P1 — `$impeccable adapt`:** ejecutar matriz responsive reproducible tras reparar el runner.
4. **P2 — `$impeccable harden`:** consolidar configuración Firebase con validación de Auth, Rules y App Check.
5. **P2 — `$impeccable polish`:** consolidar estilos inline y estados visuales después de estabilizar funcionalidad.

## Condición para pasar a corrección

Cada intervención debe conservar el elemento existente, registrar problema/causa/solución/riesgo/prueba y volver a ejecutar smoke, lint, typecheck y las rutas dependientes. Ningún fallo previo se considerará resuelto mediante exclusión silenciosa de la prueba.
