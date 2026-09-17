# 🧭 RUNBOOKS — GUÍAS OPERATIVAS & PROTOCOLOS DE INCIDENTES DE PLATAFORMA

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proveer procedimientos operativos estandarizados y paso a paso para que los ingenieros y operadores respondan eficazmente ante fallas críticas del sistema (degradación de base de datos, fuga de credenciales, fallas de pasarela o despliegues defectuosos).

---

## ⚙️ 2. CÓMO (HOW / FORMATO ESTÁNDAR DE RUNBOOK)

Todo runbook sigue la estructura:
- **Síntomas / Detección**: Cómo se identifica la falla (alertas, errores HTTP, anomalías).
- **Verificación**: Comprobación rápida del estado del servicio.
- **Mitigación Inmediata**: Acción de contención rápida para restaurar el servicio a los usuarios.
- **Rollback / Recuperación**: Procedimiento de reversión si aplica.
- **Escalamiento**: A quién notificar según la severidad.
- **Verificación Final**: Pruebas de validación de normalidad.

---

## 📦 3. QUÉ (WHAT / RUNBOOKS CRÍTICOS)

### 🚨 RUNBOOK 01: Fallo o Latencia Severa en Baqueano AI Gateway
1. **Síntoma**: Errores 504 Gateway Timeout o 500 en `/api/baqueano-ai`.
2. **Mitigación**: Acceder a `/plataforma` en panel de admin y desactivar conmutador `ai_gateway_enabled`.
3. **Efecto**: La UI entra inmediatamente en modo catálogo estático seguro.

### 🚨 RUNBOOK 02: Despliegue con Error en Producción (Bad Deploy)
1. **Síntoma**: Errores 500 generalizados o fallo de renderizado tras una publicación.
2. **Mitigación**: Ejecutar rollback en Firebase Hosting al deployment previo verificado (`firebase hosting:clone` o reversión en consola).
3. **Tiempo Estimado**: &lt; 2 minutos.

### 🚨 RUNBOOK 03: Fuga de Credencial o API Key
1. **Síntoma**: Reporte de clave expuesta o actividad anómala de invocación.
2. **Mitigación**: Ingresar a `/plataforma` &rarr; Partner APIs &rarr; Seleccionar la clave y pulsar "Revocar Clave".
3. **Escalamiento**: Notificar al contacto técnico de la organización afectada y emitir nuevo prefijo.
