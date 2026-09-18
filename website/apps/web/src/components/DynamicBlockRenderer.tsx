import { HeroSection } from "./sections/HeroSection";
import { HomeNarrative } from "./sections/HomeNarrative";
import { DestinationExplorer } from "./sections/DestinationExplorer";
import type { WebsiteBlock } from "@baqueano/types";

export function DynamicBlockRenderer({ blocks }: { blocks: readonly WebsiteBlock[] }) {
  if (!blocks || blocks.length === 0) {
    // Fallback UI if no CMS data
    return (
      <>
        <HeroSection />
        <HomeNarrative />
      </>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "HeroBanner":
            return <HeroSection key={block.id} {...block.props} />;
          case "DestinationsGrid":
            return <DestinationExplorer key={block.id} {...block.props} />;
          case "NarrativeSection":
            return <HomeNarrative key={block.id} {...block.props} />;
          default:
            return null;
        }
      })}
    </>
  );
}
