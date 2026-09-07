"use client";

/**
 * WHY
 * Gives travelers fast access to the full exploration ecosystem on mobile and desktop.
 *
 * HOW
 * Uses a sticky glass bar, accessible toggle, stable routes, and touch-sized controls.
 *
 * WHAT
 * Public navigation with route links, brand signal, and mobile section panel.
 */
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Compass, Menu, X } from "lucide-react";
import { publicRoutes } from "@baqueano/config";

export function PublicNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#061018]/76 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Principal">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/assets/images/brand/baqueano_icono_oficial.png" alt="" width={38} height={38} className="rounded-md" priority />
          <span className="min-w-0">
            <strong className="block font-tech text-sm uppercase tracking-normal text-white">Baqueano</strong>
            <span className="block text-xs uppercase tracking-normal text-[#F4E6C1]/76">Nicaragua</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {publicRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="rounded-md px-3 py-2 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-ring">
              {route.label}
            </Link>
          ))}
        </div>

        <Link href="/mapa" className="hidden min-h-11 items-center gap-2 rounded-md bg-[#F65E01] px-4 py-3 font-tech text-sm font-bold uppercase text-white shadow-[0_16px_50px_rgba(246,94,1,0.28)] lg:inline-flex">
          <Compass size={16} /> Explorar
        </Link>

        <button
          type="button"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/14 bg-white/10 text-white lg:hidden"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-[#0F172A]/96 px-4 py-4 shadow-2xl lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            {publicRoutes.map((route) => (
              <Link key={route.href} href={route.href} onClick={() => setOpen(false)} className="focus-ring rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-bold text-white">
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
