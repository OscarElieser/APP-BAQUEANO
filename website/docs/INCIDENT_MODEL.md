# 🧭 INCIDENT MODEL — MODELO DE GESTIÓN Y RESOLUCIÓN DE INCIDENCIAS

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Estandarizar la recepción, clasificación, escalamiento y resolución de incidencias en territorio nicaragüense, garantizando tiempos de respuesta estrictos (SLA), bitácora inmutable de acciones y trazabilidad para proteger la integridad del visitante y de las comunidades.

---

## ⚙️ 2. CÓMO (HOW / CICLO DE VIDA, SEVERIDAD & SLA)

```text
[Reporte Emitido (Host / Admin / Explorador)]
                     │
                     ▼
             [Estado: `open`] ─────── (SLA Triage: < 15 min)
                     │
                     ▼
         [Estado: `in_progress`] ─── (Acciones operativas en bitácora)
                     │
                     ▼
          [Estado: `resolved`] ───── (Verificación en territorio + Notificación)
```

### Matriz de Severidad y Tiempos de Respuesta (SLA):

- **`emergency`**: Riesgo inminente de vida o desastre natural mayor. SLA de respuesta: **&lt; 5 minutos**.
- **`critical`**: Cierre de rutas principales o desbordamiento fluvial. SLA de respuesta: **&lt; 15 minutos**.
- **`major`**: Falla eléctrica/red generalizada en un municipio turístico. SLA de respuesta: **&lt; 45 minutos**.
- **`moderate`**: Saturación de sendero o falta de guías certificados. SLA de respuesta: **&lt; 2 horas**.
- **`minor`**: Corrección de ficha técnica o señalización deteriorada. SLA de respuesta: **&lt; 24 horas**.

---

## 📦 3. QUÉ (WHAT / ESTRUCTURA DE DATOS & AUDITORÍA)

Cada registro de incidencia (`IncidentRecord`) implementa:

```typescript
export interface IncidentRecord {
  readonly incidentId: string;
  readonly title: string;
  readonly description: string;
  readonly type: IncidentType;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly territoryId: string;
  readonly territoryName: string;
  readonly municipalityName?: string;
  readonly reportedBy: string;
  readonly reportedByRole: "super_admin" | "admin" | "host" | "explorer" | "system";
  readonly assignedTo?: string;
  readonly affectedHostsCount: number;
  readonly affectedExplorersEstimate: number;
  readonly actionLog: readonly IncidentActionLogItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly targetResolutionTime?: string;
  readonly resolvedAt?: string;
}
```
