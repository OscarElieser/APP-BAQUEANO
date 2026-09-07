# SEGURIDAD DEL ECOSISTEMA ABIERTO & GESTIÓN DE CREDENCIALES

## 1. Principios de Seguridad de la API Platform

1. **Almacenamiento de Claves Hash**: Las API keys emitidas a aliados nunca se guardan en texto plano en base de datos; se persiste exclusivamente su hash criptográfico SHA-256.
2. **Cero Claves Maestras**: No existe una clave universal con permisos irrestrictos; cada credencial está acotada por `scopes` explícitos y ámbito geográfico (`countryScope`).
3. **Aislamiento de Sandbox**: Las claves con prefijo `bq_test_...` operan contra una réplica aislada de datos y tienen bloqueada cualquier escritura en producción.
4. **Revocación Instantánea (Kill-Switch)**: Un administrador puede revocar o suspender una clave comprometida desde la consola `/desarrolladores` con efecto inmediato en menos de 1 segundo.

---

## 2. Mitigación de Amenazas (Threat Modeling)

- **Prevención de Scraping Masivo**: Rate limiting en el Edge (máximo 120 req/min para Open Data, cuotas personalizadas para Partners).
- **Inyección y Mass Assignment**: Todos los parámetros de entrada se validan estrictamente mediante esquemas Zod antes de su ejecución.
- **Protección CORS**: Endpoints públicos de Open Data permiten `Access-Control-Allow-Origin: *`, mientras que endpoints transaccionales restringen orígenes autorizados.
