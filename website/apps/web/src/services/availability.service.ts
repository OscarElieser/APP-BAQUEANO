/**
 * POR QUE: Una recomendacion no equivale a disponibilidad real.
 * COMO: Lee slots por recurso; ante ausencia o error exige confirmacion.
 * QUE: Comprobaciones individuales y agrupadas sin inventar cupos ni precios.
 */
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { AvailabilitySlotRecord, AvailabilityStatus } from "@baqueano/types";

export interface AvailabilityCheck {
  readonly resourceId: string;
  readonly status: AvailabilityStatus;
  readonly slot?: AvailabilitySlotRecord;
  readonly message: string;
}

export async function checkAvailability(resourceId: string, startsAt: string, people = 1): Promise<AvailabilityCheck> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.availabilitySlots), where("resourceId", "==", resourceId), where("startsAt", ">=", startsAt), limit(10)));
    const slot = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as AvailabilitySlotRecord)[0];
    if (!slot) return { resourceId, status: "requires_confirmation", message: "Disponibilidad pendiente de confirmacion." };
    if (slot.remainingCapacity !== undefined && slot.remainingCapacity < people) return { resourceId, status: "unavailable", slot, message: "Capacidad insuficiente." };
    return { resourceId, status: slot.status, slot, message: slot.status === "available" ? "Disponibilidad verificada." : "El prestador debe confirmar." };
  } catch {
    return { resourceId, status: "requires_confirmation", message: "Consulta no disponible; no se confirma la reserva." };
  }
}

export async function checkTripAvailability(resources: readonly { resourceId: string; startsAt: string; people: number }[]) {
  return Promise.all(resources.map((item) => checkAvailability(item.resourceId, item.startsAt, item.people)));
}
