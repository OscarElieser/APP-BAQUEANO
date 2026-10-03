# 🧭 Mapa auditado de fuentes de datos de BAQUEANO

## 🎯 POR QUÉ (Why / Propósito)

Este documento establece una fotografía verificable del repositorio antes de evolucionar la arquitectura. Su propósito es impedir pérdidas, duplicidades y migraciones a ciegas mientras BAQUEANO adopta la separación oficial de responsabilidades:

```text
Firebase = identidad y Hosting técnico
Supabase = datos dinámicos y conocimiento estructurado
Hostinger = dominio y DNS
BAQUI = inteligencia sobre datos verificados
```

La auditoría distingue entre código existente, datos semilla o demostrativos y conexiones comprobadas. La presencia de un cliente, tabla o consulta en el repositorio no demuestra por sí sola que existan registros reales en producción.

## ⚙️ CÓMO (How / Arquitectura y metodología)

La revisión fue estática y no destructiva sobre `website/`, `functions/`, `supabase/`, `lib/`, `admin/`, `assets/`, `src/`, reglas y configuración raíz. Se inspeccionaron:

1. HTML, JavaScript, TypeScript y Dart con catálogos embebidos.
2. JSON versionados y catálogos locales.
3. colecciones y operaciones del SDK de Cloud Firestore.
4. referencias a Firebase Authentication y Custom Claims.
5. clientes, tablas, funciones y migraciones de Supabase.
6. usos de `localStorage` y `sessionStorage`.
7. configuración de Realtime Database.
8. fallbacks, seeds, mocks, datos simulados y módulos desconectados.
9. canonical, Hosting y referencias de dominio.

Estados usados:

- **Conectado en código:** existe un flujo ejecutable, aunque falta validación contra el entorno desplegado.
- **Parcial:** combina backend, semilla, fallback o contratos incompatibles.
- **Semilla/local:** el contenido vive en archivos o constantes del cliente.
- **Configurado, sin consumo probado:** existe configuración o esquema, pero no se encontró un flujo funcional que lo use como fuente primaria.
- **No encontrado:** no apareció implementación de consumo durante la revisión.

## 📦 QUÉ (What / Resultado ejecutivo)

### Hallazgos críticos

1. **La arquitectura actual contradice la arquitectura oficial.** `website/docs/DATA_CATALOG.md`, `website/docs/DATA_FLOW.md` y `website/docs/adr/ADR-001_FIREBASE_DATASTORE.md` declaran Firestore como fuente principal. Deben marcarse como decisiones sustituidas, no usarse como guía vigente.
2. **Firestore sigue siendo fuente operativa en múltiples clientes.** La capa compartida `website/packages/firebase/src/index.ts`, la web estática, Next.js, Android y Ops Center consultan o escriben colecciones de contenido y transacciones.
3. **Supabase ya tiene una base amplia, pero todavía aparece como respaldo o ruta paralela.** Las migraciones definen territorio, contenido cultural, turismo, negocios, perfiles, reservas, favoritos, viajes, emergencias, auditoría, conocimiento vectorial y más; sin embargo, el frontend principal no depende exclusivamente de esas tablas.
4. **Existen varias copias del catálogo.** Destinos, territorios, negocios, gastronomía, historia, música y experiencias aparecen en JSON, constantes JS/TS/Dart, HTML, seeds de Firestore y tablas Supabase.
5. **Favoritos y viajes no sincronizan de forma uniforme.** Hay diversas claves locales (`baqueano_favs`, `baqueano_favorites`, `baqueano_trip_plan`, `baqueano_saved_trips`, entre otras), además de implementaciones Firestore y Supabase.
6. **La realidad de producción no fue validada.** Esta auditoría confirma contratos y rutas de código, no cantidad, exactitud ni vigencia de registros remotos. Los datos de emergencia requieren validación humana y fuente antes de publicarse.
7. **El canonical vigente es incorrecto para la nueva decisión.** `website/index.html` y `website/ayuda.html` apuntan a `https://app-baqueano.web.app/`; la mayoría de HTML no contiene canonical explícito.
8. **No se encontró consumo funcional de Realtime Database.** `firebase.json` registra reglas/emulador y la CSP permite `firebaseio.com`, pero el código auditado usa principalmente Firestore.

