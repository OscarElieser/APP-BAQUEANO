/**
 * WHY
 * Keeps public destination pages from querying Firebase directly.
 *
 * HOW
 * Calls the shared Firebase repository and supplies clearly labeled seed records
 * when the real project environment is not configured.
 *
 * WHAT
 * Public list and detail readers for Android-compatible `places` records.
 */
import type { DataResult, PlaceRecord } from "@baqueano/types";
import { seedPlaces } from "../data/catalog";
import { slugifyPlace } from "../utils/place";

export async function getPublishedDestinationPlaces(): Promise<DataResult<PlaceRecord>> {
  const { listPublishedPlaces } = await import("@baqueano/firebase");
  return listPublishedPlaces(seedPlaces);
}

export async function getDestinationPlaceBySlug(slug: string): Promise<{ result: DataResult<PlaceRecord>; item?: PlaceRecord }> {
  const result = await getPublishedDestinationPlaces();
  const item = result.items.find((place) => slugifyPlace(place) === slug);
  return { result, item };
}

export { slugifyPlace };
