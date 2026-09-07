# 🧭 CONTRATOS DE DATOS CLOUD FIRESTORE — BAQUEANO ECOSYSTEM

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Establecer una fuente de verdad inmutable y estrictamente tipada para el ecosistema BAQUEANO, asegurando interoperabilidad absoluta entre:
1. **App Móvil Android (Flutter/Dart)**: Consumidora crítica en territorio y offline-first.
2. **BAQUEANO Web (Next.js)**: Portal público de exploración turística y cultural.
3. **BAQUEANO Control Center (Next.js / Admin Ops)**: Centro de operaciones para gestión, publicación y fiscalización.

Regla inquebrantable: **Cero disrupción de contratos consumidos por Android**. Si se introducen campos adicionales para la web (por ejemplo, `seoSlug`), estos son **opcionales** y nunca reemplazan ni eliminan campos preexistentes.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & COMPATIBILIDAD)
- Cada colección se rige por un esquema Zod en `@baqueano/validators` y un modelo TypeScript en `@baqueano/types`.
- En Android, los modelos correspondientes se encuentran en `lib/features/directory/models/` (`place_model.dart`, `category_model.dart`, `department_model.dart`, `municipality_model.dart`).
- Todo acceso a Firestore respeta las reglas de seguridad declaradas en `firestore.rules`.

---

## 📦 3. QUÉ (WHAT / ESPECIFICACIÓN POR COLECCIÓN)

### 1. Colección: `places` (Destinos, Establecimientos y Atractivos)
- **Path Firestore**: `/places/{placeId}`
- **Uso Android**: `PlaceModel` (Directorio, mapas, búsqueda offline, cálculo geohash, ficha de destino).
- **Uso Web**: Catálogo público `/destinos`, `/destinos/[slug]`, mapa interactivo.
- **Uso Admin**: CRUD completo en Control Center (`/destinos`), publicación y archivo.
- **Reglas de Acceso**: Lectura si `status == 'published'` o `isAdmin()`. Escritura solo `isAdmin()`.

| Campo | Tipo | Req / Opt | Default | Relación / Descripción |
|---|---|---|---|---|
| `placeId` | String | Required | Generado / doc.id | ID único del lugar |
| `name` | String | Required | — | Nombre oficial del destino |
| `categoryId` | String | Required | — | FK a `categories.categoryId` |
| `categoryName` | String | Required | — | Nombre desnormalizado de categoría |
| `subcategory` | String | Optional | `""` | Subclasificación turística/comercial |
| `description` | String | Optional | `""` | Reseña editorial y patrimonial |
| `departmentId` | String | Required | — | FK a `departments.id` |
| `departmentName` | String | Required | — | Nombre desnormalizado del departamento |
| `municipalityId` | String | Required | — | FK a `municipalities.id` |
| `municipalityName` | String | Required | — | Nombre desnormalizado del municipio |
| `address` | String | Optional | `""` | Dirección física o referencia local |
| `latitude` | Number (Float) | Required | — | Coordenada WGS84 (-90 a 90) |
| `longitude` | Number (Float) | Required | — | Coordenada WGS84 (-180 a 180) |
| `geohash` | String | Optional | `""` | Hash geoespacial para consultas de radio |
| `phone` | String | Optional | `null` | Teléfono de contacto |
| `whatsapp` | String | Optional | `null` | Enlace o número directo WhatsApp |
| `website` | String | Optional | `null` | Portal web o red oficial |
| `imageUrl` | String | Required | `""` | URL principal optimizada en Firebase Storage |
| `imageUrls` | Array<String> | Optional | `[]` | Galería multimedia |
| `openingHours` | String | Optional | `null` | Horario de atención |
| `is24Hours` | Boolean | Optional | `false` | Servicio continuo 24/7 |
| `isOpen` | Boolean | Optional | `true` | Disponibilidad operativa actual |
| `isEmergency` | Boolean | Optional | `false` | Marcador de servicio de emergencia |
| `isTourist` | Boolean | Optional | `true` | Atractivo de interés turístico |
| `isCommercial` | Boolean | Optional | `false` | Comercio / Negocio aliado |
| `verified` | Boolean | Optional | `false` | Verificado en territorio por Baqueano |
| `verificationSource`| String | Optional | `null` | Entidad o inspector verificador |
| `sourceUrl` | String | Optional | `null` | Fuente documental de verificación |
| `lastVerifiedAt` | String (ISO) | Optional | `null` | Fecha última de inspección física |
| `rating` | Number (Float) | Optional | `5.0` | Calificación promedio (0.0 a 5.0) |
| `reviewCount` | Number (Int) | Optional | `0` | Cantidad total de reseñas |
| `status` | String | Required | `"published"` | `"published"` \| `"draft"` \| `"archived"` |
| `createdAt` | String (ISO) | Required | Now | Timestamp de creación |
| `updatedAt` | String (ISO) | Required | Now | Timestamp de última actualización |
| `seoSlug` | String | Optional (Web) | auto-slug | Slug amigable para URL pública |

