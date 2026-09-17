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

// ============================================================================
// 🧭 ENTERPRISE ARCHITECTURE & MULTI-ORGANIZACIÓN (FASE 10)
// ============================================================================

export type OrganizationType =
  | "central_platform"
  | "institution_official"
  | "municipality"
  | "cooperative"
  | "territorial_operator"
  | "tourism_association";

export type OrganizationStatus = "active" | "pending_verification" | "suspended" | "archived";

export interface OrganizationRecord {
  readonly id: string;
  readonly name: string;
  readonly legalName: string;
  readonly type: OrganizationType;
  readonly status: OrganizationStatus;
  readonly territories: readonly string[];
  readonly permissions: readonly string[];
  readonly contactEmail: string;
  readonly contactPhone?: string;
  readonly taxId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type OrganizationMemberRole = "org_admin" | "org_operator" | "org_auditor" | "org_member";

export interface OrganizationMembership {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: OrganizationMemberRole;
  readonly status: "active" | "invited" | "suspended";
  readonly scope: readonly string[];
  readonly assignedAt: string;
}

export type ApiKeyScope = "places.read" | "businesses.read" | "territories.read" | "alerts.read" | "reservations.manage";

export type ApiKeyStatus = "active" | "revoked" | "expired";

export interface ApiKeyRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly keyPrefix: string;
  readonly keyHash: string;
  readonly label: string;
  readonly scopes: readonly ApiKeyScope[];
  readonly status: ApiKeyStatus;
  readonly rateLimitPerMin: number;
  readonly lastUsedAt?: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
}

export interface PartnerWebhookRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly endpointUrl: string;
  readonly secretHash: string;
  readonly subscribedEvents: readonly string[];
  readonly status: "active" | "failing" | "disabled";
  readonly failureCount: number;
  readonly lastDeliveredAt?: string;
  readonly createdAt: string;
}

export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export interface DataGovernanceRecord {
  readonly datasetId: string;
  readonly domainName: string;
  readonly ownerRole: string;
  readonly classification: DataClassification;
  readonly retentionDays: number;
  readonly containsPii: boolean;
  readonly sourceOfTruth: string;
  readonly qualitySlo: string;
  readonly lastAuditIso: string;
}

export interface DisasterRecoveryStatus {
  readonly rtoObjectiveHours: number;
  readonly rpoObjectiveHours: number;
  readonly lastRestoreTestIso: string;
  readonly lastRestoreResult: "PASSED" | "FAILED" | "PENDING";
  readonly automatedBackupEnabled: boolean;
  readonly backupLocation: string;
  readonly killSwitches: Record<string, boolean>;
}

// ============================================================================
// 🧭 SMART TOURISM, IoT & TERRITORIO CONECTADO (FASE 11)
// ============================================================================

export type SmartPointType =
  | "viewpoint"
  | "trailhead"
  | "cultural_site"
  | "museum"
  | "community_hub"
  | "visitor_center"
  | "safety_point"
  | "eco_farm"
  | "business_spot";

export type SmartPointStatus = "active" | "maintenance" | "inactive";

export interface SmartPointRecord {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: SmartPointType;
  readonly placeId: string;
  readonly placeName: string;
  readonly territoryId: string;
  readonly territoryName: string;
  readonly coordinates: GeoPointLike;
  readonly status: SmartPointStatus;
  readonly qrEnabled: boolean;
  readonly nfcEnabled: boolean;
  readonly audioGuideUrl?: string;
  readonly emergencyContactPhone?: string;
  readonly maxCapacityEstimate?: number;
  readonly currentOccupancyStatus: "low" | "moderate" | "high" | "full" | "unknown";
  readonly assignedDeviceIds: readonly string[];
  readonly totalScansCount: number;
  readonly lastInteractionAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type IoTDeviceType =
  | "weather_station"
  | "footfall_counter"
  | "river_level_gauge"
  | "air_quality_monitor"
  | "edge_gateway"
  | "kiosk_display";

export type IoTDeviceStatus = "ONLINE" | "DEGRADED" | "OFFLINE" | "MAINTENANCE" | "UNKNOWN";

export interface IoTDeviceRecord {
  readonly id: string;
  readonly label: string;
  readonly type: IoTDeviceType;
  readonly smartPointId: string;
  readonly smartPointCode: string;
  readonly territoryId: string;
  readonly status: IoTDeviceStatus;
  readonly batteryPercent?: number;
  readonly powerSource: "solar" | "battery" | "grid";
  readonly connectivityType: "cellular_4g" | "wifi" | "lorawan" | "offline_buffer";
  readonly firmwareVersion?: string;
  readonly lastSeenAt?: string;
  readonly lastTelemetryAt?: string;
  readonly assignedSensors: readonly string[];
  readonly createdAt: string;
}

export type SensorType =
  | "temperature_celsius"
  | "humidity_relative"
  | "rainfall_mm"
  | "river_level_meters"
  | "air_quality_aqi"
  | "footfall_hourly"
  | "battery_voltage";

export type SensorDataQuality = "VALID" | "SUSPECT" | "INVALID" | "UNKNOWN";

export interface SensorRecord {
  readonly id: string;
  readonly deviceId: string;
  readonly type: SensorType;
  readonly unit: string;
  readonly minPlausibleValue: number;
  readonly maxPlausibleValue: number;
  readonly lastValue?: number;
  readonly lastQuality: SensorDataQuality;
  readonly lastReadingAt?: string;
}

export interface SensorReading {
  readonly sensorId: string;
  readonly deviceId: string;
  readonly type: SensorType;
  readonly value: number;
  readonly quality: SensorDataQuality;
  readonly deviceTimestamp: string;
  readonly receivedAt: string;
}

export type FieldTaskType =
  | "qr_replacement"
  | "sensor_calibration"
  | "battery_replacement"
  | "signage_inspection"
  | "device_repair"
  | "point_audit";

export type FieldTaskStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface FieldMaintenanceTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: FieldTaskType;
  readonly smartPointId: string;
  readonly smartPointCode: string;
  readonly territoryId: string;
  readonly priority: "low" | "medium" | "high" | "urgent";
  readonly status: FieldTaskStatus;
  readonly assignedToName?: string;
  readonly assignedToRole?: string;
  readonly photoEvidenceUrl?: string;
  readonly resolutionNotes?: string;
  readonly createdAt: string;
  readonly completedAt?: string;
}

