// ============================================================================
// 🧭 BAQUEANO — Script de Enriquecimiento del Formulario de Registro de Negocios
// ============================================================================
// 🎯 POR QUÉ: El formulario actual tenía 16 campos básicos insuficientes para
//   construir un catálogo territorial completo y verificable de aliados.
// ⚙️ CÓMO: Se reemplaza el bloque del formulario (entre los markers conocidos)
//   por una versión de 26 campos en 6 secciones temáticas.
// 📦 QUÉ: Nuevos campos: GPS, redes sociales, video URL, video archivo, fotos
//   múltiples (5), precios duales C$/USD, capacidad, idiomas, 12 checkboxes de
//   servicios, descripción larga, sello diferenciador, impacto comunitario,
//   certificaciones (INTUR, DGI, Ecoturismo, Orgánico, CANATUR, Alcaldía).
// ============================================================================

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'mi-negocio.html');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '          <!-- Formulario de Registro -->';
const endMarker = '          </form>\r\n        </div> <!-- /bizFormCollapse -->';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('❌ No se encontraron los marcadores del formulario. startIdx=', startIdx, 'endIdx=', endIdx);
  process.exit(1);
}

const newForm = `          <!-- Formulario de Registro — Versión Enriquecida 26 campos -->
          <form id="registerBusinessForm" class="biz-form" novalidate>

            <!-- ── SECCIÓN 1: IDENTIDAD DEL NEGOCIO ────────────────────────── -->
            <div style="background:rgba(22,93,111,0.15);border-left:3px solid #165D6F;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-store"></i> 1. Identidad del Negocio</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group">
                <label for="bizName" class="biz-label"><i class="fa-solid fa-store"></i> Nombre del Negocio / Emprendimiento <span class="req">*</span></label>
                <input type="text" id="bizName" name="bizName" class="biz-input" placeholder="Ej: Comedor Doña María / Eco-Lodge Las Brisas" required>
                <span class="biz-error-msg" id="err-bizName"></span>
              </div>

              <div class="biz-field-group">
                <label for="bizType" class="biz-label"><i class="fa-solid fa-tags"></i> Tipo de Negocio <span class="req">*</span></label>
                <select id="bizType" name="bizType" class="biz-select" required>
                  <option value="">Selecciona el tipo...</option>
                  <option value="Comedor Tradicional / Restaurante Campesino">Comedor Tradicional / Restaurante Campesino</option>
                  <option value="Hotel / Eco-Lodge">Hotel / Eco-Lodge</option>
                  <option value="Hostal Comunitario">Hostal Comunitario</option>
                  <option value="Hospedaje Rural Familiar">Hospedaje Rural Familiar</option>
                  <option value="Casa de Alquiler Vacacional">Casa de Alquiler Vacacional</option>
                  <option value="Guía Baqueano Comunitario">Guía Baqueano Comunitario</option>
                  <option value="Cooperativa Agroecológica">Cooperativa Agroecológica</option>
                  <option value="Taller de Artesanías / Recuerdos">Taller de Artesanías / Recuerdos</option>
                  <option value="Bar / Sunset Lounge Frente al Mar">Bar / Sunset Lounge Frente al Mar</option>
                  <option value="Museo / Patrimonio Histórico">Museo / Patrimonio Histórico</option>
                  <option value="Transporte Turístico / Bote">Transporte Turístico / Bote</option>
                  <option value="Tour Operadora Comunitaria">Tour Operadora Comunitaria</option>
                  <option value="Centro de Bienestar / Spa Rural">Centro de Bienestar / Spa Rural</option>
                  <option value="Cafetería / Coffee Shop">Cafetería / Coffee Shop</option>
                  <option value="Otro">Otro Emprendimiento Local</option>
                </select>
                <span class="biz-error-msg" id="err-bizType"></span>
              </div>

              <div class="biz-field-group">
                <label for="bizOwner" class="biz-label"><i class="fa-solid fa-user-tie"></i> Propietario o Responsable Directo <span class="req">*</span></label>
                <input type="text" id="bizOwner" name="bizOwner" class="biz-input" placeholder="Ej: María Hernández Gómez" required>
                <span class="biz-error-msg" id="err-bizOwner"></span>
              </div>

              <div class="biz-field-group">
                <label for="bizCategory" class="biz-label"><i class="fa-solid fa-layer-group"></i> Categoría en Catálogo Baqueano <span class="req">*</span></label>
                <select id="bizCategory" name="bizCategory" class="biz-select" required>
                  <option value="">Selecciona una categoría...</option>
                  <option value="gastronomia">Gastronomía Ancestral (Comedores, Baho, Quesillos)</option>
                  <option value="hoteles">Hoteles &amp; Eco-Lodges</option>
                  <option value="hostales">Hostales de Aventura &amp; Mochileros</option>
                  <option value="hospedajes">Hospedajes Rurales &amp; Cabañas</option>
                  <option value="casas-alquiler">Casas de Alquiler &amp; Villas</option>
                  <option value="museos">Museos, Cultura &amp; Talleres</option>
                  <option value="discotecas">Vida Nocturna &amp; Clubes de Playa</option>
                  <option value="rios">Ríos, Cascadas &amp; Cañones</option>
                  <option value="volcanes">Volcanes &amp; Sandboarding</option>
                  <option value="playas">Playas &amp; Surf del Pacífico</option>
                  <option value="tours">Tours &amp; Experiencias Guiadas</option>
                  <option value="artesanias">Artesanías &amp; Producción Local</option>
                  <option value="transporte">Transporte Turístico &amp; Traslados</option>
                </select>
                <span class="biz-error-msg" id="err-bizCategory"></span>
              </div>

            </div>

            <!-- ── SECCIÓN 2: UBICACIÓN TERRITORIAL ─────────────────────────── -->
            <div style="background:rgba(22,93,111,0.15);border-left:3px solid #165D6F;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0 1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-map-location-dot"></i> 2. Ubicación Territorial</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group">
                <label for="bizDepartment" class="biz-label"><i class="fa-solid fa-map"></i> Departamento <span class="req">*</span></label>
                <select id="bizDepartment" name="bizDepartment" class="biz-select" required>
                  <option value="">Selecciona tu departamento...</option>
                  <option value="Boaco">Boaco</option><option value="Carazo">Carazo</option>
                  <option value="Chinandega">Chinandega</option><option value="Chontales">Chontales</option>
                  <option value="Costa Caribe Norte (RACCN)">Costa Caribe Norte (RACCN)</option>
                  <option value="Costa Caribe Sur (RACCS)">Costa Caribe Sur (RACCS)</option>
                  <option value="Estelí">Estelí</option><option value="Granada">Granada</option>
                  <option value="Jinotega">Jinotega</option><option value="León">León</option>
                  <option value="Madriz">Madriz</option><option value="Managua">Managua</option>
                  <option value="Masaya">Masaya</option><option value="Matagalpa">Matagalpa</option>
                  <option value="Nueva Segovia">Nueva Segovia</option>
                  <option value="Río San Juan">Río San Juan</option><option value="Rivas">Rivas</option>
                </select>
                <span class="biz-error-msg" id="err-bizDepartment"></span>
              </div>

              <div class="biz-field-group">
                <label for="bizMunicipality" class="biz-label"><i class="fa-solid fa-location-dot"></i> Municipio <span class="req">*</span></label>
                <input type="text" id="bizMunicipality" name="bizMunicipality" class="biz-input" placeholder="Ej: San Juan del Sur, Somoto..." required>
                <span class="biz-error-msg" id="err-bizMunicipality"></span>
              </div>

              <div class="biz-field-group biz-col-full">
                <label for="bizAddress" class="biz-label"><i class="fa-solid fa-compass"></i> Dirección Exacta o Punto de Referencia <span class="req">*</span></label>
                <input type="text" id="bizAddress" name="bizAddress" class="biz-input" placeholder="Ej: Del Parque Central 2 c. al lago, frente a la ermita comunitaria" required>
                <span class="biz-error-msg" id="err-bizAddress"></span>
              </div>

              <div class="biz-field-group biz-col-full">
                <label class="biz-label"><i class="fa-solid fa-satellite-dish"></i> Coordenadas GPS
                  <span style="font-size:0.72rem;color:#94A3B8;font-weight:400;"> — Para integración en mapa oficial BAQUEANO</span>
                </label>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:0.75rem;align-items:end;">
                  <input type="text" id="bizLat" name="bizLat" class="biz-input" placeholder="Latitud  Ej: 12.4937">
                  <input type="text" id="bizLng" name="bizLng" class="biz-input" placeholder="Longitud  Ej: -86.7223">
                  <button type="button" id="btnGetGPS" style="background:#165D6F;color:#F4E6C1;border:none;border-radius:10px;padding:0.75rem 1rem;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;height:48px;"
                    onclick="if(navigator.geolocation){var b=this;b.textContent='Obteniendo...';navigator.geolocation.getCurrentPosition(function(p){document.getElementById('bizLat').value=p.coords.latitude.toFixed(6);document.getElementById('bizLng').value=p.coords.longitude.toFixed(6);b.textContent='✓ GPS capturado';b.style.background='#22C55E';},function(){b.textContent='📍 Mi GPS';});}">
                    📍 Mi GPS
                  </button>
                </div>
              </div>

            </div>

            <!-- ── SECCIÓN 3: CONTACTO Y REDES SOCIALES ──────────────────────── -->
            <div style="background:rgba(246,94,1,0.1);border-left:3px solid #F65E01;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0 1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-address-card"></i> 3. Contacto y Redes Sociales</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group">
                <label for="bizPhone" class="biz-label"><i class="fa-solid fa-phone"></i> Teléfono Principal <span class="req">*</span></label>
                <input type="tel" id="bizPhone" name="bizPhone" class="biz-input" placeholder="+505 8888-0000" required>
                <span class="biz-error-msg" id="err-bizPhone"></span>
              </div>

              <div class="biz-field-group">
                <label for="bizWhatsapp" class="biz-label"><i class="fa-brands fa-whatsapp"></i> WhatsApp para Reservas</label>
                <input type="tel" id="bizWhatsapp" name="bizWhatsapp" class="biz-input" placeholder="+505 8443-0000">
              </div>

              <div class="biz-field-group">
                <label for="bizEmail" class="biz-label"><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
                <input type="email" id="bizEmail" name="bizEmail" class="biz-input" placeholder="contacto@tunegocio.com">
              </div>

              <div class="biz-field-group">
                <label for="bizWebsite" class="biz-label"><i class="fa-solid fa-globe"></i> Sitio Web</label>
                <input type="url" id="bizWebsite" name="bizWebsite" class="biz-input" placeholder="https://www.minegocio.com">
              </div>

              <div class="biz-field-group">
                <label for="bizFacebook" class="biz-label"><i class="fa-brands fa-facebook"></i> Facebook</label>
                <input type="url" id="bizFacebook" name="bizFacebook" class="biz-input" placeholder="https://facebook.com/mi_local_nica">
              </div>

              <div class="biz-field-group">
                <label for="bizInstagram" class="biz-label"><i class="fa-brands fa-instagram"></i> Instagram</label>
                <input type="url" id="bizInstagram" name="bizInstagram" class="biz-input" placeholder="https://instagram.com/mi_local">
              </div>

              <div class="biz-field-group">
                <label for="bizTiktok" class="biz-label"><i class="fa-brands fa-tiktok"></i> TikTok</label>
                <input type="url" id="bizTiktok" name="bizTiktok" class="biz-input" placeholder="https://tiktok.com/@mi_local">
              </div>

              <div class="biz-field-group">
                <label for="bizVideoUrl" class="biz-label"><i class="fa-brands fa-youtube"></i> Video en YouTube / TikTok / Reel</label>
                <input type="url" id="bizVideoUrl" name="bizVideoUrl" class="biz-input" placeholder="https://youtube.com/watch?v=...">
                <span style="font-size:0.71rem;color:#64748B;margin-top:3px;display:block;">📹 Se mostrará como vista previa en tu ficha del catálogo.</span>
              </div>

            </div>

            <!-- ── SECCIÓN 4: OFERTA Y SERVICIOS ────────────────────────────── -->
            <div style="background:rgba(22,93,111,0.15);border-left:3px solid #165D6F;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0 1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-list-check"></i> 4. Oferta Comercial y Servicios</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group">
                <label for="bizPriceNio" class="biz-label"><i class="fa-solid fa-money-bill-wave"></i> Precio Base en Córdobas (C$)</label>
                <input type="number" id="bizPriceNio" name="bizPriceNio" class="biz-input" placeholder="Ej: 350" min="0">
              </div>

              <div class="biz-field-group">
                <label for="bizPriceUsd" class="biz-label"><i class="fa-solid fa-dollar-sign"></i> Precio Base en Dólares (USD)</label>
                <input type="number" id="bizPriceUsd" name="bizPriceUsd" class="biz-input" placeholder="Ej: 10.00" min="0" step="0.50">
              </div>

              <div class="biz-field-group">
                <label for="bizCapacity" class="biz-label"><i class="fa-solid fa-users"></i> Capacidad Máxima</label>
                <input type="number" id="bizCapacity" name="bizCapacity" class="biz-input" placeholder="Ej: 30 comensales / 8 habitaciones" min="1">
              </div>

              <div class="biz-field-group">
                <label for="bizSchedule" class="biz-label"><i class="fa-solid fa-clock"></i> Horario de Atención</label>
                <input type="text" id="bizSchedule" name="bizSchedule" class="biz-input" placeholder="Ej: Lunes a Domingo, 7:00 AM - 9:00 PM">
              </div>

              <div class="biz-field-group biz-col-full">
                <label class="biz-label"><i class="fa-solid fa-language"></i> Idiomas de Atención al Visitante</label>
                <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:6px;">
                  <label style="display:flex;align-items:center;gap:7px;font-size:0.84rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizLanguages" value="Español" checked style="accent-color:#F65E01;"> Español</label>
                  <label style="display:flex;align-items:center;gap:7px;font-size:0.84rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizLanguages" value="English" style="accent-color:#F65E01;"> English</label>
                  <label style="display:flex;align-items:center;gap:7px;font-size:0.84rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizLanguages" value="Français" style="accent-color:#F65E01;"> Français</label>
                  <label style="display:flex;align-items:center;gap:7px;font-size:0.84rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizLanguages" value="Deutsch" style="accent-color:#F65E01;"> Deutsch</label>
                  <label style="display:flex;align-items:center;gap:7px;font-size:0.84rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizLanguages" value="Miskito" style="accent-color:#F65E01;"> Miskito</label>
                </div>
              </div>

              <div class="biz-field-group biz-col-full">
                <label class="biz-label"><i class="fa-solid fa-star"></i> Servicios e Instalaciones Disponibles</label>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem 1rem;margin-top:8px;">
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="WiFi" style="accent-color:#F65E01;"> 📶 WiFi incluido</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Estacionamiento" style="accent-color:#F65E01;"> 🚗 Estacionamiento</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Aire Acondicionado" style="accent-color:#F65E01;"> ❄️ Aire Acondicionado</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Piscina" style="accent-color:#F65E01;"> 🏊 Piscina</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Desayuno Incluido" style="accent-color:#F65E01;"> 🍳 Desayuno incluido</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Traslados" style="accent-color:#F65E01;"> 🚐 Traslados / Shuttle</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Guía Local" style="accent-color:#F65E01;"> 🧭 Guía local incluido</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Tours Kayak" style="accent-color:#F65E01;"> 🛶 Kayak / Tours acuáticos</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Senderismo" style="accent-color:#F65E01;"> 🥾 Senderismo / Trekking</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Acceso Discapacitados" style="accent-color:#F65E01;"> ♿ Acceso para discapacitados</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Pet Friendly" style="accent-color:#F65E01;"> 🐾 Pet Friendly</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizServices" value="Reserva Online" style="accent-color:#F65E01;"> 📅 Reserva en línea</label>
                </div>
              </div>

            </div>

            <!-- ── SECCIÓN 5: DESCRIPCIÓN Y MEDIA ───────────────────────────── -->
            <div style="background:rgba(246,94,1,0.1);border-left:3px solid #F65E01;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0 1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-photo-film"></i> 5. Historia, Descripción y Galería de Fotos</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group biz-col-full">
                <label for="bizDescription" class="biz-label">
                  <i class="fa-solid fa-align-left"></i> Descripción del Servicio o Menú Típico <span class="req">*</span>
                  <span class="biz-char-counter" id="bizCharCounter">0 / 500</span>
                </label>
                <textarea id="bizDescription" name="bizDescription" class="biz-textarea" maxlength="500" rows="4" placeholder="Describe qué ofreces al visitante, especialidad culinaria, tipo de habitaciones, actividades incluidas, historia del lugar, horarios especiales y cualquier detalle que te diferencia..." required></textarea>
                <span class="biz-error-msg" id="err-bizDescription"></span>
              </div>

              <div class="biz-field-group biz-col-full">
                <label for="bizUnique" class="biz-label"><i class="fa-solid fa-wand-magic-sparkles"></i> ¿Qué hace único a tu negocio? — Tu sello diferenciador</label>
                <textarea id="bizUnique" name="bizUnique" class="biz-textarea" maxlength="300" rows="3" placeholder="Ej: Somos la única cooperativa femenina del municipio. Preparamos nacatamal siguiendo receta de 3 generaciones. Nuestro lodge tiene vista directa al volcán..."></textarea>
              </div>

              <div class="biz-field-group biz-col-full">
                <label for="bizImpact" class="biz-label"><i class="fa-solid fa-hand-holding-heart"></i> Impacto en tu Comunidad Local</label>
                <textarea id="bizImpact" name="bizImpact" class="biz-textarea" maxlength="300" rows="3" placeholder="Ej: Empleamos a 8 familias del barrio. El 20% de las ganancias va al fondo escolar. Compramos ingredientes a productores locales del mercado campesino..."></textarea>
              </div>

              <!-- Fotos Múltiples -->
              <div class="biz-field-group biz-col-full">
                <label class="biz-label">
                  <i class="fa-solid fa-images"></i> Fotografías del Negocio
                  <span style="font-size:0.72rem;color:#94A3B8;font-weight:400;"> — Hasta 5 fotos: fachada, interior, platillos, habitaciones, entorno</span>
                </label>
                <div class="biz-file-dropzone" id="bizFileDropzone">
                  <input type="file" id="bizPhoto" name="bizPhoto" accept="image/*" multiple class="biz-file-input"
                    onchange="
                      var files=Array.from(this.files).slice(0,5);
                      var ph=document.getElementById('bizUploadPlaceholder');
                      var prev=document.getElementById('bizPhotoPreview');
                      if(files.length>0){
                        ph.style.display='none';
                        prev.style.display='flex';
                        var img=document.getElementById('bizPreviewImg');
                        var r=new FileReader();
                        r.onload=function(e){img.src=e.target.result;};
                        r.readAsDataURL(files[0]);
                        var lbl=document.getElementById('bizPhotosCount');
                        if(lbl) lbl.textContent=files.length+' foto(s) seleccionada(s)';
                      }
                    ">
                  <div class="biz-upload-placeholder" id="bizUploadPlaceholder">
                    <i class="fa-solid fa-images" style="font-size:2rem;color:#F65E01;margin-bottom:8px;"></i>
                    <span>Tocá o arrastrá hasta 5 fotos (JPG, PNG, WebP · máx 5MB c/u)</span>
                    <span style="font-size:0.7rem;color:#64748B;display:block;margin-top:4px;">Foto de portada, interior, platillo, entorno natural</span>
                  </div>
                  <div class="biz-photo-preview" id="bizPhotoPreview" style="display:none;flex-direction:column;align-items:center;gap:8px;padding:12px;">
                    <img id="bizPreviewImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E" alt="Vista previa" style="max-height:160px;border-radius:8px;object-fit:cover;">
                    <span id="bizPhotosCount" style="font-size:0.8rem;color:#22C55E;font-weight:700;"></span>
                    <button type="button" class="biz-btn-remove-photo" id="bizBtnRemovePhoto" title="Eliminar fotos"
                      onclick="document.getElementById('bizPhoto').value='';document.getElementById('bizPhotoPreview').style.display='none';document.getElementById('bizUploadPlaceholder').style.display='flex';">
                      <i class="fa-solid fa-xmark"></i> Cambiar fotos
                    </button>
                  </div>
                </div>
              </div>

              <!-- Video Propio -->
              <div class="biz-field-group biz-col-full">
                <label class="biz-label">
                  <i class="fa-solid fa-video"></i> Video Propio del Negocio
                  <span style="font-size:0.72rem;color:#94A3B8;font-weight:400;"> — MP4 o MOV · máx 50MB</span>
                </label>
                <div id="bizVideoDropzone" style="border:2px dashed rgba(246,94,1,0.3);border-radius:14px;padding:1.5rem;text-align:center;cursor:pointer;transition:border-color 0.2s;background:rgba(246,94,1,0.04);"
                     onmouseover="this.style.borderColor='#F65E01'" onmouseout="this.style.borderColor='rgba(246,94,1,0.3)'"
                     onclick="document.getElementById('bizVideoFile').click()">
                  <input type="file" id="bizVideoFile" name="bizVideoFile" accept="video/mp4,video/quicktime,video/avi" style="display:none;"
                    onchange="
                      var f=this.files[0];
                      if(f){var l=document.getElementById('bizVideoFileLabel');l.innerHTML='<span style=color:#22C55E;font-weight:700;>✓ Video listo: '+f.name+' ('+Math.round(f.size/1048576)+'MB)</span>';}
                    ">
                  <i class="fa-solid fa-film" style="font-size:2rem;color:#F65E01;margin-bottom:8px;display:block;"></i>
                  <span id="bizVideoFileLabel" style="font-size:0.85rem;color:#94A3B8;">Tocá para subir un video de tu negocio (MP4, MOV · máx 50MB)</span>
                </div>
              </div>

            </div>

            <!-- ── SECCIÓN 6: CERTIFICACIONES Y COMPROMISO ───────────────────── -->
            <div style="background:rgba(22,93,111,0.15);border-left:3px solid #165D6F;border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0 1.25rem;">
              <h4 style="color:#F4E6C1;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.25rem;"><i class="fa-solid fa-certificate"></i> 6. Certificaciones y Compromiso</h4>
            </div>
            <div class="biz-form-grid">

              <div class="biz-field-group biz-col-full">
                <label class="biz-label"><i class="fa-solid fa-certificate"></i> Certificaciones y Reconocimientos</label>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.5rem 1rem;margin-top:8px;">
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="INTUR" style="accent-color:#F65E01;"> 🏛️ Registrado en INTUR</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="DGI" style="accent-color:#F65E01;"> 📋 RUC / DGI activo</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="Ecoturismo" style="accent-color:#F65E01;"> 🌿 Sello de Ecoturismo</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="Organico" style="accent-color:#F65E01;"> 🌱 Producción Orgánica</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="CANATUR" style="accent-color:#F65E01;"> 🤝 Miembro CANATUR</label>
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#E2E8F0;cursor:pointer;"><input type="checkbox" name="bizCerts" value="Alcaldia" style="accent-color:#F65E01;"> 🏢 Matrícula Alcaldía</label>
                </div>
              </div>

              <div class="biz-field-group biz-col-full">
                <label class="biz-checkbox-label">
                  <input type="checkbox" id="bizTerms" name="bizTerms" required>
                  <span class="biz-checkbox-custom"></span>
                  <span class="biz-checkbox-text">
                    Acepto los principios de <strong>turismo ético y trato justo</strong> de Baqueano Nicaragua. Confirmo que los precios y datos son reales y que la atención al visitante se realizará con contacto directo sin intermediarios foráneos. <span class="req">*</span>
                  </span>
                </label>
                <span class="biz-error-msg" id="err-bizTerms"></span>
              </div>

              <div class="biz-field-group biz-col-full biz-submit-wrap">
                <button type="submit" class="biz-btn-submit" id="btnSubmitBiz">
                  <span class="btn-text"><i class="fa-brands fa-whatsapp"></i> Postular Negocio a Mesa Baqueano</span>
                  <i class="fa-solid fa-arrow-right btn-arrow"></i>
                </button>
                <div class="biz-security-note">
                  <i class="fa-solid fa-lock"></i> Tu postulación se procesa en Firestore y se envía al WhatsApp oficial (+505 8443-1289) de la Mesa Técnica. Revisión en 48-72 horas hábiles. Sin costo de inscripción.
                </div>
              </div>

            </div>

          </form>
        </div> <!-- /bizFormCollapse -->`;

const before = content.substring(0, startIdx);
const after = content.substring(endIdx + endMarker.length);

const result = before + newForm + after;
fs.writeFileSync(filePath, result, 'utf8');
console.log('✅ Formulario de registro de negocios actualizado con 26 campos en 6 secciones.');
console.log('   Nuevos campos: GPS, Facebook, Instagram, TikTok, video URL, video archivo,');
console.log('   fotos múltiples, C$/USD, capacidad, idiomas, 12 servicios, sello, impacto, certificaciones.');
