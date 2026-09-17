# 🧭 MODELO DE SEGURIDAD Y PROTECCIÓN DE IA — BAQUEANO AI

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Proteger al ecosistema Baqueano contra ataques de inyección de prompts, manipulaciones de contexto, exfiltración de secretos de servidor y ejecuciones no autorizadas de herramientas, salvaguardando la integridad de los datos de exploradores y anfitriones.

---

## ⚙️ 2. CÓMO (HOW / DEFENSAS & GUARDARRAÍLES)

- **Aislamiento de Secretos Server-Side**: Las claves de API de proveedores de IA residen exclusivamente en variables de entorno del servidor; el navegador jamás tiene acceso a credenciales privadas.
- **Tratamiento de Datos RAG como Contenido No Confiable**: La información recuperada de base de datos se procesa como datos de contexto, no como instrucciones ejecutables.
- **Sin Autonomía Financiera ni Transaccional**: La IA tiene prohibido terminantemente confirmar reservas, procesar pagos o modificar roles de usuarios de forma autónoma.
- **Sanitización de Salida**: Todo texto generado es sanitizado para eliminar posibles inyecciones de script (XSS) o etiquetas HTML arbitrarias.

---

## 📦 3. QUÉ (WHAT / CAPAS DE SEGURIDAD DE IA)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ CAPAS DE SEGURIDAD DE BAQUEANO AI                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Capa de Entrada: Rate limiting por IP/Sesión y descarte de PII.          │
│ 2. Capa de Intención: Clasificación de intención antes de procesar.         │
│ 3. Capa de Invocación: Invocación server-side (/api/baqueano-ai).           │
│ 4. Capa de Herramientas: Whitelist con control RBAC por rol verificado.     │
│ 5. Capa de Salida: Validación de esquema Zod y rechazo de IDs inventados.   │
│ 6. Capa de Auditoría: Registro de telemetría sin almacenar prompts privados.│
└─────────────────────────────────────────────────────────────────────────────┘
```
