# 🌋 BAQUEANO ECOSYSTEM

## Plataforma Oficial Multiplataforma de Ecoturismo & Rutas Autóctonas de Nicaragua

[![Flutter Version](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart Version](https://img.shields.io/badge/Dart-3.7+-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![Firebase](https://img.shields.io/badge/Firebase-app--baqueano-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Genkit AI](https://img.shields.io/badge/Genkit%20AI-Gemini%201.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://firebase.google.com/docs/genkit)
[![Platforms](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web%20%7C%20SmartTV-2E7D32?style=for-the-badge)](https://github.com/OscarElieser/APP-BAQUEANO)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)

**Nicaragua en modo secreto** · Diseña expediciones inmersivas con baqueanos nativos, reservas bimoneda sin intermediarios, pasaporte gamificado de explorador, geolocalización GPS satelital y un asesor turístico con Inteligencia Artificial (Firebase Genkit + Google Gemini 1.5 Flash + Groq Cloud Llama 3.3 + Ollama Cloud).

---

## 🧭 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🎨 Sistema de Diseño & Tokens Visuales](#-sistema-de-diseño--tokens-visuales)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [🏪 Vitrina de Negocios Campesinos & Comercio Justo](#-vitrina-de-negocios-campesinos--comercio-justo)
- [🗺️ Mapa GPS Satelital & Geolocalización de Rutas](#️-mapa-gps-satelital--geolocalización-de-rutas)
- [🤖 Asistente Turístico Inteligente (Firebase Genkit + Gemini)](#-asistente-turístico-inteligente-firebase-genkit--gemini)
- [👤 Pasaporte del Explorador & Centro de Accesibilidad](#-pasaporte-del-explorador--centro-de-accesibilidad)
- [💳 Motor Financiero Bimoneda & Régimen Fiscal](#-motor-financiero-bimoneda--régimen-fiscal)
- [🔒 Seguridad, Firebase & App Check](#-seguridad-firebase--app-check)
- [🚀 Instalación y Despliegue](#-instalación-y-despliegue)
- [📄 Licencia & Créditos](#-licencia--créditos)

---

## ✨ Características Principales

- 📱 **100% Adaptable & Multiplataforma**: Experiencia optimizada para **Móviles** (Android/iOS), **Tablets**, **Desktops** y **Smart TVs** con `LayoutBuilder` y `ConstrainedBox`.
- 🌋 **5 Carruseles Dinámicos en Home**:
  1. 💬 *Lo que dicen nuestros exploradores*: Reseñas verificadas con impacto directo a familias rurales.
  2. 🌋 *Tipos de destinos populares*: Catálogo bimoneda con filtros interactivos por departamento.
  3. 🇳🇮 *Nicaragua en todos sus sentidos*: Exploración sensorial (gastronomía, café, volcanes, surf, música).
  4. 🏪 *Vitrinas de negocios locales*: Cabañas, comedores campesinos y guías con WhatsApp y llamada directa.
  5. 🧭 *El estándar de Baqueano*: Los 4 pilares éticos de comercio justo y preservación ambiental.
- 🏪 **Ficha Técnica Completa de Emprendedores**: Nombre del negocio, propietario/gerente, teléfono, WhatsApp directo prellenado, correo electrónico, dirección física y pin GPS en el mapa.
- 🗺️ **Mapa GPS Satelital Interactivo**: Pines exactos de destinos y negocios campesinos, capas temáticas y selector de vista satelital/relieve.
- 🤖 **IA Turística Integral (Firebase Genkit + Gemini 1.5 Flash + Groq + Ollama Cloud)**: 10 módulos de asesoría que cubren destinos, transportes, hospedajes, gastronomía, seguridad y presupuestos bimoneda en USD y NIO.
- 👤 **Pasaporte Digital & Accesibilidad**:
  - Sellos de expedición (Somoto, Cerro Negro, Ometepe, Miraflor, Indio Maíz).
  - Selector de tamaño de letra dinámico (85% a 135%), alto contraste y vibración háptica.
  - Vinculación oficial con **Google Sign-In** y cierre de sesión seguro.
- 💰 **Checkout Bimoneda en Tiempo Real**: Cálculo en **USD ($)** y **Córdobas (C$ NIO)** con tasa oficial `C$ 36.65`, exención de IVA según Ley 306 de Incentivos Turísticos y cupones promocionales (`BAQUEANO2026`).

---

## 🎨 Sistema de Diseño & Tokens Visuales

La identidad visual está inspirada en los paisajes volcánicos, la arcilla artesanal de San Juan de Oriente y los lagos de Nicaragua:

| Token | Nombre | Código Hex | Uso en la Aplicación |
| :--- | :--- | :--- | :--- |
| **Primary** | Petróleo Volcánico | `#082B35` / `#13424E` | Barras de navegación, encabezados, fondos principales |
| **Terracotta** | Arcilla Nica | `#C86432` / `#8B3A14` | Botones de acción primaria (CTA), badges de dificultad, acentos |
| **Gold** | Oro Pinolero | `#D4AF37` / `#F3E5AB` | Precios, insignias de honor, estrellas y elementos destacados |
| **Dark Surface** | Fondo Oscuro Profundo | `#0F172A` | Fondos de tarjetas Glassmorphism |
| **Jungle Green** | Verde Selva | `#10B981` / `#2E7D32` | Sellos de sostenibilidad, 100% comunitario y negocios verificados |
| **Crimson SOS** | Rojo Alerta | `#E11D48` | Centro de asistencia y emergencias SOS |

---

## 🏗️ Arquitectura del Proyecto

```text
lib/
├── config/                     # Configuración central
│   ├── app_colors.dart         # Paleta de colores oficiales
│   ├── app_gradients.dart      # Gradientes volcánicos y de oro
│   ├── app_theme.dart          # Configuración de ThemeData para Flutter
│   ├── app_constants.dart      # Tasa oficial de cambio, contactos y cupones
│   ├── firebase_options.dart   # Configuración de Firebase (app-baqueano)
│   └── app_router.dart         # Enrutamiento declarativo con GoRouter
│
├── core/                       # Núcleo compartido
│   ├── data/
│   │   └── catalog_data.dart   # Catálogo maestro y datos de destinos/negocios
│   ├── models/
│   │   ├── destination_model.dart # Modelo de destinos y rutas
│   │   └── cultural_models.dart   # Negocios locales, reseñas, gastronomía
│   ├── theme/                  # Sistema de tokens y gradientes
│   └── widgets/                # Componentes universales (Scaffold, Toast, Logo)
│
├── features/                   # Módulos organizados por característica
│   ├── auth/                   # Autenticación (Google Sign-In, Email, Invitado)
│   ├── home/                   # Feed principal con los 5 carruseles
│   │   └── widgets/            # Hero, Impact, Ticker, Vitrina, Testimonios
│   ├── map/                    # Mapa GPS satelital interactivo con pines
│   ├── profile/                # Pasaporte del explorador & Centro de accesibilidad
│   ├── ai_chat/                # Interfaz de chat con Baqueano AI
│   ├── destinations/           # Explorador de destinos y detalle de ruta
│   ├── checkout/               # Checkout bimoneda con régimen fiscal
│   └── sos/                    # Centro de asistencia y emergencias
│
└── services/                   # Servicios de infraestructura
    ├── auth_service.dart       # Gestión de autenticación y estado Riverpod
    ├── firestore_service.dart  # Cloud Firestore (Base de datos: appbaqueano)
    ├── destination_service.dart# Sincronización y caché offline
    └── baqueano_ai_service.dart# Conexión con backend de IA
```

---

## 🏪 Vitrina de Negocios Campesinos & Comercio Justo

Cada emprendedor comunitario cuenta con una ficha técnica completa:

- **👤 Propietario / Gerente**: Nombre real del anfitrión local.
- **💬 WhatsApp Directo**: Enlace `https://wa.me/` con mensaje prellenado.
- **📞 Teléfono & Correo**: Marcación nativa y contacto formal.
- **📍 Dirección y Coordenadas GPS**: Ubicación georreferenciada con pin en el mapa.
- **🕒 Horarios y Servicios**: Cabañas rústicas, café de altura, tours de sandboarding, kayaks y gastronomía típica.

---

## 🗺️ Mapa GPS Satelital & Geolocalización de Rutas

- **📍 Pines Georreferenciados**: Coordenadas exactas en Nicaragua (Latitud 11.0° - 14.8° N, Longitud -87.8° - -83.0° O).
- **🎛️ Capas y Filtros**: Visualización simultánea de volcanes, cañones, cascadas, playas y negocios campesinos.
- **📡 Modo Satelital / Vectorial**: Textura geográfica con siluetas de los lagos Xolotlán y Cocibolca.
- **📱 Tarjeta Flotante Interactiva**: Ficha técnica instantánea al pulsar cualquier pin.

---

## 🤖 Asistente Turístico Inteligente (Firebase Genkit + Gemini)

El backend de Inteligencia Artificial se encuentra en `src/index.js` y `prompts/baqueano_master.prompt`:

- **Framework**: Firebase Genkit (`genkit`, `@genkit-ai/googleai`).
- **Modelo**: Google Gemini 1.5 Flash + Groq Llama 3.3 + Ollama Cloud.
- **Arquitectura de 10 Módulos**:
  1. Identificación y perfil de destinos.
  2. Alojamiento rural y sostenible.
  3. Transporte y logística interna.
  4. Gastronomía autóctona y de autor campesina.
  5. Experiencias y turismo activo.
  6. Vida nocturna y corredor bohemio.
  7. Itinerarios personalizados paso a paso.
  8. Presupuesto bimoneda desglosado (USD/NIO).
  9. Asistencia de reservas sin intermediarios.
  10. Agente de IA proactivo y contextual.

---

## 👤 Pasaporte del Explorador & Centro de Accesibilidad

- **📜 Pasaporte Digital**: Insignias y sellos coleccionables (*Somoto, Cerro Negro, Ometepe, Miraflor, Indio Maíz*), barra de XP y rango de explorador.
- **♿ Centro de Accesibilidad**:
  - Escalado de tipografía interactivo (85% a 135%).
  - Modo de alto contraste para visibilidad bajo luz solar directa.
  - Interruptor de respuesta háptica táctil.
- **🔗 Conexión Google**: Sincronización de perfil con Cloud Firestore.

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
│ Código de Expedición Único       : BAQ-XXXXXX              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔒 Seguridad, Firebase & App Check

- **Firebase Project**: `app-baqueano` (Project Number: `578585227888`).
- **Cloud Firestore Database**: `appbaqueano`.
- **Firebase App Check**: Integrado con `AndroidProvider.debug` para protección contra abusos de API.
- **Firebase Realtime Database**: `https://app-baqueano-default-rtdb.firebaseio.com/`.
- **FCM Push Notifications**: Clave VAPID configurada para alertas y avisos meteorológicos en senderos.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos

- **Flutter SDK** `>= 3.7.0`
- **Node.js** `>= 18.0.0`
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/OscarElieser/APP-BAQUEANO.git
cd APP-BAQUEANO
```

### 2. Instalar Dependencias de Flutter

```bash
flutter pub get
```

### 3. Instalar Dependencias de Genkit AI

```bash
npm install
```

### 4. Ejecutar la Aplicación Flutter

```bash
flutter run
```

### 5. Iniciar Servidor de Genkit AI

```bash
npx genkit start -- node src/index.js
```

---

## 🧪 Verificación de Calidad

```bash
flutter analyze
flutter test
```

---

## 📄 Licencia & Créditos

Desarrollado con orgullo para impulsar el ecoturismo comunitario y sostenible en **Nicaragua** 🇳🇮.

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más información.

© 2026 Baqueano Ecosystem. Todos los derechos reservados. Turismo comunitario transparente y sin intermediarios.
