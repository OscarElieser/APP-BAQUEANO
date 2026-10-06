// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR DE MI VIAJE (mi-viaje-interactions.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Hacer completamente funcionales todos los botones del Planificador de Viaje:
//   "Ver en mapa", "Guardar", "Editar día", "Modificar con IA", "Guardar en Mi Viaje",
//   "Compartir ruta", "Descargar PDF", "Generar QR", "Reservar todo", pestañas del
//   mapa y acciones de tarjetas de recomendaciones verificadas.
// - Garantizar persistencia local en localStorage sin depender de conexión.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estado central del viaje en localStorage bajo la clave 'baqueano_trip'.
// - Funciones puras con try/catch defensivo para evitar crashes ante datos corruptos.
// - Toasts de retroalimentación visual accesibles con aria-live.
// - Integración con mapa Leaflet embebido para "Ver en mapa".
// - Generación de PDF vía window.print() con hoja de estilos temporal dedicada.
// - Generación de código QR vía API pública qrserver.com sin dependencias npm.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES):
// - viewOnMap(), saveDay(), editDay(), saveEditModal(), closeEditModal(),
//   modifyWithAI(), saveTrip(), shareRoute(), downloadPDF(), generateQR(),
//   reserveAll(), viewDetail(), contactRec(), reserveRec(), switchMapTab()
// ============================================================================

