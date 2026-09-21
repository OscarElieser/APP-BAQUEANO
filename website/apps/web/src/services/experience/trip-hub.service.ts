/**
 * POR QUE
 * Mi Viaje debe representar el viaje solicitado y nunca una aventura semilla.
 *
 * COMO
 * Lee trip_bookings y trip_plans por sus IDs, transforma el plan al contrato
 * TripHubRecord y conserva estados desconocidos como pendientes. No incorpora
 * alertas, emergencias, horarios ni reservas que no existan en Firestore.
 *
 * QUE
 * Carga del Trip Hub, vista diaria y actualizacion reversible de progreso.
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreCollections } from "@baqueano/config";
import { getBaqueanoDb } from "@baqueano/firebase";
import type { JourneyState, TripBookingRecord, TripHubRecord, TripPlanRecord } from "@baqueano/types";

export interface TodayView {
  readonly tripTitle: string;
  readonly currentDayNumber: number;
  readonly totalDays: number;
  readonly todayStops: TripHubRecord["stops"];
  readonly nextPendingStop: TripHubRecord["stops"][number] | null;
  readonly activeAlerts: readonly { id: string; severity: "INFO" | "WARNING" | "CRITICAL"; message: string }[];
  readonly nearbyEmergency: null;
}

function mapJourneyState(booking: TripBookingRecord): JourneyState {
  if (booking.status === "completed") return "COMPLETED";
  if (booking.status === "confirmed" && booking.paymentStatus === "paid") return "ACTIVE";
  if (booking.status === "cancelled") return "DISCOVERING";
  return "BOOKING";
}

function toTripHub(booking: TripBookingRecord, plan: TripPlanRecord): TripHubRecord {
  const stops = plan.days.flatMap((day) => day.stops.map((stop, index) => ({
    stopId: `${day.dayNumber}-${stop.placeId}-${index}`,
    placeId: stop.placeId,
    name: stop.name,
    territoryId: stop.department,
    dayNumber: day.dayNumber,
    order: index + 1,
    durationMinutes: Math.max(0, Math.round(stop.durationHours * 60)),
    reservationId: booking.reservationIds[index] ?? null,
    smartPointId: null,
    isCompleted: false,
    notes: stop.notes
  })));
  const start = plan.createdAt.slice(0, 10);
  const endDate = new Date(plan.createdAt);
  endDate.setUTCDate(endDate.getUTCDate() + Math.max(0, plan.daysCount - 1));
  return {
    tripId: booking.tripId,
    userId: booking.explorerId,
    title: plan.title,
    countryId: "NI",
    territories: Array.from(new Set(plan.days.flatMap((day) => day.stops.map((stop) => stop.department)))),
    state: mapJourneyState(booking),
    startDate: start,
    endDate: endDate.toISOString().slice(0, 10),
    stops,
    syncStatus: "SYNCED",
    isOfflineAvailable: false,
    sharedAccess: "PRIVATE",
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}

export async function getTripHubData(tripId: string): Promise<TripHubRecord | null> {
  try {
    const bookingSnapshot = await getDoc(doc(getBaqueanoDb(), firestoreCollections.tripBookings, tripId));
    if (!bookingSnapshot.exists()) return null;
    const booking = bookingSnapshot.data() as TripBookingRecord;
    const planSnapshot = await getDoc(doc(getBaqueanoDb(), firestoreCollections.tripPlans, booking.itineraryId));
    if (!planSnapshot.exists()) return null;
    return toTripHub(booking, planSnapshot.data() as TripPlanRecord);
  } catch {
    return null;
  }
}

export function getTodayView(trip: TripHubRecord, currentDayNumber = 1): TodayView {
  const todayStops = trip.stops.filter((stop) => stop.dayNumber === currentDayNumber);
  return {
    tripTitle: trip.title,
    currentDayNumber,
    totalDays: Math.max(1, ...trip.stops.map((stop) => stop.dayNumber)),
    todayStops,
    nextPendingStop: todayStops.find((stop) => !stop.isCompleted) ?? null,
    activeAlerts: [],
    nearbyEmergency: null
  };
}

export async function markStopCompleted(tripId: string, stopId: string, isCompleted: boolean): Promise<void> {
  await setDoc(doc(getBaqueanoDb(), firestoreCollections.activeTrips, tripId), {
    completedStops: { [stopId]: isCompleted },
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
