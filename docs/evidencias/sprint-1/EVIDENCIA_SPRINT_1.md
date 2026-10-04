<!-- ============================================================================
🧭 BAQUEANO ECOSYSTEM — EVIDENCIA FORMAL DE CULMINACIÓN: SPRINT 1
============================================================================

🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Acreditar de forma irrebatible la entrega completa de la base técnica, interfaces
  de usuario, modelo de datos, esquema de seguridad RBAC, pruebas unitarias e
  integrales, y el paquete instalable móvil de BAQUEANO Nicaragua.
- Demostrar que el ecosistema cuenta con bases sólidas para el ecoturismo comunitario
  sin intermediarios, cumpliendo con los estándares de rendimiento y calidad.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Estructura modular en Flutter (Android lib/ y android/) y Web estática (website/).
- Firebase Authentication y Firestore como almacén primario con reglas declarativas.
- Supabase PostgreSQL como réplica completa y persistencia de catálogos y perfiles.
- Funciones serverless en Firebase Functions con claims personalizados para RBAC.
- Suite de pruebas automatizadas: 28/28 pruebas en functions, suite de pruebas web,
  y análisis estático Flutter en 100% limpio (cero warnings).

📦 3. QUÉ (WHAT / ENTREGABLES & RESULTADOS):
- Repositorio estructurado en GitHub sincronizado en commit 6cc4841.
- Documento README.md con especificación técnica, instalación móvil y despliegue Azure.
- Build web estático con 10 rutas críticas aprobadas.
- Paquete instalable Android: BaqueanoNicaragua.apk (91.02 MB).
- Matriz de roles y seguridad: Superadmin, Admin, Auditor y Viajero.
============================================================================ -->

# 🧭 EVIDENCIA FORMAL DE CULMINACIÓN: SPRINT 1
**Proyecto:** BAQUEANO Nicaragua — Plataforma Ecoturística y Territorial  
**Estado:** ✅ APROBADO Y CONSOLIDADO AL 100%  
**Commit de Referencia:** `6cc4841`  
**Fecha de Certificación:** Octubre 2026  

---

## 1. Resumen Ejecutivo del Sprint 1

El Sprint 1 consolida la arquitectura base del ecosistema BAQUEANO, integrando los componentes móviles nativos para Android, la plataforma web pública, las capas de persistencia dual (Firestore y Supabase) y las reglas de seguridad basadas en roles (RBAC).

| Dimensión | Requisito Evaluado | Resultado Técnico | Estado |
|---|---|---|---|
| **Arquitectura** | Estructura del proyecto y documentación técnica | README.md exhaustivo + documentación en docs/architecture/ | ✅ Cumplido |
| **Interfaces** | Experiencia web y móvil responsiva | 10 rutas web críticas + UI Flutter móvil Android optimizada | ✅ Cumplido |
| **Seguridad** | Roles y control de acceso RBAC | Custom Claims en Firebase + Firestore Rules + Middleware | ✅ Cumplido |
| **Pruebas** | Cobertura y estabilidad técnica | 28/28 pruebas en Functions + `flutter analyze` 100% limpio | ✅ Cumplido |
| **Entregable Móvil** | Paquete Android ejecutable sin cierres inesperados | `website/assets/BaqueanoNicaragua.apk` (91.02 MB) | ✅ Cumplido |

---

## 2. Evidencias Específicas por Requisito

### 2.1 README Técnico y Documentación de Arquitectura
- **Ubicación:** `README.md` en la raíz del repositorio.
- **Detalle:** Describe la arquitectura global, los puertos perimetrales, las instrucciones paso a paso para compilar/instalar en Android, las configuraciones de Firebase/Supabase y la infraestructura de despliegue en Microsoft Azure.

### 2.2 Seguridad Básica y Modelo de Roles (RBAC)
- **Firebase Auth & Custom Claims:** Funciones seguras en `functions/lib/auth-middleware.js` y `functions/index.js` gestionan la asignación y validación de roles:
  - `superadmin`: Acceso global a configuración y auditoría.
  - `admin`: Gestión de destinos, comercios y reservas territoriales.
  - `auditor`: Inspección y verificación de registros.
  - `traveler / explorer`: Usuario final con perfil de viaje y pasaporte cultural.
- **Reglas Firestore:** Archivo `firestore.rules` con restricción estricta de lectura/escritura por rol y pertenencia (`request.auth.uid == userId`).
- **Pruebas de Seguridad:** 28 pruebas automatizadas aprobadas en `functions/` validando tokens, rechazo de no autenticados y aislamiento de privilegios.

### 2.3 Paquete Instalable Móvil Android
- **Archivo:** `website/assets/BaqueanoNicaragua.apk`.
- **Tamaño:** 91.02 MB (95,441,231 bytes).
- **Compatibilidad:** Android 7.0+ (API level 24 a 34), arquitectura ARM64/armeabi-v7a.
- **Estabilidad:** Prevención activa de ANRs mediante `RepaintBoundary`, renderizado con `cacheWidth`/`cacheHeight` acotados y análisis estático con cero errores (`flutter analyze: No issues found!`).

### 2.4 Build Web Estático
- **Compilador:** `website/scripts/build-hostinger-static.mjs`.
- **Rutas Críticas Compiladas:**
  1. `index.html` (Home)
  2. `destinos.html` (Catálogo territorial)
  3. `mapa.html` (Mapa interactivo de Nicaragua)
  4. `mi-viaje.html` (Itinerario del explorador)
  5. `perfil.html` (Gestión de usuario y credenciales)
  6. `admin.html` (Ops Center con control de roles)
  7. `mi-negocio.html` (Portal para guías y campesinos)
  8. `ambiental.html` (Custodia territorial)
  9. `baqueano-ai.html` (Asistente inteligente)
  10. `404.html` (Manejo de errores estático)

---

## 3. Registro de Validación Automatizada

Los resultados de verificación formal para el Sprint 1 se encuentran archivados en:
`docs/evidencias/sprint-1/resultados/verificacion.json`
- **Total de pruebas ejecutadas:** 15
- **Pruebas aprobadas:** 15
- **Pruebas fallidas:** 0
