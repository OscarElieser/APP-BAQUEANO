# 🧭 BAQUEANO — EXPERIENCE SECURITY MODEL

## 🎯 1. POR QUÉ (WHY)
Proteger la integridad de las cuentas de usuario, la privacidad de los itinerarios no publicados y blindar la plataforma contra vectores de ataque comunes en enlaces y dispositivos públicos.

## ⚙️ 2. CÓMO (HOW)
- **Amenazas Mitigadas**:
  - *Open Redirects*: Bloqueados por validación estricta de rutas canónicas en `deep-link-resolver.service.ts`.
  - *Fijación de Sesión & Fuga de Datos en Kioscos*: Prohibición total de transferencia de credenciales o tokens de sesión desde pantallas públicas a teléfonos móviles (el QR sólo transfiere el ID del contenido público).
  - *Filtración de Cache Offline*: Al invocar `logout`, se eliminan selectivamente todos los itinerarios privados y reservas cacheados en el dispositivo.
  - *Manipulación de Códigos QR (QR Tampering)*: Verificación de firma y dominio canónico antes de renderizar interfaces interactivas.

## 📦 3. QUÉ (WHAT)
- Autorización basada en roles (RBAC) y reglas de seguridad de Firestore (`request.auth.uid == resource.data.userId`).
- Enlaces de viaje compartido en modo `VIEWER` (sólo lectura) no exponen información de contacto ni datos de pago.
