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
 * - Sin dobles simulados (directiva del propietario, 2026-10-04): la sesión y
 *   los roles se prueban contra Firebase REAL (invitado, localStorage
 *   manipulado, sesión falsa invalidada por Firebase). Los casos con cuenta
 *   real (usuario, admin, super_admin) se cubren con BQ_REAL_E2E=1 y con la
 *   verificación manual de Google del propietario.
 *
 * 📦 QUÉ (What / Entregables):
 * - Sale con código 1 si algo falla e imprime cada fallo con página y ancho.
 * - Uso: `node scripts/global-shell.test.mjs` (desde website/).
 *   BQ_QUICK=1 limita el barrido a 4 páginas; BQ_PAGES=a.html,b.html elige páginas;
 *   BQ_WIDTHS=1024,1920 elige anchos.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = (process.env.BQ_BASE_URL || 'http://127.0.0.1:5077').replace(/\/$/, '');
const WEBSITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// BQ_WIDTHS=1024,1280 limita el barrido a esos anchos (reanudar tras un corte).
const ALL_WIDTHS = [320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1366, 1440, 1920];
const WIDTHS = process.env.BQ_WIDTHS ? process.env.BQ_WIDTHS.split(',').map(Number).filter((w) => ALL_WIDTHS.includes(w)) : ALL_WIDTHS;
const EXCLUDED = new Set(['admin.html', 'i18n-test.html']);
const isSiteVerification = (name) => /^google[0-9a-f]{8,}\.html$/.test(name);
const ALL_PAGES = readdirSync(WEBSITE_DIR).filter((f) => f.endsWith('.html') && !EXCLUDED.has(f) && !isSiteVerification(f)).sort();
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
    if (!url.startsWith(BASE) && !/cdnjs\.cloudflare\.com|gstatic\.com|googleapis\.com|firebaseapp\.com|supabase\.co|jsdelivr\.net/.test(url)) return route.abort();
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

