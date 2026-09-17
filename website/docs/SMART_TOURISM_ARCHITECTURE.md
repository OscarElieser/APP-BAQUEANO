# ARQUITECTURA GENERAL DE SMART TOURISM & IoT — BAQUEANO NICARAGUA

## 1. Topología del Ecosistema

El ecosistema de Smart Tourism de Baqueano conecta cuatro capas operativas:

```
[CAPA 1: SENSORES EN CAMPO] (Nodos LoRaWAN / BLE / Celular)
        ↓
[CAPA 2: EDGE GATEWAYS & SEÑALÉTICA FÍSICA] (Smart Points con Placas QR/NFC)
        ↓
[CAPA 3: CLOUD INGESTION & CONTEXT RESOLVER] (Next.js API Ingestion + Edge SSG)
        ↓
[CAPA 4: EXPERIENCIA DEL USUARIO & ADMIN] (Smart PWA / Kiosk Mode / Admin Console)
```

---

## 2. Flujo de Datos y Transmisión

1. **Monitoreo Ambiental**:
   - Cada nodo de sensor ambiental registra métricas (temperatura, humedad, radiación UV, caudal de río) a intervalos programados (ej. cada 15 a 60 min).
   - Los datos se transmiten vía LoRaWAN (868/915 MHz) o celular NB-IoT/4G hacia el endpoint seguro `/api/iot/v1/telemetry`.
   - El endpoint valida el token del dispositivo, verifica rangos físicos y persiste lecturas en Firestore / Cloud Storage.

2. **Interacción del Visitante**:
   - El visitante escanea un código QR o aproxima un smartphone NFC a la placa del Smart Point.
   - El navegador resuelve `baqueano.app/p/[slug]` en milisegundos.
   - La página contextual muestra alertas de sendero en tiempo real, aforo estimado actual, audioguía sin fricción y normas ambientales de la reserva.

3. **Modo Kiosco**:
   - Dispositivos táctiles ubicados en centros comunitarios y centros de interpretación ejecutan `/kiosk/[smartPointId]`.
   - Ofrecen exploración autónoma de senderos, mapas de relieve, audioguías accesibles y transferencia de itinerarios al smartphone mediante QR.

---

## 3. Resiliencia y Funcionamiento Offline

- **PWA Service Worker**: El resolver contextual almacena en caché local las fichas de los senderos principales del parque tras el primer acceso.
- **NFC Direct Payload**: Las etiquetas NFC pueden almacenar registros NDEF con texto plano de emergencia y coordenadas UTM directas, legibles incluso sin conexión celular.
- **Store-and-Forward en Gateways**: Los gateways de campo cuentan con almacenamiento flash local (eMMC) para retener hasta 30 días de telemetría en caso de corte en la red celular rural.
