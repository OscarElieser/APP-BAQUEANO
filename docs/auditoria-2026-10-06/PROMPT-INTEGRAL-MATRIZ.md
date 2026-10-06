<!--
POR QUÉ: el Prompt Maestro Integral pide auditar antes de tocar código y entregar una matriz inicial
(Módulo | Problema | Severidad | Causa | Solución | Estado) que guíe las fases sin pintar verde nada no probado.
CÓMO: cada fila sale de una búsqueda real en el repositorio (grep) o de una consulta a Supabase el 2026-10-06.
QUÉ: matriz de hallazgos de las 29 referencias críticas y el orden de las fases. Se actualiza al cerrar cada fase.
-->
# Prompt Maestro Integral — matriz inicial de hallazgos (2026-10-06)

**Leyenda:** 🟢 completado y probado · 🟡 parcial · 🔴 pendiente.
**Severidad:** P0 promete algo falso o expone datos · P1 función rota · P2 calidad o UX.

## Arquitectura encontrada

- **Web estática:** 34 páginas en `website/`. El JS es vanilla y se comparte mediante `navigation.js`, `global-injector.js`, `global-language.js` y `global-search.js`. Se despliega en Azure VM (nginx) con `azure/deploy.sh`.
- **Supabase (fuente principal).**
  - 79 tablas, todas con RLS.
  - Datos reales en: 17 departamentos, 153 municipios, 237 lugares, 30 negocios, 7 destinos y 31 planes de viaje.
  - Tablas vacías: `music`, `experiences`, `culture`, `testimonials`, `profiles` y otras.
- **Firebase Auth:** el inicio de sesión de la web. Las Edge Functions verifican el token con JWKS.
- **i18n:** un solo sistema, `BaqueanoLanguage`, con 6 idiomas, el evento `baqueano:languageChanged` y sin `location.reload` en el código. El control de traducciones da 0 errores.
- **Faltan tablas para:** mensajes de contacto, solicitudes de negocio, denuncias ambientales, crónicas y comunidad social.

## Matriz

| # | Módulo | Problema verificado | Sev. | Causa | Solución | Estado |
|---|---|---|---|---|---|---|
| 1 | denuncias.html | El formulario muestra `alert('✅ Tu reporte ha sido registrado con éxito…')` y no guarda nada | P0 | `onsubmit` inline sin backend | Tabla `eco_reports` + Edge Function + código BAQ-ECO + vista en Ops Center | 🟢 Fase 1 (mapa: probar en producción) |
| 2 | Pies de página (denuncias, mi-negocio, departamento) | Boletín: "¡Gracias por unirte!" sin guardar nada | P0 | `alert` inline | Mostrar el estado real ("Próximamente") o guardar de verdad | 🔴 |
| 3 | nosotros.html | Correo visible `hola@baqueano.nic`; el formulario no llega a Supabase ni al Ops Center | P0 | Sin backend | Correo oficial `baqueanonicaragua@gmail.com`; tabla `contact_messages` + código BAQ-CONTACT | 🟢 Fase 1 |
| 4 | aliados.html / navigation.js | "Postular mi negocio" responde con un `alert` y abre WhatsApp; no queda registro | P0 | Sin tabla | `business_applications` + código BAQ-BIZ + Ops Center | 🟢 Fase 1 |
| 5 | calculator.js | `alert` de "Orden #… registrada por $… USD" | P0 | Flujo de orden ficticio | Revisar y desactivar la orden si no hay pasarela | 🔴 |
| 6 | perfil.html | "Abrir checkout" de pagos sin pasarela real | P0 | Texto de una maqueta | Bloque "Próximamente" | 🔴 |
| 7 | baqueano-ia.html | Botón "Reservar todo" | P1 | Copia de una maqueta | "Contactar servicios de la ruta" | 🔴 |
| 8 | 45 `alert()`/`prompt()` públicos | Experiencia nativa, sin i18n | P1 | No había un componente de diálogo | `BaqueanoDialog` global accesible | 🔴 |
| 9 | aliados.html | "Ver perfil" lleva a `departamento.html?id=…` | P1 | Enlaces fijos | Ficha del aliado (modal) desde `businesses` | 🔴 |
| 10 | ambiental.html | "Quiero unirme" lleva a `perfil.html` | P1 | Enlace provisional | Flujo hacia la comunidad (testimonios y opiniones existentes); comunidad social nueva en fase posterior | 🔴 |
| 11 | terminos / aviso-legal / Mi Viaje / BAQUI | PDF hecho con `window.print()` | P1 | Sin generador | Plantilla PDF con texto real, portada, índice y "Página X de Y" | 🔴 |
| 12 | musica.html | Dice "93 grabaciones preservadas" pero hay 6 tarjetas; la tabla `music` está vacía | P0 | Número fijo | Contar las piezas reales o no mostrar el número | 🔴 |
| 13 | musica.html | "Ver todos los artistas" e "instrumentos" llevan a `#archivoSonoro` | P1 | Ancla equivocada | Lista completa de lo que existe | 🔴 |
| 14 | musica / gastronomia / destinos | `alert('Baqüi te sugiere…')` | P1 | Maqueta | Abrir BAQUI con la consulta real | 🔴 |
| 15 | cronicas.html | Las tarjetas llevan a `departamento.html` en vez de a la crónica | P1 | No existe la tabla de crónicas | Plataforma editorial (tabla + moderación) en una fase posterior | 🔴 |
| 16 | historia.html | Anclas `#guerraNacional`/`#pueblosOriginarios`: hay que comprobar que no se vean como texto | P2 | — | Verificar en el navegador | 🟡 |
| 17 | perfil.html | "Editar" son enlaces `?editar=` que hay que verificar | P1 | — | Verificar en el navegador | 🟡 |
| 18 | Búsqueda global | Existe `global-search.js` | — | — | Verificar en todas las páginas | 🟡 |
| 19 | Cambio de idioma | Sin `location.reload` | — | — | Ya cubierto (pruebas previas en 6 idiomas) | 🟢 |
| 20 | Opiniones / Normas | Aviso legal pendiente visible | — | — | Se mantiene hasta la revisión humana (Anexo A) | 🟡 |

