/**
 * WHY
 * Gives the Baqueano map its own protagonist route.
 *
 * HOW
 * Reuses the interactive map module with destination records and category filters.
 *
 * WHAT
 * Public map page.
 */
import { InteractiveMap } from "../../components/map/InteractiveMap";
import { DataSourceBanner } from "../../components/sections/DataSourceBanner";
import { getPublishedDestinationPlaces } from "../../services/destination.service";

export default async function MapaPage() {
  const result = await getPublishedDestinationPlaces();

  return (
    <main className="pt-24">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <DataSourceBanner result={result} label="Estado del mapa" />
      </div>
      <InteractiveMap places={result.items} />
    </main>
  );
}
