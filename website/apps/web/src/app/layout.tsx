/**
 * WHY
 * Provides the public shell, SEO defaults, and font strategy for Baqueano web.
 *
 * HOW
 * Loads Google-hosted fonts through Next font optimization and wraps all pages in shared navigation.
 *
 * WHAT
 * Root layout, metadata, language, nav, and global styles.
 */
import type { Metadata } from "next";
import { Inter, Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PublicNavigation } from "../components/navigation/PublicNavigation";
import { SiteFooter } from "../components/navigation/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://baqueano.ni"),
  title: {
    default: "Baqueano Nicaragua | Descubre lo que no sale en el mapa",
    template: "%s | Baqueano Nicaragua"
  },
  description: "Plataforma digital de exploracion sostenible, cultura, mapas y comunidades locales de Nicaragua.",
  openGraph: {
    title: "Baqueano Nicaragua",
    description: "Descubre lo que no sale en el mapa.",
    images: ["/assets/images/destinos/isla_de_ometepe.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} ${spaceGrotesk.variable}`}>
      <body>
        <PublicNavigation />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
