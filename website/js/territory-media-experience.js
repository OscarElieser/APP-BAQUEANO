// ============================================================================
// BAQUEANO — EXPERIENCIA MULTIMEDIA TERRITORIAL COMPARTIDA
// ============================================================================
// 🎯 POR QUÉ: los territorios sin experiencia editorial propia necesitan la
// misma jerarquía visual de Madriz: carrusel, movimiento y registro fotográfico.
// ⚙️ CÓMO: imágenes locales alimentan componentes accesibles que reutilizan los
// videos propios del proyecto sin alterar las experiencias especiales existentes.
// 📦 QUÉ: monta y desmonta una suite multimedia adaptable para 15 territorios.
// ============================================================================
(function initTerritoryMediaExperience(global) {
  'use strict';

  const IMAGE_ROOT = 'assets/images/departamentos/';
  const imageCatalog = {
    leon: ['leon.png', 'leon1.png', 'leon2.jfif', 'leon3.jfif', 'leon4.jfif'],
    granada: ['granada.jpg', 'granada1.jpg', 'granada2.jpg', 'granada3.jfif', 'granada4.jfif'],
    masaya: ['masaya.png', 'masaya1.png', 'masaya2.jpg', 'masaya4.jpg', 'masaya5.jpg'],
    carazo: ['carazo.png', 'carazo1.png', 'carazo2.avif', 'carazo3.jfif', 'carazo4.jfif'],
    managua: ['managua.png', 'managua1.jpg', 'managua2.jfif', 'managua3.jfif', 'managua4.jfif'],
    rivas: ['rivas.png', 'rivas1.jfif', 'sanjuandelsur.jpg', 'islaometepe.png'],
    jinotega: ['jinotega.jpg', 'jinotega1.jpg'],
    matagalpa: ['matagalpa.png', 'matagalpa1.png', 'matagalpa2.png', 'matagalpa3.png'],
    'nueva-segovia': ['nueva segovia.png', 'nueva segovia1.png'],
    boaco: ['boaco.png', 'boaco1.png'],
    chontales: ['chontales.png', 'chontales1.png', 'chontales2.png'],
    'rio-san-juan': ['rio san juan.png', 'rio san juan1.png', 'rio san juan2.png'],
    esteli: ['esteli.png', 'esteli1.png', 'reserva tisey.jpg'],
    raccn: ['raan.png', 'RAAN1.png', 'RAAN2.png', 'biosfera bosawas.jpg'],
    raccs: ['RAAS.png', 'RAAS1.png']
  };
  const videoCatalog = [
    { src: 'assets/videos/destinos.mp4', icon: 'fa-route', title: 'Paisajes y destinos', description: 'Un recorrido audiovisual por la diversidad natural y cultural del territorio.' },
    { src: 'assets/videos/historia.mp4', icon: 'fa-landmark', title: 'Historia y memoria viva', description: 'Relatos, patrimonio y expresiones que mantienen viva la identidad local.' }
  ];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function getImages(dept) {
    const images = (imageCatalog[dept.id] || []).map(name => `${IMAGE_ROOT}${encodeURIComponent(name)}`);
    if (dept.heroImage && !images.includes(dept.heroImage)) images.unshift(dept.heroImage);
    while (images.length && images.length < 5) images.push(...images.slice(0, 5 - images.length));
    return images.slice(0, 5);
  }

  function buildPhotoCards(dept, images) {
    const places = Array.isArray(dept.places) ? dept.places : [];
    return images.slice(0, 3).map((image, index) => {
      const place = places[index] || {};
      const title = place.name || `${dept.name}, perspectiva ${index + 1}`;
      return `<article class="photo-card-showcase territory-photo-card">
        <img src="${image}" alt="${escapeHtml(title)} en ${escapeHtml(dept.name)}" loading="lazy" decoding="async">
        <div class="photo-card-overlay">
          <span class="photo-badge"><i class="fa-solid ${place.icon || 'fa-location-dot'}"></i> Territorio verificado</span>
          <h4>${escapeHtml(title)}</h4><p>${escapeHtml(place.type || dept.tagline)}</p>
        </div>
      </article>`;
    }).join('');
  }

  function unmount() {
    const current = document.getElementById('territoryMediaExperience');
    if (current) current.remove();
  }

  function mount(dept) {
    unmount();
    if (!dept || dept.id === 'madriz' || dept.id === 'chinandega') return;
    const hero = document.querySelector('main .dept-hero-wrap');
    const images = getImages(dept);
    if (!hero || !images.length) return;
    const repeatedImages = images.concat(images);
    const primaryPlace = Array.isArray(dept.places) && dept.places[0] ? dept.places[0].name : dept.name;
    const suite = document.createElement('div');
    suite.id = 'territoryMediaExperience';
    suite.className = 'territory-media-experience';
    suite.innerHTML = `
      <section class="infinite-gallery-section" aria-label="Galería continua de ${escapeHtml(dept.name)}">
        <div class="infinite-carousel-container"><div class="infinite-track" id="territoryInfiniteTrack" tabindex="0" role="button" aria-pressed="false" aria-label="Pausar galería">
          ${repeatedImages.map((image, index) => `<div class="infinite-item"><img src="${image}" alt="Paisaje de ${escapeHtml(dept.name)} ${index % images.length + 1}" loading="lazy" decoding="async"></div>`).join('')}
        </div></div>
        <div class="territory-gallery-help"><span class="sub-label-tag"><i class="fa-solid fa-hand-pointer"></i> Haz clic en la galería para pausar</span></div>
      </section>
      <section class="madriz-video-gallery territory-video-gallery" aria-labelledby="territoryMovementTitle"><div class="container">
        <div class="video-gallery-header"><div class="sub-label-tag"><i class="fa-solid fa-video"></i> EXPERIENCIA AUDIOVISUAL</div>
          <h2 class="section-title-clean territory-movement-title" id="territoryMovementTitle">${escapeHtml(dept.name)} en Movimiento</h2>
          <p>Explorá los paisajes, la gente y la cultura de ${escapeHtml(dept.name)} a través de nuestra selección audiovisual.</p>
        </div>
        <div class="video-grid">${videoCatalog.map((video, index) => `<article class="video-card-showcase">
          <video src="${video.src}" controls preload="metadata" poster="${images[index % images.length]}"></video>
          <div class="video-info"><h4><i class="fa-solid ${video.icon}"></i> ${escapeHtml(video.title)}</h4><p>${escapeHtml(video.description)}</p></div>
        </article>`).join('')}</div>
      </div></section>
      <section class="madriz-gallery-strip territory-gallery-strip" aria-labelledby="territoryPhotoTitle"><div class="container">
        <div class="gallery-header-row"><div><div class="sub-label-tag"><i class="fa-solid fa-camera"></i> REGISTRO FOTOGRÁFICO TERRITORIAL</div>
          <h2 class="section-title-clean" id="territoryPhotoTitle">${escapeHtml(primaryPlace)} en Alta Fidelidad</h2></div>
          <span class="tag-verified-count">3 Perspectivas Clave</span>
        </div><div class="madriz-photo-grid">${buildPhotoCards(dept, images)}</div>
      </div></section>`;
    hero.insertAdjacentElement('afterend', suite);
    const track = suite.querySelector('#territoryInfiniteTrack');
    const toggleTrack = () => {
      const paused = track.classList.toggle('is-paused');
      track.setAttribute('aria-pressed', String(paused));
      track.setAttribute('aria-label', paused ? 'Reanudar galería' : 'Pausar galería');
    };
    track.addEventListener('click', toggleTrack);
    track.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleTrack(); }
    });
  }

  global.BaqueanoTerritoryMedia = Object.freeze({ mount, unmount });
})(window);
