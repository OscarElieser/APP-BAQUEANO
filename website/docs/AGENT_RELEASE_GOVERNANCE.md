# GOBERNANZA DE LANZAMIENTO & EVALUACIÓN DE AGENTES

## 1. Criterios de Paso (*Release Gates*)
Antes de activar un agente o workflow en producción se requiere:
1. Pruebas unitarias de esquemas y herramientas al 100%.
2. Evals de seguridad (intento de pago autónomo -> DENY; intento de cambio de rol -> DENY; inyección -> inerte).
3. Prueba de degradación y fallback manual en caso de indisponibilidad.

## 2. Versionado de Prompts y Herramientas
Toda actualización de prompts o herramientas cuenta con identificador semántico de versión (`v1.0.0`) y rollback instantáneo mediante feature flags.
