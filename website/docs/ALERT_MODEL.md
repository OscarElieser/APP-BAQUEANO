# 🧭 ALERT MODEL — SISTEMA DE ALERTAS TEMPRANAS & BROADCAST TERRITORIAL

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Difundir advertencias tempranas de seguridad, condiciones meteorológicas extremas, límites de capacidad de carga y cortes de conectividad antes de que se conviertan en emergencias o afecten negativamente la experiencia de viaje.

---

## ⚙️ 2. CÓMO (HOW / CATEGORÍAS, ALCANCE & REGLAS DE DESPACHO)

Las alertas se categorizan y despachan según su ámbito geográfico y severidad:

- **Categorías**:
  - `weather`: Lluvias torrenciales, oleaje elevado, vientos fuertes o actividad volcánica.
  - `security`: Recomendaciones de seguridad comunitaria o senderos cerrados.
  - `capacity`: Avisos de destino lleno y activación de turnos de visita.
  - `accessibility`: Deslaves, obras en carreteras o interrupción de transporte lacustre.
  - `infrastructure`: Cortes de energía eléctrica, agua o fibra óptica.

- **Alcance (`scope`)**:
  - `national`: Visible en todo el ecosistema Baqueano.
  - `territory`: Específica para un departamento o región autónoma.
  - `municipality`: Circunscrita a un municipio en particular.
  - `destination`: Focalizada en un atractivo o sendero individual.

---

## 📦 3. QUÉ (WHAT / ESPECIFICACIÓN DE REGISTRO)

```typescript
export interface AlertRecord {
  readonly alertId: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: AlertSeverity;
  readonly category: AlertCategory;
  readonly territoryId: string;
  readonly territoryName: string;
  readonly municipalityId?: string;
  readonly placeId?: string;
  readonly scope: AlertScope;
  readonly isActive: boolean;
  readonly startsAt: string;
  readonly expiresAt?: string;
  readonly guidance: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```
