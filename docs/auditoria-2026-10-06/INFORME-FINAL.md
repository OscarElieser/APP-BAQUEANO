# Informe final · Auditoría integral BAQUEANO · 2026-10-06

> 🎯 **POR QUÉ:** el PROMPT MAESTRO pidió auditar y corregir el ecosistema completo (web, app Android, Ops Center, Supabase, Firebase, Azure, BAQUI y seguridad), sin inventar y sin marcar verde nada que no se pueda demostrar.
> ⚙️ **CÓMO:**
> - Cada afirmación remite a una prueba: Playwright en Chromium real, `flutter analyze` / `flutter test`, consultas SQL a Supabase, validadores de la skill de seguridad y el CI de GitHub.
> - El dominio de producción está bloqueado por la red de este entorno. Por eso se audita el build de `main`, que es lo que publica el autodeploy, y producción se mide con el workflow `kronox-evidence` en GitHub.
> 📦 **QUÉ:** las 28 secciones pedidas, con su semáforo.

**Semáforo:**
- 🟢 Producción o código verificado con prueba.
- 🟡 Funcional pero pendiente (por ejemplo, de despliegue).
- 🟠 Incompleto.
- 🔴 Crítico.

## 1. Resumen ejecutivo

**Lo que se corrigió**
- Las correcciones están **en `main` y probadas**:
  - Ops Center: XSS almacenado y paginación (municipios 153/153).
  - Base de datos: datos comerciales de negocios expuestos a anon, KPIs inflables, presupuesto para BAQUI.
  - App Android: cifras inventadas fuera, municipios reales, sin llamadas a teléfonos sin fuente.
  - Web: 11 botones o enlaces sin función, los 153 municipios con datos verificables y accesibilidad (axe de 56 cargas con falla a 0).
- Hay 7 migraciones aditivas aplicadas en Supabase, todas verificadas con consultas.

**Lo que bloquea el verde total no se resuelve desde el código:**
1. **Producción congelada.** La VM de Azure sirve `56bd236`, del 2026-10-05 a las 00:27. El autodeploy está detenido, así que ninguna corrección web de hoy llegó al público.
2. **Edge Functions sin desplegar.** No hay CLI de Supabase en este entorno.
3. **Configuración que solo ve el propietario:** sudo en la VM, protección de `main`, "Confirm email" en Supabase Auth y el puerto 22 abierto a Internet.

**Estado global: 🟡.**

## 2. Arquitectura encontrada

| Pieza | Detalle |
|---|---|
| Web estática | HTML y JS en `website/`, servida por nginx en la VM Azure `vm-baqueano-prod`. Autodeploy desde `main` cada 2 minutos |
| Supabase (`heiudfpthqwtjrtluqlm`) | Base principal: 52 migraciones, RLS y 9 Edge Functions |
| Firebase | Autenticación (Google). Firestore y Storage quedan como respaldo legado |
| App Android | Flutter; lee Supabase por REST con la clave publicable |
| Ops Center | `admin.html` → `baqueano-ops` (service role, solo personal) |
| BAQUI | `baqueano-ai` con Gemini y `url_context` |

Detalle: `docs/security-audit/2026-10-06/architecture.md`.

## 3. Arquitectura resultante

Es la misma arquitectura, con la **fuente única en Supabase** reforzada:
- La app lee también `municipalities`.
- El Ops Center pagina todo y su mapa incluye `places`.
- BAQUI filtra igual que RLS y tiene presupuesto.
- Las cinco funciones con personal respetan la revocación del RBAC.

No se agregó infraestructura nueva.

## 4. Problemas encontrados

**Web** (rastreo de 4900 enlaces y 899 botones en 30 páginas): 69 problemas consolidados.
- 40 eran `<a>` sin href en el Ops Center.
- 13 eran enlaces y 16 eran botones en páginas públicas.
- Detalle en `WEB-AUDIT.md`.

**Datos**
- 141 lugares sin fuente, 40 sin coordenadas y 108 sin municipio.
- Tablas culturales vacías.
- Detalle en `DATA-AUDIT.md`.

**App:** cifras sin fuente y teléfonos escritos a mano. Detalle en `ANDROID-AUDIT.md`.

