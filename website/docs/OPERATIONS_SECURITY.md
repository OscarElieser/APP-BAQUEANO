# 🧭 OPERATIONS SECURITY — SEGURIDAD OPERATIVA, RBAC & AUDITORÍA TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Salvaguardar la confidencialidad de los datos operativos, evitar la manipulación no autorizada de alertas o incidentes y proteger la identidad y ubicación sensible de exploradores y anfitriones en todo el territorio nacional.

---

## ⚙️ 2. CÓMO (HOW / RBAC & MATRIZ DE AUTORIZACIÓN OPERATIVA)

El acceso a la Torre de Control y la emisión de alertas territoriales se rige por un estricto control de acceso basado en roles (RBAC):

```text
[Operador / Usuario Autenticado con Firebase Auth]
                        │
                        ▼
           [Token Claims Verification]
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
[super_admin]        [admin]           [host]
 Control Total    Gestión & Triaje  Reporte Local
```

- **`super_admin`**: Emisión/edición de alertas nacionales, cierre final de incidentes críticos, configuración de umbrales.
- **`admin`**: Triaje y asignación de incidencias, actualización de bitácoras operativas, monitoreo de salud del sistema.
- **`host`**: Envío de reportes iniciales de incidencias en su municipio, confirmación de estado de capacidad.
- **`explorer`**: Vista pública de alertas vigentes y recomendaciones de seguridad vial y climática.

---

## 📦 3. QUÉ (WHAT / REGLAS DE AUDITORÍA Y TRAZABILIDAD)

1. **Inmutabilidad de Bitácoras**: Toda entrada en `actionLog` registra autor, marca temporal UTC y acción; las entradas no pueden ser eliminadas ni sobreescritas.
2. **Cero PII en Alertas Públicas**: Las alertas visibles a exploradores no contienen nombres de personas, teléfonos personales ni datos financieros.
3. **Firmado de Reportes Críticos**: Incidentes de severidad `emergency` o `critical` requieren verificación con credenciales de superadministrador.
