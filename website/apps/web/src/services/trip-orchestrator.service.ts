/**
 * POR QUE: La UI no debe decidir estados criticos de reserva, pago o activacion.
 * COMO: Orquesta pasos conservadores, revalida y mantiene snapshots.
 * QUE: Persistencia, carga, disponibilidad y compuertas de pago y activacion.
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { TripBookingRecord, TripPlanRecord } from "@baqueano/types";
import { checkTripAvailability } from "./availability.service";

export async function saveTripPlan(plan: TripPlanRecord) { await setDoc(doc(getBaqueanoDb(), firestoreCollections.tripPlans, plan.id), plan, { merge: false }); }
export async function loadTrip(tripId: string): Promise<TripBookingRecord | null> { const snapshot = await getDoc(doc(getBaqueanoDb(), firestoreCollections.tripBookings, tripId)); return snapshot.exists() ? snapshot.data() as TripBookingRecord : null; }
export async function prepareTrip(input: Omit<TripBookingRecord, "status" | "paymentStatus" | "qrStatus" | "priceSnapshotAt" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const record: TripBookingRecord = { ...input, status: "draft", paymentStatus: "not_started", qrStatus: "not_eligible", priceSnapshotAt: now, createdAt: now, updatedAt: now };
  await setDoc(doc(getBaqueanoDb(), firestoreCollections.tripBookings, record.tripId), record, { merge: false });
  return record;
}
export async function requestTripReservations(tripId: string, resources: readonly { resourceId: string; startsAt: string; people: number }[]) {
  const checks = await checkTripAvailability(resources);
  const status: TripBookingRecord["status"] = checks.every((check) => check.status === "available" || check.status === "limited") ? "pending_provider_confirmation" : "checking_availability";
  await setDoc(doc(getBaqueanoDb(), firestoreCollections.tripBookings, tripId), { status, updatedAt: new Date().toISOString() }, { merge: true });
  return { status, checks };
}
export const canCreateTripPayment = (trip: TripBookingRecord) => trip.status === "ready_for_payment" && trip.total > 0;
export const canActivateTrip = (trip: TripBookingRecord) => trip.status === "confirmed" && trip.paymentStatus === "paid" && trip.qrStatus === "active";
