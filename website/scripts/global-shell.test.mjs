/**
 * 🧭 BAQUEANO — PRUEBA INTEGRAL DEL SHELL PÚBLICO (global-shell.test.mjs)
 *
 * 🎯 POR QUÉ (Why / Propósito):
 * - El header, el footer, la sesión, el idioma y la autorización del Ops Center
 *   son servicios globales; una regresión en uno rompe las 28 páginas a la vez.
 * - Comprobar en navegador real (no solo sintaxis) los casos 1–12 del pedido
 *   del propietario (2026-10-03) y los 13 anchos de pantalla exigidos.
 *
 * ⚙️ CÓMO (How / Arquitectura):
 * - Playwright Chromium contra el servidor local (`PORT=5077 node dev-server.js`
 *   desde la raíz; URL configurable con BQ_BASE_URL).
 * - Para recorrer anchos se bloquean imágenes, video y fuentes (no afectan la
 *   geometría del header) y se acepta el aviso de cookies por adelantado.
 * - Para los roles se sustituye Firebase por un doble de prueba ANTES de que
 *   carguen los scripts: así se ejercita la lógica real de user-session.js,
 *   roles.js y ops-engine.js con un usuario, un admin y un super_admin sin
 *   tocar cuentas reales. El SDK real de gstatic se bloquea en esas pruebas.
 *
 * 📦 QUÉ (What / Entregables):
 * - Sale con código 1 si algo falla e imprime cada fallo con página y ancho.
 * - Uso: `node scripts/global-shell.test.mjs` (desde website/).
 *   BQ_QUICK=1 limita el barrido a 4 páginas; BQ_PAGES=a.html,b.html elige páginas.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = (process.env.BQ_BASE_URL || 'http://127.0.0.1:5077').replace(/\/$/, '');
const WEBSITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WIDTHS = [320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1366, 1440, 1920];
const EXCLUDED = new Set(['admin.html', 'i18n-test.html']);
const ALL_PAGES = readdirSync(WEBSITE_DIR).filter((f) => f.endsWith('.html') && !EXCLUDED.has(f)).sort();
const PAGES = process.env.BQ_PAGES ? process.env.BQ_PAGES.split(',') : process.env.BQ_QUICK ? ['index.html', 'destinos.html', 'historia.html', 'perfil.html'] : ALL_PAGES;
const SESSION_KEY = 'baqueano_user_session_v1';
const CONSENT = JSON.stringify({ essential: true, preferences: true, analytics: false, version: 1, updatedAt: '2026-10-03T00:00:00.000Z' });

const failures = [];
let checks = 0;
function expect(condition, label) {
  checks += 1;
  if (!condition) failures.push(label);
}

// ── Contexto base: cookies aceptadas, recursos pesados bloqueados ──────────
async function newContext(browser, { width, height = 900, blockFirebase = false, mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile
  });
  await context.addInitScript((consent) => {
    try { localStorage.setItem('baqueano_cookie_consent_v1', consent); } catch (_) {}
  }, CONSENT);
  await context.route('**/*', (route) => {
    const req = route.request();
    const type = req.resourceType();
    const url = req.url();
    if (type === 'image' || type === 'media' || type === 'font') return route.abort();
    if (blockFirebase && /gstatic\.com\/firebasejs|supabase\.co|googleapis\.com\/identitytoolkit/.test(url)) return route.abort();
    if (!url.startsWith(BASE) && !/cdnjs\.cloudflare\.com|gstatic\.com|fonts\.googleapis\.com/.test(url)) return route.abort();
    return route.continue();
  });
  return context;
}

