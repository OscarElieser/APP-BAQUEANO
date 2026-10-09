#!/usr/bin/env node
/**
 * 🧭 BAQUEANO IMPACTO — prueba de la sección pública "Nuestro impacto"
 *
 * 🎯 POR QUÉ: la sección no puede mostrar cifras inventadas ni romper el diseño
 *   responsive o la accesibilidad, y debe presentarse como "contribución", nunca
 *   como reconocimiento oficial.
 * ⚙️ CÓMO: Playwright contra el servidor local (`PORT=5077 node dev-server.js`
 *   desde la raíz; URL configurable con BQ_BASE_URL).
 *   1. Sin respuesta de Supabase (red bloqueada) → cada cifra dice "Sin datos
 *      suficientes" y la alineación muestra el aviso de "no publicada".
 *   2. Con respuesta simulada → se pintan exactamente los valores recibidos
 *      (incluye "x / 17" y "x / 153") y la matriz con fuente oficial enlazada.
 *   3. 320–1920 px: sin desbordamiento horizontal ni objetivos táctiles < 44 px.
 *   4. Accesibilidad: h2 con aria-labelledby, enlaces con nombre, contraste AA
 *      del texto de la sección, foco visible en enlaces.
 *   5. i18n: la cabecera cambia en los 8 idiomas (?lang=xx).
 *   6. Ninguna frase afirma reconocimiento "oficial" de BAQUEANO.
 * 📦 QUÉ: `node scripts/impact-section.test.mjs` → código de salida 0 si todo pasa.
 */
import { chromium } from '@playwright/test';

const BASE = (process.env.BQ_BASE_URL || 'http://127.0.0.1:5077').replace(/\/$/, '');
const SUPABASE = /heiudfpthqwtjrtluqlm\.supabase\.co\/rest\/v1\//;
const WIDTHS = [320, 360, 390, 768, 1024, 1366, 1920];
const LANG_TITLES = {
  es: 'Lo que BAQUEANO aporta, con evidencia',
  en: 'What BAQUEANO contributes, with evidence',
  fr: "Ce qu'apporte BAQUEANO, preuves à l'appui",
  it: 'Cosa apporta BAQUEANO, con prove',
  pt: 'O que o BAQUEANO oferece, com evidências',
  de: 'Was BAQUEANO beiträgt – mit Nachweisen',
  ko: 'BAQUEANO가 기여하는 것, 증거와 함께',
  zh: 'BAQUEANO 的贡献，有据可查'
};
const SUMMARY = {
  generated_at: '2026-10-05T12:00:00Z', destinos_publicados: 7, destinos_verificados: 0, negocios_locales: 5, negocios_verificados: 5,
  experiencias_publicadas: 0, experiencias_comunitarias: 0, rutas_creadas: 0, itinerarios_generados: 31, consultas_baqui: 4,
  practicas_sostenibles_verificadas: 0, departamentos_catalogados: 17, departamentos_con_contenido: 9, municipios_catalogados: 153,
  municipios_con_contenido: 5, cobertura_territorial_baqueano: 3.3, alineaciones_vigentes: 1
};
const ALIGN = [{ national_framework: 'intur_2026', axis_name: 'Promoción turística', description: 'Descripción de prueba.', alignment_type: 'direct',
  source_name: 'INTUR — intur.gob.ni', source_url: 'https://www.intur.gob.ni/2026/01/13/asi-impulsara-intur-el-turismo-en-nicaragua-en-2026/', verified_at: '2026-10-05' }];

let failures = 0;
let checks = 0;
function check(ok, label) {
  checks += 1;
  if (!ok) { failures += 1; console.log(` ✗ ${label}`); } else console.log(` ✓ ${label}`);
}

async function openSection(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('#impacto').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('bqImpactGrid')?.getAttribute('aria-busy') === 'false', null, { timeout: 15000 });
}

