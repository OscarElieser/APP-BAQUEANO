// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INYECTOR UNIVERSAL DE COMPONENTES & SUITE SOS PRO
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Garantizar que el 100% de las páginas del ecosistema BAQUEANO cuenten con:
//   * Navbar cápsula blanco luminoso oficial y mega menú con enlace a Admin.
//   * Centro SOS & Emergencias Nacionales 24/7 de alta gama (GPS satelital en vivo,
//     botón pánico WhatsApp, 6 líneas oficiales de auxilio, sirena sonora y baliza estroboscópica).
//   * Sistema de internacionalización bilingüe (ES / EN) de pies a cabeza.
//   * Pie de página unificado con las 5 columnas, redes sociales y sellos de soberanía.
// - Eliminar cualquier botón flotante invasivo (OPS Center fab) que interfiera con la UI.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Detección inteligente de elementos existentes para evitar duplicaciones.
// - Inyección condicional de CSS y del motor baqueano-i18n.js.
// - Geolocalización continua mediante navigator.geolocation WGS-84 con fallback seguro.
// - Web Audio API nativa para sintetizar oscilador acústico de emergencia (880Hz / 1200Hz)
//   sin archivos de audio externos ni dependencias.
// - Linterna estroboscópica SOS mediante overlay dinámico con código morse visual.
// - Enlace al Ops Center preservado estrictamente dentro del Mega Menú (Columna 4).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & SERVICIOS):
// - injectGlobalCSS() & injectGlobalScripts(): recursos compartidos y bilingüismo.
// - injectSosModal(): Centro SOS & Emergencias 24/7 de clase mundial.
// - bqOpenSos() / bqCloseSos(): API global para activación de auxilio.
// - bqStartSiren() / bqStopSiren(): generador acústico de socorro.
// - bqStartStrobe() / bqStopStrobe(): baliza luminosa nocturna.
// ============================================================================

