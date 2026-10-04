# I18N_AUDIT — cobertura de traducción por página

> Generado por `website/scripts/audit-i18n-pages.mjs --write` el 2026-10-04. **No editar a mano.**

## 🎯 POR QUÉ · ⚙️ CÓMO · 📦 QUÉ

- 🎯 **POR QUÉ:** `validate-i18n.mjs` solo compara claves entre catálogos; no mide si lo que se ve en cada página está conectado al motor de traducción.
- ⚙️ **CÓMO:** un texto cuenta como traducido si su elemento tiene `data-i18n*` o coincide con un valor de `locales/es.json` (el motor traduce por frase exacta). Se excluyen nombres propios nicaragüenses. En JS se buscan literales con aspecto de español: es una **heurística** (puede haber falsos positivos y negativos).
- 📦 **QUÉ:** tabla por página, SEO por página y literales dinámicos por script.

**Catálogos (claves):** es=570 · en=578 · fr=578 · it=578 · pt=578 · de=578  
**HTML total:** 806 de 4203 textos cubiertos = **19.2 %**

## Por página (HTML)

| Página | TOTAL_TEXTS | TRANSLATED | UNTRANSLATED | MISSING_KEYS | HARDCODED_STRINGS | SEO sin traducir | % |
|---|---|---|---|---|---|---|---|
| 404.html | 68 | 27 | 41 | 0 | 41 | 2/2 | 40 |
| admin.html | 353 | 14 | 339 | 0 | 339 | 2/2 | 4 |
| aliados.html | 203 | 37 | 166 | 0 | 166 | 2/2 | 18 |
| ambiental.html | 150 | 23 | 127 | 0 | 127 | 2/2 | 15 |
| aviso-legal.html | 124 | 26 | 98 | 0 | 98 | 2/2 | 21 |
| ayuda.html | 56 | 7 | 49 | 0 | 49 | 2/2 | 13 |
| baqueano-ai.html | 21 | 11 | 10 | 0 | 10 | 1/1 | 52 |
| baqueano-ia.html | 174 | 32 | 142 | 0 | 142 | 2/2 | 18 |
| cookies.html | 159 | 26 | 133 | 0 | 133 | 2/2 | 16 |
| cronicas.html | 55 | 1 | 54 | 0 | 54 | 2/2 | 2 |
| denuncias.html | 145 | 16 | 129 | 0 | 129 | 2/2 | 11 |
| departamento.html | 164 | 22 | 142 | 0 | 142 | 1/1 | 13 |
| destino.html | 28 | 11 | 17 | 0 | 17 | 2/2 | 39 |
| destinos.html | 159 | 57 | 102 | 0 | 102 | 2/2 | 36 |
| experiencias.html | 127 | 12 | 115 | 0 | 115 | 2/2 | 9 |
| favoritos.html | 6 | 0 | 6 | 0 | 6 | 2/2 | 0 |
| gastronomia.html | 226 | 46 | 180 | 0 | 180 | 2/2 | 20 |
| historia.html | 202 | 24 | 178 | 0 | 178 | 2/2 | 12 |
| i18n-test.html | 6 | 5 | 1 | 0 | 1 | 1/1 | 83 |
| index.html | 266 | 79 | 187 | 0 | 187 | 4/4 | 30 |
| legal.html | 35 | 14 | 21 | 0 | 21 | 2/2 | 40 |
| mapa.html | 39 | 12 | 27 | 0 | 27 | 2/2 | 31 |
| mi-negocio.html | 274 | 24 | 250 | 0 | 250 | 2/2 | 9 |
| mi-viaje.html | 135 | 27 | 108 | 0 | 108 | 2/2 | 20 |
| musica.html | 242 | 31 | 211 | 0 | 211 | 2/2 | 13 |
| nosotros.html | 189 | 42 | 147 | 0 | 147 | 2/2 | 22 |
| offline.html | 41 | 14 | 27 | 0 | 27 | 1/1 | 34 |
| perfil.html | 181 | 38 | 143 | 0 | 143 | 2/2 | 21 |
| privacidad.html | 108 | 29 | 79 | 0 | 79 | 2/2 | 27 |
| terminos.html | 201 | 33 | 168 | 0 | 168 | 2/2 | 16 |
| testimonios.html | 66 | 66 | 0 | 0 | 0 | 2/4 | 100 |

`MISSING_KEYS` = claves usadas por la página que faltan en al menos un idioma distinto de ES.

## Muestras de texto sin traducir (5 por página)

**404.html**
- texto: 404 — Este camino no lleva a ningún lado \| BAQUEANO Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Este camino
- texto: no lleva a ningún lado

**admin.html**
- texto: Baqueano Ops Center \| Centro de Operaciones & Administración Total
- texto: BAQUEANO OPS CENTER
- texto: Centro de Operaciones y Mando Digital. Acceso exclusivo para la direcc
- texto: Ingresar con Cuenta Google
- texto: Ops Command

**aliados.html**
- texto: Aliados Baqueano \| Conectá con quienes hacen posible la experiencia
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Conectá con quienes hacen posible
- texto: la experiencia

**ambiental.html**
- texto: Custodia del Territorio \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Custodiá lo que venís
- texto: a descubrir