async function openPage(context, file) {
  const page = await context.newPage();
  const errors = [];
  // El rechazo interno de @view-transition (cross-document) al cambiar el
  // viewport en plena navegación lo emite el navegador, no el sitio.
  page.on('pageerror', (error) => { if (!/Transition was aborted/.test(error.message)) errors.push(error.message); });
  await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('#mainNavbar .nav-links-menu a, #mainNavbar a.nav-link') && document.querySelector('#siteFooter'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(250);
  return { page, errors };
}

// ── 1. Barrido de anchos: un header, un footer, sticky, sin desbordes ──────
async function geometrySweep() {
  for (const width of WIDTHS) {
    const browser = await chromium.launch();
    const context = await newContext(browser, { width, mobile: width < 768, blockFirebase: true });
    const queue = [...PAGES];
    const workers = Array.from({ length: 2 }, async () => {
      while (queue.length) {
        const file = queue.shift();
        const tag = `${file} @${width}px`;
        let page;
        try {
          ({ page } = await openPage(context, file));
          const shell = await page.evaluate(() => ({
            navs: document.querySelectorAll('#mainNavbar').length,
            siteNavs: document.querySelectorAll('nav.main-navbar, nav.main-navbar-exact').length,
            footers: document.querySelectorAll('#siteFooter').length,
            legacyFooters: document.querySelectorAll('.bq-global-footer, .official-footer-exact, .site-footer-pro, .footer-unified, .main-footer').length
          }));
          expect(shell.navs === 1 && shell.siteNavs === 1, `${tag}: se esperaba 1 header global, hay ${shell.navs}/${shell.siteNavs}`);
          expect(shell.footers === 1 && shell.legacyFooters === 0, `${tag}: se esperaba 1 footer global, hay ${shell.footers} (+${shell.legacyFooters} heredados)`);

          // Desplazamiento largo y medición del header.
          await page.evaluate(() => window.scrollTo(0, Math.min(2600, document.documentElement.scrollHeight)));
          await page.waitForTimeout(350);
          const geo = await page.evaluate((drawerBreakpoint) => {
            const nav = document.getElementById('mainNavbar');
            const r = nav.getBoundingClientRect();
            const vw = document.documentElement.clientWidth;
            const probe = document.elementFromPoint(Math.min(r.left + 24, vw - 1), Math.max(1, Math.min(r.bottom - 2, r.top + r.height / 2)));
            const offenders = [];
            nav.querySelectorAll('.nav-inner > *, .nav-inner > * > *').forEach((el) => {
              if (vw <= drawerBreakpoint && el.closest('#navLinksMenu')) return;
              const cs = getComputedStyle(el);
              const b = el.getBoundingClientRect();
              if (cs.display === 'none' || cs.visibility === 'hidden' || b.width === 0 || b.height === 0) return;
              if (b.right > vw + 1 || b.left < -1) offenders.push((el.className || el.tagName).toString().slice(0, 40) + ` [${Math.round(b.left)}–${Math.round(b.right)}]`);
            });
            const toggle = document.getElementById('mobileNavToggle');
            const tr = toggle ? toggle.getBoundingClientRect() : null;
            return {
              scrolled: window.scrollY,
              top: r.top, bottom: r.bottom, height: r.height,
              onTop: Boolean(probe && nav.contains(probe)),
              docOverflow: document.documentElement.scrollWidth - vw,
              offenders,
              toggleOk: vw > drawerBreakpoint || Boolean(tr && tr.width > 0 && tr.right <= vw + 1 && getComputedStyle(toggle).display !== 'none'),
              toggleSize: tr ? Math.round(tr.width) : 0
            };
          }, 960);
          if (geo.scrolled > 0) {
            expect(geo.top >= -1 && geo.top <= 40 && geo.bottom > 30, `${tag}: header fuera de vista al hacer scroll (top=${Math.round(geo.top)}, bottom=${Math.round(geo.bottom)})`);
            expect(geo.onTop, `${tag}: el header queda detrás de otro elemento al hacer scroll`);
          }
          expect(geo.height <= (width <= 430 ? 84 : 110), `${tag}: header demasiado alto (${Math.round(geo.height)} px)`);
          expect(geo.docOverflow <= 1, `${tag}: desbordamiento horizontal de ${geo.docOverflow} px`);
          expect(geo.offenders.length === 0, `${tag}: elementos del header fuera de pantalla: ${geo.offenders.join(', ')}`);
          expect(geo.toggleOk, `${tag}: botón hamburguesa ausente o fuera de pantalla`);
          expect(geo.toggleSize <= 56, `${tag}: botón hamburguesa demasiado grande (${geo.toggleSize} px)`);
        } catch (error) {
          expect(false, `${tag}: error al probar — ${error.message.split('\n')[0]}`);
        } finally {
          if (page) await page.close();
        }
      }
    });
    await Promise.all(workers);
    await context.close();
    await browser.close();
    process.stdout.write(`  ancho ${width}px ✓\n`);
  }
}

// ── 2. Menú móvil: abrir/cerrar repetido, Escape, fuera, enlace, rotación ──
async function mobileDrawer(browser) {
  const context = await newContext(browser, { width: 390, height: 844, mobile: true, blockFirebase: true });
  const { page, errors } = await openPage(context, 'historia.html');
  const state = () => page.evaluate(() => {
    const t = document.getElementById('mobileNavToggle');
    const menu = document.getElementById('navLinksMenu');
    const r = menu.getBoundingClientRect();
    return {
      expanded: t.getAttribute('aria-expanded'),
      open: document.documentElement.classList.contains('nav-drawer-open') || document.body.classList.contains('nav-drawer-open'),
      menuVisible: r.width > 0 && r.right > 0 && r.left < innerWidth && getComputedStyle(menu).visibility !== 'hidden',
      menuInside: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1,
      scrollable: menu.scrollHeight <= menu.clientHeight + 1 || ['auto', 'scroll'].includes(getComputedStyle(menu).overflowY) || [...menu.querySelectorAll('*')].some((el) => ['auto', 'scroll'].includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight)
    };
  });
  const canScroll = async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(250);
    return page.evaluate(() => window.scrollY > 0);
  };

  for (let i = 1; i <= 6; i += 1) {
    await page.click('#mobileNavToggle');
    await page.waitForTimeout(260);
    const s = await state();
    expect(s.expanded === 'true' && s.open && s.menuVisible, `Menú móvil ciclo ${i}: no abrió (${JSON.stringify(s)})`);
    expect(s.menuInside, `Menú móvil ciclo ${i}: el cajón sale del viewport`);
    expect(s.scrollable, `Menú móvil ciclo ${i}: sin scroll interno con muchas opciones`);
    if (i % 3 === 1) await page.keyboard.press('Escape');
    else if (i % 3 === 2) await page.mouse.click(10, 400); // fondo del cajón
    else await page.click('#mobileNavToggle');
    await page.waitForTimeout(300);
    const c = await state();
    expect(c.expanded === 'false' && !c.open, `Menú móvil ciclo ${i}: no cerró (${JSON.stringify(c)})`);
    expect(await canScroll(), `Menú móvil ciclo ${i}: la página quedó sin scroll tras cerrar`);
  }

  const tools = await page.evaluate(() => {
    const menu = document.getElementById('navLinksMenu');
    return {
      lang: Boolean(menu.querySelector('.global-language, .navbar-lang-pill')),
      account: Boolean(menu.querySelector('.bq-account-slot, a[href="perfil.html"]'))
    };
  });
  expect(tools.lang, 'Menú móvil: falta el selector de idioma dentro del cajón');
  expect(tools.account, 'Menú móvil: falta el acceso a cuenta/login dentro del cajón');

  // Rotación: horizontal y regreso, sin desbordes.
  for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over <= 1, `Rotación ${vp.width}x${vp.height}: desbordamiento horizontal ${over} px`);
  }

  // Seleccionar un enlace cierra el cajón y navega.
  await page.click('#mobileNavToggle');
  await page.waitForTimeout(260);
  const link = page.locator('#navLinksMenu a[href="destinos.html"]').first();
  await Promise.all([page.waitForURL(/destinos\.html/, { timeout: 15000 }), link.click()]);
  await page.waitForFunction(() => document.getElementById('mobileNavToggle'), null, { timeout: 15000 });
  const after = await state();
  expect(after.expanded === 'false' && !after.open, 'Menú móvil: queda abierto tras cambiar de página');
  expect(errors.length === 0, `Menú móvil: errores JS ${errors.join(' | ')}`);
  await context.close();
}

