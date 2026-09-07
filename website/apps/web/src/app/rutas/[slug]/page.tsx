// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DETALLE DE CORREDOR TURÍSTICO (INTERACTIVE VIEW)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Provee el mapa descriptivo interactivo, paradas territoriales, tiempos de viaje
//   estimados y servicios locales asociados para un corredor turístico específico.
// - Ofrece transparencia en tiempos de traslado, condiciones de ruta y patrimonio cultural.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Resuelve el corredor mediante su `slug` desde `TOURISM_CORRIDORS_CATALOG`.
// - Despliega paradas categorizadas (Gateway, Primary Hub, Community Stop, Scenic Lookout).
// - Provee descarga abierta de la geometría en formato GeoJSON soberano y seguro.
// - Cumple con la paleta de lujo tecnológico (#165D6F, #F65E01, #F4E6C1, #0F172A).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Vista de detalle `/rutas/[slug]` con desglose de waypoints y destacados patrimoniales.
// - Exportación abierta GeoJSON para investigación y aliados.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { TOURISM_CORRIDORS_CATALOG } from "@baqueano/config";

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const corridor = TOURISM_CORRIDORS_CATALOG.find((c) => c.slug === slug);
  if (!corridor) return { title: "Corredor no encontrado | BAQUEANO" };

  return {
    title: `${corridor.name} | BAQUEANO Rutas Inteligentes`,
    description: corridor.description
  };
}

export default async function CorridorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const corridor = TOURISM_CORRIDORS_CATALOG.find((c) => c.slug === slug);

  if (!corridor) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navegación de retorno */}
        <Link
          href="/rutas"
          className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
        >
          <span>←</span> Volver a todos los Corredores
        </Link>

        {/* Encabezado Principal */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {corridor.theme}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30 font-semibold">
              ⭐ Índice de Sostenibilidad: {corridor.sustainabilityRating}/100
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100">
            {corridor.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {corridor.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Distancia Total</div>
              <div className="text-xl font-bold text-slate-100">{corridor.totalDistanceKm} km</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Duración Recomendada</div>
              <div className="text-xl font-bold text-slate-100">{corridor.suggestedDurationDays} días</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Paradas Clave</div>
              <div className="text-xl font-bold text-teal-400">{corridor.stops.length} nodos</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Emprendimientos</div>
              <div className="text-xl font-bold text-orange-400">{corridor.localPartnerCount} socios</div>
            </div>
          </div>
        </div>

        {/* Destacados Culturales y de Conservación */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 backdrop-blur-md space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>🌿</span> Experiencias Bioculturales & Patrimoniales
          </h2>
          <ul className="space-y-2.5">
            {corridor.culturalHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                <span className="text-teal-400 font-bold">✓</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Itinerario de Paradas Territoriales */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-100">
            Nodos del Corredor & Paradas Geoespaciales
          </h2>
          <div className="space-y-4">
            {corridor.stops.map((stop, idx) => (
              <div
                key={stop.placeId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-500 text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">{stop.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {stop.territory}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Rol: <strong className="text-slate-300">{stop.role}</strong> • Coordenadas: [
                      {stop.coordinates.latitude.toFixed(4)}, {stop.coordinates.longitude.toFixed(4)}]
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${stop.coordinates.latitude},${stop.coordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Ver en Mapa Externo ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open GIS Data Export */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-200">Datos Geoespaciales Abiertos (Open GIS)</div>
            <div className="text-xs text-slate-400">
              Descarga la geometría de este corredor en formato GeoJSON para investigación territorial o aplicaciones aliadas.
            </div>
          </div>
          <a
            href={`/api/open/v1/spatial/corridors?slug=${corridor.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors whitespace-nowrap"
          >
            Descargar GeoJSON 📥
          </a>
        </div>
      </div>
    </main>
  );
}
