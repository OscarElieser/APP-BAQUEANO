/**
 * WHY
 * Gives culture its own route for symbols, crafts, music, literature, and living traditions.
 *
 * HOW
 * Uses focused editorial panels that can later be populated from Firestore.
 *
 * WHAT
 * Culture route.
 */
import { SectionHeader } from "@baqueano/ui";

export default function CulturaPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Cultura" title="Tradiciones vivas, no vitrinas quietas.">
        <p>Artesania, literatura, musica, fiestas patronales, pueblos originarios y simbolos culturales como rutas de exploracion.</p>
      </SectionHeader>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {["Artesania", "Musica y danza", "Literatura", "Pueblos originarios", "Simbolos", "Fiestas"].map((item) => (
          <article key={item} className="glass-panel p-5">
            <h2 className="font-display text-2xl font-black text-white">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-white/66">Modulo preparado para contenido editorial, fotografia, mapa y negocios relacionados.</p>
          </article>
        ))}
      </div>
    </main>
  );
}
