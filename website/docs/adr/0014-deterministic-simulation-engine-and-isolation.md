# ADR 0014: Deterministic Simulation Engine & Production Isolation

## Contexto
El ecosistema Baqueano requiere la capacidad de evaluar escenarios hipotéticos ("What-If") tales como incrementos súbitos de demanda, contingencias climáticas y desvíos solidarios de afluencia hacia cooperativas emergentes.

## Decisión
Se implementa un motor de simulación puramente determinístico y en memoria (`SimulationEngineService`). La ejecución es 100% de solo lectura y está terminantemente desacoplada de la base de datos transaccional de producción. Cada resultado se etiqueta inviolablemente con `isSimulatedData: true` y marca de agua `SIMULADO`.

## Consecuencias
- **Positivas**: Cero riesgo de corrupción de datos reales, experimentos reproducibles y apoyo seguro a la toma de decisiones.
- **Compensación**: Los administradores deben recordar que los resultados son simulados y no garantizan comportamientos humanos exactos.
