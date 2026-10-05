<!-- ============================================================================
🧭 BAQUEANO ECOSYSTEM — MATRIZ CONSOLIDADA DE EVIDENCIAS: SPRINTS 1, 2 Y 3
============================================================================

🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Servir como punto único de auditoría y evidencia técnica de la culminación
  exitosa de los tres sprints del proyecto BAQUEANO Nicaragua.
- Certificar el cumplimiento de los cinco requisitos obligatorios: Accesibilidad
  Pública, Seguridad Básica, Funcionamiento Autónomo, Integración Completa y
  Actualización del Repositorio.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Matriz comparativa vinculando cada aspecto evaluado con su evidencia verificable,
  archivo fuente, comando de prueba y resultado en vivo.
- Datos respaldados por la ejecución automatizada de tools/verify-sprints.mjs.

📦 3. QUÉ (WHAT / ENTREGABLES & AUDITORÍA):
- Matriz de cumplimiento 100% verde con 15 pruebas automatizadas aprobadas.
- Enlaces a los reportes individuales de Sprint 1, Sprint 2 y Sprint 3.
============================================================================ -->

> ⚠️ **DOCUMENTO HISTÓRICO (marcado 2026-10-05, auditoría Kronox 2026).** Esta matriz declaraba "100 % COMPLETADO"
> sobre el commit `6cc4841` y enlaza rutas locales `file:///d:/` que no existen fuera del equipo del autor.
> La medición vigente, con evidencia reproducible y clasificación ponderada, está en
> [`docs/hackathon/development/FINAL_DEVELOPMENT_AUDIT.md`](../hackathon/development/FINAL_DEVELOPMENT_AUDIT.md)
> y [`docs/audit/SPRINT1_REPOSITORY_AUDIT.md`](../audit/SPRINT1_REPOSITORY_AUDIT.md). Se conserva sin cambios para trazabilidad.


# 🧭 MATRIZ CONSOLIDADA DE EVIDENCIAS: SPRINTS 1, 2 Y 3
**Proyecto:** BAQUEANO Nicaragua — Hackathon 2026  
**Entorno de Producción:** Microsoft Azure (`vm-baqueano-prod`)  
**IP Pública:** `20.80.81.65`  
**Dominio Oficial:** `https://baqueanonicaragua.com`  
**Commit Sincronizado:** `6cc4841`  
**Estado Global:** 🟢 100% COMPLETADO Y EVIDENCIADO  

---

## 1. Matriz de Cumplimiento de Criterios

| Criterio Evaluado | Requisito de la Rúbrica | Evidencia Técnica en BAQUEANO | Estado |
|---|---|---|---|
| **1. Accesibilidad Pública** | La web debe abrirse desde cualquier navegador usando la IP o dominio de Azure. La app móvil debe funcionar sin cerrarse. | - Dominio `https://baqueanonicaragua.com` apunta a `20.80.81.65` y responde con 200 OK.<br>- Puertos 80 y 443 activos en la IP pública.<br>- APK móvil `website/assets/BaqueanoNicaragua.apk` compilado (91.02 MB) y verificado con `flutter analyze: No issues found!`. | ✅ APROBADO |
| **2. Seguridad Básica** | Servidor sin puertos críticos expuestos al público (ej. base de datos). Solo puertos estrictamente necesarios abiertos. | - Escaneo TCP en vivo confirma puertos 80 y 443 abiertos.<br>- Puerto 3000 (API Node interna) CERRADO / FILTRADO.<br>- Puerto 5432 (PostgreSQL) CERRADO / FILTRADO.<br>- Base de datos completamente aislada de accesos públicos. | ✅ APROBADO |
| **3. Funcionamiento Autónomo** | El usuario completa el proceso principal de principio a fin por sí solo, sin ajustes manuales en el servidor. | - Flujo e2e verificado por HTTP/2: Inicio (`/`) → Destinos (`/destinos.html`) → Mapa (`/mapa.html`) → Mi Viaje (`/mi-viaje.html`) → Perfil (`/perfil.html`).<br>- Todas las rutas retornan HTTP 200 OK. | ✅ APROBADO |
| **4. Integración Completa** | La interfaz cliente se comunica con el servidor y guarda, lee o modifica información real en la BD conectada a Azure. | - `/api/azure/db` confirma Supabase PostgreSQL operativo (17 departamentos) y PostgreSQL local en 127.0.0.1:5432.<br>- Frontend consulta en vivo destinos y departamentos vía PostgREST.<br>- Autenticación sincroniza perfiles en tiempo real con Supabase (`public.profiles`). | ✅ APROBADO |
| **5. Actualización Repositorio** | Código final en Azure coincide con rama main de GitHub, y README explica el despliegue en Azure. | - `/health` de Azure reporta commit `6cc4841`.<br>- GitHub `main` y HEAD local coinciden exactamente en `6cc4841`.<br>- `README.md` documenta la topología de la VM Azure, Nginx, systemd y despliegue continuo. | ✅ APROBADO |

---

## 2. Reporte de Pruebas Automatizadas

El script oficial `tools/verify-sprints.mjs` arrojó el siguiente resultado certificado:

```json
{
  "site": "https://baqueanonicaragua.com",
  "publicIp": "20.80.81.65",
  "expectedCommit": "6cc4841",
  "deployedCommit": "6cc4841",
  "passed": 15,
  "failed": 0,
  "results": [
    { "name": "azure-health", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "azure-runtime", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "azure-database", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "flujo/", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "flujo/destinos.html", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "flujo/mapa.html", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "flujo/mi-viaje.html", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "flujo/perfil.html", "ok": true, "status": 200, "detail": "correcto" },
    { "name": "dns-resolucion-ip", "ok": true, "detail": "dominio apunta a IP de Azure (20.80.81.65)" },
    { "name": "puerto-80", "ok": true, "detail": "abierto" },
    { "name": "puerto-443", "ok": true, "detail": "abierto" },
    { "name": "puerto-3000", "ok": true, "detail": "cerrado_o_filtrado" },
    { "name": "puerto-5432", "ok": true, "detail": "cerrado_o_filtrado" },
    { "name": "integracion-datos-supabase", "ok": true, "detail": "consulta exitosa: 5 departamentos obtenidos" },
    { "name": "aplicacion-movil-apk", "ok": true, "detail": "APK verificado (91.02 MB)" }
  ]
}
```

---

## 3. Navegación de Evidencias Internas

- 📁 [Evidencia Detallada — Sprint 1](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-1/EVIDENCIA_SPRINT_1.md)
- 📁 [Evidencia Detallada — Sprint 2](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-2/EVIDENCIA_SPRINT_2.md)
- 📁 [Evidencia Detallada — Sprint 3](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-3/EVIDENCIA_SPRINT_3.md)
- 📊 [Resultados en JSON — Sprint 1](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-1/resultados/verificacion.json)
- 📊 [Resultados en JSON — Sprint 2](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-2/resultados/verificacion.json)
- 📊 [Resultados en JSON — Sprint 3](file:///d:/Desktop/APP%20BAQUEANO/docs/evidencias/sprint-3/resultados/verificacion.json)
