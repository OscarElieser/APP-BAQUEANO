# 🧭 MODELO DE SEGURIDAD Y MATRIZ RBAC PARA MARKETPLACE — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Garantizar la protección de datos privados, transacciones y roles de usuario dentro de la plataforma comercial, previniendo vulnerabilidades de escalada de privilegios (`host → admin`), suplantación de identidad y manipulación de reseñas o reservas.

---

## ⚙️ 2. CÓMO (HOW / MATRIZ DE AUTORIZACIÓN)

- **Verificación Basada en Claims**: Tokens de Firebase Auth con claim explícito `role` (`super_admin`, `admin`, `host`, `explorer`).
- **Aislamiento por Documento**: Las consultas de reservas y negocios en Firestore exigen coincidencia de UID con `ownerUid` o `explorerId`.
- **Inmutabilidad de Logs de Auditoría**: La colección `audit_logs` es de solo escritura mediante funciones autorizadas; ningún usuario puede editar ni borrar trazas históricas.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE PRIVILEGIOS POR ROL)

| Capacidad / Recurso | Explorer | Host | Admin | Super Admin |
| --- | --- | --- | --- | --- |
| **Ver catálogo público** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Solicitar reserva** | ✅ Sí | ❌ No | ❌ No | ✅ Sí |
| **Confirmar / Cancelar reserva de su negocio** | ❌ No | ✅ Sí (Solo propio) | ✅ Sí | ✅ Sí |
| **Editar ficha de su negocio** | ❌ No | ✅ Sí (Solo propio) | ✅ Sí | ✅ Sí |
| **Moderar reseñas públicas** | ❌ No | ❌ No (Solo responder) | ✅ Sí | ✅ Sí |
| **Gestionar suscripciones comerciales** | ❌ No | ❌ No (Solo ver su plan) | ✅ Sí | ✅ Sí |
| **Asignar roles administrativos** | ❌ No | ❌ No | ❌ No | ✅ Sí (Exclusivo) |
