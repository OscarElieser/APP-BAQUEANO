import type { Config } from "tailwindcss";
import { baqueanoColors } from "@baqueano/design-system";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        baqueano: baqueanoColors
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        tech: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
