/**
 * WHY
 * Centralizes Baqueano visual decisions so web and admin feel like one product.
 *
 * HOW
 * Exposes typed tokens for Tailwind, React components, and future native bridges.
 *
 * WHAT
 * Official colors, typography, motion, shadows, and responsive grid constants.
 */
export const baqueanoColors = {
  teal: "#165D6F",
  terracotta: "#F65E01",
  sand: "#F4E6C1",
  night: "#0F172A",
  jungle: "#10B981",
  mist: "#E6F5F2",
  clay: "#7C2D12",
  lagoon: "#0D9488"
} as const;

export const baqueanoTypography = {
  heading: "var(--font-montserrat)",
  tech: "var(--font-space-grotesk)",
  body: "var(--font-inter)"
} as const;

export const baqueanoMotion = {
  easeOut: [0.16, 1, 0.3, 1],
  reveal: { duration: 0.7, y: 22 },
  routeDraw: { duration: 1.4 }
} as const;

export const baqueanoGrid = {
  mobile: 4,
  tablet: 8,
  desktop: 12
} as const;
