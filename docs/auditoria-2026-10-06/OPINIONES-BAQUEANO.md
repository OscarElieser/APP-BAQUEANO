<!--
POR QUÉ: dejar por escrito qué hace la función "Opiniones sobre BAQUEANO", qué está probado y
qué falta antes de producción, sin pintar de verde lo que no se pudo demostrar.
CÓMO: cada punto cita el archivo, la migración o la prueba que lo respalda.
QUÉ: informe técnico, funcional y legal de la función de opiniones (web, Ops Center, Supabase).
-->
# Opiniones sobre BAQUEANO — informe de implementación (2026-10-06)

## 1. Qué se construyó

| Pieza | Archivo | Estado |
|---|---|---|
| Base de datos | `supabase/migrations/20261006090000_platform_reviews.sql` | 🟢 Aplicada en Supabase y verificada con una prueba revertida |
| Edge Function | `supabase/functions/baqueano-reviews/index.ts` | 🟢 Desplegada (v1, ACTIVE); el código desplegado es igual al del repositorio |
| Página pública | `website/opiniones.html`, `js/platform-reviews.js`, `css/pages/opiniones.css` | 🟢 Probada en navegador (respuestas simuladas) |
| Normas y Política de Opiniones | `website/normas-comunidad.html` | 🟡 Publicada en la web; **falta validación legal** |
| Moderación en Ops Center | `website/js/ops-center/ops-platform-reviews.js`, vista `37-opiniones` en `admin.html` | 🟢 Probada en navegador (respuestas simuladas) |
| Acceso desde el perfil | `website/perfil.html` → pestaña "Mi opinión" | 🟢 |
| Menú y pie | `js/navigation.js` (Comunidad), `js/global-injector.js` (Comunidad y Legal) | 🟢 |
| Idiomas | 102 claves `platformReviews.*`, 28 `communityRules.*`, 2 `opsReviews.*`, 2 `menu.*`, en es/en/fr/it/pt/de | 🟢 Control de traducciones: 0 errores |
| App Android | — | 🔴 Pendiente: la app no tiene todavía la pantalla de opiniones |

## 2. Reglas que el sistema hace cumplir (no solo la interfaz)

- **Sin opiniones anónimas.** `submit` exige un token de Firebase válido (jose + JWKS). Sin sesión responde 401 `login_required`, verificado en vivo.
- **Una opinión activa por usuario.** Índice único `platform_reviews_one_active_per_user`. Si el usuario edita, la opinión vuelve a `pending`.
- **Moderación previa.** Toda opinión nueva o editada queda en `pending`. Lo público solo ve `approved`.
- **Promedio y distribución reales.** `platform_review_summary()` calcula en Supabase con las opiniones aprobadas; no hay ningún valor fijo. Hoy el resultado es `count: 0` (verificado en vivo).
- **Sin borrado directo.** Un disparador impide `DELETE` en `platform_reviews` y en el historial. El historial `platform_review_events` es de solo agregar. Si el usuario pide borrar, se borra el texto, el nombre y la foto, y el registro queda anonimizado.
- **Decisiones auditadas.** `moderate`, `respond` y `resolve_report` escriben en `audit_logs` (módulo `opiniones`) la cuenta administradora, la acción, la fecha y el motivo. Rechazar, ocultar o resolver un reporte exige un motivo de al menos 5 caracteres; el servidor y la interfaz lo comprueban.
- **Roles desde el servidor.** Actuar requiere admin o superadmin y ver requiere auditor, según `effectiveStaffRole`. Nunca se usa `user_metadata`.
- **Protección contra abuso.**
  - Control de origen en las acciones de escritura (CSRF): un origen ajeno recibe 403, verificado en vivo.
  - Límite por IP mediante `baqui_consume_budget`.
  - Límite por usuario: 6 escrituras por hora y 10 reportes por hora.
  - Se rechazan enlaces, correos, teléfonos y caracteres repetidos.
  - Tamaño máximo de la solicitud.
  - La página pinta todo con `textContent`.
- **Privacidad en lo público.**
  - `platform_reviews_public()` devuelve solo el nombre, la foto (si el usuario lo permite), las estrellas, el comentario, la fecha y la respuesta.
  - Nunca devuelve el correo, el teléfono, el UID, la IP ni tokens.
  - En el Ops Center el UID llega enmascarado.
- **Foto del usuario.** Solo se muestra si es una URL https de Google o Firebase Storage; si no, se muestran las iniciales. El usuario puede ocultarla con "Mostrar mi foto".
- **Textos honestos.**
  - La insignia dice "Usuario BAQUEANO autenticado", nunca "verificado".
  - La página aclara que BAQUEANO conecta viajeros con propietarios y no gestiona reservas.
  - La respuesta institucional aparece separada del texto del usuario, como "Respuesta de BAQUEANO".

## 3. Pruebas realizadas (evidencia)

| Prueba | Resultado |
|---|---|
| SQL en una transacción revertida: duplicado, borrado, inmutabilidad del historial, resumen solo de aprobadas | 🟢 Todo bloqueado o correcto; no quedaron filas |
| Edge Function en vivo, vía `extensions.http` desde la BD | 🟢 summary 200, list 200, submit sin sesión 401, mod_list sin sesión 401, token falso 401, origen ajeno 403, acción desconocida 400 |
| Playwright en `opiniones.html`, en estado vacío y con datos de ejemplo de la prueba, a 320, 390 y 1366 px | 🟢 Ver detalle abajo |
| Playwright en `normas-comunidad.html` a 320, 390, 768 y 1366 px | 🟢 axe sin fallas, sin scroll horizontal |
| Playwright en la vista 37 del Ops Center | 🟢 Ver detalle abajo |
| `npm run i18n` | 🟢 0 errores |

Detalle de la prueba de `opiniones.html`:
- sin scroll horizontal y axe (WCAG 2.2 AA) sin fallas graves;
- validación de los 3 campos;
- estrellas operables con el teclado;
- al publicar sin sesión aparece el panel de inicio de sesión y el borrador queda guardado;
- un texto con HTML se muestra como texto;
- una foto de un dominio ajeno no se carga.

Detalle de la prueba de la vista 37 del Ops Center:
- sin motivo no se envía nada;
- no hay botón de eliminar;
- un nombre con HTML se muestra como texto;
- los botones envían exactamente `moderate`, `resolve_report` y `respond` con los campos esperados;
- el contador del menú funciona.

**No probado de punta a punta con una cuenta real.** Esta prueba debe hacerla el equipo en producción:
1. iniciar sesión con Google;
2. publicar una opinión;
3. aprobarla desde el Ops Center con una cuenta admin;
4. comprobar que aparece y que el promedio cambia.

El proxy de este entorno bloquea `supabase.co` desde el navegador, así que las pruebas de interfaz usan respuestas simuladas con el mismo formato que devolvió la función en vivo.

## 4. Pendientes antes de anunciar la función

1. 🔴 **Validación legal** de `normas-comunidad.html` (Política de Opiniones) frente a la Ley 787 (protección de datos personales) y la Ley 842 (protección de los consumidores). La página ya muestra este aviso.
2. 🟡 Desplegar la web en Azure con `azure/deploy.sh` para que `opiniones.html` y `normas-comunidad.html` lleguen a producción. La función y la BD ya están en vivo.
3. 🟡 Prueba de punta a punta con una cuenta real (ver la sección 3).
4. 🔴 Pantalla de opiniones en la app Android: por ahora la app no la tiene.
