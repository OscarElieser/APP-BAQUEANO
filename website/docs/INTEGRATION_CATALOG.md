# 🧭 INTEGRATION CATALOG — CATÁLOGO DE INTEGRACIONES EXTERNAS & ALIADOS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Inventariar y auditar de forma exhaustiva todas las dependencias e integraciones externas de Baqueano, estableciendo para cada una su tipo, mecanismo de autenticación, fuente de verdad y protocolo de fallback ante contingencias.

---

## ⚙️ 2. CÓMO (HOW / MATRIZ NORMATIVA DE INTEGRACIONES)

| Integración | Tipo de Servicio | Datos Transferidos | Mecanismo Auth | Estado Operativo | Responsable de Dominio |
| --- | --- | --- | --- | :---: | --- |
| **Firebase Auth** | Identidad & Token Gate | UIDs, Tokens JWT, Claims | SDK Server-Side / Google Cloud | ✅ REAL | Super Admin Seguridad |
| **Cloud Firestore** | Datastore Distribuido | Documentos de Catálogo, Órdenes, Incidentes | IAM Service Account / Rules | ✅ REAL | Tech Lead / DB Admin |
| **Baqueano AI Gateway** | Orquestador de Itinerarios | Prompts sanitizados, Catálogo verificado | Cloud Function Secret Key | ✅ REAL | AI Architect |
| **Google Maps Embed / JS** | Visualización Cartográfica | Coordenadas y geometrías públicas | API Key restringida por dominio | ✅ REAL | Frontend Lead |
| **Pasarela de Pagos (Mock / API)** | Procesamiento de Reservas | Identificadores de orden, Monto USD/NIO | HMAC Signed Token | ✅ REAL | Financial Admin |
| **INETER / Feeds Meteorológicos** | Alertas Climáticas | Estado de ríos, alertas de lluvia | API REST / Polling seguro | 🟡 PARCIAL | Operador Control Tower |
| **Portal INTUR Enlace** | Estadísticas Ecoturísticas | Agregados anónimos de visitantes | API v1 Key (`bq_live_...`) | ✅ REAL | Enterprise Lead |

---

## 📦 3. QUÉ (WHAT / POLÍTICA DE GOBERNANZA DE INTEGRACIONES)

1. **Cero Scraping no Autorizado**: Baqueano solo consume fuentes oficiales autorizadas o datos levantados directamente en territorio por baqueanos verificados.
2. **Degradación Aislada**: Si una integración externa falla (e.g. AI Gateway o mapas), la plataforma continúa operando en modo degradado sin suspender la navegación ni el proceso de reservas.
