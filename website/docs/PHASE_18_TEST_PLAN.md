# 🧭 BAQUEANO — FASE 18: TEST PLAN

## 1. Alcance de Pruebas
Valida los 20 flujos E2E críticos del Experience OS y la continuidad omnicanal.

## 2. Matriz de Flujos Críticos (E2E #1 a #20)
1. **Web to Trip**: Exploración anónima -> Guardar destino -> Login -> Intención preservada -> Creación de viaje.
2. **Trip Hub**: Carga completa de itinerario, mapa, reservas asociadas y alertas territoriales.
3. **QR Territorial**: Escaneo de Smart Point -> Resolución de contexto -> Agregar a viaje activo.
4. **Kiosk Handoff**: Interacción en kiosco público -> Código QR -> Continuar en teléfono (sin transferir sesión).
5. **Desktop to Mobile**: Creación de itinerario en escritorio -> Carga sincronizada en PWA móvil.
6. **Offline Access**: Guardar viaje -> Desconectar red -> Consulta de itinerario, paradas y contactos.
7. **Offline Conflict**: Edición offline simultánea a cambio en servidor -> Detección de estado CONFLICT.
8. **Reservation Flow**: Inicio desde destino/IA -> Snapshot de precio -> Confirmación -> Actualización en Trip Hub.
9. **Payment Return**: Retorno desde pasarela segura -> Validación en servidor -> Estado de reserva actualizado.
10. **Passport Check-in**: Validación en Smart Point -> Generación de sello verificado en Pasaporte Digital.
11. **Notification Deep Link**: Notificación de reserva -> Clic -> Apertura directa en recurso canónico.
12. **Contextual Concierge**: Pregunta en viaje activo "¿Qué sigue?" -> Inyección de contexto -> Respuesta precisa.
13. **Map Failure Resiliency**: Caída de servicio de mapas -> Trip Hub se mantiene operativo con vista textual.
14. **AI Failure Resiliency**: Falla en servicio de IA -> Navegación e itinerarios funcionan normalmente.
15. **Logout Cache Cleanliness**: Cierre de sesión -> Limpieza total de datos privados en almacenamiento local.
16. **Private Share Security**: Enlace de viaje privado abierto por visitante no autorizado -> Rechazo seguro / Auth requerida.
17. **Country Context Integrity**: Viaje en Nicaragua -> Moneda NIO, líneas de auxilio 118/128/115 y huso GMT-6.
18. **Trust Presentation**: Consulta de destino -> Sello de verificación con evidencia sin saturación de badges.
19. **Predictive Signals**: Viaje activo -> Indicador de afluencia anticipada con etiqueta explícita de estimación.
20. **GIS Accuracy**: Cálculo de ruta entre paradas con distancias y tiempos de traslado geoespaciales reales.
