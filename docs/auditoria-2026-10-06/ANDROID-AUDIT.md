# ANDROID-AUDIT — App Flutter (Android) · 2026-10-06

> 🎯 **POR QUÉ:** el propietario pidió que la app Android esté conectada al Ops Center con información real: "nada a media y nada de estar inventando".
> ⚙️ **CÓMO:**
> - Revisión del código `lib/`.
> - Consultas reales a Supabase con el rol `anon`, el mismo que usa la app.
> - `flutter analyze --fatal-infos --fatal-warnings` y `flutter test` con el SDK oficial estable 3.47.6, descargado y verificado por SHA-256. Son los mismos comandos que corre el CI.
> 📦 **QUÉ:** de dónde saca la app cada dato, qué estaba inventado, qué se corrigió y qué queda.

## 1. Conexión con datos reales

| Dato en la app | Fuente | Prueba (rol `anon`, 2026-10-06) | Estado |
|---|---|---|---|
| Departamentos | Supabase `departments` (REST, clave publicable) | 17 filas | 🟢 |
| Destinos del mapa | Supabase `destinations` (`status = published` y coordenadas dentro de Nicaragua) | 7 filas | 🟢 |
| Negocios | Supabase `businesses` | 30 filas, con la misma consulta de la app | 🟢 |
| **Municipios** (nuevo) | Supabase `municipalities`: área del contorno e identidad | 153 filas | 🟢 Agregado hoy |
| Lugares del territorio | Asset generado desde la web y verificado en CI | — | 🟢 |
| BAQUI | Edge Function `baqueano-ai` | — | 🟡 Funciona; las correcciones de seguridad esperan despliegue |
| Reservas, comunidad, SOS | Edge Functions `baqueano-reservas`, `-community` y `-sos` (token de Firebase) | — | 🟡 Ídem |
| Respaldo sin red | Caché local de la última respuesta de Supabase | Prueba unitaria | 🟢 |

Lo que el equipo publica en el Ops Center (Supabase) llega a la app en el siguiente arranque o al recargar. No hay base paralela.

## 2. Correcciones de hoy

| Problema | Causa | Cambio | Prueba | Estado |
|---|---|---|---|---|
| La app no mostraba municipios | `CatalogRepository` no consultaba `municipalities` | `CatalogMunicipality` y una cuarta consulta. La ficha del departamento lista sus municipios con identidad, área del contorno, fuente (geoBoundaries/OSM) y "por verificar" para población, historia y fiestas | 3 pruebas nuevas en `test/catalog_repository_test.dart` | 🟢 |
| Inicio y búsqueda mostraban "4.9 ★ (128)", "$35 USD" y, si faltaba el dato, "$25", "1 Día" o "18 km" | Catálogo estático (`core/data/catalog_data.dart`) sin fuente, con valores por defecto inventados | Las tarjetas dicen "Sin reseñas verificadas" y "Por confirmar con el anfitrión". Los valores se conservan en el modelo; no se borró nada | `flutter analyze` sin problemas | 🟢 |
| El checkout anterior podía llamar a teléfonos sin fuente | `HostEnterpriseProfile` tenía 5 teléfonos escritos a mano: 3 sin fuente, 1 de relleno (8888-9999) y la línea oficial de BAQUEANO atribuida a un guía | Mientras el perfil no esté verificado, el contacto va a la línea oficial (+505 8443-1289, la misma de la web) y el anfitrión aparece "por verificar". Este flujo ya no se usaba desde el 2026-10-05; queda como defensa | `test/host_enterprise_profile_test.dart` (2 pruebas) | 🟢 |
| anon podía leer `commission_rate`, `owner_uid` y otros identificadores internos de `businesses` | Permiso SELECT sobre toda la tabla | Migración `20261006080000`: SELECT por columna sin esas 5 columnas | La consulta de la app y la de la web siguen devolviendo 30 filas; `commission_rate` da 42501; las vistas públicas responden | 🟢 |

**Resultado del CI local:** `flutter analyze` → *No issues found*. `flutter test` → **71/71**.

## 3. Pendientes reales

1. **El catálogo estático del inicio sigue siendo la fuente de las tarjetas destacadas.**
   - Son 12 destinos en `core/data/catalog_data.dart` y 8 en `data/baqueano_full_catalog.dart`.
   - Ya no muestran cifras inventadas.
   - Lo correcto es que esas tarjetas lean `destinations` de Supabase. Hoy hay solo 7 publicados, así que el equipo tiene que cargar más destinos en el Ops Center para no dejar el inicio vacío.
2. **Nombres de guías del catálogo estático** (por ejemplo, "Doña Rosa Valle").
   - No tienen fuente.
   - Siguen visibles en el texto de las tarjetas.
   - El propietario debe confirmarlos o reemplazarlos por anfitriones verificados.
3. **El filtro de presupuesto de la búsqueda** todavía compara contra los precios estáticos. Debe pasar a `tourism_services` cuando haya tarifas cargadas con fuente.
4. **El voucher del checkout anterior** dibuja un QR decorativo. El flujo no está en uso; si se reactiva, el QR tiene que codificar el código real de la solicitud.
5. **APK:**
   - CI en GitHub sobre `884c085`, ejecución 37459922956: analyze, tests y **compilación del APK debug** en verde.
   - El AAB firmado de release se omite porque el repositorio no tiene configurados los secretos de firma. Es acción del propietario.