## 5. Vulnerabilidades

Son 10 hallazgos con la metodología de Cloudflare, perfil `quick`, todos `needs_validation`: no hubo sandbox para ejecutarlos.
- 🟢 2 corregidos y probados en la BD: XSS en el Ops Center y el KPI de evidencias.
- 🟡 5 corregidos en código, esperando despliegue.
- 🔴 3 abiertos, con acción del propietario o decisión de negocio: autodeploy con sudo, rol por correo confirmado y analítica anónima.

Además, hoy se cerró la lectura anónima de `commission_rate` y `owner_uid`.

Detalle: `docs/security-audit/2026-10-06/REPORT.md`.

## 6. Correcciones realizadas

| Área | Corrección | Prueba |
|---|---|---|
| Ops Center | Escape, `safeUrl` y `jsAttr` contra XSS; navegación con href e historial; paginación | Clic real y CHECK en la BD |
| Web | Filtros de Crónicas; enlaces de Historia (fuentes, personajes, pueblos); salto al catálogo de Experiencias; impresión de Mi Viaje; reproductor en celular | Playwright |
| Web | Municipios con área del contorno, lugares, mapa y BAQUI, en 6 idiomas | 4 territorios × 4 anchos |
| Web | Evento `baqueano:i18nReady`: los textos dinámicos salen en el idioma del visitante | Inglés completo |
| BD | 7 migraciones: `search_path`, perfil de municipio, CHECK de `cover_image`, KPI de evidencias, presupuesto de BAQUI, privacidad de negocios, importación de municipios | SQL de verificación |
| App | Municipios; sin calificaciones ni precios inventados; contacto oficial | `flutter analyze` sin problemas; `flutter test` 71/71 |
| Edge Functions | Revocación, mirror, BAQUI y Ops | esbuild sin errores; falta desplegar |

## 7. Páginas creadas

**No se crearon páginas HTML nuevas.** Cada botón sin destino se resolvió con contenido que **ya existía con fuente**:
- diálogos de fuentes y personajes en Historia;
- capítulo de la audioguía;
- filtro de Crónicas.

Así se respeta la regla de no inventar. No se crearon páginas de relleno.

## 8. APIs creadas/corregidas

- **`baqui_consume_budget()`** (nueva). Solo service role.
- **`baqueano-ops`:** `select` de municipios ampliado.
- **`baqueano-ai`:** límite 429, filtro de publicación y `user_uid` en null.
- **`baqueano-mirror`:** dueño tomado de la fila guardada.
- **`baqueano-identity`, `-ops`, `-sos`, `-reservas` y `-community`:** revocación del RBAC.

## 9. Supabase 🟢 / 🟡

**Inventario real**
- 17 departamentos, 153 municipios, 237 lugares, 30 negocios y 7 destinos.

**Advisors**
- Sin `search_path` mutable.
- Las RPC anónimas restantes son públicas por diseño.
- `vector` en `public` sigue pendiente, porque moverla requiere una ventana de mantenimiento.

**Edge Functions:** 🟡 por desplegar.

## 10. Firebase 🟡

- Se usa para iniciar sesión.
- `firestore.rules` y `storage.rules` tienen listas de correos de administración fijas, fuera del RBAC de Supabase. El crítico de seguridad lo dejó como unidad diferida.
- No se modificaron.

## 11. Azure 🔴

Fuente: `kronox-evidence`, ejecución del 2026-10-06 a las 11:46 UTC.

**Bien**
- TLS válido por 87 días.
- HSTS y CSP activos.
- Puertos 5432, 3000, 6379, 8080 y 3306 cerrados.
- La API consulta Supabase.

**Mal**
- `/health` sirve `56bd236` y no `main`.
- **Puerto 22 abierto a Internet.**

**Acción del propietario**

```bash
sudo journalctl -u baqueano-autodeploy -n 100
df -h
```

Después, restringir el NSG del puerto 22.

## 12. Web 🟡

- El código de `main` está corregido y probado (secciones 4 y 6).
- Producción no lo recibe hasta que se destrabe el autodeploy.

## 13. App Android 🟢

