# 🧭 BAQUEANO — EXPERIENCE CAPABILITIES MATRIX

## 🎯 1. POR QUÉ (WHY)
Definir con rigor técnico qué funcionalidades están activas en cada canal o modalidad, evitando mostrar acciones no soportadas o prometer capacidades inexistentes.

## ⚙️ 2. CÓMO (HOW)
| Capacidad | Web | PWA | Android (Contrato) | Kiosco Público | Smart Point |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Exploración de Contenido** | ✅ FULL | ✅ FULL | ✅ FULL | ✅ FULL | 🟡 PARTIAL |
| **Reservas Directas** | ✅ FULL | ✅ FULL | ✅ FULL | ⚪ UNSUPPORTED | ⚪ UNSUPPORTED |
| **Viaje Guardado Offline** | 🟡 PARTIAL | ✅ FULL | ✅ FULL | ⚪ UNSUPPORTED | ⚪ UNSUPPORTED |
| **Escaneo QR** | ✅ FULL | ✅ FULL | ✅ FULL | ✅ FULL | ✅ FULL |
| **Lectura NFC** | ⚪ UNSUPPORTED | 🟡 PARTIAL | ✅ FULL | ✅ FULL | ✅ FULL |
| **Gestión de Cuenta** | ✅ FULL | ✅ FULL | ✅ FULL | ❌ UNSUPPORTED | ❌ UNSUPPORTED |
| **Baqueano AI / Concierge** | ✅ FULL | ✅ FULL | ✅ FULL | 🟡 PARTIAL | ⚪ UNSUPPORTED |
| **Pasaporte Digital** | ✅ FULL | ✅ FULL | ✅ FULL | ⚪ UNSUPPORTED | 🟡 PARTIAL (Sello) |

## 📦 3. QUÉ (WHAT)
- Interfaz adaptativa: Si un canal no soporta una acción (ej. transferir fondos o administrar perfil en kiosco público), el control no se renderiza.
- La PWA soporta almacenamiento offline de itinerarios a través de Cache API y almacenamiento indexado local.
