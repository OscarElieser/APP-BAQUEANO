// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CALCULADORA RURAL & MOTOR FISCAL LEY 306 (calculator.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Demostrar con datos cuantitativos el impacto económico del modelo Baqueano:
//   la eliminación de comisiones de 20-25% de OTAs foráneas para que ese capital
//   se quede 100% en las cooperativas campesinas locales.
// - Proveer un cotizador bimoneda transparente que aplique la exoneración fiscal
//   de la Ley 306 INTUR para turismo receptivo comunitario.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Event listeners en tiempo real para inputs de rango (sliders).
// - Cálculos matemáticos precisos con formato de moneda bimoneda (USD y NIO a tasa oficial 36.65).
// - Conmutador reactivo entre régimen de turista extranjero (0% IVA) y local (+15% DGI).
//
// 📦 3. QUÉ (WHAT / FUNCIONES EXPUESTAS):
// - initRoiCalculator(): Sliders interactivos de tours mensuales, precio y grupo.
// - initBimonedaCheckout(): Cotizador de boleto turístico bimoneda con Ley 306.
// ============================================================================

function initRoiCalculator() {
  const toursInput = document.getElementById('monthlyTours');
  const priceInput = document.getElementById('avgTourPrice');
  const groupInput = document.getElementById('groupSize');

  const toursLabel = document.getElementById('toursLabel');
  const priceLabel = document.getElementById('priceLabel');
  const groupLabel = document.getElementById('groupLabel');

  const otaLoss = document.getElementById('otaLoss');
  const otaNet = document.getElementById('otaNet');
  const baqueanoNet = document.getElementById('baqueanoNet');
  const annualSavings = document.getElementById('annualSavings');

  if (!toursInput || !priceInput || !groupInput) return;

  const updateCalc = () => {
    const tours = parseInt(toursInput.value, 10) || 25;
    const price = parseInt(priceInput.value, 10) || 35;
    const group = parseInt(groupInput.value, 10) || 3;

    if (toursLabel) toursLabel.textContent = tours;
    if (priceLabel) priceLabel.textContent = `$${price}`;
    if (groupLabel) groupLabel.textContent = `${group} pers.`;

    const totalGross = tours * price * group;
    const otaFee = Math.round(totalGross * 0.20);
    const otaNetFigure = totalGross - otaFee;
    const yearSavings = otaFee * 12;

    const fmt = n => '$' + n.toLocaleString('en-US');

    if (otaLoss) otaLoss.textContent = `-${fmt(otaFee)} USD`;
    if (otaNet) otaNet.textContent = `${fmt(otaNetFigure)} USD`;
    if (baqueanoNet) baqueanoNet.textContent = `${fmt(totalGross)} USD`;
    if (annualSavings) annualSavings.textContent = `+${fmt(yearSavings)} USD`;
  };

  toursInput.addEventListener('input', updateCalc);
  priceInput.addEventListener('input', updateCalc);
  groupInput.addEventListener('input', updateCalc);
  updateCalc();
}

function initBimonedaCheckout() {
  let isTourist = true;
  const TASA_OFICIAL = 36.65;

  window.setTaxRegime = regime => {
    isTourist = regime === 'tourist';
    const btnTourist = document.getElementById('btnRegimeTourist');
    const btnLocal = document.getElementById('btnRegimeLocal');

    if (btnTourist && btnLocal) {
      if (isTourist) {
        btnTourist.classList.add('active');
        btnLocal.classList.remove('active');
      } else {
        btnLocal.classList.add('active');
        btnTourist.classList.remove('active');
      }
    }

    recalcReceipt();
  };

  function recalcReceipt() {
    const subtotal = 105.00;
    const discount = subtotal * 0.15; // 15% promo lanzamiento
    const baseAmount = subtotal - discount;

    const taxRate = isTourist ? 0.0 : 0.15;
    const taxAmount = baseAmount * taxRate;
    const totalUsd = baseAmount + taxAmount;
    const totalNio = totalUsd * TASA_OFICIAL;

    const elSub = document.getElementById('receiptSubtotal');
    const elTax = document.getElementById('receiptTax');
    const elTotalUsd = document.getElementById('receiptTotalUsd');
    const elTotalNio = document.getElementById('receiptTotalNio');

    if (elSub) elSub.textContent = `$${subtotal.toFixed(2)} USD`;
    if (elTax) elTax.textContent = isTourist ? '0% (Exonerado Ley 306 INTUR)' : `+15% DGI ($${taxAmount.toFixed(2)} USD)`;
    if (elTotalUsd) elTotalUsd.textContent = `$${totalUsd.toFixed(2)} USD`;
    if (elTotalNio) elTotalNio.textContent = `C$ ${totalNio.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NIO`;
  }

  // Inicializar cálculo por defecto
  recalcReceipt();
}
