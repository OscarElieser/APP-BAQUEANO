// ============================================================================
// BAQUEANO — EXPERIENCIA MULTIMEDIA TERRITORIAL COMPARTIDA
// ============================================================================
// 🎯 POR QUÉ: cada territorio necesita una presentación visual propia, sin
// repetir fotografías ni atribuir videos generales a un departamento concreto.
// ⚙️ CÓMO: cada archivo local aparece una sola vez y los textos se obtienen del
// catálogo territorial respaldado por las fuentes oficiales ya publicadas.
// 📦 QUÉ: monta y desmonta un registro fotográfico adaptable para 15 territorios.
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
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function getImages(dept) {
    const images = (imageCatalog[dept.id] || []).map(name => `${IMAGE_ROOT}${encodeURIComponent(name)}`);
    if (dept.heroImage && !images.includes(dept.heroImage)) images.unshift(dept.heroImage);
    return [...new Set(images)].slice(0, 5);
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
    const suite = document.createElement('div');
    suite.id = 'territoryMediaExperience';
    suite.className = 'territory-media-experience';
    suite.innerHTML = `
      <section class="madriz-gallery-strip territory-gallery-strip" aria-labelledby="territoryPhotoTitle"><div class="container">
        <div class="gallery-header-row"><div><div class="sub-label-tag"><i class="fa-solid fa-camera"></i> ARCHIVO FOTOGRÁFICO TERRITORIAL</div>
          <h2 class="section-title-clean" id="territoryPhotoTitle">${escapeHtml(dept.name)} en imágenes</h2></div>
          <span class="tag-verified-count">${Math.min(images.length, 3)} imágenes únicas</span>
        </div><div class="madriz-photo-grid">${buildPhotoCards(dept, images)}</div>
      </div></section>`;
    hero.insertAdjacentElement('afterend', suite);
  }

  global.BaqueanoTerritoryMedia = Object.freeze({ mount, unmount });
})(window);
