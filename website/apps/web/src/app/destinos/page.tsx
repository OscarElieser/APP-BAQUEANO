/**
 * WHY
 * Lets travelers search and compare destinations by useful exploration criteria.
 *
 * HOW
 * Renders typed destination records with filter controls prepared for Firebase queries.
 *
 * WHAT
 * Destination listing page with search, filters, and responsive grid.
 */
import { Search, SlidersHorizontal } from "lucide-react";
import { SectionHeader, StatusChip } from "@baqueano/ui";
import { DestinationCard } from "../../components/cards/DestinationCard";
import { featuredDestinations } from "../../data/catalog";

export default function DestinosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Destinos" title="Encuentra rutas por territorio, ritmo e impacto.">
        <p>Busqueda, categorias, precio, dificultad, sostenibilidad, popularidad y valoracion quedan listos para conectarse a Firestore.</p>
      </SectionHeader>

      <div className="mt-8 grid gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4 md:grid-cols-[1fr_auto]">
        <label className="flex min-h-12 items-center gap-3 rounded-md bg-[#061018]/72 px-4 text-white/72">
          <Search size={18} />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-white/45" placeholder="Buscar volcan, playa, comunidad o municipio" aria-label="Buscar destinos" />
        </label>
        <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/14 px-4 font-tech text-sm font-bold uppercase text-white">
          <SlidersHorizontal size={18} /> Filtros
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["Departamento", "Municipio", "Precio", "Dificultad", "Sostenibilidad", "Popularidad", "Valoracion"].map((filter) => <StatusChip key={filter}>{filter}</StatusChip>)}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featuredDestinations.map((destination) => <DestinationCard key={destination.slug} destination={destination} />)}
      </div>
    </main>
  );
}
