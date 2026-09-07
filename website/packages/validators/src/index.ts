/**
 * WHY
 * Guards Firestore writes before records can affect public web or Android clients.
 *
 * HOW
 * Uses Zod schemas that mirror shared TypeScript models and reject malformed values.
 *
 * WHAT
 * Destination, role, and admin form schemas ready for React Hook Form.
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

export type PlaceRecordInput = z.infer<typeof placeRecordSchema>;
export type CategoryRecordInput = z.infer<typeof categoryRecordSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
export type BusinessRecordInput = z.infer<typeof businessRecordSchema>;
export type UserSavedPlaceInput = z.infer<typeof userSavedPlaceSchema>;
export type BusinessSubscriptionRecordInput = z.infer<typeof businessSubscriptionRecordSchema>;
export type PaymentOrderRecordInput = z.infer<typeof paymentOrderRecordSchema>;
