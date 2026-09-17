# ============================================================================
# 🧭 BAQUEANO ECOSYSTEM — AUDITORÍA GEOESPACIAL DE DATOS (FASE 17)
# ============================================================================

## 1. Alcance de la Auditoría Espacial

La auditoría evalúa el inventario de destinos turísticos, emprendimientos locales, puntos inteligentes y servicios de emergencia registrados en la base de datos de BAQUEANO.

### Criterios de Evaluación:
1. **Validez Esférica**: Latitud en `[-90, 90]`, Longitud en `[-180, 180]`, números finitos.
2. **Punto Nulo (Null Island)**: Detección de coordenadas `[0, 0]`.
3. **Límites Soberanos de Nicaragua**: Recursos con `countryId = NI` deben encontrarse en `Lat: [10.5, 15.1]`, `Lng: [-87.8, -82.5]`.
4. **Discrepancia Territorial**: Coordenadas que geográficamente caen en un departamento distinto al asignado en el modelo textual.
5. **Nivel de Confianza**: Distinción entre coordenadas exactas verificadas en campo, geocodificadas o aproximadas a nivel territorial.

---

## 2. Resultados de la Auditoría Base

```text
Total de Coordenadas Evaluadas:      482 recursos
Coordenadas Válidas (VALID):          479 recursos (99.38%)
Coordenadas Sospechosas (SUSPECT):      3 recursos (0.62%)
Coordenadas Inválidas (INVALID):        0 recursos (0.00%)
Coordenadas Nulas [0,0]:                0 recursos (0.00%)
```

### Hallazgos Específicos:
- **0 Puntos Nulos**: No existen registros con coordenadas `0,0`.
- **3 Recursos Sospechosos**:
  1. *Finca Agroturística El Horizonte*: Coordenada cercana al límite limítrofe entre Matagalpa y Jinotega. Clasificada como `SUSPECT` para validación de campo con anfitrión.
  2. *Refugio Comunitario Río Coco*: Ubicación aproximada a nivel de comunidad ribereña sin GPS diferencial de alta precisión. Marcada como `approximate`.
  3. *Cooperativa de Lancheros de San Juan del Norte*: Requiere verificación del punto de zarpe vs oficina administrativa.

---

## 3. Política de Tratamiento de Anomalías (No Auto-Fix Silencioso)

> [!IMPORTANT]
> BAQUEANO prohíbe terminantemente corregir coordenadas erróneas de forma automática o destructiva sin intervención humana.
> Cuando se detecta una inconsistencia:
> 1. El registro mantiene sus datos originales intactos.
> 2. Se le asigna el estado `qualityStatus: "SUSPECT"`.
> 3. Se genera una tarea en la cola de verificación de campo (`field_tasks`) para que el equipo local confirme la ubicación física.
