# 🧭 IMPLEMENTACIÓN DE FASE 10 — ENTERPRISE ARCHITECTURE & ECOSISTEMA INSTITUCIONAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Consolidar a Baqueano como una plataforma digital de escala nacional e institucional que articula a exploradores, anfitriones, cooperativas comunitarias, alcaldías e instituciones gubernamentales de forma segura, estructurada y resiliente, sin comprometer el código nativo de Android ni introducir complejidad artificial.

---

## ⚙️ 2. CÓMO (HOW / PILARES DE ARQUITECTURA DE FASE 10)

1. **Arquitectura de Monolito Modular**:
   - Monorepo estructurado con límites de dominio claros (identidad, territorio, reservas, operaciones, IA, APIs).
   - Datastore en Firestore con repositorios tipados y esquemas Zod en todas las entradas.
2. **Modelo Multi-Organización & ABAC**:
   - Separación estricta entre la cuenta del usuario y su membresía organizacional.
   - Autorización por rol + organización + alcance territorial + propiedad de recurso.
3. **Plataforma de APIs v1 para Aliados (`/api/v1/`)**:
   - Endpoints `/api/v1/places` y `/api/v1/territories` con autenticación por encabezado `x-api-key`.
   - Validación de scopes (`places.read`, `territories.read`), rate limiting (60-120 req/min) y respuestas inmutables con caché HTTP.
4. **Gobierno y Catalogación de Datos**:
   - Clasificación formal de todos los datasets (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`).
   - Retención auditada, identificación de propietarios de dominio y minimización estricta de PII.
5. **Disaster Recovery & Continuidad de Negocio**:
   - RTO objetivo de 2 horas y RPO objetivo de 1 hora.
   - Backups dual-region probados con éxito y conmutadores de emergencia (Kill Switches) en panel de admin.
6. **Consola Enterprise de Plataforma (`/plataforma`)**:
   - Módulo administrativo para superadministradores con 4 paneles: Organizaciones, APIs, Catálogo de Datos y DR.
7. **Aislamiento Total de Flutter/Android**:
   - `/lib`, `/android`, `/test` y `pubspec.yaml` permanecen 100% intactos.

---

## 📦 3. QUÉ (WHAT / ENTREGABLES INTEGRADOS DE FASE 10)

- `website/apps/web/src/app/api/v1/places/route.ts`: Endpoint de destinos para aliados.
- `website/apps/web/src/app/api/v1/territories/route.ts`: Endpoint de estado territorial para aliados.
- `website/apps/admin/src/app/plataforma/page.tsx`: Consola administrativa de plataforma institucional.
- `website/apps/admin/src/services/platform.service.ts`: Servicio de datos de organizaciones y gobernanza.
- `website/packages/types/src/index.ts`: Modelos tipados de organizaciones, API keys, webhooks y gobernanza.
- `website/packages/validators/src/index.ts`: Esquemas Zod para entidades organizacionales y gobernanza.
- `website/packages/config/src/index.ts`: Módulo `plataforma` y colecciones registradas.
- `website/docs/`: 20 documentos de gobernanza, seguridad, finops, resiliencia y 3 ADRs.