// ── 2. Menú móvil (panel izquierdo): abrir/cerrar, acordeón, enlaces, rotación ──
async function mobileDrawer(browser) {
  const context = await newContext(browser, { width: 390, height: 844, mobile: true, blockFirebase: true });
  const { page, errors } = await openPage(context, 'historia.html');
  // Cada clic informa qué paso falló (antes solo se veía "Timeout").
  const click = async (selector, label) => {
    try { await page.click(selector, { timeout: 8000 }); }
    catch (error) {
      const why = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return 'no existe';
        const r = el.getBoundingClientRect();
        const hidden = [];
        for (let node = el; node; node = node.parentElement) {
          const c = getComputedStyle(node);
          if (c.display === 'none' || c.visibility !== 'visible') hidden.push(`${node.tagName.toLowerCase()}.${[...node.classList].join('.')} (${c.display}/${c.visibility})`);
        }
        return `caja ${[r.left, r.top, r.width, r.height].map(Math.round)} · ancho ${innerWidth} · html "${document.documentElement.className}" · ocultos: ${hidden.join(' > ') || 'ninguno'}`;
      }, selector).catch(() => 'sin diagnóstico');
      throw new Error(`clic "${label}" (${selector}) no respondió: ${why}`);
    }
  };
  const state = () => page.evaluate(() => {
    const t = document.getElementById('mobileNavToggle');
    const menu = document.getElementById('navLinksMenu');
    const r = menu.getBoundingClientRect();
    return {
      expanded: t.getAttribute('aria-expanded'),
      open: menu.classList.contains('mobile-open') && document.documentElement.classList.contains('nav-drawer-open'),
      menuInside: r.top >= -1 && r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
      rect: [r.left, r.top, r.right, r.bottom].map(Math.round), vh: innerHeight, y: Math.round(window.scrollY),
      scrollable: ['auto', 'scroll'].includes(getComputedStyle(menu).overflowY),
      openGroups: menu.querySelectorAll('.bq-menu-group.is-open').length
    };
  });
  const canScroll = () => page.evaluate(async () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollBy({ top: 400, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 60));
    return window.scrollY > 0;
  });
  const closers = ['escape', 'backdrop', 'close'];
  for (let i = 1; i <= 6; i += 1) {
    await click('#mobileNavToggle', `abrir panel (ciclo ${i})`);
    await page.waitForTimeout(380);
    const s = await state();
    expect(s.expanded === 'true' && s.open, `Panel móvil ciclo ${i}: no abrió (${JSON.stringify(s)})`);
    expect(s.menuInside && s.scrollable, `Panel móvil ciclo ${i}: fuera del viewport o sin scroll interno ${JSON.stringify(s)}`);
    expect(s.openGroups === 1, `Panel móvil ciclo ${i}: el grupo de la página actual no quedó desplegado (${s.openGroups})`);
    const how = closers[i % 3];
    if (how === 'escape') await page.keyboard.press('Escape');
    else if (how === 'backdrop') await page.mouse.click(380, 600);
    else await click('#navLinksMenu .bq-drawer-close', 'botón cerrar del panel');
    await page.waitForTimeout(380);
    const c = await state();
    expect(c.expanded === 'false' && !c.open, `Panel móvil ciclo ${i} (${how}): no cerró (${JSON.stringify(c)})`);
    expect(await canScroll(), `Panel móvil ciclo ${i} (${how}): la página quedó sin scroll tras cerrar`);
  }

  // Acordeón: un solo grupo abierto a la vez.
  await click('#mobileNavToggle', 'abrir panel (acordeón)');
  await page.waitForTimeout(380);
  for (const group of ['explore', 'community', 'account']) {
    await click(`#bqMenuTrigger-${group}`, `grupo ${group}`);
    await page.waitForTimeout(150);
    const open = await page.evaluate(() => [...document.querySelectorAll('#navLinksMenu .bq-menu-group.is-open')].map((g) => g.dataset.group));
    expect(open.length === 1 && open[0] === group, `Acordeón: al abrir ${group} quedan abiertos ${open.join(',')}`);
  }
  const tools = await page.evaluate(() => {
    const menu = document.getElementById('navLinksMenu');
    const vw = document.documentElement.clientWidth;
    const inBar = (sel) => { const el = document.querySelector(sel); const r = el && el.getBoundingClientRect(); return !!(r && r.width > 0); };
    return {
      lang: Boolean(menu.querySelector('.global-language')),
      account: Boolean(menu.querySelector('[data-bq-account-drawer]')),
      thumb: (() => { const t = document.getElementById('bqThumbBar'); return !!t && getComputedStyle(t).visibility !== 'hidden' && getComputedStyle(t).display !== 'none'; })(),
      vw,
      bar: inBar('#mainNavbar .global-nav-actions > .sos-quick-btn') && inBar('#mainNavbar .global-nav-actions > .global-language') && inBar('#mainNavbar .global-nav-actions > .bq-account-slot > *')
    };
  });
  expect(tools.lang && tools.account, 'Panel móvil: faltan idioma o cuenta dentro del panel');
  expect(tools.thumb, 'Panel móvil: la barra inferior desaparece al abrir el panel');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  const bar = await page.evaluate(() => ['#mainNavbar .global-nav-actions > .sos-quick-btn', '#mainNavbar .global-nav-actions > .global-language', '#mainNavbar .global-nav-actions > .bq-account-slot > *', '#mobileNavToggle'].every((sel) => { const el = document.querySelector(sel); const r = el && el.getBoundingClientRect(); return !!(r && r.width > 0 && r.right <= document.documentElement.clientWidth + 1 && getComputedStyle(el).visibility === 'visible'); }));
  expect(bar, 'Barra superior móvil: falta SOS, Usuario, ES o ☰');
  const closedByEscape = await state();
  expect(closedByEscape.expanded === 'false' && !closedByEscape.open, 'Panel móvil: Escape con un grupo desplegado no cerró el panel');

  // Rotación: horizontal y regreso, sin desbordes.
  for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over <= 1, `Rotación ${vp.width}x${vp.height}: desbordamiento horizontal ${over} px`);
  }

  // Elegir un enlace navega y la página nueva carga con el panel cerrado.
  await click('#mobileNavToggle', 'abrir panel (tras rotación)');
  await page.waitForTimeout(380);
  await click('#bqMenuTrigger-explore', 'grupo Explorar');
  await page.waitForTimeout(150);
  await Promise.all([page.waitForURL(/destinos\.html/, { timeout: 15000 }), page.click('#bqMenuPanel-explore a[href="destinos.html"]')]);
  await page.waitForFunction(() => document.getElementById('mobileNavToggle'), null, { timeout: 15000 });
  const after = await state();
  expect(after.expanded === 'false' && !after.open, 'Panel móvil: queda abierto tras cambiar de página');
  expect(errors.length === 0, `Panel móvil: errores JS ${errors.join(' | ')}`);
  await context.close();
}

