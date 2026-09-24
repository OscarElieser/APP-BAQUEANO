// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INSPECTOR DE TERRITORIOS (territory-inspector.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia interactiva sin recarga para explorar los 17 territorios
//   de Nicaragua (15 departamentos · 2 Regiones Autónomas).
// - Visibilizar de forma inmediata atractivos, gastronomía del maíz y el fogón,
//   cultura viva, experiencias de aventura y servicios de anfitriones comunitarios.
// - Conectar la selección territorial con el mapa satelital Leaflet y la navegación
//   profunda hacia departamento.html?id=...
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consume `window.BAQUEANO_TERRITORIES` de forma defensiva y reactiva.
// - Vincula chips de territorio con microanimaciones CSS a 60fps.
// - Coordina el centrado de cámara en el mapa satelital `#indexTerritoryMap`
//   aprovechando la API `flyTo` de Leaflet.
//
// 📦 3. QUÉ (WHAT / FUNCIONALIDADES EXPUESTAS):
// - Función `selectTerritory(id)` que actualiza el visor `#territoryInspectorCard`.
// - Inicialización automática con el territorio insignia 'leon' o 'madriz'.
// ============================================================================

(function () {
  'use strict';

  function initTerritoryInspector() {
    const inspectorCard = document.getElementById('territoryInspectorCard');
    const chipsContainer = document.getElementById('territoryChipsBar');
    if (!inspectorCard || !chipsContainer) return;

    const territories = window.BAQUEANO_TERRITORIES || [];
    if (!territories.length) return;

    // Generar botones/chips interactivos si el contenedor está vacío
    if (!chipsContainer.children.length) {
      chipsContainer.innerHTML = territories.map((t, idx) => `
        <button type="button" class="territory-chip-btn ${idx === 0 ? 'is-active' : ''}" data-territory-id="${t.id}">
          <i class="fa-solid fa-location-dot"></i>
          <span>${t.name}</span>
        </button>
      `).join('');
    }

    // Renderizar datos del territorio seleccionado
    function renderTerritory(terr) {
      if (!terr) return;

      const atractivosHtml = (terr.places || []).slice(0, 4).map(p => `
        <span class="terr-inspect-tag">
          <i class="fa-solid ${p.icon || 'fa-mountain'}"></i> ${p.name}
        </span>
      `).join('') || '<span class="terr-inspect-tag">Senderos comunitarios</span>';

      const gastroHtml = (terr.gastronomy || []).slice(0, 3).map(g => `
        <span class="terr-inspect-tag tag-food">
          <i class="fa-solid fa-utensils"></i> ${g.name}
        </span>
      `).join('') || '<span class="terr-inspect-tag tag-food">Gastronomía ancestral</span>';

      const expHtml = (terr.activities || []).slice(0, 3).map(a => `
        <li class="terr-inspect-li"><i class="fa-solid fa-circle-check"></i> ${a}</li>
      `).join('') || '<li class="terr-inspect-li"><i class="fa-solid fa-circle-check"></i> Rutas guiadas y senderismo</li>';

      const serviciosText = terr.coopCount
        ? `${terr.coopCount} cooperativas, posadas campesinas y guías baqueanos activos`
        : 'Guías locales, posadas rurales y transporte comunitario';

      inspectorCard.innerHTML = `
        <div class="terr-inspect-header">
          <div class="terr-inspect-badge">
            <i class="fa-solid fa-flag"></i> ${terr.culturalRegion || 'Territorio Baqueano'}
          </div>
          <h3 class="terr-inspect-name">${terr.name}</h3>
          <p class="terr-inspect-tagline">${terr.tagline || terr.shortDesc || ''}</p>
        </div>

        <div class="terr-inspect-body-grid">
          <div class="terr-inspect-col">
            <h5 class="terr-inspect-title"><i class="fa-solid fa-mountain-sun"></i> Atractivos Principales</h5>
            <div class="terr-inspect-tags-wrap">${atractivosHtml}</div>

            <h5 class="terr-inspect-title"><i class="fa-solid fa-bowl-food"></i> Gastronomía Típica</h5>
            <div class="terr-inspect-tags-wrap">${gastroHtml}</div>
          </div>

          <div class="terr-inspect-col">
            <h5 class="terr-inspect-title"><i class="fa-solid fa-masks-theater"></i> Cultura & Tradiciones</h5>
            <p class="terr-inspect-text">${terr.culture ? terr.culture.slice(0, 160) + '...' : 'Patrimonio vivo y costumbres ancestrales.'}</p>

            <h5 class="terr-inspect-title"><i class="fa-solid fa-person-hiking"></i> Experiencias Vivas</h5>
            <ul class="terr-inspect-list">${expHtml}</ul>
          </div>
        </div>

        <div class="terr-inspect-footer">
          <div class="terr-inspect-services">
            <i class="fa-solid fa-handshake-angle"></i>
            <span><strong>Servicios Turísticos:</strong> ${serviciosText}</span>
          </div>
          <a href="departamento.html?id=${terr.id}" class="btn-terr-explore">
            <span>Explorar ${terr.name}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;

      // Coordinar con mapa si existe la instancia Leaflet
      try {
        const leafletContainer = document.getElementById('indexTerritoryMap');
        if (leafletContainer && leafletContainer._leaflet_id && terr.lat && terr.lng) {
          // Si el mapa global o index-features tiene la instancia
          if (window.indexMapInstance) {
            window.indexMapInstance.flyTo([terr.lat, terr.lng], 9, { duration: 1.2 });
          }
        }
      } catch (eMap) {
        // Fallback no bloqueante
      }
    }

    // Escuchar clics en los chips
    chipsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.territory-chip-btn');
      if (!btn) return;
      const terrId = btn.dataset.territoryId;
      const found = territories.find(t => t.id === terrId);
      if (found) {
        chipsContainer.querySelectorAll('.territory-chip-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderTerritory(found);
      }
    });

    // Renderizar el primer territorio (o León) por defecto
    const initialTerr = territories.find(t => t.id === 'leon') || territories[0];
    renderTerritory(initialTerr);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerritoryInspector);
  } else {
    initTerritoryInspector();
  }
})();
