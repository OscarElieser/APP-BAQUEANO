# 🧭 BAQUEANO 2.0 — SECURITY ARCHITECTURE

## 1. Modelo de Amenazas y Controles Implementados
- **Autenticación e Identidad**: Firebase Auth con JWTs verificados criptográficamente.
- **Control de Acceso (RBAC / ABAC)**: Roles `super_admin`, `admin`, `host`, `explorer` validados del lado del servidor.
- **Seguridad en Bases de Datos**: Reglas de seguridad de Firestore con política de denegación por defecto (*Default Deny*).
- **Protección de Cabeceras Web**: CSP estricto, HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy.
- **Prevención de Inyecciones**: Sanitización de Markdown y bloqueo de Prompt Injection en el AI Gateway.
- **Aislamiento de Recursos Financieros**: Cero almacenamiento de números de tarjeta (PAN), CVV o PIN.

## 2. Invariantes de Auditoría y Secretos
- Cero claves privadas o secretos de infraestructura incluidos en el repositorio o en los artefactos de compilación móvil/web.
