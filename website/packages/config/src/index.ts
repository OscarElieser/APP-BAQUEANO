/**
 * WHY
 * Keeps routes, roles, environment expectations, and collection names consistent across apps.
 *
 * HOW
 * Exports immutable configuration consumed by navigation, admin modules, services, and health checks.
 *
 * WHAT
 * Public routes, admin modules, Firestore collections, role permissions, and environment validation helpers.
 */
import type { UserRole } from "@baqueano/types";

export const publicRoutes = [
  { href: "/", label: "Inicio" },
  { href: "/destinos", label: "Destinos" },
  { href: "/mapa", label: "Mapa" },
  { href: "/historia", label: "Historia" },
  { href: "/territorios", label: "Territorios" },
  { href: "/gastronomia", label: "Gastronomia" },
  { href: "/cultura", label: "Cultura" },
  { href: "/baqueano-ai", label: "Baqueano AI" },
  { href: "/sostenibilidad", label: "Impacto" }
] as const;

export const adminModules = [
  "dashboard",
  "control-tower",
  "confianza",
  "paises",
  "desarrolladores",
  "smart-points",
  "dispositivos",
  "operaciones-campo",
  "plataforma",
  "destinos",
  "negocios",
  "mi-negocio",
  "usuarios",
  "categorias",
  "departamentos",
  "municipios",
  "reservas",
  "pagos",
  "suscripciones",
  "historia",
  "gastronomia",
  "cultura",
  "sostenibilidad",
  "multimedia",
  "predictive",
  "simulation",
  "spatial",
  "auditoria",
  "configuracion"
] as const;

export const firestoreCollections = {
  places: "places",
  destinations: "destinations",
  categories: "categories",
  departments: "departments",
  municipalities: "municipalities",
  businesses: "businesses",
  businessSubscriptions: "business_subscriptions",
  users: "users",
  userSavedPlaces: "user_saved_places",
  reservationRequests: "reservation_requests",
  reservations: "reservations",
  paymentOrders: "payment_orders",
  paymentTransactions: "payment_transactions",
  auditLogs: "audit_logs",
  incidents: "incidents",
  alerts: "alerts",
  territorialStates: "territorial_states",
  organizations: "organizations",
  organizationMemberships: "organization_memberships",
  apiKeys: "api_keys",
  webhooks: "webhooks",
  dataGovernance: "data_governance",
  platformConfig: "platform_config",
  smartPoints: "smart_points",
  iotDevices: "iot_devices",
  sensors: "sensors",
  sensorReadings: "sensor_readings",
  fieldTasks: "field_tasks",
  countries: "countries",
  translations: "translations",
  openDatasets: "open_datasets",
  apiClients: "api_clients",
  researchProjects: "research_projects",
  verifications: "verifications",
  verificationEvidence: "verification_evidence",
  trustClaims: "trust_claims",
  certifications: "certifications",
  integrityCases: "integrity_cases",
  sustainabilityAssessments: "sustainability_assessments",
  impactRecords: "impact_records",
  trustAudits: "trust_audits",
  trustAppeals: "trust_appeals",
  agentWorkflows: "agent_workflows",
  humanConfirmations: "human_confirmations",
  agentTraces: "agent_traces",
  activeTrips: "active_trips",
  predictiveModels: "predictive_models",
  predictiveForecasts: "predictive_forecasts",
  simulationScenarios: "simulation_scenarios",
  predictiveSignals: "predictive_signals",
  predictiveModelAuditLogs: "predictive_model_audit_logs",
  spatialRoutes: "spatial_routes",
  tourismCorridors: "tourism_corridors",
  territorialAccessibility: "territorial_accessibility",
  serviceGaps: "service_gaps",
  spatialCoverage: "spatial_coverage",
  geoAuditLogs: "geo_audit_logs"
} as const;

export const roleAccess: Record<UserRole, readonly string[]> = {
  super_admin: adminModules,
  admin: [
    "dashboard",
    "control-tower",
    "confianza",
    "paises",
    "smart-points",
    "dispositivos",
    "operaciones-campo",
    "destinos",
    "negocios",
    "usuarios",
    "categorias",
    "historia",
    "gastronomia",
    "cultura",
    "sostenibilidad",
    "multimedia",
    "auditoria"
  ],
  host: ["dashboard", "mi-negocio", "reservas", "multimedia", "suscripciones"],
  explorer: ["dashboard"]
};

export const runtimeEnvironments = ["development", "staging", "production"] as const;

export type RuntimeEnvironment = (typeof runtimeEnvironments)[number];

export const requiredPublicEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_ADMIN_URL"
] as const;

export const optionalServerEnvVars = [
  "BAQUEANO_AI_GATEWAY_URL",
  "BAQUEANO_AI_GATEWAY_SECRET",
  "MAPS_SERVER_KEY",
  "FIREBASE_SERVICE_ACCOUNT_PATH"
] as const;

export interface EnvironmentValidationResult {
  readonly environment: RuntimeEnvironment;
  readonly ok: boolean;
  readonly missing: readonly string[];
  readonly warnings: readonly string[];
}

