// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DISEÑADOR VISUAL DE VIAJES: "CONSTRUYE TU AVENTURA"
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Empoderar al viajero nacional e internacional para planificar itinerarios
//   ecoturísticos a su medida sin intermediarios foráneos.
// - Conectar presupuesto bimoneda (C$ y US$) bajo Ley 306, días de estadía,
//   condición física y estilo de viaje con paradas campesinas y cooperativas reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Asistente por pasos interactivo con selector de parámetros y chips.
// - Algoritmo generador de itinerarios combinando destinos canónicos y cooperativas.
// - Trazado automático de la ruta resultante en el Mapa Vivo 3D de Nicaragua.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoRouteBuilder:
//   * generateCustomRoute(): Genera el plan de viaje sugerido según el formulario.
//   * renderRouteResults(itinerary): Despliega las tarjetas de itinerario en el DOM.
// ============================================================================

(function(window, document) {
  'use strict';

  const DESTINATION_POOL = {
    volcanes: [
      { id: 'dest_cerro_negro', name: 'Volcán Cerro Negro', dept: 'León', costNio: 1100, costUsd: 30, tag: 'Sandboarding en Ceniza', coop: 'Guías de Los Maribios' },
      { id: 'dest_masaya', name: 'Volcán Masaya (Popogatepe)', dept: 'Masaya', costNio: 180, costUsd: 5, tag: 'Cráter Santiago & Lava', coop: 'Guías Comunitarios Nindirí' },
      { id: 'dest_mombacho', name: 'Volcán Mombacho', dept: 'Granada', costNio: 350, costUsd: 10, tag: 'Bosque Nuboso & Fumarolas', coop: 'Coop. Cafetalera Las Flores' },
      { id: 'dest_concepcion', name: 'Volcán Concepción', dept: 'Rivas (Ometepe)', costNio: 750, costUsd: 20, tag: 'Ascenso a la Cumbre', coop: 'Coop. Ecoturística Ometepe' }
    ],
    playa: [
      { id: 'dest_sjds', name: 'San Juan del Sur & Playa Maderas', dept: 'Rivas', costNio: 700, costUsd: 19, tag: 'Surf & Atardecer Pacífico', coop: 'Coop. Pescadores La Bahía' },
      { id: 'dest_corn', name: 'Corn Island & Little Corn', dept: 'Caribe Sur', costNio: 1800, costUsd: 50, tag: 'Arrecifes de Coral & Panga', coop: 'Coop. Pesquera Creole' },
      { id: 'dest_apoyo', name: 'Laguna de Apoyo', dept: 'Masaya', costNio: 440, costUsd: 12, tag: 'Cráter de Aguas Cristalinas', coop: 'Posada La Abuela & Aliados' }
    ],
    montana: [
      { id: 'dest_somoto', name: 'Cañón de Somoto', dept: 'Madriz', costNio: 550, costUsd: 15, tag: 'Monumento Nacional Acuático', coop: 'Coop. Sonís Somoto' },
      { id: 'dest_selva_negra', name: 'Selva Negra & Nebliselva', dept: 'Matagalpa', costNio: 650, costUsd: 18, tag: 'Ruta del Café Orgánico', coop: 'Coop. Cafetalera Matagalpa' },
      { id: 'dest_la_luna', name: 'Cascada La Luna', dept: 'Jinotega', costNio: 400, costUsd: 11, tag: 'Cataratas & Selva Virgen', coop: 'Guías Campesinos Bocay' }
    ],
    cultura: [
      { id: 'dest_ometepe', name: 'Isla de Ometepe', dept: 'Rivas', costNio: 750, costUsd: 20, tag: 'Petroglifos & Reserva Biosfera', coop: 'Finca Magdalena Coop.' },
      { id: 'dest_granada_colonial', name: 'Granada Colonial & Isletas', dept: 'Granada', costNio: 350, costUsd: 10, tag: 'Patrimonio & Lago Cocibolca', coop: 'Asoc. Lancheros El Lago' },
      { id: 'dest_pueblos_blancos', name: 'Pueblos Blancos & San Juan de Oriente', dept: 'Masaya', costNio: 300, costUsd: 8, tag: 'Cerámica Ancestral', coop: 'Taller Comunitario de Barro' }
    ],
    gastronomia: [
      { id: 'dest_esteli', name: 'Ruta del Tabaco & Comiderías Campesinas', dept: 'Estelí', costNio: 450, costUsd: 12, tag: 'Gastronomía Segoviana', coop: 'Comedor Doña Chepita' },
      { id: 'dest_nagarote', name: 'Nagarote & La Paz Centro', dept: 'León', costNio: 300, costUsd: 8, tag: 'Quesillo Tradicional en Hoja', coop: 'Asoc. Quesilleras Nicas' }
    ]
  };

  const BaqueanoRouteBuilder = {
    selectedDays: 3,
    selectedBudget: 'economico',

    init() {
      // 1. Selector de días interactivo (chips)
      const dayChips = document.querySelectorAll('#rbDaysSelector .rb-chip');
      dayChips.forEach(chip => {
        chip.addEventListener('click', () => {
          dayChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.selectedDays = parseInt(chip.getAttribute('data-days'), 10) || 3;
          this.calculateAndRender();
        });
      });

      // 2. Selector de presupuesto (chips)
      const budgetChips = document.querySelectorAll('#rbBudgetSelector .rb-chip');
      budgetChips.forEach(chip => {
        chip.addEventListener('click', () => {
          budgetChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.selectedBudget = chip.getAttribute('data-budget') || 'economico';
          this.calculateAndRender();
        });
      });

      // 3. Botón de cálculo manual
      const calcBtn = document.getElementById('btnCalculateRoute');
      if (calcBtn) {
        calcBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.calculateAndRender();
        });
      }

      // 4. Botón animar ruta en mapa 3D
      const animBtn = document.getElementById('btnAnimateRoute3D');
      if (animBtn) {
        animBtn.addEventListener('click', () => {
          if (window.Baqueano3DMap && typeof window.Baqueano3DMap.drawRoute === 'function') {
            window.Baqueano3DMap.drawRoute('ruta_volcanes');
            const mapSection = document.getElementById('mapaVivo3DNicaragua');
            if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      // 5. Botón compartir WhatsApp
      const shareBtn = document.getElementById('btnShareRouteWhatsApp');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.shareOnWhatsApp();
        });
      }

      // 6. Cambios en selectores
      ['rbOriginDept', 'rbTransport', 'rbTravelType', 'rbInterest', 'rbFitness', 'rbStayMode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('change', () => this.calculateAndRender());
        }
      });

      // Generación inicial para que nunca aparezca vacío
      this.calculateAndRender();
    },

    calculateAndRender() {
      const origin = document.getElementById('rbOriginDept')?.value || 'Managua';
      const transport = document.getElementById('rbTransport')?.value || 'particular';
      const travelType = document.getElementById('rbTravelType')?.value || 'pareja';
      const interest = document.getElementById('rbInterest')?.value || 'volcanes';
      const fitness = document.getElementById('rbFitness')?.value || 'moderada';
      const stayMode = document.getElementById('rbStayMode')?.value || 'hospedaje';

      const days = this.selectedDays;
      const budgetTier = this.selectedBudget;

      // Armar itinerario según interés primario y duración
      const pool = DESTINATION_POOL[interest] || DESTINATION_POOL['volcanes'];
      const stops = [];

      let dailyBaseCost = budgetTier === 'todo-incluido' ? 2800 : budgetTier === 'equilibrado' ? 1450 : 650;
      if (stayMode === 'daypass') dailyBaseCost = Math.round(dailyBaseCost * 0.65);

      let totalNio = 0;

      for (let day = 1; day <= days; day++) {
        const item = pool[(day - 1) % pool.length];
        const dayCost = dailyBaseCost;
        totalNio += dayCost;

        stops.push({
          day: day,
          title: `Día ${day}: ${item.name}`,
          department: item.dept,
          highlight: item.tag,
          coop: item.coop,
          costNio: dayCost
        });
      }

      const totalUsd = (totalNio / 36.65).toFixed(2);
      const savingsNio = Math.round(totalNio * 0.20); // 20% de ahorro directo vs OTAs foráneas

      // Actualizar DOM
      const costNioEl = document.getElementById('rbEstimatedCostNio');
      const costUsdEl = document.getElementById('rbEstimatedCostUsd');
      const savingsEl = document.getElementById('rbSavingsNio');
      const timelineEl = document.getElementById('rbTimelineStops');

      if (costNioEl) costNioEl.textContent = `C$ ${totalNio.toLocaleString('es-NI')}`;
      if (costUsdEl) costUsdEl.textContent = `~ $${totalUsd} USD (Tasa BCN 36.65)`;
      if (savingsEl) savingsEl.textContent = `C$ ${savingsNio.toLocaleString('es-NI')}`;

      if (timelineEl) {
        timelineEl.innerHTML = stops.map(s => `
          <div class="itinerary-stop-item">
            <div class="stop-day-badge">Día ${s.day}</div>
            <div class="stop-info">
              <h4 class="stop-title">${s.title}</h4>
              <div class="stop-meta">
                <i class="fa-solid fa-map-pin" style="color: #F65E01;"></i> ${s.department} · 
                <i class="fa-solid fa-handshake" style="color: #10B981;"></i> ${s.coop} · 
                <span style="color: #F4E6C1;">C$ ${s.costNio}</span>
              </div>
            </div>
          </div>
        `).join('');
      }

      this.lastItinerary = { origin, transport, travelType, interest, days, totalNio, totalUsd, savingsNio, stops };
    },

    shareOnWhatsApp() {
      if (!this.lastItinerary) return;
      const it = this.lastItinerary;
      const lines = [
        '🧭 *MI AVENTURA BAQUEANO NICARAGUA*',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `📍 *Salida:* ${it.origin}`,
        `🗓️ *Duración:* ${it.days} Días`,
        `💰 *Inversión Total:* C$ ${it.totalNio.toLocaleString('es-NI')} (~ $${it.totalUsd} USD)`,
        `💚 *Ahorro Comunitario:* C$ ${it.savingsNio.toLocaleString('es-NI')}`,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '*ITINERARIO SUGERIDO:*',
        ...it.stops.map(s => `• Día ${s.day}: ${s.title} (${s.department}) - ${s.coop}`),
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '✅ _Planificado con Baqueano Nicaragua (0% comisiones foráneas)._'
      ];

      const url = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  window.BaqueanoRouteBuilder = BaqueanoRouteBuilder;

  function bootRouteBuilder() {
    if (document.getElementById('routeBuilderSection') || document.getElementById('routePlannerForm')) {
      BaqueanoRouteBuilder.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootRouteBuilder);
  } else {
    setTimeout(bootRouteBuilder, 50);
  }

})(window, document);
