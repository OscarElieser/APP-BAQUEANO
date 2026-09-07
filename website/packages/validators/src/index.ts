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

// ============================================================================
// 🧭 ENTERPRISE & MULTI-ORGANIZATION VALIDATORS (FASE 10)
// ============================================================================

export const organizationRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(100),
  legalName: z.string().min(2).max(120),
  type: z.enum([
    "central_platform",
    "institution_official",
    "municipality",
    "cooperative",
    "territorial_operator",
    "tourism_association"
  ]),
  status: z.enum(["active", "pending_verification", "suspended", "archived"]).default("pending_verification"),
  territories: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(25).optional(),
  taxId: z.string().max(30).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const organizationMembershipSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["org_admin", "org_operator", "org_auditor", "org_member"]).default("org_member"),
  status: z.enum(["active", "invited", "suspended"]).default("active"),
  scope: z.array(z.string()).default([]),
  assignedAt: z.string()
});

export const apiKeyRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  keyPrefix: z.string().min(3).max(10),
  keyHash: z.string().min(32),
  label: z.string().min(2).max(80),
  scopes: z.array(z.enum(["places.read", "businesses.read", "territories.read", "alerts.read", "reservations.manage"])),
  status: z.enum(["active", "revoked", "expired"]).default("active"),
  rateLimitPerMin: z.number().int().min(1).max(5000).default(60),
  lastUsedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string()
});

export const partnerWebhookSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  endpointUrl: z.string().url(),
  secretHash: z.string().min(32),
  subscribedEvents: z.array(z.string()).default([]),
  status: z.enum(["active", "failing", "disabled"]).default("active"),
  failureCount: z.number().int().nonnegative().default(0),
  lastDeliveredAt: z.string().optional(),
  createdAt: z.string()
});

export const dataGovernanceSchema = z.object({
  datasetId: z.string().min(1),
  domainName: z.string().min(2).max(60),
  ownerRole: z.string().min(2).max(60),
  classification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
  retentionDays: z.number().int().positive(),
  containsPii: z.boolean().default(false),
  sourceOfTruth: z.string().min(2).max(80),
  qualitySlo: z.string().min(2).max(100),
  lastAuditIso: z.string()
});

// ============================================================================
// 🧭 SMART TOURISM & IoT VALIDATORS (FASE 11)
// ============================================================================

export const smartPointRecordSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(3).max(30),
  name: z.string().min(2).max(100),
  type: z.enum([
    "viewpoint",
    "trailhead",
    "cultural_site",
    "museum",
    "community_hub",
    "visitor_center",
    "safety_point",
    "eco_farm",
    "business_spot"
  ]),
  placeId: z.string().min(1),
  placeName: z.string().min(2),
  territoryId: z.string().min(1),
  territoryName: z.string().min(1),
  coordinates: z.object({
    latitude: z.number().finite(),
    longitude: z.number().finite()
  }),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
  qrEnabled: z.boolean().default(true),
  nfcEnabled: z.boolean().default(false),
  audioGuideUrl: z.string().optional(),
  emergencyContactPhone: z.string().max(30).optional(),
  maxCapacityEstimate: z.number().int().positive().optional(),
  currentOccupancyStatus: z.enum(["low", "moderate", "high", "full", "unknown"]).default("unknown"),
  assignedDeviceIds: z.array(z.string()).default([]),
  totalScansCount: z.number().int().nonnegative().default(0),
  lastInteractionAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const ioTDeviceRecordSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(80),
  type: z.enum([
    "weather_station",
    "footfall_counter",
    "river_level_gauge",
    "air_quality_monitor",
    "edge_gateway",
    "kiosk_display"
  ]),
  smartPointId: z.string().min(1),
  smartPointCode: z.string().min(1),
  territoryId: z.string().min(1),
  status: z.enum(["ONLINE", "DEGRADED", "OFFLINE", "MAINTENANCE", "UNKNOWN"]).default("UNKNOWN"),
  batteryPercent: z.number().int().min(0).max(100).optional(),
  powerSource: z.enum(["solar", "battery", "grid"]).default("solar"),
  connectivityType: z.enum(["cellular_4g", "wifi", "lorawan", "offline_buffer"]).default("cellular_4g"),
  firmwareVersion: z.string().max(40).optional(),
  lastSeenAt: z.string().optional(),
  lastTelemetryAt: z.string().optional(),
  assignedSensors: z.array(z.string()).default([]),
  createdAt: z.string()
});

