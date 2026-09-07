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
import { HeroSection } from "../components/sections/HeroSection";
import { HomeNarrative } from "../components/sections/HomeNarrative";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HomeNarrative />
    </main>
  );
}
