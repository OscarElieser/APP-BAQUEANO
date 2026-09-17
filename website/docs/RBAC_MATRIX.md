# 🛡️ MATRIZ DE CONTROL DE ACCESO BASADO EN ROLES (RBAC) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Proteger la integridad operativa, patrimonial y ambiental del ecosistema BAQUEANO. Las decisiones de publicación, verificación de negocios, cambios de rol y fiscalización bajo la Ley 306 no pueden quedar abiertas ni depender únicamente de controles cosméticos en la interfaz de usuario.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & ACREDITACIÓN)
1. **Credenciales Maestras en Producción**:
   - 👑 **Super Administrador General**: `oscarelieser.informatica.inatec@gmail.com`
     - Control irrestricto de la plataforma, publicación de destinos, gestión de usuarios, asignación de roles y emisión de registros auditables.
   - ⚖️ **Auditor de Cumplimiento Territorial & Ecológico**: `vigoronmixt@gmail.com`
     - Acceso de solo lectura fiscalizadora a métricas, registros de auditoría (`audit_logs`), monitoreo de denuncias ambientales y trazabilidad Ley 306. Prohibida la alteración arbitraria de destinos o finanzas.
   - 🏡 **Anfitrión Comunitario (Host)**:
     - Control exclusivo sobre su ficha de negocio autorizada en `/businesses/{businessId}`, gestión de reservas y multimedia propia.
   - 🧭 **Explorador / Ciudadano (Explorer / Usuario Normal)**:
     - Libre acceso a todas las páginas públicas (`/`, `/destinos`, `/historia`, `/gastronomia`, `/ambiental`, etc.), gestión de favoritos (`user_saved_places`), y envío de reportes ciudadanos. **Bloqueo estricto y automático al Control Center administrativo**.

2. **Doble Barrera de Verificación**:
   - **Frontend Guard**: Middleware en Next.js (`apps/admin/src/middleware.ts`) y guardianes de sesión en cliente (`website/js/admin-ops.js`).
   - **Backend Guard**: Reglas de Cloud Firestore (`firestore.rules`) y verificación de Custom Claims (`request.auth.token.role`).

---

## 📦 3. QUÉ (WHAT / MATRIZ DETALLADA DE PERMISOS)

| Módulo / Acción Operativa | Super Admin (`oscarelieser`) | Auditor (`vigoronmixt`) | Anfitrión (Host) | Explorador (Usuario Normal) |
|---|:---:|:---:|:---:|:---:|
| **Acceso al Control Center (`/admin`)** | ✅ Total | ✅ Lectura | ❌ Bloqueado | ❌ **BLOQUEO ESTRICTO** |
| **Ver Dashboard de KPIs Reales** | ✅ Total | ✅ Total | ⚠️ Solo su negocio | ❌ Denegado |
| **Crear Destino (`places`)** | ✅ Permitido | ❌ Solo lectura | ❌ Denegado | ❌ Denegado |
| **Editar Destino Existente** | ✅ Permitido | ❌ Solo lectura | ❌ Denegado | ❌ Denegado |
| **Publicar / Archivar Destino** | ✅ Permitido | ❌ Solo lectura | ❌ Denegado | ❌ Denegado |
| **Administrar Negocio Propio** | ✅ Permitido | ✅ Fiscalizar | ✅ Permitido | ❌ Denegado |
| **Aprobar / Validar Negocio Ajeno** | ✅ Permitido | ⚠️ Recomendación | ❌ Denegado | ❌ Denegado |
| **Consultar Pistas de Auditoría (`audit_logs`)**| ✅ Lectura | ✅ Lectura | ❌ Denegado | ❌ Denegado |
| **Editar o Eliminar `audit_logs`** | 🚫 **INMUTABLE** | 🚫 **INMUTABLE** | 🚫 **INMUTABLE** | 🚫 **INMUTABLE** |
| **Modificar Roles de Usuario** | ✅ Permitido con log | ❌ Solo lectura | ❌ Denegado | ❌ Denegado |
| **Guardar Favoritos (`user_saved_places`)** | ✅ Propio | ✅ Propio | ✅ Propio | ✅ Propio |
| **Interacción con Baqueano AI Gateway** | ✅ Ilimitado | ✅ Auditoría | ✅ Ilimitado | ✅ Exploración |
| **Gestión Territorial (Categorías/Deptos)** | ✅ Total | ❌ Solo lectura | ❌ Denegado | ❌ Denegado |
| **Consultar Suscripciones Comerciales** | ✅ Total | ✅ Fiscalizar | ⚠️ Propia | ❌ Denegado |

---

## 🔒 4. PISTA DE AUDITORÍA OBLIGATORIA PARA CAMBIOS DE ROL

Cualquier cambio de privilegios administrativos debe registrarse de manera atómica en `audit_logs` con la siguiente estructura obligatoria:
```json
{
  "actorUid": "SUPER_ADMIN_UID",
  "actorEmail": "oscarelieser.informatica.inatec@gmail.com",
  "actorRole": "super_admin",
  "action": "ROLE_CHANGED",
  "targetUserEmail": "usuario@ejemplo.com",
  "previousRole": "explorer",
  "newRole": "admin",
  "timestamp": "2026-09-07T14:30:00.000Z",
  "reason": "Designación formal de operador regional"
}
```
Todo registro es de solo lectura y no puede ser alterado ni purgado por ningún actor a través de la interfaz.
