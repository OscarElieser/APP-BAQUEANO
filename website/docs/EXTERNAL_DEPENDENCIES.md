# 🧭 EXTERNAL DEPENDENCIES — REGISTRO & GOBIERNO DE DEPENDENCIAS EXTERNAS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Identificar, calificar el nivel de riesgo y controlar el acoplamiento con todos los proveedores tecnológicos y paquetes de terceros utilizados por Baqueano, evitando el bloqueo de proveedor inadvertido o vulnerabilidades en la cadena de suministro.

---

## ⚙️ 2. CÓMO (HOW / MATRIZ DE RIESGO DE DEPENDENCIAS)

| Dependencia | Nivel de Riesgo | Justificación | Estrategia de Mitigación / Abstracción |
| --- | :---: | --- | --- |
| **Google Cloud / Firebase** | **Crítico** | Datastore principal, autenticación y storage de imágenes | Arquitectura de repositorios (`@baqueano/firebase`); esquemas JSON desacoplados |
| **Google Maps Platform** | **Importante** | Geometría y visualización cartográfica | Coordenadas estándar WGS84 (`latitude`, `longitude`) exportables |
| **Next.js / Vercel-Ready** | **Importante** | Framework web SSR y Monolito Modular | Código escrito según estándares web estándar (Fetch, Web Streams, CSS puro) |
| **Google Gemini API** | **Opcional** | Generación inteligente de itinerarios contextuales | Catálogo factual estático como base; fallback determinista completo |
| **Lucide React Icons** | **Bajo** | Iconografía de interfaz | Componentes estándar SVG |

---

## 📦 3. QUÉ (WHAT / POLÍTICA DE CADENA DE SUMINISTRO (SUPPLY CHAIN SECURITY))

1. **Lockfile Inmutable**: Todos los despliegues de producción se generan a partir de `pnpm-lock.yaml` estricto.
2. **Cero Actualizaciones Automáticas de Versiones Mayores**: Toda actualización de librerías mayores requiere pruebas previas en staging.
3. **Auditoría Continua de Seguridad**: Verificación regular con `pnpm audit` para detectar avisos de seguridad en paquetes npm.
