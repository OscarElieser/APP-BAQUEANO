# 🧭 MODELO DE RESERVAS Y CONTRATOS — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Estructurar el proceso de coordinación de experiencias y servicios turísticos rurales entre exploradores y baqueanos, protegiendo la inmutabilidad de precios acordados y garantizando que ninguna reserva se confirme automáticamente sin el consentimiento expreso del anfitrión local.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & ESTADOS)

- **Snapshot de Precios Inmutable**: Cada registro de reserva almacena `unitPrice` y `totalPrice` fijados al momento de la solicitud, evitando discrepancias si las tarifas del negocio cambian en el futuro.
- **Ciclo de Estados**:

```text
requested (Solicitada por explorador)
    ↓
pending_confirmation (En revisión por anfitrión)
    ↓
confirmed (Aceptada con instrucciones) / cancelled (Rechazada con motivo)
    ↓
completed (Experiencia turística concluida)
```

- **Protección contra Doble Reserva**: Idempotencia mediante claves deterministas basadas en `explorerId + hostId + dateIso`.

---

## 📦 3. QUÉ (WHAT / ESQUEMA DE DATOS FIRESTORE)

```typescript
export interface ReservationRecord {
  readonly id: string;
  readonly destinationId: string;
  readonly explorerId: string;
  readonly hostId: string;
  readonly serviceName: string;
  readonly dateIso: string;
  readonly people: number;
  readonly currency: "NIO" | "USD";
  readonly unitPrice: number;
  readonly totalPrice: number;
  readonly status: "requested" | "pending_confirmation" | "confirmed" | "cancelled" | "completed" | "expired";
  readonly notes?: string;
  readonly cancellationReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```