## Orden de ejecución

1. **Fase 1:** buzón real (1, 3, 4) con Ops Center.
2. **Fase 2:** `BaqueanoDialog` global y quitar los éxitos falsos (2, 8, 14).
3. **Fase 3:** CTAs y contacto honestos (5, 6, 7, 9, 10, 12, 13).
4. **Fase 4:** PDFs reales (11).
5. **Fases siguientes:** crónicas, comunidad social, música con datos, carrusel, mapas, BAQUI y perfil. Se documentan como pendientes con su estado real.

## Avance — Fase 1 (buzón real), 2026-10-06

- **BD:**
  - Migración `20261006100000_intake_inbox.sql`, aplicada y verificada con una prueba revertida.
  - Tablas `contact_messages`, `business_applications`, `eco_reports`, `eco_report_evidence`, `intake_events` (inmutable) e `intake_notifications`.
  - RLS sin acceso para anon ni authenticated; no hay borrado físico.
  - Bucket privado `eco-evidence`.
- **Edge Function `baqueano-intake` (v1 ACTIVE), probada en vivo:**
  - origen ajeno → 403; honeypot; coordenadas fuera de Nicaragua → 400;
  - negocio sin sesión → 401; bandeja sin sesión → 401;
  - envío real con código e idempotencia.
  - Los dos registros de prueba técnica quedaron cerrados o archivados con su nota.
- **Web:**
  - `nosotros.html` con formulario real y canales oficiales: correo, WhatsApp +505 8443-1289, TikTok e Instagram.
  - `denuncias.html` con mapa, evidencias privadas, anonimato, comprobante con código y token, y consulta de estado.
  - Formulario único de la Red BAQUEANO (`js/business-application.js`) conectado desde aliados, la tarjeta del pie, `mi-negocio` y el paso previo de `ambiental.html`.
  - Regreso seguro tras iniciar sesión (`perfil.html?volver=`).
- **Éxitos falsos retirados:**
  - el `alert` de la denuncia;
  - el registro "solo local" de `platform-enhancements.js`;
  - el "¡Mensaje enviado!" genérico de `global-injector.js`;
  - el "postulado exitosamente" de aliados y del pie;
  - el registro `biz_local_` de `business-portal.js`.
- **Correos y teléfonos:**
  - 20 correos no oficiales reemplazados por `baqueanonicaragua@gmail.com`;
  - el WhatsApp falso `50588888888` reemplazado por el oficial.