export const sensorRecordSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  type: z.enum([
    "temperature_celsius",
    "humidity_relative",
    "rainfall_mm",
    "river_level_meters",
    "air_quality_aqi",
    "footfall_hourly",
    "battery_voltage"
  ]),
  unit: z.string().min(1).max(20),
  minPlausibleValue: z.number().finite(),
  maxPlausibleValue: z.number().finite(),
  lastValue: z.number().finite().optional(),
  lastQuality: z.enum(["VALID", "SUSPECT", "INVALID", "UNKNOWN"]).default("UNKNOWN"),
  lastReadingAt: z.string().optional()
});

export const sensorReadingSchema = z.object({
  sensorId: z.string().min(1),
  deviceId: z.string().min(1),
  type: z.enum([
    "temperature_celsius",
    "humidity_relative",
    "rainfall_mm",
    "river_level_meters",
    "air_quality_aqi",
    "footfall_hourly",
    "battery_voltage"
  ]),
  value: z.number().finite(),
  quality: z.enum(["VALID", "SUSPECT", "INVALID", "UNKNOWN"]).default("VALID"),
  deviceTimestamp: z.string(),
  receivedAt: z.string()
});

export const fieldMaintenanceTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(5).max(500),
  type: z.enum([
    "qr_replacement",
    "sensor_calibration",
    "battery_replacement",
    "signage_inspection",
    "device_repair",
    "point_audit"
  ]),
  smartPointId: z.string().min(1),
  smartPointCode: z.string().min(1),
  territoryId: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"]).default("OPEN"),
  assignedToName: z.string().max(80).optional(),
  assignedToRole: z.string().max(80).optional(),
  photoEvidenceUrl: z.string().optional(),
  resolutionNotes: z.string().max(500).optional(),
  createdAt: z.string(),
  completedAt: z.string().optional()
});

export const iotTelemetryPayloadSchema = z.object({
  deviceId: z.string().min(1),
  authToken: z.string().min(8),
  timestamp: z.string(),
  readings: z.array(
    z.object({
      sensorId: z.string().min(1),
      type: z.enum([
        "temperature_celsius",
        "humidity_relative",
        "rainfall_mm",
        "river_level_meters",
        "air_quality_aqi",
        "footfall_hourly",
        "battery_voltage"
      ]),
      value: z.number().finite(),
      unit: z.string().min(1)
    })
  ).min(1).max(20),
  batteryPercent: z.number().int().min(0).max(100).optional()
});

// ============================================================================
// 🧭 REGIONAL EXPANSION & COUNTRY VALIDATORS (FASE 12)
// ============================================================================

export const countryCodeEnum = z.enum(["NI", "CR", "GT", "HN", "SV", "BZ", "PA"]);

export const currencyCodeEnum = z.enum(["NIO", "CRC", "GTQ", "HNL", "USD", "BZD", "PAB"]);

export const localeCodeEnum = z.enum([
  "es-NI",
  "es-CR",
  "es-GT",
  "es-HN",
  "es-SV",
  "es-PA",
  "es",
  "en"
]);

export const countryStatusEnum = z.enum([
  "PLANNED",
  "CONFIGURING",
  "PILOT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED"
]);

export const regionalCapabilitySchema = z.object({
  destinations: z.boolean().default(false),
  businesses: z.boolean().default(false),
  reservations: z.boolean().default(false),
  onlinePayments: z.boolean().default(false),
  aiAssistant: z.boolean().default(false),
  iotSensors: z.boolean().default(false),
  fieldOperations: z.boolean().default(false)
});

export const moneyAmountSchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: currencyCodeEnum
});

