// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTROLADOR DE NAVEGACIÓN & MODALES (navigation.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de navegación institucional consistente y unificada
//   entre todas las páginas independientes del sitio web oficial de Baqueano Nicaragua.
// - Gestionar las funciones transversales de seguridad y distribución:
//   * Resaltado automático de la página activa en el menú.
//   * Centro de Auxilio y Emergencias SOS 24/7 en sendero con captura satelital.
//   * Modal de descarga directa del APK oficial para Android.
//   * Herramientas de compartir por WhatsApp y copiado de enlaces.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Manejo reactivo de eventos DOM con listeners pasivos en scroll.
// - Geolocation API del navegador con fallback geográfico de Nicaragua.
// - Clipboard API con retroalimentación visual háptica inmediata.
// - Modular y desacoplado, exportado globalmente para inicialización en app.js.
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initNavbarScroll(): Efecto de fondo glassmorphism y sombra al scrollear.
// - initMobileMenu(): Menú hamburguesa desplegable para smartphones.
// - initActiveNavHighlight(): Marca la pestaña activa según la URL actual.
// - initSosModal(): Modal de auxilio con geolocalización satelital en vivo.
// - initDownloadModal(): Diálogo de instalación y descarga de BaqueanoNicaragua.apk.
// - initShareTools(): Botones para compartir el proyecto en redes y mensajería.
// - initSmoothScroll(): Desplazamiento fluido para anclas en la misma página.
// ============================================================================

let currentGpsCoords = "Buscando satélites...";

function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navLinksMenu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isVisible = navMenu.style.display === 'flex';
    if (isVisible) {
      navMenu.style.display = '';
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    } else {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.right = '0';
      navMenu.style.background = 'rgba(15, 23, 42, 0.96)';
      navMenu.style.padding = '1.5rem';
      navMenu.style.backdropFilter = 'blur(20px)';
      navMenu.style.borderBottom = '1px solid var(--border-subtle)';
      toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    }
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.style.display = '';
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

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
