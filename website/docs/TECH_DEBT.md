# 📋 REGISTRO DE DEUDA TÉCNICA — BAQUEANO WEB & ADMIN

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Documentar de forma explícita y transparente aquellas mejoras arquitectónicas o dependencias externas que, por falta de credenciales o por su naturaleza diferida, no deben implementarse mediante parches frágiles en esta fase.

---

## ⚙️ 2. CÓMO (HOW / METODOLOGÍA)
Cada ítem clasifica:
- **Problema**: Descripción técnica de la limitación actual.
- **Impacto**: Efecto en el ecosistema, rendimiento o experiencia de usuario.
- **Prioridad**: Crítica, Alta, Media o Baja.
- **Solución Recomendada**: Camino técnico a seguir en fases posteriores.

---

## 📦 3. QUÉ (WHAT / ITEMS DE DEUDA TÉCNICA REGISTRADOS)

### Ítem 1: Paginación Dinámica con Cursores en Listados Grandes
- **Problema**: El listado de destinos actualmente obtiene hasta 48 o 100 documentos mediante `limit()`. A medida que el catálogo nacional supere los miles de destinos, la consulta en bloque consumirá lecturas innecesarias.
- **Impacto**: Incremento en consumo de cuota Firestore y tiempo de carga en conexiones lentas de territorio.
- **Prioridad**: Media.
- **Solución Recomendada**: Implementar `startAfter()` con scroll infinito o paginación numerada en `@baqueano/firebase`.

### Ítem 2: Procesamiento y Transcodificación Automática de Imágenes
- **Problema**: Las imágenes subidas por administradores se almacenan en su resolución original validada.
- **Impacto**: Mayor consumo de ancho de banda móvil si la imagen original excede 2 MB.
- **Prioridad**: Alta.
- **Solución Recomendada**: Desplegar una Cloud Function que genere variantes automáticas (`thumb_300`, `card_800`, `hero_1600`) en formato WebP/AVIF con compresión lossy asistida.

### Ítem 3: Custom Claims Automáticos en Firebase Auth
- **Problema**: En desarrollo inicial, la verificación administrativa en frontend valida el correo oficial contra la lista blanca (`oscarelieser.informatica.inatec@gmail.com` y `vigoronmixt@gmail.com`), mientras que las reglas de producción requieren el Custom Claim `token.role`.
- **Impacto**: Requiere ejecutar un script de administración con Firebase Admin SDK para fijar `{ role: 'super_admin' }` en el token del usuario en Firebase Auth.
- **Prioridad**: Alta.
- **Solución Recomendada**: Script CLI seguro en `packages/firebase/scripts/set-admin-claim.ts` que reciba el Service Account privado para emitir los claims oficiales.

### Ítem 4: Pasarela de Pagos Oficial
- **Problema**: No existe aún contratación formal de pasarela bancaria nacional (BAC / Banpro / Tilopay) con credenciales Sandbox activas.
- **Impacto**: El módulo de pagos permanece en modo de arquitectura preparada sin procesamiento en vivo.
- **Prioridad**: Media.
- **Solución Recomendada**: Integrar el SDK bancario oficial una vez formalizado el contrato comercial.
