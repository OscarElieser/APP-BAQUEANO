# ÍNDICE BAQUEANO DE TURISMO RESPONSABLE (BRTI v1.0.0)

## 1. Especificación del Algoritmo
El **BRTI** se calcula de forma determinística en `responsible-tourism.service.ts`:

$$Score_{BRTI} = \sum_{i=1}^{6} (DimensionScore_i \times Weight_i)$$

Donde los pesos son:
- Economía Local: 0.25
- Ambiental: 0.20
- Social: 0.20
- Cultura: 0.15
- Accesibilidad: 0.10
- Gestión Responsable: 0.10

## 2. Factor de Confianza de Evidencias (*Evidence Confidence*)
Ajusta la certeza de la calificación:
- **Autorreporte puro**: 30% de confianza.
- **Verificación en territorio**: 95% de confianza.
- **Aval comunitario**: 80% de confianza.

## 3. Niveles Cualitativos
- `INICIAL` (0 - 39 puntos): Emprendimiento iniciando su transición responsable.
- `EN_DESARROLLO` (40 - 64 puntos): Prácticas en consolidación con evidencia parcial.
- `COMPROMISO_ALTO` (65 - 84 puntos): Alto impacto local verificado y prácticas activas.
- `REFERENTE` (85 - 100 puntos): Modelo de sostenibilidad comunitaria en el territorio.