// ── 3. Escritorio: "Más" accesible con teclado y dentro del viewport ───────
async function desktopDropdown(browser) {
  for (const width of [1024, 1280, 1920]) {
    const context = await newContext(browser, { width, blockFirebase: true });
    const { page } = await openPage(context, 'index.html');
    await page.focus('#btnGlobalMoreTrigger');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const open = await page.evaluate(() => {
      const t = document.getElementById('btnGlobalMoreTrigger');
      const m = document.getElementById('globalMegaMenu');
      const r = m.getBoundingClientRect();
      const probe = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(40, r.height / 2));
      return { expanded: t.getAttribute('aria-expanded'), inside: r.left >= -1 && r.right <= innerWidth + 1 && r.height > 0, onTop: Boolean(probe && m.contains(probe)) };
    });
    expect(open.expanded === 'true' && open.inside, `"Más" @${width}px: no abre o sale del viewport (${JSON.stringify(open)})`);
    expect(open.onTop, `"Más" @${width}px: el desplegable queda detrás de otro elemento`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const closed = await page.evaluate(() => document.getElementById('btnGlobalMoreTrigger').getAttribute('aria-expanded'));
    expect(closed === 'false', `"Más" @${width}px: Escape no lo cierra`);
    await context.close();
  }
}

// ── 4. Idioma persistente entre páginas ────────────────────────────────────
async function languagePersistence(browser) {
  const context = await newContext(browser, { width: 1280, blockFirebase: true });
  const { page } = await openPage(context, 'index.html');
  await page.waitForFunction(() => window.BaqueanoLanguage, null, { timeout: 15000 });
  await page.evaluate(() => window.BaqueanoLanguage.set('en'));
  for (const file of ['destinos.html', 'gastronomia.html', 'historia.html']) {
    await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.BaqueanoLanguage, null, { timeout: 15000 });
    await page.waitForFunction(() => /^en/.test(document.documentElement.lang), null, { timeout: 8000 }).catch(() => {});
    const lang = await page.evaluate(() => ({ api: window.BaqueanoLanguage.get(), html: document.documentElement.lang, pill: (document.querySelector('#mainNavbar .navbar-lang-pill span') || {}).textContent }));
    expect(lang.api === 'en' && /^en/.test(lang.html) && /EN/i.test(lang.pill || ''), `Idioma no persiste en ${file}: ${JSON.stringify(lang)}`);
  }
  await page.evaluate(() => window.BaqueanoLanguage.set('es'));
  await context.close();
}

