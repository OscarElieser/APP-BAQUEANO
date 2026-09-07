"use client";

// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — TERRITORIAL AI PLANNER PAGE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Ofrecer al explorador una experiencia interactiva y visual de planificación
// territorial, transformando sus restricciones de tiempo, presupuesto y estilo
// en itinerarios estructurados día a día con paradas verificadas y evaluación de riesgo.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz cliente reactiva que envía el perfil estructurado a `/api/baqueano-ai`.
// - Renderizado modular de días, costos (USD/NIO), advertencias de conservación y riesgo.
// - Cero llamadas directas a proveedores externos con secretos desde el navegador.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Componente de página exportado: `BaqueanoAiPage()`.
// ============================================================================

import { useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Compass, DollarSign, Leaf, MapPin, Sparkles, Users } from "lucide-react";
import type { ItineraryResponse, TripProfile } from "@baqueano/types";
import { BaqueanoButton, SectionHeader, StatusChip } from "@baqueano/ui";
import { generateItineraryPlan, getAiGatewayStatus } from "../../services/ai.service";

export default function BaqueanoAiPage() {
  const gateway = getAiGatewayStatus();
  const [days, setDays] = useState(3);
  const [groupSize, setGroupSize] = useState(2);
  const [budgetUsd, setBudgetUsd] = useState(200);
  const [travelStyle, setTravelStyle] = useState<"ecologico" | "aventura" | "cultural" | "relajado">("ecologico");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const profile: TripProfile = {
      days,
      groupSize,
      budgetUsd,
      currency: "USD",
      travelStyle,
      department: department || undefined,
      interests: ["naturaleza", "cultura"]
    };

    const res = await generateItineraryPlan(profile);
    setLoading(false);

    if (res.success && res.itinerary) {
      setItinerary(res.itinerary);
    } else {
      setError(res.error || "Ocurrió un error al generar el itinerario.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Copiloto Territorial" title="Planifica por intención, presupuesto y territorio.">
        <p>
          Baqueano AI transforma tus restricciones de viaje en itinerarios factualmente verificados con distancias reales,
          presupuesto detallado, recomendaciones de guías locales y advertencias de conservación comunitaria.
        </p>
      </SectionHeader>

      <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Panel de Configuración de Viaje */}
        <div className="glass-panel h-fit p-6">
          <div className="flex items-center gap-2 rounded-md border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-bold text-[#10B981]">
            <Sparkles size={14} /> {gateway.message}
          </div>

          <h3 className="mt-5 font-display text-lg font-bold text-white">Parámetros de tu Expedición</h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-tech uppercase text-white/70">
                <Users size={14} className="mr-1 inline text-[#F65E01]" /> Duración: {days} {days === 1 ? "Día" : "Días"}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-2 w-full accent-[#F65E01]"
              />
            </div>

            <div>
              <label className="block text-xs font-tech uppercase text-white/70">
                <Users size={14} className="mr-1 inline text-[#F65E01]" /> Exploradores: {groupSize} Personas
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="mt-2 w-full accent-[#F65E01]"
              />
            </div>

            <div>
              <label className="block text-xs font-tech uppercase text-white/70">
                <DollarSign size={14} className="mr-1 inline text-[#F65E01]" /> Presupuesto Estimado: ${budgetUsd} USD (C$ {(budgetUsd * 36.8).toLocaleString("es-NI")} NIO)
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(Number(e.target.value))}
                className="mt-2 w-full accent-[#F65E01]"
              />
            </div>

            <div>
              <label className="block text-xs font-tech uppercase text-white/70">Estilo de Experiencia</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as "ecologico" | "aventura" | "cultural" | "relajado")}
                className="focus-ring mt-1 w-full rounded-md border border-white/14 bg-[#061018] px-3 py-2 text-sm text-white"
              >
                <option value="ecologico">🌿 Ecológico y Comunitario</option>
                <option value="aventura">🌋 Aventura y Senderismo Activo</option>
                <option value="cultural">🏛️ Cultural e Histórico</option>
                <option value="relajado">🏖️ Descanso y Paisajismo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-tech uppercase text-white/70">Departamento de Interés (Opcional)</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej. Matagalpa, León, Madriz..."
                className="focus-ring mt-1 w-full rounded-md border border-white/14 bg-[#061018] px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="mt-6">
            <BaqueanoButton onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? "Trazando Ruta Territorial..." : "Generar Itinerario Baqueano"}
            </BaqueanoButton>
          </div>

          {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
        </div>

        {/* Panel de Resultados del Itinerario */}
        <div>
          {itinerary ? (
            <div className="space-y-6">
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusChip tone="green">Plan Territorial Verificado</StatusChip>
                  <span className="font-tech text-xs uppercase text-[#F4E6C1]">
                    {itinerary.totalDays} Días • ${itinerary.totalEstimatedBudgetUsd} USD • C$ {itinerary.totalEstimatedBudgetNio.toLocaleString("es-NI")} NIO
                  </span>
                </div>

                <h2 className="mt-3 font-display text-2xl font-black text-white">{itinerary.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">{itinerary.summary}</p>

                {/* Indicador de Riesgo */}
                <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <strong className="uppercase font-tech tracking-wider">Evaluación de Riesgo ({itinerary.risk.level}):</strong> {itinerary.risk.explanation}
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-white/70">
                      {itinerary.risk.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Días del Itinerario */}
              <div className="space-y-4">
                {itinerary.days.map((day) => (
                  <div key={day.dayNumber} className="glass-panel p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-white">{day.theme}</h3>
                      <span className="font-tech text-xs uppercase text-[#F65E01]">Presupuesto Día: ${day.dayBudgetUsd} USD</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {day.stops.map((stop) => (
                        <div key={stop.placeId} className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
                          <MapPin size={18} className="mt-1 shrink-0 text-[#F65E01]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{stop.placeName}</h4>
                              <span className="font-tech text-xs uppercase text-white/50">({stop.department})</span>
                            </div>
                            <p className="mt-1 text-xs text-white/70 leading-5">{stop.description}</p>
                            <p className="mt-2 font-tech text-xs text-[#F4E6C1]">
                              Coordenadas: {stop.coordinates.latitude.toFixed(4)} N / {Math.abs(stop.coordinates.longitude).toFixed(4)} W
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Consejos de Sostenibilidad */}
              <div className="glass-panel p-6 border-l-4 border-l-[#10B981]">
                <h4 className="flex items-center gap-2 font-display text-base font-bold text-white">
                  <Leaf size={18} className="text-[#10B981]" /> Reglas de Sostenibilidad y Conservación
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-white/75">
                  {itinerary.sustainabilityTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#10B981]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-panel flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <Compass size={48} className="text-[#F65E01] opacity-70" />
              <h3 className="mt-4 font-display text-xl font-bold text-white">Listo para Trazar tu Ruta Territorial</h3>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Ajusta los parámetros en el panel izquierdo y haz clic en &quot;Generar Itinerario Baqueano&quot; para obtener un plan estructurado, verificado y ajustado a tu presupuesto.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
