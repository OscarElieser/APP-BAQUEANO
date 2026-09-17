# ADR 0015: Aggregate Predictive Intelligence & Privacy Preservation

## Contexto
La predicción de patrones turísticos presenta riesgos de sesgo, invasión de privacidad y discriminación algorítmica si se aplica a nivel individual.

## Decisión
Baqueano adopta una política estricta de **predecir territorios y fenómenos agregados, no personas individuales**. Se prohíbe el social scoring, la estimación de gasto individual y la fijación dinámica especulativa de precios. Todos los pronósticos operan con intervalos de incertidumbre [min, max] y niveles de confianza explícitos.

## Consecuencias
- **Positivas**: Máxima privacidad (k-anonymity), cumplimiento ético internacional y protección contra perfilamientos discriminatorios.
- **Compensación**: Los modelos ofrecen visión macro-territorial sin hiper-personalización invasiva.
