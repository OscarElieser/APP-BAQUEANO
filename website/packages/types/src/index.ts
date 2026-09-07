/**
 * WHY
 * Keeps public web, admin, and Android-aligned Firestore records compatible.
 *
 * HOW
 * Defines strict TypeScript contracts with stable ids, slugs, roles, status fields, AI, and Control Tower schemas.
 *
 * WHAT
 * Shared models for destinations, businesses, territories, users, payments, reviews, notifications, AI itineraries, incidents, alerts, and audits.
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

export type ReservationStatus = "requested" | "pending_confirmation" | "confirmed" | "cancelled" | "completed" | "expired";

export interface Reservation {
  readonly id: string;
  readonly destinationId: string;
  readonly explorerId: string;
  readonly hostId: string;
  readonly dateIso: string;
  readonly people: number;
  readonly status: "pending" | "confirmed" | "cancelled" | "completed" | ReservationStatus;
  readonly serviceName?: string;
  readonly currency?: "NIO" | "USD";
  readonly unitPrice?: number;
  readonly totalPrice?: number;
  readonly notes?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export type NotificationType =
  | "reservation_requested"
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "business_verified"
  | "subscription_expiring"
  | "review_received"
  | "system_alert";

export interface NotificationRecord {
  readonly id: string;
  readonly recipientUid: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly read: boolean;
  readonly resourcePath?: string;
  readonly createdAt: string;
}

export interface ReviewRecord {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly businessId?: string;
  readonly placeId?: string;
  readonly reservationId?: string;
  readonly rating: number; // 1 to 5
  readonly comment: string;
  readonly status: "pending" | "published" | "flagged" | "rejected";
  readonly isVerifiedVisit: boolean;
  readonly hostReply?: string;
  readonly createdAt: string;
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

export type PaymentProvider = "bac" | "lafise" | "banpro" | "sandbox";

export interface PaymentTransactionRecord {
  readonly id: string;
  readonly orderId: string;
  readonly provider: PaymentProvider;
  readonly transactionReference: string;
  readonly amount: number;
  readonly currency: "NIO" | "USD";
  readonly status: "pending" | "authorized" | "paid" | "failed" | "refunded";
  readonly maskedCard?: string;
  readonly timestamp: string;
}

export interface BusinessSubscriptionRecord {
  readonly id: string;
  readonly businessId: string;
  readonly plan: "starter" | "growth" | "alliance";
  readonly status: "active" | "past_due" | "cancelled";
  readonly validUntil: string;
  readonly autoRenew: boolean;
}

// ============================================================================
// 🧭 AI & COPILOTO TERRITORIAL (FASE 8)
// ============================================================================

export interface TripProfile {
  readonly days: number;
  readonly groupSize: number;
  readonly budgetUsd: number;
  readonly currency: "USD" | "NIO";
  readonly department?: string;
  readonly interests: readonly string[];
  readonly travelStyle: "relajado" | "aventura" | "cultural" | "ecologico";
  readonly restrictions?: string;
}

export interface ItineraryStop {
  readonly placeId: string;
  readonly placeName: string;
  readonly department: string;
  readonly timeOfDay: "morning" | "afternoon" | "evening";
  readonly description: string;
  readonly estimatedCostUsd: number;
  readonly coordinates: GeoPointLike;
  readonly source: "verified_database";
}

export interface ItineraryDayPlan {
  readonly dayNumber: number;
  readonly theme: string;
  readonly stops: readonly ItineraryStop[];
  readonly dayBudgetUsd: number;
}

export type RiskLevel = "low" | "moderate" | "high" | "unknown";

export interface RiskAssessment {
  readonly level: RiskLevel;
  readonly explanation: string;
  readonly factors: readonly string[];
  readonly recommendations: readonly string[];
}

export interface ItineraryResponse {
  readonly title: string;
  readonly summary: string;
  readonly totalDays: number;
  readonly days: readonly ItineraryDayPlan[];
  readonly totalEstimatedBudgetUsd: number;
  readonly totalEstimatedBudgetNio: number;
  readonly risk: RiskAssessment;
  readonly sustainabilityTips: readonly string[];
  readonly localContactsSuggested: readonly string[];
  readonly sourcesCount: number;
  readonly generatedAtIso: string;
}

// ============================================================================
// 🧭 CONTROL TOWER & OPERACIONES TERRITORIALES (FASE 9)
// ============================================================================

export type IncidentType =
  | "DATA_ERROR"
  | "BUSINESS_REPORT"
  | "DESTINATION_CLOSED"
  | "MAP_ERROR"
  | "RESERVATION_ISSUE"
  | "SAFETY_REPORT"
  | "SYSTEM_FAILURE"
  | "CONTENT_REPORT";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus = "OPEN" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export interface IncidentRecord {
  readonly id: string;
  readonly type: IncidentType;
  readonly title: string;
  readonly description: string;
  readonly territoryId: string;
  readonly territoryName: string;
  readonly placeId?: string;
  readonly businessId?: string;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly source: "system" | "community" | "host" | "admin";
  readonly reportedByEmail?: string;
  readonly assignedToEmail?: string;
  readonly resolutionNotes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resolvedAt?: string;
}

export type AlertType = "system" | "weather" | "capacity" | "safety" | "freshness";

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertRecord {
  readonly id: string;
  readonly type: AlertType;
  readonly severity: AlertSeverity;
  readonly territoryId?: string;
  readonly territoryName?: string;
  readonly message: string;
  readonly source: "system_monitor" | "official_ineter" | "community";
  readonly acknowledged: boolean;
  readonly createdAt: string;
  readonly expiresAt?: string;
}

export type TerritoryOperationalStatus = "NORMAL" | "ATTENTION" | "DEGRADED" | "CRITICAL" | "UNKNOWN";

export type DemandSignalLevel = "LOW" | "NORMAL" | "HIGH" | "VERY_HIGH";

export type CapacityLevel = "AVAILABLE" | "LIMITED" | "FULL" | "UNKNOWN";

export interface TerritoryOperationalState {
  readonly territoryId: string;
  readonly territoryName: string;
  readonly status: TerritoryOperationalStatus;
  readonly activePlacesCount: number;
  readonly activeBusinessesCount: number;
  readonly openIncidentsCount: number;
  readonly activeAlertsCount: number;
  readonly demandLevel: DemandSignalLevel;
  readonly capacityStatus: CapacityLevel;
  readonly coordinates: GeoPointLike;
  readonly updatedAt: string;
}

export interface SystemHealthStatus {
  readonly serviceName: string;
  readonly status: "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";
  readonly latencyMs: number;
  readonly errorRatePercent: number;
  readonly lastCheckedIso: string;
  readonly version: string;
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
