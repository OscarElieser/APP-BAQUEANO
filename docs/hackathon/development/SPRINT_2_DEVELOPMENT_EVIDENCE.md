<!--
🎯 POR QUÉ: evidencia verificable de los requisitos de Desarrollo del Sprint 2 (Kronox 2026).
⚙️ CÓMO: estado antes/después, corrección y evidencia reproducible por requisito; cobertura ponderada.
📦 QUÉ: tabla del Sprint 2, cobertura y brechas.
-->

# Sprint 2 — Evidencia de Desarrollo

> Generado por `tools/kronox/gen-development-docs.mjs` desde `tools/kronox/development-requirements.mjs`. No editar a mano.

**Cobertura ponderada:** antes 41.6 % (6.65/16) → ahora **69.4 %** (11.10/16).

🟢 VERDE: 2 · 🟢⭐ SUPER AVANZADO: 0 · 🟡 AVANZADO: 10 · 🟠 EN PROCESO: 4 · 🔴 PENDIENTE: 0

| Sprint | ID | Requisito | Antes | Corrección realizada | Evidencia | Estado final | Brecha restante |
|---|---|---|---|---|---|---|---|
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
