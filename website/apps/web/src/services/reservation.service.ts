// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — RESERVATION SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Gestionar el ciclo de vida de solicitudes de reservas entre el explorador
// y los anfitriones/baqueanos campesinos locales de forma transparente,
// con snapshot de precios inmutable e idempotencia para evitar duplicidades.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Valida contratos con Zod antes de persistir.
// - Aplica estados deterministas: `requested` → `pending_confirmation` → `confirmed`.
// - Soporta fallback seguro con datos tipados en modo local/desconectado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `requestReservation()`, `getExplorerReservations()`, `getHostReservations()`.
// ============================================================================

import type { DataResult, Reservation } from "@baqueano/types";
import { reservationSchema, type ReservationInput } from "@baqueano/validators";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";

const SEED_RESERVATIONS: readonly Reservation[] = [
  {
    id: "res-somoto-001",
    destinationId: "place-somoto",
    explorerId: "explorer-user-1",
    hostId: "host-somoto-coop",
    serviceName: "Recorrido Completo Cañón de Somoto con Baqueano",
    dateIso: "2026-10-15T08:00:00.000Z",
    people: 2,
    currency: "USD",
    unitPrice: 25,
    totalPrice: 50,
    status: "confirmed",
    notes: "Traer chalecos salvavidas y calzado acuático.",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-02T14:30:00.000Z"
  }
];

export async function requestReservation(input: ReservationInput): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
  try {
    const validated = reservationSchema.parse(input);
    const newReservation: Reservation = {
      ...validated,
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(getBaqueanoDb(), firestoreCollections.reservations, newReservation.id), newReservation, { merge: false });

    return {
      success: true,
      reservation: newReservation
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al procesar la solicitud de reserva."
    };
  }
}

export async function getExplorerReservations(explorerId: string): Promise<DataResult<Reservation>> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.reservations), where("explorerId", "==", explorerId)));
    return { source: "firestore", isConnected: true, items: snapshot.docs.map((item) => reservationSchema.parse({ ...item.data(), id: item.id })) };
  } catch (error) {
    return { source: "seed", isConnected: false, items: [], warning: error instanceof Error ? error.message : "Reservas no disponibles." };
  }
}

export async function getHostReservations(hostId: string): Promise<DataResult<Reservation>> {
  try {
    const snapshot = await getDocs(query(collection(getBaqueanoDb(), firestoreCollections.reservations), where("hostId", "==", hostId)));
    return { source: "firestore", isConnected: true, items: snapshot.docs.map((item) => reservationSchema.parse({ ...item.data(), id: item.id })) };
  } catch (error) {
    return { source: "seed", isConnected: false, items: [], warning: error instanceof Error ? error.message : "Reservas no disponibles." };
  }
}