export function getRuntimeEnvironment(value = process.env.NEXT_PUBLIC_BAQUEANO_ENV ?? process.env.NODE_ENV): RuntimeEnvironment {
  if (value === "production") return "production";
  if (value === "staging") return "staging";
  return "development";
}

export function validatePublicEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentValidationResult {
  const missing = requiredPublicEnvVars.filter((key) => !env[key] || env[key]?.trim() === "");
  const warnings: string[] = [];
  const environment = getRuntimeEnvironment(env.NEXT_PUBLIC_BAQUEANO_ENV ?? env.NODE_ENV);

  if (environment === "production" && env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
    warnings.push("NEXT_PUBLIC_SITE_URL must not point to localhost in production.");
  }

  if (environment === "production" && env.NEXT_PUBLIC_ADMIN_URL?.includes("localhost")) {
    warnings.push("NEXT_PUBLIC_ADMIN_URL must not point to localhost in production.");
  }

  return {
    environment,
    ok: missing.length === 0 && warnings.length === 0,
    missing,
    warnings
  };
}

// ============================================================================
// 🧭 CENTRAL AMERICA COUNTRY REGISTRY & CONFIGURATION (FASE 12)
// ============================================================================

export interface CountryConfigItem {
  readonly id: string;
  readonly code: "NI" | "CR" | "GT" | "HN" | "SV" | "BZ" | "PA";
  readonly name: string;
  readonly officialName: string;
  readonly status: "PLANNED" | "CONFIGURING" | "PILOT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  readonly defaultLocale: "es-NI" | "es-CR" | "es-GT" | "es-HN" | "es-SV" | "es-PA" | "es" | "en";
  readonly supportedLocales: readonly string[];
  readonly defaultCurrency: "NIO" | "CRC" | "GTQ" | "HNL" | "USD" | "BZD" | "PAB";
  readonly supportedCurrencies: readonly string[];
  readonly timezone: string;
  readonly level1Label: string;
  readonly level2Label: string;
  readonly hasIndigenousTerritories: boolean;
  readonly indigenousTerritoryLabel?: string;
  readonly mapCenter: { readonly latitude: number; readonly longitude: number; readonly defaultZoom: number };
  readonly emergencyPhone: string;
  readonly policePhone: string;
  readonly redCrossPhone: string;
  readonly capabilities: {
    readonly destinations: boolean;
    readonly businesses: boolean;
    readonly reservations: boolean;
    readonly onlinePayments: boolean;
    readonly aiAssistant: boolean;
    readonly iotSensors: boolean;
    readonly fieldOperations: boolean;
  };
}

