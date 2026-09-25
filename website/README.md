# BAQUEANO WEBSITE

Portal web público, consola operativa y plataforma digital de Baqueano Nicaragua.

> Estado actual: Firebase Hosting publica directamente la capa estática contenida en
> `website/`. El monorepo Next.js ubicado en `website/apps/` es la arquitectura moderna
> paralela y no reemplaza automáticamente las páginas HTML publicadas.

---

## Círculo Dorado

### 🎯 POR QUÉ

BAQUEANO WEBSITE existe para conectar a viajeros, comunidades, anfitriones y personal
operativo mediante una experiencia digital centrada en Nicaragua. La plataforma reúne
destinos, patrimonio, gastronomía, música, turismo responsable, seguridad, planificación
de rutas y administración de contenido sin acoplar la interfaz web a la aplicación Android.

Sus objetivos principales son:

- Difundir destinos y experiencias territoriales de Nicaragua.
- Facilitar el contacto directo con comunidades, cooperativas y anfitriones.
- Proporcionar planificación de viajes asistida y herramientas cartográficas.
- Centralizar la operación editorial y administrativa.
- Mantener contratos de datos compatibles entre Web, Admin y Android.
- Ofrecer una experiencia accesible, adaptable y resistente a fallos de red.

### ⚙️ CÓMO

El directorio combina dos capas web:

1. **Portal estático publicado:** páginas HTML, CSS y JavaScript servidas directamente por
   Firebase Hosting. Es la experiencia disponible en `app-baqueano.web.app`.
2. **Workspace Next.js:** aplicaciones `apps/web` y `apps/admin`, junto con paquetes
   TypeScript compartidos. Representa la evolución modular de la plataforma.

Firebase y Supabase proporcionan capacidades de datos, autenticación y respaldo según el
módulo. Las Cloud Functions del repositorio raíz atienden `/api/**` y `/health`.

### 📦 QUÉ

Este workspace entrega:

- Sitio turístico público multipágina.
- Catálogo de destinos y experiencias.
- Mapa territorial y herramientas de ruta.
- Baqueano AI y el asistente contextual Baqüi.
- Registro de negocios y cooperativas.
- Perfil del explorador y control de sesión.
- Consola administrativa y operativa.
- PWA con manifiesto, service worker y página offline.
- Aplicaciones Next.js para Web y Admin.
- Contratos, validadores y servicios reutilizables.
- Pruebas de humo y auditoría visual responsiva.

---

## Arquitectura general

```text
Viajeros y comunidades
          │
          ▼
Firebase Hosting ──► HTML + CSS + JavaScript de website/
          │
          ├──► /api/**  ──► Cloud Functions
          ├──► /health  ──► healthCheck
          ├──► Firebase Auth / Firestore / Storage
          └──► Servicios públicos permitidos por CSP

Workspace moderno
website/apps/web   ─┐
website/apps/admin ─┼──► website/packages/* ──► contratos compartidos
                    └──► Firebase / APIs

Android
lib/ + android/ ─────────► Firestore y contratos compatibles
```

## Dos capas que no deben confundirse

| Capa | Ubicación | Tecnología | Uso actual |
|---|---|---|---|
| Portal estático | `website/*.html`, `website/css`, `website/js` | HTML, CSS y JavaScript | Publicado por Firebase Hosting |
| Web moderna | `website/apps/web` | Next.js, React y TypeScript | Desarrollo modular, puerto 3000 |
| Admin moderno | `website/apps/admin` | Next.js, React y TypeScript | Desarrollo operativo, puerto 3001 |
| Paquetes comunes | `website/packages` | TypeScript | Tipos, UI, configuración y servicios |

Modificar una página de `apps/web` no modifica automáticamente `index.html`. Mientras
Firebase tenga `"public": "website"`, el despliegue público utiliza los archivos estáticos.

---

## Estructura del directorio

