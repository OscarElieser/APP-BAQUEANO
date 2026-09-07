/**
 * WHY
 * Wraps all administration routes with secure operational chrome.
 *
 * HOW
 * Loads optimized fonts, global styles, and the shared admin shell.
 *
 * WHAT
 * Admin root layout.
 */
import type { Metadata } from "next";
import { Inter, Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AdminShell } from "../components/AdminShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Baqueano Control Center",
  description: "Panel de administracion para contenido, operaciones, auditoria y roles de Baqueano.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} ${spaceGrotesk.variable}`}>
      <body><AdminShell>{children}</AdminShell></body>
    </html>
  );
}
