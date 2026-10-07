# 🧭 BAQUEANO AGENTS & CODEBASE STANDARD

## 🌟 Reglas Fundamentales del Proyecto:

1. **Documentación Obligatoria bajo el Círculo Dorado (Golden Circle)**:
   - Todo archivo y componente nuevo o modificado debe incluir un encabezado exhaustivo con:
     - 🎯 **POR QUÉ (Why / Propósito)**
     - ⚙️ **CÓMO (How / Arquitectura & Implementación)**
     - 📦 **QUÉ (What / Funcionalidad & Entregables)**
   - Explicar las decisiones de diseño y lógica paso a paso para que cualquier desarrollador entienda su importancia.

2. **Modo Pro de Alta Gama Visual y Técnico**:
   - Paleta de colores oficial: `#165D6F`, `#F65E01`, `#F4E6C1`, `#0F172A`.
   - Efectos Glassmorphism, animaciones continuas a 60fps, y sombras profundas.
   - Cero uso de `.withOpacity()`, siempre utilizar `.withValues(alpha: X)`.
   - Mantener siempre `flutter analyze` y `flutter test` en 100% limpio.
   - Prohibido terminantemente el uso de la palabra p-r-e-m-i-u-m en cualquier archivo, código o comentario del proyecto.

3. **100% Responsivo y Multiplataforma en Diseño**:
   - Asegurar que la interfaz se adapte con total fluidez a formatos móviles, tablets y pantallas variadas.

4. **Enfoque de Plataforma Exclusivo en Android**:
   - Todo el desarrollo, pruebas, configuraciones nativas y optimizaciones se centrarán exclusivamente en **Android** (`android/` y `lib/`).
   - Queda estrictamente prohibido modificar o alterar los directorios y configuraciones de `ios/` y `web/`.

5. **Auditoría Continua de Arquitectura, Rendimiento y Estabilidad (Senior Performance Standard)**:
   - Prohibido ejecutar tareas pesadas o transformaciones síncronas en el Main UI Thread.
   - Prevención activa de ANRs (Application Not Responding) mediante `RepaintBoundary` en listas, galerías y componentes interactivos.
   - Prevención de fugas de memoria (Memory Leaks) y OOM Crashes: todo renderizado de imágenes debe acotar `cacheWidth`/`cacheHeight` al viewport del dispositivo.
   - Manejo de excepciones defensivo estricto (`try/catch`), verificación `if (mounted)` en contextos asíncronos y validación rigurosa de valores nulos o no finitos.
   - El ciclo de vida de componentes reciclables debe implementar `didUpdateWidget` y `ValueKey` estable para erradicar estados huérfanos o desincronizados.

6. **Autonomía Operativa Total (Auto-Decision / Default Opción 1)**:
   - Queda prohibido detener el flujo solicitando modales o cuestionarios interactivos de confirmación (`ask_question`) ante decisiones predecibles o configuraciones estándar.
   - El asistente debe actuar de forma autónoma e inmediata, seleccionando siempre por defecto la **Opción 1 (la recomendada y de mejor estándar técnico)** y ejecutando la solución completa de punta a punta.
   - Solo se requerirá intervención del usuario en casos donde una acción cause pérdida destructiva e irreversible de datos.

7. **Bitácora Persistente de Consultas y Sesión Antigolpes (Crash & Interruption Resilience — Write-Ahead Logging)**:
   - **PRIORIDAD ABSOLUTA #1 — REGISTRO PREVIO OBLIGATORIO:** Ante CUALQUIER consulta, cambio o solicitud del usuario, el primerísimo paso innegociable antes de ejecutar cualquier análisis, herramienta, comando o edición de código es escribir y guardar la solicitud en `SESSION_LOG.md`.
   - Toda directiva técnica, archivo modificado, decisión y avance del proyecto debe registrarse y actualizarse de manera obligatoria en `SESSION_LOG.md` en la raíz del proyecto.
   - Al finalizar o alcanzar un avance verificable, `SESSION_LOG.md` se actualiza con los entregables, pruebas y estado exacto para garantizar continuidad fluida.
   - Ante cualquier apagón, corte de energía o pérdida de sesión, el asistente consultará inmediatamente este archivo para reanudar el trabajo exactamente en el último punto sin pérdida de contexto.

