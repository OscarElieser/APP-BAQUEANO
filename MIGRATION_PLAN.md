# 🧭 BAQUEANO ECOSYSTEM — PLAN MAESTRO DE MIGRACIÓN Y REPLICACIÓN

<!--
============================================================================
🧭 BAQUEANO NICARAGUA — PLAN DE MIGRACIÓN CONTROLADA (MIGRATION_PLAN.md)
============================================================================
🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Definir un proceso estructurado, seguro, auditable y sin tiempo de inactividad
  para la replicación de datos desde Cloud Firestore hacia PostgreSQL en Supabase.
- Impedir migraciones automáticas destructivas que puedan corromper datos de
  producción, sobrescribir tarifas verificadas bajo Ley 306 o invalidar reservas activas.
- Establecer mecanismos rigurosos de validación de esquemas, comprobación de
  integridad y protocolos de reversión (rollback) inmediata.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Principio FIREBASE FIRST, SUPABASE FALLBACK:
  * Cloud Firestore permanece como la única fuente primaria de verdad mientras esté en línea.
  * Supabase actúa como espejo relacional de solo lectura y base de respaldo.
  * La replicación se ejecuta en fases progresivas (Extracción -> Normalización ->
    Transformación de Tipos -> Carga Idempotente -> Validación Cruzada).
  * Manejo estricto de identificadores mediante `firebase_uid` y `document_id`.

📦 3. QUÉ (WHAT / ENTREGABLES & FASES):
- Matriz completa de correspondencia Colección Firestore <-> Tabla PostgreSQL.
- Transformaciones de tipos de datos (GeoPoint a PostGIS, Timestamps a TIMESTAMPTZ, Arrays a JSONB).
- Matriz de riesgos operativos y mitigaciones técnicas.
- Procedimiento de validación y plan de rollback paso a paso.
============================================================================
-->

---

## 🗺️ 1. Matriz de Correspondencia de Colecciones

A continuación se detalla la equivalencia exacta entre las colecciones actuales de Cloud Firestore y el esquema relacional en Supabase PostgreSQL:

| Colección Firestore | Tabla PostgreSQL Supabase | Clave de Enlace | Tipo de Sincronización |
| :--- | :--- | :--- | :--- |
| `users` | `profiles` | `firebase_uid` | Bidireccional protegida |
| `destinations` | `destinations` | `slug` / `id` | Espejo relacional + PostGIS |
| `places` | `places` | `slug` / `id` | Espejo espacial + PostGIS |
| `businesses` | `businesses` | `id` | Espejo relacional |
| `reservations` | `reservations` | `id` | Replicación transaccional con control de versiones |
| `reviews` | `reviews` | `id` | Replicación transaccional |
| `favorites` | `favorites` | `user_id` + `entity_id` | Restricción de unicidad |
| `departments` | `departments` | `id` / `slug` | Catálogo territorial fijo |
| `municipalities` | `municipalities` | `id` / `slug` | Catálogo municipal |
| `experiences` | `experiences` | `id` | Catálogo de actividades |
| `tourism_services` | `business_services` | `id` | Tarifas y disponibilidad auditada |
| `sos_logs` | `emergency_services` | `id` | Registro inmutable de incidentes |

---

## 🔄 2. Reglas de Transformación de Datos

1. **Marcas de Tiempo (Timestamps)**:
   - Firestore `admin.firestore.Timestamp` (`_seconds`, `_nanoseconds`) se convierte a formato estándar ISO-8601 UTC y se almacena en columnas `TIMESTAMPTZ`.
2. **Coordenadas Geoespaciales**:
   - Firestore `GeoPoint(lat, lon)` se descompone en `latitude` y `longitude` numéricas y se transforma mediante trigger en una geometría nativa PostGIS:
     ```sql
     geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
     ```
3. **Estructuras Anidadas y Arrays**:
   - Arrays de cadenas (`tags`, `amenities`, `images`) se transforman en columnas `TEXT[]` o `JSONB` según la necesidad de indexación y búsqueda.
   - Subcolecciones históricas (ej. `priceHistory`) se mapean a tablas de auditoría independientes con clave foránea a la entidad padre.
4. **Control de Concurrencia Optimista**:
   - Cada documento migrado inicializa su columna `version = 1`.
   - Modificaciones posteriores incrementan la versión para detectar colisiones en la sincronización de contingencia.

---

## ⚠️ 3. Matriz de Riesgos y Mitigaciones

| Riesgo Identificado | Nivel de Impacto | Probabilidad | Medida de Mitigación Preventiva |
| :--- | :--- | :--- | :--- |
| **Sobrescritura Accidental** | Crítico | Baja | Uso estricto de cláusula `ON CONFLICT (operation_id) DO NOTHING` y verificación de `updated_at`. |
| **Inconsistencia de Tipos** | Alto | Media | Validación de esquemas con tipado defensivo antes de ejecutar cualquier sentencia `INSERT`. |
| **Saturación de Conexiones** | Medio | Baja | Agrupación de registros en lotes controlados (Batches de 50 documentos) con pausas de 100ms. |
| **Pérdida de Referencias Foráneas** | Alto | Media | Orden estricto de migración: primero entidades maestras (`departments`, `users`), luego secundarias (`destinations`, `businesses`), finalmente transacciones (`reservations`, `reviews`). |

---

## 🔍 4. Protocolo de Validación y Certificación

Finalizada la replicación de cada colección, se debe ejecutar el siguiente protocolo de auditoría:

1. **Conteo de Cardinalidad**:
   ```sql
   -- Ejemplo: Comprobar paridad de destinos
   SELECT COUNT(*) AS total_supabase FROM destinations;
   ```
   El total debe coincidir exactamente con el resultado de Firestore:
   ```javascript
   const snapshot = await db.collection("destinations").count().get();
   console.log("Total Firestore:", snapshot.data().count);
   ```
2. **Auditoría de Integridad Referencial**:
   - Comprobar que ninguna reserva en Supabase apunte a un `user_id` o `business_id` inexistente.
3. **Muestreo Aleatorio del 5%**:
   - Comparar campo por campo 5 de cada 100 registros entre Firestore y PostgreSQL para verificar paridad de precios, textos y estados.

---

## ⏪ 5. Protocolo de Reversión (Rollback Plan)

Si durante el proceso de migración o verificación se detecta alguna anomalía:

1. **Paso 1: Detención Inmediata**:
   - Interrumpir cualquier script de sincronización en ejecución.
2. **Paso 2: Aislamiento**:
   - Firestore permanece 100% operativo como fuente primaria; los usuarios finales no experimentan impacto alguno.
3. **Paso 3: Limpieza en Supabase**:
   - Ejecutar el script de reversión específico para la tabla afectada sin alterar las tablas previamente certificadas:
     ```sql
     -- Ejemplo de purga segura de tabla específica en caso de error
     TRUNCATE TABLE backup_operations RESTART IDENTITY;
     ```
4. **Paso 4: Auditoría de Causa Raíz**:
   - Revisar los logs en `functions/` y Ops Center para identificar el documento o tipo de dato causante de la discrepancia.
