# 🧭 MODELO DE REPUTACIÓN Y RESEÑAS VERIFICADAS — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Construir un clima de confianza recíproca en el ecosistema turístico de Nicaragua mediante valoraciones honestas y fundamentadas, combatiendo el fraude de reseñas falsas y reconociendo la calidad humana del guiado comunitario campesino.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & MODERACIÓN)

- **Distintivo de "Visita Verificada"**: Se otorga automáticamente cuando el explorador cuenta con un registro de reserva completado (`status == 'completed'`) con el anfitrión o destino.
- **Flujo de Moderación**:
  - `pending`: En revisión automática anti-spam.
  - `published`: Visible públicamente en la ficha del destino/negocio.
  - `flagged`: Reportada por infracción a las normas comunitarias para revisión administrativa.
- **Derecho a Respuesta del Anfitrión**: Todo anfitrión verificado puede publicar una respuesta oficial profesional (`hostReply`), fomentando la resolución constructiva de incidentes.

---

## 📦 3. QUÉ (WHAT / ESQUEMA DE DATOS)

```typescript
export interface ReviewRecord {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly businessId?: string;
  readonly placeId?: string;
  readonly reservationId?: string;
  readonly rating: number; // 1 a 5
  readonly comment: string;
  readonly status: "pending" | "published" | "flagged" | "rejected";
  readonly isVerifiedVisit: boolean;
  readonly hostReply?: string;
  readonly createdAt: string;
}
```
