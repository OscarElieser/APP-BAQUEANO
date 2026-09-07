/**
 * WHY
 * Keeps broken routes inside Baqueano's identity instead of showing a generic error.
 *
 * HOW
 * Uses a compact accessible message and route back to exploration.
 *
 * WHAT
 * Public 404 page.
 */
import Link from "next/link";
import { BaqueanoButton } from "@baqueano/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-24">
      <section className="glass-panel max-w-xl p-8 text-center">
        <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">404 / Ruta no encontrada</p>
        <h1 className="mt-4 font-display text-4xl font-black text-white">Este sendero no esta publicado.</h1>
        <p className="mt-4 text-sm leading-6 text-white/66">Vuelve al mapa para encontrar una ruta disponible.</p>
        <Link href="/mapa" className="mt-6 inline-flex"><BaqueanoButton>Volver al mapa</BaqueanoButton></Link>
      </section>
    </main>
  );
}
