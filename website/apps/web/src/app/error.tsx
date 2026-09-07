"use client";

/**
 * WHY
 * Gives runtime failures a Baqueano-styled recovery surface.
 *
 * HOW
 * Uses Next app error boundaries with retry support and accessible messaging.
 *
 * WHAT
 * Public 500-style error state.
 */
import { RotateCcw } from "lucide-react";
import { BaqueanoButton } from "@baqueano/ui";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-24">
      <section className="glass-panel max-w-xl p-8 text-center">
        <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">500 / Ruta interrumpida</p>
        <h1 className="mt-4 font-display text-4xl font-black text-white">La senal se corto un momento.</h1>
        <p className="mt-4 text-sm leading-6 text-white/66">Puedes reintentar sin perder el contexto de exploracion.</p>
        <div className="mt-6"><BaqueanoButton onClick={reset}><RotateCcw size={16} /> Reintentar</BaqueanoButton></div>
      </section>
    </main>
  );
}
