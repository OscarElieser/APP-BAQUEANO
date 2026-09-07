# ADR 0011: Índice Baqueano de Turismo Responsable (BRTI) y Prevención de Greenwashing

## Estado
Aceptado (2026-09-07)

## Contexto
Se requería un mecanismo científico y reproducible para medir el compromiso de sostenibilidad de alojamientos y destinos, evitando el *greenwashing* corporativo y asegurando que las cooperativas campesinas y pequeños comedores rurales no fuesen penalizados por falta de certificados internacionales costosos.

## Decisión
1. Diseñar el algoritmo determinístico y versionado `BRTI v1.0.0` que pondera 6 dimensiones territoriales (Economía Local, Ambiental, Social, Cultura, Accesibilidad, Gestión Responsable).
2. Introducir el Factor de Confianza de Evidencias (*Evidence Confidence*) para distinguir datos autorreportados de inspecciones presenciales o avales comunitarios.
3. Admitir evidencias de baja burocracia (visitas de campo, fotografías de prácticas, cartas de directivas comunales) como prueba plenamente válida de sostenibilidad.

## Consecuencias
- **Positivas**: Evaluación justa de la realidad territorial campesina; incentivo formativo de mejora continua; explicabilidad abierta de fortalezas y pendientes.
- **Negativas / Mitigaciones**: Necesidad de recalcular y versionar el índice si varían las ponderaciones; mitigado mediante versionado estricto (`v1.0.0`) y registro en `trust_audits`.