// ── 5. Roles: doble de Firebase para usuario, admin y super_admin ──────────
const FAKE_USERS = {
  user: { uid: 'uid-user-1', email: 'viajera@example.com', emailVerified: true, displayName: 'Ana Viajera', claims: {} },
  admin: { uid: 'uid-admin-1', email: 'byoscarelieser@gmail.com', emailVerified: true, displayName: 'Admin Prueba', claims: {} },
  super: { uid: 'uid-super-1', email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: true, displayName: 'Super Prueba', claims: {} },
  unverifiedOfficial: { uid: 'uid-fake-1', email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: false, displayName: 'Impostor', claims: {} },
  claimAdmin: { uid: 'uid-claim-1', email: 'staff@example.com', emailVerified: true, displayName: 'Staff Claim', claims: { role: 'admin' } }
};

async function contextWithFakeFirebase(browser, user, width = 1280) {
  const context = await newContext(browser, { width, blockFirebase: true });
  await context.addInitScript((u) => {
    const fakeUser = u && {
      uid: u.uid, email: u.email, emailVerified: u.emailVerified, displayName: u.displayName,
      photoURL: '', phoneNumber: '', providerData: [{ providerId: 'google.com' }], metadata: {},
      getIdTokenResult: () => Promise.resolve({ claims: u.claims })
    };
    const auth = {
      currentUser: fakeUser,
      onAuthStateChanged(cb) { setTimeout(() => cb(fakeUser), 50); return () => {}; },
      signOut() { auth.currentUser = null; return Promise.resolve(); }
    };
    const app = { name: '[DEFAULT]' };
    const firebase = {
      apps: [app], app: () => app, initializeApp: () => app,
      auth: Object.assign(() => auth, { GoogleAuthProvider: function () { this.setCustomParameters = () => {}; this.addScope = () => {}; } })
    };
    Object.defineProperty(window, 'firebase', { value: firebase, writable: false, configurable: false });
  }, user);
  return context;
}

