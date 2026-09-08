// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CONTEXTUAL HELP & SUPPORT (/ayuda)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Brinda soporte contextual y resolución de incidencias en viaje, reservas y
//   seguridad territorial con total transparencia sin simular falsos agentes humanos.
// - Conecta al explorador con asistencia digital (Baqueano AI / Concierge) y
//   escalamiento humano verificado cuando la situación lo requiere.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Enrutamiento de tickets/consultas contextuales según recurso (viaje, reserva, territorio).
// - Guías offline, números de emergencia territoriales de Nicaragua (Policía Turística, Cruz Blanca, Bomberos)
//   y FAQ dinámicas respetuosas de la privacidad.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Página Next.js con centro de ayuda, asistente contextual y canal de emergencia offline.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";

interface HelpTopic {
  id: string;
  category: string;
  question: string;
  answer: string;
  actionUrl?: string;
  actionLabel?: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: "help-1",
    category: "Reservas",
    question: "¿Cómo modifico o cancelo una reserva de experiencia?",
    answer: "Puedes gestionar tus reservas desde el módulo de reservas. Las políticas de cancelación son fijadas directamente por el anfitrión comunitario local.",
    actionUrl: "/reservas",
    actionLabel: "Ir a Mis Reservas"
  },
  {
    id: "help-2",
    category: "Viajes & Offline",
    question: "¿Puedo acceder a mi itinerario sin conexión a internet?",
    answer: "Sí. Si guardas tu viaje en la PWA de Baqueano, las paradas, coordenadas GPS, números de contacto y notas del viaje estarán disponibles sin internet.",
    actionUrl: "/pasaporte",
    actionLabel: "Ver Pasaporte"
  },
  {
    id: "help-3",
    category: "Seguridad Territorial",
    question: "¿Qué hacer en caso de emergencia en ruta o zona rural?",
    answer: "Comunícate de inmediato con las líneas de auxilio territoriales. En Nicaragua: Policía Nacional / Turística (118), Cruz Blanca (128), Bomberos Unificados (115).",
    actionUrl: "/territorios",
    actionLabel: "Ver Territorios"
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredTopics = helpTopics.filter(topic => {
    const matchesCat = selectedCategory === "ALL" || topic.category === selectedCategory;
    const matchesSearch = topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F4E6C1] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center pb-10 border-b border-white/10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#F65E01] font-bold bg-[#F65E01]/10 px-3 py-1 rounded-full mb-3">
            <span>Soporte & Asistencia</span>
            <span>•</span>
            <span>Experience OS</span>
          </div>
          <h1 className="text-4xl font-black text-white">¿Cómo podemos ayudarte hoy?</h1>
          <p className="text-base text-slate-400 mt-2 max-w-xl mx-auto">
            Encuentra respuestas rápidas para tu viaje, reservas y seguridad en el territorio nicaragüense.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar tema, reserva, ruta o emergencia..."
              className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#165D6F] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="my-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">Líneas de Emergencia Territorial (Nicaragua)</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Asistencia Inmediata en Ruta</h3>
            <p className="text-xs text-slate-300 mt-1">
              Policía Turística: <strong>118</strong> • Cruz Blanca: <strong>128</strong> • Bomberos: <strong>115</strong>
            </p>
          </div>
          <a
            href="tel:118"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-lg"
          >
            Llamar al 118
          </a>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 pb-4 overflow-x-auto">
          {["ALL", "Reservas", "Viajes & Offline", "Seguridad Territorial"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#165D6F] text-white shadow"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat === "ALL" ? "Todos los temas" : cat}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="space-y-4 mt-4">
          {filteredTopics.map(topic => (
            <div key={topic.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#F65E01] font-semibold">{topic.category}</span>
              </div>
              <h3 className="text-base font-bold text-white">{topic.question}</h3>
              <p className="text-sm text-slate-300">{topic.answer}</p>
              {topic.actionUrl && (
                <div className="pt-2">
                  <Link
                    href={topic.actionUrl}
                    className="inline-block text-xs font-bold text-[#F4E6C1] hover:text-white bg-[#165D6F] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {topic.actionLabel} →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Concierge Bridge */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[#165D6F]/30 to-[#0F172A] border border-[#165D6F]/40 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-white">¿Prefieres asistencia interactiva?</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Consulta a Baqueano Digital sobre recomendaciones personalizadas, clima, guías locales y más.
          </p>
          <div className="mt-6">
            <Link
              href="/baqueano-ai"
              className="bg-[#F65E01] hover:bg-[#F65E01]/90 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-block transition-all transform hover:scale-[1.02]"
            >
              Hablar con Baqueano Digital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
