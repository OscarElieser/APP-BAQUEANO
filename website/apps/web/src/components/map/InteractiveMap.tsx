"use client";

/**
 * WHY
 * Makes the map a leading Baqueano interaction before Google Maps credentials exist.
 *
 * HOW
 * Renders a responsive conceptual map with pins from Android-compatible `places` records.
 *
 * WHAT
 * Interactive map surface, category filters, selected info card, and route line.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, MapPinned, Navigation } from "lucide-react";
import type { PlaceRecord } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";
import { slugifyPlace } from "../../utils/place";

export function InteractiveMap({ places }: { places: readonly PlaceRecord[] }) {
  const [selectedId, setSelectedId] = useState(places[0]?.placeId ?? "");
  const [activeFilter, setActiveFilter] = useState("todos");
  const filteredPlaces = useMemo(() => {
    if (activeFilter === "todos") return places;
    return places.filter((place) => `${place.categoryName} ${place.subcategory}`.toLowerCase().includes(activeFilter));
  }, [activeFilter, places]);
  const selected = useMemo(() => places.find((item) => item.placeId === selectedId) ?? filteredPlaces[0] ?? places[0], [filteredPlaces, places, selectedId]);

  return (
    <section className="topographic mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="glass-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusChip tone="green">Mapa conceptual</StatusChip>
            <span className="font-tech text-xs uppercase text-white/45">Google Maps pendiente</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-black text-white">Explora Nicaragua por senales, rutas y comunidades.</h2>
          <p className="mt-4 text-sm leading-6 text-white/68">
            Esta capa no es Google Maps todavia. Los pines usan coordenadas de registros `places` y quedan listos para un adaptador con clave publica restringida.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["todos", "Todos"],
              ["volcan", "Volcanes"],
              ["rio", "Rios"],
              ["laguna", "Lagunas"],
              ["comunidad", "Comunidades"]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`focus-ring rounded-full border px-3 py-2 text-xs font-bold uppercase text-white/78 ${activeFilter === key ? "border-[#F65E01] bg-[#F65E01]" : "border-white/12 bg-white/8 hover:bg-white/14"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {selected ? (
            <article className="mt-6 rounded-md border border-[#F65E01]/35 bg-[#F65E01]/12 p-5">
              <p className="font-tech text-xs uppercase text-[#F4E6C1]">{selected.departmentName} / {selected.municipalityName}</p>
              <h3 className="mt-2 font-display text-2xl font-black text-white">{selected.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{selected.description}</p>
              <p className="mt-4 font-tech text-xs text-white/70">{selected.latitude.toFixed(4)} N / {Math.abs(selected.longitude).toFixed(4)} W</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/destinos/${slugifyPlace(selected)}`} className="rounded-md bg-[#F65E01] px-4 py-2 font-tech text-xs font-bold uppercase text-white">Ver ficha</Link>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/14 px-4 py-2 font-tech text-xs font-bold uppercase text-white/80">Ruta externa</a>
              </div>
            </article>
          ) : null}
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-md border border-white/12 bg-[#0B2530] shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(244,230,193,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,230,193,0.08) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 600" role="img" aria-label="Ruta activa sobre Nicaragua">
            <path d="M190 470 C 260 380, 310 350, 390 340 S 520 250, 560 170 S 690 160, 735 95" fill="none" stroke="#F65E01" strokeWidth="4" strokeLinecap="round" strokeDasharray="12 14" />
            <path d="M245 445 C 305 430, 362 405, 436 378 C 542 337, 628 285, 705 194" fill="none" stroke="#F4E6C1" strokeWidth="1.4" opacity="0.45" />
          </svg>
          {filteredPlaces.map((place, index) => {
            const positions = [
              ["24%", "71%"],
              ["44%", "57%"],
              ["61%", "35%"],
              ["69%", "27%"],
              ["36%", "31%"],
              ["74%", "64%"]
            ];
            const [left, top] = positions[index % positions.length];
            return (
              <button
                key={place.placeId}
                type="button"
                className="focus-ring absolute flex max-w-[180px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#061018]/82 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur transition hover:scale-105"
                style={{ left, top }}
                onClick={() => setSelectedId(place.placeId)}
              >
                {selected?.placeId === place.placeId ? <Navigation size={14} color="#F65E01" /> : <MapPinned size={14} />}
                <span className="truncate">{place.name}</span>
              </button>
            );
          })}
          <div className="absolute bottom-4 left-4 rounded-md border border-white/12 bg-[#061018]/80 px-3 py-2 font-tech text-xs uppercase text-white/62 backdrop-blur">
            <Compass size={14} className="mr-2 inline text-[#F65E01]" /> Representacion de exploracion
          </div>
        </div>
      </div>
    </section>
  );
}
