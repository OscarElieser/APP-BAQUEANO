# DICCIONARIO DE DATOS ABIERTOS (OPEN DATA DICTIONARY)

## 1. Esquema del Dataset: Destinos (`OpenDataPlaceDTO`)

| Campo | Tipo | Requerido | Descripción | Ejemplo |
| :--- | :---: | :---: | :--- | :--- |
| `id` | `string` | Sí | Identificador canónico del destino | `"dest-cerro-negro"` |
| `name` | `string` | Sí | Nombre oficial del atractivo turístico | `"Volcán Cerro Negro"` |
| `category` | `string` | Sí | Categoría turística principal | `"Volcanes"` |
| `countryCode` | `string` | Sí | Código de país ISO 3166-1 alfa-2 | `"NI"` |
| `department` | `string` | Sí | Departamento o Región Autónoma | `"León"` |
| `municipality` | `string` | Sí | Municipio o término territorial | `"Nagarote"` |
| `description` | `string` | Sí | Reseña editorial y características | `"El volcán más joven de Centroamérica..."` |
| `coordinates.latitude` | `number` | Sí | Latitud geográfica decimal (WGS84) | `12.5069` |
| `coordinates.longitude`| `number` | Sí | Longitud geográfica decimal (WGS84) | `-86.7028` |
| `verified` | `boolean` | Sí | Indicador de inspección en terreno | `true` |
| `rating` | `number` | No | Puntuación promedio de exploradores (1-5) | `4.9` |
| `attribution` | `string` | Sí | Crédito comunitario de la fuente | `"Baqueano Nicaragua & Comunidades Locales"` |
| `license` | `string` | Sí | Licencia de uso | `"CC-BY-4.0"` |

---

## 2. Esquema del Dataset: Smart Points (`OpenDataSmartPointDTO`)

| Campo | Tipo | Requerido | Descripción | Ejemplo |
| :--- | :---: | :---: | :--- | :--- |
| `id` | `string` | Sí | Identificador único del punto | `"sp-001"` |
| `code` | `string` | Sí | Código alfanumérico visible en la placa QR | `"BQ-NI-LEON-0001"` |
| `name` | `string` | Sí | Nombre de la estación o mirador | `"Mirador de Cráter & Sendero Sur"` |
| `type` | `string` | Sí | Tipología de punto territorial | `"viewpoint"` |
| `territory` | `string` | Sí | Departamento o reserva de ubicación | `"León"` |
| `currentAforoStatus` | `string` | Sí | Semáforo de aforo público agregado | `"moderate"` |
| `facilities` | `string[]` | Sí | Lista de servicios disponibles en el punto | `["Estación de agua", "Primeros auxilios"]` |
