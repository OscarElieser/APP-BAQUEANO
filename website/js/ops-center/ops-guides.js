// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTOR DE GUÍAS NATIVOS Y BAQUEANOS CERTIFICADOS (#14-guias)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Administrar con total fidelidad el registro de Guías Nativos y Baqueanos
//   Comunitarios de Nicaragua bajo la Ley No. 1211 y acreditaciones de INTUR.
// - Garantizar que cada anfitrión territorial cuente con ficha profesional,
//   contacto directo por WhatsApp sin intermediarios, saberes campesinos,
//   tarifas transparentes con Córdobas Primero (Regla 11) y sello verificado.
// - Erradicar formularios genéricos descontextualizados, permitiendo crear,
//   modificar, suspender y eliminar guías con datos reales del territorio.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Módulo singleton autoejecutable expuesto en `window.BaqueanoOpsGuides`.
// - Estado reactivo sincronizado con `OpsState.collectionsData['14-guias']`,
//   respaldado por catálogo base y persistencia en Supabase / Cloud Firestore.
// - Rejilla fluida y tarjetas de datos de alta gama visual (paleta oficial:
//   #165D6F, #F65E01, #F4E6C1, #0F172A), sin términos prohibidos ni opacidades
//   deprecadas.
// - Conversión cambiaria oficial del Banco Central de Nicaragua (C$ 36.6243).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & INTERFAZ):
// - Métodos: `render(panel)`, `openDrawer(guideId)`, `closeDrawer()`,
//   `saveGuide(event)`, `toggleSuspend(guideId)`, `openDeleteModal(guideId)`,
//   `deleteGuide()`, `filterBy(filterType)`, `search(query)`.
// ============================================================================

