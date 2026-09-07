"use client";

/**
 * WHY
 * Makes the map a leading Baqueano interaction even before Google Maps credentials are configured.
 *
 * HOW
 * Renders a responsive geographic control surface with pins derived from destination coordinates.
 *
 * WHAT
 * Interactive map placeholder, filter chips, pins, selected info card, and route line.
 */
import { useMemo, useState } from "react";
import { MapPinned, Navigation } from "lucide-react";
import type { Destination } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";

export function InteractiveMap({ destinations }: { destinations: readonly Destination[] }) {
  const [selectedSlug, setSelectedSlug] = useState(destinations[0]?.slug ?? "");
  const selected = useMemo(() => destinations.find((item) => item.slug === selectedSlug) ?? destinations[0], [destinations, selectedSlug]);

  return (
    <section className="topographic mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="glass-panel p-6">
          <StatusChip tone="green">Mapa vivo</StatusChip>
          <h2 className="mt-4 font-display text-3xl font-black text-white">Explora Nicaragua por senales, rutas y comunidades.</h2>
          <p className="mt-4 text-sm leading-6 text-white/68">
            Esta capa queda lista para conectar Google Maps. Mientras tanto, los pines conservan coordenadas reales y contratos compatibles con Firestore.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Volcanes", "Cultura", "Comercios", "Comunidades", "Emergencias"].map((filter) => (
              <button key={filter} type="button" className="focus-ring rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-bold uppercase text-white/78 hover:bg-white/14">
                {filter}
              </button>
            ))}
          </div>
          {selected ? (
            <article className="mt-6 rounded-md border border-[#F65E01]/35 bg-[#F65E01]/12 p-5">
              <p className="font-tech text-xs uppercase text-[#F4E6C1]">{selected.department} / {selected.municipality}</p>
              <h3 className="mt-2 font-display text-2xl font-black text-white">{selected.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{selected.summary}</p>
              <p className="mt-4 font-tech text-xs text-white/70">{selected.coordinates.latitude.toFixed(4)} N / {Math.abs(selected.coordinates.longitude).toFixed(4)} W</p>
            </article>
          ) : null}
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-md border border-white/12 bg-[#0B2530] shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(244,230,193,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,230,193,0.08) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 600" role="img" aria-label="Ruta activa sobre Nicaragua">
            <path d="M190 470 C 260 380, 310 350, 390 340 S 520 250, 560 170 S 690 160, 735 95" fill="none" stroke="#F65E01" strokeWidth="4" strokeLinecap="round" strokeDasharray="12 14" />
            <path d="M245 445 C 305 430, 362 405, 436 378 C 542 337, 628 285, 705 194" fill="none" stroke="#F4E6C1" strokeWidth="1.4" opacity="0.45" />
          </svg>
          {destinations.map((destination, index) => {
            const positions = [
              ["24%", "71%"],
              ["44%", "57%"],
              ["61%", "35%"],
              ["69%", "27%"]
            ];
            const [left, top] = positions[index % positions.length];
            return (
              <button
                key={destination.slug}
                type="button"
                className="focus-ring absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#061018]/82 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur transition hover:scale-105"
                style={{ left, top }}
                onClick={() => setSelectedSlug(destination.slug)}
              >
                {selectedSlug === destination.slug ? <Navigation size={14} color="#F65E01" /> : <MapPinned size={14} />}
                {destination.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