export const CENTRAL_AMERICA_COUNTRIES: readonly CountryConfigItem[] = [
  {
    id: "NI",
    code: "NI",
    name: "Nicaragua",
    officialName: "República de Nicaragua",
    status: "ACTIVE",
    defaultLocale: "es-NI",
    supportedLocales: ["es-NI", "es", "en"],
    defaultCurrency: "NIO",
    supportedCurrencies: ["NIO", "USD"],
    timezone: "America/Managua",
    level1Label: "Departamento / Región Autónoma",
    level2Label: "Municipio",
    hasIndigenousTerritories: true,
    indigenousTerritoryLabel: "Territorio Indígena / Comunitario",
    mapCenter: { latitude: 12.8654, longitude: -85.2072, defaultZoom: 7 },
    emergencyPhone: "118",
    policePhone: "118",
    redCrossPhone: "128",
    capabilities: {
      destinations: true,
      businesses: true,
      reservations: true,
      onlinePayments: true,
      aiAssistant: true,
      iotSensors: true,
      fieldOperations: true
    }
  },
  {
    id: "CR",
    code: "CR",
    name: "Costa Rica",
    officialName: "República de Costa Rica",
    status: "CONFIGURING",
    defaultLocale: "es-CR",
    supportedLocales: ["es-CR", "es", "en"],
    defaultCurrency: "CRC",
    supportedCurrencies: ["CRC", "USD"],
    timezone: "America/Costa_Rica",
    level1Label: "Provincia",
    level2Label: "Cantón",
    hasIndigenousTerritories: true,
    indigenousTerritoryLabel: "Territorio Indígena Bribri/Cabécar",
    mapCenter: { latitude: 9.7489, longitude: -83.7534, defaultZoom: 8 },
    emergencyPhone: "911",
    policePhone: "911",
    redCrossPhone: "911",
    capabilities: {
      destinations: true,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: true,
      iotSensors: false,
      fieldOperations: false
    }
  },
  {
    id: "GT",
    code: "GT",
    name: "Guatemala",
    officialName: "República de Guatemala",
    status: "CONFIGURING",
    defaultLocale: "es-GT",
    supportedLocales: ["es-GT", "es", "en"],
    defaultCurrency: "GTQ",
    supportedCurrencies: ["GTQ", "USD"],
    timezone: "America/Guatemala",
    level1Label: "Departamento",
    level2Label: "Municipio",
    hasIndigenousTerritories: true,
    indigenousTerritoryLabel: "Comunidad Lingüística Maya",
    mapCenter: { latitude: 15.7835, longitude: -90.2308, defaultZoom: 7 },
    emergencyPhone: "110",
    policePhone: "110",
    redCrossPhone: "125",
    capabilities: {
      destinations: true,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: true,
      iotSensors: false,
      fieldOperations: false
    }
  },
  {
    id: "HN",
    code: "HN",
    name: "Honduras",
    officialName: "República de Honduras",
    status: "PLANNED",
    defaultLocale: "es-HN",
    supportedLocales: ["es-HN", "es", "en"],
    defaultCurrency: "HNL",
    supportedCurrencies: ["HNL", "USD"],
    timezone: "America/Tegucigalpa",
    level1Label: "Departamento",
    level2Label: "Municipio",
    hasIndigenousTerritories: true,
    mapCenter: { latitude: 15.2, longitude: -86.2419, defaultZoom: 7 },
    emergencyPhone: "911",
    policePhone: "911",
    redCrossPhone: "195",
    capabilities: {
      destinations: false,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: false,
      iotSensors: false,
      fieldOperations: false
    }
  },
  {
    id: "SV",
    code: "SV",
    name: "El Salvador",
    officialName: "República de El Salvador",
    status: "PLANNED",
    defaultLocale: "es-SV",
    supportedLocales: ["es-SV", "es", "en"],
    defaultCurrency: "USD",
    supportedCurrencies: ["USD"],
    timezone: "America/El_Salvador",
    level1Label: "Departamento",
    level2Label: "Municipio",
    hasIndigenousTerritories: false,
    mapCenter: { latitude: 13.7942, longitude: -88.8965, defaultZoom: 8 },
    emergencyPhone: "911",
    policePhone: "911",
    redCrossPhone: "911",
    capabilities: {
      destinations: false,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: false,
      iotSensors: false,
      fieldOperations: false
    }
  },
  {
    id: "BZ",
    code: "BZ",
    name: "Belice",
    officialName: "Belize",
    status: "PLANNED",
    defaultLocale: "en",
    supportedLocales: ["en", "es"],
    defaultCurrency: "BZD",
    supportedCurrencies: ["BZD", "USD"],
    timezone: "America/Belize",
    level1Label: "Distrito",
    level2Label: "Ciudad / Villa",
    hasIndigenousTerritories: true,
    mapCenter: { latitude: 17.1899, longitude: -88.4976, defaultZoom: 8 },
    emergencyPhone: "911",
    policePhone: "911",
    redCrossPhone: "911",
    capabilities: {
      destinations: false,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: false,
      iotSensors: false,
      fieldOperations: false
    }
  },
  {
    id: "PA",
    code: "PA",
    name: "Panamá",
    officialName: "República de Panamá",
    status: "PLANNED",
    defaultLocale: "es-PA",
    supportedLocales: ["es-PA", "es", "en"],
    defaultCurrency: "USD",
    supportedCurrencies: ["USD", "PAB"],
    timezone: "America/Panama",
    level1Label: "Provincia / Comarca Indígena",
    level2Label: "Distrito",
    hasIndigenousTerritories: true,
    mapCenter: { latitude: 8.5379, longitude: -80.7821, defaultZoom: 7 },
    emergencyPhone: "911",
    policePhone: "104",
    redCrossPhone: "911",
    capabilities: {
      destinations: false,
      businesses: false,
      reservations: false,
      onlinePayments: false,
      aiAssistant: false,
      iotSensors: false,
      fieldOperations: false
    }
  }
] as const;

export function getCountryConfig(code: string): CountryConfigItem {
  const found = CENTRAL_AMERICA_COUNTRIES.find((c) => c.code === code.toUpperCase());
  return found ?? CENTRAL_AMERICA_COUNTRIES[0];
}

export function getActiveCountries(): readonly CountryConfigItem[] {
  return CENTRAL_AMERICA_COUNTRIES.filter((c) => c.status === "ACTIVE" || c.status === "PILOT");
}

// ============================================================================
// 🧭 OPEN DATASETS CATALOG & DEVELOPER API SCOPES (FASE 13)
// ============================================================================

export interface OpenDatasetCatalogItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: "destinations" | "territories" | "culture" | "environment" | "smart_points";
  readonly formats: readonly ("json" | "geojson" | "csv")[];
  readonly license: "CC-BY-4.0" | "ODbL-1.0" | "Custom-Baqueano-Open";
  readonly updateFrequency: "real-time" | "hourly" | "daily" | "weekly" | "monthly" | "manual";
  readonly sourceOfTruth: string;
  readonly recordCount: number;
  readonly endpointUrl: string;
}

