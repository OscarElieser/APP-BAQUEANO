# MODELO DE CONFIRMACIONES HUMANAS & PREVIEW DE ACCIÓN

## 1. Estructura de la Solicitud de Confirmación
Cada modal o diálogo de confirmación debe mostrar claramente:
- **Qué ocurrirá**: Descripción en lenguaje natural y comprensible.
- **Sobre qué recurso**: ID del destino, alojamiento o itinerario afectado.
- **Qué cambiará**: Previsualización (*diff preview*) con estado anterior vs propuesto.
- **Reversibilidad**: Indicación clara de si la acción puede deshacerse.

## 2. Expiración de Confirmaciones
Toda solicitud de confirmación cuenta con un tiempo de vida (TTL) de 15 minutos (`expiresAt`). Si el usuario no confirma dentro de ese lapso, el workflow se cancela automáticamente sin ejecutar cambios en base de datos.