## Matriz obligatoria de fuentes

| MÓDULO | INFORMACIÓN | ORIGEN ACTUAL | ORIGEN OBJETIVO | ESTADO | RIESGO | MIGRACIÓN NECESARIA |
|---|---|---|---|---|---|---|
| Identidad | Registro, login, Google Sign-In, sesión, logout | Firebase Authentication en web y Android; Custom Claims para roles | Firebase Authentication | Conectado en código | Medio: flujos web nuevos aún figuran parciales en documentación | Conservar Firebase Auth; emitir/verificar ID token en backend y enlazar `firebase_uid` con Supabase |
| Perfiles | Nombre, correo, foto, rol, progreso | Firestore `users`; Supabase `profiles`; respaldo local en `user-session.js` | Supabase `profiles` enlazado por `firebase_uid` | Duplicado/parcial | Alto: divergencia de rol y perfil | Inventariar registros, resolver autoridad de roles, migrar perfil no sensible y retirar escrituras de perfil en Firestore después de validar |
| Roles administrativos | Rol y autorización | Firebase Custom Claims más campo `role` en Firestore; tablas Supabase también incluyen rol | Firebase Custom Claims como identidad/autorización de entrada; perfil/estado operativo en Supabase sin autoelevación | Parcial | Crítico: dos autoridades de rol | Definir claims canónicos, backend de sincronización y prohibir cambios de rol desde cliente/RLS |
| Departamentos | División territorial | `assets/data/departments.json`, `website/apps/web/src/data/catalog.ts`, JS embebido, Firestore esperado, Supabase `departments` | Supabase `departments` | Duplicado | Alto | Validar IDs/slugs, normalizar 15 departamentos y 2 regiones autónomas, importar con trazabilidad |
| Municipios | 153 municipios y relación territorial | `assets/data/municipalities.json`, `ops-mock-data.js`, catálogos JS; Firestore esperado; Supabase `municipalities` | Supabase `municipalities` | Duplicado/semilla | Alto | Comparar cobertura y claves foráneas; cargar lote validado; mantener JSON como respaldo versionado durante transición |
| Categorías | Taxonomía de cultura, comercio, salud, emergencia y transporte | `assets/data/categories.json`, copia bajo `website/assets/data`, constantes JS y contratos Firestore | Supabase, tabla taxonómica canónica pendiente de consolidar | Semilla/duplicado | Alto | Diseñar taxonomía estable, alias y relaciones; no usar texto libre como clave principal |
| Destinos y lugares | Destinos, atractivos, coordenadas, imágenes, estado | Firestore `places`/`destinations`; `assets/data/initial_places.json`; `firestore-realtime.js`; `catalog.ts`; HTML/JS; Supabase `destinations`/`places` | Supabase | Duplicado y conectado en paralelo | Crítico | Exportar todas las fuentes, deduplicar por slug/coordenadas, validar procedencia, importar y cambiar lectores/escritores por etapas |
| Territorios web | Fichas departamentales, cultura, paisaje, municipios | `territories-data.js`, experiencias específicas y páginas HTML; Next.js usa seeds | Supabase | Semilla/hardcoded | Alto | Mapear campos editoriales a territorio y contenido relacionado; crear render dinámico por slug |
| Mapa | Marcadores y búsqueda geográfica | `baqueano-map.js`, `nicaragua-real-map.js`, `firestore-realtime.js`, seeds y PostGIS Supabase | Supabase/PostGIS | Parcial | Alto: mapas pueden mezclar registros no verificados | Conectar API geoespacial única; exigir coordenadas válidas, estado publicado y fuente |
| Negocios | Fichas, propietarios, servicios, contacto, ubicación, verificación | Firestore `businesses`; `website-business-catalog.js`; seeds Ops; Supabase `businesses` | Supabase | Duplicado/parcial | Crítico: estado de verificación y propietario pueden divergir | Migrar con `firebase_uid` del propietario, historial de verificación y revisión de datos de contacto |
| Gastronomía | Restaurantes, platos y experiencias gastronómicas | HTML/JS, `catalog.ts`, seeds Ops; Supabase `gastronomy` y negocios | Supabase | Semilla/parcial | Alto | Separar establecimiento, oferta y contenido cultural; conservar fuentes y estado de publicación |
| Alojamiento | Hoteles, hostales, fincas y hospedajes | Catálogos y pantallas locales; negocios/places en Firestore; no hay lector Supabase único | Supabase | No conectado de extremo a extremo | Alto | Definir subtipo o tabla especializada, migrar fichas y enlazar disponibilidad/reservas |
| Cultura e historia | Cultura, patrimonio, leyendas, personajes, períodos | JS/HTML, datos Dart locales; Supabase `culture`, `heritage`, `legends`, `historical_figures` | Supabase | Esquema disponible, UI mayormente local | Alto | Importar contenido editorial con fuentes, traducciones y control de publicación |
| Museos | Museos, galerías, colecciones y horarios | Categorías/HTML/JS; Supabase `museums` | Supabase | Esquema disponible, conexión pública no comprobada | Alto | Auditar fichas reales, horarios y accesibilidad; conectar consultas dinámicas |
| Música | Artistas, géneros, pistas y festivales | `musica-player.js`, `epic-music-player.js`, `sonora-data.js`, archivos locales; Supabase `music` | Supabase para metadatos; archivos con almacenamiento definido por política | Semilla/local | Alto: derechos y atribución | Inventariar licencias, separar archivo multimedia de metadatos, no importar canciones sin permiso |
| Arte y artesanía | Artistas, obras, técnicas y talleres | Catálogos HTML/JS; Supabase `crafts` y contenido cultural | Supabase | Parcial | Medio/alto | Normalizar autoría, técnica, ubicación, derechos y fuentes |
| Rutas y experiencias | Circuitos, paradas, actividades e itinerarios | JS local, generadores IA, Firestore de viajes; Supabase `routes`, `route_stops`, `experiences` | Supabase | Parcial/duplicado | Alto | Migrar catálogo verificado; separar ruta editorial de itinerario privado del usuario |
| Emergencias | Hospitales, policía, bomberos y asistencia | Categorías y lugares locales/Firestore; Supabase `emergencies` | Supabase con publicación solo verificada | No validado en vivo | Crítico: riesgo para seguridad física | No publicar por seed; verificar teléfono, horario, ubicación, fuente y fecha; revisión periódica obligatoria |
| Transporte | Terminales, rutas, puertos, aeropuertos y alquiler | Categorías locales; módulos de movilidad Firestore; seeds Next.js | Supabase | Parcial | Alto | Diseñar contratos temporales y geográficos, migrar empresas/vehículos y validar operadores |
| Servicios útiles | Farmacias, bancos, cajeros, gasolineras, talleres | Categorías JSON y lugares/Firestore | Supabase | Taxonomía local, contenido no consolidado | Alto | Importar como servicios/localizaciones con fuente, vigencia y verificación |
| Favoritos | Lugares guardados | Varias claves `localStorage`; Firestore `user_saved_places`; Supabase `favorites` | Supabase `favorites` | Triplicado | Alto | Crear reconciliación idempotente por usuario y entidad; importar locales tras login; retirar claves heredadas gradualmente |
| Mi Viaje | Plan, rutas, notas y contexto | `localStorage`/`sessionStorage`, Firestore `trip_plans`/`trip_bookings`/`active_trips`, Supabase `travel_plans` | Supabase `trips`, `trip_items`, `trip_routes`, `trip_notes`, `trip_members` | Fragmentado | Crítico | Diseñar esquema objetivo completo, adaptador temporal y migración por versión sin perder planes locales |
| Reservas | Solicitud, fecha, personas, importe y estado | Firestore `reservations`; Supabase `reservations`; fallbacks locales/seed | Supabase `bookings` o tabla canónica renombrada/compatibilizada | Duplicado | Crítico: transacciones divergentes | Elegir contrato canónico, mapear estados requeridos, migrar con conciliación y bloquear doble escritura no controlada |
| Pagos | Órdenes y transacciones | Firestore `payment_orders`; código Android/Next.js | Backend seguro con datos operativos en Supabase | Firestore conectado en código | Crítico: financiero | No mover sin conciliación, idempotencia, auditoría y proveedor; nunca procesar secretos en cliente |
| Reseñas | Calificación, comentario, visita verificada | Firestore/servicios web, `localStorage` para testimonios, Supabase `reviews` | Supabase | Duplicado y parte simulada | Alto | Separar testimonio editorial de reseña autenticada; deduplicar y añadir moderación/antispam |
| Verificación | Solicitudes, revisión, publicación e historial | Firestore/servicios de fuentes; Supabase `verification_requests`; historial no consolidado | Supabase `verification_requests` y `verification_history` | Parcial | Crítico: insignias sin proceso uniforme | Implementar workflow server-side, segregación de funciones y auditoría; no permitir autoverificación |
| Fuentes | Procedencia, URL, fechas y verificador | Firestore `data_sources`, marcas de procedencia en JS, Supabase parcial | Supabase `sources` y relaciones por entidad | Fragmentado | Crítico para BAQUI y emergencias | Crear catálogo canónico y relaciones; exigir fuente para contenido sensible |
| Auditoría | Acciones administrativas | Firestore `audit_logs`; Supabase `audit_logs`; código cliente permite operaciones directas | Supabase, escritura exclusiva por backend | Duplicado/inseguro | Crítico | Unificar eventos, impedir DELETE/INSERT directo del navegador, conservar logs históricos e inmutabilidad práctica |
| Multimedia | Imágenes, videos, perfiles y documentos | Firebase Storage, assets estáticos, Supabase Storage como respaldo, base64/localStorage en algunos flujos | Supabase Storage para contenido dinámico; assets institucionales estáticos se conservan | Híbrido | Alto: duplicación, OOM y enlaces rotos | Inventariar objetos y referencias, definir buckets/políticas, migrar solo contenido administrado y conservar respaldo |
| BAQUI | Búsqueda, RAG, itinerarios y memoria | Edge Functions Supabase, Functions Firebase, seeds locales y fallbacks; `knowledge_documents`/pgvector | Supabase como conocimiento estructurado y RAG, fuentes externas verificadas como complemento | Parcial | Crítico: respuestas pueden provenir de seeds | Enrutar recuperación por Supabase, incluir IDs de fuente, bloquear afirmaciones sensibles sin evidencia |
| Ops Center | CMS y operaciones | `admin.html`/`ops-engine.js` escribe Firestore y replica partes a Supabase; Next admin también usa Firestore | Supabase | Firestore principal/Supabase respaldo | Crítico | Crear capa administrativa server-side sobre Supabase, migrar módulo por módulo y eliminar doble escritura tras reconciliar |
| Métricas y tráfico | Sesiones, analítica y métricas públicas | Supabase `traffic_sessions`, Functions y almacenamiento de sesión; algunas cifras embebidas | Supabase, con privacidad y retención definida | Parcial | Medio | Validar consentimiento, minimizar IP/PII, consolidar métricas derivadas |
| Configuración del sitio | Páginas, videos, SEO, ajustes globales | Firestore `site_pages`, `app_config`, `system_settings`; HTML/JS | Supabase/CMS, según clasificación | Firestore conectado | Alto | Modelar configuración publicada, versionar cambios y conectar render público |
| Firebase Realtime Database | Datos en tiempo real | Solo reglas, emulador y dominios permitidos; no se encontró consumo aplicativo | No usar como fuente de contenido; Supabase Realtime cuando sea necesario | No encontrado | Bajo ahora, alto si aparece uso oculto | Confirmar consola/exportaciones; mantener desactivado o documentar cualquier uso legítimo |
| Canonical y dominio | URL pública, SEO y enlaces absolutos | Firebase Hosting `app-baqueano`; canonical de `index.html` y `ayuda.html` apunta a `web.app` | `https://baqueanonicaragua.com` | Incorrecto/incompleto | Alto: contenido duplicado | Cambiar canonical/OG/sitemap/enlaces internos al dominio oficial y configurar redirección `www` → apex sin apagar `web.app` |

