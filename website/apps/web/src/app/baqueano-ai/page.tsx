/**
 * WHY
 * Gives Baqueano AI a native exploration interface without claiming a live AI Gateway.
 *
 * HOW
 * Uses trip constraints as structured signals and displays an integration status boundary.
 *
 * WHAT
 * AI route scaffold ready for a secure server-side gateway.
 */
import { Bot, DollarSign, Mountain, Users } from "lucide-react";
import { BaqueanoButton, SectionHeader, StatusChip } from "@baqueano/ui";
import { getAiGatewayStatus } from "../../services/ai.service";

const prompts = [
  { icon: Users, label: "Viajo con dos personas" },
  { icon: DollarSign, label: "Tengo $200" },
  { icon: Mountain, label: "Me gusta la montana" },
  { icon: Bot, label: "Quiero evitar lugares saturados" }
] as const;

export default function BaqueanoAiPage() {
  const gateway = getAiGatewayStatus();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeader kicker="Baqueano AI" title="Planifica por intencion, presupuesto y territorio.">
            <p>El copiloto convertira restricciones de viaje en itinerarios visuales con mapas, costos, distancias y advertencias de conservacion cuando el Gateway seguro este disponible.</p>
          </SectionHeader>
        </div>
        <div className="glass-panel p-5">
          <div className="mb-5 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-3 text-sm text-white/76">
            <strong className="font-tech uppercase text-[#F4E6C1]">Estado AI Gateway:</strong> {gateway.message}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {prompts.map((item) => (
              <button key={item.label} className="focus-ring flex min-h-24 items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-bold text-white">
                <item.icon size={20} className="text-[#F65E01]" /> {item.label}
              </button>
            ))}
          </div>
          <article className="mt-5 rounded-md border border-[#10B981]/30 bg-[#10B981]/12 p-5">
            <StatusChip tone="green">Vista de resultado semilla</StatusChip>
            <h2 className="mt-4 font-display text-2xl font-black text-white">Ejemplo visual: Matagalpa, Selva Negra y finca cafetalera.</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">Este bloque es demostrativo. No fue generado por un modelo ni por un gateway real.</p>
            <div className="mt-5"><BaqueanoButton disabled>Gateway pendiente</BaqueanoButton></div>
          </article>
        </div>
      </div>
    </main>
  );
}
