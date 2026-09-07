/**
 * WHY
 * Guards Firestore writes, AI responses, and Control Tower operations before records can affect public web or Android clients.
 *
 * HOW
 * Uses Zod schemas that mirror shared TypeScript models and reject malformed or invalid operational states.
 *
 * WHAT
 * Destination, role, reservation, notification, review, AI trip planner, incident, alert, and admin form schemas.
 */
import { z } from "zod";

export const userRoleSchema = z.enum(["super_admin", "admin", "host", "explorer"]);
export const publishStatusSchema = z.enum(["draft", "review", "published", "archived"]);
export const difficultySchema = z.enum(["suave", "media", "alta", "experta"]);

export const destinationSchema = z.object({
  id: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(3).max(90),
  department: z.string().min(2),
  municipality: z.string().min(2),
  category: z.string().min(2),
  coordinates: z.object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180)
  }),
  summary: z.string().min(20).max(240),
  story: z.string().min(40).max(2200),
  priceUsd: z.number().finite().min(0).max(5000),
  difficulty: difficultySchema,
  durationHours: z.number().finite().positive().max(168),
  rating: z.number().finite().min(0).max(5),
  sustainabilityScore: z.number().finite().min(0).max(100),
  heroImage: z.string().min(1),
  gallery: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  status: publishStatusSchema,
  updatedAtIso: z.string().datetime()
});

export type DestinationInput = z.infer<typeof destinationSchema>;

export const placeRecordSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(2).max(120),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  subcategory: z.string().default(""),
  description: z.string().default(""),
  departmentId: z.string().min(1),
  departmentName: z.string().min(1),
  municipalityId: z.string().min(1),
  municipalityName: z.string().min(1),
  address: z.string().default(""),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  geohash: z.string().default(""),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  imageUrl: z.string().default(""),
  imageUrls: z.array(z.string()).default([]),
  openingHours: z.string().nullable().optional(),
  is24Hours: z.boolean().default(false),
  isOpen: z.boolean().default(true),
  isEmergency: z.boolean().default(false),
  isTourist: z.boolean().default(false),
  isCommercial: z.boolean().default(false),
  verified: z.boolean().default(false),
  verificationSource: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  lastVerifiedAt: z.string().nullable().optional(),
  rating: z.number().finite().min(0).max(5).default(5),
  reviewCount: z.number().int().min(0).default(0),
  status: z.enum(["published", "draft", "archived"]).default("published"),
  createdAt: z.string(),
  updatedAt: z.string(),
  distanceKm: z.number().finite().optional(),
  seoSlug: z.string().nullable().optional()
});

export const categoryRecordSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().default(""),
  icon: z.string().default("place"),
  type: z.enum(["culture", "commerce", "entertainment", "health", "emergency", "transport"]).default("culture"),
  order: z.number().int().default(0),
  active: z.boolean().default(true)
});

export const auditLogSchema = z.object({
  id: z.string().min(1),
  actorId: z.string().min(1),
  actorEmail: z.string().email(),
  actorRole: userRoleSchema,
  action: z.string().min(2),
  collection: z.string().min(1),
  documentId: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  createdAtIso: z.string()
});

export const businessRecordSchema = z.object({
  id: z.string().min(1),
  ownerUid: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().default(""),
  category: z.string().min(1),
  department: z.string().min(1),
  municipality: z.string().min(1),
  address: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().email(),
  website: z.string().nullable().optional(),
  imageUrl: z.string().default(""),
  galleryUrls: z.array(z.string()).default([]),
  status: z.enum(["pending_review", "published", "archived"]).default("pending_review"),
  verified: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const userSavedPlaceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  placeId: z.string().min(1),
  savedAt: z.string()
});

export const businessSubscriptionRecordSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  plan: z.enum(["starter", "growth", "alliance"]),
  status: z.enum(["active", "past_due", "cancelled"]),
  validUntil: z.string(),
  autoRenew: z.boolean().default(true)
});

export const paymentOrderRecordSchema = z.object({
  id: z.string().min(1),
  createdByUid: z.string().min(1),
  customerEmail: z.string().email(),
  destinationId: z.string().min(1),
  destinationName: z.string().min(1),
  amountUsd: z.number().finite().positive(),
  status: z.enum(["pending", "paid", "cancelled"]),
  createdAt: z.string()
});

export const reservationSchema = z.object({
  id: z.string().min(1),
  destinationId: z.string().min(1),
  explorerId: z.string().min(1),
  hostId: z.string().min(1),
  dateIso: z.string(),
  people: z.number().int().min(1).max(50),
  status: z.enum(["requested", "pending", "pending_confirmation", "confirmed", "cancelled", "completed", "expired"]).default("requested"),
  serviceName: z.string().optional(),
  currency: z.enum(["NIO", "USD"]).default("USD"),
  unitPrice: z.number().finite().nonnegative().optional(),
  totalPrice: z.number().finite().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const notificationRecordSchema = z.object({
  id: z.string().min(1),
  recipientUid: z.string().min(1),
  type: z.enum([
    "reservation_requested",
    "reservation_confirmed",
    "reservation_cancelled",
    "business_verified",
    "subscription_expiring",
    "review_received",
    "system_alert"
  ]),
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(500),
  read: z.boolean().default(false),
  resourcePath: z.string().optional(),
  createdAt: z.string()
});

export const reviewRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(2).max(80),
  businessId: z.string().optional(),
  placeId: z.string().optional(),
  reservationId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
  status: z.enum(["pending", "published", "flagged", "rejected"]).default("pending"),
  isVerifiedVisit: z.boolean().default(false),
  hostReply: z.string().max(1000).optional(),
  createdAt: z.string()
});

