// ============================================================================
// 🧭 BAQUEANO — BIBLIOTECA SONORA DE HISTORIA (historia-audioguia-data.js)
// ============================================================================
// 🎯 POR QUÉ:
// - La audioguía "Escuchá nuestra historia" debe narrar solo hechos con fuente
//   visible y separar la historia documentada del patrimonio y de la tradición
//   oral (La Mocuana o El Cadejo nunca se presentan como hechos históricos).
//
// ⚙️ CÓMO:
// - Períodos (los chips de la tarjeta) agrupan capítulos; el orden de `chapters`
//   es el orden de escucha continua.
// - Título y relato de cada capítulo son claves de locales/{es,en,fr,it,pt,de}.json
//   (pages.historia.audio.chapters.<id>.title|text); aquí solo hay ids, fechas,
//   nombres propios y fuentes.
// - `type`: historical_fact | heritage | oral_tradition (pages.historia.audio.types.*).
// - `date` (AAAA-MM-DD, se formatea según el idioma) o `years` ([desde, hasta]).
// - `sources`: solo URLs leídas y contrastadas el `verifiedAt` indicado. Un
//   capítulo sin fuente con URL no se marca como verificado.
// - `place` y `people`: solo nombres propios (no se traducen).
// - `dept`: id de departamento para "Ver en el mapa" (departamento.html?id=).
//
// 📦 QUÉ: window.BAQUEANO_HISTORY_AUDIO = { periods: [...], chapters: [...] }.
// Base: bloques aportados por el propietario (05-10-2026), contrastados contra
// las fuentes citadas; donde las fuentes discrepan se narra solo lo común
// (p. ej. Ley No. 28: el día de aprobación difiere entre fuentes → "1987").
// ============================================================================
(function (window) {
  'use strict';

  var VERIFIED = '2026-10-05';

  var SRC = {
    aghn: { name: 'Academia de Geografía e Historia de Nicaragua (AGHN) — Breve Historia de Nicaragua', url: 'https://www.aghn.edu.ni/breve-historia-de-nicaragua/' },
    minedSanJacinto: { name: 'Ministerio de Educación (MINED) — Batalla de San Jacinto', url: 'https://www.mined.gob.ni/fiestas-patrias/2024/06/12/hacienda-san-jacinto/' },
    minedDosCombates: { name: 'Biblioteca Digital MINED — Los dos combates de San Jacinto', url: 'https://www.mined.gob.ni/biblioteca/wp-content/uploads/2025/09/LOS-DOS-COMBATES-DE-SAN-JACINTO.pdf' },
    cervantesDario: { name: 'Instituto Cervantes — Biografía de Rubén Darío', url: 'https://www.cervantes.es/bibliotecas_documentacion_espanol/creadores/dario_ruben.htm' },
    minedSandino: { name: 'Ministerio de Educación (MINED) — 130 aniversario del natalicio del General Sandino', url: 'https://www.mined.gob.ni/comunidad-educativa-honra-el-130-aniversario-del-natalicio-del-general-sandino/' },
    enelSandino: { name: 'Empresa Nicaragüense de Electricidad (ENEL) — Síntesis biográfica de Augusto C. Sandino', url: 'https://enel.gob.ni/sandinovive/' },
    unanAutonomia: { name: 'UNAN-Managua — Costa Caribe nicaragüense: 36 años de autonomía', url: 'https://www.unan.edu.ni/index.php/articulos-reportajes/costa-caribe-nicaraguense-36-anos-avanzando-en-la-restitucion-de-derechos.odp' },
    unescoNicaragua: { name: 'UNESCO — Centro del Patrimonio Mundial: Nicaragua', url: 'https://whc.unesco.org/en/statesparties/ni' },
    unescoLeonViejo: { name: 'UNESCO — Ruinas de León Viejo', url: 'https://whc.unesco.org/es/list/613' },
    unescoGueguense: { name: 'UNESCO — El Güegüense (Patrimonio Cultural Inmaterial)', url: 'https://ich.unesco.org/es/RL/el-guegense-00111' }
  };

  // label → clave existente de los chips (historia.html), no se duplica texto.
  var periods = [
    { id: 'prehispanica', label: 'pages.historia.histAudioSection.button1' },
    { id: 'colonia', label: 'pages.historia.histAudioSection.button2' },
    { id: 'independencia', label: 'pages.historia.histAudioSection.button3' },
    { id: 'guerraNacional', label: 'pages.historia.histAudioSection.button4' },
    { id: 'personajes', label: 'pages.historia.histAudioSection.button5' },
    { id: 'costaCaribe', label: 'pages.historia.histAudioSection.button8' },
    { id: 'actual', label: 'pages.historia.histAudioSection.button6' },
    { id: 'tradiciones', label: 'pages.historia.histAudioSection.button7' }
  ];

  var chapters = [
    { id: 'pueblosOriginarios', period: 'prehispanica', type: 'historical_fact', years: null, place: null, dept: null, people: ['Maribios', 'Sutiavas', 'Chorotegas', 'Nicaraguas'], sources: [SRC.aghn] },
    { id: 'conquista', period: 'colonia', type: 'historical_fact', years: [1502, 1544], place: null, dept: null, people: ['Cristóbal Colón', 'Gil González Dávila', 'Andrés Niño'], sources: [SRC.aghn] },
    { id: 'leonViejo', period: 'colonia', type: 'heritage', years: [1524, 2000], place: 'León Viejo', dept: 'leon', people: [], sources: [SRC.aghn, SRC.unescoNicaragua, SRC.unescoLeonViejo] },
    { id: 'independencia', period: 'independencia', type: 'historical_fact', date: '1821-09-15', place: null, dept: null, people: ['Agustín de Iturbide'], sources: [SRC.aghn] },
    { id: 'treintaAnos', period: 'independencia', type: 'historical_fact', years: [1858, 1893], place: null, dept: null, people: ['Tomás Martínez'], sources: [SRC.aghn] },
    { id: 'guerraNacional', period: 'guerraNacional', type: 'historical_fact', years: [1855, 1857], place: null, dept: null, people: ['William Walker', 'Tomás Martínez', 'Fernando Chamorro', 'Ejército del Septentrión'], sources: [SRC.aghn, SRC.minedDosCombates] },
    { id: 'sanJacinto', period: 'guerraNacional', type: 'historical_fact', date: '1856-09-14', place: 'Hacienda San Jacinto', dept: 'managua', people: ['José Dolores Estrada', 'Andrés Castro'], sources: [SRC.minedDosCombates, SRC.minedSanJacinto] },
    { id: 'dario', period: 'personajes', type: 'historical_fact', years: [1867, 1916], place: 'Metapa · León', dept: 'leon', people: ['Rubén Darío'], sources: [SRC.cervantesDario] },
    { id: 'sandino', period: 'personajes', type: 'historical_fact', years: [1895, 1934], place: 'Niquinohomo', dept: 'masaya', people: ['Augusto C. Sandino', 'Ejército Defensor de la Soberanía Nacional'], sources: [SRC.minedSandino, SRC.enelSandino] },
    { id: 'costaCaribe', period: 'costaCaribe', type: 'historical_fact', years: [1748, 1860], place: 'La Mosquitia', dept: null, people: [], sources: [SRC.aghn] },
    { id: 'autonomia', period: 'costaCaribe', type: 'historical_fact', years: [1987, 1987], place: null, dept: null, people: [], sources: [SRC.unanAutonomia] },
    { id: 'patrimonioMundial', period: 'actual', type: 'heritage', years: null, place: 'León', dept: 'leon', people: [], sources: [SRC.unescoNicaragua] },
    { id: 'gueguense', period: 'tradiciones', type: 'heritage', years: [2005, 2008], place: null, dept: null, people: [], sources: [SRC.unescoGueguense] }
  ];

  chapters.forEach(function (chapter) { chapter.verifiedAt = VERIFIED; });

  window.BAQUEANO_HISTORY_AUDIO = Object.freeze({ periods: periods, chapters: chapters });
})(window);