export const countryRecordSchema = z.object({
  id: z.string().min(2).max(10),
  code: countryCodeEnum,
  name: z.string().min(2).max(80),
  officialName: z.string().min(2).max(120),
  status: countryStatusEnum.default("PLANNED"),
  defaultLocale: localeCodeEnum.default("es-NI"),
  supportedLocales: z.array(localeCodeEnum).min(1),
  defaultCurrency: currencyCodeEnum.default("USD"),
  supportedCurrencies: z.array(currencyCodeEnum).min(1),
  timezone: z.string().min(3),
  territorialStructure: z.object({
    level1Label: z.string().min(2),
    level2Label: z.string().min(2),
    hasIndigenousTerritories: z.boolean().default(false),
    indigenousTerritoryLabel: z.string().optional()
  }),
  capabilities: regionalCapabilitySchema,
  emergencyInfo: z.object({
    nationalEmergencyPhone: z.string().min(2),
    policePhone: z.string().min(2),
    redCrossPhone: z.string().min(2),
    fireDeptPhone: z.string().min(2),
    civilProtectionPhone: z.string().min(2),
    verifiedAt: z.string()
  }),
  mapCenterCoordinates: z.object({
    latitude: z.number().finite(),
    longitude: z.number().finite(),
    defaultZoom: z.number().min(1).max(20)
  }),
  activePartnersCount: z.number().int().nonnegative().default(0),
  verifiedDestinationsCount: z.number().int().nonnegative().default(0),
  verifiedBusinessesCount: z.number().int().nonnegative().default(0),
  launchStageDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const regionalApiQuerySchema = z.object({
  country: countryCodeEnum.optional().default("NI"),
  locale: localeCodeEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0)
});

export const translationRecordSchema = z.object({
  id: z.string().min(1),
  entityType: z.enum(["destination", "territory", "ui_string", "category", "guide"]),
  entityId: z.string().min(1),
  targetLocale: localeCodeEnum,
  sourceLocale: localeCodeEnum.default("es-NI"),
  status: z.enum(["missing", "draft", "machine_generated", "reviewed", "published"]).default("draft"),
  translatedFields: z.record(z.string(), z.string()),
  reviewerNotes: z.string().max(500).optional(),
  reviewedBy: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string()
});

// ============================================================================
// 🧭 OPEN ECOSYSTEM, OPEN DATA & API CLIENT VALIDATORS (FASE 13)
// ============================================================================

export const apiScopeEnum = z.enum([
  "open_data.read",
  "places.read",
  "places.submit",
  "territories.read",
  "smart_points.read",
  "alerts.read",
  "businesses.partner.read",
  "operations.partner.read",
  "research.telemetry.read"
]);

export const apiClientStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "REVOKED", "PENDING"]);

export const datasetFormatEnum = z.enum(["json", "geojson", "csv"]);

export const datasetLicenseEnum = z.enum(["CC-BY-4.0", "ODbL-1.0", "Custom-Baqueano-Open"]);

export const openDatasetRecordSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(2),
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(1000),
  category: z.enum(["destinations", "territories", "culture", "environment", "smart_points"]),
  format: z.array(datasetFormatEnum).min(1),
  license: datasetLicenseEnum,
  updateFrequency: z.enum(["real-time", "hourly", "daily", "weekly", "monthly", "manual"]),
  sourceOfTruth: z.string().min(2),
  recordCount: z.number().int().nonnegative(),
  countryScope: z.array(countryCodeEnum).min(1),
  endpointUrl: z.string().min(1),
  downloadUrlJson: z.string().optional(),
  downloadUrlGeoJson: z.string().optional(),
  downloadUrlCsv: z.string().optional(),
  fieldsDictionary: z.array(
    z.object({
      fieldName: z.string().min(1),
      type: z.string().min(1),
      description: z.string().min(1),
      example: z.string()
    })
  ),
  lastGeneratedAt: z.string(),
  verifiedAt: z.string()
});

export const openDataPlaceDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  countryCode: countryCodeEnum,
  department: z.string().min(1),
  municipality: z.string().min(1),
  description: z.string(),
  coordinates: z.object({
    latitude: z.number().finite(),
    longitude: z.number().finite()
  }),
  verified: z.boolean(),
  rating: z.number().finite().optional(),
  sustainabilityScore: z.number().finite().optional(),
  tags: z.array(z.string()).default([]),
  attribution: z.string().min(1),
  license: z.string().min(1)
});

