import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({version:1,essential:true})));
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5077/historia.html', { waitUntil: 'load' }); await p.waitForTimeout(1000);
console.log(JSON.stringify(await p.evaluate(() => {
  const targets = { actions: document.querySelector('#mainNavbar .global-nav-actions'), sos: document.querySelector('#mainNavbar .global-nav-actions > .sos-quick-btn'), slot: document.querySelector('#mainNavbar .global-nav-actions > .bq-account-slot') };
  const props = /(^|;)\s*(width|max-width|flex|display|overflow|flex-basis|min-width)\s*:/;
  const out = {};
  for (const [name, el] of Object.entries(targets)) {
    const cs = getComputedStyle(el); out[name] = { width: cs.width, maxW: cs.maxWidth, display: cs.display, flex: cs.flex, overflow: cs.overflow, rules: [] };
    for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      const walk = (list, media) => { for (const r of list) { if (r.cssRules && !r.selectorText) { const m = r.conditionText || r.media?.mediaText || ''; if (!m || window.matchMedia(m).matches) walk(r.cssRules, m); } else if (r.selectorText) { let ok = false; try { ok = el.matches(r.selectorText); } catch (e) {} if (ok && props.test(r.style.cssText)) out[name].rules.push((sheet.href||'inline').split('/').pop().split('?')[0] + ' [' + media + '] ' + r.selectorText.slice(0,80) + ' => ' + r.style.cssText.split(';').filter(x => /width|display|flex|overflow/.test(x)).join(';').slice(0,140)); } } };
      walk(rules, ''); }
  }
  return out;
}), null, 1));
await b.close();
