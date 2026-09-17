# 🔐 MODELO DE SEGURIDAD & BLINDAJE — BAQUEANO WEB & ADMIN

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Blindar el ecosistema digital BAQUEANO contra accesos no autorizados, escalada de privilegios, manipulación de precios o reservas, y filtraciones de información personal o sensible en territorio.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA DE SEGURIDAD)
El modelo opera en cuatro capas defensivas:

1. **Capa 1: Aislamiento de Red y Origen (Headers)**:
   - Cabeceras de seguridad estrictas:
     - `Content-Security-Policy`: Restringe orígenes de scripts y conexiones solo a Firebase, Google Maps y dominios propios.
     - `X-Frame-Options: DENY`: Prevención de Clickjacking.
     - `X-Content-Type-Options: nosniff`: Prevención de MIME-sniffing.
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - `Permissions-Policy: geolocation=(self), camera=(), microphone=()`.

2. **Capa 2: Autenticación e Identidad (Firebase Auth + Claims)**:
   - Proveedores: Google Sign-In y Correo/Contraseña.
   - La autorización de privilegios se basa en **Custom Claims del ID Token** (`request.auth.token.role`), jamás en datos almacenados en `localStorage` o en documentos modificables por el cliente.

3. **Capa 3: Reglas de Firestore de Producción (`firestore.rules`)**:
   - Denegación por defecto (`allow read, write: if false;`).
   - Inmutabilidad estricta en `audit_logs`, `payment_orders`, `payment_transactions`.
   - Modificación de destinos restringida exclusivamente a administradores acreditados (`isAdmin()`).
   - Favoritos (`user_saved_places`) aislados estrictamente por usuario (`userId == request.auth.uid`).

4. **Capa 4: Almacenamiento Seguro (Firebase Storage)**:
   - Validación obligatoria de tipo MIME (`image/jpeg`, `image/png`, `image/webp`).
   - Límite de tamaño máximo por imagen (5 MB).
   - Prohibición de subida de ejecutables, scripts o archivos binarios arbitrarios.
   - Nombres sanitizados basados en UUID para evitar sobreescrituras accidentales o traversal.

---

## 📦 3. QUÉ (WHAT / PROTOCOLO ANTE INCIDENTES & AUDITORÍA)
- **Monitoreo de Anomalías**: Intentos reiterados de inicio de sesión o peticiones con tokens inválidos son registrados y bloqueados mediante rate-limiting.
- **Inmutabilidad de Auditoría**: Ni administradores ni usuarios pueden alterar o purgar entradas en `/audit_logs`.
- **Cero Datos Bancarios**: La plataforma delega la tokenización a la pasarela bancaria oficial autorizada. Nunca se recopila ni almacena PAN completo, CVV o PIN.
