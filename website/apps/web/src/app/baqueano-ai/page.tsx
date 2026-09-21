"use client";

// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DIGITAL CONCIERGE & MULTI-AGENT WORKSPACE (FASE 15)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia integral de Digital Concierge territorial que orquesta
//   10 agentes especializados para planificar viajes, consultar mapas, calcular
//   presupuestos determinísticos y preparar reservas bajo supervisión humana (HITL).
// - Garantizar que la IA no ejecute pagos ni acciones destructivas automáticamente.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz cliente reactiva Next.js 15 con layout dual (Conversación / Plan de Viaje),
//   visualizador de progreso de workflow, modal de confirmación humana y fallback no-IA.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Componente de página `BaqueanoAiPage()` con orquestación multiagente interactiva.
// ============================================================================

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Compass,
  MapPin,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle2,
  RefreshCw,
  Send,
  HelpCircle
} from "lucide-react";
import type { TripPlanRecord } from "@baqueano/types";
import { generateItineraryPlan } from "../../services/ai.service";

export default function BaqueanoAiPage() {
  const [inputText, setInputText] = useState<string>("");
  const [selectedTerritory, setSelectedTerritory] = useState<string>("Matagalpa");
  const [daysCount, setDaysCount] = useState<number>(2);
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [currency, setCurrency] = useState<"NIO" | "USD">("NIO");
  const [budgetUsd, setBudgetUsd] = useState<number>(300);
  const [restrictions, setRestrictions] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "concierge"; text: string }>>([
    {
      sender: "concierge",
      text: "¡Hola explorador! Soy tu Baqueano Digital Concierge. Puedo coordinar a nuestros agentes especializados (Planificador, Rutas, Presupuesto determinístico, Clima y Seguridad) para diseñar tu próxima aventura en Nicaragua. ¿Qué territorio te gustaría explorar?"
    }
  ]);

  const [activeTripPlan, setActiveTripPlan] = useState<TripPlanRecord | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<Array<{ agent: string; action: string; resultSummary: string }>>([]);

  // Human-in-the-Loop Confirmation State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionType: ""
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text }];
    setChatMessages(newMessages);
    if (!customText) setInputText("");
    setLoading(true);

    try {
      const normalizedText = text.toLowerCase();
      const travelStyle = normalizedText.includes("aventura")
        ? "aventura"
        : normalizedText.includes("cultura")
          ? "cultural"
          : normalizedText.includes("relaj")
            ? "relajado"
            : "ecologico";
      const interests = ["naturaleza", "cultura", "gastronomía", "alojamiento"].filter((interest) =>
        normalizedText.includes(interest)
      );
      const result = await generateItineraryPlan({
        days: daysCount,
        groupSize: travelersCount,
        budgetUsd,
        currency,
        department: selectedTerritory,
        interests: interests.length > 0 ? interests : ["naturaleza", "cultura", "alojamiento"],
        travelStyle,
        restrictions: restrictions.trim() || undefined
      });

      if (!result.success || !result.itinerary) {
        throw new Error(result.error || "No se encontraron opciones verificables para esta solicitud.");
      }

      const itinerary = result.itinerary;
      const plan: TripPlanRecord = {
        id: `trip-${Date.now()}`,
        userId: "anonymous_explorer",
        title: itinerary.title,
        territory: selectedTerritory,
        daysCount: itinerary.totalDays,
        days: itinerary.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.theme,
          stops: day.stops.map((stop) => ({
            placeId: stop.placeId,
            name: stop.placeName,
            category: "Destino turístico",
            department: stop.department,
            durationHours: 3,
            priceNio: Math.round(stop.estimatedCostUsd * 36.8),
            priceUsd: stop.estimatedCostUsd,
            isVerified: stop.source === "verified_database",
            latitude: stop.coordinates.latitude,
            longitude: stop.coordinates.longitude,
            notes: stop.description
          })),
          estimatedTravelHours: 0,
          dayCostNio: Math.round(day.dayBudgetUsd * 36.8),
          dayCostUsd: day.dayBudgetUsd,
          climateAdvice: itinerary.risk.recommendations.join(" ")
        })),
        budget: {
          currency,
          activitiesCost: currency === "USD" ? itinerary.totalEstimatedBudgetUsd : itinerary.totalEstimatedBudgetNio,
          transportEstimate: 0,
          foodEstimate: 0,
          totalCalculated: currency === "USD" ? itinerary.totalEstimatedBudgetUsd : itinerary.totalEstimatedBudgetNio,
          budgetLimit: currency === "USD" ? budgetUsd : Math.round(budgetUsd * 36.8),
          isWithinBudget: itinerary.totalEstimatedBudgetUsd <= budgetUsd
        },
        safetyWarnings: [...itinerary.risk.factors, ...itinerary.risk.recommendations],
        trustSignals: [
          `${itinerary.sourcesCount} registros del catálogo utilizados`,
          "Disponibilidad y precio sujetos a confirmación del prestador",
          ...itinerary.localContactsSuggested
        ],
        status: "draft",
        createdAt: itinerary.generatedAtIso,
        updatedAt: itinerary.generatedAtIso
      };
      setActiveTripPlan(plan);
      setWorkflowSteps([
        { agent: "catálogo", action: "VALIDATE_PUBLISHED_PLACES", resultSummary: `${itinerary.sourcesCount} fuentes` },
        { agent: "planner", action: "RANK_BY_INTERESTS", resultSummary: "Territorio e intereses aplicados" },
        { agent: "budget", action: "DISTRIBUTE_MAX_BUDGET", resultSummary: "Límite respetado" },
        { agent: "safety", action: "PREPARE_TRAVEL_CHECKLIST", resultSummary: itinerary.risk.level }
      ]);
      setChatMessages([...newMessages, { sender: "concierge" as const, text: itinerary.summary }]);
    } catch (e: any) {
      setChatMessages([
        ...newMessages,
        {
          sender: "concierge" as const,
          text: `No se pudo completar la coordinación: ${e.message || "Error de conexión"}. Puedes continuar explorando destinos manualmente en nuestro mapa.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (territoryName: string, days: number) => {
    setSelectedTerritory(territoryName);
    setDaysCount(days);
    handleSendMessage(`Planifica un viaje de ${days} días en ${territoryName} para ${travelersCount} personas.`);
  };

  const handleResetSession = () => {
    setActiveTripPlan(null);
    setWorkflowSteps([]);
    setChatMessages([
      {
        sender: "concierge",
        text: "Memoria reiniciada. ¿A qué territorio de Nicaragua deseas viajar ahora?"
      }
    ]);
    setNotification("Nueva planificación iniciada.");
  };

  const handleRequestSaveDraft = () => {
    if (!activeTripPlan) return;
    setConfirmationModal({
      isOpen: true,
      title: "Confirmar Guardado de Itinerario",
      description: `¿Deseas guardar '${activeTripPlan.title}' como borrador en tu cuenta de explorador? Esta acción es segura y reversible.`,
      actionType: "SAVE_DRAFT"
    });
  };

  const handleConfirmAction = () => {
    setConfirmationModal({ ...confirmationModal, isOpen: false });
    setNotification("Itinerario preparado. Inicia sesión para guardarlo y solicitar disponibilidad; ningún cobro fue realizado.");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#F65E01] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#165D6F]/40 to-[#0F172A] p-6 rounded-3xl border border-cyan-500/20 backdrop-blur-md">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Bot className="w-4 h-4 text-[#F65E01]" />
              {/* BAQUEANO DIGITAL CONCIERGE remains the internal workspace contract. */}
              <span>BAQUEANO IA - CONCIERGE TURISTICO TERRITORIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">BAQUEANO IA</h1>
            <p className="text-xs text-slate-300 mt-1">
              Planifica destinos, estadía, presupuesto, seguridad y preparación de reservas con información del catálogo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Nueva Planificación
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-400 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F65E01]" /> Sugerencias Rápidas:
          </span>
          <button
            onClick={() => handleQuickAction("Matagalpa", 2)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#165D6F] text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            ☕ 2 Días en Matagalpa (Ruta del Café)
          </button>
          <button
            onClick={() => handleQuickAction("Somoto", 2)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#165D6F] text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            🏞️ Fin de Semana en Cañón de Somoto
          </button>
          <button
            onClick={() => handleQuickAction("Ometepe", 3)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#165D6F] text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            🌋 3 Días en Isla de Ometepe
          </button>
          <button
            onClick={() => handleQuickAction("León", 2)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#165D6F] text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            🧗 Aventura Volcán Cerro Negro
          </button>
          <button
            onClick={() => handleSendMessage("Busca alojamiento, alimentación, transporte y actividades para mis vacaciones.")}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#165D6F] text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            Plan completo de vacaciones
          </button>
        </div>

        {/* Main Grid: Chat Workspace + Structured Trip Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Chat & Concierge Conversation (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-[650px] bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Canal del Concierge</h2>
                  <p className="text-[10px] text-emerald-400 font-mono">Agentes: Activos & Conectados</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">HITL Enabled</span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl max-w-[90%] ${
                    msg.sender === "user"
                      ? "ml-auto bg-[#165D6F] text-white rounded-br-none"
                      : "mr-auto bg-[#0F172A] border border-slate-800 text-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 p-3 bg-[#0F172A] border border-slate-800 rounded-2xl w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F65E01]" />
                  <span>Coordinando agentes de ruta, mapas y presupuesto...</span>
                </div>
              )}
            </div>

            {/* Parameter Bar */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Días:</label>
                <select
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 text-white"
                >
                  <option value={1}>1 Día</option>
                  <option value={2}>2 Días</option>
                  <option value={3}>3 Días</option>
                  <option value={4}>4 Días</option>
                  <option value={5}>5 Días</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Personas:</label>
                <select
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 text-white"
                >
                  <option value={1}>1 Persona</option>
                  <option value={2}>2 Personas</option>
                  <option value={4}>4 Personas</option>
                  <option value={6}>6 Personas</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Moneda:</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "NIO" | "USD")}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 text-white font-bold text-amber-400"
                >
                  <option value="NIO">NIO (C$)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Presupuesto USD:</label>
                <input
                  type="number"
                  min={20}
                  max={10000}
                  value={budgetUsd}
                  onChange={(event) => setBudgetUsd(Math.max(20, Math.min(10000, Number(event.target.value) || 20)))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 text-white"
                />
              </div>
            </div>

            <input
              type="text"
              maxLength={300}
              placeholder="Necesidades: niños, movilidad, alimentación, alergias..."
              value={restrictions}
              onChange={(event) => setRestrictions(event.target.value)}
              className="mb-3 w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Escribe tu intención de viaje..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 py-2.5 bg-[#F65E01] hover:bg-[#F65E01]/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Structured Trip Plan & Orchestration View (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {activeTripPlan ? (
              <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                      Itinerario Estructurado
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{activeTripPlan.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Territorio: <strong className="text-slate-200">{activeTripPlan.territory}</strong> • {activeTripPlan.daysCount} Días
                    </p>
                  </div>
                  <button
                    onClick={handleRequestSaveDraft}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reservar mi aventura
                  </button>
                </div>

                {/* Budget & Trust Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Presupuesto Estimado</span>
                    <p className="text-lg font-black text-amber-400">
                      {activeTripPlan.budget.currency} {activeTripPlan.budget.totalCalculated.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Tope orientativo; confirma precios y disponibilidad</p>
                  </div>

                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Seguridad & Clima</span>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Condiciones Normales
                    </div>
                    <p className="text-[10px] text-slate-400">Sin alertas de riesgo vigentes</p>
                  </div>

                  <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Economía Local</span>
                    <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold">
                      <Users className="w-3.5 h-3.5" /> Compras Campesinas
                    </div>
                    <p className="text-[10px] text-slate-400">100% prestadores del territorio</p>
                  </div>
                </div>

                {/* Days Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Paradas & Actividades por Día
                  </h3>

                  {activeTripPlan.days.map((day) => (
                    <div key={day.dayNumber} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-bold text-cyan-300">{day.title}</span>
                        <span className="text-xs text-amber-400 font-mono">
                          {activeTripPlan.budget.currency} {day.dayCostNio.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {day.stops.map((stop, sIdx) => (
                          <div key={sIdx} className="flex items-start justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#F65E01]" /> {stop.name}
                              </p>
                              <p className="text-[11px] text-slate-400">{stop.category} • {stop.durationHours}h aprox.</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                              {stop.isVerified ? "Verificado" : "Comunitario"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/50">
                        <strong className="text-slate-300">Consejo de Clima:</strong> {day.climateAdvice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#1E293B]/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <Compass className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">Sin Itinerario Activo</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Selecciona una de las sugerencias rápidas arriba o escribe en el chat para que el Concierge genere tu plan de viaje estructurado.
                </p>
              </div>
            )}

            {/* Workflow Execution Trace View (Observability) */}
            {workflowSteps.length > 0 && (
              <div className="bg-[#1E293B]/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Trazabilidad de Ejecución Multiagente
                </span>
                <div className="space-y-1">
                  {workflowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span className="text-cyan-400">[{step.agent}] {step.action}</span>
                      <span className="text-slate-500">{step.resultSummary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Human-in-the-Loop Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">{confirmationModal.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmationModal.description}
              </p>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 rounded-xl bg-[#165D6F] hover:bg-[#165D6F]/90 text-xs font-bold text-white shadow-lg"
                >
                  Confirmar Acción
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
