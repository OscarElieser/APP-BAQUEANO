# 🧭 BAQUEANO — EXPERIENCE PERFORMANCE BUDGET & OPTIMIZATION

## 🎯 1. POR QUÉ (WHY)
Garantizar tiempos de carga ultrarrápidos y experiencia fluida a 60fps incluso en zonas rurales de Nicaragua con conectividad móvil limitada (3G / EDGE).

## ⚙️ 2. CÓMO (HOW)
- **Presupuesto de Rendimiento por Vista**:
  - *Home & Landing*: < 1.2s LCP, bundle JS inicial < 80kB.
  - *Trip Hub (`/viaje/[tripId]`)*: < 1.5s LCP, datos de paradas pre-cacheados.
  - *Kiosco & Smart Point Landing*: < 800ms LCP, renderizado mínimo de baja latencia.
  - *Baqueano AI / Chat*: Carga diferida (lazy load) activada solo bajo demanda del usuario.
- **Modo de Bajo Ancho de Banda (Low Bandwidth Profile)**:
  - Reducción automática de tamaño de imágenes (`cacheWidth`/`cacheHeight`).
  - Desactivación de animaciones pesadas y aplazamiento de mosaicos de mapas vectoriales.

## 📦 3. QUÉ (WHAT)
- Soporte para media queries `prefers-reduced-motion` y prevención activa de fugas de memoria en componentes reciclables.
