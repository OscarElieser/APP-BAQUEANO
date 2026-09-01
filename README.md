# 🌋 BAQUEANO ECOSYSTEM

## Plataforma Oficial Multiplataforma de Ecoturismo & Rutas Autóctonas de Nicaragua

[![Flutter Version](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart Version](https://img.shields.io/badge/Dart-3.7+-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![Firebase](https://img.shields.io/badge/Firebase-baqueanonicaragua--3e5c9-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://baqueanonicaragua-3e5c9.web.app/)
[![Platforms](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-2E7D32?style=for-the-badge)](https://github.com/OscarElieser/APP-BAQUEANO)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)

**Nicaragua en modo secreto** · Diseña expediciones inmersivas con baqueanos nativos, reservas bimoneda sin intermediarios, pasaporte gamificado de explorador y un asistente inteligente potenciado por Google Gemini AI.

🌐 **Plataforma Web Oficial en Vivo**: [https://baqueanonicaragua-3e5c9.web.app/](https://baqueanonicaragua-3e5c9.web.app/)

---

## 🧭 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🎨 Sistema de Diseño & Tokens Visuales](#-sistema-de-diseño--tokens-visuales)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [📱 Módulos y Pantallas](#-módulos-y-pantallas)
- [💳 Motor Financiero Bimoneda & Régimen Fiscal](#-motor-financiero-bimoneda--régimen-fiscal)
- [🤖 Asistente Baqueano AI (Gemini Engine)](#-asistente-baqueano-ai-gemini-engine)
- [🏆 Pasaporte Digital & Gamificación](#-pasaporte-digital--gamificación)
- [🛠️ Panel de Administración CMS & Respaldos](#️-panel-de-administración-cms--respaldos)
- [🚀 Instalación y Despliegue](#-instalación-y-despliegue)
- [📄 Licencia & Créditos](#-licencia--créditos)

---

## ✨ Características Principales

- 📱 **100% Multiplataforma**: Experiencia nativa optimizada y adaptativa para **Android**, **iOS** y **Web** (Desktop & Mobile Responsive).
- 🌋 **Catálogo Cultural de Nicaragua**: 8 módulos profundos que cubren Gastronomía, Música folclórica con reproductor interactivo, Videos 4K, Playas de Surf, Hospedajes Ecológicos, Vida Nocturna y Volcanes.
- 💰 **Checkout Bimoneda en Tiempo Real**: Cálculo simultáneo en **USD ($)** y **Córdobas Nicaragüenses (C$ NIO)** con tasa oficial `C$ 36.65`, exoneración de IVA (0% para turistas extranjeros vs 15% para locales) y validación de cupones (`BAQUEANO2026`).
- 🤖 **Baqueano AI ("El Baqueano Mayor")**: Asistente conversacional con inyección de contexto de rutas en vivo para generar itinerarios día a día y presupuestos desglosados.
- 🎖️ **Pasaporte Digital de Explorador**: Sellos migratorios oficiales, barra de experiencia (XP), rangos de explorador (*Novato*, *Aventurero*, *Baqueano Maestro*) y código QR de viajero.
- 🗺️ **Mapa Georreferenciado Offline-First**: Visualización de pines temáticos (volcanes, cascadas, playas, cañones) con detalles emergentes e instrucciones de ruta.
- 🗄️ **Panel de Administración CMS**: Métricas en tiempo real, gestión de expediciones, moderación comunitaria y respaldo/restauración completo en JSON (`baqueano_backup.json`).

---

## 🎨 Sistema de Diseño & Tokens Visuales

La identidad visual está inspirada en los paisajes volcánicos, la arcilla artesanal y la riqueza natural de Nicaragua:

| Token | Nombre | Código Hex | Uso en la Aplicación |
| :--- | :--- | :--- | :--- |
| **Primary** | Petróleo Volcánico | `#082B35` / `#13424E` | Barras de navegación, encabezados, fondos principales |
| **Terracotta** | Arcilla Nica | `#C86432` / `#8B3A14` | Botones de acción primaria, badges de dificultad, acentos |
| **Gold** | Oro / Acento Dorado | `#D4AF37` / `#F3E5AB` | Precios, insignias de maestría, estrellas y destacados |
| **Dark Surface** | Fondo Oscuro Profundo | `#0F172A` | Fondos de tarjetas y contenedores glassmorphism |
| **Sand Surface** | Arena / Marfil | `#F4EBD9` / `#F8FAF9` | Tipografía en alto contraste y acentos claros |
| **Jungle Green** | Verde Selva | `#2E7D32` | Sello de sostenibilidad, 100% comunitario e impacto |

### Tipografía

- **Titulares (Headings)**: `Montserrat` (Pesos 800 y 900)
- **Subtítulos y Metadatos**: `Space Grotesk` (Pesos 600 y 700)
- **Cuerpo y Lectura**: `Inter` (Legibilidad óptima en móviles y web)

---

## 🏗️ Arquitectura del Proyecto

El código está estructurado siguiendo los principios de **Clean Code**, alta cohesión y bajo acoplamiento:

```text
lib/
├── config/                     # Configuración central
│   ├── app_colors.dart         # Paleta de colores oficiales
│   ├── app_gradients.dart      # Gradientes volcánicos y de oro
│   ├── app_theme.dart          # Configuración de ThemeData para Flutter
│   ├── app_constants.dart      # Tasa oficial de cambio, contactos y cupones
│   ├── firebase_options.dart   # Configuración de Firebase (baqueanonicaragua-3e5c9)
│   └── app_router.dart         # Enrutamiento declarativo con GoRouter
│
├── models/                     # Entidades de datos y esquemas Firestore
│   ├── destination_model.dart  # Destinos, circuitos y rutas
│   ├── user_profile.dart       # Perfiles de usuario y roles RBAC (admin, guide, explorer)
│   ├── reservation_model.dart  # Reservas con discriminación fiscal de IVA y código BAQ-XXXXXX
│   ├── cultural_item.dart      # Gastronomía, Música, Videos, Lodges, Nocturna y Badges
│   ├── experience_model.dart   # Bitácora comunitaria con reseñas, fotos y likes
│   ├── business_model.dart     # Prestadores locales y cooperativas
│   ├── system_config_model.dart# Ajustes de configuración del sistema
│   └── chat_message.dart       # Mensajes con payload de itinerario para Baqueano AI
│
├── data/                       # Catálogo maestro y datos autóctonos
│   └── baqueano_full_catalog.dart # Base de datos completa de Nicaragua
│
├── services/                   # Lógica de negocio y servicios
│   ├── auth_service.dart       # Autenticación (Email, Google, MFA WhatsApp, RBAC)
│   ├── destination_service.dart# Sincronización Firestore y caché offline
│   ├── admin_service.dart      # Métricas en vivo y Backup/Restore JSON
│   └── baqueano_ai_service.dart# Motor de IA conversacional (Gemini Engine)
│
├── screens/                    # Vistas y pantallas completas
│   ├── home_screen.dart        # Pantalla principal cinemática
│   ├── discover_screen.dart    # Mega-catálogo con búsqueda y filtros
│   ├── gastronomy_screen.dart  # Gastronomía autóctona nicaragüense
│   ├── music_screen.dart       # Reproductor interactivo de música folclórica
│   ├── videos_screen.dart      # Galería de documentales en 4K Ultra HD
│   ├── beaches_screen.dart     # Playas del Pacífico y Cayos Caribeños
│   ├── lodging_screen.dart     # Fincas y eco-lodges sostenibles
│   ├── nightlife_screen.dart   # Bares bohemios y coctelería nacional
│   ├── routes_map_screen.dart  # Mapa interactivo georreferenciado
│   ├── ai_guide_screen.dart    # Asistente Baqueano AI
│   ├── passport_screen.dart    # Pasaporte digital de explorador
│   ├── community_screen.dart   # Bitácora comunitaria y decálogo consciente
│   ├── admin_screen.dart       # Panel CMS de administración
│   ├── brand_screen.dart       # Misión, visión y manifiesto de la marca
│   ├── help_screen.dart        # Centro de ayuda, FAQ y líneas de emergencia
│   ├── terms_screen.dart       # Términos y condiciones del servicio (8 artículos)
│   └── privacy_screen.dart     # Política de privacidad y protección de datos (8 artículos)
│
└── widgets/                    # Componentes UI reutilizables
    ├── checkout_modal.dart     # Modal de checkout bimoneda con régimen fiscal
    ├── destination_card.dart   # Tarjeta con fotos HD, badges de dificultad y precio
    ├── responsive_scaffold.dart# Navbar desktop + Barra flotante y Drawer móvil
    ├── hero_section.dart       # Portada cinemática con tarjeta destacada
    ├── impact_counter_strip.dart# Tira de impacto (85% directo a familias locales)
    ├── marquee_ticker.dart     # Ticker animado de cooperativas y marcas aliadas
    ├── business_showcase.dart  # Vitrina de emprendimientos locales con llamada directa
    ├── explorer_testimonials.dart # Reseñas verificadas de viajeros
    ├── baqueano_standard.dart  # Los 4 pilares del estándar de calidad Baqueano
    ├── glass_container.dart    # Contenedor glassmorphism con desenfoque
    └── baqueano_button.dart    # Botón con variantes de color y micro-animaciones
```

---

## 📱 Módulos y Pantallas

### 🍽️ 1. Gastronomía Autóctona

Recetas tradicionales, historia cultural, ingredientes precolombinos y comedores recomendados de:

- **Nacatamal Tradicional** (Masaya / Managua)
- **Gallo Pinto con Cuajada y Tortilla** (Nacional)
- **Vigorón Granadino** (Kiosko El Gordito, Granada)
- **Baho al Vapor** (Masaya / Tipitapa)
- **Quesillo de Nagarote y La Paz Centro** (León)
- **Indio Viejo / Masa de Cazuela** (Diriamba / Matagalpa)

### 🎵 2. Música & Folklore Interactivo

Reproductor musical interactivo con barra de progreso, géneros folclóricos e información histórica de cada obra:

- *El Solar de Monimbó* (Camilo Zapata)
- *Mora Limpia* (Justo Santos - Marimba de Arco)
- *El Zanatillo* (Trío Monimbó)
- *Danza del Mestizaje* (El Güegüense, Patrimonio UNESCO)
- *Palomita Guasiruca* (Polka Campesina Segoviana)

### 🎬 3. Videos 4K & Documentales

Reproducción de spots cinematográficos de alta definición:

- *Cañón de Somoto en 4K Ultra HD*
- *Sandboarding en Cerro Negro a 80 km/h*
- *Little Corn Island: El Secreto del Caribe*
- *Volcán Masaya: El Ojo de Fuego Nocturno*

---

## 💳 Motor Financiero Bimoneda & Régimen Fiscal

El sistema de reservas incorpora un motor de cálculo fiscal transparente:

```text
┌────────────────────────────────────────────────────────────┐
│                    DESGLOSE DE RESERVA                     │
├────────────────────────────────────────────────────────────┤
│ Subtotal (1 a 10 Personas)       : $XX.XX USD              │
│ Descuento Promo (BAQUEANO2026)   : -15%                    │
│ Régimen de IVA:                                            │
│   • Turista Extranjero (0% IVA)  : $0.00 USD (Exonerado)   │
│   • Residente Local (15% IVA)    : +15% DGI                │
├────────────────────────────────────────────────────────────┤
│ TOTAL EN USD                     : $XX.XX USD              │
│ TOTAL EN CÓRDOBAS (x 36.65)      : C$ X,XXX.XX NIO         │
│ Código de Expedición Único       : BAQ-XXXXXX              │
└────────────────────────────────────────────────────────────┘
```

---

## 🤖 Asistente Baqueano AI (Gemini Engine)

Potenciado por la lógica de **Google Gemini AI**, *"El Baqueano Mayor"* es un guía virtual sabio que:

- Diseña itinerarios de 1 a 7 días basados en tus días disponibles y presupuesto en USD / NIO.
- Asigna guías certificados nativos (ej. *Don Toño Calero en Somoto*, *Chepe "El Volcánico" en Cerro Negro*).
- Entrega recomendaciones de calzado, hidratación y precauciones para ascensos a cráteres activos.

---

## 🏆 Pasaporte Digital & Gamificación

Inspirado en el pasaporte oficial de la República de Nicaragua:

- **Sellos de Check-in**: *Somoto*, *Cerro Negro*, *Cascada La Luna*, *Ometepe*, *Masaya*, *Corn Island*.
- **Insignias Desbloqueables**: *Primer Sendero*, *Guardián del Fuego*, *Navegante de Cañones*, *Catador de Altura*, *Viajero Regenerativo*, *Baqueano Offline*.
- **Barra de XP y Niveles**: Sistema de progresión (*Novato ➔ Aventurero ➔ Baqueano Maestro*).
- **Código QR de Membresía**: Identificador único de explorador para check-in con prestadores locales.

---

## 🛠️ Panel de Administración CMS & Respaldos

Herramienta para administradores con:

- **Métricas en Vivo**: Total de reservas, facturación total en USD y Córdobas (NIO), usuarios activos y destinos.
- **Gestión CRUD**: Creación y edición de expediciones y prestadores.
- **Motor de Backup & Restore**:
  - Exportación con un clic de toda la base de datos a `baqueano_backup.json`.
  - Restauración instantánea a partir de archivos de respaldo JSON.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos

- **Flutter SDK** `>= 3.7.0`
- **Dart SDK** `>= 3.7.0`
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/OscarElieser/APP-BAQUEANO.git
cd APP-BAQUEANO
```

### 2. Instalar Dependencias

```bash
flutter pub get
```

### 3. Ejecutar en Desarrollo

#### Para Web

```bash
flutter run -d chrome
```

#### Para Android

```bash
flutter run -d android
```

#### Para iOS (macOS requerido)

```bash
flutter run -d ios
```

### 4. Compilar para Producción

#### Web Release

```bash
flutter build web --release --no-tree-shake-icons
```

#### Android APK

```bash
flutter build apk --release
```

#### Android App Bundle (Play Store)

```bash
flutter build appbundle --release
```

---

## 🧪 Ejecución de Pruebas

```bash
flutter test
```

---

## 📄 Licencia & Créditos

Desarrollado con orgullo para impulsar el ecoturismo comunitario y sostenible en **Nicaragua** 🇳🇮.

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.

© 2026 Baqueano Ecosystem. Todos los derechos reservados. Turismo comunitario transparente y sin intermediarios.