const browser = await chromium.launch();
try {
  // 1) Sin datos: Supabase bloqueado → "Sin datos suficientes", nunca cifras.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route(SUPABASE, (route) => route.abort());
    await openSection(page, `${BASE}/nosotros.html?lang=es`);
    const values = await page.locator('[data-impact-key]').allTextContents();
    check(values.length === 8 && values.every((v) => v.trim() === 'Sin datos suficientes'), `sin servidor: 8/8 indicadores dicen "Sin datos suficientes" (${values.join(' | ')})`);
    check(/todavía no está publicada/.test(await page.locator('#bqImpactAlign').innerText()), 'sin servidor: la alineación avisa que no está publicada');
    await page.close();
  }

  // 2) Con datos simulados → se pintan exactamente los valores recibidos.
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await page.route(SUPABASE, (route) => {
      const url = route.request().url();
      const body = url.includes('rpc/public_impact_summary') ? SUMMARY : url.includes('national_alignment') ? ALIGN : null;
      return body ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }) : route.abort();
    });
    await openSection(page, `${BASE}/nosotros.html?lang=es`);
    const text = (key) => page.locator(`[data-impact-key="${key}"]`).innerText();
    check((await text('departamentos_con_contenido')) === '9 / 17', 'con datos: departamentos "9 / 17"');
    check((await text('municipios_con_contenido')) === '5 / 153', 'con datos: municipios "5 / 153"');
    check((await text('cobertura_territorial_baqueano')).startsWith('3.3') || (await text('cobertura_territorial_baqueano')).startsWith('3,3'), 'con datos: cobertura 3,3 %');
    check((await text('itinerarios_generados')) === '31', 'con datos: itinerarios 31');
    check((await text('experiencias_comunitarias')) === '0', 'con datos: 0 se muestra como 0 (no se oculta ni se rellena)');
    const link = page.locator('#bqImpactAlign a[href^="https://www.intur.gob.ni/"]');
    check(await link.count() === 1 && (await link.getAttribute('rel')).includes('noopener'), 'con datos: fuente oficial enlazada con rel=noopener');
    await page.close();
  }

  // 3) Responsive: sin desbordamiento horizontal y objetivos táctiles ≥ 44 px.
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route(SUPABASE, (route) => route.abort());
    await openSection(page, `${BASE}/nosotros.html?lang=es`);
    const result = await page.evaluate(() => {
      const section = document.getElementById('impacto');
      const vw = document.documentElement.clientWidth;
      const overflow = [...section.querySelectorAll('*')].filter((n) => { const r = n.getBoundingClientRect(); return r.width && (r.right > vw + 1 || r.left < -1); }).map((n) => n.className || n.tagName);
      const small = [...section.querySelectorAll('a, summary, button')].filter((n) => { const r = n.getBoundingClientRect(); return r.width && r.height < 44; }).map((n) => n.textContent.trim().slice(0, 30));
      return { overflow, small, docOverflow: document.documentElement.scrollWidth > vw + 1 };
    });
    check(!result.overflow.length && !result.small.length, `${width}px: sin desbordes (${result.overflow.slice(0, 3)}) ni objetivos < 44 px (${result.small.slice(0, 3)})`);
    await page.close();
  }

  // 4) Accesibilidad estructural y contraste AA del texto de la sección.
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await page.route(SUPABASE, (route) => route.abort());
    await openSection(page, `${BASE}/nosotros.html?lang=es`);
    const a11y = await page.evaluate(() => {
      const section = document.getElementById('impacto');
      const labelled = document.getElementById(section.getAttribute('aria-labelledby'));
      const unnamed = [...section.querySelectorAll('a')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label')).length;
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bgOf = (node) => { while (node) { const c = parse(getComputedStyle(node).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c; node = node.parentElement; } return [255, 255, 255]; };
      const low = [];
      section.querySelectorAll('h2, h3, p, span, strong, a, summary').forEach((node) => {
        if (!node.textContent.trim() || !node.getClientRects().length) return;
        const fg = parse(getComputedStyle(node).color); const bg = bgOf(node);
        const l1 = lum(fg), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        if (ratio < 4.5) low.push(`${node.tagName}:${node.textContent.trim().slice(0, 25)} (${ratio.toFixed(2)})`);
      });
      return { heading: labelled && labelled.tagName, unnamed, low };
    });
    check(a11y.heading === 'H2', 'la sección se etiqueta con su h2 (aria-labelledby)');
    check(a11y.unnamed === 0, 'todos los enlaces tienen nombre accesible');
    check(!a11y.low.length, `contraste AA ≥ 4.5:1 en todo el texto (${a11y.low.slice(0, 4).join('; ')})`);
    await page.locator('.bq-impact-how a').first().focus();
    const outline = await page.locator('.bq-impact-how a').first().evaluate((n) => getComputedStyle(n).outlineStyle);
    check(outline !== 'none', 'foco visible en los enlaces de capacidades');
    await page.close();
  }

  // 5) i18n en 8 idiomas y 6) sin reclamos de reconocimiento oficial.
  for (const [lang, title] of Object.entries(LANG_TITLES)) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
    await page.route(SUPABASE, (route) => route.abort());
    await openSection(page, `${BASE}/nosotros.html?lang=${lang}`);
    await page.waitForFunction((t) => document.getElementById('bqImpactTitle')?.textContent.trim() === t, title, { timeout: 10000 }).catch(() => {});
    const got = (await page.locator('#bqImpactTitle').innerText()).trim();
    check(got === title, `${lang}: título traducido ("${got}")`);
    if (lang === 'es') {
      const all = await page.locator('#impacto').innerText();
      check(!/reconoc\w* oficial(mente)? (a|de) BAQUEANO|BAQUEANO (forma parte|es parte) (oficial|del plan)/i.test(all.replace(/no un reconocimiento oficial|no forma parte/gi, '')), 'es: no afirma reconocimiento oficial de BAQUEANO');
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${checks} comprobaciones, ${failures} fallos.`);
process.exit(failures ? 1 : 0);
