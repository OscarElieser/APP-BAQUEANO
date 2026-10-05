<!--
🎯 POR QUÉ: demostrar con pruebas ejecutadas, no con capturas, qué flujos de punta a punta funcionan hoy.
⚙️ CÓMO: pruebas SQL revertidas, sondas HTTP desde GitHub y pruebas de navegador (Chromium).
📦 QUÉ: flujos probados, resultado y flujos aún sin prueba E2E.
-->
# Informe E2E — Kronox 2026

**Fecha:** 2026-10-05 · **Estado:** 🟠 EN PROCESO (S3-07, S3-17).

## Flujos con prueba ejecutada

| Flujo | Cómo se probó | Resultado |
|---|---|---|
| Visitante → `destination_viewed` (con UTM) → `favorite_added` → WhatsApp → feedback → KPI | `supabase/tests/database_central_cases.sql` C11, C15 y C16, como `anon` y luego como servidor; transacción revertida | ✅ los KPIs reflejan activación, conversión y feedback; la atribución UTM queda por sesión |
| Cliente intenta emitir `user_registered` | C12 y la sonda en vivo `S3-05/rpc-server-event` | ✅ rechazado (400) |
| Acción comercial sobre un negocio inexistente; rating 9 | C13 y C14 | ✅ rechazados |
| CRUD de experiencia (crear → publicar → archivar) | C19 | ✅ |
| Navegación pública de 15 páginas críticas y 404 real | `kronox-evidence` run 37263032958 | ✅ 15/15 responden 200; la ruta inexistente responde 404 |
| Idioma por URL (`?lang=en`, `?lang=de`, código inválido) | Chromium (playwright-core) sobre el build | ✅ `en-US`, `de-DE`; un código inválido usa el idioma del navegador |

## Flujos sin prueba E2E con navegador (brecha)

- Google Login → `profiles` → `user_registered` (servidor) → BAQUI → favorito → reserva → KPI en Ops → verificación por admin → `audit_logs`. La cadena de datos está probada en SQL; falta recorrerla con un navegador y una cuenta de prueba, que debe crear el propietario porque no se crean credenciales en producción.
- Una suite Playwright del flujo principal en CI (S3-17).
