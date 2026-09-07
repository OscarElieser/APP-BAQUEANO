# 🧭 SISTEMA DE MOVIMIENTO Y MICROINTERACCIONES — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Proporcionar una experiencia visual fluida, refinada y orgánica que refleje la vitalidad y calidez de Nicaragua. El movimiento en Baqueano guía la atención del explorador, comunica jerarquía espacial y confirma estados de carga de manera intuitiva, sin generar fatiga cognitiva ni sobrecargar los recursos del procesador en dispositivos móviles.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & ACCESIBILIDAD)
- **Curvas de Aceleración**: Estandarización sobre `cubic-bezier(0.16, 1, 0.3, 1)` (Out Expo / EaseOut) para transiciones ágiles y naturales.
- **Soporte de Movimiento Reducido (`prefers-reduced-motion`)**: Toda animación se atenúa o desactiva automáticamente si el usuario tiene activada la preferencia de accesibilidad del sistema operativo.
- **Optimización de Renderizado**: Uso exclusivo de propiedades aceleradas por GPU (`transform`, `opacity`) para sostener 60 FPS estables en navegadores móviles.

---

## 📦 3. QUÉ (WHAT / TOKENS Y PATRONES DE MOVIMIENTO)

### 1. Duraciones Estándar (Duration Tokens)
- `duration-instant`: `100ms` (Feedback táctil, active states de botones).
- `duration-fast`: `200ms` (Hover sobre tarjetas de destinos, tooltips, checkboxes).
- `duration-normal`: `350ms` (Apertura de modales, expansión de filtros, transiciones de vista previa).
- `duration-slow`: `500ms` (Transición de rutas, aparición de secciones Hero en scroll inicial).

### 2. Microinteracciones de Componentes

| Componente | Tipo de Interacción | Efecto Visual | Configuración |
|---|---|---|---|
| **Tarjeta de Destino (`PlaceCard`)** | Hover / Focus | Elevación sutil en Y (`translateY(-4px)`), escala leve en imagen (`1.03`) y sombra cálida. | `transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1)` |
| **Botón de Guardado (`SavePlaceButton`)** | Tap / Click | Animación elástica de escala en icono de corazón (`1.0 → 1.25 → 1.0`). | Spring physics: `stiffness: 400, damping: 17` |
| **Barra de Progreso (`ScrollProgress`)** | Scroll de Página | Expansión horizontal fluida del gradiente Terracota / Teal. | `transform: scaleX(progress)` |
| **Pines del Mapa (`MapMarker`)** | Hover / Selección | Pulsación suave concéntrica y elevación del pin activo. | Keyframe pulse 2s infinito con opacidad variable |
| **Backdrop Glassmorphism** | Entrada de Modal | Difuminado progresivo de fondo (`backdrop-filter: blur(12px)`). | `transition: backdrop-filter 300ms ease-out` |

### 3. Código de Compatibilidad Accesible (CSS Standard)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