---

### 2. Colección: `categories` (Taxonomía del Directorio)
- **Path Firestore**: `/categories/{categoryId}`
- **Uso Android**: `CategoryModel` (Filtros de chips, iconos Material).
- **Uso Web**: Filtros en barra de exploración, taxonomía y leyendas.
- **Uso Admin**: Módulo `/categorias` en Control Center.
- **Reglas de Acceso**: Lectura pública (`allow read: if true;`). Escritura solo `isAdmin()`.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `categoryId` | String | Required | doc.id | Identificador único (`cultura`, `naturaleza`, etc.) |
| `name` | String | Required | — | Nombre legible de categoría |
| `description` | String | Optional | `""` | Descripción del alcance |
| `icon` | String | Required | `"place"` | Clave semántica de icono |
| `type` | String | Required | `"culture"` | `"culture"` \| `"commerce"` \| `"entertainment"` \| `"health"` \| `"emergency"` \| `"transport"` |
| `order` | Number (Int) | Optional | `0` | Orden de visualización en interfaz |
| `active` | Boolean | Optional | `true` | Visibilidad activa en selectores |

---

### 3. Colección: `departments` (División Departamental)
- **Path Firestore**: `/departments/{departmentId}`
- **Uso Android**: `DepartmentModel` (Listado y selector de departamentos).
- **Uso Web**: Filtro territorial en explorador y mapa.
- **Uso Admin**: Módulo `/departamentos` en Control Center.
- **Reglas de Acceso**: Lectura pública. Escritura solo `isAdmin()`.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `id` | String | Required | doc.id | ID estandarizado (`leon`, `rivas`, etc.) |
| `name` | String | Required | — | Nombre oficial del departamento |
| `zone` | String | Required | `"Nacional"` | Zona geográfica (`Pacífico`, `Centro-Norte`, `Caribe`, `Sur`) |
| `capital` | String | Required | — | Cabecera departamental |
| `latitude` | Number (Float) | Required | `12.8654` | Centroide departamental |
| `longitude` | Number (Float) | Required | `-85.2072`| Centroide departamental |

---

### 4. Colección: `municipalities` (Municipios de Nicaragua)
- **Path Firestore**: `/municipalities/{municipalityId}`
- **Uso Android**: `MunicipalityModel` (Filtrado municipal dependiente).
- **Uso Web**: Filtrado granular de destinos.
- **Uso Admin**: Módulo `/municipios` en Control Center.
- **Reglas de Acceso**: Lectura pública. Escritura solo `isAdmin()`.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `id` | String | Required | doc.id | ID único municipal |
| `departmentId` | String | Required | — | FK a `departments.id` |
| `name` | String | Required | — | Nombre oficial del municipio |
| `latitude` | Number (Float) | Required | `12.8654` | Centroide municipal |
| `longitude` | Number (Float) | Required | `-85.2072`| Centroide municipal |

---

### 5. Colección: `businesses` (Emprendimientos y Anfitriones Locales)
- **Path Firestore**: `/businesses/{businessId}`
- **Uso Android**: Guía de servicios aliados y contacto.
- **Uso Web**: Alianzas comunitarias, directorio local.
- **Uso Admin**: Aprobación, verificación y fiscalización.
- **Uso Host**: Gestión del negocio propio vía `/host`.
- **Reglas de Acceso**: Lectura si publicado, admin o dueño (`ownerUid == request.auth.uid`). Creación en estado `pending_review`.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `ownerUid` | String | Required | auth.uid | UID del usuario anfitrión |
| `name` | String | Required | — | Razón social o nombre comercial |
| `description` | String | Optional | `""` | Descripción de servicios |
| `category` | String | Required | — | Categoría del emprendimiento |
| `department` | String | Required | — | Departamento territorial |
| `municipality` | String | Required | — | Municipio local |
| `address` | String | Optional | `""` | Dirección exacta |
| `phone` | String | Optional | `""` | Teléfono de reservas |
| `email` | String | Optional | `""` | Correo comercial |
| `website` | String | Optional | `""` | Enlace externo |
| `imageUrl` | String | Optional | `""` | Foto de fachada o logo |
| `galleryUrls` | Array<String> | Optional | `[]` | Fotografías del establecimiento |
| `coordinates` | GeoPoint | Optional | — | Ubicación satelital |
| `status` | String | Required | `"pending_review"` | `"pending_review"` \| `"published"` \| `"archived"` |
| `verified` | Boolean | Required | `false` | Validación física territorial |
| `createdAt` | Timestamp/String| Required | Now | Fecha de registro |
| `updatedAt` | Timestamp/String| Required | Now | Fecha de modificación |

