# SEGURIDAD, AUTENTICACIÓN & INTEGRIDAD EN INFRAESTRUCTURA IoT

## 1. Principios Rectores de Seguridad IoT

1. **Aislamiento de Dispositivos**: Los dispositivos de campo no poseen acceso directo a la base de datos ni a servicios internos de backend; se comunican exclusivamente a través del endpoint de ingestión HTTPS `/api/iot/v1/telemetry`.
2. **Autenticación por Dispositivo**: Cada gateway y sensor posee una credencial única preaprovisionada (`X-Device-API-Key`).
3. **Firmado de Payloads (HMAC-SHA256)**: Soporte para verificación criptográfica de la carga útil enviada por gateways de alta fidelidad, previniendo ataques de hombre en el medio (MitM) o inyección de lecturas falsas.
4. **Cero Superficie de Ataque Inbound en Nodos**: Los nodos de campo operan en modo *Push Only* (no escuchan en puertos abiertos ni exponen servidores HTTP locales vulnerables).

---

## 2. Ciclo de Vida de Credenciales y Rotación

- **Aprovisionamiento**: Al dar de alta un dispositivo en la consola `/dispositivos`, se genera un secreto aleatorio de 256 bits codificado en Base64.
- **Almacenamiento Seguro**: El backend almacena únicamente el hash SHA-256 del secreto.
- **Revocación Instantánea**: Un administrador puede revocar o suspender una API Key en un solo clic desde la consola si un nodo físico es sustraído o manipulado indebidamente.

---

## 3. Mitigación de Ataques de Denegación de Servicio (DoS / Rate Limiting)

- El endpoint `/api/iot/v1/telemetry` implementa limitación de tasa por IP y por `deviceId` (máximo 60 peticiones por minuto por dispositivo registrado).
- Los payloads se restringen a un tamaño máximo estricto de 128 KB para evitar saturación de memoria.
- Validación inmediata de esquemas con Zod antes de cualquier procesamiento asíncrono o persistencia en disco.
