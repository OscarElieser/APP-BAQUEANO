/*
 * ============================================================================
 * 🧭 BAQUEANO — FICHAS DE ÉPOCA "CONOCER MÁS" (historia-epocas.js)
 * ============================================================================
 *
 * 🎯 POR QUÉ (Propósito):
 * - Los 7 botones "Conocer más" de la línea de tiempo apuntaban a anclas que
 *   no existen (#epocaPrehispanica, #sigloXX…): el viajero tocaba y no pasaba
 *   nada. Cada época merece una ficha breve que conecte la historia con
 *   lugares que hoy se pueden visitar (modelo 4C: comunicación y conveniencia).
 *
 * ⚙️ CÓMO (Arquitectura):
 * - <dialog> nativo con showModal(): foco atrapado, Escape y fondo inerte sin
 *   código extra. Un solo diálogo reutilizable, contenido construido con nodos
 *   DOM (textContent), sin HTML de terceros.
 * - El enlace conserva su href (mejora progresiva); con JS se intercepta el
 *   clic y se abre la ficha correspondiente al hash.
 * - "Escuchar en la audioguía" activa el capítulo equivalente de
 *   js/historia-audioguia.js (.hist-audio-tag[data-chapter]).
 * - Al cerrar, el foco vuelve al botón que abrió la ficha.
 *
 * 📦 QUÉ (Entregables):
 * - 7 fichas con resumen, datos clave fechados y "Dónde vivirlo hoy" con
 *   enlaces al buscador de destinos.
 * ============================================================================
 */
