# I18N_AUDIT — cobertura de traducción por página

> Generado por `website/scripts/audit-i18n-pages.mjs --write` el 2026-10-04. **No editar a mano.**

## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ

- 🎯 **POR QUÉ:** `validate-i18n.mjs` solo compara claves entre catálogos; no mide si lo que se ve en cada página está conectado al motor de traducción.
- ⚙️ **CÓMO:** un texto cuenta como traducido si su elemento tiene `data-i18n*` o coincide con un valor de `locales/es.json` (el motor traduce por frase exacta). Se excluyen nombres propios nicaragüenses. En JS se buscan literales con aspecto de español: es una **heurística** (puede haber falsos positivos y negativos).
- 📦 **QUÉ:** tabla por página, SEO por página y literales dinámicos por script.

**Catálogos (claves):** es=741 · en=749 · fr=749 · it=749 · pt=749 · de=749  
**HTML total:** 1506 de 4203 textos cubiertos = **35.8 %**

## Por página (HTML)

| Página | TOTAL_TEXTS | TRANSLATED | UNTRANSLATED | MISSING_KEYS | HARDCODED_STRINGS | SEO sin traducir | % |
|---|---|---|---|---|---|---|---|
| 404.html | 68 | 45 | 23 | 0 | 23 | 2/2 | 66 |
| admin.html | 353 | 15 | 338 | 0 | 338 | 2/2 | 4 |
| aliados.html | 203 | 61 | 142 | 0 | 142 | 2/2 | 30 |
| ambiental.html | 150 | 40 | 110 | 0 | 110 | 2/2 | 27 |
| aviso-legal.html | 124 | 54 | 70 | 0 | 70 | 2/2 | 44 |
| ayuda.html | 56 | 8 | 48 | 0 | 48 | 2/2 | 14 |
| baqueano-ai.html | 21 | 16 | 5 | 0 | 5 | 1/1 | 76 |
| baqueano-ia.html | 174 | 58 | 116 | 0 | 116 | 2/2 | 33 |
| cookies.html | 159 | 53 | 106 | 0 | 106 | 2/2 | 33 |
| cronicas.html | 55 | 3 | 52 | 0 | 52 | 2/2 | 5 |
| denuncias.html | 145 | 96 | 49 | 0 | 49 | 2/2 | 66 |
| departamento.html | 164 | 115 | 49 | 0 | 49 | 1/1 | 70 |
| destino.html | 28 | 12 | 16 | 0 | 16 | 2/2 | 43 |
| destinos.html | 159 | 79 | 80 | 0 | 80 | 2/2 | 50 |
| experiencias.html | 127 | 15 | 112 | 0 | 112 | 2/2 | 12 |
| favoritos.html | 6 | 0 | 6 | 0 | 6 | 2/2 | 0 |
| gastronomia.html | 226 | 65 | 161 | 0 | 161 | 2/2 | 29 |
| historia.html | 202 | 40 | 162 | 0 | 162 | 2/2 | 20 |
| i18n-test.html | 6 | 5 | 1 | 0 | 1 | 1/1 | 83 |
| index.html | 266 | 109 | 157 | 0 | 157 | 4/4 | 41 |
| legal.html | 35 | 22 | 13 | 0 | 13 | 2/2 | 63 |
| mapa.html | 39 | 15 | 24 | 0 | 24 | 2/2 | 38 |
| mi-negocio.html | 274 | 121 | 153 | 0 | 153 | 2/2 | 44 |
| mi-viaje.html | 135 | 50 | 85 | 0 | 85 | 2/2 | 37 |
| musica.html | 242 | 67 | 175 | 0 | 175 | 2/2 | 28 |
| nosotros.html | 189 | 74 | 115 | 0 | 115 | 2/2 | 39 |
| offline.html | 41 | 20 | 21 | 0 | 21 | 1/1 | 49 |
| perfil.html | 181 | 65 | 116 | 0 | 116 | 2/2 | 36 |
| privacidad.html | 108 | 56 | 52 | 0 | 52 | 2/2 | 52 |
| terminos.html | 201 | 61 | 140 | 0 | 140 | 2/2 | 30 |
| testimonios.html | 66 | 66 | 0 | 0 | 0 | 2/4 | 100 |

