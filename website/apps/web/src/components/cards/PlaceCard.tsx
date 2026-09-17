/**
 * WHY
 * Shows Android-compatible `places` records without reshaping them in the UI.
 *
 * HOW
 * Uses stable field names from `PlaceModel`, reserved images, and explicit action controls.
 *
 * WHAT
 * Reusable place card for destination explorers.
 */
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import type { PlaceRecord } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";
import { slugifyPlace } from "../../utils/place";

export function PlaceCard({ place }: { place: PlaceRecord }) {
  return (
    <article className="group overflow-hidden rounded-md border border-white/12 bg-white/[0.07] shadow-[0_28px_90px_rgba(0,0,0,0.25)] backdrop-blur transition hover:-translate-y-1 hover:border-[#F65E01]/45">
      <Link href={`/destinos/${slugifyPlace(place)}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={place.imageUrl || "/assets/images/destinos/splash_bg.jpg"} alt={place.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/86 via-transparent to-transparent" />
          <div className="absolute left-4 top-4"><StatusChip tone="orange">{place.categoryName}</StatusChip></div>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-tech text-xs uppercase text-[#F4E6C1]/86"><MapPin size={14} /> {place.departmentName}</p>
          <p className="flex items-center gap-1 font-tech text-sm text-white"><Star size={14} fill="#F65E01" color="#F65E01" /> {place.rating}</p>
        </div>
        <h3 className="mt-3 font-display text-xl font-black text-white">{place.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/66">{place.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link href={`/mapa?place=${place.placeId}`} className="font-tech text-xs font-bold uppercase text-[#F65E01]">Abrir mapa</Link>
          <button type="button" className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/12 bg-white/8 text-white" aria-label={`Guardar ${place.name}`}>
            <Heart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
