/**
 * 🎯 POR QUÉ: Evitar regresiones en el cierre del compositor y la identidad de testimonios.
 * ⚙️ CÓMO: Playwright abre la portada móvil, cancela un borrador y publica con una sesión simulada.
 * 📦 QUÉ: Prueba enfocada para Cancelar, limpieza del texto, autor persistido y avatar circular.
 */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.addInitScript(() => {
    localStorage.setItem('baqueano_cookie_consent_v1', JSON.stringify({
      essential: true,
      preferences: true,
      analytics: false,
      version: 1,
    }));
    localStorage.setItem('baqueano_user_session_v1', JSON.stringify({
      firebaseUid: 'testimonial-test-user',
      isLoggedIn: true,
      name: 'María Prueba',
      avatar: 'assets/images/logo.png',
    }));
    localStorage.removeItem('baqueano_testimonials');
  });

  await page.goto('http://127.0.0.1:4179/index.html', { waitUntil: 'domcontentloaded' });
  await page.locator('.bq-comment-open').first().waitFor();
  await page.locator('.bq-comment-open').first().click();
  await page.locator('.bq-comment-form textarea').fill('Este borrador debe descartarse.');
  await page.locator('.bq-comment-cancel').click();

  const cancelled = await page.locator('.bq-comment-form').evaluate((form) => (
    form.hidden && form.getAttribute('aria-hidden') === 'true'
  ));
  const cleared = await page.locator('.bq-comment-form textarea').inputValue() === '';

  await page.locator('.bq-comment-open').first().click();
  await page.locator('.bq-comment-form textarea').fill('Una experiencia auténtica en Nicaragua.');
  await page.locator('.bq-comment-submit').click();

  const latestCard = page.locator('.test-card-exact').last();
  const avatarVisible = await latestCard.locator('.bq-test-avatar img').isVisible();
  const author = await latestCard.locator('.test-author-info h4').textContent();
  const stored = await page.evaluate(() => (
    JSON.parse(localStorage.getItem('baqueano_testimonials') || '[]').at(-1)
  ));

  if (!cancelled || !cleared || !avatarVisible || author !== 'María Prueba' || stored?.authorName !== 'María Prueba') {
    throw new Error(JSON.stringify({ cancelled, cleared, avatarVisible, author, stored }));
  }

  console.log('Testimonios: Cancelar, publicación, autor y avatar verificados.');
} finally {
  await browser.close();
}