export const apiClientRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().optional(),
  name: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  keyPrefix: z.string().min(3).max(10),
  keyHash: z.string().min(32),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  status: apiClientStatusEnum.default("PENDING"),
  scopes: z.array(apiScopeEnum).min(1),
  countryScope: z.array(countryCodeEnum).min(1),
  rateLimitPerMin: z.number().int().min(1).max(5000).default(60),
  quotaDailyRequests: z.number().int().min(10).max(500000).default(1000),
  requestsToday: z.number().int().nonnegative().default(0),
  lastUsedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const researchProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5).max(150),
  principalInvestigator: z.string().min(2).max(100),
  institution: z.string().min(2).max(120),
  contactEmail: z.string().email(),
  status: z.enum(["SUBMITTED", "APPROVED", "REJECTED", "COMPLETED", "EXPIRED"]).default("SUBMITTED"),
  requestedDatasets: z.array(z.string()).min(1),
  accessTier: z.enum(["open", "registered", "approved_research", "restricted"]).default("registered"),
  purposeDescription: z.string().min(20).max(2000),
  kAnonymityComplianceConfirmed: z.boolean().default(true),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  approvedBy: z.string().optional(),
  createdAt: z.string()
});

export const webhookSubscriptionSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  targetUrl: z.string().url(),
  events: z.array(z.enum(["place.updated", "public_alert.created", "smart_point.status_changed"])).min(1),
  status: z.enum(["ACTIVE", "FAILING", "DISABLED"]).default("ACTIVE"),
  secretHash: z.string().min(32),
  failureCount: z.number().int().nonnegative().default(0),
  lastDeliveredAt: z.string().optional(),
  createdAt: z.string()
});

