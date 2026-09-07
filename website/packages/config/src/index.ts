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
  auditLogs: "audit_logs"
} as const;

export const roleAccess: Record<UserRole, readonly string[]> = {
  super_admin: adminModules,
  admin: ["dashboard", "destinos", "negocios", "usuarios", "categorias", "historia", "gastronomia", "cultura", "sostenibilidad", "multimedia", "auditoria"],
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
