# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — MODELO DE INICIATIVAS ESTRATÉGICAS
# ============================================================================

## 1. Propósito
Vincular las decisiones institucionales y comunitarias con indicadores medibles (`StrategicKpi`), asegurando el seguimiento de metas sin intentar reemplazar herramientas de gestión de proyectos como Jira o Trello.

## 2. Estructura de Datos
- `initiativeId`: Identificador único.
- `name`: Nombre descriptivo de la iniciativa.
- `objective`: Justificación y meta cualitativa.
- `territoryScope`: Ámbito de aplicación (departamento o nacional).
- `owner`: Responsable humano asignado.
- `status`: `PROPOSED`, `APPROVED`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`.
- `startDate` / `targetDate`: Horizontes de ejecución.
- `associatedKpis`: Lista de métricas con `baselineValue`, `targetValue` y `currentValue`.

## 3. Principio de Aprobación Humana
Queda prohibida la auto-aprobación o creación autónoma de iniciativas por agentes de IA. Toda iniciativa requiere validación y asignación explícita por un rol con privilegios `super_admin` o `admin`.
