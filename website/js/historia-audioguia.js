/*
 * ============================================================================
 * 🧭 BAQUEANO — AUDIOGUÍA "ESCUCHÁ NUESTRA HISTORIA" (historia-audioguia.js)
 * ============================================================================
 *
 * 🎯 POR QUÉ (Propósito):
 * - La tarjeta prometía "relatos en voz de Baqueano Digital", pero el botón ▶
 *   no tenía ninguna función y el tiempo "0:00 / 2:45" era decorativo. Un
 *   botón que no responde rompe la confianza del viajero.
 * - No existe narración grabada en el proyecto: se usa la síntesis de voz del
 *   navegador (la misma técnica que BAQUI en baqueano-assistant.js), sin
 *   descargas ni costo de servidor.
 *
 * ⚙️ CÓMO (Arquitectura):
 * - 7 capítulos de texto breve, uno por etiqueta (data-chapter="0…6").
 * - ▶ reproduce desde el capítulo actual y encadena los siguientes; ⏸ detiene.
 *   Se usa cancel() + reinicio por capítulo porque pause()/resume() fallan en
 *   Chrome para Android.
 * - El subtítulo (.hist-audio-caption, aria-live) muestra lo que se escucha:
 *   accesible para personas sordas y útil con el teléfono en silencio.
 * - Sin voz disponible: el subtítulo muestra el relato completo del capítulo.
 * - Se detiene al salir de la página (pagehide) para no seguir hablando.
 *
 * 📦 QUÉ (Entregables):
 * - Botón ▶/⏸ funcional con aria-pressed, capítulos seleccionables, indicador
 *   "Capítulo N de 7", onda animada mientras habla (respeta reduced-motion).
 * ============================================================================
 */
