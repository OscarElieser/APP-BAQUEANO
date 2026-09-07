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
  researchProjects: "research_projects"
} as const;

export const roleAccess: Record<UserRole, readonly string[]> = {
  super_admin: adminModules,
  admin: [
    "dashboard",
    "control-tower",
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


