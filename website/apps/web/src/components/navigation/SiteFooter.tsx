/**
 * WHY
 * Closes the public experience with trust, app continuity, and ecosystem links.
 *
 * HOW
 * Uses semantic footer sections, direct route references, and Android download messaging.
 *
 * WHAT
 * Footer for public pages.
 */
import Link from "next/link";
import { publicRoutes } from "@baqueano/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#061018]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-tech text-sm font-black uppercase text-[#F4E6C1]">BAQUEANO NICARAGUA</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/66">
            Plataforma de turismo sostenible, cultura viva, mapas e inteligencia de exploracion para descubrir lo que no sale en el mapa.
          </p>
        </div>
        <div>
          <h2 className="font-tech text-xs font-bold uppercase text-white">Explorar</h2>
          <div className="mt-4 grid gap-2 text-sm text-white/66">
            {publicRoutes.slice(1, 6).map((route) => <Link key={route.href} href={route.href} className="hover:text-white">{route.label}</Link>)}
          </div>
        </div>
        <div>
          <h2 className="font-tech text-xs font-bold uppercase text-white">App Android</h2>
          <p className="mt-4 text-sm leading-6 text-white/66">Lleva rutas, guardados, alertas y pasaporte del explorador en el telefono.</p>
        </div>
      </div>
    </footer>
  );
}
