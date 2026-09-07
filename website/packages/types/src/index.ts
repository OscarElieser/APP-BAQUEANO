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

export interface PlaceRecord {
  readonly placeId: string;
  readonly name: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly subcategory: string;
  readonly description: string;
  readonly departmentId: string;
  readonly departmentName: string;
  readonly municipalityId: string;
  readonly municipalityName: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly geohash: string;
  readonly phone?: string | null;
  readonly whatsapp?: string | null;
  readonly website?: string | null;
  readonly imageUrl: string;
  readonly imageUrls: readonly string[];
  readonly openingHours?: string | null;
  readonly is24Hours: boolean;
  readonly isOpen: boolean;
  readonly isEmergency: boolean;
  readonly isTourist: boolean;
  readonly isCommercial: boolean;
  readonly verified: boolean;
  readonly verificationSource?: string | null;
  readonly sourceUrl?: string | null;
  readonly lastVerifiedAt?: string | null;
  readonly rating: number;
  readonly reviewCount: number;
  readonly status: "published" | "draft" | "archived";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly distanceKm?: number;
  readonly seoSlug?: string | null;
}

export interface CategoryRecord {
  readonly categoryId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly type: "culture" | "commerce" | "entertainment" | "health" | "emergency" | "transport";
  readonly order: number;
  readonly active: boolean;
}

export interface DepartmentRecord {
  readonly id: string;
  readonly name: string;
  readonly zone: string;
  readonly capital: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface MunicipalityRecord {
  readonly id: string;
  readonly departmentId: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface BusinessRecord {
  readonly id: string;
  readonly ownerUid: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly department: string;
  readonly municipality: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  readonly website?: string | null;
  readonly imageUrl: string;
  readonly galleryUrls: readonly string[];
  readonly status: "pending_review" | "published" | "archived";
  readonly verified: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserSavedPlace {
  readonly id: string;
  readonly userId: string;
  readonly placeId: string;
  readonly savedAt: string;
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

export interface PaymentOrderRecord {
  readonly id: string;
  readonly createdByUid: string;
  readonly customerEmail: string;
  readonly destinationId: string;
  readonly destinationName: string;
  readonly amountUsd: number;
  readonly status: "pending" | "paid" | "cancelled";
  readonly createdAt: string;
}

export interface BusinessSubscriptionRecord {
  readonly id: string;
  readonly businessId: string;
  readonly plan: "starter" | "growth" | "alliance";
  readonly status: "active" | "past_due" | "cancelled";
  readonly validUntil: string;
  readonly autoRenew: boolean;
}

export interface AuditLog {
  readonly id: string;
  readonly actorId: string;
  readonly actorEmail: string;
  readonly actorRole: UserRole;
  readonly action: string;
  readonly collection: string;
  readonly documentId: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAtIso: string;
}

export interface DataResult<T> {
  readonly source: "firestore" | "seed";
  readonly isConnected: boolean;
  readonly items: readonly T[];
  readonly warning?: string;
}
