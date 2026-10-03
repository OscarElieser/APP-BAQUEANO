# 🧭 Arquitectura oficial y obligatoria de BAQUEANO

## 🎯 POR QUÉ (Why / Propósito)

Separar con precisión identidad, información, dominio, experiencia e inteligencia para que BAQUEANO evolucione sin destruir el Website existente ni mantener bases de datos competidoras.

Un Website no necesita React, Next.js ni renderizado de servidor para ser dinámico. Las páginas actuales pueden seguir construidas con HTML, CSS y JavaScript; son dinámicas cuando obtienen, validan y presentan contenido procedente de Supabase en vez de almacenar ese contenido como autoridad dentro del HTML o JavaScript.

## ⚙️ CÓMO (How / Arquitectura e implementación)

### Flujo canónico

```text
USUARIO
  ↓
https://baqueanonicaragua.com
  ↓
WEBSITE BAQUEANO — HTML + CSS + JavaScript
  ├─→ Firebase Authentication — identidad, sesión y Firebase UID
  ├─→ Supabase — toda la información dinámica y operativa
  └─→ BAQUI — inteligencia y RAG sobre información verificada de Supabase

https://app-baqueano.web.app
  └─→ URL técnica, respaldo, diagnóstico y recuperación de Firebase Hosting
```

### Responsabilidades no intercambiables

| Componente | Responsabilidad oficial | No debe convertirse en |
|---|---|---|
| Hostinger | Dominio, DNS, SSL, correo y futuros subdominios | Base de datos de la aplicación |
| Firebase Authentication | Registro, login, Google Sign-In, sesión, OAuth, Firebase UID y App Check cuando aplique | Almacén principal de contenido |
| Firebase Hosting | Infraestructura web técnica, respaldo y recuperación | Dominio canónico público |
| Supabase | PostgreSQL, RLS, Realtime, Storage dinámico, información y operaciones | Segundo sistema de autenticación con contraseñas duplicadas |
| Website | Experiencia, navegación, renderizado y formularios | Fuente canónica de datos turísticos |
| BAQUI | Consulta, RAG, planificación y asistencia | Generador de hechos sin fuentes |
| Android | Aplicación Flutter independiente orientada exclusivamente a Android | Dependencia estructural del Website |

### Decisión sobre tecnologías web

- `website/` puede conservar sus páginas HTML, estilos CSS y módulos JavaScript actuales.
- React y Next.js son opcionales. Su existencia en subproyectos no obliga a reescribir la web pública.
- No se crearán 153 archivos HTML para municipios. Una plantilla como `municipio.html?id=somoto` puede consultar Supabase y renderizar el municipio solicitado.
- Una plantilla como `departamento.html?depto=matagalpa` debe resolver desde Supabase departamento, municipios, destinos, alojamiento, gastronomía, historia, cultura, naturaleza y emergencias verificadas.
- Los componentes visuales existentes deben preservarse mientras se cambia progresivamente su fuente de información.

### Patrón dinámico permitido en HTML/JavaScript

```text
Página HTML estable
  ↓
Módulo JavaScript de datos
  ↓
Supabase Data API o backend seguro
  ↓
RLS + validación + estado publicado
  ↓
Renderizado en el DOM
```

La clave pública publicable puede existir en el cliente únicamente con RLS correctamente configurada. `SUPABASE_SERVICE_ROLE_KEY` jamás puede aparecer en HTML, JavaScript público, Flutter, APK, almacenamiento del navegador ni repositorio público. Operaciones administrativas, verificación, cambios de roles y auditoría privilegiada deben pasar por backend seguro.

### Identidad Firebase conectada con Supabase

```text
Firebase Authentication
  uid = abc123
        ↓ token verificado por backend
Supabase profiles
  firebase_uid = abc123
```

Supabase no almacena contraseñas Firebase. El `firebase_uid` enlaza perfiles, favoritos, viajes, reservas, reseñas y operaciones autorizadas. Una clave pública o la presencia del UID no constituye autorización: cada flujo sensible requiere políticas RLS y, cuando corresponda, backend que verifique el token Firebase.

### Regla de información

Supabase es la única autoridad para toda información dinámica y operativa, incluyendo territorio, turismo, naturaleza, patrimonio, cultura, historia, museos, música, arte, gastronomía, alojamiento, negocios, transporte, servicios útiles, emergencias verificadas, perfiles, favoritos, viajes, reservas, reseñas, verificaciones, fuentes, auditoría y conocimiento de BAQUI.

Firestore, Realtime Database, JSON, HTML, constantes JavaScript/Dart y almacenamiento local existentes son fuentes heredadas, respaldos o cachés temporales. No deben eliminarse antes de completar:

```text
IDENTIFICAR → RESPALDAR → VALIDAR → NORMALIZAR → IMPORTAR A SUPABASE
→ PROBAR → CONECTAR WEBSITE → VERIFICAR → RETIRAR DOBLE ESCRITURA
```

### Dominio y canonical

- Canonical público: `https://baqueanonicaragua.com`.
- `https://www.baqueanonicaragua.com` debe redirigir al dominio sin `www`.
- Todas las rutas internas, Open Graph, sitemap y datos estructurados deben usar el dominio canónico.
- `https://app-baqueano.web.app` debe permanecer accesible, pero nunca declarar su URL como canonical.
- Los subdominios futuros solo se crean por necesidad comprobada.

## 📦 QUÉ (What / Resultado y criterios de cumplimiento)

La arquitectura se considera aplicada cuando:

1. una alta desde Ops Center se guarda en Supabase;
2. el mismo registro aparece en Website, mapa, búsqueda, departamento, municipio, BAQUI, Mi Viaje y experiencias según corresponda;
3. ninguna edición de contenido exige modificar múltiples archivos HTML;
4. Firebase responde quién es el usuario y Supabase conserva su información;
5. Firestore deja de ser autoridad paralela del catálogo;
6. favoritos, viajes y reservas se sincronizan entre dispositivos;
7. la información sensible se protege con RLS, autorización y backend;
8. emergencias solo se publican con fuente, verificación y fecha;
9. `baqueanonicaragua.com` es canonical y Firebase Hosting sigue disponible como respaldo;
10. Android continúa separado y no se modifican `ios/` ni el directorio Flutter `web/`.

## Precedencia documental

Este documento sustituye cualquier especificación anterior que declare Firestore como datastore principal, Supabase como simple respaldo, Next.js o React como requisito obligatorio de la web pública, o `app-baqueano.web.app` como dominio canónico.

Los documentos históricos se conservan como evidencia, pero deben interpretarse bajo esta arquitectura.
