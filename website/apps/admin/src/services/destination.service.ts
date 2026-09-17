/**
 * WHY
 * Keeps Control Center destination screens behind a repository boundary.
 *
 * HOW
 * Calls shared Firebase list readers and supplies explicit seed rows when env is missing.
 *
 * WHAT
 * Admin reader for Android-compatible `places` records.
 */
import type { DataResult, PlaceRecord } from "@baqueano/types";

const adminSeedPlaces: readonly PlaceRecord[] = [
  {
    placeId: "dest-canon-somoto",
    name: "Canon de Somoto",
    categoryId: "canon-y-rio",
    categoryName: "Canon y rio",
    subcategory: "rio",
    description: "Paredes antiguas, agua clara y caminata guiada por comunidades del norte.",
    departmentId: "madriz",
    departmentName: "Madriz",
    municipalityId: "somoto",
    municipalityName: "Somoto",
    address: "Somoto, Madriz",
    latitude: 13.4817,
    longitude: -86.5821,
    geohash: "",
    imageUrl: "/assets/images/destinos/canon_de_somoto.jpg",
    imageUrls: [],
    is24Hours: false,
    isOpen: true,
    isEmergency: false,
    isTourist: true,
    isCommercial: false,
    verified: true,
    rating: 4.9,
    reviewCount: 0,
    status: "published",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  },
  {
    placeId: "dest-cerro-negro",
    name: "Cerro Negro",
    categoryId: "volcan-activo",
    categoryName: "Volcan activo",
    subcategory: "aventura",
    description: "Arena volcanica, horizonte abierto y descenso controlado con guias certificados.",
    departmentId: "leon",
    departmentName: "Leon",
    municipalityId: "leon",
    municipalityName: "Leon",
    address: "Leon, Leon",
    latitude: 12.5069,
    longitude: -86.7028,
    geohash: "",
    imageUrl: "/assets/images/destinos/cerro_negro.jpg",
    imageUrls: [],
    is24Hours: false,
    isOpen: true,
    isEmergency: false,
    isTourist: true,
    isCommercial: false,
    verified: true,
    rating: 4.7,
    reviewCount: 0,
    status: "draft",
    createdAt: "2026-09-07T00:00:00.000Z",
    updatedAt: "2026-09-07T00:00:00.000Z"
  }
];

export async function getAdminDestinationPlaces(): Promise<DataResult<PlaceRecord>> {
  const { listPlacesForAdmin } = await import("@baqueano/firebase");
  return listPlacesForAdmin(adminSeedPlaces);
}
