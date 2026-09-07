/**
 * WHY
 * Keeps routes, roles, and collection names consistent across apps.
 *
 * HOW
 * Exports immutable configuration consumed by navigation, admin modules, and services.
 *
 * WHAT
 * Public routes, admin modules, Firestore collections, and role permissions.
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
  destinations: "destinations",
  businesses: "businesses",
  territories: "territories",
  users: "users",
  reservations: "reservations",
  payments: "payments",
  auditLogs: "auditLogs"
} as const;

export const roleAccess: Record<UserRole, readonly string[]> = {
  super_admin: adminModules,
  admin: ["dashboard", "destinos", "negocios", "usuarios", "categorias", "historia", "gastronomia", "cultura", "sostenibilidad", "multimedia", "auditoria"],
  host: ["dashboard", "negocios", "reservas", "multimedia"],
  explorer: ["dashboard"]
};