async function headerAccount(page, until) {
  const read = () => page.evaluate(() => {
    const visible = (el) => { const cs = getComputedStyle(el); return !el.hidden && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const slot = document.querySelector('#mainNavbar .global-nav-actions .bq-account-slot') || document.querySelector('#mainNavbar .bq-account-slot');
    const opsLinks = [...document.querySelectorAll('a[href="admin.html"], a[href="/admin.html"]')].filter((a) => !a.hidden && a.style.display !== 'none' && a.getAttribute('aria-hidden') !== 'true');
    return {
      text: slot ? slot.textContent.replace(/\s+/g, ' ').trim() : '',
      hasLogin: Boolean(slot && /Iniciar sesi/i.test(slot.textContent)),
      hasAvatar: Boolean(slot && slot.querySelector('.bq-account-avatar')),
      opsVisible: opsLinks.length > 0 && opsLinks.some(visible)
    };
  });
  // Espera el estado final (la verificación en vivo es asíncrona) hasta 8 s.
  const deadline = Date.now() + 8000;
  let state = await read();
  while (until && !until(state) && Date.now() < deadline) {
    await page.waitForTimeout(250);
    state = await read();
  }
  if (!until) { await page.waitForTimeout(1500); state = await read(); }
  return state;
}

async function adminGate(page) {
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const app = document.getElementById('opsAppContainer');
    const fb = document.getElementById('loginFeedback');
    return {
      appVisible: Boolean(app && getComputedStyle(app).display !== 'none'),
      denied: Boolean(fb && /No tienes autorizaci/i.test(fb.textContent)),
      publicHeader: Boolean(document.querySelector('#mainNavbar.main-navbar-exact')),
      publicFooter: Boolean(document.getElementById('siteFooter'))
    };
  });
}

