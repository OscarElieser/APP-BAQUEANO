# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — SEGURIDAD DE INTELIGENCIA ESTRATÉGICA
# ============================================================================

## 1. Modelo de Amenazas (Threat Model)
1. **Fuga de Métricas Confidenciales**: Acceso no autorizado a volúmenes transaccionales o casos de integridad.
   - *Mitigación*: Validación ABAC en el servidor mediante `StrategicMetricsService`.
2. **Inyección de Prompts en Copiloto**: Intentos de manipular la IA ejecutiva para extraer datos protegidos.
   - *Mitigación*: Sanitización de patrones maliciosos y ejecución estricta contra herramientas deterministas.
3. **Manipulación de Snapshots de Reportes**: Alteración de borradores de informes previo a su emisión.
   - *Mitigación*: Firma de revisión obligatoria e inmutabilidad de los registros históricos.
4. **Contaminación de Datos Reales por Simulación**: Modificación inadvertida de bases de datos desde el simulador What-If.
   - *Mitigación*: Etiquetado inmutable `isSimulatedData: true` y aislamiento en memoria sin llamadas a `setDoc`/`updateDoc`.
