// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SINCRONIZACIÓN PÚBLICA CMS EN TIEMPO REAL
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Conectar de forma reactiva las páginas públicas del portal web de BAQUEANO
//   (index.html, destinos.html, aliados.html, gastronomia.html, historia.html, etc.)
//   directamente a Cloud Firestore (site_pages, businesses, gastronomy, etc.),
//   asegurando que todo cambio editorial, creación, edición, publicación,
//   despublicación o restauración realizado desde el Ops Center se refleje
//   de inmediato ante el explorador sin necesidad de tocar código fuente.
// - Garantizar una estrategia de migración progresiva y tolerancia a fallos:
//   si Firestore no contiene registros o el usuario se encuentra desconectado,
//   se preserva el contenido nativo en HTML para que el portal jamás quede vacío.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Detección automática de la página actual según el DOM y URL.
// - Subscripción reactiva en tiempo real con onSnapshot() a site_pages/{pageId}.
// - Modificación dinámica de atributos de visibilidad (display: none / '') según
//   el estado de publicación (published vs draft vs trashed).
// - Actualización de encabezados, subtítulos y enlaces de llamada a la acción (CTA).
// - Soporte para inyección de bloques dinámicos nuevos creados en vivo desde el CMS.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoPublicSync: Objeto global con inicializadores por página:
//   * syncDynamicPageSections(): Sincroniza visibilidad y bloques de site_pages.
//   * applyPageSections(): Aplica visibilidad y textos a secciones del DOM.
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
    // DETECCIÓN DE LA PÁGINA ACTUAL DEL ECOSISTEMA
    // ------------------------------------------------------------------------
    detectCurrentPageId() {
      const path = window.location.pathname.toLowerCase();
      const filename = path.split('/').pop() || 'index.html';
      let pageId = filename.replace('.html', '').trim() || 'index';
      if (pageId === '' || pageId === '/') pageId = 'index';
      return pageId;
    },

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN AUTOMÁTICA SEGÚN LA PÁGINA ACTIVA
    // ------------------------------------------------------------------------
    init() {
      console.info('[BaqueanoPublicSync] Conectando páginas públicas con Cloud Firestore...');
      this.syncGlobalAnnouncement();
      this.syncDynamicPageSections();

      const path = window.location.pathname.toLowerCase();
      if (path.includes('aliados.html') || document.querySelector('.allies-3d-grid')) {
        this.syncAlliesPage();
      }
      if (path.includes('destinos.html') || document.querySelector('.dest-card-pro, #destinosGrid, .destinos-grid, .featured-destinations')) {
        this.syncDestinationsCatalog();
      }
      if (path.includes('gastronomia.html') || document.querySelector('.gastronomy-grid')) {
        this.syncGastronomyPage();
      }
      if (path.includes('historia.html') || document.querySelector('.timeline-periods-flow')) {
        this.syncHistoryPage();
      }
    },

    // ------------------------------------------------------------------------
    // 0. SINCRONIZACIÓN UNIVERSAL DE PÁGINAS Y SECCIONES (site_pages/{pageId})
    // ------------------------------------------------------------------------
    syncDynamicPageSections() {
      const pageId = this.detectCurrentPageId();
      if (pageId === 'admin') return;

      const db = this.getDb();
      if (!db) {
        setTimeout(() => this.syncDynamicPageSections(), 600);
        return;
      }

      db.collection('site_pages').doc(pageId).onSnapshot(
        (doc) => {
          if (!doc.exists) return;
          const data = doc.data();
          const sections = data.sections || [];
          if (!sections.length) return;
          this.applyPageSections(pageId, sections);
        },
        (err) => console.warn(`[BaqueanoPublicSync] Error en secciones de ${pageId}:`, err.message)
      );
    },

    applyPageSections(pageId, sections) {
      sections.forEach((sec) => {
        const status = sec.status || 'published';
        const secId = sec.id;

        // Buscar elemento en el DOM
        let targetEl = document.getElementById(secId) || document.querySelector(`[data-section-id="${secId}"]`);

        // Heurísticas defensivas si no tiene id estricto
        if (!targetEl) {
          if (secId.includes('hero') || sec.type === 'hero') {
            targetEl = document.querySelector('.hero-section, .hero, header.hero, .page-hero');
          } else if (secId.includes('map') || secId.includes('mapa') || sec.type === 'map') {
            targetEl = document.getElementById('mapaVivoContainer') || document.getElementById('baqueanoInteractiveMap') || document.querySelector('.map-section');
          } else if (secId.includes('destinos') || secId.includes('rutas')) {
            targetEl = document.querySelector('.featured-destinations, .destinations-grid, .destinos-section, #destinosGrid');
          } else if (secId.includes('calc') || secId.includes('cotizador')) {
            targetEl = document.getElementById('cotizadorBimonedaSection') || document.querySelector('.calculator-section');
          } else if (secId.includes('faq')) {
            targetEl = document.querySelector('.faq-section, #faqSection');
          } else if (secId.includes('cta') || sec.type === 'cta') {
            targetEl = document.querySelector('.cta-section, .download-cta-section');
          }
        }

        if (targetEl) {
          // Ocultar / Mostrar según status
          if (status === 'draft' || status === 'trashed') {
            targetEl.style.display = 'none';
          } else {
            targetEl.style.display = '';

            // Si tiene título modificado
            if (sec.title) {
              const heading = targetEl.querySelector('h1, h2, .section-title, .hero-title');
              if (heading && sec.title !== heading.textContent.trim()) {
                heading.textContent = sec.title;
              }
            }

            // Si tiene subtítulo modificado
            if (sec.subtitle) {
              const sub = targetEl.querySelector('p.section-subtitle, p.hero-subtitle, .lead, .subtitle');
              if (sub && sec.subtitle !== sub.textContent.trim()) {
                sub.textContent = sec.subtitle;
              }
            }

            // Si tiene botón CTA
            if (sec.ctaText) {
              const btn = targetEl.querySelector('a.btn-cta, a.btn-hero, .btn-action-primary, a.btn-baqueano-primary');
              if (btn) {
                btn.textContent = sec.ctaText;
                if (sec.ctaLink) btn.href = sec.ctaLink;
              }
            }
          }
        } else if (status === 'published' && (sec.content || sec.title)) {
          // Sección dinámica adicional creada en vivo desde el Ops Center
          let dynContainer = document.getElementById(`dynSec_${secId}`);
          if (!dynContainer) {
            dynContainer = document.createElement('section');
            dynContainer.id = `dynSec_${secId}`;
            dynContainer.className = 'bq-dynamic-cms-section';
            dynContainer.style.cssText = 'padding: 4rem 1.5rem; background: #0F172A; border-top: 1px solid rgba(244,230,193,0.1); border-bottom: 1px solid rgba(244,230,193,0.1); color: #fff;';

            const footer = document.querySelector('footer');
            if (footer && footer.parentNode) {
              footer.parentNode.insertBefore(dynContainer, footer);
            } else {
              document.body.appendChild(dynContainer);
            }
          }

          dynContainer.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              ${sec.title ? `<h2 style="font-size: 2rem; color: #F4E6C1; margin-bottom: 0.75rem; font-family: var(--font-title, sans-serif);">${this.escape(sec.title)}</h2>` : ''}
              ${sec.subtitle ? `<p style="font-size: 1.1rem; color: #94A3B8; margin-bottom: 1.5rem; max-width: 700px; margin-left: auto; margin-right: auto;">${this.escape(sec.subtitle)}</p>` : ''}
              ${sec.imageUrl ? `<div style="margin: 1.5rem 0;"><img src="${sec.imageUrl}" alt="${this.escape(sec.title || '')}" style="max-width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></div>` : ''}
              ${sec.content ? `<div style="font-size: 1rem; color: #CBD5E1; line-height: 1.7; max-width: 800px; margin: 0 auto 1.5rem auto; text-align: left; background: rgba(22, 93, 111, 0.15); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(244, 230, 193, 0.1);">${sec.content}</div>` : ''}
              ${sec.ctaText ? `<div style="margin-top: 1.5rem;"><a href="${sec.ctaLink || '#'}" style="display: inline-block; padding: 0.75rem 2rem; background: #F65E01; color: #fff; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(246,94,1,0.4);">${this.escape(sec.ctaText)}</a></div>` : ''}
            </div>
          `;
          dynContainer.style.display = '';
        } else {
          const dynContainer = document.getElementById(`dynSec_${secId}`);
          if (dynContainer) dynContainer.style.display = 'none';
        }
      });
    },

    // ------------------------------------------------------------------------
    // 0b. SINCRONIZACIÓN DE DESTINOS & LUGARES EN TIEMPO REAL
    // ------------------------------------------------------------------------
    syncDestinationsCatalog() {
      const db = this.getDb();
      if (!db) {
        setTimeout(() => this.syncDestinationsCatalog(), 600);
        return;
      }

      // Escuchar 'destinations' en tiempo real
      db.collection('destinations').onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            this.applyDestinationUpdates(items);
          }
        },
        (err) => console.warn('[BaqueanoPublicSync] Error en destinations:', err.message)
      );

      // También escuchar 'places' como espejo defensivo
      db.collection('places').onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            this.applyDestinationUpdates(items);
          }
        },
        (err) => console.warn('[BaqueanoPublicSync] Error en places:', err.message)
      );
    },

    applyDestinationUpdates(items) {
      items.forEach((d) => {
        const status = d.status || 'published';
        const isVerified = d.verified === true || d.verificationStatus === 'verified';
        const cards = document.querySelectorAll(`[data-id="${d.id}"], #${d.id}`);

        if (cards.length > 0) {
          cards.forEach((card) => {
            // Ocultar si está en borrador o papelera
            if (status === 'draft' || status === 'trashed') {
              card.style.display = 'none';
              return;
            }

            card.style.display = '';

            // 1. Imagen
            if (d.imageUrl || d.image) {
              const img = card.querySelector('img.dest-card-img, img.dest-thumb, img');
              if (img && img.src !== (d.imageUrl || d.image)) {
                img.src = d.imageUrl || d.image;
              }
            }

            // 2. Título & Insignia de Verificación Oficial estilo Red Social
            const titleEl = card.querySelector('.dest-name-title, .dest-title, h3');
            if (titleEl) {
              const cleanTitle = d.title || d.name || titleEl.textContent.trim();
              titleEl.innerHTML = `
                ${this.escape(cleanTitle)}
                ${isVerified ? '<span class="bq-social-verified-badge" title="Destino Verificado Oficialmente"><i class="fa-solid fa-circle-check"></i></span>' : ''}
              `;
            }

            // 3. Descripción
            if (d.description) {
              const descEl = card.querySelector('.dest-description-text, p.dest-desc');
              if (descEl) descEl.textContent = d.description;
            }

            // 4. Precios bimoneda
            if (d.priceNio || d.priceUsd) {
              const badgePrice = card.querySelector('.dest-price-badge');
              if (badgePrice) {
                badgePrice.textContent = `C$ ${d.priceNio || Math.round(d.priceUsd * 36.65)} (${d.category || 'Destino'}) ≈ $${d.priceUsd || (d.priceNio / 36.65).toFixed(1)} USD`;
              }
              const nioEl = card.querySelector('.price-cordobas');
              if (nioEl) nioEl.textContent = `C$ ${d.priceNio} NIO`;
              const usdEl = card.querySelector('.price-usd');
              if (usdEl) usdEl.textContent = `≈ $${d.priceUsd} USD`;
            }

            // 5. Contacto WhatsApp
            if (d.whatsapp || d.phone) {
              const cleanPhone = (d.whatsapp || d.phone).replace(/[^0-9]/g, '');
              const waBtn = card.querySelector('a.btn-card-whatsapp, a.btn-flip-wa');
              if (waBtn && cleanPhone) {
                waBtn.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hola%20${encodeURIComponent(d.title || d.name)},%20deseo%20información%20desde%20Baqueano`;
              }
            }
          });
        }
      });
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
                        <h3 class="flip-front-title">
                          ${this.escape(name)}
                          ${isVerified ? '<span class="bq-social-verified-badge" title="Cuenta Oficial Verificada"><i class="fa-solid fa-circle-check"></i></span>' : ''}
                        </h3>
                        <div class="flip-hint"><i class="fa-solid fa-arrows-rotate"></i> Toca para girar y contactar</div>
                      </div>
                    </div>
                    <div class="flip-card-back">
                      <div>
                        <span class="aliados-inline-003" style="display: inline-flex; align-items: center; gap: 0.35rem; color: ${isVerified ? '#00BAF2' : '#F59E0B'};">
                          <i class="fa-solid ${isVerified ? 'fa-circle-check' : 'fa-certificate'}"></i>
                          ${isVerified ? 'VERIFICADO OFICIAL' : 'EN PROCESO DE ACREDITACIÓN'}
                        </span>
                        <h3 class="flip-back-title">
                          ${this.escape(name)}
                          ${isVerified ? '<span class="bq-social-verified-badge" title="Cuenta Oficial Verificada"><i class="fa-solid fa-circle-check"></i></span>' : ''}
                        </h3>
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
