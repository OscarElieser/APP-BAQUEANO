const fs = require('fs');
const path = require('path');

const perfilPath = path.join(__dirname, '..', 'perfil.html');
let content = fs.readFileSync(perfilPath, 'utf8');

const bannerHtml = `
  <!-- ESTADO DE SESIÓN DINÁMICO / MODO DEMOSTRACIÓN (AUDITORÍA PRODUCCIÓN) -->
  <div id="profAuthNoticeBanner" class="prof-auth-banner" style="display:none; max-width: 1200px; margin: -1.5rem auto 1.5rem; padding: 0 1rem;">
    <div style="background: linear-gradient(135deg, rgba(22, 93, 111, 0.95), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(244, 230, 193, 0.3); border-radius: 16px; padding: 1.25rem 1.5rem; color: #F8FAFC; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; box-shadow: 0 8px 30px rgba(0,0,0,0.25);">
      <div style="display: flex; align-items: center; gap: 1rem; max-width: 720px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(246, 94, 1, 0.2); border: 1px solid #F65E01; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #F65E01; flex-shrink: 0;">
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <div>
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #F4E6C1; font-weight: 700; margin-bottom: 2px;">
            Modo Demostración · Sesión no iniciada
          </div>
          <p style="margin: 0; font-size: 0.88rem; color: #E2E8F0; line-height: 1.4;">
            Estás visualizando el perfil en modo de demostración. Inicia sesión con tu cuenta de Google o correo institucional para sincronizar tus viajes, reservas y destinos guardados en la nube.
          </p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <button type="button" id="btnPerfilLoginGoogle" style="background: #F65E01; color: #FFFFFF; border: none; border-radius: 10px; padding: 0.6rem 1.2rem; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: transform 0.2s ease;">
          <i class="fa-brands fa-google"></i> Iniciar sesión con Google
        </button>
        <button type="button" id="btnPerfilDemoToggle" style="background: rgba(255,255,255,0.1); color: #F4E6C1; border: 1px solid rgba(244,230,193,0.3); border-radius: 10px; padding: 0.6rem 1rem; font-weight: 600; font-size: 0.82rem; cursor: pointer;">
          Cargar demo
        </button>
      </div>
    </div>
  </div>
`;

if (!content.includes('id="profAuthNoticeBanner"')) {
  content = content.replace(
    /<!-- TARJETA PRINCIPAL DEL USUARIO \(PROFILE CARD\) -->/,
    bannerHtml + '\n  <!-- TARJETA PRINCIPAL DEL USUARIO (PROFILE CARD) -->'
  );
}

const profileScript = `
  <script>
    // Sincronización dinámica de perfil y autenticación (BaqueanoSession)
    document.addEventListener('DOMContentLoaded', function() {
      function hydrateProfile() {
        const session = window.BaqueanoSession ? window.BaqueanoSession.getUser() : null;
        const banner = document.getElementById('profAuthNoticeBanner');
        const loginGoogleBtn = document.getElementById('btnPerfilLoginGoogle');
        const demoToggleBtn = document.getElementById('btnPerfilDemoToggle');

        if (!session || !session.isLoggedIn) {
          if (banner) banner.style.display = 'block';
        } else {
          if (banner) {
            banner.style.display = 'block';
            banner.innerHTML = \`
              <div style="background: linear-gradient(135deg, rgba(22, 93, 111, 0.95), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(244, 230, 193, 0.3); border-radius: 16px; padding: 0.9rem 1.5rem; color: #F8FAFC; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; width: 100%;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22C55E;"></span>
                  <span style="font-size: 0.85rem; color: #F8FAFC;">Sesión activa: <strong>\${session.name || session.email}</strong> (\${session.roleLabel || 'Explorador'})</span>
                </div>
                <button type="button" id="btnPerfilLogout" style="background: rgba(239,68,68,0.2); color: #FCA5A5; border: 1px solid #EF4444; border-radius: 8px; padding: 0.4rem 0.9rem; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión
                </button>
              </div>
            \`;
            document.getElementById('btnPerfilLogout')?.addEventListener('click', async function() {
              if (window.BaqueanoSession) {
                await window.BaqueanoSession.logout();
                window.location.reload();
              }
            });
          }

          // Hydrate user profile card
          const userNameEl = document.querySelector('.prof-user-info h3');
          if (userNameEl && session.name) {
            userNameEl.innerHTML = \`\${session.name} <span class="prof-user-badge">\${session.roleLabel || 'Explorador BAQUEANO'}</span>\`;
          }
        }

        loginGoogleBtn?.addEventListener('click', async function() {
          if (window.BaqueanoSession && window.BaqueanoSession.loginWithGoogle) {
            try {
              await window.BaqueanoSession.loginWithGoogle();
              window.location.reload();
            } catch (err) {
              alert('Aviso de autenticación: ' + (err.message || 'No se pudo completar el acceso con Google.'));
            }
          }
        });

        demoToggleBtn?.addEventListener('click', function() {
          if (window.BaqueanoSession && window.BaqueanoSession.loginAsExplorer) {
            window.BaqueanoSession.loginAsExplorer('Oscar Elieser', 'oscarelieser.informatica.inatec@gmail.com');
            window.location.reload();
          }
        });

        // Hydrate favorites count from localStorage
        const favsCount = window.BaqueanoSession ? window.BaqueanoSession.getFavorites().length : 0;
        const favsStatEl = document.querySelector('.prof-stat-item .fa-heart')?.closest('.prof-stat-item')?.querySelector('.prof-stat-val');
        if (favsStatEl) {
          favsStatEl.textContent = favsCount > 0 ? favsCount : 12;
        }
      }

      setTimeout(hydrateProfile, 200);
      window.addEventListener('baqueano_session_updated', hydrateProfile);
    });
  </script>
`;

if (!content.includes('hydrateProfile()')) {
  content = content.replace('</body>', profileScript + '\n</body>');
}

fs.writeFileSync(perfilPath, content, 'utf8');
console.log('✅ perfil.html updated with dynamic authentication state and demo banner.');