`MISSING_KEYS` = claves usadas por la página que faltan en al menos un idioma distinto de ES.

## Muestras de texto sin traducir (5 por página)

**404.html**
- texto: 404 — Este camino no lleva a ningún lado \| BAQUEANO Nicaragua
- texto: SOS
- texto: Este camino
- texto: no lleva a ningún lado
- texto: Puede que la dirección esté mal escrita o que la página se haya movido

**admin.html**
- texto: Baqueano Ops Center \| Centro de Operaciones & Administración Total
- texto: BAQUEANO OPS CENTER
- texto: Centro de Operaciones y Mando Digital. Acceso exclusivo para la direcc
- texto: Ingresar con Cuenta Google
- texto: Ops Command

**aliados.html**
- texto: Aliados Baqueano \| Conectá con quienes hacen posible la experiencia
- texto: SOS
- texto: Conectá con quienes hacen posible
- texto: la experiencia
- texto: Cooperativas, eco-lodges, hospedajes, comedores, guías y emprendedores

**ambiental.html**
- texto: Custodia del Territorio \| Baqueano Nicaragua
- texto: SOS
- texto: Custodiá lo que venís
- texto: a descubrir
- texto: Nuestros bosques, lagunas de cráter, ríos y comunidades son sagrados. 

**aviso-legal.html**
- texto: Aviso Legal & Propiedad Intelectual \| BAQUEANO Nicaragua
- texto: SOS
- texto: Aviso Legal &
- texto: Propiedad Intelectual
- texto: Marco jurídico, transparencia y condiciones de operación de BAQUEANO, 

**ayuda.html**
- texto: Centro de Ayuda \| Baqueano Nicaragua
- texto: ¿Cómo podemos ayudarte?
- texto: Encontrá respuestas y llegá directamente a cada herramienta de Baquean
- texto: Buscar en el Centro de Ayuda
- texto: También podés elegir una categoría.

**baqueano-ai.html**
- texto: Baqueano Digital \| Redirigiendo a Baqueano IA...
- texto: SOS
- texto: Te estamos llevando con BAQUI… Si no pasa nada,
- texto: entrá por aquí
- title: Clima actual

**baqueano-ia.html**
- texto: BAQUI \| Tu viaje por Nicaragua, pensado contigo
- texto: SOS
- texto: Tu viaje por Nicaragua,
- texto: pensado contigo.
- texto: Un copiloto de IA que combina lo mejor de Nicaragua para crear rutas ú

**cookies.html**
- texto: Cookies y Almacenamiento Local \| BAQUEANO Nicaragua
- texto: SOS
- texto: Cookies,
- texto: almacenamiento local y uso sin conexión
- texto: Transparencia sobre cómo utilizamos cookies, tecnologías de almacenami

**cronicas.html**
- texto: Crónicas & Relatos Territoriales \| Baqueano Nicaragua
- texto: Voces del Territorio · Edición Especial
- texto: Crónicas que se caminan
- texto: Nicaragua · Cuaderno de Campo 2026
- texto: Todas las crónicas

**denuncias.html**
- texto: Canal Ético Ambiental & Denuncias \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Consola Satelital
- texto: ACTIVO
- texto: 🌳 Canal Ético & Denuncias Ambientales

**departamento.html**
- texto: Guía Turística Departamental \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Mi Pasaporte
- texto: Territorio Soberano
- texto: Explorando el territorio…

**destino.html**
- texto: Ficha de Destino \| Baqueano Nicaragua
- texto: Acceso restringido
- texto: Buscando qué hay por aquí…
- texto: Consultando el Banco Maestro Baqueano de Nicaragua.
- texto: Tu contribución mantiene actualizado el inventario territorial de Nica

**destinos.html**
- texto: Destinos de Nicaragua \| Baqueano Nicaragua
- texto: SOS
- texto: Destinos de Nicaragua
- texto: Playas, volcanes, montañas, cultura, gastronomía y mucho más.
- texto: Descubrí tu próxima aventura