export const openApiQuerySchema = z.object({
  country: countryCodeEnum.optional().default("NI"),
  category: z.string().optional(),
  territory: z.string().optional(),
  format: z.enum(["json", "geojson"]).optional().default("json"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional()
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
export type OrganizationRecordInput = z.infer<typeof organizationRecordSchema>;
export type OrganizationMembershipInput = z.infer<typeof organizationMembershipSchema>;
export type ApiKeyRecordInput = z.infer<typeof apiKeyRecordSchema>;
export type PartnerWebhookInput = z.infer<typeof partnerWebhookSchema>;
export type DataGovernanceInput = z.infer<typeof dataGovernanceSchema>;
export type SmartPointRecordInput = z.infer<typeof smartPointRecordSchema>;
export type IoTDeviceRecordInput = z.infer<typeof ioTDeviceRecordSchema>;
export type SensorRecordInput = z.infer<typeof sensorRecordSchema>;
export type SensorReadingInput = z.infer<typeof sensorReadingSchema>;
export type FieldMaintenanceTaskInput = z.infer<typeof fieldMaintenanceTaskSchema>;
export type IoTTelemetryPayloadInput = z.infer<typeof iotTelemetryPayloadSchema>;
export type CountryRecordInput = z.infer<typeof countryRecordSchema>;
export type RegionalCapabilityInput = z.infer<typeof regionalCapabilitySchema>;
export type MoneyAmountInput = z.infer<typeof moneyAmountSchema>;
export type RegionalApiQueryInput = z.infer<typeof regionalApiQuerySchema>;
export type TranslationRecordInput = z.infer<typeof translationRecordSchema>;
export type OpenDatasetRecordInput = z.infer<typeof openDatasetRecordSchema>;
export type OpenDataPlaceDtoInput = z.infer<typeof openDataPlaceDtoSchema>;
export type ApiClientRecordInput = z.infer<typeof apiClientRecordSchema>;
export type ResearchProjectInput = z.infer<typeof researchProjectSchema>;
export type WebhookSubscriptionInput = z.infer<typeof webhookSubscriptionSchema>;
export type OpenApiQueryInput = z.infer<typeof openApiQuerySchema>;

// ============================================================================
// 🧭 BAQUEANO TRUST LAYER VALIDATION SCHEMAS (FASE 14)
// ============================================================================

export const verificationStatusEnum = z.enum([
  "UNVERIFIED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "VERIFICATION_EXPIRED",
  "REJECTED",
  "SUSPENDED"
]);

export const verificationTypeEnum = z.enum([
  "BAQUEANO_REVIEW",
  "PARTNER_VERIFIED",
  "OFFICIAL_SOURCE",
  "COMMUNITY_VALIDATED",
  "DOCUMENT_CHECK",
  "FIELD_VISIT",
  "SYSTEM_VALIDATED"
]);

export const verificationEvidenceSchema = z.object({
  id: z.string().min(1),
  verificationId: z.string().min(1),
  type: z.enum(["photo", "document", "geo_point", "field_report", "official_gazette", "partner_certificate"]),
  source: z.string().min(1),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  submittedBy: z.string().min(1),
  submittedAt: z.string().datetime(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).default("PENDING"),
  rejectionReason: z.string().optional()
});

export const verificationRecordSchema = z.object({
  id: z.string().min(1),
  resourceType: z.enum(["place", "business", "destination", "experience"]),
  resourceId: z.string().min(1),
  countryId: z.enum(["NI", "CR", "GT", "HN", "SV", "BZ", "PA"]),
  status: verificationStatusEnum.default("UNVERIFIED"),
  verificationType: verificationTypeEnum,
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().optional(),
  secondReviewerBy: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  evidenceIds: z.array(z.string()).default([]),
  revokedAt: z.string().datetime().optional(),
  revocationReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const sourceTypeEnum = z.enum([
  "OFFICIAL",
  "BAQUEANO_VERIFIED",
  "VERIFIED_PARTNER",
  "COMMUNITY",
  "BUSINESS_SELF_REPORTED",
  "SYSTEM_DERIVED",
  "AI_DERIVED",
  "UNKNOWN"
]);

export const freshnessStateEnum = z.enum(["fresh", "aging", "stale", "unknown"]);

export const provenanceMetadataSchema = z.object({
  field: z.string().min(1),
  sourceType: sourceTypeEnum,
  verifiedBy: z.string().optional(),
  lastVerifiedAt: z.string().datetime().optional(),
  freshnessState: freshnessStateEnum,
  freshnessDays: z.number().int().min(0)
});

export const trustBadgeSchema = z.object({
  badgeId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  issuer: z.string().min(1),
  category: z.enum(["verification", "freshness", "official", "community"]),
  criteria: z.string().min(1),
  validityMonths: z.number().int().min(1),
  icon: z.string().min(1)
});

export const externalCertificationSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  issuerId: z.string().min(1),
  issuerName: z.string().min(1),
  countryScope: z.enum(["NI", "CR", "GT", "HN", "SV", "BZ", "PA"]),
  certificateType: z.string().min(1),
  certificateNumber: z.string().optional(),
  status: z.enum(["VALID", "EXPIRED", "REVOKED", "UNDER_REVIEW"]).default("UNDER_REVIEW"),
  verifiedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional()
});

export const sustainabilityDimensionEnum = z.enum([
  "environmental",
  "social",
  "local_economy",
  "culture",
  "accessibility",
  "responsible_management"
]);

export const claimStatusEnum = z.enum(["SELF_REPORTED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "EXPIRED"]);

export const sustainabilityClaimSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  dimension: sustainabilityDimensionEnum,
  claimText: z.string().min(1),
  status: claimStatusEnum.default("SELF_REPORTED"),
  evidenceId: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string().datetime()
});

export const brtiLevelEnum = z.enum(["INICIAL", "EN_DESARROLLO", "COMPROMISO_ALTO", "REFERENTE"]);

export const responsibleTourismIndexSchema = z.object({
  id: z.string().min(1),
  resourceType: z.enum(["place", "destination", "business"]),
  resourceId: z.string().min(1),
  indexVersion: z.string().default("1.0.0"),
  level: brtiLevelEnum,
  scoreOverall: z.number().min(0).max(100),
  dimensionScores: z.object({
    environmental: z.number().min(0).max(100),
    social: z.number().min(0).max(100),
    local_economy: z.number().min(0).max(100),
    culture: z.number().min(0).max(100),
    accessibility: z.number().min(0).max(100),
    responsible_management: z.number().min(0).max(100)
  }),
  confidenceScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  pendingAreas: z.array(z.string()).default([]),
  calculatedAt: z.string().datetime()
});

export const hostActionPlanSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  dimension: sustainabilityDimensionEnum,
  title: z.string().min(1),
  description: z.string().min(1),
  targetDate: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "verified"]).default("planned"),
  evidenceId: z.string().optional(),
  updatedAt: z.string().datetime()
});