```text
website/
├── apps/
│   ├── web/                 # Aplicación pública Next.js
│   └── admin/               # Consola Next.js
├── packages/
│   ├── ai-core/             # Proveedores y núcleo de IA
│   ├── config/              # Rutas, roles y configuración compartida
│   ├── design-system/       # Tokens visuales oficiales
│   ├── firebase/            # Inicialización y acceso tipado a Firebase
│   ├── types/               # Contratos TypeScript
│   ├── ui/                  # Componentes React reutilizables
│   └── validators/          # Esquemas defensivos Zod
├── assets/                  # Imágenes, video, audio, íconos y datos estáticos
├── css/                     # Estilos base, componentes y páginas
│   └── pages/               # Ajustes específicos por página
├── js/                      # Módulos del portal estático
├── docs/                    # Arquitectura, seguridad, operaciones y gobierno
├── scripts/                 # Pruebas y auditorías automatizadas
├── tests/                   # Recursos de pruebas de interfaz
├── index.html               # Portada y referencia visual pública
├── admin.html               # Consola operativa estática
├── styles.css               # Hoja global del portal estático
├── service-worker.js        # Caché y experiencia offline
├── manifest.json            # Configuración PWA
├── sitemap.xml              # Descubrimiento para buscadores
├── robots.txt               # Directivas de indexación
├── package.json             # Scripts del workspace pnpm
└── pnpm-workspace.yaml      # Registro de apps y paquetes
```

No deben versionarse como fuentes los resultados locales de `.next/`, `node_modules/`,
logs, capturas temporales o reportes generados.

---

## Páginas del portal estático

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Portada, navegación principal y entrada al ecosistema |
| `destinos.html` | Catálogo, filtros, favoritos, mapas y destinos |
| `departamento.html` | Exploración territorial por departamento |
| `gastronomia.html` | Gastronomía, platillos y experiencias culinarias |
| `historia.html` | Línea histórica y patrimonio nacional |
| `musica.html` | Patrimonio sonoro y reproducción musical |
| `ambiental.html` | Turismo responsable, ambiente y compromisos verdes |
| `aliados.html` | Cooperativas, negocios y servicios aliados |
| `mi-negocio.html` | Postulación y registro de negocios |
| `nosotros.html` | Identidad, misión y comunidad Baqueano |
| `baqueano-ai.html` | Planificador conversacional de viajes |
| `perfil.html` | Perfil, preferencias, favoritos y actividad del usuario |
| `admin.html` | Centro de operaciones con acceso restringido |
| `denuncias.html` | Canal ético y ambiental |
| `terminos.html` | Términos y condiciones |
| `privacidad.html` | Política de privacidad |
| `cookies.html` | Política de cookies |
| `aviso-legal.html` | Aviso legal institucional |
| `404.html` | Recuperación de rutas inexistentes |
| `offline.html` | Respaldo visual sin conexión |

---

## Sistema visual

La paleta oficial es:

| Token | Color | Uso principal |
|---|---|---|
| Petróleo | `#165D6F` | Identidad territorial y superficies activas |
| Terracota | `#F65E01` | Acciones, estados destacados y acentos |
| Arena | `#F4E6C1` | Contraste cálido, títulos y detalles |
| Tinta | `#0F172A` | Fondos, paneles y profundidad |

Archivos principales:

- `styles.css`: estilos globales y compatibilidad histórica.
- `css/colors.css`: variables cromáticas.
- `css/typography.css`: tipografía y escalas.
- `css/layout.css`: contenedores, menú y estructura adaptable.
- `css/components.css`: componentes compartidos.
- `css/modules.css`: módulos funcionales.
- `css/pages/*.css`: estilos exclusivos de cada vista.
- `css/theme-switcher.css`: selector de temas.

### Menú y footer canónicos

`index.html` define la referencia visual institucional. En ejecución,
`js/navigation.js` normaliza el footer de todas las páginas mediante
`normalizeInstitutionalFooter()` y activa los componentes compartidos del menú.

Reglas obligatorias:

- No crear versiones aisladas del menú o footer en una página individual.
- Toda modificación global debe realizarse en el sistema compartido.
- La opción activa puede cambiar según la ruta; la estructura no.
- Al cambiar CSS o JavaScript compartido, actualizar su parámetro de versión para evitar
  recursos obsoletos almacenados por el navegador o service worker.
