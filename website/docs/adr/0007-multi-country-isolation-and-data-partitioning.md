# ADR 0007: AISLAMIENTO MULTI-TENANT & PARTICIONAMIENTO LÓGICO DE DATOS

## Estado
Aprobado

## Contexto
Se requiere garantizar que la información privada (reservas, contratos de comercios, números de teléfono internos) de un país no pueda ser accedida por administradores u operadores de otro país, sin incurrir en costos prematuros de bases de datos físicas independientes por cada nación centroamericana.

## Decisión
1. Utilizar **particionamiento lógico** en Firestore basado en la propiedad `countryId` (con fallback a `"NI"` en documentos existentes).
2. Implementar reglas de autorización ABAC en la capa de servicios y en Cloud Functions / Security Rules: `user.countryScope.includes(resource.countryId)`.
3. Validar todas las consultas públicas y administrativas mediante esquemas Zod con filtrado obligatorio por país.

## Consecuencias
- Máxima eficiencia de costos en Google Cloud (FinOps óptimo).
- Aislamiento seguro y verificable mediante pruebas automáticas.
