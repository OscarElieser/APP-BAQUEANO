<!--
🎯 POR QUÉ: auditoría final de Desarrollo (Sprints 1–3) con clasificación honesta: nada en verde sin evidencia.
⚙️ CÓMO: cobertura ponderada calculada desde la fuente única; evidencia en vivo desde un runner de GitHub (workflow kronox-evidence).
📦 QUÉ: resumen por sprint, listas por color, riesgos, acciones del propietario y tabla completa.
-->

# Auditoría final de Desarrollo — Sprints 1, 2 y 3

> Generado por `tools/kronox/gen-development-docs.mjs` desde `tools/kronox/development-requirements.mjs`. No editar a mano.

**Desarrollo NO se declara terminado:** existen requisitos en proceso o pendientes y un fallo crítico en producción (la VM no sirve `main`).

## Cobertura ponderada

| Sprint | Requisitos | Antes | Ahora |
|---|---:|---:|---:|
| Sprint 1 | 12 | 49.2 % | **72.1 %** |
| Sprint 2 | 16 | 41.6 % | **69.4 %** |
| Sprint 3 | 20 | 42.8 % | **59.0 %** |
| **Total** | 48 | 44.0 % | **65.7 %** |

Ponderación: VERDE = 1 · SUPER AVANZADO = 1 · AVANZADO = 0,75 · EN PROCESO = 0,40 · PENDIENTE = 0.

## 🟢 VERDE (8)

- **S1-01** Auditoría general del repositorio
- **S1-04** Arquitectura BAQUEANO
- **S1-07** Roles y permisos
- **S2-13** Build Website
- **S2-16** Dominio
- **S3-01** Dominio de producción
- **S3-02** HTTPS, SSL y DNS
- **S3-05** Supabase RLS

## 🟢⭐ SUPER AVANZADO (0)

- Ninguno.

## 🟡 AVANZADO (25)

- **S1-02** Reorganización de carpetas — Marcar el legado en su propia raíz con un README de estado.
- **S1-03** README técnico maestro — Añadir cadena CLIENTE→WEB/APP→AUTH→BACKEND→SUPABASE→OPS→BAQUI y estado real de producción.
- **S1-05** Modelo ER Supabase — Diagramas ER por dominio.
- **S1-06** Firebase Authentication — Prueba E2E automatizada de registro, sesión y logout.
- **S1-08** Interfaces navegables — Verificador automático de enlaces internos.
- **S1-10** Git y control de versiones — Etiquetas de release y commitlint.
- **S1-11** Ejecución local — Evidencia Android en dispositivo físico.
- **S2-01** Supabase producción — Evidencia de backups (PITR/diario) del plan.
- **S2-02** Website a Supabase — Trackers web conectados en páginas públicas.
- **S2-04** Ops Center CRUD — Prueba E2E de restaurar.
- **S2-05** Catálogo turístico normalizado — 7 destinos publicados sin fuente.
- **S2-06** Departamentos dinámicos — Páginas aún apoyadas en territories-data.js estático.
- **S2-08** Mapa turístico — POI leídos desde Supabase.
- **S2-09** Buscador global — Índice generado desde datos publicados en Supabase.
- **S2-10** BAQUI integrado — Prueba del caso multidestino en producción.
- **S2-14** APK Android — Trazabilidad APK↔commit y prueba en dispositivo físico.
- **S2-15** Cumplimiento Azure — Puerto 22 abierto a Internet; autodeploy detenido.
- **S3-03** Firebase URL de respaldo — Publicado cuando la VM retome el autodeploy.
- **S3-04** Seguridad final OWASP — Cerrar puerto 22 en el NSG.
- **S3-06** RBAC real — Pruebas negativas por rol autenticado (usuario, auditor, admin).
- **S3-11** BAQUI final — Caso León+Carazo+Rivas, 4 viajeros, USD 500 automatizado.
- **S3-12** PWA y offline — Prueba offline automatizada.
- **S3-14** SEO nacional e internacional — Visible en vivo tras desbloquear la VM.
- **S3-15** Internacionalización ×6 — 731 textos JS y TSX pendientes de clave.
- **S3-19** README de despliegue — Prueba de rollback registrada.

## 🟠 EN PROCESO (12)

