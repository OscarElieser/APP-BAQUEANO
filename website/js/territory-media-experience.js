// ============================================================================
// BAQUEANO — EXPERIENCIA MULTIMEDIA TERRITORIAL COMPARTIDA
// ============================================================================
// 🎯 POR QUÉ: cada territorio necesita una presentación visual propia, continua
// y controlable, sin atribuir material general a un departamento concreto.
// ⚙️ CÓMO: las fotos únicas se clonan solo para cerrar el bucle visual; la copia
// técnica se oculta semánticamente y un botón permite pausar o reanudar.
// 📦 QUÉ: carrusel infinito accesible y registro fotográfico para 15 territorios.
// ============================================================================
(function initTerritoryMediaExperience(global) {
  'use strict';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function getImages(dept) {
    const media = global.BAQUEANO_MEDIA_CATALOG?.[dept.id];
    const images = Array.isArray(media?.carousel) ? [...media.carousel] : [];
    if (dept.heroImage && !images.includes(dept.heroImage)) images.unshift(dept.heroImage);
    return [...new Set(images)].slice(0, 5);
  }

  function getPhotoImages(dept, fallbackImages) {
    const configured = global.BAQUEANO_MEDIA_CATALOG?.[dept.id]?.photoGallery;
    const images = Array.isArray(configured) && configured.length ? configured : fallbackImages;
    return [...new Set(images)].slice(0, 3);
  }

  function buildVideoSection(dept) {
    const videos = global.BAQUEANO_MEDIA_CATALOG?.[dept.id]?.videos || [];
    if (!videos.length) return '';
    return `<section class="madriz-video-gallery territory-video-gallery" aria-labelledby="territoryVideoTitle"><div class="container">
      <div class="video-gallery-header"><div class="sub-label-tag"><i class="fa-solid fa-video"></i> EXPERIENCIA AUDIOVISUAL</div>
        <h2 class="section-title-clean territory-movement-title" id="territoryVideoTitle">${escapeHtml(dept.name)} en movimiento</h2>
      </div>
      <div class="video-grid">${videos.map(video => `<article class="video-card-showcase">
        <video src="${escapeHtml(video.src)}" controls preload="metadata" poster="${escapeHtml(video.poster)}"></video>
        <div class="video-info"><h4>${escapeHtml(video.title)}</h4><p>${escapeHtml(video.description)}</p></div>
      </article>`).join('')}</div>
    </div></section>`;
  }

  function buildPhotoCards(dept, images) {
    const officialHighlights = Array.isArray(dept.officialHighlights) ? dept.officialHighlights : [];
    return images.slice(0, 3).map((image, index) => {
      const title = `${dept.name} · Archivo visual ${index + 1}`;
      const description = officialHighlights[index] || dept.shortDesc;
      return `<article class="photo-card-showcase territory-photo-card">
        <img src="${image}" alt="${escapeHtml(title)} en ${escapeHtml(dept.name)}" loading="lazy" decoding="async">
        <div class="photo-card-overlay">
          <span class="photo-badge"><i class="fa-solid fa-camera"></i> Archivo territorial</span>
          <h4>${escapeHtml(title)}</h4><p>${escapeHtml(description)}</p>
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
    const photoImages = getPhotoImages(dept, images);
    const suite = document.createElement('div');
    suite.id = 'territoryMediaExperience';
    suite.className = 'territory-media-experience';
    suite.innerHTML = `
      <section class="infinite-gallery-section territory-infinite-gallery" aria-label="Galería continua de ${escapeHtml(dept.name)}">
        <div class="infinite-carousel-container">
          <div class="infinite-track" id="territoryInfiniteTrack">
            ${images.map((image, index) => `<div class="infinite-item"><img src="${image}" alt="Paisaje de ${escapeHtml(dept.name)} ${index + 1}" loading="lazy" decoding="async"></div>`).join('')}
            <div class="territory-carousel-clone" aria-hidden="true">
              ${images.map(image => `<div class="infinite-item"><img src="${image}" alt="" loading="lazy" decoding="async"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="territory-gallery-controls">
          <button type="button" class="territory-gallery-toggle" aria-pressed="false">
            <i class="fa-solid fa-pause"></i><span>Pausar galería</span>
          </button>
        </div>
      </section>
      ${buildVideoSection(dept)}
      <section class="madriz-gallery-strip territory-gallery-strip" aria-labelledby="territoryPhotoTitle"><div class="container">
        <div class="gallery-header-row"><div><div class="sub-label-tag"><i class="fa-solid fa-camera"></i> ARCHIVO FOTOGRÁFICO TERRITORIAL</div>
          <h2 class="section-title-clean" id="territoryPhotoTitle">${escapeHtml(dept.name)} en imágenes</h2></div>
          <span class="tag-verified-count">${photoImages.length} imágenes únicas</span>
        </div><div class="madriz-photo-grid">${buildPhotoCards(dept, photoImages)}</div>
      </div></section>`;
    hero.insertAdjacentElement('afterend', suite);
    const track = suite.querySelector('#territoryInfiniteTrack');
    const toggle = suite.querySelector('.territory-gallery-toggle');
    toggle.addEventListener('click', () => {
      const paused = track.classList.toggle('is-paused');
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.innerHTML = paused
        ? '<i class="fa-solid fa-play"></i><span>Reanudar galería</span>'
        : '<i class="fa-solid fa-pause"></i><span>Pausar galería</span>';
    });
  }

  global.BaqueanoTerritoryMedia = Object.freeze({ mount, unmount });
})(window);
