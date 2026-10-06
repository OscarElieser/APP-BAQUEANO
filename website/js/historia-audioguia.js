/*
 * ============================================================================
 * 🧭 BAQUEANO — AUDIOGUÍA "ESCUCHÁ NUESTRA HISTORIA" (historia-audioguia.js)
 * ============================================================================
 *
 * 🎯 POR QUÉ (Propósito):
 * - La tarjeta prometía "relatos en voz de Baqueano Digital", pero el botón ▶
 *   no tenía ninguna función y el tiempo "0:00 / 2:45" era decorativo. Un
 *   botón que no responde rompe la confianza del viajero.
 * - La audioguía crece a una biblioteca sonora: cada capítulo es un hecho
 *   con fuente visible, separado del patrimonio y de la tradición oral.
 * - No existe narración grabada en el proyecto: se usa la síntesis de voz del
 *   navegador (la misma técnica que BAQUI en baqueano-assistant.js), sin
 *   descargas ni costo de servidor.
 *
 * ⚙️ CÓMO (Arquitectura):
 * - Datos en js/historia-audioguia-data.js (períodos → capítulos → fuentes);
 *   títulos, relatos e interfaz salen de locales/*.json (6 idiomas).
 * - Los chips (data-period) eligen un período; debajo se listan sus capítulos.
 * - ▶ reproduce desde el capítulo actual y encadena los siguientes de toda la
 *   biblioteca; ⏸ detiene. Se usa cancel() + reinicio por capítulo porque
 *   pause()/resume() fallan en Chrome para Android.
 * - La voz usa el idioma activo de BAQUEANO (si el navegador tiene esa voz).
 * - El subtítulo (.hist-audio-caption, aria-live) muestra el relato completo:
 *   accesible para personas sordas y útil con el teléfono en silencio.
 * - Ficha del capítulo: tipo (hecho histórico / patrimonio / tradición oral),
 *   fecha, lugar, personajes, "Ver en el mapa" y fuentes con fecha de
 *   verificación. Sin dato, el campo no se muestra.
 * - Se detiene al salir de la página (pagehide) para no seguir hablando.
 *
 * 📦 QUÉ (Entregables):
 * - Botón ▶/⏸ con aria-pressed, períodos y capítulos seleccionables,
 *   "Capítulo N de T", "Siguiente capítulo", onda animada mientras habla
 *   (respeta reduced-motion) y fuentes enlazadas por capítulo.
 * ============================================================================
 */
