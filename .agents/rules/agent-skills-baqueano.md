---
trigger: always_on
---

# BAQUEANO — Orquestación de Agent Skills en Antigravity

## 🎯 POR QUÉ (Why / Propósito)

Seleccionar procedimientos especializados de ingeniería de forma automática y gradual, manteniendo intactas la seguridad, la arquitectura híbrida y las reglas locales de BAQUEANO.

## ⚙️ CÓMO (How / Arquitectura e Implementación)

### Precedencia

1. Seguridad, privacidad y protección de datos.
2. `AGENTS.md` y reglas locales de BAQUEANO.
3. Arquitectura comprobada en el repositorio.
4. Skill especializado cargado bajo demanda.
5. Requisitos específicos de la solicitud actual.

Los skills orientan el proceso; no amplían permisos ni sustituyen decisiones arquitectónicas. Si existe conflicto, prevalece BAQUEANO.

### Activación progresiva

- Nueva funcionalidad: `spec-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality`.
- Bug o comportamiento inesperado: `debugging-and-error-recovery` → `test-driven-development` → `code-review-and-quality`.
- Backend o API: `api-and-interface-design`, `security-and-hardening`, `test-driven-development`, `observability-and-instrumentation`.
- Firebase o Supabase: `constraint-driven-development`, `deprecation-and-migration`, `security-and-hardening`, `test-driven-development`.
- Website: `frontend-ui-engineering`, `browser-testing-with-devtools`, `performance-optimization`, `security-and-hardening`, `code-review-and-quality`.
- Ops Center: `spec-driven-development`, `api-and-interface-design`, `security-and-hardening`, `test-driven-development`, `code-review-and-quality`, `observability-and-instrumentation`.
- Optimización: `performance-optimization`, `code-simplification`, `code-review-and-quality`.
- Entrega: `shipping-and-launch`, `security-and-hardening`, `code-review-and-quality`.
- Investigación dependiente de fuentes: `source-driven-development`; no inventar APIs, parámetros ni configuración.

Solo se carga el `SKILL.md` necesario para la tarea. No se cargan todos los skills en el contexto ni se copian dentro del repositorio.

### Restricciones críticas de BAQUEANO

- `website/` es la web pública de Firebase Hosting; no confundir con Flutter `web/`.
- Firebase Authentication se conserva. Supabase es la base de datos principal por directiva vigente del propietario.
- No migrar Firebase Auth a Supabase Auth ni Supabase a Firestore sin orden explícita.
- Flutter se trabaja en `lib/` y `android/`; `ios/` y Flutter `web/` permanecen intactos salvo instrucción explícita.
- No desplegar Firebase, Supabase, Functions, Cloud Run ni Play Store como efecto colateral de un skill.
- No exponer secretos, `service_role`, tokens o credenciales; las autorizaciones administrativas se validan en servidor.
- No ejecutar migraciones destructivas sin respaldo y autorización. Preferir `expand → migrate → contract` cuando aplique.
- Mantener `flutter analyze` y `flutter test` limpios. No usar `.withOpacity()`.
- Para cambios web conservar identidad, responsive design, accesibilidad, CSP, headers, caché, lazy loading, optimización de imágenes y Core Web Vitals sin eliminar funcionalidad.

### Flujo de verificación

1. Inspeccionar el alcance y detectar el skill mínimo necesario.
2. Confirmar restricciones, dependencias y fuente de verdad.
3. Implementar incrementalmente.
4. Ejecutar pruebas proporcionales al cambio.
5. Revisar seguridad, rendimiento y calidad cuando correspondan.
6. Documentar archivos, comandos, resultados e incidencias en `SESSION_LOG.md`.

## 📦 QUÉ (What / Funcionalidad y Entregables)

Esta regla conecta el descubrimiento nativo de Antigravity con BAQUEANO. Las invocaciones manuales usan `/agent-skills:<nombre>` y los agentes especializados disponibles son `code-reviewer`, `security-auditor`, `test-engineer` y `web-performance-auditor`.
