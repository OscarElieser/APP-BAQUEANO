export type BlockType = 
  | "HERO" 
  | "TEXT" 
  | "IMAGE" 
  | "GALLERY" 
  | "VIDEO" 
  | "DESTINATIONS_GRID" 
  | "PLACES_GRID" 
  | "EXPERIENCES_LIST" 
  | "MAP" 
  | "CTA" 
  | "STATS" 
  | "HISTORY_SECTION" 
  | "CULTURE_SECTION" 
  | "GASTRONOMY_SECTION" 
  | "BUSINESSES_GRID" 
  | "AI_PROMPT" 
  | "FAQ" 
  | "BANNER";

export interface BaseBlock {
  readonly id: string;
  readonly type: BlockType;
  readonly order: number;
  readonly isHidden: boolean;
}

export interface HeroBlock extends BaseBlock {
  readonly type: "HERO";
  readonly title: string;
  readonly subtitle: string;
  readonly backgroundMediaUrl: string;
  readonly ctaText: string;
  readonly ctaLink: string;
}

export interface TextBlock extends BaseBlock {
  readonly type: "TEXT";
  readonly content: string; // Markdown or plain text
  readonly alignment: "left" | "center" | "right";
}

export interface DestinationsGridBlock extends BaseBlock {
  readonly type: "DESTINATIONS_GRID";
  readonly title: string;
  readonly maxItems: number;
  readonly filterByDepartment?: string;
  readonly filterByCategory?: string;
}

export interface MapBlock extends BaseBlock {
  readonly type: "MAP";
  readonly title: string;
  readonly showControls: boolean;
  readonly centerCoordinates?: { latitude: number; longitude: number };
  readonly defaultZoom?: number;
}

export type WebsiteBlock = HeroBlock | TextBlock | DestinationsGridBlock | MapBlock | BaseBlock;

export interface PageRecord {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly metaDescription: string;
  readonly status: "draft" | "published" | "archived";
  readonly blocks: readonly WebsiteBlock[];
  readonly lastModifiedByUid: string;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
}