- **S1-09** Formularios funcionales — Prueba de envío real de cada formulario visible.
- **S2-03** Firebase Auth a Supabase — 0 usuarios en auth.users: no se declara migrado.
- **S2-07** Municipios dinámicos — 144 municipios sin coordenadas; sin página por municipio.
- **S2-11** Mi Viaje — Sincronización entre dispositivos demostrada.
- **S2-12** Emergencias — Filtrar a solo verificados en la UI con prueba.
- **S3-07** Flujo usuario E2E — Flujo con navegador: login→destino→BAQUI→favorito→reserva→Ops.
- **S3-08** Integración final de BD — Android aún escribe en Firestore (réplica baqueano-mirror).
- **S3-09** Android final — Tracking Supabase y prueba en dispositivo físico.
- **S3-10** Website final — CRÍTICO: producción sirve 56bd236, no main.
- **S3-16** Accesibilidad WCAG AA — axe automatizado en 10 anchos.
- **S3-17** Testing E2E Playwright — Suite E2E del flujo principal en CI.
- **S3-18** GitHub final — main ≠ producción hasta desbloquear la VM.

## 🔴 PENDIENTE (3)

- **S1-12** Video de navegación inicial — Grabación del equipo.
- **S3-13** Performance — Lighthouse/Core Web Vitals medidos; salida de 625 MiB.
- **S3-20** Video final — Grabación del equipo tras desbloquear producción.

## Riesgos y acciones que solo puede ejecutar el propietario

1. **Autodeploy de la VM detenido** (crítico): `/health` sirve `56bd236`. Ejecutar `sudo journalctl -u baqueano-autodeploy -n 100` y `df -h` en la VM; si el disco está lleno, liberar releases antiguos de `/var/www/baqueano/releases` (conserva el actual y el anterior para rollback).
2. **Puerto 22 abierto a Internet:** restringir la regla SSH del NSG a las IP de administración.
3. **Claves de navegador Google/Firebase:** confirmar restricción por referrer (web) y por paquete/SHA-1 (Android) en Google Cloud.
4. **Identidad:** 0 usuarios en `auth.users`; la migración Firebase → Supabase no se declara completa.
5. **Videos S1-12 y S3-20:** entregables audiovisuales del equipo.