## Inventario de datos locales y hardcoded

### JSON con contenido de dominio

- `assets/data/initial_places.json`: lugares iniciales.
- `assets/data/departments.json`: departamentos y regiones.
- `assets/data/municipalities.json`: municipios.
- `assets/data/categories.json`: taxonomía de lugares y servicios.
- `assets/data/themes_catalog.json` y su copia en `website/assets/data/`: temas visuales, no fuente turística.
- `website/locales/*.json`: traducciones de interfaz; no deben confundirse con contenido editorial traducido.

### JavaScript/TypeScript con catálogos relevantes

- `website/js/firestore-realtime.js`: gran catálogo `SEED_PLACES` y fallback de Firestore.
- `website/apps/web/src/data/catalog.ts`: destinos, territorios, gastronomía e historia semilla.
- `website/js/territories-data.js`, `chinandega-experience.js`, `madriz-experience.js`: contenido territorial embebido.
- `website/js/website-business-catalog.js`: negocios embebidos.
- `website/js/nicaragua-real-map.js`, `baqueano-map.js`: marcadores y catálogos geográficos.
- `website/js/musica-player.js`, `epic-music-player.js`, `sonora-data.js`: música y metadatos locales.
- `website/js/ops-center/ops-mock-data.js` y `ops-engine.js`: mocks y semillas administrativas.
- `website/js/smart-search.js`: sugerencias y mapa de intenciones locales.
- `website/apps/web/src/app/api/v1/territories/route.ts` y `api/open/v1/spatial/nearby/route.ts`: respuestas semilla.

