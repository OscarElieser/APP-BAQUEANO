<!--
🎯 POR QUÉ: evidenciar el estado real de seguridad (OWASP, RLS, RBAC, secretos, perímetro).
⚙️ CÓMO: sondas externas desde un runner de GitHub, pruebas SQL con roles simulados y barrido del repositorio.
📦 QUÉ: controles aprobados, hallazgos abiertos y responsables.
-->
# Informe de seguridad — Kronox 2026

**Estado:** 🟡 AVANZADO (S3-04) · RLS 🟢 (S3-05) · RBAC 🟡 (S3-06).

## Controles verificados en vivo (run 37263032958)

| Control | Resultado |
|---|---|
| HTTP → HTTPS | 301 |
| TLS | TLS 1.3, Let's Encrypt, vence 2027-01-01 |
| HSTS | `max-age=31536000; includeSubDomains` |
| CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Presentes |
| Anti-framing | `X-Frame-Options: DENY` |
| Banner del servidor | `nginx`, sin versión |
| `/.git/config`, `/.env`, `/package.json`, `/supabase/config.toml`, `/README.md` | 404 |
| Puertos 5432, 3000, 6379, 8080, 3306 | Cerrados o filtrados |
| **Puerto 22** | ⚠️ **Abierto a Internet:** restringir el NSG (propietario) |

## RLS y pruebas negativas

- 66/66 tablas con RLS (`db_health_report().structure.tables_without_rls = []`, caso C17).
- En vivo, `anon` **no** escribe en `destinations`, `businesses` ni `municipalities` (401).
- En vivo, `anon` **no** lee `profiles`, `audit_logs`, `reservations`, `sos_events`, `analytics_events`, `commercial_actions`, `user_feedback`, `ai_messages` ni `staff_roles` (401, código 42501).
- En SQL, `anon` no sube archivos a Storage, no crea buckets, no hace TRUNCATE del catálogo y no ejecuta `kpi_dashboard()` ni `db_health_report()` (casos C01–C08).
- Las funciones SECURITY DEFINER fijan `search_path` (C17). `audit_logs` es inmutable mediante triggers (C21).
- La ingesta de analítica pasa solo por RPC: el `user_id` lo fija `auth.uid()`, nunca el cliente.

## Secretos

No hay `service_role`, claves privadas ni credenciales de Azure o Firebase Admin en el repositorio. Las claves `AIza…` y la clave `anon` son públicas por diseño; su restricción por referrer y por app es una acción del propietario en Google Cloud.

## Brechas

1. NSG: puerto 22.
2. Pruebas negativas con roles autenticados (usuario no administrador, auditor de solo lectura, admin sin superadmin).
3. Confirmar la restricción de las claves de navegador.
