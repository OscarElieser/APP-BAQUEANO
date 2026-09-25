# 🧭 BAQUEANO ECOSYSTEM — PLAN DE RECUPERACIÓN ANTE DESASTRES (DISASTER RECOVERY)

<!--
============================================================================
🧭 BAQUEANO NICARAGUA — PLAN DE CONTINUIDAD OPERATIVA Y RECUPERACIÓN
============================================================================
🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Garantizar la resiliencia absoluta, disponibilidad continua y protección del
  patrimonio de datos de BAQUEANO Nicaragua ante catástrofes de infraestructura,
  fallas de red, eliminación accidental de registros o incidentes de seguridad.
- Erradicar la pérdida de reservas ecoturísticas, ingresos de cooperativas
  campesinas o reseñas territoriales mediante redundancia activa multi-nube.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & PROTOCOLOS):
- Principio FIREBASE FIRST, SUPABASE FALLBACK:
  * Arquitectura híbrida activo-pasiva con conmutación en caliente (Hot Standby).
  * Monitoreo por Circuit Breaker (3 estados: CLOSED -> OPEN -> HALF_OPEN).
  * Objetivos de recuperación realistas:
    - RPO (Recovery Point Objective): < 1 minuto para transacciones críticas.
    - RTO (Recovery Time Objective): < 30 segundos (failover transparente automático).
  * Procedimientos de actuación específicos para 7 escenarios de contingencia extrema.

📦 3. QUÉ (WHAT / ENTREGABLES & RUNBOOKS):
- Definición formal de métricas RPO y RTO.
- Protocolos de mitigación y recuperación ante 7 fallos críticos.
- Procedimiento de rotación criptográfica de claves comprometidas.
============================================================================
-->

---

## ⏱️ 1. Objetivos de Recuperación Operativa (RPO & RTO)

| Nivel de Servicio | Métrica Objetivo | Mecanismo de Garantía Técnica |
| :--- | :--- | :--- |
| **RPO (Punto Objetivo de Recuperación)** | **< 60 segundos** | Las operaciones de escritura que fallan en Firebase se registran inmediatamente en `backup_operations` de Supabase con `operation_id` idempotente. |
| **RTO (Tiempo Objetivo de Recuperación)** | **< 30 segundos** | Conmutación instantánea a través del Circuit Breaker en el backend sin requerir intervención humana ni reinicio de servicios. |
| **RPO Multimedia (Storage)** | **< 24 horas** | Sincronización asíncrona por lotes de imágenes y documentos con verificación de suma de comprobación SHA-256. |

---

## 🚨 2. Procedimientos de Actuación ante Escenarios Críticos

### Escenario 1: Caída o Indisponibilidad de Cloud Firestore
- **Síntoma**: Tiempos de espera (`DEADLINE_EXCEEDED`) o errores `503 Unavailable` desde Firebase.
- **Acción Automática**:
  1. El backend detecta 3 fallos consecutivos en `CircuitBreaker`.
  2. El circuito conmuta al estado **OPEN**.
  3. Toda operación entrante (reservas, reseñas, favoritos, perfiles) se almacena en la tabla `backup_operations` de Supabase con estado `pending`.
  4. La respuesta al cliente informa: *"Tu solicitud fue recibida correctamente y se encuentra en proceso de sincronización."*
- **Procedimiento de Recuperación**:
  1. El Circuit Breaker efectúa pruebas periódicas en estado **HALF_OPEN**.
  2. Al reanudarse Firestore, se ejecuta automáticamente el servicio `syncFirebaseBackup()` aplicando backoff progresivo (1m, 5m, 15m, 1h, 6h).
  3. Los registros en Supabase pasan a estado `synced` tras comprobar su inserción en Firestore.

---

### Escenario 2: Falla de Firebase Storage
- **Síntoma**: Errores al descargar o subir fotografías de destinos o negocios a `firebasestorage.googleapis.com`.
- **Acción Automática**:
  1. El backend consulta la tabla `storage_backups` en Supabase.
  2. Si la fotografía cuenta con copia de seguridad, el backend o frontend resuelve la URL pública desde el bucket espejo de Supabase Storage (`baqueano-backup-media`).
  3. En Ops Center, se habilita temporalmente la subida directa a Supabase Storage con registro en `storage_backups` con estado `pending_firebase_sync`.
- **Procedimiento de Recuperación**:
  1. Restablecido Firebase Storage, un script en segundo plano descarga los archivos pendientes de Supabase y los deposita en el bucket principal.

---

### Escenario 3: Indisponibilidad de Supabase
- **Síntoma**: Errores en consultas PostGIS, pgvector o conexión a PostgreSQL.
- **Acción Automática**:
  1. Firebase permanece 100% operativo como plataforma principal.
  2. Las búsquedas de proximidad conmutan de inmediato al algoritmo geodésico soberano **Haversine** implementado en memoria dentro de Node.js.
  3. Las consultas de IA utilizan el catálogo territorial fáctico de Nicaragua en lugar del índice vectorial RAG.
  4. La experiencia del explorador se mantiene ininterrumpida.

---

### Escenario 4: Caída Simultánea de Firebase y Supabase
- **Síntoma**: Interrupción global a nivel de centros de datos de Google Cloud y Supabase.
- **Acción y Mitigación**:
  1. El cliente web y la app móvil de Baqueano entran en **Modo Soberano Fuera de Línea (Offline Cache)**:
     * Catálogo local precargado en IndexedDB / LocalStorage / SQLite.
     * Consulta de senderos, mapas cacheados e información de seguridad.
  2. Las solicitudes de reserva emitidas en ese lapso se guardan en la cola local del navegador y se transmiten tan pronto se restablezca la conectividad.

---

### Escenario 5: Borrado Accidental de Información en Firestore
- **Síntoma**: Eliminación no planificada de documentos o colecciones en Firestore.
- **Procedimiento de Recuperación**:
  1. Acceder a Supabase PostgreSQL y consultar la última versión conocida de los registros en las tablas equivalentes (`destinations`, `businesses`, `profiles`).
  2. Exportar los datos en formato JSON estructurado.
  3. Ejecutar el script de restauración en `functions/` utilizando `WriteBatch` de Firestore para repoblar la colección con sus IDs originales.

---

### Escenario 6: Falla durante la Ejecución de una Migración SQL
- **Síntoma**: Error de sintaxis o bloqueo en Supabase SQL Editor al aplicar una migración.
- **Procedimiento de Reversión**:
  1. No intentar modificaciones directas destructivas sobre datos existentes.
  2. Ejecutar la sentencia de reversión correspondiente al archivo fallido.
  3. Comprobar que las tablas precedentes conserven integridad referencial.
  4. Corregir el script en el entorno local antes de reintentar.

---

### Escenario 7: Clave de Acceso o Credencial Comprometida
- **Síntoma**: Detección de una API Key o clave de servicio en logs públicos o repositorios.
- **Protocolo de Rotación Inmediata**:
  1. **Google Gemini / Groq**:
     * Ingresar a Google AI Studio o consola de Groq y revocar la clave comprometida.
     * Generar un nuevo secreto y actualizarlo en Google Secret Manager:
       ```bash
       firebase functions:secrets:set GEMINI_API_KEY
       ```
     * Desplegar la función para propagar el nuevo valor sin tocar el frontend.
  2. **Supabase Service Role Key**:
     * Ingresar al Dashboard de Supabase en `Settings -> API`.
     * Regenerar la clave de servicio (`service_role`).
     * Actualizar el secreto en el backend.
     * Recordar: la clave `service_role` **NUNCA** debe figurar en archivos cliente (`website/`).
