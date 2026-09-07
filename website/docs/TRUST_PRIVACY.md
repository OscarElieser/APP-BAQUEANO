# POLÍTICA DE PRIVACIDAD & PROTECCIÓN DE EVIDENCIAS

## 1. Minimización de Datos
Solo se solicitan los documentos indispensables para certificar la existencia física, titularidad operativa y prácticas de sostenibilidad del establecimiento.

## 2. Aislamiento de Documentos Privados
- Las cédulas de identidad, contratos y permisos sanitarios se almacenan en rutas seguras de Firebase Storage: `trust/{resourceId}/evidence/`.
- Acceso restringido exclusivamente a roles administrativos autorizados mediante Firebase Storage Security Rules.

## 3. Resúmenes Públicos Higienizados
El público general y los consumidores de Open Data únicamente reciben:
- Estado de verificación (`VERIFIED`).
- Fecha de última verificación (`lastVerifiedAt`).
- Insignias públicas otorgadas.
- Puntuación cualitativa BRTI (`INICIAL`, `EN_DESARROLLO`, `COMPROMISO_ALTO`, `REFERENTE`).
- En ningún caso se exponen enlaces de descarga ni previsualizaciones de documentos de identidad.
