# 🧭 IMPLEMENTACIÓN DE FASE 9 — CONTROL TOWER & GEMELO DIGITAL TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Transformar a Baqueano en una plataforma territorial observable y proactiva, dotando a los administradores y operadores de una **Torre de Control** con observabilidad en tiempo real sobre los 17 territorios de Nicaragua, gestión estricta del ciclo de vida de incidencias, difusión de alertas preventivas, análisis de demanda versus capacidad de carga y monitoreo de salud del sistema, protegiendo tanto a los exploradores como a los baqueanos locales sin alterar el código base nativo de Android.

---

## ⚙️ 2. CÓMO (HOW / PILARES DE ARQUITECTURA DE FASE 9)

1. **Torre de Control Centralizada (`/control-tower`)**:
   - Panel de comando administrativo con barra ejecutiva *"¿Todo está bien en Nicaragua?"*.
   - Pestañas funcionales para Gemelo Digital (17 territorios), Mesa de Incidencias, Alertas Operativas y Salud del Sistema.
2. **Gemelo Digital Territorial**:
   - Modelado exhaustivo de los 15 departamentos y 2 regiones autónomas (RACCN y RACCS).
   - Clasificación por estados honestos: `active_normal`, `partial_observation`, `incident_active` y `no_data`.
   - Indicadores integrados de demanda, capacidad de carga, riesgo meteorológico, conectividad de red y estado vial.
3. **Mesa de Triaje de Incidencias & SLA**:
   - Clasificación por severidad (`emergency`, `critical`, `major`, `moderate`, `minor`).
   - Bitácora inmutable de acciones (`actionLog`) con trazabilidad de autor, marca de tiempo y notas operativas.
   - Acciones interactivas para toma de incidentes ("Tomar Incidencia") y resolución verificada ("Marcar Resuelta").
4. **Consola de Alertas Operativas**:
   - Alertas tempranas categorizadas por clima, seguridad, capacidad, accesibilidad e infraestructura.
   - Instrucciones claras y accionables para baqueanos y cooperativas locales.
5. **Tipado Estricto & Esquemas Zod**:
   - Nuevos contratos en `@baqueano/types`: `TerritoryOperationalState`, `IncidentRecord`, `AlertRecord`, `SystemHealthStatus`.
   - Validadores formales en `@baqueano/validators`: `territoryOperationalStateSchema`, `incidentRecordSchema`, `alertRecordSchema`.
6. **Aislamiento Total de Flutter/Android**:
   - `/lib`, `/android`, `/test` y `pubspec.yaml` permanecen 100% intactos.

---

## 📦 3. QUÉ (WHAT / ENTREGABLES INTEGRADOS DE FASE 9)

- `website/apps/admin/src/app/control-tower/page.tsx`: Dashboard administrativo de Torre de Control.
- `website/apps/admin/src/services/control-tower.service.ts`: Servicio operativo territorial y de incidencias.
- `website/packages/types/src/index.ts`: Modelos tipados de operaciones en tiempo real.
- `website/packages/validators/src/index.ts`: Esquemas Zod de validación operacional.
- `website/packages/config/src/index.ts`: Módulos de administración y colecciones Firestore registradas.
- `website/docs/`: 12 documentos normativos de arquitectura, gobernanza y calidad de datos.