(function BaqueanoMiViaje() {
  'use strict';

  // ─── Estado Central ────────────────────────────────────────────────────────
  var STORAGE_KEY = 'baqueano_trip';

  function loadTrip() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultTrip(); }
    catch (e) { return defaultTrip(); }
  }

  function persistTrip(t) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch (e) {}
  }

  function defaultTrip() {
    return {
      name: 'Mi Aventura por Nicaragua',
      saved: false,
      days: [
        { id: 1, badge: 'Día 1 · Llegada & Ciudad Colonial', location: 'Granada Colonial',
          title: 'Granada colonial y atardecer en las Isletas',
          desc: 'Recorrido a pie por la Plaza de la Independencia, ascenso a la torre de La Merced para fotografía panorámica y paseo en lancha con pescador local por las 365 Isletas del Cocibolca.',
          extra: '🍽️ Comida: Vigorón en el kiosco de Doña Rosa · 🏨 Hospedaje: Hotel Colonial céntrico',
          cost: 'C$ 1,800 (USD 49)', km: 45, hours: 6, lat: 11.9344, lng: -85.9560, saved: false },
        { id: 2, badge: 'Día 2 · Aventura Volcánica', location: 'Masaya & Sandboarding',
          title: 'Lago de lava en Volcán Masaya y artesanías de Monimbó',
          desc: 'Visita al Parque Nacional Volcán Masaya para contemplar los gases del Cráter Santiago. Almuerzo en el Mercado de Artesanías y compra de hamacas tejidas a mano.',
          extra: '☕ Merienda: Tiste frío con buñuelos en miel de Masaya',
          cost: 'C$ 2,200 (USD 60)', km: 120, hours: 9, lat: 11.9843, lng: -86.1613, saved: false },
        { id: 3, badge: 'Día 3 · Oasis de Fuego y Agua', location: 'Isla de Ometepe',
          title: 'Ferry a Ometepe, Ojo de Agua y senderismo en Finca Magdalena',
          desc: 'Cruce lacustre desde San Jorge hasta Moyogalpa. Baño en el manantial Ojo de Agua y caminata por los cafetales de la cooperativa comunitaria Finca Magdalena.',
          extra: '🌿 Impacto local: Apoyo directo a la cooperativa cafetalera campesina',
          cost: 'C$ 2,500 (USD 68)', km: 110, hours: 8, lat: 11.4946, lng: -85.6156, saved: false }
      ]
    };
  }

  var trip = loadTrip();

  // ─── Escape ────────────────────────────────────────────────────────────────
  function esc(val) {
    return String(val || '').replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function toast(msg, type) {
    type = type || 'success';
    var colors = { success: '#4A7A5A', info: '#165D6F', warning: '#F65E01', error: '#EF4444' };
    var icons  = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
    var box = document.getElementById('bqToastBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bqToastBox';
      box.setAttribute('aria-live', 'polite');
      box.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(box);
    }
    var t = document.createElement('div');
    t.style.cssText = 'background:#0F172A;color:#FFF;border-left:4px solid ' + colors[type] + ';' +
      'padding:13px 18px;border-radius:10px;font-size:0.88rem;font-weight:600;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.45);display:flex;align-items:center;gap:10px;' +
      'min-width:240px;max-width:320px;font-family:Inter,system-ui,sans-serif;' +
      'animation:bqSlideIn .3s ease;pointer-events:auto;';
    t.innerHTML = '<span style="font-size:1rem">' + icons[type] + '</span><span>' + msg + '</span>';
    if (!document.getElementById('bqToastCSS')) {
      var s = document.createElement('style');
      s.id = 'bqToastCSS';
      s.textContent = '@keyframes bqSlideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}' +
        '@keyframes bqSlideOut{from{opacity:1}to{opacity:0;transform:translateX(16px)}}';
      document.head.appendChild(s);
    }
    box.appendChild(t);
    setTimeout(function() {
      t.style.animation = 'bqSlideOut .3s ease forwards';
      setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 320);
    }, 3200);
  }

  // ─── Render Itinerario ─────────────────────────────────────────────────────
  window.loadDemoTrip = function() {
    trip = defaultTrip();
    trip.saved = true;
    persistTrip(trip);
    renderItinerary();
    renderWeather();
    toast('¡Itinerario demostrativo cargado con éxito! 🎒');
  };

  window.clearTrip = function() {
    trip = { name: 'Mi Aventura por Nicaragua', saved: false, days: [] };
    persistTrip(trip);
    renderItinerary();
    toast('Itinerario vaciado. Comenzá a armar tu nueva ruta.', 'info');
  };

  function renderItinerary() {
    var c = document.getElementById('itineraryDaysContainer');
    if (!c) return;

    if (!trip.days || trip.days.length === 0) {
      c.innerHTML =
        '<div style="background:rgba(255,255,255,0.03);border:1.5px dashed rgba(244,230,193,0.25);border-radius:18px;padding:48px 24px;text-align:center;margin-bottom:24px;">' +
          '<div style="font-size:3rem;margin-bottom:12px;">🎒</div>' +
          '<h3 style="font-family:Montserrat,sans-serif;color:#FFF;font-size:1.25rem;font-weight:800;margin:0 0 8px">Todavía no tenés un viaje guardado</h3>' +
          '<p style="color:#94A3B8;max-width:540px;margin:0 auto 24px;font-size:.9rem;line-height:1.6">' +
            'Descubrí los 17 territorios de Nicaragua, elegí tus atractivos favoritos o dejá que Baqueano Digital planifique una ruta a tu medida según tu presupuesto y días disponibles.' +
          '</p>' +
          '<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">' +
            '<a href="destinos.html" style="background:#165D6F;color:#FFF;padding:11px 22px;border-radius:10px;font-weight:700;font-family:Montserrat,sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px">' +
              '<i class="fa-solid fa-mountain-sun"></i> Explorar destinos</a>' +
            '<a href="baqueano-ia.html" style="background:#F65E01;color:#FFF;padding:11px 22px;border-radius:10px;font-weight:700;font-family:Montserrat,sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px">' +
              '<i class="fa-solid fa-wand-magic-sparkles"></i> Planificar con Baqueano Digital</a>' +
            '<button type="button" onclick="loadDemoTrip()" style="background:rgba(255,255,255,.08);color:#F4E6C1;border:1px solid rgba(255,255,255,.18);padding:11px 18px;border-radius:10px;font-weight:600;cursor:pointer">' +
              'Cargar viaje demostrativo</button>' +
          '</div>' +
        '</div>';
      return;
    }

    c.innerHTML = trip.days.map(function(d) {
      return '<div class="itinerary-day-card" id="dayCard-' + d.id + '">' +
        '<div class="itinerary-day-head">' +
          '<span class="itinerary-day-badge">' + esc(d.badge) + '</span>' +
          '<span class="day-location-label"><i class="fa-solid fa-location-dot"></i> ' + esc(d.location) + '</span>' +
        '</div>' +
        '<h4 style="font-family:Montserrat,sans-serif;font-size:1rem;font-weight:700;color:#0B253A;margin:0 0 8px">' + esc(d.title) + '</h4>' +
        '<p style="font-size:.85rem;color:#475569;margin:0 0 10px">' + esc(d.desc) + '</p>' +
        '<div class="day-extra-tag">' + esc(d.extra) + '</div>' +
        '<div class="day-stats-row">' +
          '<span class="day-stat"><i class="fa-solid fa-car"></i> ' + d.km + ' km</span>' +
          '<span class="day-stat"><i class="fa-regular fa-clock"></i> ' + d.hours + ' h</span>' +
          '<span class="day-stat">Costo est.: <strong>' + esc(d.cost) + '</strong></span>' +
        '</div>' +
        '<div class="viaje-action-row">' +
          '<button type="button" class="btn-day-map" onclick="viewOnMap(' + d.id + ')">' +
            '<i class="fa-solid fa-map-location-dot"></i> Ver en mapa</button>' +
          '<button type="button" class="btn-day-save' + (d.saved ? ' saved' : '') + '" id="saveBtn-' + d.id + '" onclick="saveDay(' + d.id + ',this)">' +
            '<i class="fa-' + (d.saved ? 'solid' : 'regular') + ' fa-heart"></i> ' + (d.saved ? 'Guardado' : 'Guardar') + '</button>' +
          '<button type="button" class="btn-day-edit" onclick="removeDay(' + d.id + ')">' +
            '<i class="fa-solid fa-trash-can"></i> Eliminar día</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ─── Clima ─────────────────────────────────────────────────────────────────
  function renderWeather() {
    var el = document.getElementById('weatherWidget');
    if (!el) return;
    el.innerHTML =
      '<div class="weather-card">' +
        '<div class="weather-header"><i class="fa-solid fa-cloud-sun" style="color:#F65E01"></i><strong>Clima en tu ruta</strong></div>' +
        '<div class="weather-main"><span class="weather-icon">🌤️</span>' +
          '<div><div class="weather-city">Granada 28°C</div><div class="weather-cond">Parcialmente nublado</div></div></div>' +
        '<div class="weather-forecast">' +
          '<div class="forecast-day"><span>Vie.</span><strong>29°</strong></div>' +
          '<div class="forecast-day"><span>Sáb.</span><strong>30°</strong></div>' +
          '<div class="forecast-day"><span>Dom.</span><strong>29°</strong></div>' +
        '</div>' +
      '</div>';
  }

  // ─── Acciones de los botones ───────────────────────────────────────────────

  window.viewOnMap = function(dayId) {
    var day = null;
    for (var i = 0; i < trip.days.length; i++) { if (trip.days[i].id === dayId) { day = trip.days[i]; break; } }
    if (!day) return;
    try { sessionStorage.setItem('baqueano_map_focus', JSON.stringify({ lat: day.lat, lng: day.lng, title: day.title })); } catch(e) {}
    toast('Abriendo mapa → ' + day.location, 'info');
    window.open('https://www.google.com/maps/search/?api=1&query=' + day.lat + ',' + day.lng, '_blank', 'noopener');
  };

  window.saveDay = function(dayId, btn) {
    var day = null;
    for (var i = 0; i < trip.days.length; i++) { if (trip.days[i].id === dayId) { day = trip.days[i]; break; } }
    if (!day) return;
    day.saved = !day.saved;
    persistTrip(trip);
    if (day.saved) {
      btn.innerHTML = '<i class="fa-solid fa-heart"></i> Guardado';
      btn.classList.add('saved');
      toast(day.location + ' guardado en favoritos ❤️');
      try {
        var favs = JSON.parse(localStorage.getItem('baqueano_favorites') || '[]');
        var exists = false;
        for (var j = 0; j < favs.length; j++) { if (favs[j].id === 'day-' + dayId) { exists = true; break; } }
        if (!exists) favs.push({ id: 'day-' + dayId, type: 'itinerary', title: day.title, location: day.location });
        localStorage.setItem('baqueano_favorites', JSON.stringify(favs));
      } catch(e) {}
    } else {
      btn.innerHTML = '<i class="fa-regular fa-heart"></i> Guardar';
      btn.classList.remove('saved');
      toast(day.location + ' eliminado de favoritos', 'info');
    }
  };

  window.removeDay = function(dayId) {
    var day = null;
    for (var i = 0; i < trip.days.length; i++) {
      if (trip.days[i].id === dayId) { day = trip.days[i]; break; }
    }
    if (!day) return;
    var accepted = window.confirm('¿Eliminar ' + day.badge + ' de este viaje? El resto del itinerario se conservará.');
    if (!accepted) return;
    trip.days = trip.days.filter(function(item) { return item.id !== dayId; });
    persistTrip(trip);
    renderItinerary();
    toast(day.badge + ' eliminado del viaje.', 'info');
  };

  window.editDay = function(dayId) {
    var day = null;
    for (var i = 0; i < trip.days.length; i++) { if (trip.days[i].id === dayId) { day = trip.days[i]; break; } }
    if (!day) return;
    var modal = document.getElementById('editDayModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'editDayModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';
      document.body.appendChild(modal);
    }
    modal.innerHTML =
      '<div style="background:#FFF;border-radius:18px;padding:28px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">' +
          '<h3 style="font-family:Montserrat,sans-serif;font-size:1rem;font-weight:800;color:#0B253A;margin:0">✏️ Editar ' + esc(day.badge) + '</h3>' +
          '<button onclick="closeEditModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#64748B">×</button>' +
        '</div>' +
        '<label style="display:block;margin-bottom:12px"><span style="font-size:.78rem;font-weight:700;color:#64748B;display:block;margin-bottom:5px">TÍTULO</span>' +
          '<input id="editDayTitle" type="text" value="' + esc(day.title) + '" style="width:100%;border:1.5px solid #E2E8F0;border-radius:8px;padding:9px 13px;font-size:.9rem;box-sizing:border-box;font-family:Inter,sans-serif" oninput="this.style.borderColor=\'#165D6F\'"></label>' +
        '<label style="display:block;margin-bottom:12px"><span style="font-size:.78rem;font-weight:700;color:#64748B;display:block;margin-bottom:5px">DESCRIPCIÓN</span>' +
          '<textarea id="editDayDesc" rows="4" style="width:100%;border:1.5px solid #E2E8F0;border-radius:8px;padding:9px 13px;font-size:.9rem;resize:vertical;box-sizing:border-box;font-family:Inter,sans-serif" oninput="this.style.borderColor=\'#165D6F\'">' + esc(day.desc) + '</textarea></label>' +
        '<label style="display:block;margin-bottom:18px"><span style="font-size:.78rem;font-weight:700;color:#64748B;display:block;margin-bottom:5px">NOTA PERSONAL</span>' +
          '<input id="editDayExtra" type="text" value="' + esc(day.extra) + '" style="width:100%;border:1.5px solid #E2E8F0;border-radius:8px;padding:9px 13px;font-size:.9rem;box-sizing:border-box;font-family:Inter,sans-serif" oninput="this.style.borderColor=\'#165D6F\'"></label>' +
        '<div style="display:flex;gap:10px">' +
          '<button onclick="saveEditModal(' + day.id + ')" style="flex:1;background:#F65E01;color:#FFF;border:none;padding:11px;border-radius:10px;font-weight:700;font-size:.9rem;cursor:pointer;font-family:Montserrat,sans-serif">Guardar cambios</button>' +
          '<button onclick="closeEditModal()" style="background:#F1F5F9;color:#475569;border:none;padding:11px 18px;border-radius:10px;font-weight:600;cursor:pointer">Cancelar</button>' +
        '</div>' +
      '</div>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function() { var ti = document.getElementById('editDayTitle'); if (ti) ti.focus(); }, 80);
  };

  window.saveEditModal = function(dayId) {
    var day = null;
    for (var i = 0; i < trip.days.length; i++) { if (trip.days[i].id === dayId) { day = trip.days[i]; break; } }
    if (!day) return;
    var ti = document.getElementById('editDayTitle');
    var de = document.getElementById('editDayDesc');
    var ex = document.getElementById('editDayExtra');
    if (ti && ti.value.trim()) day.title = ti.value.trim();
    if (de && de.value.trim()) day.desc = de.value.trim();
    if (ex && ex.value.trim()) day.extra = ex.value.trim();
    persistTrip(trip);
    window.closeEditModal();
    renderItinerary();
    toast('Jornada actualizada correctamente ✨');
  };

  window.closeEditModal = function() {
    var m = document.getElementById('editDayModal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.modifyWithAI = function() {
    toast('Abriendo Baqueano Digital IA...', 'info');
    setTimeout(function() { window.location.href = 'baqueano-ia.html'; }, 850);
  };

  window.saveTrip = function(btn) {
    trip.saved = true;
    persistTrip(trip);
    if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado'; btn.disabled = true; btn.style.background = '#4A7A5A'; }
    toast('Ruta guardada y disponible sin conexión 🗺️');
  };

  window.shareRoute = function() {
    var text = '🗺️ Mi ruta BAQUEANO Nicaragua:\n' +
      trip.days.map(function(d) { return '• ' + d.badge + ': ' + d.title; }).join('\n') +
      '\n\n🌿 Sin intermediarios · baqueanonicaragua.com';
    window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + window.location.href), '_blank', 'noopener,noreferrer');
    toast('Abriendo WhatsApp para compartir la ruta', 'info');
    return;
    if (navigator.share) {
      navigator.share({ title: trip.name, text: text, url: window.location.href })
        .then(function() { toast('Ruta compartida 🚀'); })
        .catch(function() { copyText(text); });
    } else { copyText(text); }
  };

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { toast('Copiado al portapapeles 📋'); })
        .catch(function() { toast('No se pudo copiar', 'warning'); });
    } else { toast('Compartir no disponible en este navegador', 'warning'); }
  }

  window.downloadPDF = function() {
    toast('Preparando PDF...', 'info');
    var s = document.createElement('style');
    s.id = 'bq-print';
    s.media = 'print';
    s.textContent = 'body *{visibility:hidden!important}#printableItinerary,#printableItinerary *{visibility:visible!important}#printableItinerary{position:fixed!important;top:0;left:0;width:100%;padding:20px}.viaje-action-row,.route-action-btns,.map-section-wrap,.recommendations-section,.weather-section{display:none!important}';
    document.head.appendChild(s);
    setTimeout(function() {
      window.print();
      setTimeout(function() { var el = document.getElementById('bq-print'); if (el) el.parentNode.removeChild(el); }, 1200);
    }, 500);
  };

  window.generateQR = function() {
    var url = encodeURIComponent(window.location.href);
    var qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + url;
    var m = document.getElementById('bqQRModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'bqQRModal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10001;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
      m.addEventListener('click', function(e) { if (e.target === m) m.style.display = 'none'; });
      document.body.appendChild(m);
    }
    m.innerHTML = '<div style="background:#0F172A;border-radius:20px;padding:28px;text-align:center;max-width:290px;width:100%;color:#FFF;box-shadow:0 20px 60px rgba(0,0,0,.5)">' +
      '<h3 style="font-family:Montserrat,sans-serif;margin:0 0 14px;font-size:1rem">📲 Código QR de tu Ruta</h3>' +
      '<img src="' + qrSrc + '" alt="QR Ruta" style="width:200px;height:200px;border-radius:12px;background:#FFF;padding:8px;display:block;margin:0 auto 14px">' +
      '<p style="font-size:.78rem;color:#94A3B8;margin:0 0 14px">Escaneá para abrir en otro dispositivo</p>' +
      '<button onclick="document.getElementById(\'bqQRModal\').style.display=\'none\'" style="background:#F65E01;color:#FFF;border:none;padding:10px 22px;border-radius:10px;font-weight:700;cursor:pointer">Cerrar</button>' +
    '</div>';
    m.style.display = 'flex';
    toast('Código QR generado 📲');
  };

  window.reserveAll = function() {
    var summary = trip.days.map(function(d) { return d.badge + ': ' + d.title; }).join('\n');
    window.open('https://wa.me/50588888888?text=' + encodeURIComponent('Hola, deseo coordinar las reservas de mi ruta BAQUEANO:\n' + summary), '_blank', 'noopener,noreferrer');
    toast('Abriendo atención por WhatsApp', 'info');
    return;
    toast('Redirigiendo a Red de Aliados BAQUEANO...', 'info');
    setTimeout(function() { window.location.href = 'aliados.html'; }, 850);
  };

  window.viewDetail = function(name) {
    toast('Abriendo detalle de ' + (name || 'destino') + '...', 'info');
    setTimeout(function() { window.location.href = 'destinos.html'; }, 800);
  };

  window.contactRec = function(name) {
    var ally = name || 'aliado';
    window.open('https://wa.me/50588888888?text=' + encodeURIComponent('Hola, deseo contactar a ' + ally + ' desde BAQUEANO.'), '_blank', 'noopener,noreferrer');
    toast('Abriendo contacto con ' + ally, 'info');
    return;
    toast('Conectando con ' + (name || 'aliado') + '...', 'info');
    setTimeout(function() { window.location.href = 'nosotros.html#contacto'; }, 800);
  };

  window.reserveRec = function(name) {
    var ally = name || 'aliado';
    window.open('https://wa.me/50588888888?text=' + encodeURIComponent('Hola, deseo reservar ' + ally + ' desde BAQUEANO.'), '_blank', 'noopener,noreferrer');
    toast('Abriendo reserva con ' + ally, 'info');
    return;
    toast('Iniciando reserva con ' + (name || 'aliado') + ' ✅');
    setTimeout(function() { window.location.href = 'mi-negocio.html'; }, 900);
  };

  // ─── Tabs del Mapa ─────────────────────────────────────────────────────────
  window.switchMapTab = function(tabId, el) {
    document.querySelectorAll('.map-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.map-tab-panel').forEach(function(p) { p.classList.remove('active'); });
    if (el) el.classList.add('active');
    var panel = document.getElementById('mapPanel' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (panel) panel.classList.add('active');
    if (tabId === 'mapa') initLeafletMap();
  };

  // ─── Mapa Leaflet (Carga Dinámica Bajo Demanda) ───────────────────────────
  var bqMap = null;

  function initLeafletMap() {
    if (bqMap) { try { bqMap.invalidateSize(); } catch(e) {} return; }
    var el = document.getElementById('leafletMapContainer');
    if (!el) return;

    if (typeof L === 'undefined') {
      if (!document.getElementById('bq-leaflet-css')) {
        var link = document.createElement('link');
        link.id = 'bq-leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
      }
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = initLeafletMap;
      document.body.appendChild(script);
      return;
    }

    bqMap = L.map('leafletMapContainer', { scrollWheelZoom: false }).setView([12.1, -86.2], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 18
    }).addTo(bqMap);
    var seenSpots = {};
    trip.days.forEach(function(day) {
      // Días en el mismo lugar: el pin se desplaza para que cada uno se pueda tocar (WCAG 2.5.8).
      var spot = day.lat.toFixed(4) + ',' + day.lng.toFixed(4);
      var stacked = seenSpots[spot] || 0;
      seenSpots[spot] = stacked + 1;
      var icon = L.divIcon({
        className: '',
        html: '<div style="background:#F65E01;color:#FFF;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;box-shadow:0 2px 8px rgba(246,94,1,.5);border:2px solid #FFF">' + day.id + '</div>',
        iconSize: [34, 34], iconAnchor: [17 - stacked * 38, 34]
      });
      L.marker([day.lat, day.lng], { icon: icon }).addTo(bqMap)
        .bindPopup('<strong>Día ' + day.id + '</strong><br>' + day.location + '<br><small>' + day.title + '</small>');
    });
    var coords = trip.days.map(function(d) { return [d.lat, d.lng]; });
    L.polyline(coords, { color: '#F65E01', weight: 3, opacity: .7, dashArray: '8 6' }).addTo(bqMap);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    trip = loadTrip();
    renderItinerary();
    renderWeather();
    var activeMap = document.querySelector('.map-tab-btn.active');
    if (activeMap && activeMap.getAttribute('data-tab') === 'mapa') initLeafletMap();
  });

})();
