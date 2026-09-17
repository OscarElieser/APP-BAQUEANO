/**
 * WHY
 * Presents Nicaraguan gastronomy as living cultural memory tied to places and local businesses.
 *
 * HOW
 * Uses local food imagery, regional metadata, and reserved image frames.
 *
 * WHAT
 * Gastronomy route with dishes, origin, ingredients, and map-ready region data.
 */
import Image from "next/image";
import { SectionHeader } from "@baqueano/ui";
import { dishes } from "../../data/catalog";

export default function GastronomiaPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Gastronomia" title="El fogon tambien es un mapa.">
        <p>Platos, origen, ingredientes, tradicion y negocios donde probarlos forman parte del viaje.</p>
      </SectionHeader>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {dishes.map((dish) => (
          <article key={dish.name} className="overflow-hidden rounded-md border border-white/12 bg-white/[0.06]">
            <div className="relative aspect-[16/10]">
              <Image src={dish.image} alt={dish.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-5">
              <p className="font-tech text-xs uppercase text-[#F65E01]">{dish.region}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white">{dish.name}</h2>
              <p className="mt-3 text-sm leading-6 text-white/66">{dish.ingredients}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
