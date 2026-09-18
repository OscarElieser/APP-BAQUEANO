// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SINCRONIZACIÓN PÚBLICA CMS EN TIEMPO REAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar de forma reactiva las páginas públicas del portal web de BAQUEANO
//   (aliados.html, gastronomia.html, historia.html, index.html, etc.) directamente
//   a Cloud Firestore, asegurando que todo cambio editorial, creación, edición,
//   publicación, despublicación o sello verificado asignado desde el Ops Center
//   se refleje de inmediato ante el explorador sin necesidad de tocar código fuente.
// - Garantizar una estrategia de migración progresiva y tolerancia a fallos:
//   si Firestore no contiene registros o el usuario se encuentra desconectado,
//   se preserva el contenido nativo en HTML para que el portal jamás quede vacío.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Detección automática de la página actual según el DOM y URL.
// - Subscripción reactiva mediante onSnapshot() en colecciones con status == 'published'.
// - Renderizado progresivo del DOM sustituyendo o complementando las cuadrículas
//   con animaciones fluidas a 60fps y efectos visuales de alta gama.
// - Integración con el Banner Global de Anuncios configurado en app_config/global.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoPublicSync: Objeto global con inicializadores por página:
//   * syncAlliesPage(): Sincroniza cooperativas y comercios aliados en tiempo real.
//   * syncGastronomyPage(): Sincroniza platillos y tradiciones culinarias campesinas.
//   * syncHistoryPage(): Sincroniza la línea de tiempo soberana nacional.
//   * syncGlobalAnnouncement(): Sincroniza el cintillo dinámico de anuncio superior.
// ============================================================================