**aviso-legal.html**
- texto: Aviso Legal & Propiedad Intelectual \| BAQUEANO Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: 🛡️ LEGAL

**ayuda.html**
- texto: Centro de Ayuda \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: ¿Cómo podemos ayudarte?
- texto: Encontrá respuestas y llegá directamente a cada herramienta de Baquean
- texto: Buscar en el Centro de Ayuda

**baqueano-ai.html**
- texto: Baqueano Digital \| Redirigiendo a Baqueano IA...
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Te estamos llevando con BAQUI… Si no pasa nada,
- texto: entrá por aquí

**baqueano-ia.html**
- texto: BAQUI \| Tu viaje por Nicaragua, pensado contigo
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Tu viaje por Nicaragua,
- texto: pensado contigo.

**cookies.html**
- texto: Cookies y Almacenamiento Local \| BAQUEANO Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: 🛡️ LEGAL

**cronicas.html**
- texto: Crónicas & Relatos Territoriales \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: Voces del Territorio · Edición Especial
- texto: Crónicas que se caminan
- texto: Nicaragua · Cuaderno de Campo 2026

**denuncias.html**
- texto: Canal Ético Ambiental & Denuncias \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Portal Soberano
- texto: Mi País
- texto: 29 Áreas Protegidas y Volcanes

**departamento.html**
- texto: Guía Turística Departamental \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Portal Soberano
- texto: Mi País
- texto: 29 Áreas Protegidas y Volcanes

**destino.html**
- texto: Ficha de Destino \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: Acceso restringido
- texto: Buscando qué hay por aquí…
- texto: Consultando el Banco Maestro Baqueano de Nicaragua.

**destinos.html**
- texto: Destinos de Nicaragua \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Destinos de Nicaragua
- texto: Playas, volcanes, montañas, cultura, gastronomía y mucho más.

**experiencias.html**
- texto: Experiencias de Aventura & Cultura \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: TURISMO DE IMPACTO POSITIVO
- texto: Experiencias que te

**favoritos.html**
- texto: Mis Favoritos \| BAQUEANO Nicaragua
- texto: Mis lugares favoritos
- texto: Guardá destinos que querés conocer y encontralos aquí cuando estés lis
- texto: lugares guardados en este dispositivo
- texto: Todavía no guardaste lugares

**gastronomia.html**
- texto: Gastronomía Ancestral de los Hijos del Maíz \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: NICARAGUA
- texto: Gastronomía Ancestral de los

**historia.html**
- texto: Historia de Nicaragua \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: NICARAGUA
- texto: UNA HISTORIA

**i18n-test.html**
- texto: BAQUEANO · I18N Test

**index.html**
- texto: Baqueano Nicaragua \| Descubre lo que no sale en el mapa
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: NICARAGUA
- texto: AUTÉNTICA

**legal.html**
- texto: Centro Legal & Términos \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Centro Jurídico & Cumplimiento
- texto: Conocé las bases legales, compromisos de privacidad y términos de serv

**mapa.html**
- texto: Mapa Interactivo de Nicaragua \| Baqueano
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Descubrí Nicaragua
- texto: territorio por territorio

**mi-negocio.html**
- texto: Portal de Anfitriones & Negocios \| Baqueano Nicaragua
- texto: NICARAGUA
- texto: Portal Soberano
- texto: Mi País
- texto: 29 Áreas Protegidas y Volcanes

**mi-viaje.html**
- texto: Mi Viaje & Planificador \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: PLANIFICADOR SOBERANO
- texto: Mi Aventura por Nicaragua

**musica.html**
- texto: Música & Patrimonio Sonoro \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: NICARAGUA
- texto: EL SONIDO DE NICARAGUA

**nosotros.html**
- texto: Nosotros \| BAQUEANO Nicaragua Auténtica
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Decálogo y alertas ecológicas
- texto: Historia y Memoria

**offline.html**
- texto: Modo Offline Territorial \| Baqueano Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Modo Supervivencia Territorial
- texto: No pasa nada: aquí tenés guardados los números de emergencia y los pun

**perfil.html**
- texto: Mi Perfil \| BAQUEANO Nicaragua Auténtica
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Decálogo y alertas ecológicas
- texto: Historia y Memoria

**privacidad.html**
- texto: Privacidad & Seguridad de tus Datos \| BAQUEANO Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Decálogo y alertas ecológicas
- texto: Historia y Memoria

**terminos.html**
- texto: Términos & Condiciones de Uso \| BAQUEANO Nicaragua
- texto: NICARAGUA AUTÉNTICA
- texto: SOS
- texto: Decálogo y alertas ecológicas
- texto: Historia y Memoria

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
| js/auth-panel.js | 26 | 20 | no |
| js/global-injector.js | 28 | 20 | no |
| js/smart-search.js | 19 | 19 | no |
| js/baqueano-map.js | 18 | 18 | no |
| js/platform-enhancements.js | 18 | 18 | no |
| js/environmental-evidence.js | 14 | 14 | no |
| js/website-business-catalog.js | 14 | 14 | no |
| js/destinos-gastronomia.js | 13 | 12 | no |
| js/website-operations-catalog.js | 12 | 12 | no |
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