### Dart con contenido local

- `lib/features/country_history/data/nicaragua_history_data.dart`: historia y cifras editoriales locales.
- catálogos usados por `DestinationService`, pantallas de directorio, cultura, comunidad y administración Flutter.
- `DestinationModel.mockDestinations` continúa referenciado por búsqueda.

### HTML con datos embebidos

Las páginas estáticas contienen tarjetas, textos, precios, contactos, destinos y metadatos editoriales. Casos de mayor impacto: `index.html`, `destinos.html`, `destino.html`, `departamento.html`, `mapa.html`, `mi-viaje.html`, `mi-negocio.html`, páginas territoriales y temáticas. Deben convertirse gradualmente en plantillas consumidoras de Supabase; no deben borrarse durante la migración.

## Inventario de backends detectados

### Cloud Firestore

Colecciones observadas o declaradas incluyen, entre otras: `places`, `destinations`, `businesses`, `users`, `user_saved_places`, `reservations`, `payment_orders`, `business_subscriptions`, `audit_logs`, `categories`, `departments`, `municipalities`, `trip_plans`, `trip_bookings`, `active_trips`, `availability_slots`, `vehicle_rental_companies`, `rental_vehicles`, `data_sources`, `site_pages`, `app_config`, `system_settings`, `android_releases`, `ai_tasks`, `ai_settings`, `sos_logs` e `incidents`.

