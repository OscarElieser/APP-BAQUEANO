/**
 * WHY
 * Presents each destination as an editorial and operational travel record.
 *
 * HOW
 * Resolves typed local records by slug and exposes fields compatible with future Firestore reads.
 *
 * WHAT
 * Destination detail page with imagery, location, map data, conservation, booking actions, and metadata.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, Heart, MapPin, Share2 } from "lucide-react";
import { BaqueanoButton, MetricTile, StatusChip } from "@baqueano/ui";
import { SavePlaceButton } from "../../../components/cards/SavePlaceButton";
import { seedPlaces } from "../../../data/catalog";
import { getStaticDestinationPlaceBySlug } from "../../../services/static-destination.service";
import { slugifyPlace } from "../../../utils/place";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seedPlaces.map((place) => ({ slug: slugifyPlace(place) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { item: destination } = getStaticDestinationPlaceBySlug(slug);
  return {
    title: destination?.name ?? "Destino",
    description: destination?.description,
    openGraph: { images: destination?.imageUrl ? [destination.imageUrl] : [] }
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { result, item: destination } = getStaticDestinationPlaceBySlug(slug);
  if (!destination) notFound();

  return (
    <main className="pb-20">
      <section className="relative min-h-[78vh] overflow-hidden px-4 pb-10 pt-32 sm:px-6 lg:px-8">
        <Image src={destination.imageUrl || "/assets/images/destinos/splash_bg.jpg"} alt={destination.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061018] via-[#061018]/48 to-[#061018]/18" />
        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-end">
          <StatusChip tone="orange">{destination.categoryName}</StatusChip>
          <h1 className="mt-4 max-w-5xl font-display text-5xl font-black uppercase leading-none text-white md:text-8xl">{destination.name}</h1>
          <p className="mt-5 flex items-center gap-2 font-tech text-sm uppercase text-[#F4E6C1]"><MapPin size={16} /> {destination.departmentName}, {destination.municipalityName}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <article className="glass-panel p-6 md:p-8">
          <div className="mb-6 rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-3 text-sm text-white/76">
            <strong className="font-tech uppercase text-[#F4E6C1]">Fuente:</strong> {result.source === "firestore" ? "Firestore `places`." : "Datos semilla de desarrollo."}
          </div>
          <p className="text-lg leading-8 text-white/78">{destination.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricTile label="Estado" value={destination.status} icon={<Clock size={20} />} />
            <MetricTile label="Verificado" value={destination.verified ? "Si" : "No"} icon={<Calendar size={20} />} />
            <MetricTile label="Rating" value={destination.rating.toFixed(1)} icon={<Heart size={20} />} />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {["Equipo recomendado", "Conservacion", "Anfitriones", "Negocios cercanos"].map((title) => (
              <div key={title} className="rounded-md border border-white/10 bg-white/[0.05] p-5">
                <h2 className="font-display text-xl font-black text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/66">Contenido editable desde Admin y publicado en Firestore para Web y Android.</p>
              </div>
            ))}
          </div>
        </article>
        <aside className="glass-panel h-fit p-5">
          <p className="font-tech text-xs uppercase text-[#F4E6C1]">Coordenadas</p>
          <p className="mt-2 font-tech text-xl font-black text-white">{destination.latitude.toFixed(4)} N</p>
          <p className="font-tech text-xl font-black text-white">{Math.abs(destination.longitude).toFixed(4)} W</p>
          <div className="mt-6 grid gap-3">
            <BaqueanoButton>Reservar</BaqueanoButton>
            <SavePlaceButton placeId={destination.placeId} />
            <BaqueanoButton variant="ghost"><Share2 size={16} /> Compartir</BaqueanoButton>
          </div>
        </aside>
      </section>
    </main>
  );
}
