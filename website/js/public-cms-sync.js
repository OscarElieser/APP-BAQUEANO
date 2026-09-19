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
      this.syncPublishedNotifications();
      this.syncDynamicPageSections();

      const path = window.location.pathname.toLowerCase();
      if (path.includes('aliados.html') || document.querySelector('.allies-3d-grid')) {
        this.syncAlliesPage();
      }
      if (document.querySelector('.partners-infinity-section')) {
        this.syncPartnerTracks();
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
        const secId = sec.id || '';
        const secType = sec.type || '';

        // Buscar elemento en el DOM por ID explícito o atributo
        let targetEl = document.getElementById(secId) || document.querySelector(`[data-section-id="${secId}"]`);

        // Heurísticas defensivas especializadas por tipo de componente
        if (!targetEl) {
          if (secType === 'header' || secId.includes('header') || secId.includes('navbar')) {
            targetEl = document.querySelector('header.main-header, nav.main-navbar, nav.navbar, header, .site-header');
          } else if (secType === 'footer' || secId.includes('footer')) {
            targetEl = document.querySelector('footer, .site-footer, .footer-section');
          } else if (secType === 'map' || secId.includes('map') || secId.includes('mapa')) {
            targetEl = document.getElementById('mapaVivo3dSection') || document.getElementById('mapaVivoContainer') || document.getElementById('baqueanoInteractiveMap') || document.querySelector('.map-section, #selectorDepartamento');
          } else if (secType === 'form' || secId.includes('form') || secId.includes('registro') || secId.includes('denuncia') || secId.includes('calc')) {
            targetEl = document.getElementById('registroAnfitrionSection') || document.getElementById('formularioDenuncia') || document.getElementById('formDenuncia') || document.getElementById('cotizadorBimonedaSection') || document.getElementById('panelAutogestion') || document.querySelector('.host-register-form, form.register-form, .calculator-section');
          } else if (secType === 'hero' || secId.includes('hero')) {
            targetEl = document.querySelector('.hero-section, .hero, header.hero, .page-hero');
          } else if (secId.includes('destinos') || secId.includes('rutas')) {
            targetEl = document.querySelector('.featured-destinations, .destinations-grid, .destinos-section, #destinosGrid');
          } else if (secId.includes('faq')) {
            targetEl = document.querySelector('.faq-section, #faqSection');
          } else if (secType === 'cta' || secId.includes('cta')) {
            targetEl = document.querySelector('.cta-section, .download-cta-section');
          }
        }

        if (targetEl) {
          // Ocultar / Mostrar según status
          if (status === 'draft' || status === 'archived' || status === 'trashed') {
            targetEl.style.display = 'none';
            return;
          }

          targetEl.style.display = '';

          // ─── 1. TIPO HEADER (ENCABEZADO & BARRA DE NAVEGACIÓN) ───
          if (secType === 'header' || secId.includes('header') || secId.includes('navbar')) {
            if (sec.title) {
              const brand = targetEl.querySelector('.navbar-brand, .brand-title, .logo-text, .brand-name');
              if (brand) {
                // Conservar posible icono o imagen dentro del logo
                const logoImg = brand.querySelector('img');
                if (logoImg) {
                  brand.textContent = ` ${sec.title}`;
                  brand.prepend(logoImg);
                } else {
                  brand.textContent = sec.title;
                }
              }
            }
            if (sec.imageUrl) {
              const logo = targetEl.querySelector('img.navbar-logo, img.brand-logo, .navbar-brand img');
              if (logo && logo.src !== sec.imageUrl) logo.src = sec.imageUrl;
            }
            if (sec.ctaText) {
              const btn = targetEl.querySelector('.btn-nav-sos, .nav-action-btn, .btn-download-nav, .navbar a.btn, header a.btn');
              if (btn) {
                btn.textContent = sec.ctaText;
                if (sec.ctaLink) btn.href = sec.ctaLink;
              }
            }
            return;
          }

          // ─── 2. TIPO FOOTER (PIE DE PÁGINA INSTITUCIONAL) ───
          if (secType === 'footer' || secId.includes('footer')) {
            if (sec.title) {
              const fTitle = targetEl.querySelector('.footer-brand h3, .footer-brand h2, .footer-title, .footer-logo-title');
              if (fTitle && fTitle.textContent.trim() !== sec.title) fTitle.textContent = sec.title;
            }
            if (sec.subtitle) {
              const fPhone = targetEl.querySelector('.footer-phone, .footer-contact-phone, a[href^="tel:"], footer a[href*="wa.me"]');
              if (fPhone) {
                fPhone.textContent = sec.subtitle;
                if (sec.subtitle.includes('+')) {
                  const cleanTel = sec.subtitle.replace(/[^0-9+]/g, '');
                  fPhone.href = `tel:${cleanTel}`;
                }
              }
            }
            if (sec.content) {
              const fDesc = targetEl.querySelector('.footer-desc, .footer-about p, .legal-copy, .footer-bottom p, .copyright');
              if (fDesc && fDesc.textContent.trim() !== sec.content) fDesc.textContent = sec.content;
            }
            if (sec.ctaText) {
              const fCta = targetEl.querySelector('a.footer-link-primary, .footer-wa-btn, footer a.btn-cta, footer a.btn-primary');
              if (fCta) {
                fCta.textContent = sec.ctaText;
                if (sec.ctaLink) fCta.href = sec.ctaLink;
              }
            }
            if (sec.cta2Text) {
              const fCta2 = targetEl.querySelector('a.footer-link-secondary, footer a.btn-secondary');
              if (fCta2) {
                fCta2.textContent = sec.cta2Text;
                if (sec.cta2Link) fCta2.href = sec.cta2Link;
              }
            }
            return;
          }

          // ─── 3. TIPO MAPA (VISOR CARTOGRÁFICO 3D O TERRITORIAL) ───
          if (secType === 'map' || secId.includes('map') || secId.includes('mapa')) {
            if (sec.title) {
              const h = targetEl.querySelector('h1, h2, .section-title, .map-title');
              if (h && h.textContent.trim() !== sec.title) h.textContent = sec.title;
            }
            if (sec.subtitle) {
              const p = targetEl.querySelector('p.section-subtitle, p.subtitle, .map-subtitle');
              if (p && p.textContent.trim() !== sec.subtitle) p.textContent = sec.subtitle;
            }
            if (sec.ctaText) {
              const btn = targetEl.querySelector('a.btn-cta, button.btn-cta, .btn-map-action, .btn-action-primary');
              if (btn) {
                btn.textContent = sec.ctaText;
                if (sec.ctaLink && btn.tagName === 'A') btn.href = sec.ctaLink;
              }
            }
            return;
          }

          // ─── 4. TIPO FORMULARIO / COTIZADOR / REGISTRO ───
          if (secType === 'form' || secId.includes('form') || secId.includes('registro') || secId.includes('denuncia')) {
            if (sec.title) {
              const h = targetEl.querySelector('h1, h2, h3, .section-title, .form-title');
              if (h && h.textContent.trim() !== sec.title) h.textContent = sec.title;
            }
            if (sec.subtitle) {
              const p = targetEl.querySelector('p.section-subtitle, p.form-subtitle, .lead');
              if (p && p.textContent.trim() !== sec.subtitle) p.textContent = sec.subtitle;
            }
            if (sec.content) {
              const desc = targetEl.querySelector('.form-instructions, .form-legal-note, p.form-desc');
              if (desc && desc.textContent.trim() !== sec.content) desc.textContent = sec.content;
            }
            if (sec.ctaText) {
              const submitBtn = targetEl.querySelector('button[type="submit"], .btn-submit, .btn-submit-pro');
              if (submitBtn) submitBtn.textContent = sec.ctaText;
            }
            if (sec.ctaLink) {
              const waLink = targetEl.querySelector('a[href*="wa.me"], a.btn-wa');
              if (waLink) waLink.href = sec.ctaLink;
              if (targetEl.dataset) targetEl.dataset.targetLink = sec.ctaLink;
            }
            return;
          }

          // ─── 5. TIPO HERO O SECCIÓN DE CONTENIDO ESTÁNDAR ───
          if (sec.badgeText) {
            const badge = targetEl.querySelector('.hero-badge, .badge-pro, .badge-tag, .section-badge');
            if (badge && badge.textContent.trim() !== sec.badgeText) badge.textContent = sec.badgeText;
          }
          if (sec.title) {
            const heading = targetEl.querySelector('h1, h2, .section-title, .hero-title');
            if (heading && sec.title !== heading.textContent.trim()) {
              heading.textContent = sec.title;
            }
          }
          if (sec.subtitle) {
            const sub = targetEl.querySelector('p.section-subtitle, p.hero-subtitle, .lead, .subtitle');
            if (sub && sec.subtitle !== sub.textContent.trim()) {
              sub.textContent = sec.subtitle;
            }
          }
          if (sec.content) {
            const bodyP = targetEl.querySelector('.hero-description, .section-content, .hero-lead, p.description');
            if (bodyP && bodyP.textContent.trim() !== sec.content) {
              bodyP.textContent = sec.content;
            }
          }
          if (sec.ctaText) {
            const btn = targetEl.querySelector('a.btn-cta, a.btn-hero, .btn-action-primary, a.btn-baqueano-primary, .hero a.btn-primary');
            if (btn) {
              btn.textContent = sec.ctaText;
              if (sec.ctaLink) btn.href = sec.ctaLink;
            }
          }
          if (sec.cta2Text) {
            const btn2 = targetEl.querySelector('a.btn-hero-secondary, a.btn-secondary, a.btn-outline, a.btn-outline-light');
            if (btn2) {
              btn2.textContent = sec.cta2Text;
              if (sec.cta2Link) btn2.href = sec.cta2Link;
            }
          }
          if (sec.imageUrl) {
            const imgEl = targetEl.querySelector('img.hero-bg, img.section-media, img.hero-image');
            if (imgEl && imgEl.src !== sec.imageUrl) {
              imgEl.src = sec.imageUrl;
            } else if (!imgEl && targetEl.classList.contains('hero-section')) {
              targetEl.style.backgroundImage = `url("${sec.imageUrl}")`;
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
              ${sec.badgeText ? `<span style="display:inline-block; padding: 0.35rem 1rem; border-radius: 9999px; background: rgba(246,94,1,0.15); color: #F65E01; font-weight:700; font-size:0.8rem; margin-bottom:1rem; border:1px solid rgba(246,94,1,0.3);">${this.escape(sec.badgeText)}</span>` : ''}
              ${sec.title ? `<h2 style="font-size: 2rem; color: #F4E6C1; margin-bottom: 0.75rem; font-family: var(--font-title, sans-serif);">${this.escape(sec.title)}</h2>` : ''}
              ${sec.subtitle ? `<p style="font-size: 1.1rem; color: #94A3B8; margin-bottom: 1.5rem; max-width: 700px; margin-left: auto; margin-right: auto;">${this.escape(sec.subtitle)}</p>` : ''}
              ${sec.imageUrl ? `<div style="margin: 1.5rem 0;"><img src="${sec.imageUrl}" alt="${this.escape(sec.title || '')}" style="max-width: 100%; max-height: 400px; border-radius: 12px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></div>` : ''}
              ${sec.content ? `<div style="font-size: 1rem; color: #CBD5E1; line-height: 1.7; max-width: 800px; margin: 0 auto 1.5rem auto; text-align: left; background: rgba(22, 93, 111, 0.15); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(244, 230, 193, 0.1);">${sec.content}</div>` : ''}
              <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
                ${sec.ctaText ? `<a href="${sec.ctaLink || '#'}" style="display: inline-block; padding: 0.75rem 2rem; background: #F65E01; color: #fff; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(246,94,1,0.4);">${this.escape(sec.ctaText)}</a>` : ''}
                ${sec.cta2Text ? `<a href="${sec.cta2Link || '#'}" style="display: inline-block; padding: 0.75rem 2rem; background: rgba(22,93,111,0.5); color: #F4E6C1; font-weight: 700; border-radius: 8px; text-decoration: none; border: 1px solid rgba(244,230,193,0.3);">${this.escape(sec.cta2Text)}</a>` : ''}
              </div>
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
            if (status === 'draft' || status === 'archived' || status === 'trashed') {
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
    // 1b. NOTIFICACIONES EDITORIALES PUBLICADAS DESDE OPS CENTER
    // ------------------------------------------------------------------------
    syncPublishedNotifications() {
      const db = this.getDb();
      if (!db) return;
      db.collection('notifications').onSnapshot((snapshot) => {
        const published = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => (item.status || 'draft') === 'published' && item.permanentlyDeleted !== true)
          .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
        let notice = document.getElementById('bqPublishedNotification');
        if (!published.length) {
          if (notice) notice.remove();
          return;
        }
        const item = published[0];
        if (!notice) {
          notice = document.createElement('aside');
          notice.id = 'bqPublishedNotification';
          notice.style.cssText = 'position:fixed;right:1rem;bottom:1rem;z-index:9998;max-width:360px;background:#0F172A;color:#fff;border:1px solid #165D6F;border-left:4px solid #F65E01;border-radius:14px;padding:1rem 2.5rem 1rem 1rem;box-shadow:0 18px 45px rgba(0,0,0,.38);';
          document.body.appendChild(notice);
        }
        const link = item.link || item.website || '';
        notice.innerHTML = `
          <button type="button" aria-label="Cerrar notificación" style="position:absolute;right:.65rem;top:.45rem;border:0;background:transparent;color:#fff;font-size:1.1rem;cursor:pointer" onclick="this.parentElement.remove()">×</button>
          <strong style="display:block;margin-bottom:.35rem">${this.escape(item.title || item.name || 'Baqueano')}</strong>
          <span style="font-size:.84rem;color:#cbd5e1">${this.escape(item.message || item.description || '')}</span>
          ${link ? `<a href="${this.escape(link)}" style="display:block;margin-top:.65rem;color:#F4E6C1;font-weight:700">Ver información</a>` : ''}
        `;
      }, (error) => console.warn('[BaqueanoPublicSync] Error en notifications:', error.message));
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
        .onSnapshot(
          (snapshot) => {
            const nativeBusinesses = window.BaqueanoWebsiteBusinesses || [];
            // Si no existe ninguna fuente, conservar el respaldo HTML original.
            if (snapshot.empty && nativeBusinesses.length === 0) {
              console.info('[BaqueanoPublicSync] Colección businesses vacía en Firestore. Preservando contenido nativo.');
              return;
            }

            const mergedBusinesses = new Map(nativeBusinesses.map((item) => [item.id, item]));
            snapshot.docs.forEach((d) => mergedBusinesses.set(d.id, {
              ...(mergedBusinesses.get(d.id) || {}),
              id: d.id,
              ...d.data()
            }));
            const allies = Array.from(mergedBusinesses.values()).filter((item) =>
              (item.status || 'published') === 'published' && item.permanentlyDeleted !== true
            );

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
    // 2b. RED DE ALIADOS DE LA PORTADA
    // ------------------------------------------------------------------------
    syncPartnerTracks() {
      const tracks = [
        document.getElementById('partnersTrackA'),
        document.getElementById('partnersTrackB')
      ].filter(Boolean);
      const db = this.getDb();
      if (!tracks.length || !db) return;

      db.collection('businesses').onSnapshot((snapshot) => {
        const merged = new Map((window.BaqueanoWebsiteBusinesses || []).map((item) => [item.id, item]));
        snapshot.docs.forEach((doc) => merged.set(doc.id, {
          ...(merged.get(doc.id) || {}),
          id: doc.id,
          ...doc.data()
        }));
        const visible = Array.from(merged.values()).filter((item) =>
          (item.status || 'published') === 'published' && item.permanentlyDeleted !== true
        );
        const chips = visible.map((business) => `
          <div class="partner-chip">
            <span class="partner-chip-icon"><i class="fa-solid fa-store"></i></span>
            <div class="partner-chip-body">
              <span class="partner-chip-name">${this.escape(business.name || business.title)}</span>
              <span class="partner-chip-location">${this.escape(business.department || 'Nicaragua')} · ${this.escape(business.type || business.category || 'Aliado')}</span>
            </div>
            ${business.verified === true ? '<span class="partner-chip-verified" title="Verificado Baqueano"><i class="fa-solid fa-circle-check"></i></span>' : ''}
          </div>
        `).join('');
        tracks.forEach((track) => { track.innerHTML = chips; });
      }, (error) => console.warn('[BaqueanoPublicSync] Error en red de aliados:', error.message));
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