// ============================================================================
// 🧭 AI VALIDATORS (FASE 8)
// ============================================================================

export const tripProfileSchema = z.object({
  days: z.number().int().min(1).max(14).default(3),
  groupSize: z.number().int().min(1).max(30).default(2),
  budgetUsd: z.number().finite().min(20).max(10000).default(300),
  currency: z.enum(["USD", "NIO"]).default("USD"),
  department: z.string().optional(),
  interests: z.array(z.string()).default(["naturaleza", "cultura"]),
  travelStyle: z.enum(["relajado", "aventura", "cultural", "ecologico"]).default("ecologico"),
  restrictions: z.string().max(300).optional()
});

export const riskAssessmentSchema = z.object({
  level: z.enum(["low", "moderate", "high", "unknown"]).default("low"),
  explanation: z.string(),
  factors: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([])
});

export const itineraryStopSchema = z.object({
  placeId: z.string(),
  placeName: z.string(),
  department: z.string(),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  description: z.string(),
  estimatedCostUsd: z.number().finite().nonnegative(),
  coordinates: z.object({
    latitude: z.number().finite(),
    longitude: z.number().finite()
  }),
  source: z.literal("verified_database")
});

export const itineraryDayPlanSchema = z.object({
  dayNumber: z.number().int().positive(),
  theme: z.string(),
  stops: z.array(itineraryStopSchema),
  dayBudgetUsd: z.number().finite().nonnegative()
});

export const itineraryResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  totalDays: z.number().int().positive(),
  days: z.array(itineraryDayPlanSchema),
  totalEstimatedBudgetUsd: z.number().finite().nonnegative(),
  totalEstimatedBudgetNio: z.number().finite().nonnegative(),
  risk: riskAssessmentSchema,
  sustainabilityTips: z.array(z.string()),
  localContactsSuggested: z.array(z.string()),
  sourcesCount: z.number().int().nonnegative(),
  generatedAtIso: z.string()
});

// ============================================================================
// 🧭 CONTROL TOWER & INCIDENTS (FASE 9)
// ============================================================================

export const incidentRecordSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "DATA_ERROR",
    "BUSINESS_REPORT",
    "DESTINATION_CLOSED",
    "MAP_ERROR",
    "RESERVATION_ISSUE",
    "SAFETY_REPORT",
    "SYSTEM_FAILURE",
    "CONTENT_REPORT"
  ]),
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(1000),
  territoryId: z.string().min(1),
  territoryName: z.string().min(1),
  placeId: z.string().optional(),
  businessId: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  status: z.enum(["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "CLOSED"]).default("OPEN"),
  source: z.enum(["system", "community", "host", "admin"]).default("system"),
  reportedByEmail: z.string().email().optional(),
  assignedToEmail: z.string().email().optional(),
  resolutionNotes: z.string().max(1000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().optional()
});

export const alertRecordSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["system", "weather", "capacity", "safety", "freshness"]),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  territoryId: z.string().optional(),
  territoryName: z.string().optional(),
  message: z.string().min(3).max(300),
  source: z.enum(["system_monitor", "official_ineter", "community"]).default("system_monitor"),
  acknowledged: z.boolean().default(false),
  createdAt: z.string(),
  expiresAt: z.string().optional()
});

export const territoryOperationalStateSchema = z.object({
  territoryId: z.string().min(1),
  territoryName: z.string().min(1),
  status: z.enum(["NORMAL", "ATTENTION", "DEGRADED", "CRITICAL", "UNKNOWN"]).default("NORMAL"),
  activePlacesCount: z.number().int().nonnegative(),
  activeBusinessesCount: z.number().int().nonnegative(),
  openIncidentsCount: z.number().int().nonnegative(),
  activeAlertsCount: z.number().int().nonnegative(),
  demandLevel: z.enum(["LOW", "NORMAL", "HIGH", "VERY_HIGH"]).default("NORMAL"),
  capacityStatus: z.enum(["AVAILABLE", "LIMITED", "FULL", "UNKNOWN"]).default("AVAILABLE"),
  coordinates: z.object({
    latitude: z.number().finite(),
    longitude: z.number().finite()
  }),
  updatedAt: z.string()
});

export type PlaceRecordInput = z.infer<typeof placeRecordSchema>;
export type CategoryRecordInput = z.infer<typeof categoryRecordSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
export type BusinessRecordInput = z.infer<typeof businessRecordSchema>;
export type UserSavedPlaceInput = z.infer<typeof userSavedPlaceSchema>;
export type BusinessSubscriptionRecordInput = z.infer<typeof businessSubscriptionRecordSchema>;
export type PaymentOrderRecordInput = z.infer<typeof paymentOrderRecordSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type NotificationRecordInput = z.infer<typeof notificationRecordSchema>;
export type ReviewRecordInput = z.infer<typeof reviewRecordSchema>;
export type TripProfileInput = z.infer<typeof tripProfileSchema>;
export type ItineraryResponseOutput = z.infer<typeof itineraryResponseSchema>;
export type IncidentRecordInput = z.infer<typeof incidentRecordSchema>;
export type AlertRecordInput = z.infer<typeof alertRecordSchema>;
export type TerritoryOperationalStateInput = z.infer<typeof territoryOperationalStateSchema>;
