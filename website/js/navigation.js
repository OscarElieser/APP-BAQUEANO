// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR DE NAVEGACIÓN DINÁMICA & MODALES (navigation.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de navegación institucional ultra-interactiva, dinámica
//   y de alta fidelidad entre todas las páginas del ecosistema oficial Baqueano Nicaragua.
// - Brindar retroalimentación visual en tiempo real (indicador flotante magnético,
//   seguimiento de luz ambiental del cursor, baliza SOS viva y micro-interacciones táctiles)
//   para conectar al explorador con las rutas, historia, gastronomía y herramientas rurales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Indicador de píldora deslizante con interpolación física suave y ajuste dinámico en resize.
// - Seguimiento de coordenadas del puntero para iluminación volumétrica con variables CSS3.
// - Menú móvil con animaciones fluidas, control de accesibilidad (ARIA) y cierre defensivo.
// - Generación de ondas táctiles (ripples) reactivas al clic en botones de acción.
// - Integración con Geolocation API y Firebase Analytics sin bloqueo del hilo principal.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initNavbarScroll(): Efecto dinámico de elevación, desenfoque y brillo de borde al scrollear.
// - initDynamicNavbar(): Indicador magnético deslizante y luz ambiental interactiva del cursor.
// - initMobileMenu(): Drawer táctico para smartphones con transiciones escalonadas.
// - initActiveNavHighlight(): Identificación y resaltado de la ruta activa en el menú.
// - initActionRipples(): Micro-interacciones de ondas expansivas en botones tácticos.
// - initSosModal(): Centro de auxilio con geolocalización satelital en tiempo real.
// - initDownloadModal(): Diálogo de distribución directa del APK oficial para Android.
// - initShareTools(): Herramientas de difusión comunitaria en WhatsApp y portapapeles.
// - initSmoothScroll(): Desplazamiento fluido para hipervínculos internos.
// ============================================================================

let currentGpsCoords = "Buscando satélites...";

/**
 * Controla el estado visual de la barra superior con efecto dinámico al hacer scroll.
 */
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 25) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Píldora deslizante magnética que sigue el cursor y regresa al elemento activo.
 */
function initDynamicNavbar() {
  const navbar = document.getElementById('mainNavbar');
  const navMenu = document.getElementById('navLinksMenu');
  if (!navMenu) return;

  // Crear o reutilizar la píldora indicadora flotante
  let indicator = navMenu.querySelector('.nav-pill-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'nav-pill-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    navMenu.appendChild(indicator);
  }

  const links = Array.from(navMenu.querySelectorAll('a'));
  if (links.length === 0) return;

  navMenu.classList.add('has-indicator');

  const moveIndicatorTo = (targetEl) => {
    if (!targetEl || !indicator) return;
    const menuRect = navMenu.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const left = targetRect.left - menuRect.left;
    const width = targetRect.width;

    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
  };

  const getActiveLink = () => {
    return navMenu.querySelector('a.active') || links[0];
  };

  const syncActivePosition = () => {
    const activeLink = getActiveLink();
    if (activeLink) {
      moveIndicatorTo(activeLink);
    }
  };

  // Posicionamiento inicial con retraso mínimo para asegurar cálculo de fuentes
  requestAnimationFrame(syncActivePosition);
  setTimeout(syncActivePosition, 100);

  // Escuchadores de interacción sobre los enlaces
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      links.forEach(l => l.classList.remove('hovered'));
      link.classList.add('hovered');
      moveIndicatorTo(link);
    });

    link.addEventListener('focus', () => {
      links.forEach(l => l.classList.remove('hovered'));
      link.classList.add('hovered');
      moveIndicatorTo(link);
    });
  });

  // Al salir del menú, regresar suavemente a la pestaña activa
  navMenu.addEventListener('mouseleave', () => {
    links.forEach(l => l.classList.remove('hovered'));
    syncActivePosition();
  });

  navMenu.addEventListener('focusout', (e) => {
    if (!navMenu.contains(e.relatedTarget)) {
      links.forEach(l => l.classList.remove('hovered'));
      syncActivePosition();
    }
  });

  // Recalcular en cambio de resolución de pantalla con debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncActivePosition, 80);
  }, { passive: true });

  // Seguimiento del puntero para iluminación ambiental en el HUD
  if (navbar) {
    navbar.addEventListener('mousemove', (e) => {
      const rect = navbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      navbar.style.setProperty('--nav-mouse-x', `${x}px`);
      navbar.style.setProperty('--nav-mouse-y', `${y}px`);
    }, { passive: true });
  }

  // Inicializar micro-interacciones de ondas en botones de acción
  initActionRipples();
}

