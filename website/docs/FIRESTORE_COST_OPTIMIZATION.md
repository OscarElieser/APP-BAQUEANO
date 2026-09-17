# 🧭 OPTIMIZACIÓN DE COSTOS Y ESCALABILIDAD EN FIRESTORE — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Garantizar que el crecimiento del catálogo nacional de destinos y la expansión de la comunidad de anfitriones locales ocurra de forma financieramente sostenible y con alta eficiencia de lectura/escritura en Google Cloud Firestore, previniendo sobrecostos por consultas no indexadas o descargas completas de colecciones.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & ESTRATEGIA)
- **Paginación con Cursores**: Reemplazo de consultas `limit()` abiertas por paginación determinista basada en cursores (`startAfter(lastDocument)` / `orderBy('updatedAt', 'desc')`).
- **Gobernanza de Índices**: Configuración explícita de índices compuestos únicamente cuando existe un patrón de filtrado multidimensional validado (ej. `departmentId + categoryId + isPublished`).
- **Separación de Vistas Resumidas vs Detalladas**: Evitar transferir arrays de imágenes o campos históricos extensos en listados globales; mantener payloads ligeros (`PlaceSummary`) y reservar documentos completos para la vista de detalle.

---

## 📦 3. QUÉ (WHAT / AUDITORÍA DE COLECCIONES Y ACCIONES TÉCNICAS)

### 1. Colección `places` (Destinos)
- **Volumen Estimado**: 50 a 1,000+ documentos.
- **Estrategia de Lectura**:
  - Lecturas cacheadas en cliente para destinos estáticos y catálogo base.
  - Paginación fija de 24 ítems por página con cursor `startAfter`.
  - Proyección de campos: `id`, `name`, `departmentId`, `categoryId`, `heroImageUrl`, `rating`, `slug`.

### 2. Colección `businesses` (Negocios y Anfitriones Locales)
- **Volumen Estimado**: 100 a 5,000+ documentos.
- **Estrategia de Lectura**:
  - Filtrado estricto por `placeId` o `departmentId` con indexación directa.
  - Validación de estado `status == 'active'` para evitar lecturas de borradores en la web pública.

### 3. Colección `audit_logs` (Trazabilidad Administrativa)
- **Volumen Estimado**: 10,000 a 100,000+ entradas a largo plazo.
- **Estrategia de Almacenamiento & Consulta**:
  - Paginación obligatoria en `@baqueano/admin` (máximo 50 registros por vista).
  - Política de retención: Archivado automático a Cloud Storage (Coldline) tras 180 días de antigüedad.

### 4. Colección `saved_places` (Favoritos de Explorador)
- **Volumen Estimado**: Proporcional al número de usuarios registrados.
- **Estrategia de Lectura**:
  - Almacenamiento en subcolección de usuario `users/{userId}/saved_places/{placeId}` para garantizar aislamiento de seguridad y consultas O(1).

---

## 📊 Matriz de Índices Compuestos Críticos

```json
{
  "indexes": [
    {
      "collectionGroup": "places",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "placeId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "verifiedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```
