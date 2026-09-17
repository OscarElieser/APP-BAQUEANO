# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — ARQUITECTURA GEOESPACIAL Y GIS (SPATIAL PLATFORM)
# ============================================================================

## 1. Visión y Topología del Sistema

```text
                             BAQUEANO
                                │
                       SPATIAL PLATFORM
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
   GEO DATA                  ROUTING                GEOANALYTICS
       │                        │                        │
       ├── Countries            ├── Driving             ├── Coverage
       ├── Territories          ├── Walking             ├── Density
       ├── Municipalities       ├── Cycling             ├── Accessibility
       ├── Places               ├── Multimodal          ├── Corridors
       ├── Businesses           └── Isochrones          ├── Service gaps
       └── Smart Points                                  └── Pressure
                                │
                                ▼
                           GIS SERVICES
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
               WEB          BAQUEANO AI    CONTROL TOWER
                                │
                                ▼
                        PREDICTIVE ENGINE
                                │
                                ▼
                       SIMULATION ENGINE
```

---

## 2. Principios Arquitectónicos Fundamentales

1. **Estándar de Referencia Espacial Único (CRS)**:
   - Todo dato geoespacial se almacena y procesa en **WGS84 (EPSG:4326)**.
   - Todo intercambio de datos estructurados utiliza el estándar **GeoJSON (RFC 7946)**.

2. **Separación Estricta entre Mapa y GIS**:
   - **Mapa**: Renderizado visual y navegación en el cliente (Google Maps / MapLibre).
   - **GIS**: Motor de cómputo que resuelve topología, matrices de distancia vial, envolventes de isócronas y accesibilidad territorial.

3. **Invocación Determinista para Inteligencia Artificial**:
   - Baqueano AI y los Agentes de Concierge invocan herramientas del registro `spatial-tools.service.ts`.
   - Prohibido solicitar al LLM que realice trigonometría esférica o cálculos de rutas en lenguaje natural.

4. **Resiliencia ante Fallos de Proveedores de Mapas**:
   - Si el proveedor de mapas externo se degrada o interrumpe, el sistema activa el **Modo Resiliente**:
     - Las direcciones textuales, teléfonos y referencias departamentales continúan operando.
     - Las listas de resultados y filtros territoriales siguen activos sin bloquear la UI.

---

## 3. Límites Territoriales de Nicaragua

- **Latitud Mínima**: `10.5000° N`
- **Latitud Máxima**: `15.1000° N`
- **Longitud Mínima**: `-87.8000° W`
- **Longitud Máxima**: `-82.5000° W`
