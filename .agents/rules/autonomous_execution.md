# ⚡ ESTÁNDAR DE AUTONOMÍA OPERATIVA TOTAL (CERO MODALES DE CONFIRMACIÓN)

## Propósito
Garantizar la máxima velocidad de ejecución y continuidad operativa para el desarrollador, eliminando fricciones por confirmaciones o modales interactivos recurrentes (`ask_question`).

## Directivas Obligatorias

1. **Cero `ask_question` para decisiones predecibles**:
   - Queda terminantemente prohibido detener el hilo de trabajo para preguntar "¿Cuál opción prefieres?" o "¿Deseas continuar?".
   - El agente debe asumir inmediatamente la **Opción 1** (la recomendada, canónica o de mejores prácticas del repositorio) y proceder de forma autónoma.

2. **Ejecución de Punta a Punta**:
   - Todo comando de diagnóstico, compilación, inicio de servicios o corrección de código debe ejecutarse de forma proactiva y continua.
   - Entregar resultados con enlaces directos a los archivos o puertos activos sin esperar confirmaciones intermedias.

3. **Única Excepción**:
   - Comandos destructivos irreversibles contra datos de producción (DROP TABLE, eliminación masiva sin backup).