(function () {
  'use strict';

  var A = 'pages.historia.audio.';

  function t(key, options) {
    var lang = window.BaqueanoLanguage;
    return lang && typeof lang.t === 'function' ? lang.t(key, options) : '';
  }

  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    return node;
  }

  function init() {
    var section = document.querySelector('.hist-audio-section');
    var library = window.BAQUEANO_HISTORY_AUDIO;
    if (!section || !library) return;

    var playBtn = section.querySelector('.hist-audio-play-btn');
    var caption = section.querySelector('.hist-audio-caption');
    var timeEl = section.querySelector('.hist-audio-time');
    var metaEl = section.querySelector('.hist-audio-meta');
    var sourcesEl = section.querySelector('.hist-audio-sources');
    var chaptersEl = section.querySelector('.hist-audio-chapters');
    var nextBtn = section.querySelector('.hist-audio-next');
    var tags = Array.prototype.slice.call(section.querySelectorAll('.hist-audio-tag[data-period]'));
    if (!playBtn || !caption) return;

    var chapters = library.chapters;
    var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    var current = 0;
    var playing = false;
    var touched = false; // hasta el primer gesto se conserva la invitación inicial
    var token = 0; // invalida callbacks de lecturas canceladas

    function chapterTitle(chapter) { return t(A + 'chapters.' + chapter.id + '.title'); }
    function chapterText(chapter) { return t(A + 'chapters.' + chapter.id + '.text'); }
    function narration(chapter) { return chapterTitle(chapter) + '. ' + chapterText(chapter); }

    function locale() {
      var lang = window.BaqueanoLanguage;
      return (lang && typeof lang.getLocale === 'function' && lang.getLocale()) || 'es-NI';
    }

    function pickVoice() {
      if (!synth) return null;
      var voices = synth.getVoices() || [];
      var wanted = locale().toLowerCase();
      var base = wanted.split('-')[0];
      var prefs = base === 'es' ? ['es-ni', 'es-419', 'es-mx', 'es-us', 'es-es'] : [wanted];
      for (var i = 0; i < prefs.length; i++) {
        for (var j = 0; j < voices.length; j++) {
          if (voices[j].lang && voices[j].lang.replace('_', '-').toLowerCase() === prefs[i]) return voices[j];
        }
      }
      for (var k = 0; k < voices.length; k++) {
        if (voices[k].lang && voices[k].lang.toLowerCase().indexOf(base) === 0) return voices[k];
      }
      return null;
    }

    function formatWhen(chapter) {
      if (chapter.date) {
        var lang = window.BaqueanoLanguage;
        try {
          return lang && lang.formatDate ? lang.formatDate(chapter.date + 'T12:00:00', { day: 'numeric', month: 'long', year: 'numeric' }) : chapter.date;
        } catch (e) { return chapter.date; }
      }
      if (Array.isArray(chapter.years) && chapter.years.length === 2) {
        return chapter.years[0] === chapter.years[1] ? String(chapter.years[0]) : chapter.years[0] + '–' + chapter.years[1];
      }
      return '';
    }

    function metaItem(iconName, text, proper) {
      var item = el('span', 'hist-audio-meta-item');
      item.appendChild(el('i', 'fa-solid ' + iconName, { 'aria-hidden': 'true' }));
      var label = el('span', '', proper ? { translate: 'no' } : null);
      label.textContent = text;
      item.appendChild(document.createTextNode(' '));
      item.appendChild(label);
      return item;
    }

    function renderMeta(chapter) {
      if (metaEl) {
        var items = [];
        var badge = el('span', 'hist-audio-type hist-audio-type--' + chapter.type);
        badge.textContent = t(A + 'types.' + chapter.type);
        items.push(badge);
        var when = formatWhen(chapter);
        if (when) items.push(metaItem('fa-calendar-days', when, false));
        if (chapter.place) items.push(metaItem('fa-location-dot', chapter.place, true));
        if (chapter.people && chapter.people.length) {
          var people = metaItem('fa-users', chapter.people.join(' · '), true);
          people.setAttribute('title', t(A + 'people'));
          items.push(people);
        }
        if (chapter.dept) {
          var map = el('a', 'hist-audio-map-link', { href: 'departamento.html?id=' + chapter.dept + '#territoryMap' });
          map.appendChild(el('i', 'fa-solid fa-map-location-dot', { 'aria-hidden': 'true' }));
          map.appendChild(document.createTextNode(' ' + t(A + 'map')));
          items.push(map);
        }
        metaEl.replaceChildren.apply(metaEl, items);
      }
      if (sourcesEl) {
        var verified = chapter.sources && chapter.sources.length && chapter.verifiedAt;
        var parts = [];
        var label = el('strong');
        label.textContent = t(A + 'sources') + ': ';
        parts.push(label);
        (chapter.sources || []).forEach(function (source, i) {
          if (i) parts.push(document.createTextNode(' · '));
          var link = el('a', '', { href: source.url, target: '_blank', rel: 'noopener', translate: 'no' });
          link.textContent = source.name;
          parts.push(link);
        });
        if (verified) {
          var lang = window.BaqueanoLanguage;
          var date = lang && lang.formatDate ? lang.formatDate(chapter.verifiedAt + 'T12:00:00', { day: 'numeric', month: 'short', year: 'numeric' }) : chapter.verifiedAt;
          var stamp = el('span', 'hist-audio-verified');
          stamp.appendChild(el('i', 'fa-solid fa-circle-check', { 'aria-hidden': 'true' }));
          stamp.appendChild(document.createTextNode(' ' + t(A + 'verified', { date: date })));
          parts.push(document.createTextNode(' '));
          parts.push(stamp);
        }
        sourcesEl.replaceChildren.apply(sourcesEl, verified ? parts : []);
        sourcesEl.hidden = !verified;
      }
    }

    function renderChapterList() {
      if (!chaptersEl) return;
      var period = chapters[current].period;
      var buttons = [];
      chapters.forEach(function (chapter, index) {
        if (chapter.period !== period) return;
        var button = el('button', 'hist-audio-chapter', { type: 'button', 'data-index': String(index), 'aria-pressed': index === current ? 'true' : 'false' });
        if (index === current) button.classList.add('is-active');
        var number = el('span', 'hist-audio-chapter-n');
        number.textContent = String(index + 1);
        button.appendChild(number);
        button.appendChild(document.createTextNode(' ' + chapterTitle(chapter)));
        buttons.push(button);
      });
      chaptersEl.replaceChildren.apply(chaptersEl, buttons);
    }

    function render() {
      var chapter = chapters[current];
      section.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      playBtn.setAttribute('aria-label', playing ? t(A + 'pause') : t('pages.historia.histAudioSection.buttonAriaLabel1'));
      var icon = playBtn.querySelector('i');
      if (icon) icon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      tags.forEach(function (tag) {
        var active = tag.getAttribute('data-period') === chapter.period;
        tag.classList.toggle('is-active', active);
        tag.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      var counter = t(A + 'counter', { n: current + 1, total: chapters.length });
      if (timeEl && counter) timeEl.textContent = counter;
      if (nextBtn) nextBtn.disabled = current >= chapters.length - 1;
      renderChapterList();
      if (touched) renderMeta(chapter);
    }

    function show(index) {
      current = index;
      touched = true;
      caption.textContent = narration(chapters[index]);
      render();
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
      show(index);
      var chapter = chapters[index];

      if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
        playing = false;
        render();
        caption.textContent = narration(chapter) + ' (' + t(A + 'noVoice') + ')';
        return;
      }

      var myToken = ++token;
      try { synth.cancel(); } catch (e) { /* continúa */ }
      var utterance = new window.SpeechSynthesisUtterance(narration(chapter));
      var voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = voice ? voice.lang : locale();
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.onend = function () {
        if (myToken !== token || !playing) return;
        if (current < chapters.length - 1) {
          speak(current + 1);
        } else {
          playing = false;
          render();
          caption.textContent = t(A + 'end');
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
        var period = tag.getAttribute('data-period');
        for (var i = 0; i < chapters.length; i++) {
          if (chapters[i].period === period) { speak(i); return; }
        }
      });
    });

    // Acceso externo mínimo (2026-10-06): "Ver más sobre nuestros pueblos" y la lista de
    // personajes abren un capítulo concreto sin reproducirlo (js/historia-enlaces.js).
    window.BaqueanoHistoryAudio = Object.freeze({
      showChapter: function (id) {
        var index = chapters.findIndex(function (c) { return c.id === id; });
        if (index < 0) return false;
        show(index);
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
    });

    if (chaptersEl) {
      chaptersEl.addEventListener('click', function (event) {
        var button = event.target.closest('.hist-audio-chapter');
        if (!button) return;
        var index = parseInt(button.getAttribute('data-index'), 10);
        if (isFinite(index) && index >= 0 && index < chapters.length) speak(index);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (current >= chapters.length - 1) return;
        if (playing) speak(current + 1); else show(current + 1);
      });
    }

    // Las voces se cargan de forma asíncrona en Chrome.
    if (synth && typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', function () { /* pickVoice las leerá */ });
    }
    // Al cambiar de idioma: se corta la lectura en el idioma anterior y se re-pinta.
    window.addEventListener('baqueano:languageChanged', function () {
      if (playing) stop();
      if (touched) caption.textContent = narration(chapters[current]);
      render();
    });
    window.addEventListener('pagehide', stop);

    // El indicador pasa a mostrar "Capítulo N de T": se suelta su clave estática
    // para que global-language.js no lo reescriba con "13 capítulos".
    if (timeEl) timeEl.removeAttribute('data-i18n');

    // Si el catálogo de idioma aún no cargó, se vuelve a pintar cuando esté listo.
    var tries = 0;
    (function paintWhenReady() {
      render();
      if (!t(A + 'counter') && tries++ < 40) window.setTimeout(paintWhenReady, 250);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