---

### 6. Colección: `users` (Perfiles y Roles)
- **Path Firestore**: `/users/{userId}`
- **Uso Android**: Pasaporte, insignias, XP, nivel de explorador.
- **Uso Web**: Perfil de usuario, favoritos guardados.
- **Uso Admin**: Auditoría de usuarios, visualización de roles.
- **Reglas de Acceso**: Lectura si es dueño o admin. Modificación de `role` solo admin backend.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `uid` | String | Required | auth.uid | UID de Firebase Auth |
| `email` | String | Required | — | Correo electrónico verificado |
| `displayName` | String | Optional | `""` | Nombre del explorador |
| `photoUrl` | String | Optional | `""` | Avatar |
| `role` | String | Required | `"explorer"` | `"super_admin"` \| `"admin"` \| `"auditor"` \| `"host"` \| `"explorer"` |
| `explorerLevel` | Number (Int) | Optional | `1` | Nivel gamificado |
| `xp` | Number (Int) | Optional | `0` | Puntos de experiencia |
| `stamps` | Array<String> | Optional | `[]` | Sellos del Pasaporte Nacional |
| `badges` | Array<String> | Optional | `[]` | Insignias ambientales y culturales |
| `favorites` | Array<String> | Optional | `[]` | IDs de lugares guardados |
| `createdAt` | Timestamp/String| Required | Now | Registro inicial |
| `updatedAt` | Timestamp/String| Required | Now | Último acceso |
| `privacyConsentAt`| Timestamp/String| Optional | Now | Consentimiento de privacidad |

---

### 7. Colección: `user_saved_places` (Favoritos de Exploradores)
- **Path Firestore**: `/user_saved_places/{savedId}`
- **Uso Android & Web**: Guardar y consultar destinos favoritos del usuario autenticado.
- **Reglas de Acceso**: Solo el propio usuario (`userId == request.auth.uid`) puede leer, crear y eliminar. Prohibido acceso ajeno.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `userId` | String | Required | auth.uid | Dueño del favorito |
| `placeId` | String | Required | — | FK al destino en `places` |
| `savedAt` | Timestamp/String| Required | Now | Fecha de guardado |

---

### 8. Colección: `business_subscriptions` (Membresías y Sostenibilidad)
- **Path Firestore**: `/business_subscriptions/{businessId}`
- **Uso Android & Web**: Visualización del estado del plan del anfitrión.
- **Uso Admin**: Fiscalización de membresías y vigencia.
- **Reglas de Acceso**: Lectura solo admin o dueño del negocio. Escritura denegada a clientes (`allow write: if false;` controlada por backend/Admin SDK).

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `businessId` | String | Required | — | FK a `businesses` |
| `plan` | String | Required | `"starter"` | `"starter"` \| `"growth"` \| `"alliance"` |
| `status` | String | Required | `"active"` | `"active"` \| `"past_due"` \| `"cancelled"` |
| `validUntil` | Timestamp/String| Required | — | Vencimiento del ciclo actual |
| `autoRenew` | Boolean | Optional | `true` | Renovación periódica |

---

### 9. Colecciones Financieras: `payment_orders` y `payment_transactions`
- **Paths**: `/payment_orders/{orderId}`, `/payment_transactions/{transactionId}`
- **Reglas de Acceso**: Lectura solo admin o creador (`createdByUid == request.auth.uid`). Escritura denegada a clientes.
- **Principio de Seguridad**: PROHIBIDO almacenar PAN completo, CVV o PIN. Solo identificadores de transacción y tokens bancarios delegados.

---

### 10. Colección: `audit_logs` (Pistas de Auditoría Inmutables)
- **Path Firestore**: `/audit_logs/{logId}`
- **Uso Admin**: Módulo `/auditoria` en Control Center.
- **Reglas de Acceso**: Lectura solo `isAdmin()`. Escritura denegada a clientes (`allow write: if false;`). Solo emitida por Admin SDK o Cloud Functions.

| Campo | Tipo | Req / Opt | Default | Descripción |
|---|---|---|---|---|
| `logId` | String | Required | doc.id | UUID del registro de auditoría |
| `actorUid` | String | Required | — | UID de quien ejecutó la acción |
| `actorEmail` | String | Required | — | Correo del operador administrativo |
| `actorRole` | String | Required | — | Rol con que ejecutó la acción |
| `action` | String | Required | — | Evento (`DESTINATION_CREATED`, `DESTINATION_PUBLISHED`, etc.) |
| `targetCollection` | String | Required | — | Colección afectada |
| `targetDocumentId` | String | Required | — | ID del documento afectado |
| `metadata` | Map | Optional | `{}` | Cambios realizados sin datos sensibles |
| `timestamp` | String (ISO) | Required | Now | Registro temporal inmutable |