export const localImpactIndicatorSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  period: z.string().min(1),
  localJobsDirect: z.number().int().min(0).optional(),
  localSuppliersCount: z.number().int().min(0).optional(),
  communityPartnersCount: z.number().int().min(0).optional(),
  confidence: z.enum(["verified", "self_reported", "estimated", "unknown"]).default("unknown"),
  notes: z.string().optional(),
  updatedAt: z.string().datetime()
});

export const integrityRiskLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]);
export const integrityCaseStatusEnum = z.enum(["OPEN", "REVIEWING", "CLEARED", "ACTION_REQUIRED", "CLOSED"]);

export const integrityCaseSchema = z.object({
  id: z.string().min(1),
  resourceType: z.enum(["place", "business", "review", "certification", "claim"]),
  resourceId: z.string().min(1),
  riskLevel: integrityRiskLevelEnum.default("UNKNOWN"),
  signals: z.array(z.string()).default([]),
  status: integrityCaseStatusEnum.default("OPEN"),
  assignedTo: z.string().optional(),
  findingsNotes: z.string().optional(),
  actionTaken: z.string().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional()
});

export const trustAppealSchema = z.object({
  id: z.string().min(1),
  caseIdOrVerificationId: z.string().min(1),
  resourceId: z.string().min(1),
  submittedBy: z.string().min(1),
  reason: z.string().min(1),
  counterEvidenceId: z.string().optional(),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "UPHELD", "REVERSED"]).default("SUBMITTED"),
  reviewerId: z.string().optional(),
  resolutionNotes: z.string().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional()
});

export const trustAuditEventSchema = z.object({
  id: z.string().min(1),
  eventType: z.enum([
    "VERIFICATION_SUBMITTED",
    "VERIFICATION_APPROVED",
    "VERIFICATION_REVOKED",
    "CLAIM_VERIFIED",
    "CLAIM_REJECTED",
    "BADGE_GRANTED",
    "BADGE_REVOKED",
    "INDEX_RECALCULATED",
    "INTEGRITY_CASE_RESOLVED",
    "APPEAL_DECIDED"
  ]),
  resourceId: z.string().min(1),
  actorId: z.string().min(1),
  actorRole: z.string().min(1),
  details: z.record(z.any()),
  timestamp: z.string().datetime()
});

export type VerificationEvidenceInput = z.infer<typeof verificationEvidenceSchema>;
export type VerificationRecordInput = z.infer<typeof verificationRecordSchema>;
export type ProvenanceMetadataInput = z.infer<typeof provenanceMetadataSchema>;
export type TrustBadgeInput = z.infer<typeof trustBadgeSchema>;
export type ExternalCertificationInput = z.infer<typeof externalCertificationSchema>;
export type SustainabilityClaimInput = z.infer<typeof sustainabilityClaimSchema>;
export type ResponsibleTourismIndexInput = z.infer<typeof responsibleTourismIndexSchema>;
export type HostActionPlanInput = z.infer<typeof hostActionPlanSchema>;
export type LocalImpactIndicatorInput = z.infer<typeof localImpactIndicatorSchema>;
export type IntegrityCaseInput = z.infer<typeof integrityCaseSchema>;
export type TrustAppealInput = z.infer<typeof trustAppealSchema>;
export type TrustAuditEventInput = z.infer<typeof trustAuditEventSchema>;

// ============================================================================
// 🧭 BAQUEANO AGENTIC ECOSYSTEM VALIDATION SCHEMAS (FASE 15)
// ============================================================================

export const agentIdEnum = z.enum([
  "trip_planner",
  "destination",
  "map",
  "budget",
  "safety",
  "culture",
  "reservation",
  "host",
  "trust",
  "operations",
  "data_quality"
]);

export const agentAutonomyLevelEnum = z.enum([
  "LEVEL_0_READ",
  "LEVEL_1_PREPARE",
  "LEVEL_2_REVERSIBLE",
  "LEVEL_3_SENSITIVE",
  "LEVEL_4_PROHIBITED"
]);

export const agentActionPolicyDecisionEnum = z.enum([
  "ALLOW",
  "DENY",
  "REQUIRE_CONFIRMATION",
  "REQUIRE_REAUTH"
]);

