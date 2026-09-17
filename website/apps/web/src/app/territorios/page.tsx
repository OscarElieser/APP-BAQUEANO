/**
 * WHY
 * Shows the 17 territories as a cultural navigation system.
 *
 * HOW
 * Renders all departments plus autonomous regions from typed seed records.
 *
 * WHAT
 * Territories explorer route.
 */
import { SectionHeader, StatusChip } from "@baqueano/ui";
import { territories } from "../../data/catalog";

export default function TerritoriosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="17 territorios" title="Departamentos y regiones como puertas de exploracion.">
        <p>Los 15 departamentos, RACCN y RACCS se presentan por paisaje, capital y senal cultural.</p>
      </SectionHeader>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {territories.map((territory) => (
          <article key={territory.slug} className="glass-panel p-5">
            <StatusChip tone={territory.type === "region_autonoma" ? "green" : "teal"}>{territory.type === "region_autonoma" ? "Region autonoma" : "Departamento"}</StatusChip>
            <h2 className="mt-5 font-display text-3xl font-black text-white">{territory.name}</h2>
            <p className="mt-2 font-tech text-sm uppercase text-[#F4E6C1]">{territory.capital}</p>
            <p className="mt-4 text-sm leading-6 text-white/66">{territory.culturalSignal} / {territory.landscape}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