## Tabla completa

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
| 2 | S2-01 | Supabase producción | 🟠 EN PROCESO | Storage cerrado a anon, REVOKE de escritura a clientes, 66/66 tablas con RLS, db_health_report(). | migración 20261005050000; SQL C01–C03, C17; kronox-evidence run 37263032958 | **🟡 AVANZADO** | Evidencia de backups (PITR/diario) del plan. |
| 2 | S2-02 | Website a Supabase | 🟠 EN PROCESO | Ops Center lee KPIs y salud desde Supabase; ingesta de eventos por RPC. | website/js/ops-center/ops-live-data.js (16cb27a) | **🟡 AVANZADO** | Trackers web conectados en páginas públicas. |
| 2 | S2-03 | Firebase Auth a Supabase | 🔴 PENDIENTE | identity_links + baqueano-identity; perfiles por firebase_uid. | supabase/functions/baqueano-identity | **🟠 EN PROCESO** | 0 usuarios en auth.users: no se declara migrado. |
| 2 | S2-04 | Ops Center CRUD | 🟠 EN PROCESO | Corrección de verify (violaba CHECK), trazabilidad al verificar, acciones kpis/db_health/duplicates. | supabase/functions/baqueano-ops v2 (16cb27a) | **🟡 AVANZADO** | Prueba E2E de restaurar. |
| 2 | S2-05 | Catálogo turístico normalizado | 🟠 EN PROCESO | Columnas de fuente/verificación/vigencia, estados y vistas de completitud. | migraciones 052000–052300; v_business_profile_completion | **🟡 AVANZADO** | 7 destinos publicados sin fuente. |
| 2 | S2-06 | Departamentos dinámicos | 🟠 EN PROCESO | 17 territorios servidos por API pública. | kronox-evidence run 37263032958 (S2-06/departments=17) | **🟡 AVANZADO** | Páginas aún apoyadas en territories-data.js estático. |
| 2 | S2-07 | Municipios dinámicos | 🔴 PENDIENTE | Tabla poblada con 153 municipios y FK. | kronox-evidence run 37263032958 (153 filas); SQL C10 | **🟠 EN PROCESO** | 144 municipios sin coordenadas; sin página por municipio. |
| 2 | S2-08 | Mapa turístico | 🟠 EN PROCESO | Regla de franja viva: 17 territorios, 181 lugares con ficha propia. | website/scripts/territory-places-rule.test.mjs (CI) | **🟡 AVANZADO** | POI leídos desde Supabase. |
| 2 | S2-09 | Buscador global | 🟠 EN PROCESO | Sin cambio en esta ronda. | website/data/search-index.json (build) | **🟡 AVANZADO** | Índice generado desde datos publicados en Supabase. |
| 2 | S2-10 | BAQUI integrado | 🟠 EN PROCESO | Trazabilidad: ai_sessions/ai_messages/rag_sources; texto minimizado; baqui_log_exchange. | migración 20261005053000; baqueano-ai v114 | **🟡 AVANZADO** | Prueba del caso multidestino en producción. |
| 2 | S2-11 | Mi Viaje | 🟠 EN PROCESO | Sin cambio en esta ronda. | website/mi-viaje.html; travel_plans | **🟠 EN PROCESO** | Sincronización entre dispositivos demostrada. |
| 2 | S2-12 | Emergencias | 🟠 EN PROCESO | CHECK de service_type y trazabilidad. | migración 052300 | **🟠 EN PROCESO** | Filtrar a solo verificados en la UI con prueba. |
| 2 | S2-13 | Build Website | 🟡 AVANZADO | Build determinista con lista permitida + SEO normalizado + prueba en CI. | build-hostinger-static.mjs; verify-hostinger-static.mjs; seo-normalize.test.mjs (fba666b) | **🟢 VERDE** | — |
| 2 | S2-14 | APK Android | 🟠 EN PROCESO | CI Flutter verde. | flutter_ci.yml; website/assets/BaqueanoNicaragua.apk | **🟡 AVANZADO** | Trazabilidad APK↔commit y prueba en dispositivo físico. |
| 2 | S2-15 | Cumplimiento Azure | 🟡 AVANZADO | Evidencia externa de DNS, API Azure→Supabase y puertos. | kronox-evidence run 37263032958 (S2-15/*) | **🟡 AVANZADO** | Puerto 22 abierto a Internet; autodeploy detenido. |
| 2 | S2-16 | Dominio | 🟡 AVANZADO | DNS A→Azure, TLS válido, www→apex. | kronox-evidence run 37263032958 (dns, tls, www) | **🟢 VERDE** | — |
| 3 | S3-01 | Dominio de producción | 🟡 AVANZADO | Dominio oficial sirviendo la web (verificado desde GitHub). | kronox-evidence run 37263032958 (page/ 200) | **🟢 VERDE** | — |
| 3 | S3-02 | HTTPS, SSL y DNS | 🟡 AVANZADO | HTTP→HTTPS 301, TLS 1.3, HSTS includeSubDomains. | kronox-evidence run 37263032958 (http, tls, headers) | **🟢 VERDE** | — |
| 3 | S3-03 | Firebase URL de respaldo | 🟠 EN PROCESO | El canonical dejaba de apuntar a web.app: el build declara el dominio oficial. | website/scripts/lib/seo-normalize.mjs (fba666b) | **🟡 AVANZADO** | Publicado cuando la VM retome el autodeploy. |
| 3 | S3-04 | Seguridad final OWASP | 🟠 EN PROCESO | Cabeceras verificadas en vivo, storage cerrado, secretos limpios, archivos internos 404. | kronox-evidence run 37263032958; codeql.yml; SPRINT1_REPOSITORY_AUDIT.md §2 | **🟡 AVANZADO** | Cerrar puerto 22 en el NSG. |
| 3 | S3-05 | Supabase RLS | 🟡 AVANZADO | RLS en 66/66 tablas; pruebas negativas reales desde fuera y SQL revertido. | kronox-evidence run 37263032958 (13 sondas anon); supabase/tests/database_central_cases.sql (21/21) | **🟢 VERDE** | — |
| 3 | S3-06 | RBAC real | 🟡 AVANZADO | KPI/health solo para analytics.read o servidor. | SQL C07, C08, C15 | **🟡 AVANZADO** | Pruebas negativas por rol autenticado (usuario, auditor, admin). |
| 3 | S3-07 | Flujo usuario E2E | 🔴 PENDIENTE | Cadena de datos probada en SQL (evento→favorito→WhatsApp→feedback→KPI). | SQL C11, C15, C16 | **🟠 EN PROCESO** | Flujo con navegador: login→destino→BAQUI→favorito→reserva→Ops. |
| 3 | S3-08 | Integración final de BD | 🟠 EN PROCESO | Supabase autoridad para catálogo, analítica, BAQUI y auditoría. | c5ef579; 16cb27a | **🟠 EN PROCESO** | Android aún escribe en Firestore (réplica baqueano-mirror). |
| 3 | S3-09 | Android final | 🟠 EN PROCESO | Sin cambio en esta ronda. | flutter_ci.yml | **🟠 EN PROCESO** | Tracking Supabase y prueba en dispositivo físico. |
| 3 | S3-10 | Website final | 🟠 EN PROCESO | Verificación continua en vivo. | kronox-evidence run 37263032958 | **🟠 EN PROCESO** | CRÍTICO: producción sirve 56bd236, no main. |
| 3 | S3-11 | BAQUI final | 🟠 EN PROCESO | Registro trazable y límites (BAQUI no verifica ni publica). | baqueano-ai v114; migración 053000 | **🟡 AVANZADO** | Caso León+Carazo+Rivas, 4 viajeros, USD 500 automatizado. |
| 3 | S3-12 | PWA y offline | 🟠 EN PROCESO | Manifest enlazado en todas las páginas (build); SW y manifest servidos. | kronox-evidence run 37263032958 (manifest.json, service-worker.js 200); seo-normalize.test.mjs | **🟡 AVANZADO** | Prueba offline automatizada. |
| 3 | S3-13 | Performance | 🔴 PENDIENTE | — | — | **🔴 PENDIENTE** | Lighthouse/Core Web Vitals medidos; salida de 625 MiB. |
| 3 | S3-14 | SEO nacional e internacional | 🟠 EN PROCESO | Canonical oficial, hreflang ×6 + x-default con ?lang=, JSON-LD, sitemap (23 URL) y robots oficiales. | fba666b; seo-normalize.test.mjs (11/11); CI deploy-production | **🟡 AVANZADO** | Visible en vivo tras desbloquear la VM. |
| 3 | S3-15 | Internacionalización ×6 | 🟠 EN PROCESO | 1 782 claves × 6 idiomas, puerta CI sin errores, ?lang= por URL. | validate-i18n.mjs; i18n-audit.mjs (0 errores) | **🟡 AVANZADO** | 731 textos JS y TSX pendientes de clave. |
| 3 | S3-16 | Accesibilidad WCAG AA | 🟠 EN PROCESO | Sin cambio en esta ronda. | docs/audit/ACCESSIBILITY_AUDIT.md (documental) | **🟠 EN PROCESO** | axe automatizado en 10 anchos. |
| 3 | S3-17 | Testing E2E Playwright | 🟠 EN PROCESO | Prueba de idioma en Chromium (?lang). | website/scripts/i18n-browser.test.mjs | **🟠 EN PROCESO** | Suite E2E del flujo principal en CI. |
| 3 | S3-18 | GitHub final | 🟠 EN PROCESO | Control automático main↔producción diario. | .github/workflows/kronox-evidence.yml | **🟠 EN PROCESO** | main ≠ producción hasta desbloquear la VM. |
| 3 | S3-19 | README de despliegue | 🟡 AVANZADO | Sin cambio en esta ronda. | README.md; azure/deploy.sh --rollback | **🟡 AVANZADO** | Prueba de rollback registrada. |
| 3 | S3-20 | Video final | 🔴 PENDIENTE | — | — | **🔴 PENDIENTE** | Grabación del equipo tras desbloquear producción. |

## Cómo reproducir la evidencia

- Producción en vivo: Actions → "🧪 Evidencia de producción (Kronox 2026)" → Run workflow (artefacto JSON + Markdown).
- Base de datos: ejecutar `supabase/tests/database_central_cases.sql` (termina en RAISE EXCEPTION: no deja datos).
- SEO del build: `cd website && node scripts/build-hostinger-static.mjs && node scripts/seo-normalize.test.mjs`.
- Regenerar estos documentos: `node tools/kronox/gen-development-docs.mjs`.