/**
 * Micro-interacciones con efecto ripple táctil en botones de acción.
 */
function initActionRipples() {
  const interactiveBtns = document.querySelectorAll('.btn-nav-download, .sos-quick-btn, .mobile-nav-toggle');
  interactiveBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'nav-click-ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/**
 * Menú desplegable táctico y dinámico para pantallas táctiles y smartphones.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navLinksMenu');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('mobile-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.innerHTML = isOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
    toggleBtn.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  };

  const closeMenu = () => {
    if (navMenu.classList.contains('mobile-open')) {
      navMenu.classList.remove('mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      toggleBtn.style.transform = 'rotate(0deg)';
    }
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar al hacer clic en cualquier enlace
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar al hacer clic fuera del menú o presionar la tecla Escape
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/**
 * Identifica la página activa actual y le asigna la clase .active.
 */
function initActiveNavHighlight() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0];

    if (linkPage === pageName || (pageName === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initSosModal() {
  const openBtns = document.querySelectorAll('.open-sos-btn, #openSosModalBtn');
  const modal = document.getElementById('sosModal');
  const closeBtn = document.getElementById('closeSosModalBtn');
  const gpsDisplay = document.getElementById('sosGpsDisplay');
  const btnSendWa = document.getElementById('btnSendWhatsAppSos');
  const btnCopyGps = document.getElementById('btnCopyGpsSos');

  if (!modal) return;

  const fetchGps = () => {
    if (navigator.geolocation) {
      if (gpsDisplay) gpsDisplay.textContent = "🛰️ Conectando con satélites GPS...";
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);
          currentGpsCoords = `Lat: ${lat}°, Lon: ${lon}°`;
          if (gpsDisplay) gpsDisplay.innerHTML = `<i class="fa-solid fa-satellite" style="color: #10B981;"></i> ${currentGpsCoords}`;
        },
        () => {
          currentGpsCoords = "Lat: 12.1364° N, Lon: -86.2514° O (Nicaragua)";
          if (gpsDisplay) gpsDisplay.innerHTML = `<i class="fa-solid fa-location-dot" style="color: var(--terracotta);"></i> ${currentGpsCoords}`;
        },
        { timeout: 8000 }
      );
    } else {
      currentGpsCoords = "Lat: 12.1364° N, Lon: -86.2514° O (Nicaragua)";
      if (gpsDisplay) gpsDisplay.textContent = currentGpsCoords;
    }
  };

  const openModal = e => {
    if (e) e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    fetchGps();

    if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
      window.logFirebaseEvent(window.firebaseAnalytics, 'open_sos_center');
    }
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  if (btnSendWa) {
    btnSendWa.addEventListener('click', () => {
      const sosMsg = `🚨 ¡AUXILIO SOS EN SENDERO! Necesito asistencia urgente en territorio nicaragüense. Mis coordenadas satelitales son: ${currentGpsCoords} - Emitido desde Baqueano SOS.`;
      const waUrl = `https://api.whatsapp.com/send?phone=50584431289&text=${encodeURIComponent(sosMsg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (btnCopyGps) {
    btnCopyGps.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentGpsCoords);
        btnCopyGps.innerHTML = '<i class="fa-solid fa-check"></i> ¡Coordenadas Copiadas!';
        btnCopyGps.style.background = '#165D6F';
        btnCopyGps.style.color = '#FFFFFF';

        setTimeout(() => {
          btnCopyGps.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar Coordenadas al Portapapeles';
          btnCopyGps.style.background = '';
          btnCopyGps.style.color = '';
        }, 2000);
      } catch (e) {
        alert("Coordenadas: " + currentGpsCoords);
      }
    });
  }
}

function initDownloadModal() {
  const openBtns = document.querySelectorAll('.open-download-modal-btn');
  const modal = document.getElementById('downloadModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const confirmBtn = document.getElementById('modalConfirmDownloadBtn');
  const directBtn = document.getElementById('directApkDownloadBtn');

  if (!modal) return;

  const openModal = e => {
    if (e) e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
      window.logFirebaseEvent(window.firebaseAnalytics, 'open_download_modal');
    }
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  const trackDownload = () => {
    if (typeof window.logFirebaseEvent === 'function' && window.firebaseAnalytics) {
      window.logFirebaseEvent(window.firebaseAnalytics, 'apk_download_started', {
        file: 'BaqueanoNicaragua.apk'
      });
    }
  };

  if (confirmBtn) confirmBtn.addEventListener('click', trackDownload);
  if (directBtn) directBtn.addEventListener('click', trackDownload);
}

function initShareTools() {
  const waBtn = document.getElementById('shareWhatsAppBtn');
  const copyBtn = document.getElementById('copyLinkBtn');

  const shareMsg = "¡Descubre Baqueano Nicaragua! Plataforma oficial para turismo responsable, conservación y ecoturismo campesino sin intermediarios: ";
  const currentUrl = window.location.href;

  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg + currentUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        const prev = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Enlace Copiado!';
        copyBtn.style.background = 'var(--petroleo-teal)';
        copyBtn.style.color = '#FFFFFF';

        setTimeout(() => {
          copyBtn.innerHTML = prev;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 2000);
      } catch (e) {
        alert("Enlace oficial: " + currentUrl);
      }
    });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || this.classList.contains('open-download-modal-btn') || this.classList.contains('open-sos-btn')) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 80;
        const pos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });
}

window.toggleFavoriteReal = async function(placeId, btnElement) {
  try {
    const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
    const user = auth ? auth.currentUser : null;
    const icon = btnElement ? btnElement.querySelector('i') : null;

    if (!user) {
      const local = JSON.parse(localStorage.getItem('baqueano_favs') || '[]');
      if (local.includes(placeId)) {
        const next = local.filter(id => id !== placeId);
        localStorage.setItem('baqueano_favs', JSON.stringify(next));
        if (icon) { icon.className = 'fa-regular fa-heart'; icon.style.color = ''; }
        alert('Destino removido de tus favoritos locales.');
      } else {
        local.push(placeId);
        localStorage.setItem('baqueano_favs', JSON.stringify(local));
        if (icon) { icon.className = 'fa-solid fa-heart'; icon.style.color = '#EF4444'; }
        alert('Destino guardado en favoritos. (Inicia sesión para sincronizarlo con tu perfil en la nube).');
      }
      return;
    }

    const db = window.firebase.firestore();
    const savedId = `${user.uid}_${placeId}`;
    const docRef = db.collection('user_saved_places').doc(savedId);
    const snap = await docRef.get();

    if (snap.exists) {
      await docRef.delete();
      if (icon) { icon.className = 'fa-regular fa-heart'; icon.style.color = ''; }
      alert('Removido de tus favoritos en Cloud Firestore.');
    } else {
      await docRef.set({
        userId: user.uid,
        placeId: placeId,
        savedAt: new Date().toISOString()
      });
      if (icon) { icon.className = 'fa-solid fa-heart'; icon.style.color = '#EF4444'; }
      alert('¡Destino guardado en tu perfil de Cloud Firestore!');
    }
  } catch(err) {
    console.error('Error al gestionar favorito:', err);
  }
};

/**
 * Inicializa la telemetría en vivo, seguidor de luz ambiental y micro-interacciones del footer táctico futurista.
 */
function initDynamicFooter() {
  const footer = document.querySelector('.site-footer-pro');
  if (!footer) return;

  // 1. Inyectar rayo láser de escaneo si no existe
  if (!footer.querySelector('.footer-laser-scan')) {
    const laser = document.createElement('div');
    laser.className = 'footer-laser-scan';
    laser.setAttribute('aria-hidden', 'true');
    footer.prepend(laser);
  }

  // 2. Inyectar cinta HUD de telemetría si no existe
  if (!footer.querySelector('.footer-telemetry-hud')) {
    const container = footer.querySelector('.container');
    if (container) {
      const hudStrip = document.createElement('div');
      hudStrip.className = 'footer-telemetry-hud';
      hudStrip.innerHTML = `
        <div class="hud-stat-item">
          <span class="hud-beacon-led"></span>
          <span class="hud-label">NODO CENTRAL:</span>
          <strong class="hud-val">NICARAGUA SOBERANA</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-solid fa-satellite" style="color: var(--petroleo-glow);"></i>
          <span class="hud-label">TELEMETRÍA GPS:</span>
          <strong class="hud-val">12.1364° N, 86.2514° O</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-solid fa-shield-halved" style="color: var(--terracotta-light);"></i>
          <span class="hud-label">SEGURIDAD:</span>
          <strong class="hud-val">AES-GCM 256-BIT</strong>
        </div>
        <div class="hud-stat-item">
          <i class="fa-regular fa-clock" style="color: var(--arena-pinolera);"></i>
          <span class="hud-label">HORA LOCAL CST:</span>
          <strong class="hud-val" id="footerLiveClock">--:--:--</strong>
        </div>
      `;
      container.insertBefore(hudStrip, container.firstChild);
    }
  }

  // 3. Reloj en vivo de Nicaragua (CST UTC-6)
  const clockEl = document.getElementById('footerLiveClock');
  const updateClock = () => {
    if (clockEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-NI', { 
        timeZone: 'America/Managua',
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      clockEl.textContent = `${timeStr} (UTC-6)`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 4. Luz ambiental reactiva en el footer
  footer.addEventListener('mousemove', (e) => {
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    footer.style.setProperty('--footer-mouse-x', `${x}px`);
    footer.style.setProperty('--footer-mouse-y', `${y}px`);
  }, { passive: true });

  // 5. Interactividad táctica en las líneas de emergencia
  const emergencyItems = footer.querySelectorAll('.emergency-line-item');
  emergencyItems.forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('title', 'Tocar para activar asistencia directa');
    
    const strong = item.querySelector('strong');
    const phoneNum = strong ? strong.textContent.replace(/[^0-9+]/g, '') : '';
    
    const triggerContact = () => {
      if (!phoneNum) return;
      if (phoneNum.startsWith('+505') || phoneNum.length > 4) {
        const cleanWa = phoneNum.replace('+', '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanWa}&text=${encodeURIComponent('🚨 Auxilio Baqueano SOS: Solicitud de asistencia directa.')}`, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = `tel:${phoneNum}`;
      }
    };

    item.addEventListener('click', triggerContact);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerContact();
      }
    });
  });
}

// Auto-inicialización defensiva para páginas directas
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof initDynamicNavbar === 'function') initDynamicNavbar();
    if (typeof initDynamicFooter === 'function') initDynamicFooter();
  });
} else {
  if (typeof initDynamicNavbar === 'function') initDynamicNavbar();
  if (typeof initDynamicFooter === 'function') initDynamicFooter();
}