export interface EnvironmentalTelemetryFeed {
  readonly territoryId: string;
  readonly smartPointId: string;
  readonly temperatureC?: number;
  readonly humidityPercent?: number;
  readonly rainfallMmToday?: number;
  readonly riverLevelStatus?: "normal" | "caution" | "flooded" | "unknown";
  readonly footfallCurrentStatus?: "low" | "moderate" | "high" | "unknown";
  readonly lastEvaluatedAt: string;
  readonly sourceLabel: "Sensor BAQUEANO" | "Fuente Oficial INETER" | "Estimado Local";
}

// ============================================================================
// FASE 12: REGIONAL EXPANSION, COUNTRY MODEL & I18N
// ============================================================================

export type CountryCode = "NI" | "CR" | "GT" | "HN" | "SV" | "BZ" | "PA";

export type CountryStatus =
  | "PLANNED"
  | "CONFIGURING"
  | "PILOT"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED";

export type CurrencyCode = "NIO" | "CRC" | "GTQ" | "HNL" | "USD" | "BZD" | "PAB";

export type LocaleCode =
  | "es-NI"
  | "es-CR"
  | "es-GT"
  | "es-HN"
  | "es-SV"
  | "es-PA"
  | "es"
  | "en";

export interface TerritorialStructureConfig {
  readonly level1Label: string; // e.g., "Departamento / Región Autónoma", "Provincia", "Distrito"
  readonly level2Label: string; // e.g., "Municipio", "Cantón"
  readonly hasIndigenousTerritories: boolean;
  readonly indigenousTerritoryLabel?: string;
}

export interface MoneyAmount {
  readonly amountMinor: number; // Stored in minor currency units (cents / centavos)
  readonly currency: CurrencyCode;
}

export interface RegionalCapabilityMap {
  readonly destinations: boolean;
  readonly businesses: boolean;
  readonly reservations: boolean;
  readonly onlinePayments: boolean;
  readonly aiAssistant: boolean;
  readonly iotSensors: boolean;
  readonly fieldOperations: boolean;
}

export interface CountryEmergencyInfo {
  readonly nationalEmergencyPhone: string;
  readonly policePhone: string;
  readonly redCrossPhone: string;
  readonly fireDeptPhone: string;
  readonly civilProtectionPhone: string;
  readonly verifiedAt: string;
}

