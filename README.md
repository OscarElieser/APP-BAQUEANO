# 🌋 BAQUEANO NICARAGUA

> **Arquitectura oficial (única vigente):** [`docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md`](docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md).
> **Hostinger** (DNS) → **Azure VM** (Nginx + Website + API) · **Firebase** (Authentication + Hosting de respaldo) · **Supabase PostgreSQL** = **base de datos principal** (RLS, PostGIS, pgvector; escritura administrativa vía Edge Functions con RBAC y auditoría) · Firestore solo como origen heredado de Android, replicado en Supabase hasta su migración. Roles: [`docs/security/ROLES_Y_PERMISOS.md`](docs/security/ROLES_Y_PERMISOS.md).

## Plataforma Tecnológica para Turismo Sostenible, Conservación y Bienestar Comunitario

[![Flutter Version](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart Version](https://img.shields.io/badge/Dart-3.7+-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![Performance](https://img.shields.io/badge/Performance-120%20FPS%20GPU-00C853?style=for-the-badge&logo=android&logoColor=white)](https://flutter.dev)
[![Firebase](https://img.shields.io/badge/Firebase-app--baqueano-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Platform](https://img.shields.io/badge/Platform-Android%20Exclusive-2E7D32?style=for-the-badge&logo=android&logoColor=white)](https://github.com/OscarElieser/APP-BAQUEANO)
[![Quality](https://img.shields.io/badge/Code%20Analysis-0%20Issues-brightgreen?style=for-the-badge&logo=dart)](https://dart.dev)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)

> **«BAQUEANO NO EXISTE PARA LLEVAR MÁS TURISTAS A LOS MISMOS LUGARES.  
> EXISTE PARA AYUDAR A TRANSFORMAR EL TURISMO EN UNA ACTIVIDAD MÁS RESPONSABLE, DISTRIBUIDA, SEGURA, CULTURALMENTE CONSCIENTE Y BENEFICIOSA PARA LAS COMUNIDADES LOCALES.»**

---

## 🧭 Tabla de Contenidos

- [🎯 Propósito Central & Solución al Reto Sostenible](#-propósito-central--solución-al-reto-sostenible)
- [📱 Alcance Actual: Exclusividad Android Móvil](#-alcance-actual-exclusividad-android-móvil)
- [🌿 Campaña Ambiental & Denuncias Ciudadanas en Territorio](#-campaña-ambiental--denuncias-ciudadanas-en-territorio)
- [🏛️ Módulo Insignia: Historia de mi País (Nicaragua)](#️-módulo-insignia-historia-de-mi-país-nicaragua)
- [🔗 Conexión Territorial Cruzada (Cultura ↔ Destino ↔ Baqueano)](#-conexión-territorial-cruzada-cultura--destino--baqueano)
- [✨ Características Principales](#-características-principales)
- [⚡ Arquitectura de Rendimiento & Auditoría Senior Continua (60-120 FPS)](#-arquitectura-de-rendimiento--auditoría-senior-continua-60-120-fps)
- [📱 Persistencia de Estado & Ciclo de Vida Nativo Android](#-persistencia-de-estado--ciclo-de-vida-nativo-android)
- [🎨 Sistema de Diseño & Tokens Visuales](#-sistema-de-diseño--tokens-visuales)
- [🗄️ Arquitectura de Base de Datos, Normas de Seguridad (PCI-DSS, RBAC, PII) & Offline-First](#️-arquitectura-de-base-de-datos-normas-de-seguridad-pci-dss-rbac-pii--offline-first)
- [🚨 Centro de Auxilio & Emergencias SOS en Sendero](#-centro-de-auxilio--emergencias-sos-en-sendero)
- [🏪 Vitrina de Negocios Campesinos, Publicidad & Comercio Justo](#-vitrina-de-negocios-campesinos-publicidad--comercio-justo)
- [🗺️ Mapa GPS Satelital & Geolocalización de Rutas](#️-mapa-gps-satelital--geolocalización-de-rutas)
- [🤖 Asistente IA para Turismo Responsable](#-asistente-ia-para-turismo-responsable)
- [🎫 Pasaporte del Explorador & Gamificación Ética](#-pasaporte-del-explorador--gamificación-ética)
- [💳 Motor Financiero Bimoneda & Régimen Fiscal](#-motor-financiero-bimoneda--régimen-fiscal)
- [🛡️ Sistema de Respaldo & Restauración de Versiones](#-sistema-de-respaldo--restauración-de-versiones)
- [🚀 Instalación y Despliegue en Android](#-instalación-y-despliegue-en-android)
- [☁️ Despliegue Web en Azure](#-despliegue-web-en-azure)
- [📄 Licencia & Créditos](#-licencia--créditos)

---

## 🎯 Propósito Central & Solución al Reto Sostenible

BAQUEANO no es una aplicación turística genérica. Cada componente responde directamente al reto:

> **«Impulso del turismo para la conservación del entorno y el bienestar de las comunidades locales.»**

### Cadena de Impacto Obligatoria:
$$\text{PROBLEMA} \rightarrow \text{NECESIDAD} \rightarrow \text{SOLUCIÓN BAQUEANO} \rightarrow \text{FUNCIONALIDAD} \rightarrow \text{USUARIO} \rightarrow \text{COMUNIDAD} \rightarrow \text{IMPACTO} \rightarrow \text{INDICADOR}$$

1. **Desconcentración Turística:** Se priorizan destinos rurales, cumbres y reservas biológicas menos saturadas en lugar de canalizar flujos hacia los mismos circuitos masivos.
2. **Educación Ambiental Activa:** Fichas de dificultad técnica, avisos de conservación, recolección de basura y respeto estricto a fuentes hídricas y fauna nativa.
3. **Protagonismo del Baqueano Campesino:** El baqueano nativo es el corazón de la experiencia; sus anécdotas, conocimientos de montaña y contacto directo encabezan la plataforma.
4. **Comercio Justo y Desintermediación:** Se transparentan los costos para que el **85% al 90%** del valor beneficie de forma directa a la familia anfitriona rural.
5. **Preservación de la Memoria Colectiva:** La cultura, la gastronomía y la historia son la puerta de entrada para que el visitante comprenda el territorio antes de recorrerlo.

---

## 📱 Alcance Actual: Exclusividad Android Móvil

El desarrollo de BAQUEANO está dirigido **únicamente y con exclusividad a la aplicación móvil Android (`lib/` y `android/`)**.

```text
BAQUEANO
   │
   └── 📱 APP ANDROID (Exclusiva)
          │
          ├── Flutter / Dart (Optimizado para 60-120 FPS)
          ├── Firebase (Auth, Firestore, Storage)
          ├── Google Maps & Geolocalización de campo
          ├── Asistente IA para Turismo Responsable
          ├── Reservas Directas y Comercio Campesino
          ├── Pasaporte Baqueano y Gamificación Ética
          ├── Historia Viva, 17 Territorios y Cultura de Nicaragua
          ├── Red de Comunidad y Mensajería con Baqueanos
          ├── Protocolo de Emergencias y Rescate SOS
          └── Impacto y Conservación Sostenible
```

*Cero distracciones con versiones web públicas, iOS o paneles de administración. Los recursos existentes se conservan congelados mientras el foco técnico total reside en la experiencia móvil Android.*

---

## 🌿 Campaña Ambiental & Denuncias Ciudadanas en Territorio

Ubicado en `/campana-ambiental`, este módulo constituye el brazo operativo y ético de Baqueano para sensibilizar al turista y proteger los recursos naturales de Nicaragua:

- **Canal Institucional de Denuncias Ambientales**:
  - **Correo Oficial**: `denuncias.ambientales@baqueano.ni` con plantilla estructurada para recepción de evidencias (fotografías, videos, audios y coordenadas GPS).
  - **Línea de WhatsApp de Emergencia Verde**: `+505 8443-1289` para canalización ágil de incidentes en tiempo real.
  - **Custodia Técnica & Elevación Formal**: Baqueano actúa como filtro técnico y escudo del turista, validando los hechos con guías locales antes de interponer la denuncia ante **MARENA**, la **Unidad Ambiental de la Alcaldía (UAM)** o la **Policía Nacional**.
- **Decálogo del Explorador Responsable**: 10 mandamientos de no dejar rastro, prohibición de fogatas desatendidas, protección de fuentes hídricas y conservación de fauna silvestre.
- **Acceso Permanente**: Acceso directo desde el encabezado del Feed, desde cada tarjeta de destino (`DestinationCard`) y en la Bitácora Comunitaria.

---

## 🏛️ Módulo Insignia: Historia de mi País (Nicaragua)

Ubicado en `/historia-mi-pais`, este módulo constituye una enciclopedia interactiva viva y de alta fidelidad:

- **Línea de Tiempo Épica (7 Periodos)**: Época Precolombina (tribus Chorotega, Nicarao, Chontales), Conquista, Colonia, Independencia (1821), Batalla de San Jacinto (1856), Guerra Nacional contra William Walker, Rubén Darío y el Modernismo, e Historia Contemporánea.
- **Explorador de los 17 Territorios**: Los 15 departamentos y 2 regiones autónomas (RACCN y RACCS) con cabeceras, población, climas, tradiciones, artesanías y curiosidades.
- **Gastronomía Ancestral del Maíz**: Gallo Pinto, Nacatamal, Vigorón, Indio Viejo, Baho, Quesillo, Cacao y Pinolillo con contexto cultural e ingredientes de la milpa.
- **Símbolos Patrios & Pueblos Originarios**: Homenaje a comunidades Miskitas, Mayangnas, Ramas, Creoles y Chorotegas; Madroño, Sacuanjoche, Guardabarranco y reservas de biosfera (Bosawás e Indio Maíz).
- **Grandes Voces & Literatura**: Tributo a Rubén Darío, Salomón de la Selva, Alfonso Cortés y poetas nacionales.
- **Arquitectura Multipaís**: Parametrizado mediante `countryId` (por defecto `nicaragua`), listo para escalar a Centroamérica.

---

## 🔗 Conexión Territorial Cruzada (Cultura ↔ Destino ↔ Baqueano)

El conocimiento cultural se enlaza de forma continua con la acción turística en territorio:

$$\text{PERSONAJE / HISTORIA} \longrightarrow \text{DESTINO RURAL} \longrightarrow \text{MAPA GPS} \longrightarrow \text{BAQUEANO CAMPESINO} \longrightarrow \text{COMERCIO LOCAL}$$

- **Desde la Pantalla de Inicio**: `🇳🇮 Historia Patria` encabeza el carrusel de categorías principales.
- **En cada Departamento**: El modal de territorio despliega la **`Conexión Territorial Baqueano`** con botones directos:
  - *Explorar Destinos del Departamento* (`/descubrir`).
  - *Contactar Baqueanos Locales* (`/mensajes`).
  - *Mapa Satelital GPS* (`/mapa`).
- **En la Gastronomía**: Cada platillo incluye accesos a **`Comedores Típicos`** y **`Mapa GPS`**.
- **En Pueblos Originarios**: Enlace directo a **`Artesanías & Cooperativas`**.
- **Tarjeta de Cierre en Historia**: Módulo especial *«Conecta la Memoria con el Territorio»* que impulsa al usuario a convertirse en un **Explorador Responsable**.

---

## ✨ Características Principales

- 📱 **Diseño Universal y Adaptativo en Android**: Optimizado para funcionar de manera estable, eficiente y fluida en **cualquier teléfono Android en general**, adaptando su rendimiento de forma inteligente según la capacidad del hardware del usuario (desde terminales accesibles y de gama media comunes en el campo hasta pantallas avanzadas y tablets), con gestión de SafeAreas dinámicas, bajo consumo de batería y navegación por gestos.
- 🔄 **Persistencia de Sesión & Ciclo de Vida Nativo Android**: Mantiene la aplicación exactamente en la última pantalla navegada al salir o minimizar mediante canal de plataforma nativo (`moveTaskToBack(true)`) y `PopScope`, reiniciando su flujo raíz únicamente cuando el usuario desliza y cierra la app desde la lista de aplicaciones recientes de Android.
- 🌿 **Campaña Ambiental & Custodia Ciudadana**: Canal de denuncias ante delitos ambientales con correo institucional, enlace a WhatsApp y decálogo verde en sendero.
- 🇳🇮 **Presencia Integral de Managua**: Capital y territorio integrado a la cabeza de departamentos, con destinos auténticos (*Reserva Natural El Chocoyero* y *Playas de Pochomil*), comercios campesinos y anfitriones oficiales.
- ⚡ **Desplazamiento Ultrafluido (60 - 120 FPS)**: Aislamiento GPU con `RepaintBoundary`, decodificación acotada de texturas y física de inercia suave (`BouncingScrollPhysics`) que elimina tirones y evita sobrecalentamiento.
- 🎵 **Patrimonio Sonoro Multimedia con Reproducción Directa a 1 Toque**: Selección inmediata de cualquier pista folclórica tradicional (Solar de Monimbó, Mora Limpia, Danza del Mestizaje) que inicia la reproducción instantáneamente al tocar la tarjeta sin navegación redundante, integración de video en YouTube y editor de URLs.
- 📐 **Diseño Ergonómico Anti-Truncamiento y Cero Desbordamientos (Overflows)**: Nombres de posadas y playas mostrados completos hasta en 2 líneas fluidas, botones de acción sin abreviaturas (`[Ver Ruta]`, `[Reservar]`), y calculadora de rentabilidad comercial blindada contra desbordamientos en pantallas compactas y medianas.
- 🚨 **Centro de Auxilio SOS 24/7**: Marcación directa (118, 128, 115, INTUR), botón SOS de WhatsApp con coordenadas GPS y respuesta háptica.
- 💬 **Mensajería Directa Dual con Anfitriones**: Coordinación de llegada por WhatsApp Oficial o Mensajería Interna de Baqueano con textos precargados, envío de ubicación GPS y adjuntos de comprobantes.
- 🤝 **Galería Manual 3D de Aliados Locales & Cooperativas**: Carrusel táctil de alto rendimiento con tarjetas interactivas de giro 3D (Flip Cards) de 180° que revelan canales directos (WhatsApp, llamada y GPS) con fincas agroecológicas, cooperativas cafetaleras y artesanos ancestrales.
- 🏪 **Vitrina de Comercios Campesinos & Publicidad**: Fichas enriquecidas de comedores rurales, posadas familiares y formulario de registro para nuevos negocios aliados.
- 🗺️ **Cartografía GPS Satelital**: Pines georreferenciados en territorio nicaragüense, capas temáticas y visualización de reservas.
- 🤖 **Baqueano AI Responsable**: Recomendación de destinos alternativos, explicación de normas ambientales y preparación física de ruta.
- 🎫 **Pasaporte Digital Gamificado**: Sellos de expedición coleccionables, puntos de compromiso ambiental y centro de accesibilidad visual y háptica.
- 💰 **Checkout Bimoneda en Tiempo Real**: Cálculo en **USD ($)** y **Córdobas (C$ NIO)** a tasa oficial `C$ 36.65`, con régimen fiscal de la Ley 306.

---

## ⚡ Arquitectura de Rendimiento & Auditoría Senior Continua (60-120 FPS)

```text
[Feed Vertical Principal] ──────── (Desplazamiento Fluido y Eficiente)
        │
        ├── [RepaintBoundary] ──► Galería Manual 3D de Aliados & Cooperativas (Capa GPU aislada)
        ├── [RepaintBoundary] ──► Carrusel de Categorías Rápidas (Capa GPU aislada)
        ├── [RepaintBoundary] ──► Galería de Destinos Populares (Capa GPU aislada)
        ├── [RepaintBoundary] ──► Vitrina de Negocios Rurales (Capa GPU aislada)
        ├── [RepaintBoundary] ──► Publicidad de Negocios Campesinos (Capa GPU aislada)
        ├── [RepaintBoundary] ──► Testimonios Verificados (Capa GPU aislada)
        └── [RepaintBoundary] ──► 4 Pilares del Estándar Baqueano (Capa GPU aislada)
```

### Protocolo de Prevención de ANRs y Crashes:
1. **Límites de Decodificación de Memoria (`cacheWidth` / `cacheHeight`)**:
   - En [baqueano_adaptive_image.dart](file:///c:/Users/PC%201/APP%20BAQUEANO/lib/core/widgets/baqueano_adaptive_image.dart), se acota la resolución física de decodificación al Device Pixel Ratio (DPR), reduciendo el peso de texturas en RAM en más de un **92%** (evitando `OutOfMemoryError` en Android).
2. **Aislamiento de Capas Gráficas con `RepaintBoundary`**:
   - Cada tarjeta de catálogo y carrusel opera en su propia textura de composición, erradicando la propagación de invalidaciones al Main UI Thread.
3. **Ciclo de Vida Limpio (`didUpdateWidget` & `ValueKey`)**:
   - En listas y cuadrículas dinámicas se asocian llaves estables por ID y se reconcilian estados reactivos (`_isFavorite`) evitando fugas de memoria o estados fantasma.
4. **Blindaje Defensivo contra Excepciones**:
   - Todos los disparadores de navegación y modales están envueltos en bloques `try/catch` con validación de contexto `mounted` y aritmética segura.
- **Aislamiento GPU (`RepaintBoundary`)**: Cada lista horizontal posee su propia textura en memoria gráfica; las tarjetas se animan sin invalidar el árbol vertical.
- **Cero Bucles en Segundo Plano**: Desplazamiento reactivo táctil sin timers de auto-scroll artificiales que degraden el rendimiento.
- **Física Nativa de Inercia**: `BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics())`.

---

## 📱 Persistencia de Estado & Ciclo de Vida Nativo Android

Para asegurar que el explorador nunca pierda su contexto de navegación, filtros de búsqueda o formulario de reserva al salir momentáneamente de la aplicación en senderos o áreas de campo:

1. **Retención de Tarea en Segundo Plano (`moveTaskToBack`)**:
   - Se implementó un canal de plataforma nativo (`MethodChannel com.company.appbaqueano/lifecycle`) en `MainActivity.kt` invocando `activity?.moveTaskToBack(true)`.
   - Enlazado con `PopScope(canPop: false, onPopInvokedWithResult: ...)` en `ResponsiveScaffold`, cuando el usuario pulsa el botón o gesto de retroceso en la pantalla raíz, la aplicación se envía a segundo plano de forma nativa sin destruirse.
2. **Eliminación de `taskAffinity` Huérfano**:
   - En `AndroidManifest.xml`, se erradicó la propiedad `android:taskAffinity=""` de la `MainActivity`, permitiendo que el gestor de tareas del sistema operativo Android preserve el árbol de actividades completo en la pila de aplicaciones recientes.
3. **Ciclo de Vida Restaurable**:
   - La aplicación preserva su estado y pantalla actual de forma continua. Únicamente se reinicia desde cero si el usuario desliza y elimina la aplicación de la vista de multitarea de Android (Clear All / Swipe to dismiss), garantizando una experiencia nativa fluida.

---

## 🎨 Sistema de Diseño & Tokens Visuales

Inspirado en los lagos, volcanes, la cerámica de San Juan de Oriente y la tierra pinolera:

| Token | Nombre | Código Hex | Uso en la Aplicación |
| :--- | :--- | :--- | :--- |
| **Primary** | Petróleo Teal | `#165D6F` | Barras de navegación, encabezados, app bars y superficies de alto rango |
| **Accent / CTA** | Naranja Terracota Fuego | `#F65E01` | Botones de acción principal (CTA), indicadores activos y acentos volcánicos |
| **Secondary** | Crema Arena Pinolera | `#F4E6C1` | Badges de honor, fondos suaves, bordes cálidos y contrastes nobles |
| **Dark Surface** | Noche Profunda | `#0F172A` | Fondos de pantalla, tarjetas elevadas y contenedores Glassmorphism |
| **Jungle Green** | Verde Selva | `#10B981` | Distintivos de sostenibilidad, badges ecológicos y comercios comunitarios |
| **Crimson SOS** | Rojo Alerta SOS | `#EF4444` | Centro de asistencia, botones de pánico y emergencias en sendero |

### Gradientes Oficiales (`AppGradients`):
- **`sunsetTerracotta`**: Fusión cálida entre Terracota Fuego (`#F65E01`) y Petróleo Teal (`#165D6F`) para tarjetas y banners.
- **`volcanicHero`**: Profundidad nocturna entre Petróleo Teal (`#165D6F`) y Noche Profunda (`#0F172A`) para cabeceras épicas.
- **`cardGlass`**: Efectos Glassmorphism con transparencias dinámicas calculadas mediante `.withValues(alpha: X)`.

> [!IMPORTANT]
> Se prohíbe terminantemente el uso del deprecado `.withOpacity()`; todo el código emplea rigurosamente `.withValues(alpha: X)` para garantizar cero advertencias y máxima precisión cromática.

---

## 🗄️ Arquitectura de Base de Datos, Normas de Seguridad (PCI-DSS, RBAC, PII) & Offline-First

La base de datos de **BAQUEANO** sigue la [arquitectura oficial](docs/architecture/ARQUITECTURA_OFICIAL_BAQUEANO.md): **Supabase PostgreSQL** es la base de datos principal (sitio web, Ops Center, comunidad, BAQUI y API de Azure); la app Android todavía usa **Cloud Firestore** como origen heredado, que `baqueano-mirror` replica en Supabase hasta completar su migración. En Android, Firestore se combina con almacenamiento persistente local y empaquetado de arranque, permitiendo operación ininterrumpida en cumbres volcánicas y selvas de Nicaragua sin cobertura móvil.

```text
       ┌──────────────────────────────────────────────────────────────────┐
       │                     ACCIONES DEL EXPLORADOR                      │
       │       (Explorar lugares, ver mapas, cotizar planes, SOS)        │
       └──────────────────────────────┬───────────────────────────────────┘
                                      ▼
       ┌──────────────────────────────────────────────────────────────────┐
       │             CAPA 1: ESTADO REACTIVO EN MEMORIA                   │
       │     (Riverpod Providers / StateNotifier / Cero Bloqueo UI)       │
       └──────────────────────────────┬───────────────────────────────────┘
                                      ▼
       ┌──────────────────────────────────────────────────────────────────┐
       │             CAPA 2: CACHÉ LOCAL PERSISTENTE & ASSETS             │
       │  • Bootstrap local inmediato: assets/data/*.json                 │
       │  • SharedPreferences & Firestore Local Cache (Cero Pantallas     │
       │    en blanco y carga en <50ms sin conexión 4G)                  │
       └──────────────────────────────┬───────────────────────────────────┘
                                      ▼ (Sincronización en segundo plano)
       ┌──────────────────────────────────────────────────────────────────┐
       │             CAPA 3: CLOUD FIRESTORE (appbaqueano)                │
       │  • Multibase de datos dedicada: databaseId 'appbaqueano'         │
       │  • Sincronización atómica con reglas declarativas                │
       │  • Cero bloqueo de hilos de interfaz (Prevención de ANR)         │
       └──────────────────────────────────────────────────────────────────┘
```

---

### 🛡️ Normas y Estándares Internacionales que Rigen la Base de Datos

La gestión de datos en BAQUEANO se adhiere a cinco marcos normativos de seguridad, privacidad y resiliencia:

#### 1. Norma PCI-DSS (Payment Card Industry Data Security Standard — Requisito 3)
- **Principio de Cero Almacenamiento de Datos Sensibles**: Queda terminantemente prohibido almacenar en Firestore, caché local o registros de la aplicación números completos de tarjetas (PAN), códigos de seguridad (CVV/CVC), fechas de vencimiento completas o PINs bancarios.
- **Tokenización Delegada Oficial**: Los pagos se procesan exclusivamente a través de las pasarelas seguras oficiales de las entidades bancarias adquirentes (CyberSource para BANPRO, Compra Click para BAC Credomatic, Botón Oficial para Banco LAFISE).
- **Enmascaramiento y Auditoría Mínima**: Únicamente se conservan los últimos 4 dígitos (`last4`), la franquicia (`brand`), el identificador de orden (`orderId`), la referencia de autorización bancaria (`authorizationRef`) y la entidad de liquidación (`settlementBank`).

#### 2. Norma RBAC (Role-Based Access Control) & Mínimo Privilegio (PoLP)
- **Control de Acceso Declarativo (`firestore.rules`)**:
  - **Superadmin & Admin**: Capacidad de auditoría completa, gestión de catálogo y validación de comercios.
  - **Host / Aliado Comercial**: Edición restringida a su propia ficha comercial verificada.
  - **Explorador / Turista**: Lectura pública de lugares y servicios publicados (`status == 'published'`); escritura restringida únicamente a sus propios marcadores guardados (`userId == request.auth.uid`).
- **Aislamiento por Usuario**: Ningún usuario no autenticado puede consultar o mutar registros privados ajenos.

#### 3. Norma de Resiliencia Offline-First & Continuidad Operativa (Graceful Degradation)
- **Operación sin Conexión en Senderos**: En zonas remotas sin señal celular, la base de datos conmuta automáticamente al catálogo precargado en JSON (`initial_places.json`, `departments.json`, `municipalities.json`, `categories.json`).
- **Arranque en Frío Ultrarrápido**: La aplicación renderiza en menos de 50ms a 60 FPS sin esperar respuestas de red, erradicando pantallas congeladas o bloqueos del hilo principal.

#### 4. Norma de Protección de Datos Personales (PII — Personally Identifiable Information)
- **Custodia de Identidad**: Nombres, correos electrónicos y teléfonos de contacto de los exploradores residen bajo `/users/{userId}` con reglas de lectura que exigen coincidencia de token de autenticación.
- **Transparencia Campesina**: Los contactos de anfitriones y cooperativas que figuran en `/businesses` y `/places` son de naturaleza comercial pública aprobada por las familias baqueanas para enlace directo sin intermediarios.

#### 5. Norma de Auditoría y Trazabilidad Inmutable (Audit Trail & Idempotencia)
- **Colección Inmutable `audit_logs`**: Todo evento crítico del sistema (afiliación comercial, creación de orden de pago, actualización de estado) queda sellado de forma permanente.
- **Bloqueo de Edición Histórica**: Regla `allow update, delete: if false;` que impide la alteración o supresión de registros de auditoría contable.

---

### 🗃️ Matriz de Colecciones en Cloud Firestore

| Colección | Propósito y Contenido | Regla de Acceso (`firestore.rules`) |
| :--- | :--- | :--- |
| **`places`** | Catálogo oficial del Directorio Nacional de Nicaragua (establecimientos, puntos de interés, servicios de emergencia 24/7 y geolocalización). | Lectura pública para `published`. Escritura exclusiva para administradores (`admin` / `super_admin`). |
| **`categories`** | Taxonomía de clasificación nacional (Cultura, Comercio, Entretenimiento, Salud, Emergencias, Transporte). | Lectura pública. Escritura restringida a administradores. |
| **`departments`** & **`municipalities`** | División político-territorial oficial de los 15 departamentos y 2 regiones autónomas de Nicaragua. | Lectura pública. Escritura restringida a administradores. |
| **`payment_orders`** | Órdenes de pago formales para planes de negocio (`Semilla Rural`, `Aliado Verificado`, `Alianza Destacada`). | Creación y lectura autenticada del titular (`request.auth != null`). |
| **`payment_transactions`** | Bitácora de transacciones bancarias procesadas con tokens de pasarela y enmascaramiento PCI-DSS (`last4`, `brand`, `bank`). | Lectura y auditoría exclusiva para usuarios autenticados y administradores. |
| **`business_subscriptions`** | Estado de vigencia, renovaciones y condiciones comerciales de negocios verificados. | Lectura pública de sellos vigentes. Escritura administrativa. |
| **`businesses`** | Fichas comerciales detalladas de eco-lodges, guías comunitarios y restaurantes locales. | Lectura pública para negocios activos. Edición por propietario autenticado o administradores. |
| **`users`** | Perfiles de exploradores, pasaporte de sellos y puntos de experiencia XP. | Lectura pública de perfil comunitario. Edición exclusiva del propietario (`uid == userId`). |
| **`user_saved_places`** | Lugares y servicios guardados como favoritos por cada usuario. | Lectura y escritura estricta del propietario (`userId == request.auth.uid`). |
| **`audit_logs`** | Registro histórico inmutable de eventos fiscales, de seguridad y cambios de rol. | Creación por usuarios autenticados. Lectura restringida. **Edición y borrado estrictamente prohibidos**. |

- **Modelos Fuertes Tipados**: [PlaceModel](lib/features/directory/models/place_model.dart), [PaymentOrder](lib/core/payment/models/payment_order.dart), [PaymentTransaction](lib/core/payment/models/payment_transaction.dart), [BusinessModel](lib/core/models/business_model.dart), [AuditLogModel](lib/core/models/audit_log_model.dart).
- **Reglas Declarativas**: `firestore.rules` y `storage.rules` desplegadas en el proyecto Firebase `appbaqueano`.

---

## 🚨 Centro de Auxilio & Emergencias SOS en Sendero

Accesible desde el botón SOS de la barra superior en cualquier pantalla:

- **Líneas Oficiales 24/7**:
  - 👮 **Policía Turística & Nacional**: `118` / `+505 2277-4130`
  - 🚑 **Cruz Blanca Nicaragüense**: `128` / `+505 2265-2081`
  - 🚒 **Bomberos Unificados**: `115`
  - ℹ️ **Atención al Turista INTUR**: `+505 2254-5191`
- **Herramientas de Rescate**:
  - **Botón `SOS WhatsApp`**: Abre mensaje preformateado de auxilio con coordenadas satelitales precisas.
  - **Copia de Coordenadas GPS**: Copia la posición geográfica en un solo toque.
  - **Vibración Háptica**: `HapticFeedback.heavyImpact` para retroalimentación táctil inmediata.

---

## 🏪 Vitrina de Negocios Campesinos & Comercio Justo

Cada emprendedor comunitario cuenta con una ficha técnica completa:

- **👤 Propietario / Gerente**: Nombre real y acreditación del baqueano.
- **💬 WhatsApp Directo**: Enlace `https://wa.me/` con mensaje contextual prellenado.
- **📞 Teléfono & Llamada Rápida**: Marcación nativa sin intermediarios.
- **📍 Ubicación & Mapa**: Punto georreferenciado con pin temático en la cordillera.
- **🛡️ Cero Comisiones Abusivas**: El explorador apoya directamente la economía local.

---

## 🗺️ Mapa GPS Satelital & Geolocalización de Rutas

- **📍 Pines Georreferenciados**: Coordenadas exactas en Nicaragua (Latitud 11.0° - 14.8° N, Longitud -87.8° - -83.0° O).
- **🎛️ Filtros Temáticos**: Visualización simultánea de volcanes, cañones, cascadas, playas y cooperativas rurales.
- **📡 Modo Satelital & Relieve**: Renderizado topográfico con siluetas de los grandes lagos Xolotlán y Cocibolca.
- **📱 Tarjeta Flotante Interactiva**: Acceso instantáneo a la cotización y reserva al tocar cualquier pin.

---

## 🤖 Asistente IA para Turismo Responsable

Integrado en `/ai`:

- **Principio Innegociable**: No inventar información; recomendar según la sensibilidad ambiental y la seguridad del sendero.
- **Capacidades**:
  - Recomendar destinos alternativos para desconcentrar puntos saturados.
  - Explicar normas ambientales y buenas prácticas ecológicas.
  - Detallar el nivel de dificultad física y el equipo requerido.
  - Conectar la historia de los municipios con experiencias vivas.

---

## 🎫 Pasaporte del Explorador & Gamificación Ética

Ubicado en `/perfil`:

- **📜 Pasaporte Digital**: Insignias verificadas (*Cañón de Somoto, Cerro Negro, Ometepe, Miraflor, Río San Juan, Indio Maíz*), puntos de impacto ambiental y rango de explorador.
- **♿ Centro de Accesibilidad**: Escalado tipográfico dinámico (85% a 135%), alto contraste y conmutador háptico.
- **🔗 Autenticación Segura**: **Google Sign-In** y Correo/Contraseña en Firebase Auth.

---

## 💳 Motor Financiero Bimoneda & Régimen Fiscal

```text
┌────────────────────────────────────────────────────────────┐
│                    DESGLOSE DE RESERVA                     │
├────────────────────────────────────────────────────────────┤
│ Subtotal (1 a 10 Personas)       : $XX.XX USD              │
│ Descuento Promo (BAQUEANO2026)   : -15%                    │
│ Régimen Fiscal:                                            │
│   • Turista Extranjero (Ley 306) : 0% IVA (Exonerado)      │
│   • Residente Local (15% IVA)    : +15% DGI                │
├────────────────────────────────────────────────────────────┤
│ TOTAL EN USD                     : $XX.XX USD              │
│ TOTAL EN CÓRDOBAS (x 36.65)      : C$ X,XXX.XX NIO         │
│ Código Único de Expedición       : BAQ-XXXXXX              │
└────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Sistema de Respaldo & Restauración de Versiones

El repositorio cuenta con ramas y etiquetas de respaldo en Git para garantizar la seguridad del código y permitir el retorno inmediato a versiones estables verificadas:

- **Versión Actual RC1 (Android - V1.4.0 Producción Blindada: Galería Manual 3D de Aliados, Estandarización Visual de Carruseles y Blindaje de Autenticación)**:
  - **Rama de Respaldo**: `backup-version-estable`
  - **Etiqueta Oficial**: `v1.4.0-rc1`
  - **Logros Clave**:
    - **Galería Manual 3D de Aliados Locales & Cooperativas**: Carrusel táctil con física `BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics())` y tarjetas interactivas de giro 3D (`Flip Cards`) de 180° que revelan canales directos (WhatsApp, llamadas y mapa GPS) sin intermediarios.
    - **Estandarización Canónica de Carruseles**: Unificación del sistema de encabezados con `SectionHeader`, etiquetas superiores temáticas, títulos display en Montserrat, subtítulos en Inter y badges centrados en Space Grotesk con borde dorado Pinolero.
    - **Blindaje y Desacoplamiento de Autenticación Google Sign-In & App Check**: Separación de inicializaciones asíncronas entre Firebase Core, Firebase App Check y FCM en `main.dart` para evitar bloqueos por condiciones de carrera (`duplicate-app`). Manejo defensivo en `AuthService` con prevención de peticiones en vuelo (`_googleSignInInFlight`), captura de excepciones de plataforma (código `12502`) y reversión automática de sesiones incompletas.
    - **100% Código Limpio**: `flutter analyze` reporta `No issues found!`, cero uso de `.withOpacity()` y suite completa de pruebas unitarias al 100% de aprobación.
  ```bash
  # Para restaurar o inspeccionar la versión actual v1.4.0-rc1:
  git checkout backup-version-estable
  ```

- **Versión Previa (Android - V1.3.0 Producción Blindada: Paleta Oficial, Persistencia Nativa de Ciclo de Vida, Cero Overflows, Música a 1 Toque y Campaña Ambiental)**:
  - **Etiqueta Oficial**: `v1.3.0-estable`
  ```bash
  # Para restaurar o inspeccionar la versión v1.3.0:
  git checkout v1.3.0-estable
  ```

- **Versión Previa Histórica (Android - V1.2.0 Optimizada 100% Sin Desbordamientos ni Warnings)**:
  - **Rama de Respaldo**: `backup-version-v1.2.0`
  - **Etiqueta Oficial**: `v1.2.0-estable`
  ```bash
  # Para restaurar la versión v1.2.0:
  git checkout backup-version-v1.2.0
  ```

- **Regresar a la Rama Principal de Desarrollo**:
  ```bash
  git checkout main
  ```

---

## 🚀 Instalación y Despliegue en Android

### Requisitos Previos

- **Flutter SDK** `>= 3.7.0`
- **Android SDK** con API 34 o superior
- **Dispositivo Físico Android o Emulador** (con depuración USB habilitada)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/OscarElieser/APP-BAQUEANO.git
cd APP-BAQUEANO
```

### 2. Instalar Dependencias

```bash
flutter pub get
```

### 3. Verificar Calidad del Código (0 Warnings)

```bash
flutter analyze
```

### 4. Compilar e Instalar en Dispositivo Físico Android

```bash
flutter run -d [DEVICE_ID]
```

---

## ☁️ Despliegue Web en Azure

> Guía completa: [docs/deployment/AZURE_DEPLOYMENT.md](docs/deployment/AZURE_DEPLOYMENT.md) · Evidencias: [docs/evidencias/azure/](docs/evidencias/azure/README.md) · Auditoría: [docs/audit/](docs/audit/SYSTEM_MAP.md)

| Capa | Tecnología | Rol |
| --- | --- | --- |
| Dominio | `https://baqueanonicaragua.com` (DNS en Hostinger) | Dominio público y canónico |
| Infraestructura | Azure VM `vm-baqueano-prod` · Ubuntu Server 22.04 LTS · NSG | Servidor del Hackathon Nicaragua 2026 |
| Servidor web | Nginx + TLS Let's Encrypt (HTTPS/443, HTTP/80 solo redirección) | Sirve el Website estático de `website/` |
| API | Node.js 20 en `127.0.0.1:3000`, systemd, expuesta solo vía Nginx en `/api/azure/*` | Demuestra Azure → datos |
| Datos (fuente principal) | Supabase PostgreSQL (RLS + Edge Functions) | Base de datos principal: catálogo, negocios, contenido, auditoría, BAQUI |
| Datos (heredado Android) | Cloud Firestore → `baqueano-mirror` | Replicado en Supabase hasta migrar la app |
| BD en Azure | PostgreSQL local solo `localhost` | Evidencia de la rúbrica, sin datos productivos |
| Autenticación | Firebase Authentication (Google) | Identidad |
| Hosting alternativo | Firebase Hosting `https://app-baqueano.web.app` | Respaldo técnico |

**Seguridad:** SSH solo con clave y solo desde la IP del administrador; puertos de base de datos (5432, 3306) y de la API (3000) nunca expuestos; cabeceras CSP/HSTS; RLS en Supabase con pruebas negativas en vivo en CI; roles decididos por el servidor (claim de Firebase o `public.staff_roles`): Explorador, Emprendedor, Auditor (solo lectura), Admin y Superadmin.

**Despliegue reproducible (GitHub = producción):**

```bash
sudo bash ~/APP-BAQUEANO/azure/setup-server.sh   # una vez
bash ~/APP-BAQUEANO/azure/deploy.sh              # publica origin/main
curl https://baqueanonicaragua.com/health        # muestra el commit desplegado
```

### Evidencias reproducibles — Sprint 1, Sprint 2 y Sprint 3

Los artefactos de evaluación se conservan bajo `docs/evidencias/` (excluidos del hosting público). La matriz consolidada de auditoría se encuentra en [`docs/evidencias/MATRIZ_EVIDENCIAS_SPRINTS_1_2_3.md`](docs/evidencias/MATRIZ_EVIDENCIAS_SPRINTS_1_2_3.md).

La comprobación integral automatizada se ejecuta mediante:

```bash
node tools/verify-sprints.mjs --commit="$(git rev-parse --short HEAD)" \
  --output=docs/evidencias/sprint-3/resultados/verificacion.json
```

#### Cumplimiento de los 5 Criterios de la Rúbrica:

1. **Accesibilidad Pública:**
   - **Web:** Operativa y accesible desde cualquier navegador en la IP pública `20.80.81.65` y en el dominio canónico `https://baqueanonicaragua.com`.
   - **Móvil:** Paquete instalable Android compilado en `website/assets/BaqueanoNicaragua.apk` (91.02 MB) y verificado con `flutter analyze: No issues found!`.
2. **Seguridad Básica:**
   - Puertos 80 (HTTP) y 443 (HTTPS) abiertos para tráfico seguro.
   - Puertos internos 3000 (API Node) y 5432 (PostgreSQL) estrictamente **cerrados y filtrados** por Network Security Groups (NSG). Las bases de datos nunca están expuestas al público.
3. **Funcionamiento Autónomo:**
   - El explorador puede completar el recorrido principal (Inicio → Destinos → Mapa → Mi Viaje → Perfil) de principio a fin de manera 100% desatendida y reactiva.
4. **Integración Completa:**
   - Comunicación cliente-servidor verificada: consulta y persistencia en tiempo real en Supabase PostgreSQL (17 departamentos y destinos territoriales) y sincronización de perfiles en `public.profiles`.
5. **Actualización del Repositorio:**
   - Paridad exacta del commit `6cc4841` entre el código en producción (`/health`), la rama `main` en GitHub y el HEAD local de trabajo.

| Sprint | Alcance | Evidencia |
| --- | --- | --- |
| Sprint 1 | README, stack, interfaces, roles, pruebas y builds | `docs/evidencias/sprint-1/EVIDENCIA_SPRINT_1.md` |
| Sprint 2 | Azure, IP pública, SSH, SO, Node, PostgreSQL y puertos | `docs/evidencias/sprint-2/EVIDENCIA_SPRINT_2.md` |
| Sprint 3 | Flujo autónomo, APK, integración Azure→Supabase y paridad GitHub | `docs/evidencias/sprint-3/EVIDENCIA_SPRINT_3.md` |

Rutas y recursos de producción:

- Website: `https://baqueanonicaragua.com`.
- IP de Azure: `20.80.81.65`.
- APK Móvil: `website/assets/BaqueanoNicaragua.apk`.
- Salud / Commit: `https://baqueanonicaragua.com/health`.
- Conectividad de Base de Datos: `https://baqueanonicaragua.com/api/azure/db`.

---

## 📄 Licencia & Créditos

Desarrollado con orgullo para impulsar el ecoturismo campesino, la soberanía cultural y la preservación ambiental de **Nicaragua** 🇳🇮.

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.

© 2026 Baqueano Nicaragua. Todos los derechos reservados. Turismo comunitario responsable y sin intermediarios.