La lista debe cotejarse contra exportación de la consola antes de migrar: una referencia en código no confirma que la colección tenga documentos.

### Supabase/PostgreSQL

Las migraciones locales crean o preparan: `profiles`, `departments`, `municipalities`, `destinations`, `places`, `businesses`, `reservations`, `reviews`, `favorites`, `travel_plans`, `knowledge_documents`, `backup_operations`, `ops_backup_entities`, `storage_backups`, `traffic_sessions`, `audit_logs`, `official_super_admins`, `tourism_services`, `culture`, `heritage`, `museums`, `gastronomy`, `music`, `crafts`, `festivals`, `communities`, `legends`, `historical_figures`, `routes`, `route_stops`, `experiences`, `events`, `emergencies`, `day_passes`, `explorer_passport_stamps`, `travel_diaries`, `verification_requests`, `ai_sessions`, `ai_messages`, `content_translations`, `baqui_trip_memory`, `knowledge_candidates`, `baqui_feedback` y `baqui_knowledge_gaps`.

Existe código de lectura/escritura en Functions, Edge Functions y web estática. No se realizó consulta remota, por lo que el estado aplicado de migraciones, RLS y datos debe verificarse por separado antes de cualquier corte.

### Firebase Authentication

- Android usa `firebase_auth`, Google Sign-In, `idTokenChanges()` y perfiles Firestore.
- La web estática inicializa Firebase Auth y conserva una sesión híbrida local.
- Next.js expone Auth cliente y una ruta administrativa para Custom Claims.
- Firebase UID ya aparece como vínculo conceptual y de esquema en Supabase.

