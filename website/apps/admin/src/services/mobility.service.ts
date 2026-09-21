/**
 * POR QUE: El administrador necesita ver datos reales, no contadores semilla.
 * COMO: Lee colecciones de movilidad y valida cada documento con Zod.
 * QUE: Resumen tipado de rentadoras, vehiculos y slots.
 */
import { collection, getDocs, limit, query } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import { availabilitySlotRecordSchema, rentalVehicleRecordSchema, vehicleRentalCompanyRecordSchema } from "@baqueano/validators";

export async function getMobilityAdminSummary() {
  try {
    const [companies, vehicles, availability] = await Promise.all([
      getDocs(query(collection(getBaqueanoDb(), firestoreCollections.vehicleRentalCompanies), limit(100))),
      getDocs(query(collection(getBaqueanoDb(), firestoreCollections.rentalVehicles), limit(250))),
      getDocs(query(collection(getBaqueanoDb(), firestoreCollections.availabilitySlots), limit(250)))
    ]);
    const parsedCompanies = companies.docs.map((item) => vehicleRentalCompanyRecordSchema.safeParse({ ...item.data(), id: item.id })).filter((item) => item.success).map((item) => item.data);
    const parsedVehicles = vehicles.docs.map((item) => rentalVehicleRecordSchema.safeParse({ ...item.data(), id: item.id })).filter((item) => item.success).map((item) => item.data);
    const parsedSlots = availability.docs.map((item) => availabilitySlotRecordSchema.safeParse({ ...item.data(), id: item.id })).filter((item) => item.success).map((item) => item.data);
    return {
      connected: true,
      companies: parsedCompanies,
      vehicles: parsedVehicles,
      slots: parsedSlots,
      pendingCompanies: parsedCompanies.filter((item) => item.status === "pending_review").length,
      verifiedVehicles: parsedVehicles.filter((item) => item.verificationStatus === "verified").length
    };
  } catch {
    return { connected: false, companies: [], vehicles: [], slots: [], pendingCompanies: 0, verifiedVehicles: 0 };
  }
}
