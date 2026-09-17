# GOBERNANZA DE CONFIANZA & PRINCIPIO DE CUATRO OJOS

## 1. Principio de Cuatro Ojos (*Four-Eyes Principle*)
Para otorgar insignias de alto impacto territorial o aprobar certificaciones oficiales:
1. **Primer Revisor**: Moderador territorial examina las evidencias y emite dictamen preliminar.
2. **Segundo Revisor**: Administrador general o auditor independiente valida el cumplimiento antes de la publicación.

## 2. Inmutabilidad de Decisiones y Auditoría
Toda aprobación, rechazo, vencimiento o revocación genera un evento en `trust_audits` con:
- `eventType`, `resourceId`, `actorId`, `actorRole`, `details` y `timestamp`.
- Prohibida la eliminación de registros de auditoría históricos.

## 3. Prevención de Conflictos de Interés
Un moderador o anfitrión tiene estrictamente prohibido auditar o aprobar recursos propios o de organizaciones con las que guarde relación directa de propiedad.
