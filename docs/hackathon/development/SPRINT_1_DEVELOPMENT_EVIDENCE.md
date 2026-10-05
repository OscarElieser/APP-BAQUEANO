<!--
🎯 POR QUÉ: evidencia verificable de los requisitos de Desarrollo del Sprint 1 (Kronox 2026).
⚙️ CÓMO: estado antes/después, corrección y evidencia reproducible por requisito; cobertura ponderada.
📦 QUÉ: tabla del Sprint 1, cobertura y brechas.
-->

# Sprint 1 — Evidencia de Desarrollo

> Generado por `tools/kronox/gen-development-docs.mjs` desde `tools/kronox/development-requirements.mjs`. No editar a mano.

**Cobertura ponderada:** antes 49.2 % (5.90/12) → ahora **72.1 %** (8.65/12).

🟢 VERDE: 3 · 🟢⭐ SUPER AVANZADO: 0 · 🟡 AVANZADO: 7 · 🟠 EN PROCESO: 1 · 🔴 PENDIENTE: 1

| Sprint | ID | Requisito | Antes | Corrección realizada | Evidencia | Estado final | Brecha restante |
|---|---|---|---|---|---|---|---|
| 1 | S1-01 | Auditoría general del repositorio | 🟡 AVANZADO | Auditoría medida (inventario, secretos, Git, duplicados, BD real, producción en vivo). | docs/audit/SPRINT1_REPOSITORY_AUDIT.md; docs/database/AUDITORIA_BD_2026-10-05.md; kronox-evidence run 37263032958 | **🟢 VERDE** | — |
| 1 | S1-02 | Reorganización de carpetas | 🟠 EN PROCESO | Legado identificado (admin/, functions/, backend/) sin borrar; Android y Web separados. | SPRINT1_REPOSITORY_AUDIT.md §1 y §5 | **🟡 AVANZADO** | Marcar el legado en su propia raíz con un README de estado. |
| 1 | S1-03 | README técnico maestro | 🟡 AVANZADO | Sin cambio en esta ronda. | README.md | **🟡 AVANZADO** | Añadir cadena CLIENTE→WEB/APP→AUTH→BACKEND→SUPABASE→OPS→BAQUI y estado real de producción. |
| 1 | S1-04 | Arquitectura BAQUEANO | 🟢 VERDE | Arquitectura oficial vigente (Firebase Auth+Hosting, Supabase principal, Azure dominio). | docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md; AGENTS.md §5 | **🟢 VERDE** | — |
| 1 | S1-05 | Modelo ER Supabase | 🟠 EN PROCESO | Territorio normalizado (153 municipios + FK en 11 tablas), trazabilidad en 19 tablas, diccionario generado desde el catálogo. | migraciones 20261005051000…055000 (c5ef579); docs/database/DATA_DICTIONARY.md; SQL C10, C18, C20 | **🟡 AVANZADO** | Diagramas ER por dominio. |
| 1 | S1-06 | Firebase Authentication | 🟠 EN PROCESO | Sin cambio en esta ronda. | website/js/user-session.js; lib/ (Google Sign-In) | **🟡 AVANZADO** | Prueba E2E automatizada de registro, sesión y logout. |
| 1 | S1-07 | Roles y permisos | 🟢 VERDE | Permiso analytics.read para auditor/admin/superadmin; RPC de KPI protegido. | roles/permissions/user_roles; SQL C07–C08; kronox-evidence run 37263032958 (rpc-kpi 401) | **🟢 VERDE** | — |
| 1 | S1-08 | Interfaces navegables | 🟠 EN PROCESO | Verificación en vivo de 15 páginas críticas y 404 real. | kronox-evidence run 37263032958 (S3-10/page/*) | **🟡 AVANZADO** | Verificador automático de enlaces internos. |
| 1 | S1-09 | Formularios funcionales | 🔴 PENDIENTE | Feedback y acciones comerciales con RPC validado (rating 1..5, negocio existente). | track_commercial_action / submit_feedback; SQL C11, C13, C14 | **🟠 EN PROCESO** | Prueba de envío real de cada formulario visible. |
| 1 | S1-10 | Git y control de versiones | 🟠 EN PROCESO | CI en cada push; evidencia automática diaria. | .github/workflows/*.yml | **🟡 AVANZADO** | Etiquetas de release y commitlint. |
| 1 | S1-11 | Ejecución local | 🟠 EN PROCESO | Build web reproducible en CI y local (727 archivos). | deploy-production.yml checks; flutter_ci.yml | **🟡 AVANZADO** | Evidencia Android en dispositivo físico. |
| 1 | S1-12 | Video de navegación inicial | 🔴 PENDIENTE | — | — | **🔴 PENDIENTE** | Grabación del equipo. |