8. **Franja viva de lugares en todos los territorios (Regla del propietario, 2026-10-05)**:
   - Los 15 departamentos y las 2 regiones autónomas (y todo territorio futuro) deben tener bajo su mapa la franja de lugares en **movimiento automático** y una **ficha informativa** al tocar cada lugar o pin.
   - Cada lugar tiene descripción propia (`desc`) en `website/js/territories-data.js`; nunca se reutiliza la información de otro lugar.
   - Detalle: `.agents/rules/franja_viva_territorios.md`. Prueba obligatoria en CI: `website/scripts/territory-places-rule.test.mjs`.

9. **Internacionalización obligatoria (Regla del propietario, 2026-10-05)**:
   - Todo texto visible de interfaz (HTML, JS dinámico, React/Next, Ops Center, BAQUI, errores, toasts, modales, `aria-label`, `placeholder`, `title`, `alt`, títulos y meta) usa una **clave semántica** de los catálogos `website/locales/{es,en,fr,it,pt,de}.json` (es-NI es fuente y respaldo).
   - HTML: `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-aria-label`, `data-i18n-alt`. JS: `BaqueanoLanguage.t('clave')`. React: `useBaqueanoI18n().t('clave')` o `<T k="clave" />` (`@baqueano/i18n`). Nombres propios y marcas: `data-no-translate` / `translate="no"`.
   - Toda clave nueva entra en los 6 idiomas a la vez (`npm run i18n:add lote.json`). Prohibido crear catálogos paralelos o claves tipo `texto1`.
   - Puerta CI `npm run i18n`: falla si falta una clave/traducción o si un archivo agrega texto de interfaz sin clave (trinquete contra `website/scripts/i18n-baseline.json`, que solo puede bajar). Cobertura: `website/docs/i18n-coverage.md`.

10. **Verificación ambiental con evidencia trazable (Regla del propietario, 2026-10-05)**:
   - "Ningún contenido ambiental podrá marcarse como verificado o publicarse con check BAQUEANO si no existe evidencia trazable de la fuente oficial o validación documentada correspondiente."
   - Mapa: "Un área protegida puede estar publicada informativamente sin navegación; el botón 'Cómo llegar' solo se habilita cuando existe un punto de acceso validado. El centro geográfico de una reserva no se utilizará automáticamente como entrada turística."
   - Publicada al visitante en `website/ambiental.html#verificacionAmbiental` (claves `pages.ambiental.verificacion.*`).

11. **Precios: córdobas primero, luego dólares (Regla del propietario, 2026-10-07)**:
   * Todo precio visible (fichas de negocios, BAQÜI, planificador, PDFs, Ops) se muestra primero en córdobas (C$) y después en dólares (US$).
   * Si el negocio publica en dólares, la conversión usa el cambio de referencia del proyecto (C$ 36.6243 por US$ 1, verificado el 2026-10-01) y se dice en la ficha que el original está en dólares.
   * Nunca se inventa un precio: solo se convierte el que entregó el negocio o el que figura en `public.prices`.

## BAQUEANO Agent Skills Orchestration

### 🎯 POR QUÉ (Why / Propósito)

Integrar los procedimientos especializados del plugin global `agent-skills` de Antigravity sin reemplazar las normas, la arquitectura ni la identidad de BAQUEANO.

### ⚙️ CÓMO (How / Arquitectura e Implementación)

