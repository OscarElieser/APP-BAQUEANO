/**
 * WHY
 * Keeps public web, admin, and Android-aligned Firestore records compatible.
 *
 * HOW
 * Defines strict TypeScript contracts with stable ids, slugs, roles, and status fields.
 *
 * WHAT
 * Shared models for destinations, businesses, territories, users, payments, and audits.
 */
export type UserRole = "super_admin" | "admin" | "host" | "explorer";

export type PublishStatus = "draft" | "review" | "published" | "archived";

export type Difficulty = "suave" | "media" | "alta" | "experta";

export interface GeoPointLike {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Destination {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly department: string;
  readonly municipality: string;
  readonly category: string;
  readonly coordinates: GeoPointLike;
  readonly summary: string;
  readonly story: string;
  readonly priceUsd: number;
  readonly difficulty: Difficulty;
  readonly durationHours: number;
  readonly rating: number;
  readonly sustainabilityScore: number;
  readonly heroImage: string;
  readonly gallery: readonly string[];
  readonly tags: readonly string[];
  readonly status: PublishStatus;
  readonly updatedAtIso: string;
}

export interface Business {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly territory: string;
  readonly type: "hostal" | "comedor" | "guia" | "transporte" | "artesania";
  readonly status: PublishStatus;
  readonly contactPhone: string;
}

export interface Territory {
  readonly slug: string;
  readonly name: string;
  readonly type: "departamento" | "region_autonoma";
  readonly capital: string;
  readonly culturalSignal: string;
  readonly landscape: string;
}

export interface BaqueanoUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
  readonly businessId?: string;
  readonly createdAtIso: string;
}

export interface Reservation {
  readonly id: string;
  readonly destinationId: string;
  readonly explorerId: string;
  readonly hostId: string;
  readonly dateIso: string;
  readonly people: number;
  readonly status: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface Payment {
  readonly id: string;
  readonly reservationId: string;
  readonly amountUsd: number;
  readonly status: "pending" | "paid" | "failed" | "refunded";
}

export interface Subscription {
  readonly id: string;
  readonly businessId: string;
  readonly plan: "starter" | "growth" | "alliance";
  readonly status: "active" | "past_due" | "cancelled";
}

export interface AuditLog {
  readonly id: string;
  readonly actorId: string;
  readonly actorRole: UserRole;
  readonly action: string;
  readonly collection: string;
  readonly documentId: string;
  readonly createdAtIso: string;
}
