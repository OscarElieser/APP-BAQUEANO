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
import { getWebsitePage } from "@baqueano/firebase";
import { DynamicBlockRenderer } from "../components/DynamicBlockRenderer";

export const revalidate = 60; // Revalidate every minute for live CMS updates

export default async function HomePage() {
  const page = await getWebsitePage("home");
  
  return (
    <main>
      <DynamicBlockRenderer blocks={page?.blocks || []} />
    </main>
  );
}
