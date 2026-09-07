/**
 * WHY
 * Keeps static destination detail pages lightweight while live detail reads are designed.
 *
 * HOW
 * Resolves only local seed records and returns an explicit seed data envelope.
 *
 * WHAT
 * Static detail reader for SSG destination pages.
 */
import type { DataResult, PlaceRecord } from "@baqueano/types";
import { seedPlaces } from "../data/catalog";
import { slugifyPlace } from "../utils/place";

export function getStaticDestinationPlaces(): DataResult<PlaceRecord> {
  return {
    source: "seed",
    isConnected: false,
    items: seedPlaces,
    warning: "Destination detail pages are static seed records until a server-only live detail reader is added."
  };
}

export function getStaticDestinationPlaceBySlug(slug: string): { result: DataResult<PlaceRecord>; item?: PlaceRecord } {
  const result = getStaticDestinationPlaces();
  return {
    result,
    item: result.items.find((place) => slugifyPlace(place) === slug)
  };
}
