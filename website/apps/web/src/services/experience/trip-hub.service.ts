// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CENTRO UNIFICADO DE VIAJE (TRIP HUB) (trip-hub.service.ts)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el centro operativo del viaje ("Trip Hub") unificando itinerario, mapa,
//   reservas, alertas territoriales, balizas Smart Points y sugerencias del Concierge.
// - Ofrecer la vista contextual "Hoy" (Today View) durante viajes activos para mostrar
//   únicamente la información relevante del momento sin saturar al explorador.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Agregador de Datos de Experiencia: Combina paradas del itinerario con el estado de reservas,
//   alertas críticas y proximidad a servicios de emergencia (Fase 17).
//
// 📦 3. QUÉ (WHAT / MÉTODOS EXPUESTOS):
// - getTripHubData(): Obtiene el estado consolidado de un viaje.
// - getTodayView(): Sintetiza la vista diaria para viajes activos.
// - markStopCompleted(): Actualiza el progreso de una parada del itinerario.
// ============================================================================

import type { TripHubRecord, TripItineraryStopRecord } from "@baqueano/types";

const SEED_TRIP: TripHubRecord = {
  tripId: "trip-occidente-magico",
  userId: "user-demo-explorador",
  title: "Aventura Volcánica & Tradición en Occidente",
  countryId: "NI",
  territories: ["Leon", "Chinandega"],
  state: "ACTIVE",
  startDate: "2026-09-07",
  endDate: "2026-09-09",
  stops: [
    {
      stopId: "stop-1",
      placeId: "cerro-negro",
      name: "Volcán Cerro Negro (Sandboarding)",
      territoryId: "Leon",
      dayNumber: 1,
      order: 1,
      scheduledTime: "08:30",
      durationMinutes: 180,
      reservationId: "res-cn-01",
      smartPointId: "sp-leon-cerro-negro",
      isCompleted: true,
      notes: "Llevar ropa deportiva y lentes de protección."
    },
    {
      stopId: "stop-2",
      placeId: "san-jacinto-hervideros",
      name: "Hervideros de San Jacinto (Geotermia)",
      territoryId: "Leon",
      dayNumber: 2,
      order: 1,
      scheduledTime: "10:00",
      durationMinutes: 90,
      reservationId: null,
      smartPointId: "sp-leon-san-jacinto",
      isCompleted: false,
      notes: "Apoyo con guías infantiles locales autorizados."
    },
    {
      stopId: "stop-3",
      placeId: "las-penitas-playa",
      name: "Playa Las Peñitas & Reserva Juan Venado",
      territoryId: "Leon",
      dayNumber: 2,
      order: 2,
      scheduledTime: "14:30",
      durationMinutes: 180,
      reservationId: "res-jv-02",
      smartPointId: "sp-leon-penitas",
      isCompleted: false,
      notes: "Tour en lancha por los manglares con cooperativa pesquera."
    }
  ],
  syncStatus: "SYNCED",
  isOfflineAvailable: true,
  sharedAccess: "VIEW_LINK",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-08T06:00:00Z"
};

export class TripHubService {
  private trips: Map<string, TripHubRecord> = new Map();

  constructor() {
    this.trips.set(SEED_TRIP.tripId, SEED_TRIP);
  }

  /**
   * Obtiene la información consolidada del viaje.
   */
  public getTripHubData(tripId: string): TripHubRecord | null {
    return this.trips.get(tripId) ?? this.trips.get("trip-occidente-magico") ?? null;
  }

  /**
   * Obtiene la vista "Hoy" con la próxima parada y alertas para el viajero.
   */
  public getTodayView(tripId: string, currentDayNumber: number = 2) {
    const trip = this.getTripHubData(tripId);
    if (!trip) return null;

    const todayStops = trip.stops.filter((s) => s.dayNumber === currentDayNumber);
    const nextPendingStop = todayStops.find((s) => !s.isCompleted) ?? null;

    return {
      tripTitle: trip.title,
      currentDayNumber,
      totalDays: 3,
      todayStops,
      nextPendingStop,
      activeAlerts: [
        {
          id: "alt-clima-calor",
          severity: "INFO",
          message: "Temperaturas de hasta 34°C en Occidente. Hidratación recomendada."
        }
      ],
      nearbyEmergency: {
        nearestHealthCenter: "Centro de Salud Mantica Berio (León)",
        distanceKm: 4.2,
        emergencyNumber: "128 (Cruz Blanca)"
      }
    };
  }

  /**
   * Marca una parada como completada.
   */
  public markStopCompleted(tripId: string, stopId: string, isCompleted: boolean): boolean {
    const trip = this.getTripHubData(tripId);
    if (!trip) return false;

    const updatedStops = trip.stops.map((s) => (s.stopId === stopId ? { ...s, isCompleted } : s));
    this.trips.set(tripId, {
      ...trip,
      stops: updatedStops,
      updatedAt: new Date().toISOString()
    });

    return true;
  }
}

export const tripHubService = new TripHubService();