**experiencias.html**
- texto: Experiencias de Aventura & Cultura \| Baqueano Nicaragua
- texto: SOS
- texto: TURISMO DE IMPACTO POSITIVO
- texto: Experiencias que te
- texto: transforman

**favoritos.html**
- texto: Mis Favoritos \| BAQUEANO Nicaragua
- texto: Mis lugares favoritos
- texto: Guardá destinos que querés conocer y encontralos aquí cuando estés lis
- texto: lugares guardados en este dispositivo
- texto: Todavía no guardaste lugares

**gastronomia.html**
- texto: Gastronomía Ancestral de los Hijos del Maíz \| Baqueano Nicaragua
- texto: SOS
- texto: NICARAGUA
- texto: Gastronomía Ancestral de los
- texto: Hijos del Maíz

**historia.html**
- texto: Historia de Nicaragua \| Baqueano Nicaragua
- texto: SOS
- texto: NICARAGUA
- texto: UNA HISTORIA
- texto: QUE SIGUE VIVA

**i18n-test.html**
- texto: BAQUEANO · I18N Test

**index.html**
- texto: Baqueano Nicaragua \| Descubre lo que no sale en el mapa
- texto: SOS
- texto: NICARAGUA
- texto: AUTÉNTICA
- texto: NO SE VISITA,

**legal.html**
- texto: Centro Legal & Términos \| Baqueano Nicaragua
- texto: SOS
- texto: Centro Jurídico & Cumplimiento
- texto: Conocé las bases legales, compromisos de privacidad y términos de serv
- texto: Condiciones de uso del portal, políticas de reserva directa con anfitr

**mapa.html**
- texto: Mapa Interactivo de Nicaragua \| Baqueano
- texto: SOS
- texto: Descubrí Nicaragua
- texto: territorio por territorio
- texto: Explorá destinos, volcanes, playas, naturaleza, cultura y comunidades 

**mi-negocio.html**
- texto: Portal de Anfitriones & Negocios \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Tu comunidad merece
- texto: ganar el 100%
- texto: de lo que cobra

**mi-viaje.html**
- texto: Mi Viaje & Planificador \| Baqueano Nicaragua
- texto: SOS
- texto: PLANIFICADOR SOBERANO
- texto: Mi Aventura por Nicaragua
- texto: Organizá tus días, calculá tus gastos con tarifas reales y guardá tus 

**musica.html**
- texto: Música & Patrimonio Sonoro \| Baqueano Nicaragua
- texto: SOS
- texto: NICARAGUA
- texto: EL SONIDO DE NICARAGUA
- texto: SIGUE VIVO

**nosotros.html**
- texto: Nosotros \| BAQUEANO Nicaragua Auténtica
- texto: SOS
- texto: NOSOTROS
- texto: DESCUBRÍ LO QUE
- texto: NO SALE EN EL MAPA

**offline.html**
- texto: Modo Offline Territorial \| Baqueano Nicaragua
- texto: SOS
- texto: Modo Supervivencia Territorial
- texto: No pasa nada: aquí tenés guardados los números de emergencia y los pun
- texto: Auxilio en ruta y seguridad

**perfil.html**
- texto: Mi Perfil \| BAQUEANO Nicaragua Auténtica
- texto: SOS
- texto: Mi cuenta
- texto: Un viajero,
- texto: mil historias

**privacidad.html**
- texto: Privacidad & Seguridad de tus Datos \| BAQUEANO Nicaragua
- texto: SOS
- texto: Tus datos,
- texto: bajo tu control
- texto: En BAQUEANO protegemos tu información y la usamos solo para ofrecerte 

**terminos.html**
- texto: Términos & Condiciones de Uso \| BAQUEANO Nicaragua
- texto: SOS
- texto: Términos &
- texto: Condiciones de Uso
- texto: Web, App Android y servicios digitales de BAQUEANO.

## Literales dinámicos en JS (heurística)