export const OPEN_DATASETS_CATALOG: readonly OpenDatasetCatalogItem[] = [
  {
    id: "ds-destinations-public",
    slug: "destinos-turisticos-verificados",
    title: "Catálogo de Destinos y Atractivos Verificados",
    description: "Geolocalización, categorización y descripción pública de reservas naturales, volcanes, lagunas y senderos verificados en Nicaragua.",
    category: "destinations",
    formats: ["json", "geojson", "csv"],
    license: "CC-BY-4.0",
    updateFrequency: "daily",
    sourceOfTruth: "Baqueano Nicaragua & Cooperativas Comunitarias",
    recordCount: 180,
    endpointUrl: "/api/open/v1/places"
  },
  {
    id: "ds-territories-admin",
    slug: "territorios-departamentos-municipios",
    title: "Límites y Nombres de Territorios y Municipios",
    description: "Listado estructurado de los 15 departamentos, 2 regiones autónomas y 153 municipios con metadatos turísticos y culturales.",
    category: "territories",
    formats: ["json", "csv"],
    license: "CC-BY-4.0",
    updateFrequency: "monthly",
    sourceOfTruth: "INETER & División Territorial Oficial",
    recordCount: 17,
    endpointUrl: "/api/open/v1/territories"
  },
  {
    id: "ds-smart-points-public",
    slug: "smart-points-red-territorial",
    title: "Red de Smart Points & Señalética QR/NFC",
    description: "Ubicación de tótems inteligentes, entradas de senderos, miradores y centros de visitantes con estado de aforo público agregado.",
    category: "smart_points",
    formats: ["json", "geojson"],
    license: "CC-BY-4.0",
    updateFrequency: "hourly",
    sourceOfTruth: "Red de Monitoreo Baqueano Smart Tourism",
    recordCount: 24,
    endpointUrl: "/api/open/v1/smart-points"
  },
  {
    id: "ds-culture-gastronomy",
    slug: "patrimonio-cultural-gastronomia",
    title: "Patrimonio Cultural, Rutas Históricas y Gastronomía",
    description: "Registro de tradiciones ancestrales, platos autóctonos por departamento y fechas de fiestas patronales tradicionales.",
    category: "culture",
    formats: ["json", "csv"],
    license: "CC-BY-4.0",
    updateFrequency: "monthly",
    sourceOfTruth: "Comunidades Locales & Archivo Histórico Baqueano",
    recordCount: 65,
    endpointUrl: "/api/open/v1/datasets/ds-culture-gastronomy/download"
  }
] as const;

export const AVAILABLE_API_SCOPES = [
  { id: "open_data.read", name: "Lectura de Datos Abiertos", description: "Acceso a datasets públicos, destinos, territorios y cultura.", tier: "public" },
  { id: "places.read", name: "Lectura de Destinos y Atractivos", description: "Consulta detallada de atractivos y coordenadas.", tier: "public" },
  { id: "places.submit", name: "Propuesta de Nuevos Atractivos", description: "Envío de sugerencias de destinos para moderación comunitaria.", tier: "partner" },
  { id: "smart_points.read", name: "Telemetría Pública de Smart Points", description: "Estado de aforo y facilidades en tótems territoriales.", tier: "public" },
  { id: "alerts.read", name: "Alertas Públicas de Senderos", description: "Avisos de seguridad, clima y transitabilidad en tiempo real.", tier: "public" },
  { id: "businesses.partner.read", name: "Directorio de Alojamientos y Cooperativas", description: "Acceso para aliados institucionales al catálogo de prestadores.", tier: "partner" },
  { id: "research.telemetry.read", name: "Telemetría Ambiental Agregada para Investigación", description: "Datos climáticos y de aforo anonimizados con K-anonymity.", tier: "research" }
] as const;

// ============================================================================
// 🧭 TRUST LAYER & RESPONSIBLE TOURISM CONSTANTS (FASE 14)
// ============================================================================

export const TRUST_BADGES_CATALOG = [
  {
    badgeId: "verified-baqueano",
    name: "Verificado por Baqueano",
    description: "Ubicación geográfica, existencia física y datos de contacto confirmados directamente por el equipo territorial de Baqueano.",
    issuer: "Baqueano Nicaragua",
    category: "verification",
    criteria: "Inspección en territorio, validación documental o visita de campo verificada en los últimos 12 meses.",
    validityMonths: 12,
    icon: "ShieldCheck"
  },
  {
    badgeId: "official-source",
    name: "Fuente Oficial",
    description: "Datos cartográficos y de gestión sustentados en decretos de áreas protegidas y división político-administrativa oficial.",
    issuer: "INETER / MARENA / Gobiernos Locales",
    category: "official",
    criteria: "Publicación oficial en La Gaceta o inventario turístico municipal reconocido.",
    validityMonths: 24,
    icon: "Building2"
  },
  {
    badgeId: "community-validated",
    name: "Validación Comunitaria",
    description: "Respaldado activamente por la directiva comunal o cooperativa campesina local del territorio.",
    issuer: "Directivas de Cooperativas y Pueblos Originarios",
    category: "community",
    criteria: "Carta de aval comunitario o participación directa en circuitos asociativos.",
    validityMonths: 18,
    icon: "Users"
  },
  {
    badgeId: "fresh-info",
    name: "Información Actualizada",
    description: "Precios, horarios y canales de contacto verificados en los últimos 90 días.",
    issuer: "Sistema de Frescura Baqueano",
    category: "freshness",
    criteria: "Revisión activa o confirmación operativa dentro del umbral de frescura de 90 días.",
    validityMonths: 3,
    icon: "Sparkles"
  },
  {
    badgeId: "local-economy-champion",
    name: "Economía Local Campesina",
    description: "El 80%+ de sus compras de insumos y personal provienen de familias y productores del municipio.",
    issuer: "Auditoría de Impacto Baqueano",
    category: "community",
    criteria: "Evidencia de compras locales y contratación directa sin intermediación foránea.",
    validityMonths: 12,
    icon: "HeartHandshake"
  }
] as const;

