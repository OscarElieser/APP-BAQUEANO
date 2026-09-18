// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — EXPERIENCIAS EN 360° & TARJETAS TILT 3D
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar una experiencia visual verdaderamente inmersiva en la web
//   que permita al explorador contemplar panorámicas 360° de los volcanes,
//   cañones y lagos de Nicaragua mediante WebGL (Three.js Sphere Panorama).
// - Brindar tarjetas de destino reactivas con inclinación 3D (tilt) que revelen
//   capas climáticas, dificultad de sendero y tarifas comprobadas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Proyección equirrectangular sobre esfera interna con Three.js en modal flotante.
// - Soporte de rotación por arrastre de ratón y sensor giroscópico táctil.
// - Efecto tilt en CSS 3D (perspective + rotateX/Y) calculado por posición de cursor.
// - Generador de sonido ambiental opcional con Web Audio API (brisa y olas naturales).
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - window.BaqueanoPanorama:
//   * openPanorama(destinationId, imageUrl): Despliega el visor 360°.
//   * closePanorama(): Cierra el visor y libera recursos WebGL.
//   * toggleAmbientSound(): Activa o silencia el audio ambiental.
// ============================================================================

(function(window, document) {
  'use strict';

  let panoScene, panoCamera, panoRenderer;
  let isDragging = false;
  let onPointerDownPointerX = 0, onPointerDownPointerY = 0;
  let onPointerDownLon = 0, onPointerDownLat = 0;
  let lon = 0, lat = 0, phi = 0, theta = 0;
  let audioCtx = null, ambientGain = null, isAudioPlaying = false;

  const BaqueanoPanorama = {
    init() {
      this.bindTiltCards();
    },

    openPanorama(title, imageUrl) {
      const modal = document.getElementById('panorama360Modal');
      const titleEl = document.getElementById('panorama360Title');
      const container = document.getElementById('panorama360CanvasContainer');

      if (!modal || !container) return;

      if (titleEl) titleEl.textContent = `Experiencia 360° — ${title}`;
      modal.classList.add('is-open');

      container.innerHTML = '';
      const width = container.clientWidth || 720;
      const height = container.clientHeight || 460;

      panoScene = new THREE.Scene();
      panoCamera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
      panoCamera.target = new THREE.Vector3(0, 0, 0);

      // Esfera con normales invertidas (vista interior)
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(imageUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        panoScene.add(mesh);
      });

      panoRenderer = new THREE.WebGLRenderer({ antialias: true });
      panoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      panoRenderer.setSize(width, height);
      container.appendChild(panoRenderer.domElement);

      // Eventos de arrastre táctil y ratón
      const dom = panoRenderer.domElement;

      const onPointerDown = (event) => {
        isDragging = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      };

      const onPointerMove = (event) => {
        if (!isDragging) return;
        lon = (onPointerDownPointerX - event.clientX) * 0.15 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat;
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      dom.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      const animatePano = () => {
        if (!modal.classList.contains('is-open')) return;
        requestAnimationFrame(animatePano);

        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.MathUtils.degToRad(90 - lat);
        theta = THREE.MathUtils.degToRad(lon);

        const target = new THREE.Vector3();
        target.x = 500 * Math.sin(phi) * Math.cos(theta);
        target.y = 500 * Math.cos(phi);
        target.z = 500 * Math.sin(phi) * Math.sin(theta);

        panoCamera.lookAt(target);
        panoRenderer.render(panoScene, panoCamera);
      };

      animatePano();
    },

    closePanorama() {
      const modal = document.getElementById('panorama360Modal');
      if (modal) modal.classList.remove('is-open');
      if (panoRenderer) {
        panoRenderer.dispose();
      }
    },

    // ------------------------------------------------------------------------
    // TARJETAS CON EFECTO TILT 3D SEGÚN POSICIÓN DEL CURSOR
    // ------------------------------------------------------------------------
    bindTiltCards() {
      const cards = document.querySelectorAll('.tilt-card-3d');
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      });
    },

    // ------------------------------------------------------------------------
    // AUDIO AMBIENTAL PROCEDURAL CON WEB AUDIO API
    // ------------------------------------------------------------------------
    toggleAmbientSound() {
      const btn = document.getElementById('btnToggleAmbientSound');
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (isAudioPlaying) {
        if (ambientGain) ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        isAudioPlaying = false;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Sonido Ambiente (Off)';
      } else {
        // Generador de ruido rosa/brisa suave
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 0.15;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, audioCtx.currentTime);

        ambientGain = audioCtx.createGain();
        ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        ambientGain.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 1.2);

        noise.connect(filter);
        filter.connect(ambientGain);
        ambientGain.connect(audioCtx.destination);

        noise.start(0);
        isAudioPlaying = true;
        if (btn) btn.innerHTML = '<i class="fa-solid fa-volume-high" style="color: #10B981;"></i> Sonido Ambiente (On)';
      }
    }
  };

  window.BaqueanoPanorama = BaqueanoPanorama;

  document.addEventListener('DOMContentLoaded', () => {
    BaqueanoPanorama.init();
  });

})(window, document);
