# REFERENCIA DE LA API DE BAQUEANO (OPEN & PARTNER API REFERENCE v1)

## 1. Endpoints Públicos de Datos Abiertos (`/api/open/v1/*`)

### `GET /api/open/v1/places`
Retorna destinos turísticos y atractivos verificados en formato JSON o GeoJSON.
- **Parámetros**:
  - `format` (`string`, opcional): `"json"` (por defecto) o `"geojson"`.
  - `category` (`string`, opcional): Filtra por categoría (ej: `"volcanes"`, `"reservas"`).
  - `department` (`string`, opcional): Filtra por departamento (ej: `"leon"`).
  - `limit` (`number`, opcional): Límite de resultados (1 - 100, default 20).
  - `offset` (`number`, opcional): Desplazamiento para paginación.

### `GET /api/open/v1/territories`
Retorna los 17 departamentos y regiones autónomas de Nicaragua.

### `GET /api/open/v1/smart-points`
Retorna la red de tótems, miradores y accesos a senderos inteligentes con semáforo de aforo público.

### `GET /api/open/v1/datasets`
Retorna el catálogo de metadatos de los datasets abiertos disponibles para descarga.

### `GET /api/open/v1/datasets/{datasetId}/download`
Descarga directa de snapshots en formato `.json` o `.csv`.

---

## 2. Endpoints Autenticados para Aliados (`/api/v1/*`)

### `GET /api/v1/places`
- **Cabecera Requerida**: `x-api-key: bq_live_...`
- **Scope Requerido**: `places.read`
- **Rate Limit**: 120 peticiones / minuto (estándar).
