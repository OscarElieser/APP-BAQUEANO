// ============================================================================
// 🧭 BAQUEANO — ARTISTAS POR TERRITORIO (territory-artists-data.js)
// ============================================================================
// 🎯 POR QUÉ:
// - La memoria de las artes visuales, escénicas y documentales de Nicaragua
//   está ligada a territorios concretos; el viajero debe encontrar a cada
//   artista en Historia y también en la guía de su departamento o región.
//
// ⚙️ CÓMO:
// - Una sola fuente de datos para historia.html y departamento.html
//   (js/territory-artists.js pinta ambas vistas).
// - Aquí solo hay nombres propios, municipios e ids de territorio; disciplina,
//   hito y lemas regionales son claves de locales/{es,en,fr,it,pt,de}.json
//   (pages.historia.artistas.*), así que nunca hay texto de interfaz sin clave.
// - `group` es el territorio donde aparece en Historia; `depts` son los
//   territorios cuya guía lo muestra (departamento.html?id=<dept>).
//
// 📦 QUÉ: window.BAQUEANO_TERRITORY_ARTISTS = { groups: [...], artists: [...] }.
// Origen editorial: tabla y "mapeo rápido" entregados por el propietario
// (05-10-2026). Pendiente de contrastar con fuentes del INC/MINED.
// ============================================================================
(function (window) {
  'use strict';

  var groups = [
    { id: 'managua', name: 'Managua', icon: 'fa-building-columns' },
    { id: 'masaya', name: 'Masaya', icon: 'fa-drum' },
    { id: 'granada', name: 'Granada', icon: 'fa-palette' },
    { id: 'leon', name: 'León', icon: 'fa-masks-theater' },
    { id: 'matagalpa', name: 'Matagalpa', icon: 'fa-mountain' },
    { id: 'carazo', name: 'Carazo', icon: 'fa-brush' },
    { id: 'raccs', name: 'Costa Caribe Sur (RACCS)', icon: 'fa-water' }
  ];

  // FOTOS (2026-10-07): cada ficha tiene un espacio de retrato. Mientras no haya foto, muestra el
  // logo de BAQUEANO y el aviso "Foto pendiente". Para publicar una foto real, agregá al artista:
  //   photo: { src: 'assets/images/artistas/<id>.webp', credit: 'Autor o archivo',
  //            license: 'CC BY-SA 4.0 | Permiso escrito | Dominio público', sourceUrl: 'https://…' }
  // Solo fotos reales con permiso o licencia, nunca imágenes generadas que simulen a la persona.
  // Si la foto la aportó el propietario sin enlace de origen: photo: { src, providedBy: 'owner',
  //   providedAt: 'AAAA-MM-DD' } y la ficha dice "Imagen aportada a BAQUEANO · fuente original por confirmar".
  // scripts/territory-artists.test.mjs exige el archivo y, o bien crédito + licencia + fuente https,
  // o bien providedBy 'owner' con fecha.
  // discipline → pages.historia.artistas.disciplines.<discipline>
  // milestone  → pages.historia.artistas.items.<id>.milestone
  // localityKey (opcional) → localidad con texto traducible en vez de nombre propio.
  var artists = [
    { id: 'deleon', name: 'Omar de León', discipline: 'painting', group: 'managua', depts: ['managua'], locality: 'Managua', photo: { src: 'assets/images/artistas/deleon.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'gron', name: 'Edith Grön', discipline: 'sculpture', group: 'managua', depts: ['managua'], localityKey: 'pages.historia.artistas.items.gron.locality', photo: { src: 'assets/images/artistas/gron.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'saravia', name: 'Fernando Saravia', discipline: 'sculpturePainting', group: 'managua', depts: ['managua'], locality: 'Managua', photo: { src: 'assets/images/artistas/saravia.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'montealegre', name: 'Margarita Montealegre', discipline: 'photography', group: 'managua', depts: ['managua'], locality: 'Managua', photo: { src: 'assets/images/artistas/montealegre.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'carrion', name: 'Gloria Carrión Fonseca', discipline: 'film', group: 'managua', depts: ['managua'], locality: 'Managua', photo: { src: 'assets/images/artistas/carrion.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'lopez', name: 'Irene López', discipline: 'danceFolklore', group: 'masaya', depts: ['masaya'], locality: 'Masaya', photo: { src: 'assets/images/artistas/lopez.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'penalba', name: 'Rodrigo Peñalba', discipline: 'painting', group: 'masaya', depts: ['masaya', 'leon'], localityKey: 'pages.historia.artistas.items.penalba.locality', photo: { src: 'assets/images/artistas/penalba.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'morales', name: 'Armando Morales', discipline: 'painting', group: 'granada', depts: ['granada'], locality: 'Granada', photo: { src: 'assets/images/artistas/morales.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'espinoza', name: 'Gloria Elena Espinoza de Tercero', discipline: 'playwriting', group: 'leon', depts: ['leon'], locality: 'León', photo: { src: 'assets/images/artistas/espinoza.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'arostegui', name: 'Alejandro Aróstegui', discipline: 'paintingMixed', group: 'matagalpa', depts: ['matagalpa'], locality: 'San Ramón', photo: { src: 'assets/images/artistas/arostegui.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'saenz', name: 'Leoncio Sáenz', discipline: 'paintingDrawing', group: 'matagalpa', depts: ['matagalpa'], locality: 'Paxila, Matagalpa', photo: { src: 'assets/images/artistas/saenz.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'marin', name: 'Raúl Marín', discipline: 'painting', group: 'carazo', depts: ['carazo'], locality: 'Jinotepe', photo: { src: 'assets/images/artistas/marin.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'beer', name: 'June Beer', discipline: 'paintingPoetry', group: 'raccs', depts: ['raccs'], locality: 'Bluefields', photo: { src: 'assets/images/artistas/beer.webp', providedBy: 'owner', providedAt: '2026-10-07' } },
    { id: 'bacon', name: 'Gloria Bacon', discipline: 'danceManagement', group: 'raccs', depts: ['raccs'], locality: 'Bluefields', photo: { src: 'assets/images/artistas/bacon.webp', providedBy: 'owner', providedAt: '2026-10-07', credit: 'Gabriel García' } }
  ];

  window.BAQUEANO_TERRITORY_ARTISTS = Object.freeze({ groups: groups, artists: artists });
})(window);
