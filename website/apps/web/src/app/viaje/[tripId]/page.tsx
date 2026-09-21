// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TRIP HUB & EXPERIENCIA DEL VIAJE (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Servir como el centro integral de navegación del viaje para el explorador en Web y PWA.
// - Sincronizar itinerario, mapa de paradas, reservas y sugerencias contextuales del Concierge.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz reactiva con vista de pestañas: "Itinerario Completo", "Hoy (En Ruta)" y "Reservas".
// - Indicador de estado de sincronización (`SYNCED`) y modo offline disponible.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Resumen de Destinos y Progreso del Itinerario.
// - Vista Diaria "Hoy" con alertas meteorológicas y de salud.
// ============================================================================

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Heart,
  HelpCircle,
  MapPin,
  Navigation,
  QrCode,
  Share2,
  Sparkles,
  Wifi,
  WifiOff
} from "lucide-react";
import type { TripHubRecord } from "@baqueano/types";
import { getTodayView, getTripHubData, type TodayView } from "../../../services/experience/trip-hub.service";
import { getTerritorialTripContext, type TerritorialTripContext } from "../../../services/territorial-trip-context.service";

export default function TripHubPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const [activeTab, setActiveTab] = useState<"TODAY" | "FULL_ITINERARY" | "RESERVATIONS">("TODAY");
  const [tripData, setTripData] = useState<TripHubRecord | null>(null);
  const [todayData, setTodayData] = useState<TodayView | null>(null);
  const [loading, setLoading] = useState(true);
  const [territorialContext, setTerritorialContext] = useState<TerritorialTripContext | null>(null);

  useEffect(() => {
    let active = true;
    void getTripHubData(tripId).then(async (trip) => {
      if (!active) return;
      setTripData(trip);
      setTodayData(trip ? getTodayView(trip, 1) : null);
      if (trip?.territories[0]) setTerritorialContext(await getTerritorialTripContext(trip.territories[0]));
      setLoading(false);
    });
    return () => { active = false; };
  }, [tripId]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white/70">Cargando viaje verificado...</div>;
  }

  if (!tripData || !todayData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white">
        <p className="text-base text-white/60">No se encontró el viaje solicitado.</p>
        <Link href="/destinos" className="mt-4 inline-block text-xs font-bold text-[#F65E01] underline">
          Explorar destinos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* CABECERA DEL VIAJE — TRIP HUB HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#06151f] via-[#091b24] to-[#165D6F]/30 p-6 lg:p-8 backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#10B981]/20 px-2.5 py-0.5 font-tech text-xs font-bold uppercase tracking-wider text-[#10B981]">
                En Curso &middot; Día {todayData.currentDayNumber} de {todayData.totalDays}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 font-tech text-xs text-white/80">
                <Wifi size={12} className="text-[#10B981]" /> Sincronizado en la nube
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black text-white lg:text-3xl">
              {tripData.title}
            </h1>
            <p className="mt-1 text-xs text-white/70">
              {tripData.startDate} al {tripData.endDate} &middot; Territorios: {tripData.territories.join(", ")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/baqueano-ai"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[#165D6F] px-4 py-2 text-xs font-bold text-white hover:bg-[#165D6F]/80 transition-colors"
            >
              <Sparkles size={15} /> Concierge
            </Link>
            <Link
              href="/destinos"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              <ArrowLeft size={15} /> Explorar
            </Link>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="mt-6 flex gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab("TODAY")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              activeTab === "TODAY" ? "bg-[#165D6F] text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            Hoy (En Ruta)
          </button>
          <button
            onClick={() => setActiveTab("FULL_ITINERARY")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              activeTab === "FULL_ITINERARY" ? "bg-[#165D6F] text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            Itinerario Completo
          </button>
        </div>
      </div>

      {/* CONTENIDO PESTAÑA: HOY */}
      {activeTab === "TODAY" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* COLUMNA PRINCIPAL: PRÓXIMA PARADA & ITINERARIO DEL DÍA */}
          <div className="lg:col-span-2 space-y-6">
            {todayData.nextPendingStop && (
              <div className="rounded-2xl border border-[#F65E01]/40 bg-gradient-to-r from-[#F65E01]/20 via-[#07131f] to-transparent p-6 space-y-3">
                <span className="font-tech text-xs font-bold uppercase text-[#F65E01]">
                  Próxima Parada Recomendada
                </span>
                <h2 className="font-display text-xl font-bold text-white">
                  {todayData.nextPendingStop.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Clock size={14} /> Hora prevista: {todayData.nextPendingStop.scheduledTime}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {todayData.nextPendingStop.territoryId}</span>
                </div>
                {todayData.nextPendingStop.notes && (
                  <p className="text-xs text-white/80 bg-black/30 p-3 rounded-lg">
                    {todayData.nextPendingStop.notes}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-white">Paradas Programadas para Hoy</h3>
              <div className="space-y-3">
                {todayData.todayStops.map((stop) => (
                  <div
                    key={stop.stopId}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{stop.name}</h4>
                      <p className="text-xs text-white/50">{stop.scheduledTime} &middot; Duración estimada: {stop.durationMinutes} min</p>
                    </div>
                    {stop.isCompleted ? (
                      <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        Completada
                      </span>
                    ) : (
                      <span className="rounded bg-white/10 px-2.5 py-1 text-xs font-bold text-white/70">
                        Pendiente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA LATERAL: ALERTAS & ASISTENCIA */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-white">Alertas & Condiciones</h3>
              {todayData.activeAlerts.length === 0 && <p className="text-xs text-white/60">Sin alertas verificadas disponibles.</p>}
              {todayData.activeAlerts.map((alt) => (
                <div key={alt.id} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
                  {alt.message}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-2 text-xs">
              <h3 className="font-display text-base font-bold text-white">Emergencias Cercanas</h3>
              {territorialContext?.emergencies.length ? territorialContext.emergencies.slice(0, 3).map((place) => <div key={place.placeId} className="rounded-lg border border-white/10 p-3"><p className="font-bold text-white">{place.name}</p><p className="text-white/60">{place.phone ? `Telefono: ${place.phone}` : "Telefono sujeto a confirmacion"}</p></div>) : <p className="text-white/70">Consulta el directorio oficial verificado para este territorio. No hay un contacto cercano confirmado para este viaje.</p>}
            </div>
          </div>
        </div>
      )}

      {territorialContext && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-5">
            <h3 className="font-bold text-[#F4E6C1]">Conoce tu destino</h3>
            <p className="mt-2 text-xs text-white/60">{territorialContext.culture.length} lugares culturales publicados para {territorialContext.territory}.</p>
            <Link href="/historia" className="mt-4 inline-block text-xs font-bold text-cyan-300 underline">Historia y patrimonio</Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-5">
            <h3 className="font-bold text-[#F4E6C1]">Que comer</h3>
            <p className="mt-2 text-xs text-white/60">{territorialContext.gastronomy.length} opciones publicadas; precios y horarios requieren vigencia.</p>
            <Link href="/gastronomia" className="mt-4 inline-block text-xs font-bold text-cyan-300 underline">Explorar gastronomia</Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-5">
            <h3 className="font-bold text-[#F4E6C1]">Escucha tu destino</h3>
            <p className="mt-2 text-xs text-white/60">El audio nunca inicia automaticamente.</p>
            <Link href="/cultura" className="mt-4 inline-block text-xs font-bold text-cyan-300 underline">Cultura y musica</Link>
          </div>
        </section>
      )}

      {/* CONTENIDO PESTAÑA: ITINERARIO COMPLETO */}
      {activeTab === "FULL_ITINERARY" && (
        <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-white">Itinerario General del Viaje ({tripData.stops.length} paradas)</h3>
          <div className="space-y-3">
            {tripData.stops.map((stop) => (
              <div key={stop.stopId} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <span className="font-tech text-[10px] uppercase font-bold text-[#F65E01]">Día {stop.dayNumber}</span>
                  <h4 className="text-sm font-bold text-white">{stop.name}</h4>
                  <p className="text-xs text-white/50">{stop.territoryId} &middot; {stop.scheduledTime}</p>
                </div>
                {stop.isCompleted ? (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    Completada
                  </span>
                ) : (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white/60">
                    Pendiente
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
