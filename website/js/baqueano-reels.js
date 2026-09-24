// ============================================================================
// BAQUEANO REELS — DESCUBRIMIENTO VERTICAL DE NICARAGUA
// 🎯 POR QUÉ: Dar vida al teléfono del hero sin alterar el resto de la portada.
// ⚙️ CÓMO: Datos declarativos, Scroll Snap e IntersectionObserver; solo el reel
// activo reproduce y la siguiente fuente se prepara de manera progresiva.
// 📦 QUÉ: Render, favoritos, audio manual, teclado, fallback y pausa automática.
// ============================================================================
(function () {
  'use strict';
  const reels = [
    { title: 'Cañón de Somoto', department: 'Madriz', category: 'Naturaleza • Aventura', rating: '4.9', badge: 'Ruta Insigne', poster: 'assets/images/destinos/canon_de_somoto.jpg', video: 'assets/videos/destinos.mp4', phrase: 'Descubre lo que no sale en el mapa.', url: '#routeBuilderSection' },
    { title: 'Volcán Cerro Negro', department: 'León', category: 'Aventura • Sandboarding', rating: '5.0', badge: 'Adrenalina volcánica', poster: 'assets/images/destinos/cerro_negro.jpg', video: 'assets/videos/destinos.mp4', phrase: 'Tu próxima aventura empieza aquí.', url: '#routeBuilderSection' },
    { title: 'Isla de Ometepe', department: 'Rivas', category: 'Naturaleza • Cultura', rating: '4.9', badge: 'Isla volcánica', poster: 'assets/images/destinos/isla_de_ometepe.jpg', video: 'assets/videos/destinos.mp4', phrase: 'Nicaragua se vive, no solo se visita.', url: '#mapaVivo3DNicaragua' },
    { title: 'Cascadas y montañas', department: 'Jinotega • Matagalpa', category: 'Naturaleza', rating: '4.8', badge: 'Senderos del norte', poster: 'assets/images/destinos/cascada_la_luna.jpg', phrase: 'Hay caminos que solo un Baqueano conoce.', url: '#routeBuilderSection' },
    { title: 'Caribe nicaragüense', department: 'Costa Caribe', category: 'Playa • Cultura', rating: '4.9', badge: 'Caribe vivo', poster: 'assets/images/destinos/corn_island.jpg', phrase: 'Encuentra la Nicaragua que pocos conocen.', url: '#mapaVivo3DNicaragua' },
    { title: 'Gastronomía nicaragüense', department: 'Nicaragua', category: 'Gastronomía • Cultura', rating: '4.9', badge: 'Sabores con memoria', poster: 'assets/images/destinos/Calle La Calzada & Zona Bohemia.jpg', video: 'assets/videos/gastronomia.mp4', phrase: 'Cada sabor cuenta una historia.', url: '#experienciasNicaragua' },
    { title: 'Turismo comunitario', department: 'Territorios de Nicaragua', category: 'Comunidad • Experiencias', rating: '5.0', badge: 'Hecho por su gente', poster: 'assets/images/destinos/selva_negra.jpg', phrase: 'Viaja cerca. Deja una huella positiva.', url: '#experienciasNicaragua' }
  ];
  const root = document.getElementById('baqueanoReels');
  const feed = document.getElementById('baqueanoReelsFeed');
  const indicators = document.getElementById('baqueanoReelsIndicators');
  if (!root || !feed || !indicators) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phoneVisible = false;
  let activeIndex = 0;
  feed.innerHTML = reels.map((item, index) => `
    <article class="baqueano-reel${index === 0 ? ' is-active' : ''}" data-index="${index}" aria-label="${item.title}, ${item.department}">
      <img class="baqueano-reel-poster" src="${item.poster}" alt="Paisaje de ${item.title}" loading="${index ? 'lazy' : 'eager'}" decoding="async">
      ${item.video && !reducedMotion ? `<video class="baqueano-reel-video" data-src="${item.video}" poster="${item.poster}" muted loop playsinline preload="metadata" aria-label="Video de ${item.title}"></video>` : ''}
      <div class="baqueano-reel-shade"></div>
      <header class="baqueano-reel-header"><img src="assets/images/logo.png" alt=""><strong>BAQUEANO</strong><span>Explora Nicaragua</span></header>
      <div class="baqueano-reel-copy"><span class="baqueano-reel-badge">${item.badge}</span><p class="baqueano-reel-phrase">${item.phrase}</p><h3>${item.title}</h3><p class="baqueano-reel-meta"><i class="fa-solid fa-location-dot"></i> ${item.department} <b>★ ${item.rating}</b></p><p class="baqueano-reel-category"><i class="fa-regular fa-compass"></i> ${item.category}</p><a class="baqueano-reel-explore" href="${item.url}">Explorar ruta <span aria-hidden="true">→</span></a></div>
      <div class="baqueano-reel-actions" aria-label="Acciones de ${item.title}"><button type="button" data-action="favorite" aria-label="Guardar ${item.title}"><i class="fa-regular fa-heart"></i><span>Favorito</span></button><a href="#mapaVivo3DNicaragua" aria-label="Ver ${item.title} en el mapa"><i class="fa-regular fa-map"></i><span>Mapa</span></a><button type="button" data-action="share" aria-label="Compartir ${item.title}"><i class="fa-solid fa-arrow-up-from-bracket"></i><span>Compartir</span></button><button type="button" data-action="audio" aria-label="Activar audio" ${item.video ? '' : 'disabled'}><i class="fa-solid fa-volume-xmark"></i><span>Audio</span></button></div>
    </article>`).join('');
  indicators.innerHTML = reels.map((item, index) => `<span class="${index === 0 ? 'is-active' : ''}" title="${item.title}"></span>`).join('');
  const cards = Array.from(feed.querySelectorAll('.baqueano-reel'));
  function hydrate(index) { [index, index + 1].forEach((position) => { const video = cards[position]?.querySelector('video[data-src]'); if (video && !video.src) video.src = video.dataset.src; }); }
  function pauseAll(except) { cards.forEach((card) => { const video = card.querySelector('video'); if (video && video !== except) video.pause(); }); }
  function activate(index) {
    activeIndex = Math.max(0, Math.min(index, cards.length - 1)); hydrate(activeIndex);
    cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));
    Array.from(indicators.children).forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
    const video = cards[activeIndex].querySelector('video'); pauseAll(video);
    if (phoneVisible && video && !reducedMotion) video.play().catch(() => {});
  }
  const cardObserver = new IntersectionObserver((entries) => { const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (current) activate(Number(current.target.dataset.index)); }, { root: feed, threshold: [0.6, 0.85] });
  cards.forEach((card) => cardObserver.observe(card));
  new IntersectionObserver(([entry]) => { phoneVisible = entry.isIntersecting; if (phoneVisible) activate(activeIndex); else pauseAll(); }, { threshold: 0.2 }).observe(root);
  root.addEventListener('keydown', (event) => { if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const next = activeIndex + (event.key === 'ArrowDown' ? 1 : -1); cards[Math.max(0, Math.min(next, cards.length - 1))].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }); });
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const card = button.closest('.baqueano-reel'); const item = reels[Number(card.dataset.index)];
    if (button.dataset.action === 'favorite') { const selected = button.classList.toggle('is-selected'); button.querySelector('i').className = selected ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; button.setAttribute('aria-pressed', String(selected)); }
    if (button.dataset.action === 'audio') { const video = card.querySelector('video'); if (!video) return; video.muted = !video.muted; button.querySelector('i').className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'; button.setAttribute('aria-label', video.muted ? 'Activar audio' : 'Silenciar audio'); }
    if (button.dataset.action === 'share') { try { if (navigator.share) await navigator.share({ title: `Baqueano — ${item.title}`, text: item.phrase, url: location.href }); else await navigator.clipboard.writeText(location.href); } catch (_) { /* cancelación del usuario */ } }
  });
  feed.addEventListener('error', (event) => { if (event.target instanceof HTMLVideoElement) { event.target.hidden = true; event.target.removeAttribute('src'); event.target.load(); } }, true);
  hydrate(0);
})();