- Lee departamentos, destinos, negocios y municipios reales de Supabase.
- Las tarjetas ya no muestran cifras inventadas.
- `flutter analyze` sin problemas y `flutter test` 71/71, local y en CI.
- El CI de GitHub compila el APK debug (ejecución 37459922956). El AAB firmado espera los secretos de firma.
- **Pendiente:** el inicio todavía usa 20 destinos estáticos, ahora sin cifras. Hay que publicar más destinos en el Ops Center (hoy son 7) para reemplazarlos.

## 14. Ops Center 🟢 / 🟡

- 10 pestañas con datos reales, con paginación completa.
- XSS corregido.
- **Falta** una pestaña "Lugares" editable, para cargar la fuente de los 141 lugares sin fuente. Detalle en `OPS-CENTER-AUDIT.md`.

## 15. BAQUI 🟡

- Responde primero con lo interno, usa fuentes oficiales y no pone precios.
- Las correcciones de seguridad y el presupuesto esperan despliegue.
- `knowledge_documents` está vacío. Detalle en `BAQUI-AUDIT.md`.

## 16. Municipios y territorios 🟢 / 🟠

**Verificado:** 153/153 municipios con área del contorno (geoBoundaries, © OpenStreetMap, ODbL), caja geográfica e identidad, visibles en la web, la app y el Ops Center.

**Pendiente de fuente oficial:**
- Población, historia, fiestas patronales y coordenadas de la cabecera.
- INIDE, INIFOM y Wikidata están bloqueados por la red de este entorno.
- Quedan marcados "por verificar", no inventados.

## 17. Datos verificados 🟠

- 96/237 lugares con fuente.
- 24/30 negocios verificados.
- Cada geocódigo dudoso se rechazó a mano (5 casos) en lugar de adivinarlo.

## 18. Seguridad 🟡

Ver la sección 5 y `docs/security-audit/2026-10-06/`.
- Ledger con 16 unidades y hallazgos con 10 registros, ambos validados (PASS).
- **No se publicó ninguna clave.** El service role nunca sale del servidor.

## 19. Rendimiento 🔴

Último Lighthouse disponible: 2026-10-05, build local.

| | Móvil | Escritorio | Objetivo |
|---|---|---|---|
| Performance | **28** | **64** | ≥ 90 |
| LCP | 16,7 s | 2,2 s | ≤ 2,5 s |
| CLS | 0 | 0,057 | ≤ 0,1 |
| Accesibilidad / Buenas prácticas / SEO | 94 / 96 / 100 | 94 / 96 / 100 | ≥ 95 |

**Causa principal:** peso de la página (2,7 MB en móvil), con video y fuentes externas. No se resolvió hoy.

## 20. Responsive 🟢

**Medición:** `browser-qa.mjs` (Playwright/Chromium) sobre el build de `main`, el 2026-10-06. Se cargaron **28 páginas en 16 anchos**: 320, 360, 375, 390, 412, 430, 480, 600, 768, 820, 1024, 1280, 1366, 1440, 1920 y 2560 px. En total son **448 cargas**.

**Resultado**
- **0 desbordes horizontales.**
- El menú móvil abre y cierra.
- 2 avisos de carga lenta en `legal.html`, en el entorno local.

Detalle: `docs/production-audit/responsive-report.md`.

## 21. Accesibilidad 🟢

**Medición:** axe-core 4.14 (WCAG 2.0, 2.1 y 2.2 AA) a 390 y 1366 px en las 28 páginas.

**Antes de hoy:** 56 cargas fallaban la regla *label-content-name-mismatch* (WCAG 2.5.3, el nombre accesible debe contener el texto visible).

**Causas**
- `navigation.js` ponía nombres derivados del id ("bq Menu Trigger account", "save Trip Btn") encima del texto traducido.
- Logos, selector de idioma, BAQUI, corazones de favoritos, galería, mascota, pines y tarjetas de música tenían nombres distintos a lo que se ve.

**Ahora:** **0 violaciones críticas o graves**. El cambio de idioma se probó en es, fr y en, y la etiqueta se rehace sin duplicarse.

Detalle: `docs/production-audit/accessibility-report.md`.

## 22. Internacionalización 🟢 / 🟡