export const toolCategoryEnum = z.enum([
  "READ",
  "PREPARE",
  "WRITE_REVERSIBLE",
  "WRITE_SENSITIVE",
  "PROHIBITED"
]);

export const agentDefinitionSchema = z.object({
  agentId: agentIdEnum,
  name: z.string().min(1),
  roleDescription: z.string().min(1),
  allowedTools: z.array(z.string()).default([]),
  maxAutonomyLevel: agentAutonomyLevelEnum,
  requiresHumanInTheLoop: z.boolean().default(true)
});

export const agentToolDefinitionSchema = z.object({
  toolId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: toolCategoryEnum,
  autonomyLevel: agentAutonomyLevelEnum,
  allowedRoles: z.array(z.enum(["super_admin", "admin", "host", "explorer"])).default([]),
  isReversible: z.boolean().default(true)
});

export const workflowStatusEnum = z.enum([
  "CREATED",
  "RUNNING",
  "WAITING_FOR_HUMAN",
  "COMPLETED",
  "FAILED",
  "CANCELLED"
]);

export const tripStopSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  department: z.string().min(1),
  durationHours: z.number().min(0),
  priceNio: z.number().min(0),
  priceUsd: z.number().min(0),
  isVerified: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional()
});

export const tripDayPlanSchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  stops: z.array(tripStopSchema).default([]),
  estimatedTravelHours: z.number().min(0),
  dayCostNio: z.number().min(0),
  dayCostUsd: z.number().min(0),
  climateAdvice: z.string().min(1)
});

export const budgetBreakdownSchema = z.object({
  currency: z.enum(["NIO", "USD"]).default("NIO"),
  activitiesCost: z.number().min(0),
  transportEstimate: z.number().min(0),
  foodEstimate: z.number().min(0),
  totalCalculated: z.number().min(0),
  budgetLimit: z.number().min(0).optional(),
  isWithinBudget: z.boolean().default(true)
});

export const tripPlanRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  territory: z.string().min(1),
  daysCount: z.number().int().min(1),
  days: z.array(tripDayPlanSchema).default([]),
  budget: budgetBreakdownSchema,
  safetyWarnings: z.array(z.string()).default([]),
  trustSignals: z.array(z.string()).default([]),
  status: z.enum(["draft", "saved", "active", "completed"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const humanConfirmationStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]);

export const humanConfirmationRequestSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  agentId: agentIdEnum,
  actionDescription: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  autonomyLevel: agentAutonomyLevelEnum,
  diffPreview: z.object({ before: z.any(), after: z.any() }).optional(),
  status: humanConfirmationStatusEnum.default("PENDING"),
  requestedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime()
});

export const agenticWorkflowSchema = z.object({
  workflowId: z.string().min(1),
  userId: z.string().min(1),
  intent: z.string().min(1),
  status: workflowStatusEnum.default("CREATED"),
  currentStep: z.number().int().min(0),
  totalSteps: z.number().int().min(1),
  activeAgent: agentIdEnum.optional(),
  tripPlanId: z.string().optional(),
  pendingConfirmationId: z.string().optional(),
  executionSteps: z.array(
    z.object({
      agent: agentIdEnum,
      action: z.string().min(1),
      resultSummary: z.string().min(1),
      timestamp: z.string().datetime()
    })
  ).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const agentTraceLogSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  agentId: agentIdEnum,
  toolName: z.string().min(1),
  autonomyLevel: agentAutonomyLevelEnum,
  latencyMs: z.number().min(0),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  timestamp: z.string().datetime()
});

export type AgentDefinitionInput = z.infer<typeof agentDefinitionSchema>;
export type AgentToolDefinitionInput = z.infer<typeof agentToolDefinitionSchema>;
export type TripStopInput = z.infer<typeof tripStopSchema>;
export type TripDayPlanInput = z.infer<typeof tripDayPlanSchema>;
export type BudgetBreakdownInput = z.infer<typeof budgetBreakdownSchema>;
export type TripPlanRecordInput = z.infer<typeof tripPlanRecordSchema>;
export type HumanConfirmationRequestInput = z.infer<typeof humanConfirmationRequestSchema>;
export type AgenticWorkflowInput = z.infer<typeof agenticWorkflowSchema>;
export type AgentTraceLogInput = z.infer<typeof agentTraceLogSchema>;





