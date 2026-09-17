/**
 * WHY
 * Displays destination records with visual weight while preserving scan speed.
 *
 * HOW
 * Reserves image dimensions, exposes status metadata, and links by stable slug.
 *
 * WHAT
 * Reusable destination card for grids and related content.
 */
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { Destination } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link href={`/destinos/${destination.slug}`} className="group overflow-hidden rounded-md border border-white/12 bg-white/[0.07] shadow-[0_28px_90px_rgba(0,0,0,0.25)] backdrop-blur transition hover:-translate-y-1 hover:border-[#F65E01]/45">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={destination.heroImage} alt={destination.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/86 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusChip tone="orange">{destination.category}</StatusChip>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-tech text-xs uppercase text-[#F4E6C1]/86"><MapPin size={14} /> {destination.department}</p>
          <p className="flex items-center gap-1 font-tech text-sm text-white"><Star size={14} fill="#F65E01" color="#F65E01" /> {destination.rating}</p>
        </div>
        <h3 className="mt-3 font-display text-xl font-black text-white">{destination.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/66">{destination.summary}</p>
      </div>
    </Link>
  );
}
