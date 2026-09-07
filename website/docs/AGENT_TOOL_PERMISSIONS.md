# MATRIZ DE PERMISOS & CATEGORÍAS DE HERRAMIENTAS

## 1. Categorías de Herramientas
- `READ`: Solo lectura. No modifica estado. Autonomía Nivel 0.
- `PREPARE`: Genera borradores o payloads en memoria. Autonomía Nivel 1.
- `WRITE_REVERSIBLE`: Modificaciones no destructivas (ej. guardar borrador/favorito). Autonomía Nivel 2.
- `WRITE_SENSITIVE`: Publicaciones y confirmaciones formales. Autonomía Nivel 3.
- `PROHIBITED`: Pagos, borrado masivo, cambios de rol. Autonomía Nivel 4 (DENY).

## 2. Herramientas Registradas
| Tool ID | Categoría | Autonomía | Roles Autorizados | Reversible |
| :--- | :---: | :---: | :--- | :---: |
| `searchDestinations` | `READ` | Level 0 | Todos los roles | Sí |
| `getMapDistance` | `READ` | Level 0 | Todos los roles | Sí |
| `calculateBudgetTotal` | `READ` | Level 0 | Todos los roles | Sí |
| `getWeatherSafety` | `READ` | Level 0 | Todos los roles | Sí |
| `prepareReservationDraft` | `PREPARE` | Level 1 | Todos los roles | Sí |
| `saveTripPlanDraft` | `WRITE_REVERSIBLE` | Level 2 | Todos los roles | Sí |
