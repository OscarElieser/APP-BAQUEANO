/**
 * WHY
 * Turns national memory into a scroll-led cultural experience instead of a static encyclopedia page.
 *
 * HOW
 * Uses period panels, timeline rhythm, and visual markers prepared for richer media.
 *
 * WHAT
 * Historia de mi pais route.
 */
import { SectionHeader } from "@baqueano/ui";
import { historyPeriods } from "../../data/catalog";

export default function HistoriaPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Historia de mi pais" title="Una linea de tiempo viva para caminar la memoria.">
        <p>Pueblos originarios, literatura, territorios, simbolos y cultura se organizan como relato interactivo.</p>
      </SectionHeader>
      <div className="mt-12 grid gap-5">
        {historyPeriods.map((period, index) => (
          <article key={period} className="grid gap-4 rounded-md border border-white/12 bg-white/[0.06] p-5 md:grid-cols-[120px_1fr]">
            <div className="font-tech text-4xl font-black text-[#F65E01]">{String(index + 1).padStart(2, "0")}</div>
            <div>
              <h2 className="font-display text-2xl font-black text-white">{period}</h2>
              <p className="mt-3 text-sm leading-6 text-white/66">Bloque editorial preparado para fotografias, ilustraciones, territorios, personajes, literatura y patrimonio.</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
