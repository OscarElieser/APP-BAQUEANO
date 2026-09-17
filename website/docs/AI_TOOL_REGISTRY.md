# 🧭 REGISTRO DE HERRAMIENTAS Y TOOL CALLING — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Delimitar formalmente las herramientas y funciones que el motor de inteligencia artificial de Baqueano puede invocar de forma controlada, asegurando que ninguna llamada a base de datos, servicio externo o mutación de estado ocurra sin validación previa de esquema y autorización por rol.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & WHITELIST)

- **Principio de Lista Blanca (`Whitelist`)**: El modelo solo puede solicitar la ejecución de herramientas explícitamente registradas en el catálogo del Gateway.
- **Validación Estricta de Parámetros**: Todo argumento de entrada es validado mediante esquemas Zod antes de ser despachado a la capa de datos.
- **Autorización por RBAC**: Cada herramienta define los roles con permiso de ejecución (`explorer`, `host`, `admin`).

---

## 📦 3. QUÉ (WHAT / MATRIZ DE HERRAMIENTAS AUTORIZADAS)

| Herramienta | Rol Requerido | Parámetros de Entrada | Salida | Nivel de Riesgo |
| --- | --- | --- | --- | --- |
| `searchPlaces` | Explorer / Host / Admin | `department?`, `category?`, `query?` | `PlaceRecord[]` verificados | Bajo (Solo lectura) |
| `getPlaceById` | Explorer / Host / Admin | `placeId: string` | `PlaceRecord` o error 404 | Bajo (Solo lectura) |
| `calculateBudget` | Explorer / Host / Admin | `days`, `groupSize`, `travelStyle` | `BudgetBreakdown` (USD/NIO) | Bajo (Determinista) |
| `getRiskAssessment` | Explorer / Host / Admin | `destinationIds: string[]` | `RiskAssessment` con factores | Bajo (Informativo) |
| `prepareReservation` | Explorer | `placeId`, `dateIso`, `people` | `ReservationDraft` | Medio (Requiere confirmación humana) |
| `generateHostDraft` | Host | `businessId`, `topic` | `TextDraft` (Requiere revisión) | Medio (Contenido en borrador) |
| `summarizeAudit` | Admin / Super Admin | `collection`, `dateRange` | `AuditSummary` | Medio (Solo lectura analítica) |
