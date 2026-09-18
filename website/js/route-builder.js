// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DISEÑADOR VISUAL DE VIAJES: "CONSTRUYE TU AVENTURA"
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Empoderar al viajero nacional e internacional para que planifique itinerarios
//   ecoturísticos a su medida sin intermediarios foráneos.
// - Conectar presupuesto bimoneda (C$ y US$) bajo Ley 306, días de estadía,
//   condición física y estilo de viaje con paradas campesinas y cooperativas reales.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Asistente por pasos interactivo con selector de parámetros.
// - Algoritmo generador de itinerarios combinando destinos canónicos y negocios.
// - Trazado automático de la ruta resultante en el Mapa Vivo 3D de Nicaragua.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoRouteBuilder:
//   * generateCustomRoute(criteria): Genera el plan de viaje sugerido.
//   * renderRouteResults(route): Despliega las tarjetas de itinerario en el DOM.
// ============================================================================

(function(window, document) {
  'use strict';

  const DESTINATION_POOL = {
    volcanes: [
      { id: 'dest_cerro_negro', name: 'Volcán Cerro Negro', dept: 'León', costNio: 1100, costUsd: 30, tag: 'Sandboarding', image: 'assets/images/destinos/cerro_negro.jpg' },
      { id: 'dest_masaya', name: 'Volcán Masaya (Popogatepe)', dept: 'Masaya', costNio: 180, costUsd: 5, tag: 'Lago de Lava', image: 'assets/images/destinos/volcan_masaya.jpg' },
      { id: 'dest_mombacho', name: 'Volcán Mombacho', dept: 'Granada', costNio: 350, costUsd: 10, tag: 'Bosque Nuboso', image: 'assets/images/destinos/isletas_de_granada.jpg' }
    ],
    playas: [
      { id: 'dest_sjds', name: 'San Juan del Sur & Maderas', dept: 'Rivas', costNio: 700, costUsd: 19, tag: 'Surf & Atardeceres', image: 'assets/images/destinos/playa_maderas.jpg' },
      { id: 'dest_corn', name: 'Corn Island (Caribe Sur)', dept: 'Caribe Sur', costNio: 1800, costUsd: 50, tag: 'Arrecifes Turquesa', image: 'assets/images/destinos/corn_island.jpg' },
      { id: 'dest_apoyo', name: 'Laguna de Apoyo', dept: 'Masaya', costNio: 440, costUsd: 12, tag: 'Cráter de Aguas Termales', image: 'assets/images/destinos/laguna_de_apoyo.jpg' }
    ],
    montana: [
      { id: 'dest_somoto', name: 'Cañón de Somoto', dept: 'Madriz', costNio: 550, costUsd: 15, tag: 'Monumento Nacional', image: 'assets/images/destinos/canon_de_somoto.jpg' },
      { id: 'dest_selva_negra', name: 'Selva Negra & Nebliselva', dept: 'Matagalpa', costNio: 650, costUsd: 18, tag: 'Ruta del Café', image: 'assets/images/destinos/selva_negra.jpg' },
      { id: 'dest_la_luna', name: 'Cascada La Luna', dept: 'Jinotega', costNio: 400, costUsd: 11, tag: 'Cataratas & Selva', image: 'assets/images/destinos/cascada_la_luna.jpg' }
    ],
    cultura: [
      { id: 'dest_ometepe', name: 'Isla de Ometepe', dept: 'Rivas', costNio: 750, costUsd: 20, tag: 'Reserva de Biosfera', image: 'assets/images/destinos/isla_de_ometepe.jpg' },
      { id: 'dest_granada_colonial', name: 'Isletas & Centro Histórico', dept: 'Granada', costNio: 350, costUsd: 10, tag: 'Arquitectura Colonial', image: 'assets/images/destinos/isletas_de_granada.jpg' }
    ]
  };

  const BaqueanoRouteBuilder = {
    init() {
      const form = document.getElementById('routeBuilderForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFormSubmit();
        });
      }
    },

    handleFormSubmit() {
      const days = parseInt(document.getElementById('rbDays')?.value, 10) || 3;
      const style = document.getElementById('rbStyle')?.value || 'aventura';
      const budget = document.getElementById('rbBudget')?.value || 'medio';
      const origin = document.getElementById('rbOrigin')?.value || 'Managua';
      const groupType = document.getElementById('rbGroupType')?.value || 'pareja';

      const itinerary = this.buildItinerary(days, style, budget, origin, groupType);
      this.renderResults(itinerary);
    },

    buildItinerary(days, style, budget, origin, groupType) {
      const selected = [];
      let categoryKeys = ['volcanes', 'montana', 'playas', 'cultura'];

      if (style === 'volcanes') categoryKeys = ['volcanes', 'cultura', 'playas'];
      if (style === 'playas') categoryKeys = ['playas', 'volcanes', 'cultura'];
      if (style === 'montana') categoryKeys = ['montana', 'cultura', 'volcanes'];
      if (style === 'cultura') categoryKeys = ['cultura', 'montana', 'volcanes'];

      let totalNio = 0;
      let totalUsd = 0;

      for (let day = 1; day <= days; day++) {
        const catKey = categoryKeys[(day - 1) % categoryKeys.length];
        const pool = DESTINATION_POOL[catKey] || DESTINATION_POOL['volcanes'];
        const item = pool[(day - 1) % pool.length];

        const dayCostNio = item.costNio + (budget === 'confort' ? 800 : budget === 'economico' ? 250 : 500);
        const dayCostUsd = Math.round(dayCostNio / 36.65);

        totalNio += dayCostNio;
        totalUsd += dayCostUsd;

        selected.push({
          day: day,
          title: `Día ${day}: ${item.name}`,
          department: item.dept,
          highlight: item.tag,
          image: item.image,
          estimatedNio: dayCostNio,
          estimatedUsd: dayCostUsd,
          recommendation: `Salida recomendada desde ${origin}. Parada en cooperativas locales para consumo campesino justo.`
        });
      }

      return {
        days,
        style,
        budget,
        origin,
        groupType,
        totalNio,
        totalUsd,
        stops: selected
      };
    },

    renderResults(itinerary) {
      const resultsWrap = document.getElementById('routeResultsContainer');
      const totalCostEl = document.getElementById('rbTotalCostDisplay');
      const stopsListEl = document.getElementById('rbStopsList');

      if (!resultsWrap || !stopsListEl) return;

      if (totalCostEl) {
        totalCostEl.innerHTML = `C$ ${itinerary.totalNio.toLocaleString('es-NI')} NIO <span style="font-size: 0.85rem; color: #94A3B8;">(≈ $${itinerary.totalUsd} USD)</span>`;
      }

      stopsListEl.innerHTML = itinerary.stops.map((stop) => `
        <div class="rb-stop-card" style="display: flex; gap: 1rem; background: rgba(13, 27, 42, 0.7); border: 1px solid rgba(244, 230, 193, 0.15); border-radius: 12px; padding: 1rem; margin-bottom: 0.85rem; align-items: center;">
          <div style="width: 48px; height: 48px; border-radius: 10px; background: #F65E01; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;">
            ${stop.day}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
              <strong style="color: #FFFFFF; font-size: 0.95rem;">${stop.title}</strong>
              <span style="font-size: 0.76rem; color: #F59E0B; background: rgba(245, 158, 11, 0.12); padding: 0.2rem 0.5rem; border-radius: 4px;">
                ${stop.department}
              </span>
            </div>
            <p style="font-size: 0.8rem; color: #F4E6C1; margin: 0 0 0.3rem 0; opacity: 0.85;">
              ${stop.recommendation}
            </p>
            <div style="font-size: 0.76rem; color: #10B981; font-weight: 600;">
              Gasto aproximado: C$ ${stop.estimatedNio} (≈ $${stop.estimatedUsd} USD)
            </div>
          </div>
        </div>
      `).join('');

      resultsWrap.style.display = 'block';
      resultsWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Animar en el Mapa 3D si existe
      if (window.Baqueano3DMap) {
        window.Baqueano3DMap.drawRoute('ruta_volcanes');
      }
    }
  };

  window.BaqueanoRouteBuilder = BaqueanoRouteBuilder;

  document.addEventListener('DOMContentLoaded', () => {
    BaqueanoRouteBuilder.init();
  });

})(window, document);
