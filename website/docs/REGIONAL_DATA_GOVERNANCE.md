# GOBIERNO DE DATOS & TRANSFERENCIA TRANSFRONTERIZA REGIONAL

## 1. Ámbitos de Datos (Data Scopes)

Cada dataset dentro del ecosistema Baqueano posee una etiqueta explícita de ámbito:
- **`GLOBAL / REGIONAL`**: Datos de catálogo público (atractivos, categorías, diccionarios de traducción, configuraciones de país).
- **`COUNTRY_RESTRICTED`**: Datos fiscales de comercios, registros de reservas, números de teléfono locales y contratos de cooperativas asociados a un único país.

---

## 2. Residencia de Datos y Anonimización de Telemetría

- **Telemetría y Analítica**: Todo evento analítico incluye la propiedad `country_code` (ej: `"NI"`), pero descarta cualquier identificador personal o dirección IP completa para garantizar privacidad estricta.
- **Auditoría Transfronteriza**: Todo acceso administrativo a registros de otro país queda asentado en `audit_logs` con la firma criptográfica del operador.
