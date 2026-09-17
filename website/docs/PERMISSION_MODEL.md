# 🧭 PERMISSION MODEL — MODELO DE AUTORIZACIÓN, RBAC & ABAC

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Asegurar que ningún usuario u organización pueda acceder, modificar o filtrar datos privados de terceros sin autorización explícita, aplicando el principio de mínimo privilegio y verificación estricta en backend (Zero Trust).

---

## ⚙️ 2. CÓMO (HOW / COMBINACIÓN RBAC + ABAC)

La autorización no se basa únicamente en un rol estático (`if (role === 'admin')`), sino en la combinación evaluada en backend:

```text
AUTORIZACIÓN = (ROL DE USUARIO) + (ORGANIZACIÓN) + (ALCANCE TERRITORIAL) + (PROPIEDAD DEL RECURSO)
```

### Reglas de Evaluación:
1. **Super Administrador**: Acceso completo a módulos globales, configuración y kill switches.
2. **Administrador Central**: Gestión de catálogo, validación editorial y triaje de incidencias nacionales.
3. **Administrador de Organización**: Gestión exclusiva de miembros y recursos de su propia entidad.
4. **Operador Territorial**: Monitoreo y reporte limitado al departamento o municipio asignado en su `scope`.
5. **Host Individual**: Control estricto sobre su propio negocio, servicios y reservas.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE PERMISOS GRANULARES)

| Permiso | Super Admin | Admin Central | Org Admin | Operador Local | Host |
| --- | :---: | :---: | :---: | :---: | :---: |
| `platform.manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `organizations.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `api_keys.issue` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `destinations.publish` | ✅ | ✅ | Scoped | ❌ | ❌ |
| `incidents.resolve` | ✅ | ✅ | Scoped | Scoped | ❌ |
| `alerts.broadcast` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `business.manage_own` | ✅ | ❌ | ❌ | ❌ | ✅ |
