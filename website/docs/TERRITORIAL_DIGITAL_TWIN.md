# 🧭 TERRITORIAL DIGITAL TWIN — GEMELO DIGITAL DE LOS 17 TERRITORIOS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Modelar dinámicamente el estado operativo, ecológico y turístico de cada uno de los 15 departamentos y 2 regiones autónomas de Nicaragua, permitiendo visibilizar la realidad territorial en tiempo real para anticipar cuellos de botella y preservar los recursos naturales.

---

## ⚙️ 2. CÓMO (HOW / TAXONOMÍA & ESTADOS DE OBSERVACIÓN)

Cada territorio se clasifica bajo un estado honesto e inalterable:

- 🟢 `active_normal`: Operación regular con capacidad holgada, accesibilidad abierta y bajo riesgo meteorológico.
- 🟡 `partial_observation`: Alerta de capacidad strained, mantenimiento vial o degradación temporal de red.
- 🔴 `incident_active`: Evento en curso que restringe el paso o requiere intervención de emergencia.
- ⚪ `no_data`: Falta de telemetría reciente (&gt; 4 horas sin reporte comunitario verificado).

---

## 📦 3. QUÉ (WHAT / MATRIZ DE LOS 17 TERRITORIOS NACIONALES)

| Territorio | Categoría | Estado Base | Riesgo Clima | Conectividad | Accesibilidad Vial |
| --- | --- | --- | --- | --- | --- |
| **Boaco** | Departamento | `active_normal` | Bajo | Moderada | Abierta |
| **Carazo** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Chinandega** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Chontales** | Departamento | `active_normal` | Bajo | Moderada | Abierta |
| **Estelí** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Granada** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Jinotega** | Departamento | `active_normal` | Medio | Moderada | Abierta |
| **León** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Madriz** | Departamento | `active_normal` | Bajo | Moderada | Abierta |
| **Managua** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Masaya** | Departamento | `active_normal` | Bajo | Alta | Abierta |
| **Matagalpa** | Departamento | `active_normal` | Medio | Moderada | Abierta |
| **Nueva Segovia** | Departamento | `active_normal` | Bajo | Moderada | Abierta |
| **Río San Juan** | Departamento | `incident_active` | Alto (Crecida) | Baja | Cerrada fluvial |
| **Rivas & Ometepe** | Departamento | `partial_observation` | Medio | Alta | Precaución |
| **Costa Caribe Norte (RACCN)** | Región Autónoma | `no_data` | Medio | Baja | Precaución |
| **Costa Caribe Sur (RACCS)** | Región Autónoma | `partial_observation` | Medio | Moderada | Abierta |