async function rolesAndSession(browser) {
  // Matriz pura de roles.
  {
    const context = await newContext(browser, { width: 1280, blockFirebase: true });
    const { page } = await openPage(context, 'index.html');
    await page.waitForFunction(() => window.BaqueanoRoles, null, { timeout: 15000 });
    const m = await page.evaluate(() => {
      const R = window.BaqueanoRoles;
      return {
        guest: R.resolve(null),
        user: R.resolve({ email: 'x@y.com', emailVerified: true }),
        superV: R.resolve({ email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: true }),
        superUnverified: R.resolve({ email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: false }),
        admin: R.resolve({ email: 'vigoronmixt@gmail.com', emailVerified: true }),
        forgedClaim: R.resolve({ email: 'x@y.com', emailVerified: true, claimsRole: 'root' }),
        opsUser: R.canAccessOps('explorer'), opsGuest: R.canAccessOps('guest'), opsAdmin: R.canAccessOps('admin'), opsSuper: R.canAccessOps('super_admin'),
        frozen: Object.isFrozen(R)
      };
    });
    expect(m.guest === 'guest' && m.user === 'explorer' && m.superV === 'super_admin' && m.admin === 'admin', `Matriz de roles incorrecta: ${JSON.stringify(m)}`);
    expect(m.superUnverified === 'explorer', 'Un correo oficial SIN verificar obtiene privilegios');
    expect(m.forgedClaim === 'explorer', 'Un claim desconocido concede privilegios');
    expect(!m.opsUser && !m.opsGuest && m.opsAdmin && m.opsSuper, 'canAccessOps no respeta la matriz');
    expect(m.frozen, 'BaqueanoRoles es modificable desde la consola');

    // CASO 1: invitado.
    const guest = await headerAccount(page, (h) => h.hasLogin);
    expect(guest.hasLogin && !guest.opsVisible, `CASO 1 invitado: header incorrecto ${JSON.stringify(guest)}`);
    await context.close();
  }

  // CASO 1 / 6: invitado abre admin.html directamente.
  {
    const context = await contextWithFakeFirebase(browser, null);
    const page = await context.newPage();
    await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
    const g = await adminGate(page);
    expect(!g.appVisible, 'CASO 1/6: invitado ve el Ops Center');
    expect(!g.publicHeader && !g.publicFooter, 'Ops Center: se inyectó el header/footer público');
    await context.close();
  }

  // CASO 5: localStorage falsificado (sin Firebase confirmando nada).
  {
    const context = await newContext(browser, { width: 1280, blockFirebase: true });
    await context.addInitScript(([key]) => {
      localStorage.setItem(key, JSON.stringify({ firebaseUid: 'usr_hack', isLoggedIn: true, name: 'Intruso', email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: true, role: 'super_admin', claimsRole: 'super_admin' }));
    }, [SESSION_KEY]);
    const { page } = await openPage(context, 'index.html');
    const forged = await headerAccount(page);
    expect(!forged.opsVisible, `CASO 5: localStorage falsificado muestra el Ops Center ${JSON.stringify(forged)}`);
    await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
    const g = await adminGate(page);
    expect(!g.appVisible, 'CASO 5: localStorage falsificado abre el Ops Center');
    await context.close();
  }

  // CASO 5b: sesión falsificada y Firebase responde "sin usuario" → se limpia.
  {
    const context = await contextWithFakeFirebase(browser, null);
    await context.addInitScript(([key]) => {
      if (!sessionStorage.getItem('bq-test-seeded')) {
        sessionStorage.setItem('bq-test-seeded', '1');
        localStorage.setItem(key, JSON.stringify({ firebaseUid: 'usr_hack', isLoggedIn: true, name: 'Intruso', email: 'vigoronmixt@gmail.com', emailVerified: true, role: 'admin', claimsRole: 'admin' }));
      }
    }, [SESSION_KEY]);
    const { page } = await openPage(context, 'destinos.html');
    const h = await headerAccount(page, (x) => x.hasLogin);
    const stored = await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY);
    expect(!h.opsVisible && h.hasLogin && stored === null, `CASO 5b: sesión falsa no se invalidó con Firebase ${JSON.stringify({ h, stored })}`);
    await context.close();
  }

  // CASOS 2, 3, 4 + claims + correo oficial sin verificar.
  const cases = [
    ['CASO 2 usuario', FAKE_USERS.user, false],
    ['CASO 3 admin', FAKE_USERS.admin, true],
    ['CASO 4 super_admin', FAKE_USERS.super, true],
    ['Correo oficial sin verificar', FAKE_USERS.unverifiedOfficial, false],
    ['Custom Claim admin', FAKE_USERS.claimAdmin, true]
  ];
  for (const [label, user, allowed] of cases) {
    const context = await contextWithFakeFirebase(browser, user);
    const { page, errors } = await openPage(context, 'index.html');
    const h = await headerAccount(page, (x) => x.hasAvatar && x.opsVisible === allowed);
    expect(h.hasAvatar && !h.hasLogin && h.text.includes(user.displayName.split(' ')[0]), `${label}: header sin avatar/nombre ${JSON.stringify(h)}`);
    expect(h.opsVisible === allowed, `${label}: enlace Ops Center ${h.opsVisible ? 'visible' : 'oculto'} (esperado ${allowed ? 'visible' : 'oculto'})`);

    // CASO 7: la sesión sigue al cambiar de página.
    for (const file of ['destinos.html', 'gastronomia.html', 'historia.html']) {
      await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
      const n = await headerAccount(page, (x) => x.hasAvatar && x.opsVisible === allowed);
      expect(n.hasAvatar && n.opsVisible === allowed, `${label}: sesión inconsistente en ${file} ${JSON.stringify(n)}`);
    }

    await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
    const g = await adminGate(page);
    expect(g.appVisible === allowed, `${label}: Ops Center ${g.appVisible ? 'abierto' : 'cerrado'} (esperado ${allowed ? 'abierto' : 'cerrado'})`);
    if (!allowed) expect(g.denied, `${label}: falta el mensaje "No tienes autorización para acceder al Ops Center."`);
    expect(errors.length === 0, `${label}: errores JS ${errors.join(' | ')}`);
    await context.close();
  }

  // Logout desde una página sin SDK propio: limpia sesión y header.
  {
    const context = await contextWithFakeFirebase(browser, FAKE_USERS.user);
    const { page } = await openPage(context, 'historia.html');
    await headerAccount(page, (x) => x.hasAvatar);
    await page.evaluate(() => window.BaqueanoSession.logout());
    await page.waitForTimeout(300);
    const after = await page.evaluate((key) => ({ stored: localStorage.getItem(key), signedOut: window.firebase.auth().currentUser === null }), SESSION_KEY);
    expect(after.stored === null && after.signedOut, `Logout: no cerró la sesión ${JSON.stringify(after)}`);
    await context.close();
  }
}

