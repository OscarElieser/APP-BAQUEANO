# BAQUEANO ECOSYSTEM — FASE 13: OPEN ECOSYSTEM, OPEN DATA & DEVELOPER PLATFORM

## 1. Visión Ejecutiva de la Fase 13

La **Fase 13** transforma a Baqueano en un **Ecosistema Digital Abierto y Controlado**, permitiendo que universidades, centros de investigación, municipalidades, desarrolladores y aliados turísticos consuman, investiguen e integren información territorial de Nicaragua bajo estándares abiertos (Open Data, GeoJSON, OpenAPI), preservando al 100% la seguridad interna y la privacidad de las personas.

---

## 2. Componentes Clave Entregados

### A. Capa de Dominio & Esquemas Tipados (`packages/types`, `packages/validators`, `packages/config`)
- **`OpenDatasetRecord`**: Metadatos de datasets públicos con formatos (`json`, `geojson`, `csv`) y licencias abiertas (`CC-BY-4.0`).
- **`OpenDataPlaceDTO` & `OpenDataSmartPointDTO`**: Modelos de proyección con sanitización estricta de campos privados (excluyendo identificadores internos, notas privadas y contactos sensibles).
- **`ApiClientRecord` & `ApiScope`**: Modelo de cliente API con scopes granulares (`open_data.read`, `places.read`, `smart_points.read`, `research.telemetry.read`), entorno sandbox/production, control de rate limiting y cuotas diarias.
- **`ResearchProjectRecord`**: Modelo de gobernanza para proyectos científicos universitarios con K-anonymity garantizado.

### B. Endpoints de la API Abierta & Open Data (`apps/web/src/app/api/open/v1/`)
1. **`GET /api/open/v1/places`**: Atractivos turísticos públicos con proyección sanitizada, paginación por cursor y formato opcional GeoJSON (`?format=geojson`).
2. **`GET /api/open/v1/territories`**: 17 departamentos y regiones autónomas con metadatos turísticos y culturales.
3. **`GET /api/open/v1/smart-points`**: Red de tótems, miradores y accesos a senderos con aforo público agregado (formato GeoJSON y JSON).
4. **`GET /api/open/v1/datasets`**: Catálogo de metadatos de los datasets abiertos de Baqueano.
5. **`GET /api/open/v1/datasets/[datasetId]/download`**: Generación y descarga directa de snapshots en JSON y CSV.

### C. Portales Web Públicos (`apps/web`)
1. **Portal de Datos Abiertos (`/open-data`)**:
   - Catálogo interactivo de datasets, búsqueda en tiempo real, selector de categorías, descargas en JSON/GeoJSON/CSV y visor de endpoints.
2. **Portal para Desarrolladores (`/developers`)**:
   - Guías de inicio rápido en cURL y TypeScript, catálogo de scopes, documentación de autenticación con `x-api-key`, y explorador de API en vivo.
3. **Plataforma de Investigación Científica (`/research`)**:
   - Pautas de colaboración académica, principios de K-anonymity y formulario de solicitud de acceso a datos agregados para universidades.

### D. Consola de Administración (`apps/admin`)
- **Gestión de Clientes API (`/desarrolladores`)**:
  - Supervisión de credenciales activas, monitoreo de cuotas diarias consumidas, auditoría de hash de claves y switch de revocación instantánea (Kill-Switch).
- **Servicio `developer.service.ts`**:
  - Operaciones desacopladas y tipadas para la administración de clientes y tokens.

---

## 3. Garantías de Privacidad y Seguridad

- **Cero Acceso Directo a Firestore**: Los consumidores externos operan exclusivamente a través de los contratos de API y endpoints autorizados.
- **Sin Fugas de PII**: Ningún dataset ni endpoint de Open Data expone correos, teléfonos de viajeros, reservas, pagos o trayectorias individuales.
- **Compatibilidad Móvil Inalterada**: Las carpetas `/lib`, `/android`, `/test` y `pubspec.yaml` se mantienen 100% intactas.
