// ============================================================================
// 🧭 BAQUEANO — ARCHIVO SONORO COMPLETO + FICHAS DE MÚSICA EN CONTEXTO (musica-archivo.js)
// ============================================================================
// 🎯 POR QUÉ: pedidos del propietario (2026-10-07):
//    - "si en sistema tenemos 93 músicas tienen que mostrarse todas… en fila y columna";
//    - los temas de "Baqueano Digital", "Historia viva" e "Instrumentos" deben dar información
//      sin salir de musica.html, "a como hace historia que te la puede leer por vos".
// ⚙️ CÓMO:
//    - El inventario sale de window.BaqueanoArchive.tracks (js/epic-music-player.js): los 93 MP3
//      reales de assets/audio con su catalogación verificada. Lo que no tiene ficha se muestra
//      como "Créditos por documentar"; nunca se inventa un autor.
//    - Mejora progresiva: si este script no carga, quedan las 6 tarjetas del HTML.
//    - Fichas: <dialog> nativo con texto breve resumido de una fuente pública citada, botón
//      "Escuchar" (speechSynthesis, voz del idioma activo, como la audioguía de Historia) y las
//      grabaciones del archivo relacionadas, que se reproducen sin salir de la página.
//    - Todo dato se inserta con textContent / atributos (sin innerHTML con datos).
// 📦 QUÉ: rellena #tracksGrid y abre fichas desde cualquier [data-music-topic].
// ============================================================================
(function (window, document) {
  'use strict';

  function t(key, fallback, vars) {
    var text = fallback;
    try { if (window.BaqueanoLanguage && window.BaqueanoLanguage.t) text = window.BaqueanoLanguage.t(key, { fallback: fallback }) || fallback; } catch (_) { text = fallback; }
    if (vars) Object.keys(vars).forEach(function (k) { text = text.split('{' + k + '}').join(String(vars[k])); });
    return text;
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name) {
    var i = el('i', 'fa-solid ' + name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }
  function tracks() { return (window.BaqueanoArchive && window.BaqueanoArchive.tracks) || []; }
  function play(track) {
    if (window.playArchiveFile && window.playArchiveFile(track.file)) return;
    if (window.playSong) window.playSong(track.title, track.artist);
  }
  var FALLBACK_COVER = 'assets/images/destinos/volcan_masaya.jpg';

  // ---------------------------------------------------------------- Archivo sonoro
  function card(track) {
    var box = el('div', 'track-card-exact');
    box.setAttribute('data-title', track.title);
    box.setAttribute('data-artist', [track.artist, track.territory, track.credit].join(' '));
    box.setAttribute('data-file', track.file);
    var img = document.createElement('img');
    img.className = 'track-thumb';
    img.src = encodeURI(track.image || FALLBACK_COVER);
    img.alt = '';
    img.width = 44; img.height = 44; img.loading = 'lazy'; img.decoding = 'async';
    box.appendChild(img);
    var info = el('div', 'track-info');
    var title = el('h3', 'track-title', track.title);
    title.setAttribute('translate', 'no');
    info.appendChild(title);
    var artist = el('p', 'track-artist', track.verified ? track.artist : t('musicArchive.pendingCredits', 'Créditos por documentar'));
    if (track.verified) artist.setAttribute('translate', 'no');
    info.appendChild(artist);
    var meta = el('p', 'track-meta');
    meta.appendChild(icon(track.verified ? 'fa-circle-check' : 'fa-clock'));
    meta.appendChild(document.createTextNode(' ' + (track.verified ? track.territory : t('musicArchive.pending', 'En revisión'))));
    info.appendChild(meta);
    box.appendChild(info);
    var btn = el('button', 'track-play-btn');
    btn.type = 'button';
    btn.setAttribute('aria-label', t('musicArchive.play', 'Reproducir {title}', { title: track.title }));
    btn.appendChild(icon('fa-play'));
    btn.addEventListener('click', function () { play(track); });
    box.appendChild(btn);
    return box;
  }

  function renderArchive() {
    var grid = document.getElementById('tracksGrid');
    var list = tracks();
    if (!grid || !list.length) return;
    grid.classList.add('musica-archive-grid--full');
    grid.replaceChildren.apply(grid, list.map(card));
    var count = document.getElementById('musicArchiveCount');
    if (count) count.textContent = String(list.length);
    var search = document.getElementById('trackSearchInput');
    if (search && search.value) search.dispatchEvent(new Event('input'));
  }

  // ---------------------------------------------------------------- Fichas
  var WIKI = 'https://es.wikipedia.org/wiki/';
  var GENERAL = { label: 'Wikipedia — Música de Nicaragua', url: WIKI + 'M%C3%BAsica_de_Nicaragua' };
  var TOPICS = {
    sonNica: { title: 'El son nica', text: 'El son nica es un género musical propio de Nicaragua y uno de los más representativos de su cultura: se lo cuenta entre los símbolos nacionales no oficiales del país. Camilo Zapata, compositor y cantautor, es uno de sus autores más importantes.',
      source: { label: 'Wikipedia — Son nica · Camilo Zapata', url: WIKI + 'Son_nica' }, match: /Camilo Zapata|Justo Santos/ },
    moraLimpia: { title: 'La Mora Limpia', text: 'La Mora Limpia es una pieza instrumental del compositor y cantautor nicaragüense Justo Santos. Su grabación forma parte del archivo sonoro de BAQUEANO y se puede escuchar aquí mismo.',
      source: { label: 'Wikipedia — Justo Santos', url: WIKI + 'Justo_Santos' }, match: /^la_mora/i, field: 'file' },
    marimba: { title: 'La marimba de arco', text: 'La marimba de arco nicaragüense es una variante sencilla de la marimba, instrumento de origen africano. Su estructura casi no ha cambiado con el tiempo: solo se renovaron algunos de los materiales con que se fabrica. En el archivo suenan grabaciones de la Marimba de Arco de Monimbó, en Masaya.',
      source: { label: 'Wikipedia — Marimba de arco', url: WIKI + 'Marimba_de_arco' }, match: /Marimba de [Aa]rco/ },
    gueguense: { title: 'El Güegüense', text: 'El Güegüense es un drama satírico y la primera obra teatral de la literatura nicaragüense. Une teatro, danza y música, y es una síntesis de las culturas española e indígena. La UNESCO lo inscribió en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad (proclamado en 2005).',
      source: { label: 'UNESCO — El Güegüense', url: 'https://ich.unesco.org/es/RL/el-gueguense-00111' }, match: /Güegüense/ },
    caribe: { title: 'Música del Caribe y Palo de Mayo', text: 'El Palo de Mayo es una danza afrocaribeña que forma parte de la cultura de varias comunidades de las Regiones Autónomas de la Costa Caribe Norte y Sur de Nicaragua. En el archivo la representa sobre todo Dimensión Costeña, de Bluefields.',
      source: { label: 'Wikipedia — Palo de Mayo', url: WIKI + 'Palo_de_Mayo' }, match: /Dimensión Costeña|Palo de Mayo/ },
    historicas: { title: 'Canciones históricas', text: 'Carlos Mejía Godoy es uno de los principales representantes de la canción testimonial o nueva canción de Nicaragua. En el archivo están sus canciones y las de su hermano Luis Enrique Mejía Godoy.',
      source: { label: 'Wikipedia — Carlos Mejía Godoy', url: WIKI + 'Carlos_Mej%C3%ADa_Godoy' }, match: /Carlos Mejía Godoy|Luis Enrique Mejía Godoy/ },
    artistas: { title: 'Artistas del archivo', text: 'El archivo sonoro de BAQUEANO reúne {verified} grabaciones con ficha verificada de {artists} artistas y agrupaciones nicaragüenses. Tocá un nombre para escuchar una de sus piezas.',
      source: null, artists: true },
    rutas: { title: 'Rutas musicales', text: 'El mapa sonoro de esta página marca cinco territorios: Masaya, cuna de la marimba de arco; Granada, con sus serenatas y compositores; León, con la trova y el son nica; el Caribe Sur, con el Palo de Mayo; y Matagalpa y Jinotega, con polkas y mazurcas campesinas.',
      source: null, map: true },
    quijongo: { title: 'El quijongo', text: 'El quijongo es un instrumento de cuerda percutida, típico de pueblos indígenas de Nicaragua y Costa Rica. Aunque se lo asocia a los chorotegas de Nicoya, su origen es africano: es muy parecido al birimbao afrobrasileño.',
      source: { label: 'Wikipedia — Quijongo', url: WIKI + 'Quijongo' } },
    guitarra: { title: 'La guitarra nicaragüense', text: '', general: true, match: /Camilo Zapata|Justo Santos|Dúo Guardabarranco/ },
    pito: { title: 'El pito', text: '', general: true, match: /Güegüense/ },
    tambor: { title: 'El tambor', text: '', general: true, match: /Dimensión Costeña|Güegüense/ },
    percusion: { title: 'La percusión', text: '', general: true, match: /Dimensión Costeña/ }
  };
  var GENERAL_TEXT = 'La música de Nicaragua es una mezcla de influencias indígenas, africanas y europeas, especialmente españolas.';
  var PENDING_NOTE = 'La ficha propia de este instrumento está en preparación: solo publicamos datos con fuente.';

  var dialog = null, synth = ('speechSynthesis' in window) ? window.speechSynthesis : null, speaking = false, current = null;

  function locale() {
    var lang = window.BaqueanoLanguage;
    return (lang && typeof lang.getLocale === 'function' && lang.getLocale()) || 'es-NI';
  }
  function pickVoice() {
    if (!synth) return null;
    var voices = synth.getVoices() || [], wanted = locale().toLowerCase(), base = wanted.split('-')[0];
    var prefs = base === 'es' ? ['es-ni', 'es-419', 'es-mx', 'es-us', 'es-es'] : [wanted];
    for (var i = 0; i < prefs.length; i++) for (var j = 0; j < voices.length; j++) if (voices[j].lang && voices[j].lang.replace('_', '-').toLowerCase() === prefs[i]) return voices[j];
    for (var k = 0; k < voices.length; k++) if (voices[k].lang && voices[k].lang.toLowerCase().indexOf(base) === 0) return voices[k];
    return null;
  }
  function stopVoice() { if (synth) synth.cancel(); speaking = false; paintListen(); }
  function paintListen() {
    if (!dialog) return;
    var b = dialog.querySelector('.bq-music-info-listen');
    b.setAttribute('aria-pressed', speaking ? 'true' : 'false');
    b.replaceChildren(icon(speaking ? 'fa-stop' : 'fa-volume-high'), document.createTextNode(' ' + (speaking ? t('musicInfo.stop', 'Detener lectura') : t('musicInfo.listen', 'Escuchar'))));
  }

  function topicText(id, topic) {
    var list = tracks();
    var verified = list.filter(function (x) { return x.verified; });
    var vars = { verified: verified.length, artists: uniqueArtists(verified).length };
    if (topic.general) return [t('musicInfo.general.text', GENERAL_TEXT), t('musicInfo.pendingNote', PENDING_NOTE)];
    return [t('musicInfo.' + id + '.text', topic.text, vars)];
  }
  function uniqueArtists(list) {
    var seen = {}, out = [];
    list.forEach(function (x) { if (!seen[x.artist]) { seen[x.artist] = true; out.push(x); } });
    return out;
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', 'bq-music-info');
    dialog.setAttribute('aria-labelledby', 'bqMusicInfoTitle');
    var head = el('div', 'bq-music-info-head');
    var h = el('h2', 'bq-music-info-title'); h.id = 'bqMusicInfoTitle';
    var close = el('button', 'bq-music-info-close'); close.type = 'button';
    close.appendChild(icon('fa-xmark'));
    close.addEventListener('click', function () { dialog.close(); });
    head.appendChild(h); head.appendChild(close);
    dialog.appendChild(head);
    dialog.appendChild(el('div', 'bq-music-info-body'));
    var actions = el('div', 'bq-music-info-actions');
    var listen = el('button', 'bq-music-info-listen'); listen.type = 'button';
    listen.addEventListener('click', function () {
      if (!synth) return;
      if (speaking) { stopVoice(); return; }
      var parts = [dialog.querySelector('.bq-music-info-title').textContent].concat(Array.prototype.map.call(dialog.querySelectorAll('.bq-music-info-text'), function (p) { return p.textContent; }));
      var u = new window.SpeechSynthesisUtterance(parts.join('. '));
      u.lang = locale(); var v = pickVoice(); if (v) u.voice = v;
      u.onend = u.onerror = function () { speaking = false; paintListen(); };
      synth.cancel(); synth.speak(u); speaking = true; paintListen();
    });
    if (!synth) listen.hidden = true;
    actions.appendChild(listen);
    dialog.appendChild(actions);
    dialog.addEventListener('close', function () { stopVoice(); if (current && current.opener && document.contains(current.opener)) current.opener.focus(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function render(id) {
    var topic = TOPICS[id];
    var d = ensureDialog();
    d.querySelector('.bq-music-info-title').textContent = t('musicInfo.' + id + '.title', topic.title);
    d.querySelector('.bq-music-info-close').setAttribute('aria-label', t('musicInfo.close', 'Cerrar'));
    var body = d.querySelector('.bq-music-info-body');
    body.replaceChildren();
    topicText(id, topic).forEach(function (p, i) { body.appendChild(el('p', i ? 'bq-music-info-text bq-music-info-note' : 'bq-music-info-text', p)); });

    var src = topic.general ? GENERAL : topic.source;
    if (src) {
      var s = el('p', 'bq-music-info-source');
      s.appendChild(icon('fa-book-open'));
      s.appendChild(document.createTextNode(' ' + t('musicInfo.source', 'Fuente') + ': '));
      var a = el('a', '', src.label); a.href = src.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      s.appendChild(a);
      body.appendChild(s);
    }

    var list = tracks();
    var related = [];
    if (topic.artists) related = uniqueArtists(list.filter(function (x) { return x.verified; }));
    else if (topic.match) related = list.filter(function (x) { return x.verified && topic.match.test(topic.field === 'file' ? x.file : x.artist + ' ' + x.credit + ' ' + x.title); });
    if (related.length) {
      body.appendChild(el('h3', 'bq-music-info-sub', topic.artists ? t('musicInfo.artistsHeading', 'Artistas en el archivo') : t('musicInfo.listenHeading', 'Escuchalo en el archivo ({n})', { n: related.length })));
      var ul = el('ul', 'bq-music-info-tracks');
      related.forEach(function (x) {
        var li = el('li');
        var b = el('button', 'bq-music-info-track'); b.type = 'button';
        b.appendChild(icon('fa-play'));
        var label = el('span', '', topic.artists ? x.artist : x.title);
        label.setAttribute('translate', 'no');
        b.appendChild(label);
        if (!topic.artists) b.appendChild(el('small', '', x.artist));
        b.setAttribute('aria-label', t('musicArchive.play', 'Reproducir {title}', { title: x.title + ' — ' + x.artist }));
        b.addEventListener('click', function () { play(x); });
        li.appendChild(b); ul.appendChild(li);
      });
      body.appendChild(ul);
    }
    if (topic.map) {
      var go = el('button', 'bq-music-info-map'); go.type = 'button';
      go.appendChild(icon('fa-map-location-dot'));
      go.appendChild(document.createTextNode(' ' + t('musicInfo.seeMap', 'Ver el mapa sonoro')));
      go.addEventListener('click', function () { d.close(); var m = document.getElementById('mapaSonoro'); if (m) m.scrollIntoView({ behavior: 'smooth' }); });
      body.appendChild(go);
    }
    paintListen();
  }

  function open(id, opener) {
    if (!TOPICS[id]) return;
    current = { id: id, opener: opener };
    render(id);
    stopVoice();
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-music-topic]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger.getAttribute('data-music-topic'), trigger);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var trigger = e.target.closest && e.target.closest('[data-music-topic][role="button"]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger.getAttribute('data-music-topic'), trigger);
  });
  window.addEventListener('baqueano:languageChanged', function () {
    renderArchive();
    if (dialog && dialog.open && current) { stopVoice(); render(current.id); }
  });

  window.BaqueanoMusicInfo = { open: open };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderArchive, { once: true });
  else renderArchive();
})(window, document);