(function (window, document) {
  'use strict';

  const BCN_EXCHANGE_RATE = 36.6243; // Tasa oficial Banco Central de Nicaragua (Regla 11)

  // Catálogo inicial de Guías Nativos Acreditados de Nicaragua
  const DEFAULT_GUIDES = [
    {
      id: 'gui-001',
      name: 'Carlos "El Baqueano" Silva',
      department: 'Madriz',
      municipality: 'Somoto',
      specialty: 'Cañón de Somoto, Espeleología & Rescate Fluvial',
      carnetIntur: 'INTUR-MAD-0012',
      phone: '+505 8891-0021',
      email: 'carlos.baqueano@somoto.ni',
      languages: 'Español nativo, Inglés intermedio',
      experienceYears: 14,
      priceNio: 800,
      priceUsd: 21.84,
      community: 'Cooperativa Guardaparques Cañón de Somoto',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Baqueano nativo con más de 14 años guiando exploraciones por el Cañón de Somoto y cavernas segovianas. Especialista en seguridad acuática y geología.'
    },
    {
      id: 'gui-002',
      name: 'Ana Lucía Mendoza',
      department: 'Granada',
      municipality: 'Granada',
      specialty: 'Isletas de Granada, Historia Colonial & Arquitectura',
      carnetIntur: 'INTUR-GRA-0034',
      phone: '+505 8412-3390',
      email: 'anamendoza.granada@gmail.com',
      languages: 'Español nativo, Inglés fluido, Francés conversacional',
      experienceYears: 9,
      priceNio: 950,
      priceUsd: 25.94,
      community: 'Asociación de Guías Patrimoniales del Gran Lago',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Licenciada en turismo e investigadora de leyendas coloniales. Guía acreditada para navegación en las 365 isletas y senderos del Mombacho.'
    },
    {
      id: 'gui-003',
      name: 'Marcos Rivas Carcache',
      department: 'León',
      municipality: 'Larreynaga Malpaisillo',
      specialty: 'Sandboarding Volcán Cerro Negro & Vulcanología Activa',
      carnetIntur: 'INTUR-LEO-0089',
      phone: '+505 8733-1100',
      email: 'marcos.volcanes@leon.ni',
      languages: 'Español nativo, Inglés fluido',
      experienceYears: 11,
      priceNio: 900,
      priceUsd: 24.57,
      community: 'Colectivo Deportivo Cerro Negro',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Pionero en descensos de ceniza en Cerro Negro. Instructor certificado de seguridad volcánica y primeros auxilios en montaña.'
    },
    {
      id: 'gui-004',
      name: 'Don José Baqueano',
      department: 'Madriz',
      municipality: 'San José de Cusmapa',
      specialty: 'Sabiduría Campesina, Miradores Altos & Senderos Ancestrales',
      carnetIntur: 'INTUR-MAD-0004',
      phone: '+505 8443-1289',
      email: 'jose.comunitario@baqueano.ni',
      languages: 'Español nativo',
      experienceYears: 25,
      priceNio: 750,
      priceUsd: 20.48,
      community: 'Comunidad Indígena de Cusmapa',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Patriarca de las rutas de altura segovianas. Saberes medicinales del pinar, flora de neblina y caminos de herradura ancestrales.'
    },
    {
      id: 'gui-005',
      name: 'Ernesto Vallecillo',
      department: 'Rivas',
      municipality: 'Altagracia',
      specialty: 'Ascenso Volcán Maderas, Laguna Cráter & Petroglifos Ometepe',
      carnetIntur: 'INTUR-RIV-0145',
      phone: '+505 8501-4477',
      email: 'ernesto.ometepe@yahoo.com',
      languages: 'Español nativo, Inglés conversacional',
      experienceYears: 12,
      priceNio: 1100,
      priceUsd: 30.03,
      community: 'Red de Baqueanos Ometepe',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Conocedor de la selva nubosa del Maderas, fauna silvestre, senderos de lodo volcánico y el significado sagrado de los petroglifos precolombinos.'
    },
    {
      id: 'gui-006',
      name: 'Clara Centeno Matamoros',
      department: 'Matagalpa',
      municipality: 'Tuma-La Dalia',
      specialty: 'Senderos de Niebla, Cafetales Agroecológicos & Botánica',
      carnetIntur: 'INTUR-MAT-0067',
      phone: '+505 8922-6633',
      email: 'clara.centeno@matagalpa.ni',
      languages: 'Español nativo, Alemán intermedio',
      experienceYears: 8,
      priceNio: 850,
      priceUsd: 23.21,
      community: 'Cooperativa Ecoturística Selva Negra',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Especialista en observación de aves de nebliselva (Quetzal, Tucaneta) y procesos tradicionales del grano de café con abono orgánico.'
    },
    {
      id: 'gui-007',
      name: 'Heraldo Brooks',
      department: 'RACCS',
      municipality: 'Corn Island',
      specialty: 'Arrecifes Coralinos, Buceo Libre & Cultura Afrocaribeña Creole',
      carnetIntur: 'INTUR-RAC-0021',
      phone: '+505 8644-9911',
      email: 'heraldo.brooks@cornisland.com',
      languages: 'Creole English nativo, Español nativo, Miskito básico',
      experienceYears: 15,
      priceNio: 1200,
      priceUsd: 32.76,
      community: 'Pescadores Artesanales & Guías de Little Corn',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Buzo ancestral y defensor de los arrecifes caribeños. Guía de inmersión en arrecifes de coral virgen y pesca tradicional responsable.'
    },
    {
      id: 'gui-008',
      name: 'Danilo Robleto',
      department: 'Río San Juan',
      municipality: 'El Castillo',
      specialty: 'Reserva Biológica Indio Maíz, Historia de Fortaleza & Navegación Fluvial',
      carnetIntur: 'INTUR-RSJ-0055',
      phone: '+505 8311-2288',
      email: 'danilo.indio.maiz@gmail.com',
      languages: 'Español nativo',
      experienceYears: 18,
      priceNio: 1000,
      priceUsd: 27.30,
      community: 'Baqueanos del Río San Juan',
      certified: true,
      verified: true,
      status: 'published',
      photoUrl: '',
      bio: 'Piloto fluvial veterano en los rápidos del Río San Juan y guardián de las entradas autorizadas a la Reserva de Biosfera Indio Maíz.'
    }
  ];

  const state = {
    activeFilter: 'all',
    searchQuery: '',
    pendingDeleteId: null
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Obtener la colección de guías viva
  function getGuidesCollection() {
    if (!window.OpsState) window.OpsState = { collectionsData: {} };
    if (!window.OpsState.collectionsData['14-guias'] || window.OpsState.collectionsData['14-guias'].length === 0) {
      const mock = (window.BaqueanoMockData && window.BaqueanoMockData['14-guias']) || DEFAULT_GUIDES;
      window.OpsState.collectionsData['14-guias'] = JSON.parse(JSON.stringify(mock));
    }
    return window.OpsState.collectionsData['14-guias'];
  }

  // Guardar colección actualizada
  function setGuidesCollection(items) {
    if (!window.OpsState) window.OpsState = { collectionsData: {} };
    window.OpsState.collectionsData['14-guias'] = items;
    if (window.BaqueanoMockData) {
      window.BaqueanoMockData['14-guias'] = items;
    }
  }

  // ============================================================================
  // RENDERIZADO DE LA VISTA PRINCIPAL (#view-14-guias)
  // ============================================================================
  function render(panel) {
    if (!panel) panel = document.getElementById('view-14-guias');
    if (!panel) return;

    const allGuides = getGuidesCollection();

    // Métricas para tarjetas de cabecera
    const totalGuides = allGuides.length;
    const verifiedCount = allGuides.filter(g => g.certified === true || g.verified === true).length;
    const activeCount = allGuides.filter(g => (g.status || 'published') === 'published' || g.status === 'active').length;
    const suspendedCount = allGuides.filter(g => g.status === 'suspended').length;

    // Filtrar elementos
    let filteredGuides = allGuides.filter(g => {
      const isSuspended = g.status === 'suspended';
      const isVerified = g.certified === true || g.verified === true;

      if (state.activeFilter === 'verified' && !isVerified) return false;
      if (state.activeFilter === 'active' && isSuspended) return false;
      if (state.activeFilter === 'suspended' && !isSuspended) return false;

      // Filtro por departamento
      if (state.activeFilter.startsWith('dept:')) {
        const targetDept = state.activeFilter.replace('dept:', '').toLowerCase();
        if ((g.department || '').toLowerCase() !== targetDept) return false;
      }

      // Búsqueda
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const str = `${g.name || ''} ${g.department || ''} ${g.municipality || ''} ${g.specialty || ''} ${g.carnetIntur || ''} ${g.phone || ''} ${g.languages || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });

    panel.innerHTML = `
      <div class="ops-view-header">
        <div class="ops-view-title-group">
          <h1>
            <i class="fa-solid fa-person-hiking" style="color: var(--bq-accent);"></i>
            <span>Guías &amp; Baqueanos Certificados</span>
          </h1>
          <p class="ops-view-subtitle">
            DIRECTORIO CAMPESINO OFICIAL · ACREDITACIÓN LEY 1211 &amp; INTUR · CONTACTO DIRECTO SIN INTERMEDIARIOS
          </p>
        </div>
        <div class="ops-view-actions">
          <button type="button" class="btn-ops-matte accent" onclick="window.BaqueanoOpsGuides.openDrawer()">
            <i class="fa-solid fa-user-plus"></i>
            <span>Nuevo Guía Nativo</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas -->
      <div class="ops-kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem;">
        <div class="ops-kpi-card" style="border-left: 3px solid #165D6F;">
          <span class="ops-kpi-label"><i class="fa-solid fa-users" style="margin-right: 0.35rem;"></i> Total Guías</span>
          <strong class="ops-kpi-value" style="color: #F8FAFC;">${totalGuides}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Registrados en territorio</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #00BAF2;">
          <span class="ops-kpi-label"><i class="fa-solid fa-certificate" style="margin-right: 0.35rem;"></i> INTUR / Verificados</span>
          <strong class="ops-kpi-value" style="color: #00BAF2;">${verifiedCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Acreditación verificable</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #10B981;">
          <span class="ops-kpi-label"><i class="fa-solid fa-circle-check" style="margin-right: 0.35rem;"></i> En Servicio Activo</span>
          <strong class="ops-kpi-value" style="color: #10B981;">${activeCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Disponibles para expedición</span>
        </div>
        <div class="ops-kpi-card" style="border-left: 3px solid #EF4444;">
          <span class="ops-kpi-label"><i class="fa-solid fa-ban" style="margin-right: 0.35rem;"></i> Suspendidos</span>
          <strong class="ops-kpi-value" style="color: ${suspendedCount > 0 ? '#EF4444' : 'var(--ops-text-muted)'};">${suspendedCount}</strong>
          <span style="font-size:0.74rem; color:var(--ops-text-muted); margin-top:0.2rem;">Inactivos en catálogo</span>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="ops-crud-toolbar" style="margin-bottom: 1.25rem;">
        <div class="ops-filter-group" style="display: flex; gap: 0.45rem; flex-wrap: wrap;">
          <button type="button" class="ops-filter-pill ${state.activeFilter === 'all' ? 'is-active' : ''}" onclick="window.BaqueanoOpsGuides.filterBy('all')">
            Todos <span class="ops-filter-count">${totalGuides}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilter === 'verified' ? 'is-active' : ''}" onclick="window.BaqueanoOpsGuides.filterBy('verified')">
            Verificados INTUR <span class="ops-filter-count">${verifiedCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilter === 'active' ? 'is-active' : ''}" onclick="window.BaqueanoOpsGuides.filterBy('active')">
            Activos <span class="ops-filter-count">${activeCount}</span>
          </button>
          <button type="button" class="ops-filter-pill ${state.activeFilter === 'suspended' ? 'is-active' : ''}" onclick="window.BaqueanoOpsGuides.filterBy('suspended')">
            Suspendidos <span class="ops-filter-count">${suspendedCount}</span>
          </button>
        </div>

        <div class="ops-search-input-wrap" style="flex: 1; max-width: 380px;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" class="ops-filter-search-input" id="opsGuideSearchInput"
            placeholder="Buscar por nombre, territorio, especialidad o carnet..."
            value="${escapeHtml(state.searchQuery)}"
            oninput="window.BaqueanoOpsGuides.search(this.value)">
        </div>
      </div>

      <!-- Tabla de Guías -->
      <div class="ops-table-wrap">
        <table class="ops-table-matte">
          <thead>
            <tr>
              <th style="width: 270px;">Guía / Acreditación</th>
              <th>Territorio / Comunidad</th>
              <th>Especialidad Nativa</th>
              <th>Idiomas &amp; Años</th>
              <th>Contacto Directo</th>
              <th style="min-width: 140px;">Tarifa Diaria (Regla 11)</th>
              <th>Estado</th>
              <th style="text-align: right; width: 140px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGuides.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 3rem 1.5rem;">
                  <div class="ops-empty-state">
                    <i class="fa-solid fa-person-hiking ops-empty-icon" style="font-size: 2.2rem; color: var(--ops-text-muted); margin-bottom: 0.75rem;"></i>
                    <div class="ops-empty-title" style="color: #fff; font-size: 1.05rem; font-weight: 700;">No se encontraron guías</div>
                    <div class="ops-empty-desc" style="color: var(--ops-text-secondary); font-size: 0.85rem; margin-top: 0.35rem;">
                      No hay registros que coincidan con la búsqueda o filtro seleccionado.
                    </div>
                    <button type="button" class="btn-ops-matte primary" style="margin-top: 1.25rem;" onclick="window.BaqueanoOpsGuides.openDrawer()">
                      <i class="fa-solid fa-user-plus"></i> Registrar Nuevo Guía
                    </button>
                  </div>
                </td>
              </tr>
            ` : filteredGuides.map(guide => renderGuideRow(guide)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Renderizar fila de Guía
  function renderGuideRow(guide) {
    const isSuspended = guide.status === 'suspended';
    const isVerified = guide.certified === true || guide.verified === true;
    const name = guide.name || 'Guía Baqueano';
    const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'BQ';
    const department = guide.department || 'Nacional';
    const municipality = guide.municipality ? `${guide.municipality}, ` : '';
    const carnet = guide.carnetIntur || 'Acreditación en trámite';
    const phoneClean = (guide.phone || '').replace(/\D/g, '');
    const whatsappLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

    // Regla 11: Córdobas primero
    const priceNio = Number(guide.priceNio || (guide.priceUsd ? guide.priceUsd * BCN_EXCHANGE_RATE : 800));
    const priceUsd = Number(guide.priceUsd || (priceNio / BCN_EXCHANGE_RATE)).toFixed(2);

    return `
      <tr class="ops-table-row ${isSuspended ? 'is-suspended' : ''}">
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #165D6F, #0F172A); border: 1px solid rgba(244, 230, 193, 0.25); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #F4E6C1; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ${guide.photoUrl ? `<img src="${escapeHtml(guide.photoUrl)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="">` : initials}
            </div>
            <div style="display: flex; flex-direction: column; min-width: 0;">
              <span style="font-weight: 700; color: #FFFFFF; font-size: 0.92rem; display: flex; align-items: center; gap: 0.35rem;">
                ${escapeHtml(name)}
                ${isVerified ? `<span title="Guía Verificado con Acreditación Oficial" style="color: #00BAF2; font-size: 0.85rem;"><i class="fa-solid fa-circle-check"></i></span>` : ''}
              </span>
              <span style="font-size: 0.74rem; color: var(--ops-text-muted); font-family: monospace;">
                <i class="fa-solid fa-id-card" style="color: var(--bq-accent); margin-right: 0.25rem;"></i>${escapeHtml(carnet)}
              </span>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <strong style="color: #F8FAFC; font-size: 0.85rem;">
              <i class="fa-solid fa-location-dot" style="color: var(--bq-accent); margin-right: 0.3rem;"></i>${escapeHtml(department)}
            </strong>
            <span style="font-size: 0.74rem; color: var(--ops-text-secondary); margin-top: 0.15rem;">
              ${escapeHtml(municipality)}${escapeHtml(guide.community || 'Comunidad local')}
            </span>
          </div>
        </td>
        <td>
          <span style="color: #E2E8F0; font-size: 0.84rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35;" title="${escapeHtml(guide.specialty || '')}">
            ${escapeHtml(guide.specialty || 'Guianza general')}
          </span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.15rem;">
            <span style="font-size: 0.8rem; color: #CBD5E1;">${escapeHtml(guide.languages || 'Español')}</span>
            <span style="font-size: 0.72rem; color: var(--ops-text-muted);"><i class="fa-solid fa-clock-rotate-left"></i> ${guide.experienceYears ? `${guide.experienceYears} años exp.` : 'Baqueano nativo'}</span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.2rem;">
            ${whatsappLink ? `
              <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="color: #10B981; font-weight: 700; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;" title="Abrir WhatsApp">
                <i class="fa-brands fa-whatsapp" style="font-size: 0.95rem;"></i> ${escapeHtml(guide.phone || '')}
              </a>
            ` : `<span style="color: var(--ops-text-muted); font-size: 0.82rem;">${escapeHtml(guide.phone || '—')}</span>`}
            ${guide.email ? `<span style="font-size: 0.72rem; color: var(--ops-text-muted);"><i class="fa-regular fa-envelope"></i> ${escapeHtml(guide.email)}</span>` : ''}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.1rem;">
            <strong style="color: #F4E6C1; font-size: 0.92rem; font-weight: 800; font-family: 'League Spartan', var(--baqueano-font-display, sans-serif); letter-spacing: 0.3px;">
              C$ ${priceNio.toLocaleString('es-NI', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </strong>
            <span style="font-size: 0.73rem; color: #38BDF8; font-weight: 600;">
              ≈ $${priceUsd} USD / día
            </span>
          </div>
        </td>
        <td>
          ${isSuspended ? `
            <span class="ops-badge-pill danger" style="display: inline-flex; align-items: center; gap: 0.3rem;">
              <i class="fa-solid fa-circle-pause"></i> Suspendido
            </span>
          ` : `
            <span class="ops-badge-pill success" style="display: inline-flex; align-items: center; gap: 0.3rem;">
              <i class="fa-solid fa-circle-check"></i> Activo
            </span>
          `}
        </td>
        <td>
          <div class="ops-table-actions" style="justify-content: flex-end; gap: 0.35rem;">
            <button type="button" class="btn-ops-icon" title="Editar ficha del guía" onclick="window.BaqueanoOpsGuides.openDrawer('${escapeHtml(guide.id)}')">
              <i class="fa-solid fa-pen-to-square" style="color: #38BDF8;"></i>
            </button>
            <button type="button" class="btn-ops-icon" title="${isSuspended ? 'Reactivar guía' : 'Suspender guía'}" onclick="window.BaqueanoOpsGuides.toggleSuspend('${escapeHtml(guide.id)}')">
              <i class="fa-solid ${isSuspended ? 'fa-play' : 'fa-pause'}" style="color: ${isSuspended ? '#10B981' : '#F59E0B'};"></i>
            </button>
            <button type="button" class="btn-ops-icon" title="Eliminar guía del catálogo" onclick="window.BaqueanoOpsGuides.openDeleteModal('${escapeHtml(guide.id)}')">
              <i class="fa-solid fa-trash-can" style="color: #EF4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // ============================================================================
  // GESTIÓN DEL DRAWER DEDICADO (#opsGuideDrawer)
  // ============================================================================
  function openDrawer(guideId = null) {
    const drawer = document.getElementById('opsGuideDrawer');
    if (!drawer) return;

    const allGuides = getGuidesCollection();
    const guide = guideId ? allGuides.find(g => g.id === guideId) : null;

    document.getElementById('opsGuideFormId').value = guide ? guide.id : '';
    document.getElementById('opsGuideDrawerTitle').textContent = guide ? 'Editar Guía Nativo Certificado' : 'Nuevo Guía Nativo Acreditado';
    document.getElementById('opsGuideDrawerSubtitle').textContent = guide ? `ID: ${guide.id} · ${guide.carnetIntur || 'Acreditación en curso'}` : 'Registro bajo Ley 1211 e INTUR';

    // Rellenar campos
    document.getElementById('opsGuideName').value = guide ? (guide.name || '') : '';
    document.getElementById('opsGuideDepartment').value = guide ? (guide.department || 'Madriz') : 'Madriz';
    document.getElementById('opsGuideMunicipality').value = guide ? (guide.municipality || '') : '';
    document.getElementById('opsGuideSpecialty').value = guide ? (guide.specialty || '') : '';
    document.getElementById('opsGuideCarnet').value = guide ? (guide.carnetIntur || '') : '';
    document.getElementById('opsGuidePhone').value = guide ? (guide.phone || '') : '';
    document.getElementById('opsGuideEmail').value = guide ? (guide.email || '') : '';
    document.getElementById('opsGuideLanguages').value = guide ? (guide.languages || 'Español') : 'Español';
    document.getElementById('opsGuideExperience').value = guide ? (guide.experienceYears || '') : '';
    document.getElementById('opsGuideCommunity').value = guide ? (guide.community || '') : '';
    document.getElementById('opsGuideBio').value = guide ? (guide.bio || '') : '';
    document.getElementById('opsGuidePhotoUrl').value = guide ? (guide.photoUrl || '') : '';

    // Tarifas
    const priceNio = guide ? (guide.priceNio || (guide.priceUsd ? Math.round(guide.priceUsd * BCN_EXCHANGE_RATE) : '')) : '';
    const priceUsd = guide ? (guide.priceUsd || (guide.priceNio ? (guide.priceNio / BCN_EXCHANGE_RATE).toFixed(2) : '')) : '';
    document.getElementById('opsGuidePriceNio').value = priceNio;
    document.getElementById('opsGuidePriceUsd').value = priceUsd;

    // Checks
    document.getElementById('opsGuideVerified').checked = guide ? (guide.certified === true || guide.verified === true) : true;
    document.getElementById('opsGuideStatus').value = guide ? (guide.status || 'published') : 'published';

    // Botón de suspender dentro del drawer
    const suspendBtn = document.getElementById('opsGuideDrawerSuspendBtn');
    if (suspendBtn) {
      if (guide) {
        suspendBtn.style.display = 'inline-flex';
        const isSusp = guide.status === 'suspended';
        suspendBtn.innerHTML = `<i class="fa-solid ${isSusp ? 'fa-play' : 'fa-pause'}"></i> ${isSusp ? 'Reactivar' : 'Suspender'}`;
        suspendBtn.onclick = function () { toggleSuspend(guide.id); closeDrawer(); };
      } else {
        suspendBtn.style.display = 'none';
      }
    }

    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = document.getElementById('opsGuideDrawer');
    if (drawer) drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Cálculos de divisa BCN (Regla 11: Córdobas Primero)
  function calculateUsdFromNio() {
    const nioInput = document.getElementById('opsGuidePriceNio');
    const usdInput = document.getElementById('opsGuidePriceUsd');
    const nio = parseFloat(nioInput?.value);
    if (!isNaN(nio) && nio >= 0) {
      usdInput.value = (nio / BCN_EXCHANGE_RATE).toFixed(2);
    } else {
      usdInput.value = '';
    }
  }

  function calculateNioFromUsd() {
    const nioInput = document.getElementById('opsGuidePriceNio');
    const usdInput = document.getElementById('opsGuidePriceUsd');
    const usd = parseFloat(usdInput?.value);
    if (!isNaN(usd) && usd >= 0) {
      nioInput.value = Math.round(usd * BCN_EXCHANGE_RATE);
    } else {
      nioInput.value = '';
    }
  }

  // ============================================================================
  // GUARDAR GUÍA (AGREGAR O MODIFICAR)
  // ============================================================================
  function saveGuide(event) {
    if (event) event.preventDefault();

    const id = document.getElementById('opsGuideFormId').value.trim();
    const name = document.getElementById('opsGuideName').value.trim();
    const department = document.getElementById('opsGuideDepartment').value.trim();
    const municipality = document.getElementById('opsGuideMunicipality').value.trim();
    const specialty = document.getElementById('opsGuideSpecialty').value.trim();
    const carnetIntur = document.getElementById('opsGuideCarnet').value.trim();
    const phone = document.getElementById('opsGuidePhone').value.trim();
    const email = document.getElementById('opsGuideEmail').value.trim();
    const languages = document.getElementById('opsGuideLanguages').value.trim();
    const experienceYears = parseInt(document.getElementById('opsGuideExperience').value) || 0;
    const community = document.getElementById('opsGuideCommunity').value.trim();
    const bio = document.getElementById('opsGuideBio').value.trim();
    const photoUrl = document.getElementById('opsGuidePhotoUrl').value.trim();

    const priceNio = parseFloat(document.getElementById('opsGuidePriceNio').value) || 0;
    const priceUsd = parseFloat(document.getElementById('opsGuidePriceUsd').value) || (priceNio / BCN_EXCHANGE_RATE);

    const isVerified = document.getElementById('opsGuideVerified').checked;
    const status = document.getElementById('opsGuideStatus').value;

    if (!name) {
      alert('Por favor ingresa el nombre completo del guía.');
      document.getElementById('opsGuideName').focus();
      return;
    }
    if (!specialty) {
      alert('Por favor especifica la especialidad turística del guía.');
      document.getElementById('opsGuideSpecialty').focus();
      return;
    }

    const allGuides = getGuidesCollection();
    let guideItem;

    if (id) {
      // Modificar existente
      const index = allGuides.findIndex(g => g.id === id);
      if (index === -1) return;
      guideItem = {
        ...allGuides[index],
        name,
        department,
        municipality,
        specialty,
        carnetIntur,
        phone,
        email,
        languages,
        experienceYears,
        community,
        bio,
        photoUrl,
        priceNio,
        priceUsd: Number(priceUsd.toFixed(2)),
        certified: isVerified,
        verified: isVerified,
        status,
        updatedAt: new Date().toISOString()
      };
      allGuides[index] = guideItem;
    } else {
      // Crear nuevo
      const newId = `gui-${Date.now().toString().slice(-6)}`;
      guideItem = {
        id: newId,
        name,
        department,
        municipality,
        specialty,
        carnetIntur: carnetIntur || `INTUR-${department.slice(0, 3).toUpperCase()}-AUTO`,
        phone,
        email,
        languages,
        experienceYears,
        community,
        bio,
        photoUrl,
        priceNio,
        priceUsd: Number(priceUsd.toFixed(2)),
        certified: isVerified,
        verified: isVerified,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allGuides.unshift(guideItem);
    }

    setGuidesCollection(allGuides);
    closeDrawer();
    render();

    // Notificación Toast
    if (window.OpsToast) {
      window.OpsToast.show(`Guía "${name}" guardado exitosamente.`, 'success');
    }

    // Sincronización asíncrona con Supabase / Firestore
    syncGuideWithCloud(guideItem);
  }

  // ============================================================================
  // SUSPENDER / REACTIVAR GUÍA
  // ============================================================================
  function toggleSuspend(guideId) {
    const allGuides = getGuidesCollection();
    const index = allGuides.findIndex(g => g.id === guideId);
    if (index === -1) return;

    const currentStatus = allGuides[index].status || 'published';
    const newStatus = currentStatus === 'suspended' ? 'published' : 'suspended';
    allGuides[index].status = newStatus;
    allGuides[index].updatedAt = new Date().toISOString();

    setGuidesCollection(allGuides);
    render();

    const guideName = allGuides[index].name;
    if (window.OpsToast) {
      window.OpsToast.show(
        newStatus === 'suspended'
          ? `Guía "${guideName}" suspendido temporalmente.`
          : `Guía "${guideName}" reactivado en catálogo.`,
        newStatus === 'suspended' ? 'warning' : 'success'
      );
    }

    syncGuideWithCloud(allGuides[index]);
  }

  // ============================================================================
  // ELIMINACIÓN DEFENSIVA DE GUÍA
  // ============================================================================
  function openDeleteModal(guideId) {
    const allGuides = getGuidesCollection();
    const guide = allGuides.find(g => g.id === guideId);
    if (!guide) return;

    state.pendingDeleteId = guideId;
    const modal = document.getElementById('opsGuideDeleteModal');
    const nameEl = document.getElementById('opsGuideDeleteName');
    if (nameEl) nameEl.textContent = guide.name;
    if (modal) modal.classList.add('is-open');
  }

  function closeDeleteModal() {
    const modal = document.getElementById('opsGuideDeleteModal');
    if (modal) modal.classList.remove('is-open');
    state.pendingDeleteId = null;
  }

  function confirmDelete() {
    if (!state.pendingDeleteId) return;
    const allGuides = getGuidesCollection();
    const guideToDelete = allGuides.find(g => g.id === state.pendingDeleteId);
    const guideName = guideToDelete ? guideToDelete.name : 'Guía';

    const updated = allGuides.filter(g => g.id !== state.pendingDeleteId);
    setGuidesCollection(updated);
    closeDeleteModal();
    render();

    if (window.OpsToast) {
      window.OpsToast.show(`Guía "${guideName}" eliminado del catálogo.`, 'error');
    }
  }

  // ============================================================================
  // FILTROS Y BÚSQUEDA
  // ============================================================================
  function filterBy(filterType) {
    state.activeFilter = filterType;
    render();
  }

  function search(query) {
    state.searchQuery = query || '';
    render();
  }

  // ============================================================================
  // SINCRONIZACIÓN DEFENSIVA CON CLOUD (SUPABASE / FIRESTORE)
  // ============================================================================
  async function syncGuideWithCloud(guideItem) {
    try {
      // 1. Supabase (Fuente de Verdad Operacional)
      if (window.baqueanoSupabase && typeof window.baqueanoSupabase.from === 'function') {
        const payload = {
          id: guideItem.id,
          name: guideItem.name,
          department: guideItem.department,
          municipality: guideItem.municipality,
          specialty: guideItem.specialty,
          carnet_intur: guideItem.carnetIntur,
          phone: guideItem.phone,
          email: guideItem.email,
          languages: guideItem.languages,
          experience_years: guideItem.experienceYears,
          community: guideItem.community,
          price_nio: guideItem.priceNio,
          price_usd: guideItem.priceUsd,
          certified: guideItem.certified,
          verified: guideItem.verified,
          status: guideItem.status,
          bio: guideItem.bio,
          photo_url: guideItem.photoUrl,
          updated_at: new Date().toISOString()
        };
        await window.baqueanoSupabase.from('guides').upsert(payload, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('[BaqueanoOpsGuides] Sincronización cloud en segundo plano:', err.message);
    }
  }

  // Inicialización y enlace global
  window.BaqueanoOpsGuides = {
    render,
    openDrawer,
    closeDrawer,
    saveGuide,
    toggleSuspend,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    filterBy,
    search,
    calculateUsdFromNio,
    calculateNioFromUsd
  };

  // Auto-render si el hash de navegación es #14-guias
  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash === '#14-guias') {
      setTimeout(() => render(), 150);
    }
  });

})(window, document);
