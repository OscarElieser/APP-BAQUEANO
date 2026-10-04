# Auditoría integral BAQUEANO — 2026-10-03

<!--
🎯 POR QUÉ (WHY / PROPÓSITO):
Consolidar evidencia verificable de arquitectura, seguridad, Flutter Android y
web para priorizar correcciones por impacto sin intentar transformar todo el
ecosistema en una sola intervención.

⚙️ CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
La revisión se dividió en tres frentes de solo lectura, contrastó código,
configuración y pruebas existentes, y clasificó cada hallazgo P0–P4. Las
afirmaciones remotas no verificables se mantienen como pendientes explícitos.

📦 QUÉ (WHAT / ENTREGABLES):
Este documento registra causa raíz, evidencia, riesgo, solución aplicada,
pruebas y siguiente orden de ejecución.
-->

## Resumen ejecutivo

La prioridad inmediata estaba en Supabase: políticas históricas permitían
mutaciones públicas de Storage y acceso público a PII de auditoría y
telemetría. La migración `20261003213000_lock_down_sensitive_surfaces.sql`
cierra esas rutas y reserva las tablas sensibles al backend. No se desplegó ni
se modificaron datos remotos.

El siguiente bloque crítico es Android: la ruta administrativa carece de guard
de rol y la membresía se considera activa usando solo estado local. Después
debe corregirse la autorización de las Edge Functions y completarse el espejo
Firestore → Supabase con una cola/reintento observable.

## Problemas encontrados y causa raíz

| Prioridad | Área | Evidencia | Causa raíz | Estado |
|---|---|---|---|---|
| P0 | Storage Supabase | `supabase/migrations/008_storage_buckets_setup.sql` y `009_storage_bucket_policies.sql` | RLS se usó como filtro de bucket, no como autorización de operador | Corregido en migración aditiva |
| P0 | Auditoría/telemetría | `010_audit_logs.sql` y `011_traffic_telemetry.sql` | Políticas `USING (true)` sobre PII y evidencia operativa | Corregido en migración aditiva |
| P0 | Flutter admin | `lib/config/app_router.dart:222` | Router estático sin guard reactivo de sesión/rol | Pendiente, bloque siguiente |
| P0 | Membresía Android | `lib/services/passport_membership_service.dart:59` | Beneficio autoritativo almacenado solo en preferencias locales | Pendiente, bloque siguiente |
| P1 | Espejo de datos | `pubspec.yaml` y escrituras de `lib/services/firestore_service.dart` | Android escribe únicamente a Firestore y silencia fallos | Pendiente |
| P1 | Edge IA/espejo | `supabase/config.toml` y `supabase/functions/` | Autenticación/autorización insuficiente antes de usar `service_role` | Pendiente |
| P1 | SEO/PWA web | 28/30 HTML sin canonical, 29/30 sin Open Graph y 30/30 sin enlace manifest | Metadatos repetidos sin plantilla común de build | Pendiente |
| P1 | Accesibilidad web | Texto blanco/naranja de marca ronda 3.2:1 | Color de acción usado también como combinación de texto normal | Pendiente |
| P2 | Rendimiento web | Multimedia de hasta ~73 MB y transiciones de layout | Activos sin presupuesto y animaciones sobre propiedades geométricas | Pendiente |
| P2 | Flutter lifecycle/imágenes | usos directos de `Image.network`; `setState` tras `await`; mapa sin liberar | Helper y disciplina de ciclo de vida no aplicados sistemáticamente | Pendiente |

## Archivos modificados

- `supabase/migrations/20261003213000_lock_down_sensitive_surfaces.sql`
- `supabase/tests/sensitive_surfaces_rls.test.sql`
- `SESSION_LOG.md`
- `docs/audit/INTEGRAL_AUDIT_2026-10-03.md`

## Arquitectura y seguridad

- Se mantuvo lectura pública de objetos en `baqueano-media`.
- Se eliminaron exclusivamente las políticas de mutación cliente y creación de
  buckets.
- `audit_logs`, `traffic_sessions`, `backup_operations` y
  `ops_backup_entities` revocan privilegios de `PUBLIC`, `anon` y
  `authenticated`; `service_role` conserva acceso backend.
- Las migraciones históricas permanecen intactas para preservar trazabilidad.

## Performance, UX/UI, responsive, accesibilidad y SEO

No se alteró UI en este bloque porque los P0 de datos tenían mayor impacto. La
web conserva fortalezas verificadas: todas las imágenes HTML auditadas tienen
`alt`, existe capa central de foco/touch y el smoke test pasa. Los defectos de
metadatos, contraste, movimiento reducido, activos pesados y arquitectura del
shell global quedan priorizados para bloques acotados posteriores.

## Base de datos

El cambio es aditivo, idempotente para las políticas nombradas y no elimina
tablas, filas ni buckets. La prueba pgTAP comprueba privilegios efectivos y que
las cuatro rutas públicas de Storage no reaparezcan.

## Pruebas

- `git diff --check`: correcto.
- `corepack pnpm --dir website test`: correcto.
- Validación estática: 11 políticas retiradas, 4 revocaciones y 16 aserciones
  alineadas con `plan(16)`.
- `supabase test db`: pendiente; la CLI Supabase no está instalada localmente.
- `flutter analyze` y `flutter test`: inconclusos por timeout/procesos Dart
  concurrentes; no se declara Flutter limpio.

## Pendiente priorizado

1. P0: guard reactivo de `/admin` y autorización dentro de servicios Flutter.
2. P0: mover membresía/beneficios a estado firmado y verificado por backend.
3. P1: autenticar y limitar Edge IA; validar propiedad en el espejo.
4. P1: implementar réplica Firestore → Supabase con outbox, reintentos y DLQ.
5. P1: generar canonical/Open Graph/manifest desde un pipeline común.
6. P2: presupuesto multimedia, imágenes Android acotadas y lifecycle seguro.

