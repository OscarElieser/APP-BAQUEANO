/**
 * WHY
 * Gives every Nicaraguan territory room for its own cultural and travel profile.
 *
 * HOW
 * Resolves territory records by slug and keeps the page ready for Firestore expansion.
 *
 * WHAT
 * Territory detail route.
 */
import { notFound } from "next/navigation";
import { SectionHeader, StatusChip } from "@baqueano/ui";
import { territories } from "../../../data/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return territories.map((territory) => ({ slug: territory.slug }));
}

export default async function TerritoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const territory = territories.find((item) => item.slug === slug);
  if (!territory) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <StatusChip tone={territory.type === "region_autonoma" ? "green" : "teal"}>{territory.type === "region_autonoma" ? "Region autonoma" : "Departamento"}</StatusChip>
      <SectionHeader kicker={territory.capital} title={territory.name}>
        <p>{territory.culturalSignal} sobre {territory.landscape}. Esta pagina queda preparada para mapa, municipios, fotos, historia local, gastronomia y negocios verificados.</p>
      </SectionHeader>
    </main>
  );
}
