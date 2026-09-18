/**
 * WHY
 * Keeps Control Center destination screens behind a repository boundary.
 *
 * HOW
 * Calls the shared Firebase reader and preserves an honest empty state when unavailable.
 *
 * WHAT
 * Admin reader for Android-compatible `places` records.
 */
import type { DataResult, PlaceRecord } from "@baqueano/types";

export async function getAdminDestinationPlaces(): Promise<DataResult<PlaceRecord>> {
  const { listPlacesForAdmin } = await import("@baqueano/firebase");
  return listPlacesForAdmin();
}