// ── 6. Enlaces del header y footer válidos desde cualquier página ──────────
async function linkAudit(browser) {
  const context = await newContext(browser, { width: 1440, blockFirebase: true });
  const { page } = await openPage(context, 'index.html');
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('#mainNavbar a[href], #siteFooter a[href], #bqThumbBar a[href]')]
    .map((a) => a.getAttribute('href')).filter((h) => h && !/^(https?:|mailto:|tel:|#|javascript:)/.test(h)))]);
  for (const href of hrefs) {
    const [file, hash] = href.split('#');
    const res = await page.request.get(`${BASE}/${file}`);
    expect(res.status() === 200, `Enlace roto en header/footer: ${href} (${res.status()})`);
    if (hash && res.status() === 200) {
      const html = await res.text();
      expect(new RegExp(`id=["']${hash}["']`).test(html), `Ancla inexistente: ${href}`);
    }
  }
  expect(hrefs.length >= 20, `Header/footer con pocos enlaces internos (${hrefs.length})`);
  const social = await page.evaluate(() => ['instagram.com', 'facebook.com', 'tiktok.com'].every((d) => document.querySelector(`#siteFooter a[href*="${d}"]`)) && /Nicaragua/.test(document.querySelector('#siteFooter .footer-bottom-bar').textContent) && /derechos reservados/i.test(document.getElementById('siteFooter').textContent));
  expect(social, 'Footer: faltan redes oficiales, derechos o "Hecho en Nicaragua"');
  await context.close();
}

const browser = await chromium.launch();
const steps = [
  ['Roles, sesión y Ops Center', rolesAndSession],
  ['Menú móvil', mobileDrawer],
  ['Desplegable de escritorio', desktopDropdown],
  ['Idioma persistente', languagePersistence],
  ['Enlaces de header y footer', linkAudit],
  [`Barrido de ${WIDTHS.length} anchos × ${PAGES.length} páginas`, geometrySweep]
];
for (const [name, fn] of steps) {
  const before = failures.length;
  console.log(`▶ ${name}`);
  try { await fn(browser); } catch (error) { expect(false, `${name}: excepción ${error.message.split('\n')[0]}`); }
  console.log(`  ${failures.length === before ? 'OK' : `${failures.length - before} fallo(s)`}`);
}
await browser.close();

console.log(`\n${checks} comprobaciones, ${failures.length} fallos.`);
if (failures.length) {
  failures.forEach((f) => console.log(' ✗ ' + f));
  process.exit(1);
}
