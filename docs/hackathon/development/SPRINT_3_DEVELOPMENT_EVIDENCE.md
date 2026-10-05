<!--
🎯 POR QUÉ: evidencia verificable de los requisitos de Desarrollo del Sprint 3 (Kronox 2026).
⚙️ CÓMO: estado antes/después, corrección y evidencia reproducible por requisito; cobertura ponderada.
📦 QUÉ: tabla del Sprint 3, cobertura y brechas.
-->

# Sprint 3 — Evidencia de Desarrollo

> Generado por `tools/kronox/gen-development-docs.mjs` desde `tools/kronox/development-requirements.mjs`. No editar a mano.

**Cobertura ponderada:** antes 42.8 % (8.55/20) → ahora **59.0 %** (11.80/20).

🟢 VERDE: 3 · 🟢⭐ SUPER AVANZADO: 0 · 🟡 AVANZADO: 8 · 🟠 EN PROCESO: 7 · 🔴 PENDIENTE: 2

| Sprint | ID | Requisito | Antes | Corrección realizada | Evidencia | Estado final | Brecha restante |
|---|---|---|---|---|---|---|---|
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
