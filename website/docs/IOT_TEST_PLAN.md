# PLAN INTEGRAL DE PRUEBAS DE SOFTWARE & SIMULACIÓN IoT

## 1. Estrategia de Pruebas

El ecosistema de Smart Tourism de Baqueano cuenta con pruebas automáticas y suites de validación cruzada:

1. **Validación de Esquemas Zod**:
   - Comprobación de que payloads de telemetría fuera de límites físicos generen rechazo o clasificación `SUSPECT` / `OUT_OF_RANGE`.
2. **Pruebas de Ingestión HTTP (`/api/iot/v1/telemetry`)**:
   - Pruebas de autenticación con `X-Device-API-Key` válida e inválida.
   - Manejo de ráfagas de lecturas múltiples (batch payload de hasta 100 mediciones).
   - Inyección de datos anómalos (ej. temperatura de 150°C) para verificar descarte seguro.
3. **Pruebas del Resolver Contextual (`/p/[slug]`)**:
   - Comprobación de renderizado para slugs válidos e inválidos (página 404 controlada).
   - Verificación de tiempo de carga inferior a 500 ms y ausencia de fugas de memoria en audio player.
4. **Pruebas del Modo Kiosco (`/kiosk/[smartPointId]`)**:
   - Comprobación del temporizador de 90 segundos para reset de sesión.
   - Navegación táctil fluida y generación correcta de QR de continuidad móvil.
5. **Pruebas de la Consola Admin**:
   - Visualización de Smart Points, filtrado de tareas de campo y actualización del estado a `DONE`.
