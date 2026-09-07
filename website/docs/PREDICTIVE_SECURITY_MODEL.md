# MODELO DE SEGURIDAD & CONTROL DE ACCESO (ABAC/RBAC) EN PREDICCIÓN

## 🛡️ 1. Matriz de Autorización por Rol

| Rol | Consulta de Pronósticos | Acceso a Simulation Lab | Modificación de Modelos / Kill-Switch |
| :--- | :---: | :---: | :---: |
| `super_admin` | ✅ Todo el país | ✅ Completo | ✅ Autorizado |
| `admin` | ✅ Su territorio | ✅ Solo lectura | ❌ No autorizado |
| `host` (Cooperativa) | ✅ Su propio destino | ❌ No autorizado | ❌ No autorizado |
| `explorer` (Viajero) | ⚠️ Alertas contextuales | ❌ No autorizado | ❌ No autorizado |

---

## 🔒 2. Aislamiento Transfronterizo

Los operadores de un país (ej. Nicaragua) tienen denegado el acceso a señales analíticas o simulaciones restringidas de otros países (ej. Costa Rica), garantizando soberanía de datos según la Fase 12.
