# 🧭 BAQUEANO — EXPERIENCE DESIGN SYSTEM

## 🎯 1. POR QUÉ (WHY)
Mantener consistencia estética y funcional en todos los componentes del Experience OS, honrando la identidad visual de Baqueano y garantizando accesibilidad y rendimiento.

## ⚙️ 2. CÓMO (HOW)
- **Paleta Oficial**:
  - Petróleo Teal: `#165D6F`
  - Naranja Terracota Fuego: `#F65E01`
  - Crema Arena Pinolera: `#F4E6C1`
  - Noche Profunda: `#0F172A`
- **Jerarquía Visual y Componentes**:
  - `DestinationCard`: Imagen con proporciones optimizadas, sello de confianza, departamento y botón de guardado.
  - `TripCard`: Fechas del viaje, número de paradas, estado actual (`PLANNING`, `ACTIVE`, `COMPLETED`) y barra de progreso.
  - `TodayViewCard`: Próxima parada, hora estimada, ruta sugerida y previsión meteorológica.
  - `PassportEntry`: Sello ilustrado, fecha de visita verificada, código QR de comprobación y territorio.
  - `NotificationCard`: Alerta con severidad diferenciada (`INFO`, `WARNING`, `CRITICAL`), sin efectos de urgencia engañosa.

## 📦 3. QUÉ (WHAT)
- Cero uso de `.withOpacity()` (estándar Flutter/Web); uso estricto de valores alfa funcionales y clases CSS de utilidad.
- Adaptabilidad total en resoluciones 320px, 390px, 768px, 1024px, 1366px y 1920px.
