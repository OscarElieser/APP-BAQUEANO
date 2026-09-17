/**
 * WHY
 * Makes Baqueano's impact legible through concrete commitments and metrics.
 *
 * HOW
 * Combines visual metrics, storytelling blocks, and operational sustainability themes.
 *
 * WHAT
 * Sustainability route.
 */
import { Leaf, LineChart, School, Store } from "lucide-react";
import { MetricTile, SectionHeader } from "@baqueano/ui";

export default function SostenibilidadPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Sostenibilidad" title="Impacto local medible, no promesas decorativas.">
        <p>Turismo comunitario, conservacion, comercio justo, educacion ambiental y destinos desconcentrados.</p>
      </SectionHeader>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Comercio justo objetivo" value="85%" icon={<Store size={22} />} />
        <MetricTile label="Rutas desconcentradas" value="42" icon={<LineChart size={22} />} />
        <MetricTile label="Acciones educativas" value="120" icon={<School size={22} />} />
        <MetricTile label="Zonas con reglas verdes" value="17" icon={<Leaf size={22} />} />
      </div>
    </main>
  );
}
