# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — SISTEMA DE REPORTES ESTRATÉGICOS
# ============================================================================

## 1. Tipos de Reportes Disponibles
1. **Weekly Executive Brief**: Resumen semanal priorizado en 6 bloques (cambios, atención, pronóstico, oportunidades, riesgos y decisiones).
2. **Territorial Overview**: Informe de cobertura digital y madurez de portafolio departamental.
3. **Marketplace Health**: Indicadores de oferta comunitaria, volumen de reservas y tiempo de respuesta de anfitriones.
4. **Trust & Sustainability**: Cumplimiento del marco BRTI, estado de auditorías y casos de mediación.
5. **Platform Health**: Disponibilidad tecnológica, tiempos de respuesta y salud de microservicios.

## 2. Inmutabilidad y Exportación
- Toda generación de reporte produce un `StrategicReportSnapshot` con identificador único, periodo cubierto y versión de datos.
- Soporte para exportación en formato tabular normalizado (CSV) y estructurado (JSON).
- La distribución formal a instituciones aliadas requiere la aprobación y firma explícita de un revisor humano (`markReportAsReviewed`).
