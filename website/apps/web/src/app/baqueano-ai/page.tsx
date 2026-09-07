/**
 * WHY
 * Gives Baqueano AI a native exploration interface instead of a generic chat box.
 *
 * HOW
 * Uses trip constraints as structured signals and displays visual itinerary output.
 *
 * WHAT
 * AI route scaffold ready for an API gateway.
 */
import { Bot, DollarSign, Mountain, Users } from "lucide-react";
import { BaqueanoButton, SectionHeader, StatusChip } from "@baqueano/ui";

const prompts = [
  { icon: Users, label: "Viajo con dos personas" },
  { icon: DollarSign, label: "Tengo $200" },
  { icon: Mountain, label: "Me gusta la montana" },
  { icon: Bot, label: "Quiero evitar lugares saturados" }
] as const;

export default function BaqueanoAiPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeader kicker="Baqueano AI" title="Planifica por intencion, presupuesto y territorio.">
            <p>El copiloto convierte restricciones de viaje en itinerarios visuales con mapas, costos, distancias y advertencias de conservacion.</p>
          </SectionHeader>
        </div>
        <div className="glass-panel p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {prompts.map((item) => (
              <button key={item.label} className="focus-ring flex min-h-24 items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-bold text-white">
                <item.icon size={20} className="text-[#F65E01]" /> {item.label}
              </button>
            ))}
          </div>
          <article className="mt-5 rounded-md border border-[#10B981]/30 bg-[#10B981]/12 p-5">
            <StatusChip tone="green">Resultado visual</StatusChip>
            <h2 className="mt-4 font-display text-2xl font-black text-white">3 dias: Matagalpa, Selva Negra y finca cafetalera.</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">Presupuesto estimado: $186. Prioriza montana, baja saturacion, movilidad corta y anfitrion local verificado.</p>
            <div className="mt-5"><BaqueanoButton>Generar itinerario</BaqueanoButton></div>
          </article>
        </div>
      </div>
    </main>
  );
}
