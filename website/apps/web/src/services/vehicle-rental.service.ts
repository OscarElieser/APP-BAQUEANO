/**
 * POR QUE: La movilidad debe comparar opciones sin inventar empresas o tarifas.
 * COMO: Consulta solo registros publicados y vehiculos verificados.
 * QUE: Catalogo de rentadoras y busqueda determinista de vehiculos.
 */
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { DataResult, RentalVehicleRecord, VehicleCategory, VehicleRentalCompanyRecord } from "@baqueano/types";

export interface VehicleSearchInput { readonly pickupLocation: string; readonly category?: VehicleCategory; readonly passengers: number; readonly luggage: number; }

export async function listRentalCompanies(): Promise<DataResult<VehicleRentalCompanyRecord>> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.vehicleRentalCompanies), where("status", "==", "published"), limit(50)));
    return { source: "firestore", isConnected: true, items: snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as VehicleRentalCompanyRecord) };
  } catch (error) {
    return { source: "seed", isConnected: false, items: [], warning: error instanceof Error ? error.message : "Catalogo no disponible." };
  }
}

export async function searchVehicles(input: VehicleSearchInput): Promise<DataResult<RentalVehicleRecord>> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.rentalVehicles), limit(100)));
    const items = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as RentalVehicleRecord)
      .filter((vehicle) => vehicle.verificationStatus === "verified")
      .filter((vehicle) => !input.category || vehicle.category === input.category)
      .filter((vehicle) => vehicle.passengerCapacity >= input.passengers && vehicle.luggageCapacity >= input.luggage)
      .filter((vehicle) => vehicle.pickupLocations.some((location) => location.toLowerCase().includes(input.pickupLocation.toLowerCase())));
    return { source: "firestore", isConnected: true, items };
  } catch (error) {
    return { source: "seed", isConnected: false, items: [], warning: error instanceof Error ? error.message : "Vehiculos no disponibles." };
  }
}
