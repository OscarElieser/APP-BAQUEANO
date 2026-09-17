# BAQUEANO ECOSYSTEM — FASE 12: INTERNACIONALIZACIÓN, MULTI-PAÍS & EXPANSIÓN CENTROAMÉRICA

## 1. Visión Ejecutiva de la Fase 12

La **Fase 12** transforma a Baqueano de una plataforma mono-país (Nicaragua) a una **plataforma regional centroamericana** basada en el principio rector:
> **"Un solo Core Tecnológico, Múltiples Configuraciones Territoriales"** (*Single Core, Multiple Territorial Configurations*).

Nicaragua permanece como el **núcleo fundador y mercado activo principal**, mientras la arquitectura habilita la expansión progresiva y controlada hacia Costa Rica (`CR`), Guatemala (`GT`), Honduras (`HN`), El Salvador (`SV`), Belice (`BZ`) y Panamá (`PA`) sin bifurcar código (*zero forks*).

---

## 2. Componentes Clave Entregados

### A. Capa de Dominio & Esquemas Tipados (`packages/types`, `packages/validators`, `packages/config`)
- **`CountryRecord` & `CountryConfigItem`**: Modelos normalizados para los 7 países de Centroamérica con códigos ISO 3166-1 alfa-2 estables (`NI`, `CR`, `GT`, `HN`, `SV`, `BZ`, `PA`).
- **Abstracción Territorial Multi-Nivel**:
  - `level1Label`: Dinámico ("Departamento / Región Autónoma" en NI, "Provincia" en CR, "Departamento" en GT/HN/SV, "Distrito" en BZ, "Provincia / Comarca" en PA).
  - `level2Label`: Dinámico ("Municipio" en NI/GT/HN/SV, "Cantón" en CR, "Ciudad / Villa" en BZ, "Distrito" en PA).
- **Motor Monetario Multi-Divisa (`MoneyAmount`)**:
  - Almacenamiento seguro en unidades menores (`amountMinor` en centavos enteros) para `NIO`, `CRC`, `GTQ`, `HNL`, `USD`, `BZD` y `PAB`.
- **Matriz de Capacidades Regionales (`RegionalCapabilityMap`)**:
  - Activación granular por país de: Destinos, Negocios, Reservas, Pagos Online, Asistente AI, Sensores IoT y Operaciones de Campo.

### B. Consola Administrativa Regional (`apps/admin`)
- **Consola de Países & Expansión (`/paises`)**:
  - Gestión de ciclo de vida de mercado (`PLANNED` → `CONFIGURING` → `PILOT` → `ACTIVE` → `PAUSED`).
  - Matriz visual de capacidades y switch de emergencia / Kill-Switch por país.
  - Auditoría de protocolos de emergencia y puntos de contacto SOS por territorio.
- **Servicio `country.service.ts`**:
  - Catálogo tipado y desacoplado para consultas y mutaciones de estado regional.

### C. Aplicación Web Pública (`apps/web`)
- **Motor de Formateo de Divisas (`src/lib/currency.ts`)**:
  - Integración con `Intl.NumberFormat` para formateo según convención de país/locale.
- **Motor de Internacionalización & Diccionario Semántico (`src/lib/i18n.ts`)**:
  - Catálogo de UI strings con fallback determinístico a `es-NI`.
- **API Pública de Países (`/api/v1/countries`)**:
  - Exposición de capacidades y metadatos regionales con Edge Caching.
- **API de Atractivos (`/api/v1/places?country=NI`)**:
  - Soporte de filtrado por país con fallback automático a Nicaragua para compatibilidad con la app móvil.

---

## 3. Principio de Aislamiento y Compatibilidad Móvil

- **Compatibilidad 100% con Flutter/Android**: Todo campo de país es opcional con fallback a `"NI"`. Las carpetas `/lib`, `/android`, `/test` y `pubspec.yaml` se mantienen 100% intactas.
- **Aislamiento Multi-Tenant (ABAC)**: Administradores de un país no pueden acceder ni mutar recursos privados de otro país sin autorización explícita a nivel de token.