export const BRTI_CONFIG = {
  version: "1.0.0",
  dimensionWeights: {
    environmental: 0.20,
    local_economy: 0.25,
    social: 0.20,
    culture: 0.15,
    accessibility: 0.10,
    responsible_management: 0.10
  },
  levelThresholds: {
    INICIAL: { min: 0, max: 39 },
    EN_DESARROLLO: { min: 40, max: 64 },
    COMPROMISO_ALTO: { min: 65, max: 84 },
    REFERENTE: { min: 85, max: 100 }
  }
} as const;

export const FIELD_FRESHNESS_THRESHOLDS_DAYS = {
  price: 90,
  openingHours: 90,
  phone: 180,
  address: 365,
  description: 365,
  history: 730,
  sustainability: 180
} as const;

// ============================================================================
// 🧭 AGENTIC REGISTRY & TOOL PERMISSIONS CONSTANTS (FASE 15)
// ============================================================================

export const AGENT_REGISTRY_CATALOG = [
  {
    agentId: "trip_planner",
    name: "Trip Planner Agent",
    roleDescription: "Orquesta la creación integral de planes de viaje por días con itinerarios y presupuesto.",
    allowedTools: ["searchDestinations", "getMapDistance", "calculateBudgetTotal", "getWeatherSafety"],
    maxAutonomyLevel: "LEVEL_1_PREPARE",
    requiresHumanInTheLoop: true
  },
  {
    agentId: "destination",
    name: "Destination Agent",
    roleDescription: "Descubre atractivos turísticos, filtra por categoría territorial y compara opciones con señales de confianza.",
    allowedTools: ["searchDestinations", "getTrustSignals"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "map",
    name: "Map & Routing Agent",
    roleDescription: "Calcula distancias geodésicas, tiempos de traslado y optimiza la secuencia de paradas en territorio.",
    allowedTools: ["getMapDistance", "getRouteCoordinates"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "budget",
    name: "Budget Agent",
    roleDescription: "Ejecuta cálculos matemáticos determinísticos de costos en NIO y USD sin delegar matemáticas al modelo.",
    allowedTools: ["calculateBudgetTotal"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "safety",
    name: "Safety & Climate Agent",
    roleDescription: "Evalúa condiciones climáticas, dificultad física y alertas de transitabilidad oficiales.",
    allowedTools: ["getWeatherSafety", "getPublicAlerts"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "culture",
    name: "Culture & Heritage Agent",
    roleDescription: "Consulta archivos históricos y memorias comunitarias verificadas sin inventar tradiciones.",
    allowedTools: ["getCulturalHeritage"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "reservation",
    name: "Reservation Agent",
    roleDescription: "Prepara borradores estructurados de reservas sin autorización para cobrar o procesar pagos.",
    allowedTools: ["prepareReservationDraft"],
    maxAutonomyLevel: "LEVEL_1_PREPARE",
    requiresHumanInTheLoop: true
  },
  {
    agentId: "host",
    name: "Host Copilot Agent",
    roleDescription: "Asiste a cooperativas y anfitriones en redacción de descripciones y organización de evidencias.",
    allowedTools: ["prepareHostDraft", "analyzeListingCompleteness"],
    maxAutonomyLevel: "LEVEL_1_PREPARE",
    requiresHumanInTheLoop: true
  },
  {
    agentId: "trust",
    name: "Trust & Verification Agent",
    roleDescription: "Explica el estado de verificación y procedencia de datos de un recurso sin auto-certificar.",
    allowedTools: ["getTrustSignals"],
    maxAutonomyLevel: "LEVEL_0_READ",
    requiresHumanInTheLoop: false
  },
  {
    agentId: "operations",
    name: "Operations & Control Tower Agent",
    roleDescription: "Sintetiza alertas e incidencias para el equipo de guardia sin cerrar incidencias automáticamente.",
    allowedTools: ["summarizeIncidentAlerts", "getDataQualityFlags"],
    maxAutonomyLevel: "LEVEL_1_PREPARE",
    requiresHumanInTheLoop: true
  }
] as const;

export const AGENT_TOOL_PERMISSIONS_CATALOG = [
  {
    toolId: "searchDestinations",
    name: "Búsqueda de Destinos",
    description: "Consulta el catálogo territorial de destinos y atractivos publicados.",
    category: "READ",
    autonomyLevel: "LEVEL_0_READ",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  },
  {
    toolId: "getMapDistance",
    name: "Cálculo de Distancias",
    description: "Calcula distancias kilométricas y tiempos estimados de viaje entre coordenadas.",
    category: "READ",
    autonomyLevel: "LEVEL_0_READ",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  },
  {
    toolId: "calculateBudgetTotal",
    name: "Motor de Cálculo Presupuestario",
    description: "Suma determinística de costos de actividades, transporte y alimentos en NIO y USD.",
    category: "READ",
    autonomyLevel: "LEVEL_0_READ",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  },
  {
    toolId: "getWeatherSafety",
    name: "Estado de Clima y Alertas",
    description: "Consulta telemetría y pronósticos climáticos con recomendaciones de seguridad.",
    category: "READ",
    autonomyLevel: "LEVEL_0_READ",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  },
  {
    toolId: "prepareReservationDraft",
    name: "Preparación de Borrador de Reserva",
    description: "Genera el desglose de una solicitud de reserva para revisión humana antes de emitirla.",
    category: "PREPARE",
    autonomyLevel: "LEVEL_1_PREPARE",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  },
  {
    toolId: "saveTripPlanDraft",
    name: "Guardar Borrador de Itinerario",
    description: "Guarda un plan de viaje en la cuenta del usuario tras confirmación simple.",
    category: "WRITE_REVERSIBLE",
    autonomyLevel: "LEVEL_2_REVERSIBLE",
    allowedRoles: ["super_admin", "admin", "host", "explorer"],
    isReversible: true
  }
] as const;

// ============================================================================
// 🧭 PREDICTIVE INTELLIGENCE & SIMULATION CONFIGURATION (FASE 16)
// ============================================================================

export const PREDICTIVE_MODEL_CATALOG = [
  {
    modelId: "demand-forecast-v1",
    name: "Modelo de Pronóstico de Demanda Agregada",
    target: "aggregated_visitor_interest/day",
    version: "v1.2.0",
    state: "ACTIVE",
    health: "HEALTHY",
    baselineAlgorithm: "7-Day Moving Average + Day-of-Week Seasonality",
    baselineMae: 14.2,
    modelMae: 9.8,
    modelMape: 11.4,
    lastBacktestDate: "2026-08-30",
    modelCardRef: "docs/model-cards/demand-forecast-v1.md",
    killSwitchActive: false
  },
  {
    modelId: "capacity-forecast-v1",
    name: "Modelo de Estimación de Capacidad y Saturación",
    target: "capacity_utilization_rate",
    version: "v1.1.0",
    state: "ACTIVE",
    health: "HEALTHY",
    baselineAlgorithm: "Configured Threshold Baseline",
    baselineMae: 8.5,
    modelMae: 5.2,
    modelMape: 7.1,
    lastBacktestDate: "2026-08-30",
    modelCardRef: "docs/model-cards/capacity-forecast-v1.md",
    killSwitchActive: false
  },
  {
    modelId: "territorial-pressure-v1",
    name: "Índice Ponderado de Presión Territorial",
    target: "territorial_pressure_score (0-100)",
    version: "v1.0.4",
    state: "ACTIVE",
    health: "HEALTHY",
    baselineAlgorithm: "Static Regional Average",
    baselineMae: 12.0,
    modelMae: 6.7,
    modelMape: 8.9,
    lastBacktestDate: "2026-08-30",
    modelCardRef: "docs/model-cards/territorial-pressure-v1.md",
    killSwitchActive: false
  },
  {
    modelId: "cost-forecast-v1",
    name: "Modelo FinOps de Proyección de Infraestructura",
    target: "monthly_infrastructure_cost_usd",
    version: "v1.0.1",
    state: "ACTIVE",
    health: "HEALTHY",
    baselineAlgorithm: "Linear Run-Rate Extrapolation",
    baselineMae: 18.0,
    modelMae: 11.5,
    modelMape: 6.8,
    lastBacktestDate: "2026-08-30",
    modelCardRef: "docs/model-cards/cost-forecast-v1.md",
    killSwitchActive: false
  }
] as const;

export const SIMULATION_BOUNDS_CONFIG = {
  minDemandMultiplier: 0.1,
  maxDemandMultiplier: 3.0,
  minCapacityMultiplier: 0.1,
  maxCapacityMultiplier: 2.0,
  maxRedistributionPercent: 50,
  defaultHorizonDays: 7,
  maxSimulationsPerUserPerHour: 60
} as const;

// ============================================================================
// FASE 17: SPATIAL & GIS CONFIGURATION & CATALOGS
// ============================================================================

export const NICARAGUA_TERRITORY_BOUNDS = {
  minLat: 10.5,
  maxLat: 15.1,
  minLng: -87.8,
  maxLng: -82.5
} as const;

export const GIS_THRESHOLDS_CONFIG = {
  maxStraightLineDistanceKm: 800,
  nearbyDefaultRadiusKm: 15,
  nearbyMaxRadiusKm: 100,
  emergencyServiceCriticalDistanceKm: 25,
  emergencyServiceModerateDistanceKm: 15,
  highImpactMoveThresholdMeters: 500,
  maxWaypointsPerRoute: 25,
  defaultDrivingSpeedKmh: 45, // Realistic Nicaraguan secondary & rural road average
  defaultWalkingSpeedKmh: 4.5,
  defaultCyclingSpeedKmh: 15.0,
  defaultBoatSpeedKmh: 20.0
} as const;

export const TOURISM_CORRIDORS_CATALOG = [
  {
    corridorId: "corridor-volcanes-pacifico",
    slug: "corredor-volcanes-pacifico",
    name: "Corredor de los Volcanes del Pacífico",
    description: "Ruta geológica y cultural que enlaza los colosos activos y lagunas cratéricas de Occidente hasta el Gran Lago de Nicaragua.",
    countryId: "NI",
    territories: ["Leon", "Chinandega", "Managua", "Masaya", "Granada", "Rivas"],
    theme: "VOLCANOES" as const,
    places: ["volcan-cerro-negro", "volcan-momotombo", "volcan-masaya", "volcan-mombacho", "isla-ometepe"],
    stops: [
      {
        placeId: "volcan-cerro-negro",
        name: "Volcán Cerro Negro",
        territory: "Leon",
        role: "PRIMARY_HUB" as const,
        coordinates: { latitude: 12.5064, longitude: -86.7022 }
      },
      {
        placeId: "volcan-momotombo",
        name: "Volcán Momotombo & Ruinas de León Viejo",
        territory: "Leon",
        role: "SCENIC_LOOKOUT" as const,
        coordinates: { latitude: 12.4231, longitude: -86.5397 }
      },
      {
        placeId: "volcan-masaya",
        name: "Parque Nacional Volcán Masaya",
        territory: "Masaya",
        role: "PRIMARY_HUB" as const,
        coordinates: { latitude: 11.9842, longitude: -86.1608 }
      },
      {
        placeId: "volcan-mombacho",
        name: "Reserva Natural Volcán Mombacho",
        territory: "Granada",
        role: "COMMUNITY_STOP" as const,
        coordinates: { latitude: 11.8267, longitude: -85.9681 }
      },
      {
        placeId: "isla-ometepe",
        name: "Oasis de Paz: Isla de Ometepe (Concepción & Maderas)",
        territory: "Rivas",
        role: "GATEWAY" as const,
        coordinates: { latitude: 11.5392, longitude: -85.6269 }
      }
    ],
    totalDistanceKm: 265,
    suggestedDurationDays: 4,
    sustainabilityRating: 92,
    status: "PUBLISHED" as const,
    publishedAt: "2026-08-15T00:00:00Z",
    reviewedBy: "comite-territorial-occidente",
    routeGeometryRef: "geo/corridors/volcanes-pacifico.geojson",
    culturalHighlights: [
      "Sandboarding pionero en ceniza volcánica viva",
      "Cosmovisión indígena Chorotega de la Boca del Infierno",
      "Senderismo en bosque nuboso primario y cafetales de altura bajo sombra"
    ],
    localPartnerCount: 28,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-30T00:00:00Z"
  },
  {
    corridorId: "corridor-ruta-del-cafe-norte",
    slug: "corredor-ruta-del-cafe-norte",
    name: "Corredor de la Ruta del Café del Norte",
    description: "Travesía por los macizos montañosos, cascadas cristalinas y cooperativas agroturísticas campesinas de Matagalpa y Jinotega.",
    countryId: "NI",
    territories: ["Matagalpa", "Jinotega", "Esteli", "Madriz", "Nueva Segovia"],
    theme: "COFFEE" as const,
    places: ["reserva-dantanli-el-diablo", "selva-negra-matagalpa", "canion-de-somoto", "miraflores-esteli"],
    stops: [
      {
        placeId: "selva-negra-matagalpa",
        name: "Finca Ecológica Selva Negra",
        territory: "Matagalpa",
        role: "GATEWAY" as const,
        coordinates: { latitude: 12.9989, longitude: -85.9122 }
      },
      {
        placeId: "reserva-dantanli-el-diablo",
        name: "Reserva Natural Datanlí - El Diablo",
        territory: "Jinotega",
        role: "PRIMARY_HUB" as const,
        coordinates: { latitude: 13.1558, longitude: -85.8756 }
      },
      {
        placeId: "miraflores-esteli",
        name: "Área Protegida Miraflor - Moropotente",
        territory: "Esteli",
        role: "COMMUNITY_STOP" as const,
        coordinates: { latitude: 13.2389, longitude: -86.2578 }
      },
      {
        placeId: "canion-de-somoto",
        name: "Monumento Nacional Cañón de Somoto",
        territory: "Madriz",
        role: "SCENIC_LOOKOUT" as const,
        coordinates: { latitude: 13.4611, longitude: -86.6719 }
      }
    ],
    totalDistanceKm: 210,
    suggestedDurationDays: 3,
    sustainabilityRating: 96,
    status: "PUBLISHED" as const,
    publishedAt: "2026-08-18T00:00:00Z",
    reviewedBy: "red-cooperativas-norte",
    routeGeometryRef: "geo/corridors/ruta-cafe-norte.geojson",
    culturalHighlights: [
      "Cosecha y catación de cafés especiales de estricta altura (SHG)",
      "Pueblos de tejedores de pita y guitarras de San Juan de Limay",
      "Navegación en neumáticos y senderismo geológico en el Cañón de Somoto"
    ],
    localPartnerCount: 42,
    createdAt: "2026-08-05T00:00:00Z",
    updatedAt: "2026-08-28T00:00:00Z"
  },
  {
    corridorId: "corridor-pueblos-blancos-artesanias",
    slug: "corredor-pueblos-blancos-artesanias",
    name: "Corredor de los Pueblos Blancos & Tradición Artesanal",
    description: "Circuito cultural y gastronómico por las mesetas de Masaya y Carazo, cuna de ceramistas precolombinos y danzas tradicionales.",
    countryId: "NI",
    territories: ["Masaya", "Carazo", "Granada"],
    theme: "CRAFTS" as const,
    places: ["san-juan-de-oriente", "catarina-mirador", "dira-cueva", "masatepe-dulces", "diriamba-gu Gueguense"],
    stops: [
      {
        placeId: "san-juan-de-oriente",
        name: "San Juan de Oriente: Villa Alfarera",
        territory: "Masaya",
        role: "PRIMARY_HUB" as const,
        coordinates: { latitude: 11.9056, longitude: -86.0792 }
      },
      {
        placeId: "catarina-mirador",
        name: "Mirador de Catarina & Laguna de Apoyo",
        territory: "Masaya",
        role: "SCENIC_LOOKOUT" as const,
        coordinates: { latitude: 11.9125, longitude: -86.0744 }
      },
      {
        placeId: "masatepe-dulces",
        name: "Masatepe: Muebles de Mimbre & Sopa de Mondongo",
        territory: "Masaya",
        role: "COMMUNITY_STOP" as const,
        coordinates: { latitude: 11.9189, longitude: -86.1436 }
      },
      {
        placeId: "diriamba-gueguense",
        name: "Diriamba: Cuna del Güegüense (Patrimonio UNESCO)",
        territory: "Carazo",
        role: "GATEWAY" as const,
        coordinates: { latitude: 11.8578, longitude: -86.2397 }
      }
    ],
    totalDistanceKm: 65,
    suggestedDurationDays: 2,
    sustainabilityRating: 94,
    status: "PUBLISHED" as const,
    publishedAt: "2026-08-20T00:00:00Z",
    reviewedBy: "colectivo-artesanos-meseta",
    routeGeometryRef: "geo/corridors/pueblos-blancos.geojson",
    culturalHighlights: [
      "Torno cerámico y bruñido con piedras de río ancestrales",
      "Vista panorámica de 360° sobre la Laguna Cráter de Apoyo",
      "Teatro danza satírico de El Güegüense con máscaras de madera"
    ],
    localPartnerCount: 35,
    createdAt: "2026-08-10T00:00:00Z",
    updatedAt: "2026-08-29T00:00:00Z"
  },
  {
    corridorId: "corridor-caribe-biosferas",
    slug: "corredor-caribe-biosferas",
    name: "Corredor Caribeño, Ríos & Biosferas Vivas",
    description: "Aventura fluvial y marina que conecta el Río San Juan, el Archipiélago de Solentiname y los Cayos Perlas en el Caribe nicaragüense.",
    countryId: "NI",
    territories: ["Rio San Juan", "RACCS", "RACCN"],
    theme: "CARIBBEAN" as const,
    places: ["solentiname-archipielago", "el-castillo-fortaleza", "reserva-indio-maiz", "bluefields-cayos-perlas"],
    stops: [
      {
        placeId: "solentiname-archipielago",
        name: "Archipiélago de Solentiname: Pintura Primitivista & Aves",
        territory: "Rio San Juan",
        role: "GATEWAY" as const,
        coordinates: { latitude: 11.1833, longitude: -85.0333 }
      },
      {
        placeId: "el-castillo-fortaleza",
        name: "Fortaleza de la Inmaculada Concepción (El Castillo)",
        territory: "Rio San Juan",
        role: "PRIMARY_HUB" as const,
        coordinates: { latitude: 11.0189, longitude: -84.3986 }
      },
      {
        placeId: "reserva-indio-maiz",
        name: "Reserva Biológica Indio Maíz (Sendero Bartola)",
        territory: "Rio San Juan",
        role: "COMMUNITY_STOP" as const,
        coordinates: { latitude: 10.9722, longitude: -84.3314 }
      },
      {
        placeId: "bluefields-cayos-perlas",
        name: "Cayos Perlas & Cultura Creole / Garífuna de Bluefields",
        territory: "RACCS",
        role: "SCENIC_LOOKOUT" as const,
        coordinates: { latitude: 12.0089, longitude: -83.7642 }
      }
    ],
    totalDistanceKm: 340,
    suggestedDurationDays: 5,
    sustainabilityRating: 98,
    status: "UNDER_REVIEW" as const,
    publishedAt: null,
    reviewedBy: "comite-biocultural-caribe",
    routeGeometryRef: "geo/corridors/caribe-biosferas.geojson",
    culturalHighlights: [
      "Artesanía en madera de balsa y pintura naif en la isla Mancarrón",
      "Historia de piratas y defensa soberana sobre los raudales del río",
      "Protección comunitaria de tortugas carey y arrecifes coralinos en Cayos Perlas"
    ],
    localPartnerCount: 19,
    createdAt: "2026-08-12T00:00:00Z",
    updatedAt: "2026-08-30T00:00:00Z"
  }
] as const;





