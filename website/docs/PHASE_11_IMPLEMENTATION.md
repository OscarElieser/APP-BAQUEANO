# BAQUEANO ECOSYSTEM — FASE 11: SMART TOURISM, IoT & TERRITORIO CONECTADO

## 1. Visión Ejecutiva de la Fase 11

La **Fase 11** materializa la convergencia entre el software digital de Baqueano y el territorio físico nicaragüense. Mediante la articulación de **Smart Points** (puntos inteligentes georreferenciados), señalética interactiva física con **QR/NFC**, kioscos táctiles de autoatención para centros de visitantes, y una red de sensores **IoT de monitoreo ambiental y aforo**, Baqueano transforma la exploración turística en una experiencia inmersiva, sostenible y segura para las comunidades rurales y guardaparques.

---

## 2. Componentes Clave Entregados

### A. Dominio & Esquemas Tipados (`packages/types`, `packages/validators`, `packages/config`)
- **`SmartPointRecord`**: Definición estructural de tótems, senderos, miradores y refugios (`TRAILHEAD`, `INTERPRETIVE_STATION`, `VIEWPOINT`, `SHELTER_SAFETY`, `COMMUNITY_CENTER`, `KIOSK_TOTEM`).
- **`IoTDeviceRecord`**: Registro de hardware de campo (`GATEWAY`, `WEATHER_STATION`, `FOOTFALL_COUNTER`, `RIVER_MONITOR`, `AUDIO_BEACON`).
- **`SensorRecord` & `SensorReading`**: Telemetría ambiental y física (temperatura, humedad, UV, nivel de río, aforo acumulado, calidad de aire).
- **`FieldMaintenanceTask`**: Sistema de órdenes de trabajo y gestión de mantenimiento de campo para guardaparques.
- **`iotTelemetryPayloadSchema`**: Validación Zod estricta para ingestión de telemetría IoT con rangos físicos de plausibilidad y descarte de anomalías.

### B. Aplicación Web Pública (`apps/web`)
1. **Resolver Contextual QR/NFC (`/p/[slug]`)**:
   - Resuelve el escaneo físico en senderos en menos de 500 ms.
   - Peso ultraligero (< 50 KB inicial) optimizado para conectividad EDGE/3G en zonas remotas.
   - Datos de aforo en vivo, audioguías en español/inglés/miskito, normas de conservación ambiental, y botón de llamada directa de emergencia al puesto de control.
2. **Modo Kiosco / Tótem Táctil (`/kiosk/[smartPointId]`)**:
   - Diseñado para pantallas de autoatención en centros de interpretación y entradas de reservas.
   - Interfaz táctil de alto contraste (mínimo 56px de touch target), selector multilingüe, temporizador de inactividad con reseteo a los 90 segundos.
   - Código QR dinámico de "Continuidad Móvil" para transferir la ruta o audioguía al smartphone del visitante.
3. **Endpoint de Ingestión de Telemetría IoT (`/api/iot/v1/telemetry`)**:
   - Ingestión segura con cabecera `X-Device-API-Key` y firma opcional HMAC-SHA256.
   - Clasificación de calidad de datos (`VALID`, `SUSPECT`) según límites de rangos de plausibilidad ambiental (ej. temperatura -10°C a 60°C).

### C. Consola Administrativa (`apps/admin`)
1. **Gestión de Smart Points (`/smart-points`)**:
   - Catálogo territorial de puntos inteligentes con métricas de escaneos QR/NFC, estado operativo y simulador de escaneo en vivo.
2. **Flota de Dispositivos IoT (`/dispositivos`)**:
   - Monitoreo de salud de gateways, niveles de batería LiFePO4, estado de conectividad (ONLINE/OFFLINE/DEGRADED) y alertas de telemetría.
3. **Operaciones de Campo & Mantenimiento (`/operaciones-campo`)**:
   - Tablero de tickets técnicos para guardaparques y técnicos locales, con priorización de urgencias, registro de notas de calibración y resolución en un toque.

---

## 3. Privacidad y Seguridad por Diseño (Privacy by Design)

- **Cero Vigilancia Biométrica**: Prohibición explícita de reconocimiento facial, lectura de placas o rastreo de direcciones MAC en todo el ecosistema.
- **Aforo Agregado Anónimo**: La estimación de densidad y aforo se basa exclusivamente en contadores infrarrojos/ultrasónicos y lecturas agregadas de escaneo de QR voluntarios.
- **Autenticación Criptográfica de Dispositivos**: Cada gateway de campo posee llaves API revocables de forma granular, aisladas por Smart Point y organización local.
