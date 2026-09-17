# 🔄 FLUJO DE DATOS & SINCRONIZACIÓN — BAQUEANO ECOSYSTEM

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Establecer un circuito operacional determinista, libre de duplicación de datos y sin desincronizaciones entre el panel de administración, la web pública y la aplicación móvil Android.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA DEL FLUJO)
El flujo responde al principio de **Fuente Única de Verdad (Single Source of Truth)** anclada en Cloud Firestore:

```text
┌────────────────────────────────────────────────────────┐
│               BAQUEANO CONTROL CENTER                  │
│       (Next.js Admin / PWA Operaciones)                │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. Formulario validado con Zod
                           │ 2. Token verificado (Admin / Super Admin)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 FIREBASE ADMIN / RULES                 │
│         (Autorización estricta por Claims/Role)        │
└──────────────────────────┬─────────────────────────────┘
                           │ 3. Escritura / Actualización atómica
                           ▼
┌────────────────────────────────────────────────────────┐
│                   CLOUD FIRESTORE                      │
│             Colección canónica: /places                │
└────────────┬─────────────────────────────┬─────────────┘
             │                             │
             │ 4a. Read / Revalidation     │ 4b. Stream / Cache Sync
             ▼                             ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│      BAQUEANO WEB       │   │       APP ANDROID        │
│    (Next.js Público)    │   │      (Flutter/Dart)      │
│  /destinos, /mapa, etc. │   │    PlaceModel / Offline  │
└─────────────────────────┘   └──────────────────────────┘
```

---

## 📦 3. QUÉ (WHAT / CICLO DE VIDA DE UN DESTINO TURÍSTICO)

### Fase A: Creación y Validación en Control Center
1. **Operador Administrativo**: Ingresa a `/destinos` en Control Center y abre el formulario de registro.
2. **Validación Zod en Cliente**: El esquema `placeRecordSchema` valida:
   - Nombre (2 a 120 caracteres).
   - Coordenadas WGS84 dentro del territorio nacional de Nicaragua.
   - Categoría y Departamento vinculados a identificadores válidos.
   - Estado inicial: `"draft"` o `"published"`.
3. **Generación de SEO Slug**: Se calcula un slug único en minúsculas sin caracteres especiales (`slugifyPlace`).

### Fase B: Persistencia y Registro de Auditoría
4. **Escritura en Firestore**: Se escribe el documento en `/places/{placeId}` con timestamps ISO estándar.
5. **Auditoría Inmutable**: Se genera una entrada en `/audit_logs` con la acción `DESTINATION_CREATED` o `DESTINATION_PUBLISHED`.

### Fase C: Sincronización Inmediata en la Web Pública
6. **Invalidación y Fetch**:
   - La web pública consulta `places` filtrando por `status == 'published'`.
   - Si se utiliza ISR (Incremental Static Regeneration), se ejecuta `revalidatePath('/destinos')` y `revalidatePath('/destinos/[slug]')`.
   - El nuevo destino aparece inmediatamente en `/destinos` y en su ruta canónica `/destinos/[slug]`.

### Fase D: Consumo en la App Móvil Android
7. **Compatibilidad Absoluta**:
   - Flutter deserializa el registro con `PlaceModel.fromFirestore()`.
   - No hay campos faltantes ni conflictos de tipos (`placeId`, `categoryId`, `latitude`, `longitude`, `imageUrl`, etc. se preservan íntegros).