- Verificar escritorio, tablet y móvil después de cada cambio estructural.

---

## JavaScript del portal

### Núcleo compartido

| Archivo | Función |
|---|---|
| `navigation.js` | Menú, footer canónico, sesión, modales, PWA y carga global |
| `user-session.js` | Autenticación, roles, perfil y adaptación de navegación |
| `firebase-config.js` | Inicialización del cliente Firebase |
| `supabase-config.js` | Configuración de respaldo Supabase |
| `firestore-realtime.js` | Sincronización reactiva con Firestore |
| `public-cms-sync.js` | Aplicación del contenido publicado desde administración |
| `theme-switcher.js` | Temas y preferencias visuales |

### Turismo y territorio

| Archivo | Función |
|---|---|
| `baqueano-map.js` | Mapa de destinos y filtrado territorial |
| `nicaragua-real-map.js` | Representación geográfica nacional |
| `baqueano-3d-map.js` | Experiencia cartográfica tridimensional |
| `territories-data.js` | Datos territoriales reutilizables |
| `territory-inspector.js` | Consulta y presentación de territorio |
| `route-builder.js` | Construcción de rutas e itinerarios |
| `destinos-gastronomia.js` | Filtros, favoritos y acciones de catálogo |
| `tourism-catalog-expansion.js` | Ampliación controlada del catálogo |

### Inteligencia y asistente

| Archivo | Función |
|---|---|
| `baqueano-ai.js` | Interfaz y solicitudes del planificador |
| `baqueano-assistant.js` | Mascota Baqüi, drawer, voz, clima y acciones |
| `ai-assistant.js` | Compatibilidad con experiencias anteriores de IA |

Baqüi ofrece apertura, cierre, minimización, restauración, dictado, voz opcional,
sugerencias contextuales y estado real del servicio. No debe reproducir audio sin permiso.

### Multimedia y experiencias

- `audio-player.js`, `epic-music-player.js` y `persistent-audio-player.js` gestionan audio.
- `video-registry.js` registra videos y pósteres.
- `panorama-viewer.js` maneja contenido panorámico.
- `baqueano-reels.js` construye experiencias audiovisuales verticales.
- Los módulos territoriales específicos complementan experiencias departamentales.

---

## Workspace Next.js

### Aplicación pública

- Paquete: `@baqueano/web`
- Directorio: `apps/web`
- Puerto local: `3000`
- Responsabilidad: experiencia pública React/Next.js y rutas API públicas.

### Aplicación administrativa

- Paquete: `@baqueano/admin`
- Directorio: `apps/admin`
- Puerto local: `3001`
- Responsabilidad: gobierno, operación, contenido, confianza y supervisión.

### Paquetes compartidos

- `@baqueano/ai-core`: selección de proveedores y capacidades de IA.
- `@baqueano/config`: configuración, roles, catálogos y políticas.
- `@baqueano/design-system`: colores, espaciado, movimiento y tipografía.
- `@baqueano/firebase`: acceso común a Firebase.
- `@baqueano/types`: contratos compatibles entre aplicaciones.
- `@baqueano/ui`: primitivas React reutilizables.
- `@baqueano/validators`: validación de entrada con Zod.

El flujo de dependencias debe ir desde las aplicaciones hacia los paquetes. Los paquetes no
deben importar código específico de una aplicación.

---

## Instalación local

### Requisitos

- Node.js 20 o compatible con el proyecto.
- Corepack habilitado.
- pnpm `9.15.4`.
- Firebase CLI para emulación y despliegue.

### Preparación

Desde `website/`:

```bash
corepack enable
corepack pnpm install
```

### Ejecutar aplicaciones modernas

```bash
# Web pública: http://localhost:3000
corepack pnpm dev:web

# Admin: http://localhost:3001
corepack pnpm dev:admin
```

### Visualizar el portal estático

Desde la raíz del repositorio:

```bash
firebase emulators:start --only hosting,functions,auth,firestore,storage
```

Firebase Hosting queda disponible normalmente en `http://127.0.0.1:5000` y la interfaz de
emuladores en `http://127.0.0.1:4000`.

