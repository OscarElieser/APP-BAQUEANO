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




