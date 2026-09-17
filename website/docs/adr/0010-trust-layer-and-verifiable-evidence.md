# ADR 0010: Arquitectura del Trust Layer, Procedencia y Protección de Evidencias

## Estado
Aceptado (2026-09-07)

## Contexto
El ecosistema Baqueano requería un marco formal para verificar destinos y prestadores turísticos sin incurrir en rankings de popularidad, membresías pagadas ni exponer documentos de identidad sensibles o contratos de anfitriones al público general.

## Decisión
1. Separar tajantemente la capa de almacenamiento privado de evidencias (`trust/{resourceId}/evidence/` en Firebase Storage con reglas de seguridad estrictas) de la capa pública de consumo.
2. Servir únicamente resúmenes higienizados ("Verificado por Baqueano - Agosto 2026", insignias normativas y nivel BRTI) a través de los portales web y Open Data API.
3. Exigir el principio de cuatro ojos (*Four-Eyes Principle*) para la aprobación de verificaciones territoriales críticas.

## Consecuencias
- **Positivas**: Confianza auditable respaldada por pruebas; privacidad total de los anfitriones; cumplimiento de normas de gobernanza de datos.
- **Negativas / Mitigaciones**: Proceso de moderación que requiere validación humana; mitigado con interfaz ágil en la consola administrativa `/confianza`.
