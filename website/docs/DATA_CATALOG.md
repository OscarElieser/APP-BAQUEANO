# 🧭 DATA CATALOG — CATÁLOGO DE CONJUNTOS DE DATOS & FUENTES MAESTRAS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Documentar formalmente todos los conjuntos de datos del ecosistema Baqueano, especificando su propietario de dominio, fuente única de verdad, clasificación de confidencialidad y retención para evitar duplicidades o corrupción de información.

---

## ⚙️ 2. CÓMO (HOW / INVENTARIO DE DATASETS)

| Dataset ID | Dominio | Fuente Maestra (System of Record) | Propietario | Clasificación | PII | Retención |
| --- | --- | --- | --- | :---: | :---: | :---: |
| `ds-places` | Destinos y Territorio | Firestore `/places` | Admin Contenido | **PUBLIC** | No | 5 Años |
| `ds-businesses` | Directorio Comercial | Firestore `/businesses` | Admin Negocios | **PUBLIC** | No | 5 Años |
| `ds-reservations` | Reservas Ecoturísticas | Firestore `/reservations` | Admin Financiero | **RESTRICTED** | Sí | 7 Años |
| `ds-payments` | Órdenes y Transacciones | Firestore `/payment_orders` | Admin Financiero | **RESTRICTED** | Sí | 7 Años |
| `ds-users` | Cuentas y Perfiles | Firebase Auth + `/users` | Super Admin Seg | **CONFIDENTIAL** | Sí | 3 Años |
| `ds-incidents` | Incidentes Territoriales | Firestore `/incidents` | Ops Control Tower | **INTERNAL** | No | 5 Años |
| `ds-alerts` | Alertas Operativas | Firestore `/alerts` | Ops Control Tower | **PUBLIC** | No | 2 Años |
| `ds-audit-logs` | Trazabilidad y Auditoría | Firestore `/audit_logs` | Super Admin Seg | **RESTRICTED** | No | 10 Años |

---

## 📦 3. QUÉ (WHAT / REGLA DEL SISTEMA DE REGISTRO)

- **Principio de Fuente Única**: Firestore es la única base de datos transaccional de verdad. Los archivos exportados (CSV, JSON, hojas de cálculo) son únicamente vistas de lectura estáticas y jamás deben ser tratados como fuentes concurrentes de escritura.