(function(window, document) {
  'use strict';

  const BaqueanoPublicSync = {
    // ------------------------------------------------------------------------
    // OBTENCIÓN DEFENSIVA DE LA INSTANCIA DE FIRESTORE
    // ------------------------------------------------------------------------
    getDb() {
      if (window.firebase && window.firebase.firestore) {
        return window.firebase.firestore();
      }
      return null;
    },

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN AUTOMÁTICA SEGÚN LA PÁGINA ACTIVA
    // ------------------------------------------------------------------------
    init() {
      console.info('[BaqueanoPublicSync] Conectando páginas públicas con Cloud Firestore...');
      this.syncGlobalAnnouncement();

      const path = window.location.pathname.toLowerCase();
      if (path.includes('aliados.html') || document.querySelector('.allies-3d-grid')) {
        this.syncAlliesPage();
      }
      if (path.includes('gastronomia.html') || document.querySelector('.gastronomy-grid')) {
        this.syncGastronomyPage();
      }
      if (path.includes('historia.html') || document.querySelector('.timeline-periods-flow')) {
        this.syncHistoryPage();
      }
    },

    // ------------------------------------------------------------------------
    // 1. ANUNCIO GLOBAL EN TIEMPO REAL (app_config/global)
    // ------------------------------------------------------------------------
    syncGlobalAnnouncement() {
      const db = this.getDb();
      if (!db) return;

      db.collection('app_config').doc('global').onSnapshot(
        (doc) => {
          if (!doc.exists) return;
          const data = doc.data();
          const announcement = (data.announcementText || '').trim();

          let bar = document.getElementById('bqGlobalAnnouncementBar');
          if (!announcement) {
            if (bar) bar.style.display = 'none';
            return;
          }

          if (!bar) {
            bar = document.createElement('div');
            bar.id = 'bqGlobalAnnouncementBar';
            bar.style.cssText = 'background: #F65E01; color: #FFFFFF; font-size: 0.84rem; font-weight: 600; text-align: center; padding: 0.55rem 1rem; position: sticky; top: 0; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem;';
            document.body.prepend(bar);
          }

          bar.style.display = 'flex';
          bar.innerHTML = `<i class="fa-solid fa-bullhorn"></i> <span>${this.escape(announcement)}</span>`;
        },
        (err) => console.warn('[BaqueanoPublicSync] Error en anuncio global:', err.message)
      );
    },

    // ------------------------------------------------------------------------
    // 2. SINCRONIZACIÓN DE ALIADOS Y COOPERATIVAS (aliados.html)
    // ------------------------------------------------------------------------
    syncAlliesPage() {
      const grid = document.querySelector('.allies-3d-grid');
      if (!grid) return;

      const db = this.getDb();
      if (!db) return;

      db.collection('businesses')
        .where('status', '==', 'published')
        .onSnapshot(
          (snapshot) => {
            // Si no existen negocios publicados en Firestore, conservar el respaldo estático
            if (snapshot.empty) {
              console.info('[BaqueanoPublicSync] Colección businesses vacía en Firestore. Preservando contenido nativo.');
              return;
            }

            const allies = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

            // Renderizar tarjetas 3D fluidas con los datos reales administrados
            grid.innerHTML = allies.map((ally) => {
              const name = ally.name || ally.title || 'Aliado Comunitario';
              const territory = (ally.department || 'Nicaragua').toUpperCase();
              const municipality = (ally.municipality || 'Comunitario').toUpperCase();
              const category = (ally.category || 'Hospedaje Rural').toUpperCase();
              const image = ally.imageUrl || ally.image || 'assets/images/destinos/finca_magdalena.jpg';
              const isVerified = ally.verified === true || ally.verificationStatus === 'verified';
              const description = ally.description || ally.shortDesc || 'Cooperativa campesina dedicada al turismo ecológico sostenible.';
              const rawPhone = ally.phone || ally.whatsapp || '50584431289';
              const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

              return `
                <div class="flip-card-3d" tabindex="0">
                  <div class="flip-card-inner">
                    <div class="flip-card-front">
                      <div class="flip-front-img-wrap">
                        <img src="${image}" alt="${this.escape(name)}" class="flip-front-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='assets/images/destinos/finca_magdalena.jpg'">
                      </div>
                      <div class="flip-front-body">
                        <span class="aliados-inline-002">${this.escape(territory)} • ${this.escape(municipality)}</span>
                        <h3 class="flip-front-title">${this.escape(name)}</h3>
                        <div class="flip-hint"><i class="fa-solid fa-arrows-rotate"></i> Toca para girar y contactar</div>
                      </div>
                    </div>
                    <div class="flip-card-back">
                      <div>
                        <span class="aliados-inline-003" style="display: inline-flex; align-items: center; gap: 0.35rem; color: ${isVerified ? '#10B981' : '#F59E0B'};">
                          <i class="fa-solid ${isVerified ? 'fa-shield-check' : 'fa-certificate'}"></i>
                          ${isVerified ? 'VERIFICADO BAQUEANO' : 'EN PROCESO DE ACREDITACIÓN'}
                        </span>
                        <h3 class="flip-back-title">${this.escape(name)}</h3>
                        <p class="flip-back-desc">
                          ${this.escape(description)}
                        </p>
                      </div>
                      <div class="flip-back-actions">
                        ${cleanPhone ? `
                          <a href="https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hola%20${encodeURIComponent(name)},%20deseo%20coordinar%20mi%20visita%20a%20través%20de%20Baqueano" target="_blank" rel="noopener noreferrer" class="btn-flip-contact btn-flip-wa">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp Directo
                          </a>
                          <a href="tel:${cleanPhone}" class="btn-flip-contact btn-flip-call">
                            <i class="fa-solid fa-phone"></i> Llamar al Coordinador
                          </a>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('');

            // Re-vincular eventos táctiles para giro 3D en dispositivos móviles
            grid.querySelectorAll('.flip-card-3d').forEach((card) => {
              card.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                this.classList.toggle('flipped');
              });
            });
          },
          (error) => console.warn('[BaqueanoPublicSync] Error escuchando businesses:', error.message)
        );
    },

    // ------------------------------------------------------------------------
    // 3. SINCRONIZACIÓN DE GASTRONOMÍA ANCESTRAL (gastronomia.html)
    // ------------------------------------------------------------------------
    syncGastronomyPage() {
      const grid = document.querySelector('.gastronomy-grid');
      if (!grid) return;

      const db = this.getDb();
      if (!db) return;

      db.collection('gastronomy')
        .where('status', '==', 'published')
        .onSnapshot(
          (snapshot) => {
            if (snapshot.empty) {
              console.info('[BaqueanoPublicSync] Colección gastronomy vacía en Firestore. Preservando contenido nativo.');
              return;
            }

            const dishes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

            grid.innerHTML = dishes.map((dish) => {
              const name = dish.title || dish.name || 'Platillo Tradicional';
              const image = dish.imageUrl || dish.image || 'assets/images/comida/gallo_pinto.jpg';
              const ingredients = dish.dayPass || dish.ingredients || dish.shortDesc || 'Maíz nixtamalizado, ingredientes criollos tradicionales.';
              const description = dish.description || 'Elaborado con amor campirano según la receta ancestral de las abuelas.';

              return `
                <div class="gastro-card">
                  <div class="gastro-img-wrap">
                    <img src="${image}" alt="${this.escape(name)}" class="gastro-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='assets/images/comida/gallo_pinto.jpg'">
                  </div>
                  <div class="gastro-body">
                    <h3 class="gastro-title">${this.escape(name)}</h3>
                    <div class="gastro-ingredients"><i class="fa-solid fa-pepper-hot"></i> ${this.escape(ingredients)}</div>
                    <p class="gastronomia-inline-001">
                      ${this.escape(description)}
                    </p>
                  </div>
                </div>
              `;
            }).join('');
          },
          (error) => console.warn('[BaqueanoPublicSync] Error escuchando gastronomy:', error.message)
        );
    },

    // ------------------------------------------------------------------------
    // 4. SINCRONIZACIÓN DE HISTORIA PATRIA (historia.html)
    // ------------------------------------------------------------------------
    syncHistoryPage() {
      const flow = document.querySelector('.timeline-periods-flow');
      if (!flow) return;

      const db = this.getDb();
      if (!db) return;

      db.collection('history_timeline')
        .where('status', '==', 'published')
        .orderBy('sortOrder', 'asc')
        .onSnapshot(
          (snapshot) => {
            if (snapshot.empty) {
              console.info('[BaqueanoPublicSync] Colección history_timeline vacía en Firestore. Preservando contenido nativo.');
              return;
            }

            const periods = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

            flow.innerHTML = periods.map((period, idx) => {
              const title = period.title || period.name || 'Periodo Histórico';
              const era = period.department || period.category || `Periodo ${idx + 1}`;
              const description = period.description || '';

              return `
                <div class="timeline-period-card">
                  <div class="timeline-period-badge">${idx + 1}</div>
                  <div class="timeline-content-box">
                    <div class="timeline-era-tag">${this.escape(era)}</div>
                    <h3>${this.escape(title)}</h3>
                    <p>${this.escape(description)}</p>
                  </div>
                </div>
              `;
            }).join('');
          },
          (error) => console.warn('[BaqueanoPublicSync] Error escuchando history_timeline:', error.message)
        );
    },

    // ------------------------------------------------------------------------
    // UTILIDAD DE SANITIZACIÓN CONTRA INYECCIONES XSS
    // ------------------------------------------------------------------------
    escape(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // Exponer API en el objeto global
  window.BaqueanoPublicSync = BaqueanoPublicSync;

  // Auto-iniciar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BaqueanoPublicSync.init());
  } else {
    BaqueanoPublicSync.init();
  }

})(window, document);
