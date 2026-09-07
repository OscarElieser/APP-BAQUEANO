/**
 * WHY
 * Shares pure place formatting helpers without pulling Firebase into client bundles.
 *
 * HOW
 * Uses deterministic string normalization with no runtime service imports.
 *
 * WHAT
 * Slug utilities for Android-compatible place records.
 */
import type { PlaceRecord } from "@baqueano/types";

export function slugifyPlace(place: PlaceRecord): string {
  return place.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
