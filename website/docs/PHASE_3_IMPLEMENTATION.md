# 🧭 INFORME DE IMPLEMENTACIÓN — FASE 3: INTEGRACIÓN OPERATIVA & CONTROL CENTER

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Certificar la transición de BAQUEANO Web y Control Center de un andamiaje estático/mock hacia un sistema interconectado en tiempo real con Cloud Firestore, manteniendo un blindaje absoluto sobre la aplicación móvil Android (`lib/`, `android/`, `test/`, `pubspec.yaml`).

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA TÉCNICA)
1. **Contratos Compatibles**:
   - Modelado unificado de la colección canónica `/places` con total compatibilidad hacia `PlaceModel.dart` de Flutter.
   - Tipos TypeScript en `@baqueano/types` y validadores Zod en `@baqueano/validators`.
2. **Capa Firebase Operativa**:
   - Inicialización segura del cliente Firebase en `@baqueano/firebase` utilizando credenciales del proyecto `app-baqueano`.
   - Repositorios tipados para destinos (`places`), categorías, departamentos y registros de auditoría inmutables (`audit_logs`).
3. **Control Center Administrativo**:
   - Autenticación real con Firebase Auth (Google y Correo/Contraseña).
   - Acreditación de roles:
     - Super Admin: `oscarelieser.informatica.inatec@gmail.com`.
     - Auditor de Cumplimiento: `vigoronmixt@gmail.com`.
     - Bloqueo estricto para exploradores/usuarios normales.
   - CRUD de destinos con validación Zod previa a Firestore.
4. **Sincronización Web Dinámica**:
   - `/destinos` y `/destinos/[slug]` leen directamente de Firestore cuando hay conexión, con fallback graceful a seed data cuando se trabaja offline.

---

## 📦 3. QUÉ (WHAT / ENTREGABLES DE LA FASE 3)

### Documentación Normativa:
- `website/docs/FIRESTORE_CONTRACTS.md`: Mapeo campo por campo de 11 colecciones.
- `website/docs/RBAC_MATRIX.md`: Matriz de permisos para los 4 roles principales.
- `website/docs/ENVIRONMENT.md`: Manual de variables públicas y de servidor.
- `website/docs/DATA_FLOW.md`: Ciclo de vida y revalidación de datos.
- `website/docs/SECURITY_MODEL.md`: Modelo defensivo en 4 capas.
- `website/docs/INTEGRATION_STATUS.md`: Estado de las 10 integraciones requeridas.
- `website/docs/TECH_DEBT.md`: Registro de deuda técnica y remediación.

### Código Operativo:
- `@baqueano/types`: Modelos ampliados con `seoSlug` opcional y contratos Android.
- `@baqueano/validators`: Esquema de validación `placeRecordSchema` y `categoryRecordSchema`.
- `@baqueano/firebase`: Repositorio con funciones CRUD de destinos y auditoría.
- `apps/admin`: Formulario de creación/edición de destinos conectado a Firestore y módulo de auditoría inmutable.
- `apps/web`: Detalle y listado dinámico de destinos conectados a Firestore.
