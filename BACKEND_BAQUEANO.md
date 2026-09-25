# 🧭 BAQUEANO ECOSYSTEM — ARQUITECTURA DEL BACKEND CENTRAL

<!--
============================================================================
🧭 BAQUEANO NICARAGUA — ESPECIFICACIÓN Y ARQUITECTURA DEL BACKEND
============================================================================
🎯 1. POR QUÉ (WHY / PROPÓSITO):
- Dotar al ecosistema Baqueano Nicaragua (https://app-baqueano.web.app/) de un
  backend unificado, soberano, verificable y de alta disponibilidad.
- Eliminar la dependencia exclusiva de lecturas/escrituras directas desde el cliente
  web, garantizando validación estricta de roles RBAC, rate limiting, cálculos fiscales
  bajo Ley 306 y failover automático ante fallas de infraestructura.
- Proteger las reservas campesinas, reseñas comunitarias y patrimonio territorial
  sin pérdida de transacciones.

⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
- Principio FIREBASE FIRST, SUPABASE FALLBACK:
  * Firebase Hosting → Frontend estático y PWA.
  * Firebase Authentication → Proveedor exclusivo de identidad y Google OAuth 2.0.
  * Cloud Functions Gen 2 / Cloud Run → Motor de API centralizada en Node.js 20.
  * Cloud Firestore → Base de datos operacional primaria.
  * Supabase PostgreSQL / PostGIS / pgvector → Base relacional, respaldo transaccional,
    motor geoespacial y base de conocimiento RAG.
  * Google Secret Manager → Custodia criptográfica de credenciales y API Keys.
  * Motor Multi-LLM en cascada: Google Gemini Flash → Groq → Ollama → Motor Territorial Fáctico.
  * Conmutador Circuit Breaker de 3 estados (CLOSED, OPEN, HALF_OPEN) y cola de
    contingencia con backoff exponencial progresivo (1m, 5m, 15m, 1h, 6h).

📦 3. QUÉ (WHAT / ENTREGABLES & CONTRATOS):
- 15 endpoints RESTful normalizados bajo el prefijo `/api/*`.
- Middleware de autenticación y verificación de roles (`verifyAuth`, `verifyAdmin`, `verifySuperAdmin`).
- Suite de pruebas unitarias automatizadas (`npm test` con 20 pruebas aprobadas al 100%).
- Conexión e integración con Ops Center en `admin.html` (Módulo 35: Backup y Sincronización).
============================================================================
-->

---

## 🏛️ 1. Diagrama de la Arquitectura Global

```mermaid
flowchart TD
    User([Explorador / Administrador]) -->|HTTPS / TLS 1.3| Hosting[Firebase Hosting\nhttps://app-baqueano.web.app]
    Hosting -->|Frontend SPA / PWA| BrowserApp[Cliente Web Baqueano]
    BrowserApp -->|Google Sign-In / Token ID| FirebaseAuth[Firebase Authentication]

    BrowserApp -->|/api/* Rewrites| BackendEngine[BACKEND CENTRAL BAQUEANO\nCloud Functions Gen 2 / Cloud Run\nNode.js 20]

    subgraph CoreSecurity [Seguridad & Secretos]
        SecretMgr[Google Secret Manager\nGEMINI_API_KEY\nGROQ_API_KEY\nSUPABASE_SERVICE_ROLE_KEY]
        AuthMiddleware[Auth Middleware\nverifyAuth & verifyAdmin]
    end

    BackendEngine --> CoreSecurity

    subgraph DataTier [Persistencia & Respaldo: FIREBASE FIRST, SUPABASE FALLBACK]
        direction TB
        subgraph PrimaryPlatform [Plataforma Primaria: FIREBASE]
            Firestore[(Cloud Firestore\nOperaciones Primarias)]
            FBStorage[(Firebase Storage\nArchivos & Medios)]
        end

        subgraph SecondaryPlatform [Plataforma Respaldo & Relacional: SUPABASE]
            Postgres[(PostgreSQL 15+\nTablas Relacionales)]
            PostGISExt[PostGIS\nBúsqueda Proximidad]
            PgVectorExt[pgvector\nRAG & Embeddings]
            BackupQueue[(backup_operations\nCola de Contingencia)]
            SBStorage[(Supabase Storage\nCopia Espejo SHA-256)]
        end

        CircuitBreaker{Circuit Breaker\n3 Fallos = OPEN}
    end

    BackendEngine --> CircuitBreaker
    CircuitBreaker -->|Modo Normal (CLOSED)| PrimaryPlatform
    CircuitBreaker -->|Fallo Detectado (OPEN)| SecondaryPlatform
    SecondaryPlatform -.->|Sync Progresivo (1m, 5m, 15m, 1h, 6h)| PrimaryPlatform

    subgraph AIEngine [Motor Multi-LLM en Cascada]
        Gemini[Google Gemini 1.5 Flash\nPrincipal]
        Groq[Groq Llama 3.3\nFallback Rápido]
        Ollama[Ollama Local\nFallback Soberano]
        BaqueanoFactual[Motor Territorial Determinista\nDatos Oficiales sin Alucinaciones]

        Gemini -->|Fallo / Timeout| Groq
        Groq -->|Fallo / Timeout| Ollama
        Ollama -->|Fallo / Timeout| BaqueanoFactual
    end

    BackendEngine --> AIEngine
```

---

## 🔌 2. Catálogo Oficial de Endpoints RESTful

Todos los endpoints residen bajo el prefijo `/api/*` y respetan estrictos encabezados de seguridad (CORS restringido a orígenes autorizados, `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` para datos transaccionales).

| Método | Endpoint | Autenticación | Rol Mínimo | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Pública | Cualquiera | Chequeo exhaustivo multi-proveedor (Firebase, Supabase, Storage, IA). |
| `POST` | `/api/ai/chat` | Pública | Cualquiera | Asistente de viaje Baqueano multi-LLM con acciones territoriales estructuradas. |
| `POST` | `/api/ai/travel-plan` | Pública | Cualquiera | Generador de itinerarios detallados por días con presupuesto y actividades reales. |
| `GET` | `/api/destinations` | Pública | Cualquiera | Catálogo oficial de destinos y senderos protegidos. |
| `GET` | `/api/places` | Pública | Cualquiera | Puntos de interés y coordenadas verificadas. |
| `GET` | `/api/businesses` | Pública | Cualquiera | Negocios comunitarios y anfitriones acreditados. |
| `GET` | `/api/search` | Pública | Cualquiera | Búsqueda omnicanal con normalización de tildes y diacríticos. |
| `GET` | `/api/nearby` | Pública | Cualquiera | Búsqueda geoespacial por radio utilizando PostGIS o Haversine. |
| `POST` | `/api/reservations` | Requerida | `traveler` | Creación de reserva con guardado failover inmediato en Supabase ante caída. |
| `GET` | `/api/reservations` | Requerida | `traveler` | Historial de reservas del usuario autenticado (o todas si es admin). |
| `POST` | `/api/reviews` | Requerida | `traveler` | Publicación de opiniones y calificaciones verificadas. |
| `POST` | `/api/favorites` | Requerida | `traveler` | Marcado y desmarcado de favoritos con prevención de duplicados. |
| `GET` | `/api/profile` | Requerida | `traveler` | Perfil de usuario autenticado sincronizado entre Firebase y Supabase. |
| `GET` | `/api/admin/backup/status` | Requerida | `admin` | Telemetría de la cola de respaldo y estado del Circuit Breaker para Ops Center. |
| `POST` | `/api/admin/backup/retry` | Requerida | `admin` | Disparo forzado de sincronización de operaciones pendientes hacia Firestore. |

---

## 🛡️ 3. Modelo de Seguridad, Identidad y Roles (RBAC)

1. **Fuente de Identidad Única**:
   - Firebase Authentication es el único emisor de identidad (Google OAuth 2.0 y correo/contraseña).
   - Se erradica por completo la creación de un segundo sistema de login en Supabase.
   - El backend valida el token de portador (`Authorization: Bearer <ID_TOKEN>`) mediante `admin.auth().verifyIdToken(token, true)`.
2. **Resolución de Roles Incorruptible**:
   - Los roles se resuelven en el backend inspeccionando:
     1. Custom Claims en el token de Firebase Auth (`decodedToken.role` o `decodedToken.admin`).
     2. Documento del usuario en Firestore (`users/{uid}`).
     3. Registro en la tabla `profiles` de Supabase (`firebase_uid = uid`).
   - Queda terminantemente prohibido confiar en variables de `localStorage`, cookies o parámetros enviados por el navegador.
3. **Jerarquía de Roles**:
   - `superadmin`: Acceso universal a configuración, secrets, auditoría y borrado físico.
   - `admin`: Operación de Ops Center, gestión de contenidos, aprobación de negocios y reintentos de backup.
   - `editor`: Creación y edición de artículos culturales, rutas y descripciones turísticas.
   - `guide`: Administración de servicios y disponibilidad propios.
   - `business_owner`: Administración exclusiva de sus establecimientos acreditados.
   - `traveler`: Explorador registrado; gestión de reservas, reseñas y favoritos propios.

---

## 🔄 4. Resiliencia, Failover y Sincronización Progresiva

### 4.1 Principio de Continuidad Operativa
Si Cloud Firestore sufre una interrupción o latencia crítica:
1. El backend captura la excepción a través del **Circuit Breaker**.
2. Tras 3 fallos consecutivos, el circuito pasa al estado **OPEN**.
3. Las operaciones críticas de escritura (reservas, reseñas, favoritos, perfiles) se enrutan de forma transparente hacia la tabla `backup_operations` de Supabase PostgreSQL con estado `pending`.
4. El explorador recibe una confirmación limpia:
   > *"Tu solicitud fue recibida correctamente y se encuentra en proceso de sincronización."*
   *(Sin revelar stack traces, errores de Firebase ni detalles de infraestructura interna)*.

### 4.2 Algoritmo de Sincronización con Backoff Progresivo
La función `syncFirebaseBackup()` se ejecuta periódicamente o ante solicitud administrativa:
- Filtra operaciones con estado `pending` o `failed` cuyo tiempo de espera haya vencido.
- Escala de reintentos progresivos:
  * Reintento 1: 1 minuto (60 segundos).
  * Reintento 2: 5 minutos (300 segundos).
  * Reintento 3: 15 minutos (900 segundos).
  * Reintento 4: 1 hora (3,600 segundos).
  * Reintento 5+: 6 horas (21,600 segundos).
- Al restablecerse la conectividad con Firestore, la entidad se inserta/actualiza en la colección correspondiente y la operación en Supabase se marca como `synced`.
- Si se detecta que el documento en Firestore fue modificado con una marca de tiempo más reciente, la operación se marca como `conflict` para resolución en Ops Center sin sobrescritura destructiva.

---

## 🤖 5. Motor de Inteligencia Artificial (Multi-LLM & RAG)

1. **RAG Territorial con PostGIS y pgvector**:
   - Las consultas turísticas se enriquecen buscando documentos relevantes en `knowledge_documents` mediante similitud de cosenos HNSW en Supabase.
   - Solo se alimenta al modelo con datos territoriales contrastados (cooperativas, precios verificados por Ley 306, normas de áreas protegidas de MARENA).
2. **Cascada de Inferencia**:
   - **Nivel 1**: Google Gemini 1.5 Flash (baja latencia, salida JSON estructurada).
   - **Nivel 2**: Groq Cloud Llama 3.3 (conmutación automática si Gemini supera 8s o agota cuota).
   - **Nivel 3**: Ollama Local (opción soberana para despliegues locales sin internet).
   - **Nivel 4**: Motor Determinista Baqueano (construye itinerarios válidos basados en el catálogo fáctico de Nicaragua, impidiendo cualquier alucinación).
3. **Protección de Consumo (Rate Limiting)**:
   - 10 solicitudes por minuto por IP o usuario autenticado.
   - Sanitización de entradas contra inyecciones de prompt.

---

## 🧪 6. Validación y Suite de Pruebas

El backend cuenta con una suite automatizada basada en el ejecutor nativo de Node.js (`node --test test/*.test.js`):
- **20/20 pruebas pasando con 0 errores**:
  * Limpieza y sanitización de mensajes turísticos.
  * Descarte de acciones de IA no autorizadas.
  * Manejo de fallos en cascada sin simulación engañosa.
  * Validación de esquemas de `/api/health`, `/api/destinations`, `/api/nearby`, `/api/search` y `/api/ai/travel-plan`.
  * Cálculo de distancia geodésica Haversine.
  * Backoff progresivo y transición de estados del Circuit Breaker.
  * Mantenimiento de métricas reales de Firestore.