| Script | DYNAMIC_STRINGS | Sin catálogo | Usa `BaqueanoLanguage` |
|---|---|---|---|
| js/territories-data.js | 819 | 819 | no |
| js/firestore-realtime.js | 354 | 354 | no |
| js/sonora-data.js | 227 | 227 | no |
| js/destination-dossier.js | 176 | 176 | no |
| js/epic-music-player.js | 162 | 161 | no |
| js/madriz-experience.js | 138 | 138 | no |
| js/index-features.js | 130 | 130 | no |
| js/route-builder.js | 129 | 129 | no |
| js/baqueano-assistant.js | 104 | 104 | sí |
| js/baqueano-master-catalog.js | 98 | 98 | no |
| js/chinandega-experience.js | 94 | 94 | no |
| js/baqueano-travel-session.js | 66 | 66 | sí |
| js/nicaragua-real-map.js | 65 | 65 | no |
| js/baqueano-ai.js | 61 | 61 | no |
| js/theme-switcher.js | 51 | 51 | no |
| js/historia-epocas.js | 48 | 48 | no |
| js/musica-player.js | 48 | 48 | no |
| js/baqui-evolved.js | 46 | 45 | no |
| js/baqueano-3d-map.js | 41 | 41 | no |
| js/destinos-interactions.js | 36 | 36 | no |
| js/tourism-catalog-expansion.js | 33 | 33 | no |
| js/user-session.js | 37 | 32 | no |
| js/navigation.js | 46 | 31 | sí |
| js/historia-audioguia.js | 29 | 29 | no |
| js/mi-viaje-interactions.js | 27 | 27 | no |
| js/index-destinos-editorial.js | 21 | 21 | no |
| js/admin-ops.js | 20 | 20 | no |
| js/auth-panel.js | 26 | 19 | no |
| js/smart-search.js | 19 | 19 | no |
| js/baqueano-map.js | 18 | 18 | no |
| js/platform-enhancements.js | 18 | 18 | no |
| js/global-injector.js | 28 | 17 | no |
| js/environmental-evidence.js | 14 | 14 | no |
| js/website-business-catalog.js | 14 | 14 | no |
| js/website-operations-catalog.js | 12 | 12 | no |
| js/destinos-gastronomia.js | 13 | 11 | no |
| js/global-music-player.js | 11 | 11 | no |
| js/global-asset-curator.js | 10 | 10 | no |
| js/community-api.js | 8 | 8 | no |
| js/environmental.js | 8 | 8 | no |
| js/definitive-index-interactions.js | 7 | 7 | no |
| js/global-search.js | 7 | 7 | no |
| js/public-cms-sync.js | 7 | 7 | no |
| js/ai-assistant.js | 6 | 6 | no |
| js/madriz-territory-map.js | 6 | 6 | no |
| js/baqueano-reels.js | 5 | 5 | no |
| js/tres-pilares.js | 5 | 5 | no |
| js/video-registry.js | 5 | 5 | no |
| js/baqueano-route-weather.js | 4 | 4 | no |
| js/favoritos.js | 4 | 4 | no |
| js/business-portal.js | 3 | 3 | no |
| js/calculator.js | 3 | 3 | no |
| js/color-gallery.js | 3 | 3 | no |
| js/persistent-audio-player.js | 3 | 3 | no |
| js/territory-inspector.js | 3 | 3 | no |
| js/territory-media-catalog.js | 3 | 3 | no |
| js/territory-media-experience.js | 3 | 3 | no |
| js/audio-player.js | 2 | 2 | no |
| js/ayuda.js | 2 | 2 | no |
| js/panorama-viewer.js | 2 | 2 | no |
| js/baqueano-api.js | 1 | 1 | no |
| js/destinos-provenance.js | 1 | 1 | no |
| js/firebase-config.js | 1 | 1 | no |
| js/hero-experience.js | 1 | 1 | no |
| js/safety-gallery.js | 1 | 1 | no |
| js/testimonios.js | 26 | 1 | no |
| js/global-language.js | 4 | 0 | sí |

## Cómo se usa

```bash
node website/scripts/audit-i18n-pages.mjs            # tabla en consola
node website/scripts/audit-i18n-pages.mjs --write    # regenera este archivo
node website/scripts/audit-i18n-pages.mjs --min=60   # exit 1 si alguna página < 60 %
```
