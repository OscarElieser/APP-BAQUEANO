// ============================================================================
// BAQUEANO IA — PLANIFICADOR TERRITORIAL WEB
// 🎯 POR QUÉ: crear itinerarios que respondan realmente a la solicitud del viajero.
// ⚙️ CÓMO: envía contexto y preferencias al gateway oficial sin respuestas simuladas.
// 📦 QUÉ: conversación, selección interactiva e itinerario generado por IA conectada.
// ============================================================================
(function(){'use strict';
  const BCN_RATE=36.65;
  const formatNio=(value)=>`C$ ${Number(value||0).toLocaleString('es-NI',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const formatUsd=(value)=>`US$ ${Number(value||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const form=document.getElementById('aiForm'),input=document.getElementById('request'),messages=document.getElementById('messages'),result=document.getElementById('result');
  if(!form||!input||!messages||!result)return;
  const escapeHtml=(value)=>String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  function addMessage(text,type){const article=document.createElement('article');article.className=`ai-message ${type}`;article.innerHTML=`<div class="ai-avatar"><i class="fa-solid ${type==='user'?'fa-user':'fa-compass'}"></i></div><div><small>${type==='user'?'EXPLORADOR':'BAQUEANO IA'}</small><p>${escapeHtml(text)}</p></div>`;messages.appendChild(article);messages.scrollTop=messages.scrollHeight;}
  function renderPlan(plan){const totalUsd=Number(plan.totalUsd||0),totalNio=totalUsd*BCN_RATE;result.innerHTML=`<div class="ai-result-head"><div><span class="ai-result-kicker">Ruta sugerida · ${escapeHtml(plan.territory)}</span><h2>Tu aventura toma forma</h2></div><div class="ai-total">Estimado total <strong>${formatNio(totalNio)}</strong><small>≈ ${formatUsd(totalUsd)} · tasa de referencia BCN ${BCN_RATE}</small></div></div><div class="ai-days">${plan.items.map(item=>`<article class="ai-day"><span>DÍA ${item.day}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></article>`).join('')}</div><p class="ai-result-note"><i class="fa-solid fa-circle-check"></i> Ruta de orientación creada con el catálogo territorial local. Los importes se muestran primero en córdobas y luego en dólares como referencia. Confirma horarios, acceso, tasa y precios antes de viajar.</p>`;result.hidden=false;result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  async function requestPlan(text){const button=form.querySelector('button');button.disabled=true;button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i><span>Preparando</span>';try{const budgetNio=Number(document.getElementById('budget').value);const payload={days:Number(document.getElementById('days').value),groupSize:Number(document.getElementById('travelers').value),budgetNio,budgetUsd:Number((budgetNio/BCN_RATE).toFixed(2)),currency:'NIO',exchangeRate:BCN_RATE,department:document.getElementById('territory').value,interests:[document.querySelector('input[name="style"]:checked').value],travelStyle:document.querySelector('input[name="style"]:checked').value,prompt:text};const response=await fetch('/api/baqueano-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error('gateway');const data=await response.json();if(!data.success||!data.itinerary)throw new Error('invalid');addMessage('La inteligencia territorial terminó de analizar tu solicitud. Revisá la ruta y ajustá cualquier preferencia que querás cambiar.','assistant');const days=data.itinerary.days||[];renderPlan({territory:payload.department,totalUsd:data.itinerary.totalEstimatedCostUsd||payload.budgetUsd,items:days.map((day,index)=>({day:day.dayNumber||index+1,title:day.title||`Día ${index+1}`,copy:(day.stops||[]).map(stop=>stop.name).join(' · ')||day.summary||'Información no disponible.'}))});}catch(_){addMessage('No fue posible conectar con la inteligencia territorial. Tu solicitud no fue reemplazada por una ruta automática. Intentá nuevamente cuando el servicio esté disponible.','assistant');result.hidden=true;}finally{button.disabled=false;button.innerHTML='<span>Crear mi ruta</span><i class="fa-solid fa-arrow-up"></i>';}}
  form.addEventListener('submit',(event)=>{event.preventDefault();const text=input.value.trim();if(!text)return;addMessage(text,'user');input.value='';requestPlan(text);});
  document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.prompt;input.focus();}));
  document.querySelectorAll('[data-ai-capability]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-ai-capability]').forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');input.value=button.dataset.aiCapability||'';const style=document.querySelector(`input[name="style"][value="${button.dataset.style}"]`);if(style)style.checked=true;document.getElementById('planner')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});window.setTimeout(()=>input.focus(),450);}));

  // Señales vivas del hero y propuesta sorpresa para iniciar sin fricción.
  const territoryInput=document.getElementById('territory'),budgetInput=document.getElementById('budget'),budgetEquivalent=document.getElementById('budgetEquivalent'),liveTerritory=document.getElementById('aiLiveTerritory'),liveBudget=document.getElementById('aiLiveBudget'),surpriseButton=document.getElementById('aiSurpriseRoute');
  const syncHero=()=>{const amount=Number(budgetInput?.value||0);if(liveTerritory)liveTerritory.textContent=territoryInput?.value||'Nicaragua';if(liveBudget)liveBudget.textContent=formatNio(amount);if(budgetEquivalent)budgetEquivalent.textContent=`Equivale a ${formatUsd(amount/BCN_RATE)} · 1 US$ = C$ ${BCN_RATE}`;};
  territoryInput?.addEventListener('change',syncHero);
  budgetInput?.addEventListener('input',syncHero);
  surpriseButton?.addEventListener('click',()=>{
    const territories=[...territoryInput.options];
    territoryInput.selectedIndex=Math.floor(Math.random()*territories.length);
    document.getElementById('days').value=String(2+Math.floor(Math.random()*5));
    document.getElementById('travelers').value=String(1+Math.floor(Math.random()*4));
    budgetInput.value=String(16500+Math.floor(Math.random()*12)*1850);
    const styles=[...document.querySelectorAll('input[name="style"]')];
    const style=styles[Math.floor(Math.random()*styles.length)];
    if(style)style.checked=true;
    syncHero();
    const styleLabel=style?.value||'aventura';
    input.value=`Sorpréndeme con una ruta de ${styleLabel} por ${territoryInput.value}, combinando lugares emblemáticos y experiencias comunitarias.`;
    addMessage(`Elegí ${territoryInput.value} como punto de partida. Ajustá cualquier dato o creá la ruta cuando estés listo.`,'assistant');
    document.getElementById('planner')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    window.setTimeout(()=>input.focus(),500);
  });
  syncHero();
})();
