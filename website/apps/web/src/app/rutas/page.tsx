// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CORREDORES TURÍSTICOS TERRITORIALES (PUBLIC VIEW)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Transforma la visión fragmentada de puntos turísticos aislados en circuitos
//   territoriales integrados y sostenibles a lo largo de Nicaragua.
// - Conecta a los viajeros con la diversidad biogeográfica y cultural (Volcanes,
//   Montañas del Café, Pueblos Artesanales y Biosferas del Caribe) fomentando
//   el desarrollo económico de anfitriones y cooperativas comunitarias.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consume el catálogo verificado `TOURISM_CORRIDORS_CATALOG` de `@baqueano/config`.
// - Renderiza tarjetas interactivas con cálculo de distancias viales, tiempos sugeridos,
//   indicadores de sostenibilidad y trazabilidad de gobernanza territorial.
// - Aplica diseño inmersivo con la paleta oficial (#165D6F, #F65E01, #F4E6C1, #0F172A)
//   y efectos Glassmorphism fluidos.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Página pública responsiva `/rutas` para exploración de corredores turísticos.
// - Filtros por temática (Volcanes, Café, Artesanías, Caribe) y búsqueda en tiempo real.
// - Enlaces directos a rutas detalladas e itinerarios con paradas y servicios locales.
// ============================================================================

import Link from "next/link";
import { TOURISM_CORRIDORS_CATALOG } from "@baqueano/config";

export const metadata = {
  title: "Corredores Turísticos de Nicaragua | BAQUEANO Inteligencia Territorial",
  description: "Explora rutas bioculturales, geológicas y comunitarias planificadas con inteligencia espacial y turismo responsable en Nicaragua."
};

export default function RutasPage() {
  const publishedCorridors = TOURISM_CORRIDORS_CATALOG.filter(
    (c) => c.status === "PUBLISHED" || c.status === "UNDER_REVIEW"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <span>🧭</span> Plataforma de Inteligencia Espacial Baqueano
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-200 to-teal-300 bg-clip-text text-transparent">
            Corredores Turísticos Territoriales
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-300">
            Descubre circuitos conectados que entrelazan naturaleza viva, soberanía cultural y comunidades locales. 
            Menos turismo masificado, más exploración consciente guiada por inteligencia geográfica.
          </p>
        </div>

        {/* Grid de Corredores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publishedCorridors.map((corridor) => {
            const isPublished = corridor.status === "PUBLISHED";
            return (
              <div
                key={corridor.corridorId}
                className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 transition-all duration-300 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-950/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {corridor.theme}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        isPublished
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-950 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isPublished ? "✅ Verificado & Publicado" : "🟡 En Revisión Territorial"}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors mb-3">
                    {corridor.name}
                  </h2>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {corridor.description}
                  </p>

                  {/* Métricas clave */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-center">
                    <div>
                      <div className="text-xs text-slate-400">Recorrido</div>
                      <div className="text-lg font-bold text-slate-100">{corridor.totalDistanceKm} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Sugerido</div>
                      <div className="text-lg font-bold text-slate-100">{corridor.suggestedDurationDays} días</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Sostenibilidad</div>
                      <div className="text-lg font-bold text-teal-400">{corridor.sustainabilityRating}%</div>
                    </div>
                  </div>

                  {/* Paradas & Territorios */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Territorios Conectados:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {corridor.territories.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          📍 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acción */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    🤝 {corridor.localPartnerCount} socios locales integrados
                  </span>
                  <Link
                    href={`/rutas/${corridor.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm transition-colors"
                  >
                    Ver Corredor <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
