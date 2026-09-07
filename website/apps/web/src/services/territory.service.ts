/**
 * WHY
 * Isolates territory seed data behind a service boundary before Firestore migration.
 *
 * HOW
 * Returns explicit seed-sourced data with the same result envelope as Firebase services.
 *
 * WHAT
 * Territory list and detail readers.
 */
import type { DataResult, Territory } from "@baqueano/types";
import { territories } from "../data/catalog";

export async function getTerritories(): Promise<DataResult<Territory>> {
  return {
    source: "seed",
    isConnected: false,
    items: territories,
    warning: "Territories are using editorial seed data until a Firestore collection is connected."
  };
}

export async function getTerritoryBySlug(slug: string): Promise<Territory | undefined> {
  const result = await getTerritories();
  return result.items.find((territory) => territory.slug === slug);
}
