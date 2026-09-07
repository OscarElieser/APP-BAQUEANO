// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — REVIEWS & REPUTATION SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Fomentar la confianza y transparencia entre exploradores y anfitriones locales
// mediante un sistema de reseñas verificadas, evitando el spam y garantizando
// que las opiniones reflejen experiencias reales de turismo comunitario.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida calificaciones de 1 a 5 estrellas con Zod.
// - Moderación de estado: `pending` → `published` / `flagged`.
// - Soporte de respuestas oficiales de anfitriones (`hostReply`).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getPlaceReviews()`, `submitReview()`.
// ============================================================================

import type { DataResult, ReviewRecord } from "@baqueano/types";
import { reviewRecordSchema, type ReviewRecordInput } from "@baqueano/validators";

const SEED_REVIEWS: readonly ReviewRecord[] = [
  {
    id: "rev-somoto-01",
    userId: "user-exp-1",
    userName: "Mateo S.",
    placeId: "place-somoto",
    rating: 5,
    comment: "Excelente guiado por parte de don Ramón. La caminata por los farallones rocosos y el paseo en bote son inolvidables.",
    status: "published",
    isVerifiedVisit: true,
    hostReply: "Muchas gracias por visitarnos Mateo, los esperamos de vuelta en Madriz.",
    createdAt: "2026-08-20T14:00:00.000Z"
  }
];

export async function getPlaceReviews(placeId: string): Promise<DataResult<ReviewRecord>> {
  const items = SEED_REVIEWS.filter((r) => !placeId || r.placeId === placeId || r.placeId === "place-somoto");
  return {
    source: "seed",
    isConnected: false,
    items,
    warning: "Reseñas demostrativas locales."
  };
}

export async function submitReview(input: ReviewRecordInput): Promise<{ success: boolean; review?: ReviewRecord; error?: string }> {
  try {
    const validated = reviewRecordSchema.parse(input);
    const newReview: ReviewRecord = {
      ...validated,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      review: newReview
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al enviar la reseña."
    };
  }
}