### Firebase Realtime Database

Se detectaron `database.rules.json`, configuración de emulador y permisos de red, pero no imports ni operaciones claras de `firebase_database`, `getDatabase`, `onValue` o equivalentes en los módulos auditados. Estado: **configurado, sin consumo probado**.

## Información simulada, real y no comprobada

| Clasificación | Evidencia | Tratamiento requerido |
|---|---|---|
| Simulada/demostrativa | `ops-mock-data.js`, viajes de demostración, datos predictivos dummy, fallbacks locales y seeds explícitos | Nunca presentarla como observación real; mantener etiqueta de procedencia |
| Editorial local | Catálogos de territorios, gastronomía, historia, música y destinos | Validar fuente, fecha, derechos y exactitud antes de importar |
| Implementación remota no comprobada | Consultas Firestore/Supabase y tablas definidas en migraciones | Verificar entorno, recuentos, políticas y muestras con acceso autorizado |
| Identidad real potencial | Firebase Auth y UID | Conservar; no exportar contraseñas ni secretos |
| Emergencia/salud | Categorías y posibles lugares en catálogos | Tratar como no verificado hasta confirmar fuente oficial, teléfono, horario y fecha |

## Módulos no conectados de extremo a extremo

- Ops Center no administra toda la información exclusivamente en Supabase.
- Next.js todavía declara servicios y seeds centrados en Firestore.
- Android consume Firestore y catálogos locales, no una API Supabase canónica.
- favoritos, viajes, reservas, perfiles y auditoría tienen más de una ruta de persistencia.
- BAQUI combina Supabase, Firebase Functions y fallbacks locales.
- museos, cultura, música, arte, gastronomía, emergencias y transporte tienen esquema Supabase, pero no un circuito completo y comprobado Ops → Supabase → Website → Mapa → BAQUI.
- la ruta pública dinámica por municipio/departamento aún coexiste con HTML y datasets embebidos.

## Secuencia de migración recomendada

1. Congelar contratos, no datos: documentar IDs, estados, slugs y propietarios vigentes.
2. Exportar Firestore y Supabase con recuentos, hashes y fecha; conservar respaldo inmutable.
3. Validar y normalizar territorio/categorías primero.
4. Migrar catálogos públicos por dominio, comenzando con destinos y negocios.
5. Implementar verificación de Firebase ID token en backend y resolver `firebase_uid` → `profiles.id`.
6. Migrar datos privados: favoritos, viajes, reservas y reseñas, con reconciliación idempotente.
7. Convertir Ops Center en escritor de Supabase mediante backend autorizado; evitar acceso administrativo directo desde navegador.
8. Cambiar lectores públicos a Supabase y comparar respuestas con la fuente anterior.
9. Mantener Firestore y archivos como respaldo de solo lectura durante una ventana definida.
10. Retirar la doble escritura únicamente después de pruebas, métricas y aprobación explícita.

## Criterios para declarar completada la evolución

- Un alta en Ops Center se guarda una sola vez en Supabase y aparece en web, mapa, territorio, búsqueda y BAQUI.
- Firebase responde quién es el usuario; no almacena el catálogo turístico canónico.
- cada registro sensible posee fuente, estado de verificación y trazabilidad.
- favoritos, viajes y reservas se sincronizan entre dispositivos.
- no existe `SUPABASE_SERVICE_ROLE_KEY` en cliente, APK, HTML, repositorio público ni almacenamiento del navegador.
- RLS y backend impiden leer o modificar datos ajenos y elevar roles.
- `baqueanonicaragua.com` es canonical; `app-baqueano.web.app` sigue operativo como URL técnica secundaria.
- ninguna fuente anterior se elimina antes de exportar, validar, migrar, probar y conservar respaldo.

## Alcance y siguiente verificación

Este mapa cubre el repositorio local al 2026-10-02. Para completar la auditoría operacional faltan verificaciones autorizadas de los entornos remotos: inventario real de colecciones Firestore, migraciones aplicadas en Supabase, recuentos por tabla, políticas RLS efectivas, buckets, Functions desplegadas, DNS/SSL de Hostinger y canonical publicado. Esas comprobaciones deben ser de solo lectura antes de proponer cualquier migración.