**Gate `npm run i18n`:** 0 errores y 3951 claves en 6 idiomas sin faltantes.
- **HTML:** 3661 de 3662 textos traducidos.
- **JS:** 729 textos dinámicos sin migrar.
- **TSX:** 60 de 1154 textos migrados.

Las claves nuevas de hoy (municipios, crónicas e historia) están en los 6 idiomas.

## 23. SEO 🟡

**Build (`static-audit`):** 0 críticos; canonical, Open Graph, JSON-LD y hreflang presentes en las páginas indexables.

**Producción (`kronox-evidence`):** el canonical apunta a `app-baqueano.web.app` y no hay hreflang ni JSON-LD, porque producción sirve un build viejo. Se corrige al destrabar el autodeploy.

## 24. Testing 🟢

**Pruebas**
- Flutter: 71/71.
- Gate de i18n: 0 errores.
- Validadores de seguridad: PASS.
- Rastreo de botones con clic real.
- QA de navegador: 448 cargas con 0 fallas (secciones 20 y 21).
- CI de Android: compila el APK debug.

**CI en GitHub:** Flutter y CodeQL en verde en los commits de hoy.

## 25. Pendientes reales

1. Destrabar el autodeploy de Azure (propietario).
2. Desplegar 7 Edge Functions (propietario; comando en `NEEDS-VALIDATION.md`).
3. Supabase Auth "Confirm email", sudo de la VM, protección de `main` y puerto 22 (propietario).
4. Pestaña "Lugares" editable en el Ops Center y carga de fuentes.
5. Cargar las tablas culturales y `knowledge_documents` con contenido con fuente.
6. Rendimiento móvil: Lighthouse 28 frente al objetivo de 90.
7. Analítica anónima con token del servidor (decisión de negocio).
8. Contenido a confirmar por el propietario:
   - autores y citas de Crónicas;
   - "Hotel Boutique Adela" en Mi Viaje;
   - nombres de guías del catálogo estático de la app.

## 26. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Autodeploy con sudo y sin compuerta de CI | Quien escriba en `main` ejecuta código en la VM | Protección de rama y sudo acotado |
| Signup con correo de super admin si "Confirm email" está apagado | Toma de cuenta administrativa | Verificar el ajuste de Auth |
| Puerto 22 abierto | Fuerza bruta contra SSH | Restringir el NSG a IPs conocidas |
| Edge Functions viejas en producción | Las vulnerabilidades corregidas siguen activas | Desplegar |
| Rendimiento móvil | Abandono en conexiones lentas | Optimizar video, imágenes y fuentes |

## 27. Evidencias

**Informes**
- `docs/auditoria-2026-10-06/`: DATA, WEB, ANDROID, OPS-CENTER y BAQUI.
- `docs/security-audit/2026-10-06/`: REPORT, FINDINGS-DETAIL, NEEDS-VALIDATION, `architecture.md`, `coverage-ledger.json` y `findings.json`.
- `docs/production-audit/`: rastreo de botones y QA de navegador.

**Migraciones:** `supabase/migrations/20261006*.sql`.

**CI y producción**
- Ejecuciones de GitHub Actions en `main`.
- Artefacto de `kronox-evidence`.

**Bitácora:** `SESSION_LOG.md`.

## 28. Estado final

| Componente | Semáforo |
|---|---|
| Supabase (BD y RLS) | 🟢 |
| Edge Functions | 🟡 código corregido, falta desplegar |
| Web (código en `main`) | 🟢 |
| Web (producción) | 🔴 congelada en un build viejo |
| App Android | 🟢 |
| Ops Center | 🟢 |
| BAQUI | 🟡 |
| Municipios y territorios | 🟢 estructura · 🟠 datos oficiales pendientes |
| Seguridad | 🟡 |
| Responsive y accesibilidad | 🟢 448/448 cargas sin fallas |
| Rendimiento | 🔴 |
| i18n | 🟢 HTML · 🟡 JS y TSX |
| Azure | 🔴 autodeploy detenido y puerto 22 abierto |

**Global: 🟡.** El código está corregido y probado. Hasta que el propietario destrabe Azure y despliegue las Edge Functions, el público no ve estos cambios.