1. Antigravity evaluará la intención de cada solicitud y cargará progresivamente solo los skills necesarios. Queda prohibido cargar todos los `SKILL.md` simultáneamente.
2. Los skills son procedimientos de trabajo. No autorizan despliegues, migraciones destructivas, cambios de plataforma ni acciones fuera del alcance solicitado.
3. La precedencia obligatoria es: protección de datos y seguridad → este `AGENTS.md` → arquitectura comprobada de BAQUEANO → skill especializado → requisitos concretos de la tarea.
4. Ante cualquier conflicto entre una guía genérica y una regla de BAQUEANO, prevalece BAQUEANO.
5. Arquitectura oficial de transición (directiva del propietario, 2026-10-05; sustituye todas las variantes anteriores): **Supabase = fuente principal de verdad operacional** para PostgreSQL/PostGIS, contenido, catálogo, negocios, reservas, perfiles centrales, RBAC, Storage nuevo, Edge Functions, Realtime selectivo, impacto y BAQUI. **Firebase permanece integrado** para Firebase Auth actual, Google Sign-In, FCM, Analytics, App Check y compatibilidad con Firestore, Storage, Hosting, Functions, datos y archivos heredados. Nada de Firebase se borra o desactiva hasta demostrar respaldo, reemplazo, pruebas Web/Android/Ops/BAQUI y rollback, con autorización expresa.
5b. **Identidad coexistente sin duplicados:** Firebase Auth y Supabase Auth convergen progresivamente en un único perfil BAQUEANO dentro de Supabase DB. `profiles` representa a la persona; `identity_links` relaciona identidades Firebase/Supabase/Google/email mediante identificadores únicos y correo verificado. Firebase Auth no se reemplaza abruptamente. Las nuevas escrituras operacionales migradas van a Supabase; Firestore y archivos estáticos permanecen como legado/compatibilidad hasta validar cada módulo. Detalle: `docs/architecture/DATA_ARCHITECTURE.md` y `docs/architecture/SUPABASE_SOURCE_OF_TRUTH.md`.
6. El desarrollo Flutter se limita a Android, principalmente `lib/` y `android/`. No modificar `ios/` ni el directorio Flutter `web/` sin instrucción explícita.
7. Las invocaciones manuales canónicas usan el namespace `/agent-skills:<skill>`. Los aliases heredados son secundarios y pueden no aparecer en Antigravity 1.x.
8. Antes de instalar dependencias, modificar autenticación, reglas, RLS, migraciones, CSP o infraestructura, aplicar análisis de restricciones, seguridad, pruebas y revisión proporcional al riesgo.
9. No copiar el repositorio `addyosmani/agent-skills` dentro de BAQUEANO. La instalación global nativa de Antigravity es la fuente de los skills y agentes.

### 📦 QUÉ (What / Funcionalidad y Entregables)

- Regla operativa detallada: `.agents/rules/agent-skills-baqueano.md`.
- Manual de instalación, uso, actualización y recuperación: `docs/architecture/AGENT_SKILLS_ANTIGRAVITY.md`.
- Plugin esperado: `agent-skills`, con activación automática por intención y carga bajo demanda.

## 21ST MCP

Use 21st MCP for UI discovery, component research, interface generation and visual refinement. Never copy components blindly. Adapt them to BAQUEANO architecture, design system, accessibility, security and performance standards. 21st is a design/development tool and must not override BAQUEANO architecture or business logic.

## OPENDESIGN (herramienta local de diseño, 2026-10-05)

OpenDesign (`nexu-io/open-design`, Apache-2.0) se instala en la computadora del propietario y se conecta a Antigravity / Claude Code por MCP (`od mcp install antigravity`). No se copia al repositorio ni forma parte del build de producción. Sus propuestas se adaptan a la arquitectura, paleta, i18n (6 idiomas), accesibilidad y seguridad de BAQUEANO; nunca se aplican a ciegas. Guía: `docs/architecture/OPEN_DESIGN_ANTIGRAVITY.md`.

## GRAPHIFY (grafo de código para agentes, 2026-10-05)

Graphify (fork `OscarElieser/graphify`, Apache-2.0) indexa el código de BAQUEANO (Android, web, Supabase, Azure, scripts y docs; excluye binarios e `ios/`, `web/` y `windows/` mediante `.graphifyignore`) en un grafo que los agentes consultan antes de leer archivos (`graphify query "…"`). La salida `graphify-out/` no se versiona y se regenera con `graphify update .` (solo AST, sin costo de API); en Claude Code lo hace el hook de inicio de sesión. En Antigravity: `graphify antigravity install`. El grafo orienta, no es evidencia. Guía: `docs/architecture/GRAPHIFY.md`.

## 4C MARKETING MODEL

When implementing marketing, UX, discovery, booking or business features, evaluate the solution against BAQUEANO's 4C model: Consumer, Cost, Convenience and Communication. Refer to `docs/design/MARKETING_4C_BAQUEANO.md` and `docs/design/DESIGN.md`.

