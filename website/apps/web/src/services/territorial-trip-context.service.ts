/**
 * POR QUE
 * Conoce Tu Destino y emergencias deben depender del territorio real del viaje.
 *
 * COMO
 * Consulta places por departamento, conserva solo registros publicados y separa
 * gastronomia, cultura y emergencia sin inventar telefonos o distancias.
 *
 * QUE
 * Contexto territorial verificable para Mi Viaje.
 */
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { PlaceRecord } from "@baqueano/types";

export interface TerritorialTripContext {
  readonly territory: string;
  readonly gastronomy: readonly PlaceRecord[];
  readonly culture: readonly PlaceRecord[];
  readonly emergencies: readonly PlaceRecord[];
  readonly connected: boolean;
}

export async function getTerritorialTripContext(territory: string): Promise<TerritorialTripContext> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.places), where("departmentName", "==", territory), limit(100)));
    const places = snapshot.docs.map((item) => ({ ...item.data(), placeId: item.id }) as PlaceRecord).filter((item) => item.status === "published");
    const matches = (place: PlaceRecord, terms: readonly string[]) => terms.some((term) => `${place.categoryName} ${place.subcategory}`.toLowerCase().includes(term));
    return {
      territory,
      gastronomy: places.filter((place) => matches(place, ["gastro", "restaurante", "comida"])),
      culture: places.filter((place) => matches(place, ["cultura", "museo", "historia", "patrimonio"])),
      emergencies: places.filter((place) => place.isEmergency && place.verified),
      connected: true
    };
  } catch {
    return { territory, gastronomy: [], culture: [], emergencies: [], connected: false };
  }
}
