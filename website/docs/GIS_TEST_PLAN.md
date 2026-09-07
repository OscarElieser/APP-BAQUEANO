# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — PLAN DE PRUEBAS GIS Y GEOESPACIALES
# ============================================================================

## 1. Casos de Prueba Unitarios e Integración

1. **Test de Validación de Coordenadas**:
   - Puntos válidos en Managua, León, Matagalpa y Bluefields pasan con `qualityStatus: "VALID"`.
   - Punto `0,0` falla con `qualityStatus: "INVALID"`.
   - Coordenadas en San José (Costa Rica) o Tegucigalpa (Honduras) con `countryId = "NI"` fallan con `qualityStatus: "SUSPECT"`.

2. **Test de Haversine vs Carretera**:
   - Verifica que la distancia por carretera sea siempre mayor que la distancia en línea recta (`roadDistanceKm >= straightLineDistanceKm`).

3. **Test de Isócronas**:
   - Verifica que el polígono generado tenga un anillo exterior cerrado (primer punto igual al último) y contenga la caja delimitadora correcta.

4. **Test de Brechas de Servicios**:
   - Comprueba que destinos aislados a más de 25 km de un centro de salud o bomberos generen la alerta de severidad adecuada.

5. **Test de Resiliencia ante Caída de Mapas**:
   - Verifica que la interfaz degrade a listas estructuradas sin romper la experiencia del usuario.
