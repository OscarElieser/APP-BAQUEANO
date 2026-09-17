# 🧭 BAQUEANO 2.0 — ANDROID & WEB COMPATIBILITY MATRIX

## 1. Contratos Compartidos en Firestore
La siguiente tabla certifica que los modelos serializados en Dart (`lib/models/`) y las interfaces de TypeScript (`website/packages/types/src/index.ts`) mantienen compatibilidad semántica idéntica:

| Colección Firestore | Modelo Dart | Interfaz TypeScript | Compatibilidad |
| :--- | :--- | :--- | :---: |
| `places` | `PlaceModel` | `Place` / `DestinationSummary` | ✅ 100% Sincronizado |
| `departments` | `DepartmentModel` | `Department` | ✅ 100% Sincronizado |
| `municipalities`| `MunicipalityModel` | `Municipality` | ✅ 100% Sincronizado |
| `categories` | `CategoryModel` | `Category` | ✅ 100% Sincronizado |
| `businesses` | `BusinessModel` | `BusinessRecord` | ✅ 100% Sincronizado |
| `user_saved_places`| `SavedPlaceModel` | `UserSavedPlace` | ✅ 100% Sincronizado |
| `reservations` | `ReservationModel`| `ReservationRecord` | ✅ 100% Sincronizado |
| `payment_orders`| `PaymentOrderModel`| `PaymentOrder` | ✅ 100% Sincronizado |
| `smart_points` | `SmartPointModel` | `SmartPointRecord` | ✅ 100% Sincronizado |
| `trips` | `TripModel` | `TripHubRecord` | ✅ 100% Sincronizado |
| `passport_entries`| `PassportModel` | `PassportEntryRecord` | ✅ 100% Sincronizado |

## 2. Invariantes de Seguridad y No Regresión
- Nuevos campos introducidos en fases web avanzadas son opcionales (`nullable`) o cuentan con valores por defecto seguros para no romper versiones móviles previas.
- Ambas plataformas respetan la estructura de autorización basada en `request.auth.uid`.
