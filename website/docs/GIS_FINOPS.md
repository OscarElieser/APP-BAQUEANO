# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — GESTIÓN FINANCIERA Y FINOPS GIS (GIS FINOPS)
# ============================================================================

## 1. Estrategia de Control de Costos en Servicios de Mapas

El consumo de APIs de mapas y enrutamiento (Google Maps Platform, Mapbox, etc.) puede escalar rápidamente si no se aplican patrones defensivos:

### Medidas de Optimización Implementadas:
1. **Debounce en Eventos de Pan/Zoom**:
   - Todo movimiento del mapa en el cliente aplica un debounce de **400ms** antes de re-consultar el viewport.
2. **Cálculo Local Determinista (Edge Geodesics)**:
   - Las distancias ortodrómicas y aproximaciones iniciales de rutas se resuelven en memoria mediante la fórmula de Haversine (`spatial-engine.service.ts`) a costo $0.
3. **Caché de Enrutamiento e Isócronas**:
   - Las matrices de rutas estables entre destinos clave se almacenan en caché local y servidor respetando estrictamente los términos de servicio del proveedor.
4. **Carga Perezosa (Lazy Loading)**:
   - El SDK de mapas solo se instancia cuando el usuario interactúa visualmente con la pestaña de mapa o el componente correspondiente.

---

## 2. Presupuestos y Umbrales de Alerta Mensual

| Servicio | Presupuesto Mensual Estimado | Umbral de Alerta (80%) | Mecanismo de Mitigación |
| :--- | :--- | :--- | :--- |
| **Maps JavaScript API** | $50.00 USD | $40.00 USD | Aumento de límites de clustering estático |
| **Routes / Directions API** | $35.00 USD | $28.00 USD | Priorizar matriz interna con factor de sinuosidad |
| **Geocoding API** | $25.00 USD | $20.00 USD | Validación previa por catálogo departamental |