export interface CountryRecord {
  readonly id: string; // e.g., "NI", "CR", "GT"
  readonly code: CountryCode;
  readonly name: string;
  readonly officialName: string;
  readonly status: CountryStatus;
  readonly defaultLocale: LocaleCode;
  readonly supportedLocales: readonly LocaleCode[];
  readonly defaultCurrency: CurrencyCode;
  readonly supportedCurrencies: readonly CurrencyCode[];
  readonly timezone: string; // e.g., "America/Managua", "America/Costa_Rica"
  readonly territorialStructure: TerritorialStructureConfig;
  readonly capabilities: RegionalCapabilityMap;
  readonly emergencyInfo: CountryEmergencyInfo;
  readonly mapCenterCoordinates: {
    readonly latitude: number;
    readonly longitude: number;
    readonly defaultZoom: number;
  };
  readonly activePartnersCount: number;
  readonly verifiedDestinationsCount: number;
  readonly verifiedBusinessesCount: number;
  readonly launchStageDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type LocalizationStatus =
  | "missing"
  | "draft"
  | "machine_generated"
  | "reviewed"
  | "published";

export interface TranslationRecord {
  readonly id: string;
  readonly entityType: "destination" | "territory" | "ui_string" | "category" | "guide";
  readonly entityId: string;
  readonly targetLocale: LocaleCode;
  readonly sourceLocale: LocaleCode;
  readonly status: LocalizationStatus;
  readonly translatedFields: Record<string, string>;
  readonly reviewerNotes?: string;
  readonly reviewedBy?: string;
  readonly publishedAt?: string;
  readonly updatedAt: string;
}

// ============================================================================
// FASE 13: OPEN ECOSYSTEM, OPEN DATA, DEVELOPER PLATFORM & RESEARCH
// ============================================================================

export type DataAccessTier =
  | "PUBLIC"
  | "OPEN_DATA_ELIGIBLE"
  | "PARTNER_SHAREABLE"
  | "INTERNAL"
  | "CONFIDENTIAL"
  | "RESTRICTED";

export type DatasetFormat = "json" | "geojson" | "csv";

export type DatasetLicense = "CC-BY-4.0" | "ODbL-1.0" | "Custom-Baqueano-Open";

export interface OpenDatasetRecord {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: "destinations" | "territories" | "culture" | "environment" | "smart_points";
  readonly format: readonly DatasetFormat[];
  readonly license: DatasetLicense;
  readonly updateFrequency: "real-time" | "hourly" | "daily" | "weekly" | "monthly" | "manual";
  readonly sourceOfTruth: string;
  readonly recordCount: number;
  readonly countryScope: readonly CountryCode[];
  readonly endpointUrl: string;
  readonly downloadUrlJson?: string;
  readonly downloadUrlGeoJson?: string;
  readonly downloadUrlCsv?: string;
  readonly fieldsDictionary: readonly {
    readonly fieldName: string;
    readonly type: string;
    readonly description: string;
    readonly example: string;
  }[];
  readonly lastGeneratedAt: string;
  readonly verifiedAt: string;
}

export interface OpenDataPlaceDTO {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly countryCode: string;
  readonly department: string;
  readonly municipality: string;
  readonly description: string;
  readonly coordinates: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly verified: boolean;
  readonly rating?: number;
  readonly sustainabilityScore?: number;
  readonly tags: readonly string[];
  readonly attribution: string;
  readonly license: string;
}

export interface OpenDataSmartPointDTO {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: string;
  readonly countryCode: string;
  readonly territory: string;
  readonly coordinates: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly currentAforoStatus: "low" | "moderate" | "high" | "full" | "unknown";
  readonly facilities: readonly string[];
  readonly attribution: string;
}

export interface GeoJSONFeature<T = Record<string, any>> {
  readonly type: "Feature";
  readonly geometry: {
    readonly type: "Point" | "Polygon" | "MultiPolygon";
    readonly coordinates: number[] | number[][] | number[][][];
  };
  readonly properties: T;
}

export interface GeoJSONFeatureCollection<T = Record<string, any>> {
  readonly type: "FeatureCollection";
  readonly features: readonly GeoJSONFeature<T>[];
  readonly metadata?: {
    readonly title: string;
    readonly license: string;
    readonly generatedAt: string;
    readonly totalFeatures: number;
  };
}

export type ApiClientStatus = "ACTIVE" | "SUSPENDED" | "REVOKED" | "PENDING";

export type ApiScope =
  | "open_data.read"
  | "places.read"
  | "places.submit"
  | "territories.read"
  | "smart_points.read"
  | "alerts.read"
  | "businesses.partner.read"
  | "operations.partner.read"
  | "research.telemetry.read";

export interface ApiClientRecord {
  readonly id: string;
  readonly organizationId?: string;
  readonly name: string;
  readonly contactEmail: string;
  readonly keyPrefix: string;
  readonly keyHash: string;
  readonly environment: "sandbox" | "production";
  readonly status: ApiClientStatus;
  readonly scopes: readonly ApiScope[];
  readonly countryScope: readonly CountryCode[];
  readonly rateLimitPerMin: number;
  readonly quotaDailyRequests: number;
  readonly requestsToday: number;
  readonly lastUsedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ResearchAccessTier = "open" | "registered" | "approved_research" | "restricted";

export interface ResearchProjectRecord {
  readonly id: string;
  readonly title: string;
  readonly principalInvestigator: string;
  readonly institution: string; // University, NGO, or Scientific Institute
  readonly contactEmail: string;
  readonly status: "SUBMITTED" | "APPROVED" | "REJECTED" | "COMPLETED" | "EXPIRED";
  readonly requestedDatasets: readonly string[];
  readonly accessTier: ResearchAccessTier;
  readonly purposeDescription: string;
  readonly kAnonymityComplianceConfirmed: boolean;
  readonly validFrom?: string;
  readonly validUntil?: string;
  readonly approvedBy?: string;
  readonly createdAt: string;
}

export interface WebhookSubscriptionRecord {
  readonly id: string;
  readonly clientId: string;
  readonly targetUrl: string;
  readonly events: readonly ("place.updated" | "public_alert.created" | "smart_point.status_changed")[];
  readonly status: "ACTIVE" | "FAILING" | "DISABLED";
  readonly secretHash: string;
  readonly failureCount: number;
  readonly lastDeliveredAt?: string;
  readonly createdAt: string;
}

// ============================================================================
// 🧭 BAQUEANO TRUST LAYER & RESPONSIBLE TOURISM TYPES (FASE 14)
// ============================================================================

export type VerificationStatus =
  | "UNVERIFIED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "VERIFICATION_EXPIRED"
  | "REJECTED"
  | "SUSPENDED";

export type VerificationType =
  | "BAQUEANO_REVIEW"
  | "PARTNER_VERIFIED"
  | "OFFICIAL_SOURCE"
  | "COMMUNITY_VALIDATED"
  | "DOCUMENT_CHECK"
  | "FIELD_VISIT"
  | "SYSTEM_VALIDATED";

export interface VerificationEvidenceRecord {
  readonly id: string;
  readonly verificationId: string;
  readonly type: "photo" | "document" | "geo_point" | "field_report" | "official_gazette" | "partner_certificate";
  readonly source: string;
  readonly fileUrl?: string;
  readonly notes?: string;
  readonly submittedBy: string;
  readonly submittedAt: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly status: "PENDING" | "ACCEPTED" | "REJECTED";
  readonly rejectionReason?: string;
}

export interface VerificationRecord {
  readonly id: string;
  readonly resourceType: "place" | "business" | "destination" | "experience";
  readonly resourceId: string;
  readonly countryId: CountryCode;
  readonly status: VerificationStatus;
  readonly verificationType: VerificationType;
  readonly verifiedAt?: string;
  readonly verifiedBy?: string;
  readonly secondReviewerBy?: string; // Four-eyes principle
  readonly expiresAt?: string;
  readonly evidenceIds: readonly string[];
  readonly revokedAt?: string;
  readonly revocationReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type SourceType =
  | "OFFICIAL"
  | "BAQUEANO_VERIFIED"
  | "VERIFIED_PARTNER"
  | "COMMUNITY"
  | "BUSINESS_SELF_REPORTED"
  | "SYSTEM_DERIVED"
  | "AI_DERIVED"
  | "UNKNOWN";

export type FreshnessState = "fresh" | "aging" | "stale" | "unknown";

export interface ProvenanceMetadata {
  readonly field: string;
  readonly sourceType: SourceType;
  readonly verifiedBy?: string;
  readonly lastVerifiedAt?: string;
  readonly freshnessState: FreshnessState;
  readonly freshnessDays: number;
}

export interface TrustBadgeRecord {
  readonly badgeId: string;
  readonly name: string;
  readonly description: string;
  readonly issuer: string;
  readonly category: "verification" | "freshness" | "official" | "community";
  readonly criteria: string;
  readonly validityMonths: number;
  readonly icon: string;
}

export interface ExternalCertificationRecord {
  readonly id: string;
  readonly resourceId: string;
  readonly issuerId: string;
  readonly issuerName: string;
  readonly countryScope: CountryCode;
  readonly certificateType: string;
  readonly certificateNumber?: string;
  readonly status: "VALID" | "EXPIRED" | "REVOKED" | "UNDER_REVIEW";
  readonly verifiedAt: string;
  readonly expiresAt?: string;
}

export type SustainabilityDimension =
  | "environmental"
  | "social"
  | "local_economy"
  | "culture"
  | "accessibility"
  | "responsible_management";

export type ClaimStatus = "SELF_REPORTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface SustainabilityClaimRecord {
  readonly id: string;
  readonly resourceId: string;
  readonly dimension: SustainabilityDimension;
  readonly claimText: string;
  readonly status: ClaimStatus;
  readonly evidenceId?: string;
  readonly verifiedAt?: string;
  readonly verifiedBy?: string;
  readonly rejectionReason?: string;
  readonly createdAt: string;
}

export type BrtiLevel = "INICIAL" | "EN_DESARROLLO" | "COMPROMISO_ALTO" | "REFERENTE";

export interface ResponsibleTourismIndexRecord {
  readonly id: string;
  readonly resourceType: "place" | "destination" | "business";
  readonly resourceId: string;
  readonly indexVersion: string;
  readonly level: BrtiLevel;
  readonly scoreOverall: number;
  readonly dimensionScores: { readonly [key in SustainabilityDimension]: number };
  readonly confidenceScore: number;
  readonly strengths: readonly string[];
  readonly pendingAreas: readonly string[];
  readonly calculatedAt: string;
}

export interface HostActionPlanRecord {
  readonly id: string;
  readonly resourceId: string;
  readonly dimension: SustainabilityDimension;
  readonly title: string;
  readonly description: string;
  readonly targetDate?: string;
  readonly status: "planned" | "in_progress" | "completed" | "verified";
  readonly evidenceId?: string;
  readonly updatedAt: string;
}

export interface LocalImpactIndicatorRecord {
  readonly id: string;
  readonly resourceId: string;
  readonly period: string;
  readonly localJobsDirect?: number;
  readonly localSuppliersCount?: number;
  readonly communityPartnersCount?: number;
  readonly confidence: "verified" | "self_reported" | "estimated" | "unknown";
  readonly notes?: string;
  readonly updatedAt: string;
}

export type IntegrityRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
export type IntegrityCaseStatus = "OPEN" | "REVIEWING" | "CLEARED" | "ACTION_REQUIRED" | "CLOSED";

export interface IntegrityCaseRecord {
  readonly id: string;
  readonly resourceType: "place" | "business" | "review" | "certification" | "claim";
  readonly resourceId: string;
  readonly riskLevel: IntegrityRiskLevel;
  readonly signals: readonly string[];
  readonly status: IntegrityCaseStatus;
  readonly assignedTo?: string;
  readonly findingsNotes?: string;
  readonly actionTaken?: string;
  readonly createdAt: string;
  readonly resolvedAt?: string;
}

export interface TrustAppealRecord {
  readonly id: string;
  readonly caseIdOrVerificationId: string;
  readonly resourceId: string;
  readonly submittedBy: string;
  readonly reason: string;
  readonly counterEvidenceId?: string;
  readonly status: "SUBMITTED" | "UNDER_REVIEW" | "UPHELD" | "REVERSED";
  readonly reviewerId?: string;
  readonly resolutionNotes?: string;
  readonly createdAt: string;
  readonly resolvedAt?: string;
}

export interface TrustAuditEventRecord {
  readonly id: string;
  readonly eventType:
    | "VERIFICATION_SUBMITTED"
    | "VERIFICATION_APPROVED"
    | "VERIFICATION_REVOKED"
    | "CLAIM_VERIFIED"
    | "CLAIM_REJECTED"
    | "BADGE_GRANTED"
    | "BADGE_REVOKED"
    | "INDEX_RECALCULATED"
    | "INTEGRITY_CASE_RESOLVED"
    | "APPEAL_DECIDED";
  readonly resourceId: string;
  readonly actorId: string;
  readonly actorRole: string;
  readonly details: Record<string, any>;
  readonly timestamp: string;
}

// ============================================================================
// 🧭 BAQUEANO AGENTIC ECOSYSTEM & DIGITAL CONCIERGE TYPES (FASE 15)
// ============================================================================

export type AgentId =
  | "trip_planner"
  | "destination"
  | "map"
  | "budget"
  | "safety"
  | "culture"
  | "reservation"
  | "host"
  | "trust"
  | "operations"
  | "data_quality";

export type AgentAutonomyLevel =
  | "LEVEL_0_READ"
  | "LEVEL_1_PREPARE"
  | "LEVEL_2_REVERSIBLE"
  | "LEVEL_3_SENSITIVE"
  | "LEVEL_4_PROHIBITED";

export type AgentActionPolicyDecision =
  | "ALLOW"
  | "DENY"
  | "REQUIRE_CONFIRMATION"
  | "REQUIRE_REAUTH";

export type ToolCategory =
  | "READ"
  | "PREPARE"
  | "WRITE_REVERSIBLE"
  | "WRITE_SENSITIVE"
  | "PROHIBITED";

export interface AgentDefinitionRecord {
  readonly agentId: AgentId;
  readonly name: string;
  readonly roleDescription: string;
  readonly allowedTools: readonly string[];
  readonly maxAutonomyLevel: AgentAutonomyLevel;
  readonly requiresHumanInTheLoop: boolean;
}

export interface AgentToolDefinitionRecord {
  readonly toolId: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly autonomyLevel: AgentAutonomyLevel;
  readonly allowedRoles: readonly UserRole[];
  readonly isReversible: boolean;
}

export type WorkflowStatus =
  | "CREATED"
  | "RUNNING"
  | "WAITING_FOR_HUMAN"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface AgenticWorkflowRecord {
  readonly workflowId: string;
  readonly userId: string;
  readonly intent: string;
  readonly status: WorkflowStatus;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly activeAgent?: AgentId;
  readonly tripPlanId?: string;
  readonly pendingConfirmationId?: string;
  readonly executionSteps: readonly {
    readonly agent: AgentId;
    readonly action: string;
    readonly resultSummary: string;
    readonly timestamp: string;
  }[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TripStop {
  readonly placeId: string;
  readonly name: string;
  readonly category: string;
  readonly department: string;
  readonly durationHours: number;
  readonly priceNio: number;
  readonly priceUsd: number;
  readonly isVerified: boolean;
  readonly latitude: number;
  readonly longitude: number;
  readonly notes?: string;
}

export interface TripDayPlan {
  readonly dayNumber: number;
  readonly title: string;
  readonly stops: readonly TripStop[];
  readonly estimatedTravelHours: number;
  readonly dayCostNio: number;
  readonly dayCostUsd: number;
  readonly climateAdvice: string;
}

export interface BudgetBreakdown {
  readonly currency: "NIO" | "USD";
  readonly activitiesCost: number;
  readonly transportEstimate: number;
  readonly foodEstimate: number;
  readonly totalCalculated: number;
  readonly budgetLimit?: number;
  readonly isWithinBudget: boolean;
}

export interface TripPlanRecord {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly territory: string;
  readonly daysCount: number;
  readonly days: readonly TripDayPlan[];
  readonly budget: BudgetBreakdown;
  readonly safetyWarnings: readonly string[];
  readonly trustSignals: readonly string[];
  readonly status: "draft" | "saved" | "active" | "completed";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type HumanConfirmationStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface HumanConfirmationRequestRecord {
  readonly id: string;
  readonly workflowId: string;
  readonly agentId: AgentId;
  readonly actionDescription: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly autonomyLevel: AgentAutonomyLevel;
  readonly diffPreview?: { readonly before: any; readonly after: any };
  readonly status: HumanConfirmationStatus;
  readonly requestedAt: string;
  readonly resolvedAt?: string;
  readonly expiresAt: string;
}

export interface AgentTraceLogRecord {
  readonly id: string;
  readonly workflowId: string;
  readonly agentId: AgentId;
  readonly toolName: string;
  readonly autonomyLevel: AgentAutonomyLevel;
  readonly latencyMs: number;
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly timestamp: string;
}

// ============================================================================
// FASE 16: PREDICTIVE INTELLIGENCE & SIMULATION LAB
// ============================================================================

export type EpistemologicalLabel =
  | "OBSERVADO"
  | "ESTIMADO"
  | "PRONOSTICADO"
  | "SIMULADO"
  | "DESCONOCIDO";

export type ForecastConfidenceLevel =
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | "INSUFFICIENT_DATA";

export type DataReadinessStatus =
  | "READY"
  | "PARTIAL"
  | "INSUFFICIENT"
  | "SIMULATED_ONLY";

export type ModelLifecycleState =
  | "EXPERIMENTAL"
  | "VALIDATING"
  | "APPROVED"
  | "ACTIVE"
  | "DEPRECATED"
  | "DISABLED";

export type ModelHealthState =
  | "HEALTHY"
  | "DEGRADED"
  | "STALE"
  | "DISABLED";

export type SaturationLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "VERY_HIGH"
  | "UNKNOWN";

export type ForecastHorizon = "24H" | "7D" | "30D";

export interface DemandSignalRecord {
  readonly id: string;
  readonly destinationId: string;
  readonly territoryId: string;
  readonly date: string;
  readonly pageViews: number;
  readonly searchCount: number;
  readonly favoritesCount: number;
  readonly mapInteractions: number;
  readonly contactRequests: number;
  readonly weightConfigRef: string;
  readonly aggregatedSignalScore: number;
}

export interface AggregatedDemandForecast {
  readonly id: string;
  readonly destinationId: string;
  readonly territoryId: string;
  readonly horizon: ForecastHorizon;
  readonly forecastTarget: string; // e.g., "aggregated_visitor_interest/day"
  readonly baselineValue: number;
  readonly predictedValue: number;
  readonly intervalMin: number;
  readonly intervalMax: number;
  readonly confidence: ForecastConfidenceLevel;
  readonly modelVersion: string;
  readonly datasetVersion: string;
  readonly epistemologicalLabel: EpistemologicalLabel;
  readonly generatedAt: string;
  readonly limitations: readonly string[];
}

export interface CapacityForecastRecord {
  readonly destinationId: string;
  readonly territoryId: string;
  readonly horizon: ForecastHorizon;
  readonly validatedCapacity: number | null; // null if UNKNOWN
  readonly predictedDemand: number;
  readonly utilizationRate: number | null; // percentage 0-100 or null if capacity UNKNOWN
  readonly saturationLevel: SaturationLevel;
  readonly bottleneckFactors: readonly string[];
  readonly generatedAt: string;
}

export interface TerritorialPressureIndexRecord {
  readonly territoryId: string;
  readonly destinationId: string;
  readonly pressureScore: number; // 0 to 100
  readonly pressureLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "UNKNOWN";
  readonly demandFactor: number;
  readonly environmentalFactor: number;
  readonly capacityFactor: number;
  readonly seasonalityFactor: number;
  readonly calculatedAt: string;
  readonly epistemologicalLabel: EpistemologicalLabel;
}

export interface SimulationScenarioParameters {
  readonly demandMultiplier: number; // 0.1 to 3.0 (e.g., 1.2 = +20%)
  readonly capacityMultiplier: number; // 0.1 to 2.0
  readonly destinationAvailability: Record<string, boolean>; // e.g. { "cerro-negro": false }
  readonly routeClosure: readonly string[];
  readonly weatherDisruptionLevel: "NONE" | "MODERATE" | "SEVERE";
  readonly targetRedistributionPercent: number; // 0 to 50%
}

export interface SimulationRedistributionResult {
  readonly sourceDestinationId: string;
  readonly targetDestinationId: string;
  readonly divertedInterestPercent: number;
  readonly estimatedCapacityRelief: number;
}

export interface SimulationScenarioResult {
  readonly projectedDemand: number;
  readonly projectedCapacityUtilization: number;
  readonly affectedTerritories: readonly string[];
  readonly redistributionSuggestions: readonly SimulationRedistributionResult[];
  readonly riskLevel: "LOW" | "MODERATE" | "HIGH" | "ELEVATED";
  readonly simulatedAt: string;
}

export interface SimulationScenarioRecord {
  readonly scenarioId: string;
  readonly name: string;
  readonly description: string;
  readonly baselineSnapshotId: string;
  readonly assumptions: readonly string[];
  readonly parameters: SimulationScenarioParameters;
  readonly result: SimulationScenarioResult;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly isSimulatedData: true; // Hardcoded strictly to prevent real state corruption
}

export interface SimulationComparisonRecord {
  readonly id: string;
  readonly baselineScenario: SimulationScenarioRecord;
  readonly candidateScenarios: readonly SimulationScenarioRecord[];
  readonly diffMetrics: readonly {
    readonly scenarioId: string;
    readonly demandChangePercent: number;
    readonly pressureDelta: number;
    readonly redistributionGain: number;
  }[];
}

export interface PredictiveModelRegistryRecord {
  readonly modelId: string;
  readonly name: string;
  readonly target: string;
  readonly version: string;
  readonly state: ModelLifecycleState;
  readonly health: ModelHealthState;
  readonly baselineAlgorithm: string;
  readonly baselineMae: number;
  readonly modelMae: number;
  readonly modelMape: number;
  readonly lastBacktestDate: string;
  readonly modelCardRef: string;
  readonly killSwitchActive: boolean;
}

export interface PredictiveSignalRecord {
  readonly id: string;
  readonly territoryId: string;
  readonly destinationId: string;
  readonly signalType: "CAPACITY_PRESSURE" | "SEASONAL_SURGE" | "WEATHER_IMPACT" | "ROUTE_SATURATION";
  readonly severity: "INFO" | "WARNING" | "CRITICAL";
  readonly confidence: ForecastConfidenceLevel;
  readonly message: string;
  readonly recommendedAction: string;
  readonly triggeredAt: string;
}

export interface PredictiveCostForecastRecord {
  readonly serviceName: "Firestore" | "AIGateway" | "Maps" | "Compute";
  readonly month: string;
  readonly estimatedCostUsdMin: number;
  readonly estimatedCostUsdMax: number;
  readonly budgetThresholdUsd: number;
  readonly budgetAlert: boolean;
  readonly generatedAt: string;
}

// ============================================================================
// FASE 17: SPATIAL INTELLIGENCE & ADVANCED GIS DATA MODELS
// ============================================================================

export type GeoQualityStatus = "VALID" | "SUSPECT" | "INVALID" | "UNKNOWN";
export type LocationConfidence = "exact" | "approximate" | "territory-only" | "unknown";
export type GeoProvenance = "manual" | "geocoded" | "field_verified" | "partner" | "official";
export type TransportMode = "driving" | "walking" | "cycling" | "multimodal";
export type RouteType = "FASTEST" | "SCENIC" | "CULTURAL" | "ADVENTURE" | "COMMUNITY" | "LOW_PRESSURE";
export type CorridorStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type AccessibilityLevel = "HIGH_ACCESS" | "MODERATE" | "LIMITED" | "UNKNOWN";
export type ServiceGapCategory = "health" | "police" | "firefighters" | "red_cross" | "lodging" | "food";
export type GisHealthStatus = "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";

export interface GeoBoundingBox {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLng: number;
  readonly maxLng: number;
}

export interface SpatialCoordinateRecord {
  readonly latitude: number;
  readonly longitude: number;
  readonly geohash: string;
  readonly countryId: string;
  readonly territoryId: string;
  readonly municipalityId?: string;
  readonly qualityStatus: GeoQualityStatus;
  readonly confidence: LocationConfidence;
  readonly provenance: GeoProvenance;
  readonly isSensitive: boolean;
  readonly verifiedAt?: string | null;
  readonly verificationNote?: string | null;
}

export interface IsochronePolygonRecord {
  readonly origin: GeoPointLike;
  readonly originName: string;
  readonly travelMode: TransportMode;
  readonly timeLimitMinutes: 15 | 30 | 45 | 60;
  readonly coordinates: readonly [number, number][]; // GeoJSON polygon exterior ring [lng, lat]
  readonly boundingBox: GeoBoundingBox;
  readonly reachableDestinationsCount: number;
  readonly reachableDestinations: readonly string[];
  readonly generatedAt: string;
  readonly isEstimated: true;
}

export interface RouteWaypointRecord {
  readonly id: string;
  readonly name: string;
  readonly coordinates: GeoPointLike;
  readonly order: number;
  readonly stopDurationMinutes?: number;
  readonly isCulturalStop?: boolean;
  readonly isLocalBusiness?: boolean;
}

export interface RouteSegmentRecord {
  readonly fromWaypointId: string;
  readonly toWaypointId: string;
  readonly distanceKm: number;
  readonly durationMinutes: number;
  readonly mode: TransportMode;
  readonly roadCondition?: "PAVED" | "GRAVEL" | "DIRT" | "WATERWAY";
  readonly safetyAlertId?: string | null;
  readonly geometryCoordinates: readonly [number, number][]; // Polyline coords [lng, lat]
}

export interface SpatialRouteRecord {
  readonly routeId: string;
  readonly name: string;
  readonly originName: string;
  readonly destinationName: string;
  readonly routeType: RouteType;
  readonly totalDistanceKm: number;
  readonly totalDurationMinutes: number;
  readonly waypoints: readonly RouteWaypointRecord[];
  readonly segments: readonly RouteSegmentRecord[];
  readonly elevationGainMeters?: number;
  readonly elevationLossMeters?: number;
  readonly scenicScore?: number;
  readonly culturalScore?: number;
  readonly sustainabilityScore?: number;
  readonly confidence: "HIGH" | "ESTIMATED" | "PARTIAL";
  readonly activeAlertsCount: number;
  readonly activeAlerts: readonly string[];
  readonly disclaimer: string;
  readonly generatedAt: string;
}

export interface TourismCorridorRecord {
  readonly corridorId: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly countryId: string;
  readonly territories: readonly string[];
  readonly theme: "VOLCANOES" | "COFFEE" | "CRAFTS" | "CARIBBEAN" | "HERITAGE" | "COMMUNITY";
  readonly places: readonly string[];
  readonly stops: readonly {
    readonly placeId: string;
    readonly name: string;
    readonly territory: string;
    readonly role: "GATEWAY" | "PRIMARY_HUB" | "COMMUNITY_STOP" | "SCENIC_LOOKOUT";
    readonly coordinates: GeoPointLike;
  }[];
  readonly totalDistanceKm: number;
  readonly suggestedDurationDays: number;
  readonly sustainabilityRating: number;
  readonly status: CorridorStatus;
  readonly publishedAt?: string | null;
  readonly reviewedBy?: string | null;
  readonly routeGeometryRef?: string;
  readonly culturalHighlights: readonly string[];
  readonly localPartnerCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TerritorialAccessibilityRecord {
  readonly territoryId: string;
  readonly territoryName: string;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly accessibilityIndex: number; // 0 to 100
  readonly primaryRoadAccess: boolean;
  readonly averageTravelTimeToCapitalMinutes: number;
  readonly publicTransportCoverageScore: number; // 0 to 100
  readonly digitalConnectivityScore: number; // 0 to 100
  readonly emergencyServicesWithin30Min: number;
  readonly healthCentersCount: number;
  readonly policeStationsCount: number;
  readonly fireStationsCount: number;
  readonly totalTouristAttractions: number;
  readonly lastEvaluatedAt: string;
  readonly evaluationSource: "OFFICIAL_SURVEY" | "FIELD_VALIDATION" | "INFRASTRUCTURE_AUDIT";
}

export interface ServiceGapAnalysisRecord {
  readonly gapId: string;
  readonly territoryId: string;
  readonly territoryName: string;
  readonly destinationId: string;
  readonly destinationName: string;
  readonly destinationCoordinates: GeoPointLike;
  readonly missingCategory: ServiceGapCategory;
  readonly nearestServiceDistanceKm: number;
  readonly nearestServiceEstimatedMinutes: number;
  readonly nearestServiceName: string;
  readonly severity: "LOW" | "MODERATE" | "HIGH";
  readonly recommendedMitigation: string;
  readonly isPlanningOnly: true; // Strict: Internal planning, never public shaming
  readonly detectedAt: string;
}

export interface SpatialCoverageRecord {
  readonly territoryId: string;
  readonly territoryName: string;
  readonly totalDestinations: number;
  readonly totalVerifiedBusinesses: number;
  readonly totalSmartPoints: number;
  readonly whiteSpotsDetected: number;
  readonly fieldResearchQueueCount: number;
  readonly coveragePercentage: number; // 0 to 100
  readonly lastAuditedAt: string;
}

export interface ElevationProfileRecord {
  readonly routeId: string;
  readonly minElevationMeters: number;
  readonly maxElevationMeters: number;
  readonly totalGainMeters: number;
  readonly totalLossMeters: number;
  readonly elevationSamples: readonly {
    readonly distanceKm: number;
    readonly elevationMeters: number;
  }[];
  readonly source: "TERRAIN_ELEVATION_API" | "FIELD_GPS_LOG" | "ESTIMATED_CONTOUR";
}

export interface HikingTrailRecord {
  readonly trailId: string;
  readonly name: string;
  readonly territoryId: string;
  readonly difficulty: "SUAVE" | "MODERADA" | "EXIGENTE" | "EXTREMA";
  readonly distanceKm: number;
  readonly estimatedDurationHours: number;
  readonly elevationGainMeters: number;
  readonly startCoordinates: GeoPointLike;
  readonly endCoordinates: GeoPointLike;
  readonly waypoints: readonly GeoPointLike[];
  readonly officialStatus: "OFFICIAL_PARK_TRAIL" | "COMMUNITY_VERIFIED" | "GUIDE_RECOMMENDED";
  readonly verifiedAt: string;
  readonly safetyRecommendations: readonly string[];
  readonly requiresGuide: boolean;
}

export interface GisToolExecutionResult<T = unknown> {
  readonly toolName: string;
  readonly executionTimeMs: number;
  readonly success: boolean;
  readonly isCached: boolean;
  readonly data: T;
  readonly error?: string | null;
  readonly disclaimer: string;
}

// ============================================================================
// FASE 19: NATIONAL COMMAND & STRATEGIC INTELLIGENCE DATA CONTRACTS
// ============================================================================

export type KpiState = "VALIDATED" | "PARTIAL" | "EXPERIMENTAL" | "UNAVAILABLE";

export type KpiGroup =
  | "EXPERIENCE"
  | "MARKETPLACE"
  | "TERRITORY"
  | "SUSTAINABILITY"
  | "TRUST"
  | "OPERATIONS"
  | "PLATFORM"
  | "ECONOMY";

export type DataCadence = "real-time" | "near-real-time" | "hourly" | "daily" | "weekly" | "manual";

export type MetricSensitivity = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export type ConfidenceLevel = "SUFFICIENT_EVIDENCE" | "PARTIAL_EVIDENCE" | "INSUFFICIENT_DATA";

export type StrategicHealthStatus = "HEALTHY" | "DEGRADED" | "STALE" | "UNKNOWN";

export type SignalSeverity = "INFORMATIONAL" | "ATTENTION" | "HIGH";

export type SignalType =
  | "DEMAND_CHANGE"
  | "CAPACITY_PRESSURE"
  | "COVERAGE_GAP"
  | "TRUST_GAP"
  | "DATA_QUALITY"
  | "MARKETPLACE"
  | "PLATFORM"
  | "SUSTAINABILITY"
  | "COST_ANOMALY";

export type SignalSource = "measured" | "forecast" | "simulation" | "manual_analysis";

export type TerritoryDimensionRating =
  | "Strong"
  | "Moderate"
  | "Developing"
  | "Limited data"
  | "Partial evidence"
  | "Insufficient data";

export type StrategicInitiativeState =
  | "PROPOSED"
  | "APPROVED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type StrategicReportType =
  | "WEEKLY_EXECUTIVE_BRIEF"
  | "TERRITORIAL_OVERVIEW"
  | "MARKETPLACE_HEALTH"
  | "TRUST_SUSTAINABILITY"
  | "PLATFORM_HEALTH";

export interface StrategicKpi {
  readonly kpiId: string;
  readonly name: string;
  readonly description: string;
  readonly formula: string;
  readonly source: string;
  readonly period: string;
  readonly aggregation: "sum" | "avg" | "ratio" | "count" | "index";
  readonly owner: string;
  readonly status: KpiState;
  readonly freshness: string;
  readonly cadence: DataCadence;
  readonly group: KpiGroup;
  readonly sensitivity: MetricSensitivity;
  readonly value: number | null; // Strictly null if UNAVAILABLE or missing, NEVER 0 for unknown
  readonly targetValue: number | null;
  readonly forecastValue: number | null;
  readonly simulatedValue?: number | null;
  readonly unit: string;
  readonly territoryScope: string;
  readonly countryId: string;
  readonly version: string;
  readonly isDeprecated?: boolean;
  readonly contributingFactors?: readonly string[];
}

export interface StrategicSignal {
  readonly signalId: string;
  readonly type: SignalType;
  readonly title: string;
  readonly scope: {
    readonly territoryId?: string;
    readonly destinationId?: string;
    readonly countryId: string;
    readonly corridorId?: string;
  };
  readonly severity: SignalSeverity;
  readonly source: SignalSource;
  readonly observedAt: string;
  readonly status: "ACTIVE" | "REVIEWED" | "RESOLVED" | "ARCHIVED";
  readonly evidence: {
    readonly metricRef?: string;
    readonly metricName?: string;
    readonly currentValue?: number | string | null;
    readonly threshold?: number | string;
    readonly details: string;
  };
  readonly implications: readonly string[];
  readonly options: readonly {
    readonly id: string;
    readonly label: string;
    readonly actionType: "MONITOR" | "INVESTIGATE" | "RUN_SIMULATION" | "REVIEW_TERRITORY" | "MANUAL_NOTE";
  }[];
}

export interface TerritoryPortfolioProfile {
  readonly territoryId: string;
  readonly territoryName: string;
  readonly countryId: string;
  readonly coverageRating: TerritoryDimensionRating;
  readonly trustRating: TerritoryDimensionRating;
  readonly accessibilityRating: TerritoryDimensionRating;
  readonly demandRating: TerritoryDimensionRating;
  readonly sustainabilityRating: TerritoryDimensionRating;
  readonly destinationsCount: number;
  readonly businessesCount: number;
  readonly smartPointsCount: number;
  readonly dataConfidence: ConfidenceLevel;
  readonly opportunityNotes: string;
  readonly dataGaps: readonly string[];
  readonly lastAuditedAt: string;
}

export interface StrategicInitiative {
  readonly initiativeId: string;
  readonly name: string;
  readonly objective: string;
  readonly territoryScope: string;
  readonly owner: string;
  readonly status: StrategicInitiativeState;
  readonly startDate: string;
  readonly targetDate?: string;
  readonly associatedKpis: readonly {
    readonly kpiId: string;
    readonly baselineValue: number | null;
    readonly targetValue: number;
    readonly currentValue: number | null;
  }[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DecisionRecord {
  readonly decisionId: string;
  readonly question: string;
  readonly evidenceLinks: readonly {
    readonly type: "KPI" | "MAP" | "FORECAST" | "SCENARIO" | "REPORT";
    readonly refId: string;
    readonly summary: string;
  }[];
  readonly scenariosConsidered: readonly string[];
  readonly selectedOption: string;
  readonly rationale: string;
  readonly actor: string;
  readonly actorRole: UserRole;
  readonly timestamp: string;
  readonly isSimulated?: boolean;
}

export interface StrategicReportSnapshot {
  readonly reportId: string;
  readonly title: string;
  readonly reportType: StrategicReportType;
  readonly countryId: string;
  readonly territoryId?: string;
  readonly period: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly dataVersion: string;
  readonly sections: readonly {
    readonly title: string;
    readonly narrative: string;
    readonly keyMetrics: readonly {
      readonly name: string;
      readonly valueFormatted: string;
      readonly source: string;
      readonly status: KpiState;
    }[];
    readonly dataConfidence: ConfidenceLevel;
  }[];
  readonly aiSummaryNarrative?: string;
  readonly isHumanReviewed: boolean;
  readonly reviewedBy?: string;
}

export interface StrategicCopilotQuery {
  readonly question: string;
  readonly role: UserRole;
  readonly organizationId?: string;
  readonly countryId: string;
  readonly territoryId?: string;
}

export interface StrategicCopilotResponse {
  readonly summary: string;
  readonly facts: readonly string[];
  readonly forecasts: readonly string[];
  readonly simulations: readonly string[];
  readonly recommendations: readonly string[];
  readonly citedMetrics: readonly {
    readonly kpiId: string;
    readonly name: string;
    readonly value: string;
    readonly period: string;
    readonly source: string;
    readonly freshness: string;
  }[];
  readonly insufficientDataDisclaimer?: string;
  readonly latencyMs: number;
  readonly toolsExecuted: readonly string[];
}

// ============================================================================
// FASE 18: EXPERIENCE OS & OMNICHANNEL JOURNEY DATA CONTRACTS
// ============================================================================

export type ExperienceChannel =
  | "WEB"
  | "PWA"
  | "ANDROID"
  | "KIOSK"
  | "QR"
  | "NFC"
  | "SMART_POINT";

export type JourneyState =
  | "DISCOVERING"
  | "PLANNING"
  | "BOOKING"
  | "UPCOMING"
  | "ACTIVE"
  | "COMPLETED";

export type ExperienceSyncStatus = "SYNCED" | "PENDING" | "CONFLICT" | "FAILED";

export interface ExperienceContextRecord {
  readonly sessionId: string;
  readonly userId?: string | null;
  readonly channel: ExperienceChannel;
  readonly countryId: string;
  readonly locale: string;
  readonly currency: string;
  readonly activeTripId?: string | null;
  readonly currentPlaceId?: string | null;
  readonly currentSmartPointId?: string | null;
  readonly lastIntent?: string | null;
  readonly updatedAt: string;
}

export interface TripItineraryStopRecord {
  readonly stopId: string;
  readonly placeId: string;
  readonly name: string;
  readonly territoryId: string;
  readonly dayNumber: number;
  readonly order: number;
  readonly scheduledTime?: string;
  readonly durationMinutes: number;
  readonly reservationId?: string | null;
  readonly smartPointId?: string | null;
  readonly isCompleted: boolean;
  readonly notes?: string;
}

export interface TripHubRecord {
  readonly tripId: string;
  readonly userId: string;
  readonly title: string;
  readonly countryId: string;
  readonly territories: readonly string[];
  readonly state: JourneyState;
  readonly startDate: string;
  readonly endDate: string;
  readonly stops: readonly TripItineraryStopRecord[];
  readonly syncStatus: ExperienceSyncStatus;
  readonly isOfflineAvailable: boolean;
  readonly sharedAccess: "PRIVATE" | "VIEW_LINK" | "COLLABORATIVE";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PassportEntryRecord {
  readonly entryId: string;
  readonly userId: string;
  readonly placeId: string;
  readonly placeName: string;
  readonly territoryId: string;
  readonly smartPointId?: string;
  readonly verificationType: "QR_SCAN" | "NFC_TAP" | "SMART_POINT" | "MANUAL_HOST_CONFIRM";
  readonly verifiedAt: string;
  readonly memoryNote?: string;
  readonly photoUrl?: string;
  readonly badgeUnlocked?: string;
}

export interface ExperienceDeepLinkRecord {
  readonly canonicalUrl: string;
  readonly targetType: "PLACE" | "BUSINESS" | "TRIP" | "CORRIDOR" | "SMART_POINT" | "RESERVATION";
  readonly targetId: string;
  readonly requiresAuth: boolean;
  readonly shortCode?: string;
  readonly expiresAt?: string | null;
}