(function () {
  'use strict';

  var ERAS = {
    epocaPrehispanica: {
      title: 'Época Prehispánica', dates: '10,000 a.C. – 1523', chapter: 0,
      summary: 'Mucho antes de la llegada de los españoles, el territorio estaba habitado por pueblos con lenguas, comercio y creencias propias. En el Pacífico vivían nicaraos y chorotegas; en el centro, los matagalpas; y en el Caribe, miskitos, mayangnas y ramas.',
      facts: [
        'Las Huellas de Acahualinca, en Managua, conservan pisadas humanas de miles de años, marcadas en ceniza volcánica.',
        'La isla de Ometepe guarda cientos de petroglifos tallados en roca basáltica.',
        'Las semillas de cacao funcionaban como moneda en los mercados.',
        'La estatuaria de la isla Zapatera muestra figuras humanas y animales protectores en piedra.'
      ],
      places: [['Isla de Ometepe', 'Petroglifos y Museo El Ceibo'], ['Huellas de Acahualinca', 'Managua'], ['Convento San Francisco', 'Granada · estatuaria de Zapatera']]
    },
    resistenciaIndigena: {
      title: 'Resistencia Indígena', dates: '1524 – 1699', chapter: 1,
      summary: 'La conquista no fue pacífica. Los pueblos originarios defendieron su tierra y su identidad, y muchas de sus comunidades siguen vivas hasta hoy.',
      facts: [
        'En 1523, el cacique chorotega Diriangén enfrentó a la expedición de Gil González Dávila.',
        'En las primeras décadas de la Colonia, miles de indígenas fueron enviados como esclavos al Perú.',
        'Sutiava, en León, y Monimbó, en Masaya, conservan su raíz indígena, sus artesanías y sus fiestas.'
      ],
      places: [['Sutiava', 'León · Iglesia de San Juan Bautista'], ['Monimbó', 'Masaya · artesanía y tradición'], ['León Viejo', 'Ruinas, Patrimonio de la Humanidad']]
    },
    periodoColonial: {
      title: 'Periodo Colonial', dates: '1700 – 1821', chapter: 1,
      summary: 'León y Granada crecieron como los dos grandes centros coloniales. Iglesias, casonas de patio central y fortalezas contra piratas dieron forma a las ciudades que hoy recorremos.',
      facts: [
        'La Fortaleza de la Inmaculada Concepción, en El Castillo, se terminó en 1675 para frenar a los piratas por el río San Juan.',
        'En 1762, Rafaela Herrera dirigió la defensa de esa fortaleza frente a un ataque británico.',
        'La Catedral de León, la más grande de Centroamérica, empezó a construirse en 1747 y es Patrimonio de la Humanidad desde 2011.'
      ],
      places: [['El Castillo', 'Río San Juan · fortaleza'], ['Catedral de León', 'León · recorrido por los techos'], ['Granada', 'Casonas coloniales y La Calzada']]
    },
    independencia: {
      title: 'Independencia de 1821', dates: '1821 – 1855', chapter: 2,
      summary: 'Tras la independencia de España, Nicaragua pasó por la Federación Centroamericana y luego buscó su propio camino como república, entre la rivalidad de León y Granada.',
      facts: [
        'El 15 de septiembre de 1821 se firmó el Acta de Independencia de Centroamérica.',
        'Nicaragua integró la Federación Centroamericana y en 1838 se declaró república independiente.',
        'En 1852 Managua fue elegida capital, a medio camino entre León y Granada.'
      ],
      places: [['León', 'Ciudad universitaria y liberal'], ['Granada', 'Ciudad comercial del lago'], ['Managua', 'Capital desde 1852']]
    },
    guerraNacional: {
      title: 'Guerra Nacional', dates: '1856 – 1895', chapter: 3,
      summary: 'Nicaragüenses y centroamericanos se unieron para expulsar al filibustero William Walker, que se había proclamado presidente. Es una de las gestas que más une la memoria del país.',
      facts: [
        'El 14 de septiembre de 1856, en la hacienda San Jacinto, el sargento Andrés Castro derribó a un invasor con una piedra.',
        'En diciembre de 1856, las tropas de Walker incendiaron Granada al retirarse.',
        'Walker fue expulsado en 1857 y fusilado en Honduras en 1860.'
      ],
      places: [['Hacienda San Jacinto', 'Museo histórico, Managua'], ['Granada', 'Ciudad reconstruida tras el incendio'], ['Rivas', 'Escenario de batallas de 1856']]
    },
    sigloXX: {
      title: 'Siglo XX', dates: '1900 – 1979', chapter: 4,
      summary: 'Un siglo de grandes cambios: la poesía de Darío llevó a Nicaragua al mundo, el país vivió ocupaciones extranjeras, una larga dictadura y un terremoto que transformó Managua.',
      facts: [
        'Rubén Darío, padre del modernismo, murió en León en 1916.',
        'Entre 1927 y 1933, Augusto C. Sandino enfrentó la ocupación de tropas estadounidenses.',
        'El terremoto del 23 de diciembre de 1972 destruyó el centro de Managua.',
        'En 1979 terminó la dictadura de la familia Somoza.'
      ],
      places: [['Museo Rubén Darío', 'León · casa natal del poeta'], ['Antigua Catedral', 'Managua · memoria del terremoto'], ['Loma de Tiscapa', 'Managua · mirador histórico']]
    },
    nicaraguaActual: {
      title: 'Nicaragua contemporánea', dates: '1980 – Actualidad', chapter: 5,
      summary: 'Hoy Nicaragua cuida su patrimonio, su diversidad cultural y sus reservas naturales, y abre sus comunidades a un turismo que deja beneficios en el territorio.',
      facts: [
        'En 1987 se aprobó el Estatuto de Autonomía de las Regiones de la Costa Caribe.',
        'En 1990, Violeta Barrios de Chamorro se convirtió en la primera mujer elegida presidenta del país.',
        'El Güegüense es Patrimonio Oral e Inmaterial de la Humanidad desde 2005.',
        'Bosawás e Indio Maíz protegen algunos de los bosques tropicales más grandes de Centroamérica.'
      ],
      places: [['Reserva Indio Maíz', 'Río San Juan · selva'], ['Corn Island', 'Caribe Sur'], ['Laguna de Apoyo', 'Masaya · reserva natural']]
    }
  };

  var dialog = null;
  var lastTrigger = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildDialog() {
    dialog = el('dialog', 'hist-era-dialog');
    dialog.setAttribute('aria-labelledby', 'histEraDialogTitle');
    dialog.addEventListener('close', function () {
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    });
    // Clic en el fondo (fuera de la tarjeta) cierra.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    document.body.appendChild(dialog);
  }

  function render(era, image) {
    dialog.replaceChildren();
    var card = el('div', 'hist-era-dialog-card');

    var media = el('div', 'hist-era-dialog-media');
    if (image) {
      var img = el('img');
      img.src = image.src;
      img.alt = '';
      img.decoding = 'async';
      media.appendChild(img);
    }
    var close = el('button', 'hist-era-dialog-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar');
    close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    close.addEventListener('click', function () { dialog.close(); });
    var headText = el('div', 'hist-era-dialog-head');
    headText.append(el('span', 'hist-era-dialog-dates', era.dates));
    var h = el('h2', 'hist-era-dialog-title', era.title);
    h.id = 'histEraDialogTitle';
    headText.appendChild(h);
    media.append(close, headText);

    var body = el('div', 'hist-era-dialog-body');
    body.appendChild(el('p', 'hist-era-dialog-summary', era.summary));

    body.appendChild(el('h3', 'hist-era-dialog-sub', 'Datos clave'));
    var facts = el('ul', 'hist-era-dialog-facts');
    era.facts.forEach(function (fact) { facts.appendChild(el('li', null, fact)); });
    body.appendChild(facts);

    body.appendChild(el('h3', 'hist-era-dialog-sub', 'Dónde vivirlo hoy'));
    var places = el('div', 'hist-era-dialog-places');
    era.places.forEach(function (place) {
      var a = el('a', 'hist-era-dialog-place');
      a.href = 'destinos.html?q=' + encodeURIComponent(place[0]);
      a.innerHTML = '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>';
      var txt = el('span');
      txt.append(el('strong', null, place[0]), el('small', null, place[1]));
      a.appendChild(txt);
      places.appendChild(a);
    });
    body.appendChild(places);

    var actions = el('div', 'hist-era-dialog-actions');
    var listen = el('button', 'hist-era-dialog-listen');
    listen.type = 'button';
    listen.innerHTML = '<i class="fa-solid fa-headphones" aria-hidden="true"></i> <span>Escuchar en la audioguía</span>';
    listen.addEventListener('click', function () {
      var tag = document.querySelector('.hist-audio-tag[data-chapter="' + era.chapter + '"]');
      dialog.close();
      if (tag) {
        tag.scrollIntoView({ behavior: 'smooth', block: 'center' });
        tag.click();
      }
    });
    var explore = el('a', 'hist-era-dialog-explore');
    explore.href = 'destinos.html';
    explore.innerHTML = 'Explorar destinos <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    actions.append(listen, explore);
    body.appendChild(actions);

    card.append(media, body);
    dialog.appendChild(card);
  }

  function open(id, trigger) {
    var era = ERAS[id];
    if (!era) return false;
    if (!dialog) buildDialog();
    lastTrigger = trigger || null;
    var image = trigger && trigger.closest('.hist-era-card') ? trigger.closest('.hist-era-card').querySelector('img') : null;
    render(era, image);
    try {
      dialog.showModal();
    } catch (_) {
      dialog.setAttribute('open', '');
    }
    var closeBtn = dialog.querySelector('.hist-era-dialog-close');
    if (closeBtn) closeBtn.focus();
    return true;
  }

  function init() {
    var links = document.querySelectorAll('.hist-era-link[href^="#"]');
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute('href').slice(1);
      if (!ERAS[id]) return;
      link.setAttribute('role', 'button');
      link.setAttribute('aria-haspopup', 'dialog');
      link.addEventListener('click', function (event) {
        if (open(id, link)) event.preventDefault();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