// ── 3. Escritorio: cinco grupos con desplegables independientes ─────────────
async function desktopDropdown(browser) {
  for (const width of [1024, 1280, 1366, 1920]) {
    const context = await newContext(browser, { width, blockFirebase: true });
    const { page, errors } = await openPage(context, 'index.html');
    const labels = await page.evaluate(() => [...document.querySelectorAll('#navLinksMenu > a.bq-menu-home, #navLinksMenu .bq-menu-trigger')].map((el) => el.id || 'home'));
    expect(labels.length === 5, `Escritorio @${width}px: se esperaban 5 grupos, hay ${labels.length}`);
    for (const group of ['explore', 'culture', 'community', 'account']) {
      await page.click(`#bqMenuTrigger-${group}`);
      await page.waitForTimeout(260);
      const r = await page.evaluate((g) => {
        const panel = document.getElementById(`bqMenuPanel-${g}`);
        const pr = panel.getBoundingClientRect();
        const links = [...panel.querySelectorAll('a[href]:not([hidden])')];
        const blocked = links.filter((a) => { const b = a.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !hit || !a.contains(hit); }).length;
        return {
          expanded: document.getElementById(`bqMenuTrigger-${g}`).getAttribute('aria-expanded'),
          inside: pr.left >= 0 && pr.right <= document.documentElement.clientWidth && pr.bottom <= innerHeight + 1 && pr.height > 0,
          open: document.querySelectorAll('#navLinksMenu .bq-menu-group.is-open').length,
          links: links.length, blocked
        };
      }, group);
      expect(r.expanded === 'true' && r.inside && r.open === 1, `Grupo ${group} @${width}px: ${JSON.stringify(r)}`);
      expect(r.links > 0 && r.blocked === 0, `Grupo ${group} @${width}px: ${r.blocked} enlaces tapados`);
    }
    // Teclado: ↓ entra al panel, ↓ avanza, Esc cierra y devuelve el foco.
    await page.keyboard.press('Escape');
    await page.focus('#bqMenuTrigger-culture');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    const first = await page.evaluate(() => document.activeElement.getAttribute('href'));
    await page.keyboard.press('ArrowDown');
    const second = await page.evaluate(() => document.activeElement.getAttribute('href'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const back = await page.evaluate(() => ({ id: document.activeElement.id, exp: document.getElementById('bqMenuTrigger-culture').getAttribute('aria-expanded') }));
    expect(first === 'historia.html' && second === 'gastronomia.html', `Teclado @${width}px: ↓ no recorre los enlaces (${first}, ${second})`);
    expect(back.id === 'bqMenuTrigger-culture' && back.exp === 'false', `Teclado @${width}px: Esc no cierra ni devuelve el foco`);
    // Hover con puntero fino y clic fuera.
    await page.hover('#bqMenuTrigger-community');
    await page.waitForTimeout(260);
    const hovered = await page.evaluate(() => document.getElementById('bqMenuTrigger-community').getAttribute('aria-expanded'));
    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(260);
    const closed = await page.evaluate(() => document.querySelectorAll('#navLinksMenu .bq-menu-group.is-open').length);
    expect(hovered === 'true', `Hover @${width}px: no abre Comunidad`);
    expect(closed === 0, `Clic fuera @${width}px: el grupo sigue abierto`);
    expect(errors.length === 0, `Escritorio @${width}px: errores JS ${errors.join(' | ')}`);
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

// ── 5. Roles y sesión con Firebase REAL (sin dobles simulados) ──────────────
// Los casos con cuenta (usuario, admin y super_admin) exigen iniciar sesión de
// verdad: se cubren con la prueba E2E real opcional (BQ_REAL_E2E=1) y, para
// Google de admin/super_admin, con la verificación manual del propietario.

async function headerAccount(page, until, waitMs = 8000) {
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
  // Espera el estado final (la verificación en vivo es asíncrona).
  const deadline = Date.now() + waitMs;
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

  // CASO 1 / 6: invitado abre admin.html directamente (Firebase real).
  {
    const context = await newContext(browser, { width: 1280 });
    const page = await context.newPage();
    await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
    const g = await adminGate(page);
    expect(!g.appVisible, 'CASO 1/6: invitado ve el Ops Center');
    expect(!g.publicHeader && !g.publicFooter, 'Ops Center: se inyectó el header/footer público');
    await context.close();
  }

  // CASO 5: localStorage falsificado sin que Firebase confirme nada.
  {
    const context = await newContext(browser, { width: 1280, blockFirebase: true });
    await context.addInitScript(([key]) => {
      localStorage.setItem(key, JSON.stringify({ firebaseUid: 'usr_hack', isLoggedIn: true, name: 'Intruso', email: 'oscarelieser.informatica.inatec@gmail.com', emailVerified: true, role: 'super_admin', claimsRole: 'super_admin' }));
    }, [SESSION_KEY]);
    const { page } = await openPage(context, 'index.html');
    const forged = await headerAccount(page);
    expect(!forged.opsVisible, `CASO 5: localStorage falsificado muestra el Ops Center ${JSON.stringify(forged)}`);
    await context.close();
  }

  // CASO 5b: sesión falsificada + Firebase REAL sin usuario → se invalida.
  {
    const context = await newContext(browser, { width: 1280 });
    await context.addInitScript(([key]) => {
      if (!sessionStorage.getItem('bq-test-seeded')) {
        sessionStorage.setItem('bq-test-seeded', '1');
        localStorage.setItem(key, JSON.stringify({ firebaseUid: 'usr_hack', isLoggedIn: true, name: 'Intruso', email: 'vigoronmixt@gmail.com', emailVerified: true, role: 'admin', claimsRole: 'admin' }));
      }
    }, [SESSION_KEY]);
    const { page } = await openPage(context, 'destinos.html');
    // Depende de descargar el SDK real de Firebase desde gstatic (medido:
    // 4 s a 14 s según la red): margen amplio. El Ops Center nunca se muestra.
    const h = await headerAccount(page, (x) => x.hasLogin, 25000);
    const stored = await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY);
    expect(!h.opsVisible && h.hasLogin && stored === null, `CASO 5b: Firebase real no invalidó la sesión falsa ${JSON.stringify({ h, stored })}`);
    await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
    const g = await adminGate(page);
    expect(!g.appVisible, 'CASO 5b: la sesión falsa abre el Ops Center');
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
  ['roles', 'Roles, sesión y Ops Center', rolesAndSession],
  ['movil', 'Menú móvil', mobileDrawer],
  ['escritorio', 'Desplegable de escritorio', desktopDropdown],
  ['idioma', 'Idioma persistente', languagePersistence],
  ['enlaces', 'Enlaces de header y footer', linkAudit],
  ['barrido', `Barrido de ${WIDTHS.length} anchos × ${PAGES.length} páginas`, geometrySweep]
];
// BQ_STEPS=roles,movil ejecuta solo esos pasos; cada fallo se imprime al terminar su paso.
const onlySteps = process.env.BQ_STEPS ? new Set(process.env.BQ_STEPS.split(',')) : null;
for (const [id, name, fn] of steps) {
  if (onlySteps && !onlySteps.has(id)) continue;
  const before = failures.length;
  console.log(`▶ ${name}`);
  try { await fn(browser); } catch (error) { expect(false, `${name}: excepción ${error.message.split('\n')[0]}`); }
  console.log(`  ${failures.length === before ? 'OK' : `${failures.length - before} fallo(s)`}`);
  failures.slice(before).forEach((f) => console.log('   ✗ ' + f));
}
await browser.close();

console.log(`\n${checks} comprobaciones, ${failures.length} fallos.`);
if (failures.length) {
  failures.forEach((f) => console.log(' ✗ ' + f));
  process.exit(1);
}
