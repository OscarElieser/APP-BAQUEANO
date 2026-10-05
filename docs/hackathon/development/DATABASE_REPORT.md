<!--
🎯 POR QUÉ: evidencia de la base de datos central con datos del catálogo real.
⚙️ CÓMO: MCP de Supabase (catálogo, pruebas SQL revertidas, health report).
📦 QUÉ: estructura, seguridad, calidad de datos y brechas.
-->
# Informe de base de datos — Kronox 2026

**Estado:** S2-01 🟡 · S2-05 🟡 · S3-05 🟢 · S3-08 🟠.

| Medida | Valor |
|---|---|
| Tablas en `public` | 66, todas con RLS |
| Claves foráneas | 97 |
| Índices | 252 |
| Municipios | 153; 9 con coordenadas aproximadas, 144 sin coordenadas |
| Negocios enlazados a departamento y municipio | 5/5 (C18) |
| Pruebas SQL | 21/21 OK (`supabase/tests/database_central_cases.sql`) |
| Diccionario de datos | `docs/database/DATA_DICTIONARY.md`, generado desde el catálogo |

## Migraciones de esta fase (aplicadas y versionadas, `c5ef579`)

`20261005050000` cierre de seguridad de Storage · `051000/051100` territorio · `052000–052300` trazabilidad · `052500` migraciones pendientes del repositorio · `053000` trazabilidad de BAQUI · `054000/054100` analítica SMART y KPIs · `055000` salud y duplicados. Todas son aditivas: sin DROP, TRUNCATE ni DELETE masivo.

## Calidad de datos pendiente (no se inventa nada)

- 7 destinos publicados sin fuente.
- 5 negocios sin coordenadas.
- 1 teléfono compartido entre negocios.
- 144 municipios sin coordenadas.
- 0 usuarios en `auth.users`: la identidad sigue en Firebase.
