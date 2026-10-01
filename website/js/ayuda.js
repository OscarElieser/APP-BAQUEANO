/*
 * 🎯 POR QUÉ: permitir que la persona encuentre una respuesta sin recorrer toda la página.
 * ⚙️ CÓMO: normaliza la consulta, filtra las preguntas y abre la primera coincidencia.
 * 📦 QUÉ: búsqueda local accesible y control de acordeones de preguntas frecuentes.
 */
(function () {
  'use strict';
  function normalize(value) { return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  function initHelpSearch() {
    var form = document.getElementById('helpSearchForm'), input = document.getElementById('helpSearch'), status = document.getElementById('helpSearchStatus');
    var items = Array.prototype.slice.call(document.querySelectorAll('#helpFaqList details'));
    if (!form || !input || !status || !items.length) return;
    function filter() {
      var query = normalize(input.value), matches = 0;
      items.forEach(function (item) { var found = !query || normalize(item.textContent + ' ' + item.dataset.search).includes(query); item.hidden = !found; if (found) matches += 1; });
      status.textContent = query ? (matches ? matches + (matches === 1 ? ' respuesta encontrada.' : ' respuestas encontradas.') : 'No encontramos esa respuesta. Podés escribirnos por correo o WhatsApp.') : 'También podés elegir una categoría.';
      return items.filter(function (item) { return !item.hidden; });
    }
    input.addEventListener('input', filter);
    form.addEventListener('submit', function (event) { event.preventDefault(); var matches = filter(); if (matches.length) { matches[0].open = true; matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  }
  document.addEventListener('DOMContentLoaded', initHelpSearch);
}());
