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

  // discipline → pages.historia.artistas.disciplines.<discipline>
  // milestone  → pages.historia.artistas.items.<id>.milestone
  // localityKey (opcional) → localidad con texto traducible en vez de nombre propio.
  var artists = [
    { id: 'deleon', name: 'Omar de León', discipline: 'painting', group: 'managua', depts: ['managua'], locality: 'Managua' },
    { id: 'gron', name: 'Edith Grön', discipline: 'sculpture', group: 'managua', depts: ['managua'], localityKey: 'pages.historia.artistas.items.gron.locality' },
    { id: 'saravia', name: 'Fernando Saravia', discipline: 'sculpturePainting', group: 'managua', depts: ['managua'], locality: 'Managua' },
    { id: 'montealegre', name: 'Margarita Montealegre', discipline: 'photography', group: 'managua', depts: ['managua'], locality: 'Managua' },
    { id: 'carrion', name: 'Gloria Carrión Fonseca', discipline: 'film', group: 'managua', depts: ['managua'], locality: 'Managua' },
    { id: 'lopez', name: 'Irene López', discipline: 'danceFolklore', group: 'masaya', depts: ['masaya'], locality: 'Masaya' },
    { id: 'penalba', name: 'Rodrigo Peñalba', discipline: 'painting', group: 'masaya', depts: ['masaya', 'leon'], localityKey: 'pages.historia.artistas.items.penalba.locality' },
    { id: 'morales', name: 'Armando Morales', discipline: 'painting', group: 'granada', depts: ['granada'], locality: 'Granada' },
    { id: 'espinoza', name: 'Gloria Elena Espinoza de Tercero', discipline: 'playwriting', group: 'leon', depts: ['leon'], locality: 'León' },
    { id: 'arostegui', name: 'Alejandro Aróstegui', discipline: 'paintingMixed', group: 'matagalpa', depts: ['matagalpa'], locality: 'San Ramón' },
    { id: 'saenz', name: 'Leoncio Sáenz', discipline: 'paintingDrawing', group: 'matagalpa', depts: ['matagalpa'], locality: 'Paxila, Matagalpa' },
    { id: 'marin', name: 'Raúl Marín', discipline: 'painting', group: 'carazo', depts: ['carazo'], locality: 'Jinotepe' },
    { id: 'beer', name: 'June Beer', discipline: 'paintingPoetry', group: 'raccs', depts: ['raccs'], locality: 'Bluefields' },
    { id: 'bacon', name: 'Gloria Bacon', discipline: 'danceManagement', group: 'raccs', depts: ['raccs'], locality: 'Bluefields' }
  ];

  window.BAQUEANO_TERRITORY_ARTISTS = Object.freeze({ groups: groups, artists: artists });
})(window);