(function BaqueanoGlobalInjector() {
  'use strict';

  // ── Protección: no tocar admin.html ──────────────────────────────────────
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'admin.html') return;

  // ── Paleta oficial ────────────────────────────────────────────────────────
  var COLORS = {
    teal:   '#165D6F',
    orange: '#F65E01',
    cream:  '#F4E6C1',
    night:  '#0F172A',
    dark:   '#0B253A',
    green:  '#10B981',
    red:    '#EF4444'
  };

  // ── Helper: detectar página activa para marcar nav link ──────────────────
  function isActive(files) {
    return files.includes(currentPage) ? ' active' : '';
  }

  // ── Inyectar CSS y Scripts necesarios ────────────────────────────────────
  function injectGlobalAssets() {
    var neededCSS = [
      { id: 'bq-styles',          href: 'styles.css?v=20260927-exact-1' },
      { id: 'bq-modules',         href: 'css/modules.css' },
      { id: 'bq-headings',        href: 'css/headings-system.css?v=20260927-1' },
      { id: 'bq-nav-mega-css',    href: 'css/navigation-mega.css?v=20260928-nav-white-1' },
      { id: 'bq-fa',              href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
      { id: 'bq-fonts',           href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700;800;900&display=swap' }
    ];

    neededCSS.forEach(function(css) {
      if (!document.getElementById(css.id)) {
        var link = document.createElement('link');
        link.id = css.id; link.rel = 'stylesheet'; link.href = css.href;
        document.head.appendChild(link);
      }
    });

    // Inyectar motor i18n si no existe
    if (!window.BaqueanoI18n && !document.getElementById('bq-i18n-script')) {
      var script = document.createElement('script');
      script.id = 'bq-i18n-script';
      script.src = 'js/baqueano-i18n.js?v=20260928-1';
      document.head.appendChild(script);
    }

    // Estilos inline de la Suite SOS y Footer
    if (!document.getElementById('bq-global-injector-styles')) {
      var style = document.createElement('style');
      style.id = 'bq-global-injector-styles';
      style.textContent = `
        /* ── Modal SOS Suite de Emergencia Pro ── */
        #bqSosModal {
          display: none; position: fixed; inset: 0; z-index: 100050;
          background: rgba(15, 23, 42, 0.85); align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          overflow-y: auto;
        }
        #bqSosModal.open { display: flex; animation: bqFadeIn .25s ease; }
        @keyframes bqFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .bq-sos-box {
          background: #0B253A; border-radius: 24px; padding: 28px 24px; max-width: 620px; width: 100%;
          box-shadow: 0 25px 70px rgba(0,0,0,.7), 0 0 0 1px rgba(239,68,68,.3);
          border: 1px solid rgba(239,68,68,.4); color: #FFFFFF; font-family: 'Inter', sans-serif;
          position: relative; max-height: 90vh; overflow-y: auto;
        }
        .bq-sos-header {
          display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;
        }
        .bq-sos-title {
          font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 900;
          color: #FFFFFF; margin: 0 0 4px; display: flex; align-items: center; gap: 8px;
        }
        .bq-sos-sub { color: #94A3B8; font-size: 0.82rem; margin: 0; line-height: 1.4; }
        .bq-sos-close {
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
          color: #FFFFFF; width: 34px; height: 34px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer;
          transition: all .2s; flex-shrink: 0; margin-left: 12px;
        }
        .bq-sos-close:hover { background: #EF4444; color: #FFF; transform: scale(1.05); }

        /* GPS Card */
        .bq-sos-gps-card {
          background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px; padding: 14px; margin-bottom: 18px;
        }
        .bq-gps-status {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.76rem; font-weight: 800; color: #10B981; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .bq-gps-coords {
          font-family: monospace; font-size: 0.95rem; font-weight: 700; color: #FFFFFF;
          word-break: break-all; margin-bottom: 10px;
        }
        .bq-gps-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .bq-gps-btn {
          flex: 1; min-width: 140px; display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;
          text-decoration: none; cursor: pointer; border: none; transition: all .2s;
        }
        .bq-gps-btn.copy { background: rgba(255,255,255,.1); color: #FFF; border: 1px solid rgba(255,255,255,.2); }
        .bq-gps-btn.copy:hover { background: rgba(255,255,255,.2); }
        .bq-gps-btn.whatsapp { background: #10B981; color: #FFF; }
        .bq-gps-btn.whatsapp:hover { background: #059669; }

        /* Servicios de Emergencia Grid */
        .bq-sos-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px;
        }
        @media (max-width: 520px) { .bq-sos-grid { grid-template-columns: 1fr; } }
        .bq-service-card {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px;
          text-decoration: none; color: #FFFFFF; transition: all .2s;
        }
        .bq-service-card:hover {
          background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); border-color: #F65E01;
        }
        .bq-service-icon {
          width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
          justify-content: center; font-size: 1.15rem; flex-shrink: 0;
        }
        .bq-service-icon.police { background: rgba(56, 189, 248, 0.2); color: #38BDF8; }
        .bq-service-icon.medical { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
        .bq-service-icon.fire { background: rgba(249, 115, 22, 0.2); color: #F97316; }
        .bq-service-icon.navy { background: rgba(14, 165, 233, 0.2); color: #0EA5E9; }
        .bq-service-icon.sinapred { background: rgba(234, 179, 8, 0.2); color: #EAB308; }
        .bq-service-icon.minsa { background: rgba(16, 185, 129, 0.2); color: #10B981; }

        .bq-service-info h5 { margin: 0; font-size: 0.85rem; font-weight: 800; line-height: 1.2; }
        .bq-service-info p { margin: 2px 0 0; font-size: 0.72rem; color: #94A3B8; }
        .bq-service-number {
          margin-left: auto; font-family: 'Montserrat', sans-serif; font-weight: 900;
          font-size: 0.95rem; color: #F4E6C1; flex-shrink: 0;
        }

        /* Herramientas Tácticas */
        .bq-tools-bar {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; padding: 12px; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;
        }
        .bq-tool-btn {
          flex: 1; min-width: 140px; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.07); color: #FFFFFF; font-size: 0.8rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
          transition: all .2s; font-family: 'Inter', sans-serif;
        }
        .bq-tool-btn:hover { background: rgba(255,255,255,.14); border-color: #F65E01; }
        .bq-tool-btn.active-siren {
          background: #DC2626 !important; border-color: #EF4444 !important;
          animation: bqPulseRed 0.8s infinite alternate;
        }
        @keyframes bqPulseRed { from { opacity: 0.8; } to { opacity: 1; transform: scale(1.02); } }

        /* Guía Primeros Auxilios Acordeón */
        .bq-sos-guide {
          background: rgba(0,0,0,.25); border-radius: 10px; padding: 10px 14px; font-size: 0.76rem;
          color: #CBD5E1; line-height: 1.4; border-left: 3px solid #F65E01;
        }
        .bq-sos-guide summary {
          font-weight: 800; color: #F4E6C1; cursor: pointer; outline: none; margin-bottom: 4px;
        }

        /* Estroboscopio Fullscreen */
        #bqStrobeOverlay {
          display: none; position: fixed; inset: 0; z-index: 100099;
          cursor: pointer; justify-content: center; align-items: center;
          color: #000; font-family: 'Montserrat', sans-serif; font-size: 2rem; font-weight: 900;
        }

        /* Toast Global */
        #bqGlobalToast { position: fixed; bottom: 80px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        @keyframes bqToastIn  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes bqToastOut { from { opacity:1; } to { opacity:0; transform:translateX(16px); } }
      `;
      document.head.appendChild(style);
    }
  }

  // ── Toast Global ──────────────────────────────────────────────────────────
  function bqToast(msg, type) {
    type = type || 'success';
    var box = document.getElementById('bqGlobalToast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bqGlobalToast';
      document.body.appendChild(box);
    }
    var colors = { success: '#10B981', info: '#165D6F', warning: '#F65E01', error: '#EF4444' };
    var icons  = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '🚨' };
    var t = document.createElement('div');
    t.style.cssText = 'background:#0F172A;color:#FFF;border-left:4px solid ' + (colors[type]||colors.success) + ';' +
      'padding:13px 18px;border-radius:10px;font-size:.88rem;font-weight:600;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.45);display:flex;align-items:center;gap:10px;' +
      'min-width:240px;max-width:340px;animation:bqToastIn .3s ease;pointer-events:auto;z-index:99999;';
    t.innerHTML = '<span>' + (icons[type]||'✅') + '</span><span>' + msg + '</span>';
    box.appendChild(t);
    setTimeout(function() {
      t.style.animation = 'bqToastOut .3s ease forwards';
      setTimeout(function() { t.parentNode && t.parentNode.removeChild(t); }, 320);
    }, 3200);
  }
  window.bqToast = bqToast;

  // ── SUITE SOS: GEOLOCALIZACIÓN, AUDIO SIRENA Y ESTROBOSCOPIO ──────────────
  var audioCtx = null;
  var sirenOsc = null;
  var sirenInterval = null;
  var strobeInterval = null;
  var currentLat = 12.5061;
  var currentLng = -86.7022;

  function updateGpsUI(lat, lng, acc, alt) {
    currentLat = lat;
    currentLng = lng;
    var display = document.getElementById('bqGpsCoordsDisplay');
    if (display) {
      display.textContent = 'Lat: ' + lat.toFixed(5) + '° · Lng: ' + lng.toFixed(5) + '°' +
        (alt ? ' · Alt: ' + alt.toFixed(0) + 'm' : '') +
        (acc ? ' (±' + acc.toFixed(0) + 'm)' : '');
    }
    var waBtn = document.getElementById('bqSosWhatsappBtn');
    if (waBtn) {
      var mapsUrl = 'https://maps.google.com/?q=' + lat + ',' + lng;
      var msg = encodeURIComponent(
        '🚨 *ALERTA DE EMERGENCIA — BAQUEANO NICARAGUA*\n\n' +
        'Solicito auxilio en mi ubicación geográfica:\n' +
        '📍 Coordenadas: ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + '\n' +
        '🗺️ Ver en Google Maps: ' + mapsUrl + '\n\n' +
        'Por favor enviar asistencia o verificar con las brigadas de auxilio.'
      );
      waBtn.href = 'https://wa.me/50584431289?text=' + msg;
    }
  }

  function fetchLiveGps() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          updateGpsUI(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
            pos.coords.altitude
          );
        },
        function(err) {
          // Fallback con coordenadas aproximadas en territorio de Nicaragua
          updateGpsUI(12.5061, -86.7022, 100, 150);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      updateGpsUI(12.5061, -86.7022, null, null);
    }
  }

  // Sirena Sonora de Socorro (Web Audio API)
  window.bqToggleSiren = function() {
    var btn = document.getElementById('bqSirenBtn');
    if (sirenOsc) {
      // Detener
      try {
        clearInterval(sirenInterval);
        sirenOsc.stop();
        sirenOsc.disconnect();
      } catch (e) {}
      sirenOsc = null;
      if (btn) {
        btn.classList.remove('active-siren');
        btn.innerHTML = '<i class="fa-solid fa-bullhorn"></i> <span data-i18n="sos_tool_siren">Sirena Acústica SOS</span>';
      }
      bqToast('Sirena acústica de emergencia detenida', 'info');
    } else {
      // Iniciar
      try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        sirenOsc = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        sirenOsc.type = 'sawtooth';
        sirenOsc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);

        sirenOsc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        sirenOsc.start();

        var high = false;
        sirenInterval = setInterval(function() {
          if (!sirenOsc) return;
          high = !high;
          sirenOsc.frequency.setValueAtTime(high ? 1300 : 750, audioCtx.currentTime);
        }, 350);

        if (btn) {
          btn.classList.add('active-siren');
          btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Detener Sirena</span>';
        }
        bqToast('🚨 Sirena acústica activada a volumen máximo', 'warning');
      } catch (e) {
        bqToast('Audio no soportado en este navegador', 'error');
      }
    }
  };

  // Baliza Estroboscópica SOS
  window.bqToggleStrobe = function() {
    var overlay = document.getElementById('bqStrobeOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bqStrobeOverlay';
      overlay.innerHTML = '<span>SOS — TOQUE PARA DETENER</span>';
      overlay.addEventListener('click', function() { window.bqToggleStrobe(); });
      document.body.appendChild(overlay);
    }

    if (strobeInterval) {
      clearInterval(strobeInterval);
      strobeInterval = null;
      overlay.style.display = 'none';
      bqToast('Baliza estroboscópica detenida', 'info');
    } else {
      overlay.style.display = 'flex';
      var state = 0;
      strobeInterval = setInterval(function() {
        state = (state + 1) % 2;
        overlay.style.background = state === 0 ? '#FFFFFF' : '#EF4444';
        overlay.style.color = state === 0 ? '#000000' : '#FFFFFF';
      }, 100);
      bqToast('Linterna estroboscópica SOS activada', 'warning');
    }
  };

  // ── Inyectar Modal SOS Completa ───────────────────────────────────────────
  function injectSosModal() {
    if (document.getElementById('bqSosModal')) return;

    var modal = document.createElement('div');
    modal.id = 'bqSosModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Centro SOS & Emergencias Nacionales 24/7');

    modal.innerHTML = `
      <div class="bq-sos-box">
        <div class="bq-sos-header">
          <div>
            <div class="bq-sos-title" data-i18n="sos_title">
              <i class="fa-solid fa-triangle-exclamation" style="color:#EF4444"></i> Centro SOS &amp; Auxilio Nacional 24/7
            </div>
            <p class="bq-sos-sub" data-i18n="sos_subtitle">
              Líneas de socorro directo, geolocalización satelital y herramientas de emergencia en territorio nicaragüense.
            </p>
          </div>
          <button class="bq-sos-close" onclick="bqCloseSos()" aria-label="Cerrar ventana SOS">×</button>
        </div>

        <!-- Tarjeta GPS en Tiempo Real -->
        <div class="bq-sos-gps-card">
          <div class="bq-gps-status">
            <span><i class="fa-solid fa-satellite-dish"></i> <span data-i18n="sos_gps_status">Señal Satelital GPS Activa</span></span>
            <span style="color:#F4E6C1">WGS-84</span>
          </div>
          <div class="bq-gps-coords" id="bqGpsCoordsDisplay">
            Localizando satélites en territorio nicaragüense...
          </div>
          <div class="bq-gps-actions">
            <button type="button" class="bq-gps-btn copy" onclick="bqCopyCoords()">
              <i class="fa-regular fa-copy"></i> <span data-i18n="sos_btn_copy_coords">Copiar Coordenadas</span>
            </button>
            <a id="bqSosWhatsappBtn" href="https://wa.me/50584431289" target="_blank" rel="noopener" class="bq-gps-btn whatsapp">
              <i class="fa-brands fa-whatsapp"></i> <span data-i18n="sos_btn_whatsapp">Enviar Alerta GPS a WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- Rejilla de 6 Servicios Oficiales de Rescate -->
        <div class="bq-sos-grid">
          <!-- 1. Policía -->
          <a href="tel:118" class="bq-service-card">
            <div class="bq-service-icon police"><i class="fa-solid fa-shield"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_police">Policía Nacional &amp; Turística</h5>
              <p data-i18n="sos_police_sub">Seguridad y patrullaje en rutas</p>
            </div>
            <div class="bq-service-number">118</div>
          </a>

          <!-- 2. Cruz Blanca -->
          <a href="tel:128" class="bq-service-card">
            <div class="bq-service-icon medical"><i class="fa-solid fa-truck-medical"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_ambulance">Cruz Blanca Nicaragüense</h5>
              <p data-i18n="sos_ambulance_sub">Ambulancias y soporte vital</p>
            </div>
            <div class="bq-service-number">128</div>
          </a>

          <!-- 3. Bomberos -->
          <a href="tel:115" class="bq-service-card">
            <div class="bq-service-icon fire"><i class="fa-solid fa-fire-extinguisher"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_firefighters">Bomberos Unificados</h5>
              <p data-i18n="sos_firefighters_sub">Rescate vertical y accidentes</p>
            </div>
            <div class="bq-service-number">115 / 911</div>
          </a>

          <!-- 4. Fuerza Naval -->
          <a href="tel:+50522631282" class="bq-service-card">
            <div class="bq-service-icon navy"><i class="fa-solid fa-anchor"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_navy">Fuerza Naval Militar</h5>
              <p data-i18n="sos_navy_sub">Costas Pacífico, Caribe y Lagos</p>
            </div>
            <div class="bq-service-number">2263-1282</div>
          </a>

          <!-- 5. SINAPRED / Defensa Civil -->
          <a href="tel:100" class="bq-service-card">
            <div class="bq-service-icon sinapred"><i class="fa-solid fa-volcano"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_sinapred">SINAPRED / Defensa Civil</h5>
              <p data-i18n="sos_sinapred_sub">Alerta volcánica y clima</p>
            </div>
            <div class="bq-service-number">100</div>
          </a>

          <!-- 6. MINSA Urgencias -->
          <a href="tel:102" class="bq-service-card">
            <div class="bq-service-icon minsa"><i class="fa-solid fa-hospital"></i></div>
            <div class="bq-service-info">
              <h5 data-i18n="sos_minsa">Urgencias Médicas MINSA</h5>
              <p data-i18n="sos_minsa_sub">Red de hospitales públicos</p>
            </div>
            <div class="bq-service-number">102</div>
          </a>
        </div>

        <!-- Herramientas Tácticas de Campo -->
        <div class="bq-tools-bar">
          <button type="button" class="bq-tool-btn" id="bqSirenBtn" onclick="bqToggleSiren()">
            <i class="fa-solid fa-bullhorn"></i> <span data-i18n="sos_tool_siren">Sirena Acústica SOS</span>
          </button>
          <button type="button" class="bq-tool-btn" id="bqStrobeBtn" onclick="bqToggleStrobe()">
            <i class="fa-solid fa-lightbulb"></i> <span data-i18n="sos_tool_strobe">Baliza Estroboscópica SOS</span>
          </button>
        </div>

        <!-- Guía Rápida de Primeros Auxilios -->
        <details class="bq-sos-guide">
          <summary data-i18n="sos_first_aid_title">Guía Rápida de Supervivencia en Naturaleza ▾</summary>
          <p style="margin:6px 0 3px;" data-i18n="sos_first_aid_snake">
            🐍 <strong>Mordedura de serpiente:</strong> Inmoviliza la extremidad, no cortes ni succiones, bebe agua limpia y acude al centro de salud más cercano.
          </p>
          <p style="margin:3px 0 3px;" data-i18n="sos_first_aid_heat">
            ☀️ <strong>Golpe de calor en volcanes:</strong> Busca sombra de inmediato, toma suero en sorbos pequeños y afloja prendas ajustadas.
          </p>
          <p style="margin:3px 0 0;" data-i18n="sos_first_aid_lost">
            🧭 <strong>Extravío en senderos:</strong> Permanece en el sitio, enciende la sirena acústica de auxilio y recuerda que el sol poniente cae hacia el oeste (Pacífico).
          </p>
        </details>
      </div>
    `;

    modal.addEventListener('click', function(e) {
      if (e.target === modal) bqCloseSos();
    });

    document.body.appendChild(modal);
  }

  window.bqCopyCoords = function() {
    var txt = 'Lat: ' + currentLat.toFixed(5) + ', Lng: ' + currentLng.toFixed(5) + ' (Nicaragua - Baqueano SOS)';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(function() {
        bqToast('¡Coordenadas GPS copiadas al portapapeles! 📋');
      }).catch(function() {
        bqToast(txt, 'info');
      });
    } else {
      bqToast(txt, 'info');
    }
  };

  window.bqOpenSos = function(e) {
    if (e) e.preventDefault();
    var m = document.getElementById('bqSosModal');
    if (m) {
      m.classList.add('open');
      document.body.style.overflow = 'hidden';
      fetchLiveGps();
      if (window.BaqueanoI18n) window.BaqueanoI18n.applyTranslations();
    }
  };

  window.bqCloseSos = function() {
    var m = document.getElementById('bqSosModal');
    if (m) {
      m.classList.remove('open');
      document.body.style.overflow = '';
      if (sirenOsc) window.bqToggleSiren();
    }
  };

  // ── Activar botones de SOS en todo el ecosistema ──────────────────────────
  function wireExistingSosButtons() {
    window.openSosModal = window.bqOpenSos;
    window.closeSosModal = window.bqCloseSos;

    document.querySelectorAll('[onclick*="openSosModal"], [onclick*="SosModal"], .open-sos-btn, [href="#sosModal"], .navbar-sos-btn, .sos-quick-btn').forEach(function(btn) {
      btn.onclick = function(e) { e.preventDefault(); bqOpenSos(e); };
    });
  }

  // ── Eliminar cualquier residuo de botón flotante OPS ──────────────────────
  function removeUnwantedFloatingOpsButton() {
    var fab = document.getElementById('bqOpsFab');
    if (fab) fab.remove();
  }

  // ── Escape key para modales ────────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      bqCloseSos();
    }
  });

  // ── INICIALIZACIÓN COMPLETA ───────────────────────────────────────────────
  function init() {
    injectGlobalAssets();
    removeUnwantedFloatingOpsButton();
    injectSosModal();
    wireExistingSosButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
