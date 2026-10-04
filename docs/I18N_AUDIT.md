# I18N_AUDIT — cobertura de traducción por página

> Generado por `website/scripts/audit-i18n-pages.mjs --write` el 2026-10-04. **No editar a mano.**

## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ

- 🎯 **POR QUÉ:** `validate-i18n.mjs` solo compara claves entre catálogos; no mide si lo que se ve en cada página está conectado al motor de traducción.
- ⚙️ **CÓMO:** un texto cuenta como traducido si su elemento tiene `data-i18n*` o coincide con un valor de `locales/es.json` (el motor traduce por frase exacta). Se excluyen nombres propios nicaragüenses. En JS se buscan literales con aspecto de español: es una **heurística** (puede haber falsos positivos y negativos).
- 📦 **QUÉ:** tabla por página, SEO por página y literales dinámicos por script.

**Catálogos (claves):** es=893 · en=901 · fr=901 · it=901 · pt=901 · de=901  
**HTML total:** 1676 de 4203 textos cubiertos = **39.9 %**

## Por página (HTML)

| Página | TOTAL_TEXTS | TRANSLATED | UNTRANSLATED | MISSING_KEYS | HARDCODED_STRINGS | SEO sin traducir | % |
|---|---|---|---|---|---|---|---|
| 404.html | 68 | 59 | 9 | 0 | 9 | 1/2 | 87 |
| admin.html | 353 | 15 | 338 | 0 | 338 | 2/2 | 4 |
| aliados.html | 203 | 61 | 142 | 0 | 142 | 2/2 | 30 |
| ambiental.html | 150 | 41 | 109 | 0 | 109 | 2/2 | 27 |
| aviso-legal.html | 124 | 55 | 69 | 0 | 69 | 2/2 | 44 |
| ayuda.html | 56 | 46 | 10 | 0 | 10 | 1/2 | 82 |
| baqueano-ai.html | 21 | 17 | 4 | 0 | 4 | 1/1 | 81 |
| baqueano-ia.html | 174 | 60 | 114 | 0 | 114 | 2/2 | 34 |
| cookies.html | 159 | 57 | 102 | 0 | 102 | 2/2 | 36 |
| cronicas.html | 55 | 3 | 52 | 0 | 52 | 2/2 | 5 |
| denuncias.html | 145 | 96 | 49 | 0 | 49 | 2/2 | 66 |
| departamento.html | 164 | 115 | 49 | 0 | 49 | 1/1 | 70 |
| destino.html | 28 | 12 | 16 | 0 | 16 | 2/2 | 43 |
| destinos.html | 159 | 106 | 53 | 0 | 53 | 2/2 | 67 |
| experiencias.html | 127 | 15 | 112 | 0 | 112 | 2/2 | 12 |
| favoritos.html | 6 | 4 | 2 | 0 | 2 | 1/2 | 67 |
| gastronomia.html | 226 | 65 | 161 | 0 | 161 | 2/2 | 29 |
| historia.html | 202 | 40 | 162 | 0 | 162 | 2/2 | 20 |
| i18n-test.html | 6 | 5 | 1 | 0 | 1 | 1/1 | 83 |
| index.html | 266 | 132 | 134 | 0 | 134 | 4/4 | 50 |
| legal.html | 35 | 23 | 12 | 0 | 12 | 2/2 | 66 |
| mapa.html | 39 | 34 | 5 | 0 | 5 | 1/2 | 87 |
| mi-negocio.html | 274 | 121 | 153 | 0 | 153 | 2/2 | 44 |
| mi-viaje.html | 135 | 69 | 66 | 0 | 66 | 2/2 | 51 |
| musica.html | 242 | 67 | 175 | 0 | 175 | 2/2 | 28 |
| nosotros.html | 189 | 74 | 115 | 0 | 115 | 2/2 | 39 |
| offline.html | 41 | 36 | 5 | 0 | 5 | 0/1 | 88 |
| perfil.html | 181 | 65 | 116 | 0 | 116 | 2/2 | 36 |
| privacidad.html | 108 | 56 | 52 | 0 | 52 | 2/2 | 52 |
| terminos.html | 201 | 61 | 140 | 0 | 140 | 2/2 | 30 |
| testimonios.html | 66 | 66 | 0 | 0 | 0 | 2/4 | 100 |

`MISSING_KEYS` = claves usadas por la página que faltan en al menos un idioma distinto de ES.

## Muestras de texto sin traducir (5 por página)

**404.html**
- texto: SOS
- texto: Tranquilo: hay muchos caminos más, y varios no salen en ningún mapa. V
- texto: Blog
- alt: BAQUI, el guardabarranco explorador, con su mapa
- alt: Volcanes y playas

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
- texto: En cada destino usá el botón de corazón. Después ingresá a
- texto: Entrá a
- texto: Las encontrás en la sección Reservas de tu
- texto: perfil
- texto: Visitá

**baqueano-ai.html**
- texto: Baqueano Digital \| Redirigiendo a Baqueano IA...
- texto: SOS
- texto: Te estamos llevando con BAQUI… Si no pasa nada,
- texto: entrá por aquí

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
- texto: Playas, volcanes, montañas, cultura, gastronomía y mucho más.
- texto: Valoración
- texto: Ordenar por:

**experiencias.html**
- texto: Experiencias de Aventura & Cultura \| Baqueano Nicaragua
- texto: SOS
- texto: TURISMO DE IMPACTO POSITIVO
- texto: Experiencias que te
- texto: transforman

**favoritos.html**
- texto: Guardá destinos que querés conocer y encontralos aquí cuando estés lis
- texto: Explorá Nicaragua y presioná el corazón de cualquier destino para agre

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
- texto: SOS
- texto: Explorá destinos, volcanes, playas, naturaleza, cultura y comunidades 
- texto: Isla de Ometepe
- texto: Oasis de fuego y agua en el Gran Lago Cocibolca con volcanes Concepció
- alt: Logotipo Baqueano

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
- texto: SOS
- texto: No pasa nada: aquí tenés guardados los números de emergencia y los pun
- texto: Cañón de Somoto:
- texto: Isla de Ometepe:
- texto: Cerro Negro / Telica:

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
| js/panorama-viewer.js | 2 | 2 | no |
| js/ayuda.js | 2 | 1 | no |
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
