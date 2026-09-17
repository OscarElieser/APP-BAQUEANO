# ADR 0013: Protocolo Human-in-the-Loop y Límites Financieros Estrictos

## Estado
Aceptado (2026-09-07)

## Contexto
Era imperativo salvaguardar los fondos económicos de los viajeros y la reputación de los prestadores rurales, evitando que la IA ejecutara pagos automáticos, modificaciones de disponibilidad silenciosas o auto-aprobaciones de certificaciones.

## Decisión
1. Prohibir de forma terminante cualquier herramienta que ejecute movimientos monetarios o pagos automáticos desde agentes.
2. Implementar un protocolo Human-in-the-Loop obligatorio con previsualización de cambios y confirmación explícita para acciones de Nivel 2 y 3.
3. Ejecutar todas las sumas presupuestarias y conversiones de divisas mediante funciones matemáticas determinísticas puras.

## Consecuencias
- **Positivas**: Cero riesgo de cobros erróneos o alucinados; confianza total del usuario; transparencia absoluta en presupuestos.
- **Negativas / Mitigaciones**: El usuario debe confirmar explícitamente las acciones de guardado o reserva; mitigado mediante modales claros e intuitivos con opción de cancelación.
