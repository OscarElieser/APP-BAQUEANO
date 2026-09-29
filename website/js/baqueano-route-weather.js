// ============================================================================
// BAQUEANO — CLIMA TERRITORIAL DE LA RUTA
// ============================================================================
// POR QUÉ:
// - Sustituir valores decorativos por condiciones meteorológicas consultadas
//   para el territorio que el viajero está evaluando.
//
// CÓMO:
// - Asocia los 17 territorios con coordenadas centrales y consulta Open-Meteo.
// - La etiqueta elegida controla la ubicación; sin selección usa Nicaragua.
// - Mantiene estados de carga y una salida defensiva ante fallos de conexión.
//
// QUÉ:
// - Condición actual, temperatura, humedad, viento, lluvia y tres días de previsión.
// ============================================================================
(function initRouteWeather() {
  'use strict';
  const TERRITORIES = {
    nicaragua:[12.8654,-85.2072], managua:[12.1364,-86.2514], granada:[11.9344,-85.9560], masaya:[11.9707,-86.0940],
    leon:[12.4379,-86.8780], chinandega:[12.6294,-87.1311], carazo:[11.7275,-86.2158], rivas:[11.4372,-85.8263],
    boaco:[12.4722,-85.6586], chontales:[12.1063,-85.3645], matagalpa:[12.9256,-85.9172], jinotega:[13.0910,-86.0006],
    esteli:[13.0919,-86.3538], madriz:[13.4726,-86.5821], 'nueva-segovia':[13.6321,-86.4752], 'rio-san-juan':[11.3027,-84.4328],
    raccn:[14.0351,-83.3888], racccn:[14.0351,-83.3888], raccs:[12.0131,-83.7635], racccs:[12.0131,-83.7635]
  };
  const ALIASES = {'isletas-de-granada':'granada','volcan-masaya':'masaya','caribe-norte':'raccn','caribe-sur':'raccs'};
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const weatherText = code => code === 0 ? 'Despejado' : [1,2].includes(code) ? 'Parcialmente nublado' : code === 3 ? 'Nublado' : [45,48].includes(code) ? 'Neblina' : [51,53,55].includes(code) ? 'Llovizna' : [61,63,65,80,81,82].includes(code) ? 'Lluvia' : [95,96,99].includes(code) ? 'Tormentas' : 'Condición variable';
  const weatherIcon = code => code === 0 ? 'fa-sun' : [1,2].includes(code) ? 'fa-cloud-sun' : code === 3 ? 'fa-cloud' : [45,48].includes(code) ? 'fa-smog' : [95,96,99].includes(code) ? 'fa-cloud-bolt' : 'fa-cloud-rain';
  const dayLabel = date => new Intl.DateTimeFormat('es-NI',{weekday:'short'}).format(new Date(date + 'T12:00:00')).replace('.','');
  let requestId = 0;

  function resolveTerritory(label) {
    const raw = normalize(label);
    const key = ALIASES[raw] || raw;
    if (TERRITORIES[key]) return {key,label:label || 'Nicaragua',coords:TERRITORIES[key]};
    const partial = Object.keys(TERRITORIES).find(item => key.includes(item) || item.includes(key));
    return partial ? {key:partial,label,coords:TERRITORIES[partial]} : null;
  }
  function setLoading(place) {
    document.getElementById('iaWeatherLocation').textContent = place;
    document.getElementById('iaWeatherTemperature').textContent = 'Consultando…';
    document.getElementById('iaWeatherCondition').textContent = 'Obteniendo datos meteorológicos reales';
    document.getElementById('iaWeatherIcon').className = 'fa-solid fa-spinner fa-spin ia-weather-main-icon';
  }
  function renderWeather(place,data) {
    const current=data.current, daily=data.daily;
    document.getElementById('iaWeatherIcon').className=`fa-solid ${weatherIcon(current.weather_code)} ia-weather-main-icon`;
    document.getElementById('iaWeatherLocation').textContent=place;
    document.getElementById('iaWeatherTemperature').textContent=`${Math.round(current.temperature_2m)}°C`;
    document.getElementById('iaWeatherCondition').textContent=`${weatherText(current.weather_code)} · Sensación ${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('iaWeatherHumidity').textContent=`${current.relative_humidity_2m}%`;
    document.getElementById('iaWeatherWind').textContent=`${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('iaWeatherRain').textContent=`${daily.precipitation_probability_max[0] ?? 0}%`;
    document.getElementById('iaWeatherForecast').innerHTML=daily.time.slice(0,3).map((date,index)=>`<span class="ia-weather-day"><small>${dayLabel(date)}</small><i class="fa-solid ${weatherIcon(daily.weather_code[index])}"></i><strong>${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°</strong></span>`).join('');
    document.getElementById('iaWeatherUpdated').textContent=`Actualizado ${new Intl.DateTimeFormat('es-NI',{hour:'2-digit',minute:'2-digit'}).format(new Date())}`;
  }
  async function loadWeather(territory) {
    const currentRequest=++requestId; setLoading(territory.label);
    const [latitude,longitude]=territory.coords;
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FManagua&forecast_days=3`;
    try { const response=await fetch(url); if(!response.ok) throw new Error('weather-response'); const data=await response.json(); if(currentRequest===requestId) renderWeather(territory.label,data); }
    catch (_) { if(currentRequest!==requestId) return; document.getElementById('iaWeatherTemperature').textContent='No disponible'; document.getElementById('iaWeatherCondition').textContent='No se pudo actualizar. Intentaremos nuevamente.'; document.getElementById('iaWeatherUpdated').textContent='Conexión pendiente'; }
  }
  function selectTag(tag) {
    document.querySelectorAll('#iaDestTags .ia-tag').forEach(item=>item.classList.remove('is-weather-active'));
    const territory=tag ? resolveTerritory(tag.textContent) : null;
    if(tag && territory) { tag.classList.add('is-weather-active'); loadWeather(territory); }
    else loadWeather({label:'Nicaragua',coords:TERRITORIES.nicaragua});
  }
  function wireTags() {
    const cloud=document.getElementById('iaDestTags'); if(!cloud) return;
    cloud.querySelectorAll('.ia-tag').forEach(tag=>{ tag.setAttribute('role','button'); tag.setAttribute('tabindex','0'); tag.title='Consultar clima de este territorio'; });
    cloud.addEventListener('click',event=>{ if(event.target.closest('.fa-xmark')) { setTimeout(()=>selectTag(cloud.querySelector('.ia-tag')),0); return; } const tag=event.target.closest('.ia-tag'); if(tag) selectTag(tag); });
    cloud.addEventListener('keydown',event=>{ if((event.key==='Enter'||event.key===' ')&&event.target.matches('.ia-tag')) { event.preventDefault(); selectTag(event.target); } });
    const initial=Array.from(cloud.querySelectorAll('.ia-tag')).find(tag=>resolveTerritory(tag.textContent)?.key!=='managua')||cloud.querySelector('.ia-tag'); selectTag(initial);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',wireTags):wireTags();
})();