(function () {
  'use strict';

  var CHAPTERS = [
    {
      title: 'Época Prehispánica',
      text: 'Antes de la llegada de los españoles, nuestra tierra ya tenía dueños y nombres. ' +
        'En el Pacífico vivían los nicaraos y los chorotegas; en el centro, los matagalpas; ' +
        'y en el Caribe, los miskitos, mayangnas y ramas. Comerciaban con semillas de cacao, ' +
        'y dejaron su memoria tallada en piedra: los petroglifos de Ometepe todavía se pueden visitar.'
    },
    {
      title: 'Colonia',
      text: 'En 1524, Francisco Hernández de Córdoba fundó Granada y León. ' +
        'León Viejo fue abandonada en 1610, tras los terremotos y la erupción del Momotombo, ' +
        'y sus ruinas hoy son Patrimonio de la Humanidad. ' +
        'Durante casi tres siglos, iglesias, fortalezas y conventos dieron forma a nuestras ciudades.'
    },
    {
      title: 'Independencia',
      text: 'El 15 de septiembre de 1821 se firmó en Guatemala el Acta de Independencia de Centroamérica. ' +
        'Nicaragua formó parte de la Federación Centroamericana y en 1838 se convirtió en una república independiente. ' +
        'Cada septiembre, las fiestas patrias llenan las calles de desfiles y tambores.'
    },
    {
      title: 'Guerra Nacional',
      text: 'Entre 1856 y 1857, nicaragüenses y centroamericanos se unieron contra el filibustero William Walker, ' +
        'que se había proclamado presidente. ' +
        'El 14 de septiembre de 1856, en la hacienda San Jacinto, el sargento Andrés Castro, sin munición, ' +
        'derribó a un invasor con una piedra. Esa batalla se recuerda como fiesta nacional.'
    },
    {
      title: 'Siglo XX',
      text: 'En 1916 murió en León Rubén Darío, el poeta que renovó la lengua española con el modernismo. ' +
        'Entre 1927 y 1933, Augusto C. Sandino enfrentó la ocupación de tropas estadounidenses. ' +
        'El terremoto de 1972 destruyó el centro de Managua, y en 1979 terminó la dictadura de la familia Somoza.'
    },
    {
      title: 'Nicaragua Actual',
      text: 'Hoy Nicaragua cuida su memoria y su naturaleza. ' +
        'La Catedral de León y las ruinas de León Viejo son Patrimonio de la Humanidad, ' +
        'y las reservas de Bosawás e Indio Maíz protegen algunos de los bosques más grandes de Centroamérica. ' +
        'Las comunidades reciben a los viajeros con su cocina, su café y sus historias.'
    },
    {
      title: 'Música y Tradiciones',
      text: 'El Güegüense, obra de teatro y danza nacida en la Colonia, es Patrimonio Oral e Inmaterial de la Humanidad desde 2005. ' +
        'La marimba de arco acompaña los bailes del Pacífico, el Palo de Mayo llena de ritmo Bluefields, ' +
        'y cada 7 de diciembre la Gritería nos saca a la calle a preguntar: ¿Quién causa tanta alegría?'
    }
  ];

  function init() {
    var section = document.querySelector('.hist-audio-section');
    if (!section) return;

    var playBtn = section.querySelector('.hist-audio-play-btn');
    var caption = section.querySelector('.hist-audio-caption');
    var timeEl = section.querySelector('.hist-audio-time');
    var tags = Array.prototype.slice.call(section.querySelectorAll('.hist-audio-tag[data-chapter]'));
    if (!playBtn || !caption) return;

    var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    var current = 0;
    var playing = false;
    var token = 0; // invalida callbacks de lecturas canceladas

    function pickVoice() {
      if (!synth) return null;
      var voices = synth.getVoices() || [];
      var prefs = ['es-NI', 'es-419', 'es-MX', 'es-US', 'es-ES'];
      for (var i = 0; i < prefs.length; i++) {
        for (var j = 0; j < voices.length; j++) {
          if (voices[j].lang && voices[j].lang.replace('_', '-') === prefs[i]) return voices[j];
        }
      }
      for (var k = 0; k < voices.length; k++) {
        if (voices[k].lang && voices[k].lang.toLowerCase().indexOf('es') === 0) return voices[k];
      }
      return null;
    }

    function render() {
      section.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      playBtn.setAttribute('aria-label', playing ? 'Pausar audioguía' : 'Reproducir audioguía');
      var icon = playBtn.querySelector('i');
      if (icon) icon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      tags.forEach(function (tag, i) {
        var active = i === current;
        tag.classList.toggle('is-active', active);
        tag.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (timeEl) timeEl.textContent = 'Capítulo ' + (current + 1) + ' de ' + CHAPTERS.length;
    }

    function stop() {
      token++;
      playing = false;
      if (synth) {
        try { synth.cancel(); } catch (e) { /* sin voz: nada que detener */ }
      }
      render();
    }

    function speak(index) {
      current = index;
      var chapter = CHAPTERS[index];
      caption.textContent = chapter.title + '. ' + chapter.text;

      if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
        playing = false;
        render();
        caption.textContent = chapter.title + '. ' + chapter.text +
          ' (Tu navegador no puede leer en voz alta: acá tenés el relato completo.)';
        return;
      }

      var myToken = ++token;
      try { synth.cancel(); } catch (e) { /* continúa */ }
      var utterance = new window.SpeechSynthesisUtterance(chapter.title + '. ' + chapter.text);
      var voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = voice ? voice.lang : 'es-419';
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.onend = function () {
        if (myToken !== token || !playing) return;
        if (current < CHAPTERS.length - 1) {
          speak(current + 1);
        } else {
          playing = false;
          render();
          caption.textContent = 'Fin del recorrido. Elegí un capítulo para volver a escucharlo.';
        }
      };
      utterance.onerror = function () {
        if (myToken !== token) return;
        playing = false;
        render();
      };
      playing = true;
      render();
      try {
        synth.speak(utterance);
      } catch (e) {
        playing = false;
        render();
      }
    }

    playBtn.addEventListener('click', function () {
      if (playing) {
        stop();
      } else {
        speak(current);
      }
    });

    tags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        var index = parseInt(tag.getAttribute('data-chapter'), 10);
        if (!isFinite(index) || index < 0 || index >= CHAPTERS.length) return;
        speak(index);
      });
    });

    // Las voces se cargan de forma asíncrona en Chrome.
    if (synth && typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', function () { /* pickVoice las leerá */ });
    }
    window.addEventListener('pagehide', stop);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