---

## Variables de entorno

Copiar `.env.example` a los archivos locales apropiados y completar valores autorizados.

Variables públicas documentadas:

```text
NEXT_PUBLIC_BAQUEANO_ENV
NEXT_PUBLIC_BAQUEANO_VERSION
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_ADMIN_URL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Variables privadas de servidor:

```text
BAQUEANO_TRIP_PASS_SIGNING_KEY
BAQUEANO_INTERNAL_API_KEY
```

Normas:

- No confirmar secretos, llaves privadas ni credenciales administrativas.
- Las variables `NEXT_PUBLIC_*` terminan en el navegador y no pueden contener secretos.
- Las llaves de firma y API internas solo pertenecen al entorno del servidor.
- `js/local-keys.js` está excluido del despliegue y no debe usarse como fuente productiva.

---

## Comandos de calidad

Ejecutar desde `website/`:

```bash
# Validación de invariantes de producción
corepack pnpm test

# Tipos de ambas aplicaciones
corepack pnpm typecheck

# Reglas de código
corepack pnpm lint

# Construcción completa
corepack pnpm build

# Construcciones individuales
corepack pnpm build:web
corepack pnpm build:admin
```

### Auditoría visual

Con Web y Admin ejecutándose en los puertos 3000 y 3001:

```bash
corepack pnpm audit:visual
```

La auditoría usa Playwright y revisa múltiples anchos entre 320 y 2560 píxeles. Detecta:

- Respuestas HTTP fallidas.
- Desbordamiento horizontal.
- Errores de consola y página.
- Diferencias observables mediante capturas.

Los resultados se generan en `docs/visual-audit/`.

---

## PWA y funcionamiento offline

- `manifest.json` registra identidad, iconos y modo de visualización.
- `service-worker.js` controla recursos almacenados y recuperación sin conexión.
- `offline.html` proporciona una salida comprensible cuando la red falla.
- Los cambios de recursos compartidos deben acompañarse de una nueva versión de caché.
- No almacenar respuestas privadas, credenciales ni información sensible en cachés públicas.

---

## Firebase y despliegue

El proyecto Firebase predeterminado es `app-baqueano` y el sitio Hosting es
`app-baqueano`. La configuración se encuentra en `firebase.json` y `.firebaserc`.

Firebase Hosting:

- Publica `website/`.
- Ignora documentación, fuentes del monorepo, dependencias, logs y archivos locales.
- Reescribe `/api/**` hacia la función `api`.
- Reescribe `/health` hacia `healthCheck`.
- Aplica encabezados de seguridad y políticas de caché.
- Marca `admin.html` como `noindex, nofollow`.

Antes de desplegar:

```bash
cd website
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
cd ..
firebase deploy --only hosting,functions
```

No desplegar si hay errores de análisis, pruebas, compilación, CSP o rutas críticas.

---

## Seguridad

La seguridad no depende únicamente de ocultar botones en la interfaz.

- Autorización y roles deben validarse en backend y reglas de Firebase.
- El cliente nunca debe decidir por sí solo si una operación administrativa está permitida.
- Los datos introducidos por usuarios deben validarse y escaparse antes de renderizarse.
- Los enlaces externos deben utilizar `rel="noopener noreferrer"` cuando corresponda.
- Geolocalización, voz y notificaciones requieren consentimiento explícito.
- La consola administrativa no debe indexarse.
- CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy` se configuran
  desde Firebase Hosting.
- Revisar `docs/security.md`, `docs/SECURITY_MODEL.md` y `docs/RBAC_MATRIX.md` antes de
  modificar autenticación, permisos o flujos sensibles.

---

## Datos y contratos

La dirección general de datos es:

```text
Admin ──► Firestore ──► Web
                    └──► Android
```

Reglas de integración:

- Usar identificadores estables.
- Evitar duplicar manualmente registros productivos.
- Validar documentos con esquemas compartidos.
- Conservar compatibilidad hacia atrás al cambiar campos consumidos por Android.
- Separar contenido publicado, borradores y operaciones administrativas.
- Documentar migraciones y cambios de contrato.

Referencias principales:

- `docs/architecture.md`
- `docs/FIRESTORE_CONTRACTS.md`
- `docs/DATA_CATALOG.md`
- `docs/API_REFERENCE.md`
- `docs/ANDROID_WEB_COMPATIBILITY_MATRIX.md`

---

## Protección de la aplicación Android

El trabajo exclusivo del sitio web no autoriza cambios en:

```text
/lib
/android
/test
/pubspec.yaml
```

La comunicación entre Android, Website y Admin debe realizarse mediante Firestore, APIs o
contratos compatibles. Los directorios `ios/` y `web/` de Flutter tampoco forman parte de
esta capa de trabajo.

---

## Convenciones de desarrollo

- Todo archivo nuevo o modificado debe explicar **POR QUÉ**, **CÓMO** y **QUÉ**.
- Utilizar la paleta oficial y los tokens existentes.
- Evitar trabajo pesado síncrono en el hilo principal del navegador.
- Cargar imágenes con dimensiones adecuadas y formatos eficientes.
- Mantener navegación por teclado, foco visible, etiquetas ARIA y contraste suficiente.
- No crear componentes globales duplicados.
- Mantener defensas `try/catch` alrededor de red, almacenamiento y proveedores externos.
- Respetar `prefers-reduced-motion` en animaciones.
- Validar valores nulos, números no finitos y respuestas incompletas.
- No modificar archivos generados en `.next/` o `node_modules/`.

---

## Flujo recomendado para cambios

1. Identificar si el cambio pertenece al portal estático o al workspace Next.js.
2. Revisar contratos y consumidores relacionados.
3. Implementar con encabezado de Círculo Dorado.
4. Probar interacción, teclado y anchos responsivos.
5. Ejecutar pruebas, tipos, lint y build según el alcance.
6. Revisar que no se hayan añadido secretos ni artefactos generados.
7. Actualizar documentación y versión de caché si cambia el shell compartido.
8. Desplegar primero en un entorno controlado y verificar rutas críticas.

---

## Resolución rápida de problemas

### El cambio no aparece en Firebase

- Confirmar que se modificó la capa estática y no solamente `apps/web`.
- Revisar el parámetro de versión de CSS o JavaScript.
- Actualizar el service worker o limpiar sus cachés.
- Verificar que el archivo no esté en la lista `ignore` de Firebase Hosting.

### Menú o footer diferente entre páginas

- Confirmar que la página carga `js/navigation.js`.
- No mantener una variante local del componente.
- Revisar `normalizeInstitutionalFooter()` y los estilos globales.
- Comprobar errores de JavaScript antes de la inicialización del shell.

### Baqüi no aparece

- Confirmar que la ruta no está excluida por seguridad.
- Revisar la carga de `baqueano-assistant.js` y su CSS.
- Verificar si fue minimizado o pospuesto durante la sesión.
- Consultar la consola y el endpoint `/health`.

### Fallan Firebase o los datos en tiempo real

- Verificar variables de entorno y proyecto activo.
- Revisar reglas, índices y permisos del usuario.
- Probar con emuladores antes de tocar producción.
- No reemplazar errores reales con datos inventados.

---

## Documentación adicional

El directorio `docs/` contiene documentación especializada sobre:

- Arquitectura y flujos de datos.
- Seguridad, privacidad, RBAC y respuesta a incidentes.
- Operaciones, despliegue, continuidad y recuperación.
- IA, agentes, herramientas, evaluación y control humano.
- GIS, mapas, datos espaciales y privacidad geográfica.
- Confianza, sostenibilidad y turismo responsable.
- Rendimiento, capacidad, costos y observabilidad.
- Modelos predictivos, simulaciones y gobierno de datos.

Consultar primero el documento más cercano al módulo que se modificará y mantenerlo
sincronizado con la implementación real.

---

## Propiedad y mantenimiento

BAQUEANO WEBSITE debe mantenerse como una plataforma coherente: una navegación, un footer,
una identidad visual y contratos de datos compartidos. Las mejoras locales no deben romper
la experiencia global ni crear divergencias entre el portal público, la consola y Android.
