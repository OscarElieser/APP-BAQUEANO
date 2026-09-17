/**
 * WHY
 * Lets travelers search and compare destinations by useful exploration criteria.
 *
 * HOW
 * Renders typed destination records with filter controls prepared for Firebase queries.
 *
 * WHAT
 * Destination listing page with search, filters, and responsive grid.
 */
import { SectionHeader } from "@baqueano/ui";
import { DataSourceBanner } from "../../components/sections/DataSourceBanner";
import { DestinationExplorer } from "../../components/sections/DestinationExplorer";
import { getPublishedDestinationPlaces } from "../../services/destination.service";

export default async function DestinosPage() {
  const result = await getPublishedDestinationPlaces();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <SectionHeader kicker="Destinos" title="Encuentra rutas por territorio, ritmo e impacto.">
        <p>Busqueda, categorias, precio, dificultad, sostenibilidad, popularidad y valoracion quedan listos para conectarse a Firestore.</p>
      </SectionHeader>
      <div className="mt-8"><DataSourceBanner result={result} label="Fuente de destinos" /></div>
      <DestinationExplorer places={result.items} />
    </main>
  );
}