- **Ops Center:** vista 38 "Buzón", con estados, notas, mensaje al solicitante, derivación sin afirmar entregas y evidencias con URL firmada de 5 minutos.
- **Pruebas:**
  - Playwright a 390 y 1366 px: contacto, denuncia, negocio y buzón;
  - axe sin fallas; QA completa del sitio con 60 cargas y 0 fallos;
  - i18n con 0 errores (189 claves nuevas en 6 idiomas).
- **Pendiente del propietario:**
  - configurar `RESEND_API_KEY` e `INTAKE_FROM_EMAIL` en Supabase para que los avisos por correo salgan; mientras tanto quedan "sin configurar", visibles en el Ops Center;
  - probar en producción el mapa (este entorno bloquea `cdnjs`) y la subida real de evidencias.

## Avance — Fase 2 (diálogos y éxitos falsos), 2026-10-06

- **`js/baqueano-dialog.js`:** diálogo global accesible (aviso, confirmación y texto) cargado por el shell en todas las páginas.
  - `<dialog>` nativo, foco atrapado, ESC y botones de 44 px, en 6 idiomas.
  - `window.alert` se redirige al diálogo.
- **Migrados a diálogos asíncronos:**
  - todos los `confirm()`/`prompt()` públicos que se ejecutan: testimonios (3), opiniones, Mi Viaje (eliminar día), BAQUI (3), cookies y navegación;
  - quedan sin `confirm()`/`prompt()` nativos.
- **Éxitos falsos retirados:**
  - boletín "¡Gracias por unirte!": ahora avisa con honestidad "Próximamente; no guardamos tu correo";
  - reportes de destino que solo quedaban en el navegador: ahora pasan al Contacto real con el texto ya escrito;
  - "Sintetizando explicación geológica…" (audio inexistente y cifra sin fuente).
- **BAQUI:** los respaldos "Baqüi te sugiere…" de música, gastronomía y destinos abren `baqueano-ia.html?q=` con la consulta real.
- **Código muerto detectado:** `environmental.js`, `environmental-evidence.js`, `calculator.js`, `admin-ops.js` e `index-features.js` no los carga ninguna página. Contienen éxitos falsos y una orden de pago ficticia. Se conservan (regla "no eliminar") y no se ejecutan.
- **Pruebas:** diálogo en 390 y 1366 px sin ventanas nativas y con axe sin fallas; QA del sitio con 60 cargas y 0 fallos; i18n con 0 errores.

## Avance — Fase 3 (botones y datos honestos), 2026-10-06

- **"Reservar" → "Contactar"** en la causa, es decir en las claves de 6 idiomas:
  - `actions.book`, `experiences.book`, `common.reservarTodo` ("Contactar servicios de la ruta") y `common.misReservas` ("Mis gestiones");
  - los mensajes de WhatsApp ya no dicen "deseo reservar".
- **Teléfonos falsos:** 34 números ficticios `5058888000X` en 6 archivos pasan a la línea oficial (+505 8443-1289).
- **Pagos (perfil):** el bloque pasa a "Pagos en línea: próximamente". No cobramos en la plataforma ni pedimos ni guardamos tarjetas, y no hay "checkout" ni historial ficticio.
- **Aliados (`js/allies-directory.js`):**
  - directorio real desde `businesses` (30 publicados), con sello honesto: verificado con fuente, pendiente de revalidar o parcial;
  - "Ver perfil" abre la ficha real: contacto solo si existe, fuente, fecha, mapa y "¿Querés conocer…?";
  - filtros con los 17 territorios y métricas calculadas;
  - se retiraron "14 verificados", "50+", "12" y "100%";
  - si Supabase falla, se muestra un error con "Reintentar".
- **Mapa:** soporta `?lat=&lng=` para enfocar el punto exacto.
- **Música:**
  - el "93" fijo pasa al conteo real de piezas;
  - los enlaces "Ver todos los géneros / artistas / instrumentos" llevan a su propia sección y no al archivo.
- **Ambiental:** "Quiero unirme" lleva a la comunidad real (testimonios) y no al perfil.
- **Pruebas:** aliados con Playwright + axe en 390 y 1366 px; QA del sitio con 60 cargas y 0 fallos; i18n con 0 errores (41 claves nuevas).
- **Pendiente:**
  - imágenes reales de los aliados (`cover_image` está vacío en los 30);
  - las tarjetas fijas antiguas de aliados siguen en el HTML como contenido sin JavaScript y se reemplazan al cargar los datos reales.
