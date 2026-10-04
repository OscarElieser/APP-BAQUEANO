// ============================================================================
// 🧭 BAQUEANO — SECCIONES AMPLIADAS POR TERRITORIO (territory-rich-sections.js)
// ============================================================================
// 🎯 POR QUÉ:
// - Las guías de los territorios deben tener la profundidad de Madriz
//   (línea de tiempo, sitios emblemáticos, sabores, artesanías, música,
//   fiestas, patrimonio, naturaleza, leyendas, rutas, qué llevar, SOS y
//   código del explorador), siempre con la información del territorio
//   seleccionado y nunca con la de otro.
//
// ⚙️ CÓMO:
// - Lee window.BAQUEANO_TERRITORY_DETAILS[dept.id] (js/territories-rich-data.js)
//   y reconstruye #deptRichSections en cada cambio de territorio.
// - Una sección solo aparece si el territorio tiene datos para ella.
// - Todo el contenido se inserta con textContent (sin HTML de datos).
//
// 📦 QUÉ: window.BaqueanoTerritoryRich = { render(dept) }.
// ============================================================================
(function (window, document) {
  'use strict';

  var EXPLORER_CODE = [
    ['fa-ban', 'No extraer piedras, plantas, fósiles ni piezas arqueológicas.'],
    ['fa-handshake', 'Comprar directo a productores, artesanos y cooperativas locales.'],
    ['fa-recycle', 'Volver con toda tu basura, sobre todo los plásticos.'],
    ['fa-hands-praying', 'Respetar ceremonias, templos y tradiciones de cada comunidad.'],
    ['fa-camera', 'Pedir permiso antes de fotografiar a las personas.'],
    ['fa-person-hiking', 'Usar guías locales en volcanes, ríos, selva y áreas protegidas.']
  ];

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value == null || value === false) return;
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else node.setAttribute(key, String(value));
    });
    (children || []).forEach(function (child) {
      if (child == null || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }
  function icon(name) { return el('i', { className: 'fa-solid ' + String(name || 'fa-location-dot').split(' ')[0], 'aria-hidden': 'true' }); }
  function list(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }

  function card(number, iconName, title, subtitle, body) {
    return el('section', { className: 'dept-section-card bq-rich-card', 'aria-label': title }, [
      el('div', { className: 'dept-card-header' }, [
        icon(iconName),
        el('div', null, [
          el('h3', { text: number + '. ' + title }),
          subtitle ? el('p', { className: 'bq-rich-subtitle', text: subtitle }) : null
        ])
      ])
    ].concat(body));
  }

  function sections(dept, data) {
    var out = [];
    var n = 7; // continúa la numeración de la plantilla (1–6)
    var name = dept.name;

    var timeline = list(data.timeline);
    if (timeline.length) {
      out.push(card(n++, 'fa-timeline', 'Línea de tiempo de ' + name, 'Momentos que explican el territorio', [
        el('ol', { className: 'bq-rich-timeline' }, timeline.map(function (t, i) {
          return el('li', null, [
            el('span', { className: 'bq-rich-step', text: String(i + 1) }),
            el('div', null, [el('span', { className: 'bq-rich-period', text: t.period }), el('strong', { text: t.title }), el('p', { text: t.text })])
          ]);
        }))
      ]));
    }

    var signature = list(data.signature);
    if (signature.length) {
      out.push(card(n++, 'fa-star', 'Lugares emblemáticos de ' + name, 'Lo que hace único a ' + name, [
        el('div', { className: 'bq-rich-grid' }, signature.map(function (s) {
          return el('article', { className: 'bq-rich-feature' }, [
            el('div', { className: 'bq-rich-feature-head' }, [icon(s.icon), el('div', null, [el('h4', { text: s.title }), s.subtitle ? el('span', { text: s.subtitle }) : null])]),
            el('p', { text: s.text }),
            list(s.facts).length ? el('ul', { className: 'bq-rich-facts' }, list(s.facts).map(function (f) {
              return el('li', null, [el('strong', { text: f[0] + ': ' }), f[1]]);
            })) : null
          ]);
        }))
      ]));
    }

    var dishes = list(data.dishes);
    if (dishes.length) {
      out.push(card(n++, 'fa-bowl-food', 'Sabores de ' + name, 'Qué probar, cómo se cocina y dónde', [
        el('div', { className: 'bq-rich-table-wrap' }, [
          el('table', { className: 'bq-rich-table' }, [
            el('thead', null, [el('tr', null, ['Plato', 'Ingredientes', 'Cómo se prepara', 'Dónde probarlo'].map(function (h) { return el('th', { scope: 'col', text: h }); }))]),
            el('tbody', null, dishes.map(function (d) {
              return el('tr', null, [el('th', { scope: 'row', text: d.name }), el('td', { text: d.ingredient }), el('td', { text: d.how }), el('td', { text: d.where })]);
            }))
          ])
        ])
      ]));
    }

    var crafts = list(data.crafts);
    if (crafts.length) {
      out.push(card(n++, 'fa-hand-holding-heart', 'Artesanías de ' + name, 'Comprá directo a quien lo hace', [
        el('div', { className: 'bq-rich-grid' }, crafts.map(function (c) {
          return el('article', { className: 'bq-rich-feature' }, [
            c.tag ? el('span', { className: 'bq-rich-tag', text: c.tag }) : null,
            el('h4', { text: c.title }),
            c.community ? el('p', { className: 'bq-rich-meta' }, [icon('fa-location-dot'), ' ', c.community]) : null,
            el('p', { text: c.text })
          ]);
        }))
      ]));
    }

    if (data.music && (data.music.text || list(data.music.items).length)) {
      out.push(card(n++, 'fa-music', 'Escuchá ' + name, 'Música y tradición sonora', [
        data.music.text ? el('p', { className: 'departamento-inline-001', text: data.music.text }) : null,
        el('ul', { className: 'dept-activities-list' }, list(data.music.items).map(function (m) {
          return el('li', { className: 'dept-activity-li' }, [icon('fa-music'), el('span', null, [el('strong', { text: m.name + ': ' }), m.text])]);
        })),
        el('a', { className: 'btn-hero-secondary bq-rich-link', href: 'musica.html' }, [icon('fa-headphones'), ' Escuchar música nicaragüense'])
      ]));
    }

    var festivals = list(data.festivals);
    var heritage = list(data.heritage);
    if (festivals.length || heritage.length) {
      out.push(card(n++, 'fa-landmark', 'Fiestas y patrimonio de ' + name, 'Celebraciones y lugares declarados', [
        festivals.length ? el('div', { className: 'bq-rich-grid' }, festivals.map(function (f) {
          return el('article', { className: 'bq-rich-feature' }, [
            el('h4', { text: f.name }),
            el('p', { className: 'bq-rich-meta' }, [icon('fa-calendar-days'), ' ', [f.when, f.where].filter(Boolean).join(' · ')]),
            el('p', { text: f.text })
          ]);
        })) : null,
        heritage.length ? el('ul', { className: 'dept-activities-list bq-rich-heritage' }, heritage.map(function (h) {
          return el('li', { className: 'dept-activity-li' }, [icon('fa-building-columns'), el('span', { text: h })]);
        })) : null
      ]));
    }

    if (data.nature && (data.nature.text || list(data.nature.species).length)) {
      out.push(card(n++, 'fa-paw', 'Naturaleza viva de ' + name, 'Observá sin perturbar', [
        data.nature.text ? el('p', { className: 'departamento-inline-001', text: data.nature.text }) : null,
        el('div', { className: 'bq-rich-chips' }, list(data.nature.species).map(function (s) { return el('span', { className: 'bq-rich-chip', text: s }); }))
      ]));
    }

    var legends = list(data.legends);
    if (legends.length) {
      out.push(card(n++, 'fa-moon', 'Leyendas y tradición oral', 'Memoria popular de ' + name, [
        el('p', { className: 'bq-rich-note', text: 'Estos relatos forman parte de la memoria popular y no se presentan como hechos históricos comprobados.' }),
        el('div', { className: 'bq-rich-grid' }, legends.map(function (l) {
          return el('article', { className: 'bq-rich-feature' }, [el('h4', { text: l.title }), el('p', { text: l.text })]);
        }))
      ]));
    }

    var routes = list(data.routes);
    if (routes.length) {
      out.push(card(n++, 'fa-route', 'Viví ' + name + ', no solamente lo observés', 'Rutas sugeridas', [
        el('div', { className: 'bq-rich-grid' }, routes.map(function (r, i) {
          return el('article', { className: 'bq-rich-feature bq-rich-route' }, [
            el('span', { className: 'bq-rich-tag', text: 'Ruta ' + (i + 1) }),
            el('h4', { text: r.title }),
            el('ol', null, list(r.steps).map(function (s) { return el('li', { text: s }); }))
          ]);
        }))
      ]));
    }

    var bring = list(data.whatToBring);
    if (bring.length) {
      out.push(card(n++, 'fa-suitcase', 'Qué llevar a ' + name, 'Preparate según el clima y la actividad', [
        el('ul', { className: 'dept-activities-list' }, bring.map(function (b) {
          return el('li', { className: 'dept-activity-li' }, [icon('fa-circle-check'), el('span', { text: b })]);
        }))
      ]));
    }

    out.push(card(n++, 'fa-triangle-exclamation', 'Seguridad y SOS ' + name, 'Emergencias en el territorio', [
      el('ul', { className: 'dept-activities-list' }, [
        data.sos && data.sos.hospital ? el('li', { className: 'dept-activity-li' }, [icon('fa-hospital'), el('span', null, [el('strong', { text: 'Hospital de referencia: ' }), data.sos.hospital])]) : null,
        el('li', { className: 'dept-activity-li' }, [icon('fa-shield'), el('span', { text: 'Policía Nacional: 118' })]),
        el('li', { className: 'dept-activity-li' }, [icon('fa-truck-medical'), el('span', { text: 'Ambulancia / Cruz Roja: 128' })]),
        el('li', { className: 'dept-activity-li' }, [icon('fa-fire-extinguisher'), el('span', { text: 'Bomberos: 115' })])
      ]),
      el('button', { type: 'button', className: 'btn-hero-primary bq-rich-link', 'data-rich-sos': '1' }, [icon('fa-tower-broadcast'), ' Abrir Centro SOS'])
    ]));

    out.push(card(n++, 'fa-leaf', 'Código del Explorador', 'Visitá ' + name + ' cuidando su gente y su naturaleza', [
      el('ul', { className: 'dept-activities-list' }, EXPLORER_CODE.map(function (c) {
        return el('li', { className: 'dept-activity-li' }, [icon(c[0]), el('span', { text: c[1] })]);
      }))
    ]));

    return out;
  }

  function render(dept) {
    var host = document.getElementById('deptRichSections');
    if (!host || !dept) return;
    var all = window.BAQUEANO_TERRITORY_DETAILS || {};
    var data = all[dept.id];
    if (!data) { host.replaceChildren(); host.hidden = true; return; }
    host.replaceChildren.apply(host, sections(dept, data));
    host.hidden = false;
    var sos = host.querySelector('[data-rich-sos]');
    if (sos) sos.addEventListener('click', function (event) {
      if (typeof window.bqOpenSos === 'function') window.bqOpenSos(event);
    });
  }

  window.BaqueanoTerritoryRich = { render: render };
})(window, document);
