/**
 * WHY
 * Serves as the main Baqueano web entrance and brand-defining first impression.
 *
 * HOW
 * Composes modular sections with local assets, typed seed data, and responsive layouts.
 *
 * WHAT
 * Home page with hero, exploration story, destinations, map, impact, AI, and Android bridge.
 */
import { getWebsitePage, listPublishedPlaces } from "@baqueano/firebase";
import { DynamicBlockRenderer } from "../components/DynamicBlockRenderer";

export const revalidate = 60; // Revalidate every minute for live CMS updates

export default async function HomePage() {
  const [page, placesResult] = await Promise.all([
    getWebsitePage("home"),
    listPublishedPlaces()
  ]);
  
  return (
    <main>
      <DynamicBlockRenderer blocks={page?.blocks || []} places={placesResult.items} />
    </main>
  );
}
