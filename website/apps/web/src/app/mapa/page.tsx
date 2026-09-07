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
import { featuredDestinations } from "../../data/catalog";

export default function MapaPage() {
  return (
    <main className="pt-24">
      <InteractiveMap destinations={featuredDestinations} />
    </main>
  );
}
