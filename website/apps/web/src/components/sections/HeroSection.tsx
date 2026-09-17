"use client";

/**
 * WHY
 * Opens Baqueano with the required cinematic identity: land, coordinates, route, and action.
 *
 * HOW
 * Uses a full-viewport image stage, gradient depth, Framer Motion reveals, and stable CTA controls.
 *
 * WHAT
 * Public home hero with slogan, GPS signal, route indicator, and exploration actions.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, MapPinned } from "lucide-react";
import { BaqueanoButton, StatusChip } from "@baqueano/ui";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden px-4 pb-10 pt-28 sm:px-6 lg:px-8">
      <Image src="/assets/images/destinos/isla_de_ometepe.jpg" alt="Volcanes de Ometepe sobre el Gran Lago de Nicaragua" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#061018] via-[#061018]/42 to-[#061018]/20" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#061018] to-transparent" />
      <div className="topographic absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <StatusChip tone="green">12.1364 N / 86.2514 W</StatusChip>
          <p className="mt-5 font-tech text-sm font-black uppercase tracking-normal text-[#F4E6C1]">BAQUEANO</p>
          <h1 className="mt-3 max-w-5xl font-display text-[clamp(3.2rem,10vw,8.6rem)] font-black uppercase leading-[0.86] text-white">
            Descubre<br />lo que no sale<br />en el mapa
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
            Nicaragua ancestral, naturaleza viva y tecnologia de exploracion en una plataforma para viajeros, comunidades y anfitriones locales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/destinos"><BaqueanoButton><Compass size={18} /> Explorar Nicaragua</BaqueanoButton></Link>
            <Link href="/mapa"><BaqueanoButton variant="ghost"><MapPinned size={18} /> Abrir mapa</BaqueanoButton></Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.75 }} className="glass-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="font-tech text-xs font-bold uppercase text-[#F4E6C1]">Ruta activa</span>
            <span className="h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_24px_#10B981]" />
          </div>
          <svg viewBox="0 0 420 140" className="mt-5 h-32 w-full" aria-hidden="true">
            <path d="M15 105 C 75 26, 135 88, 198 53 S 310 8, 390 54" fill="none" stroke="#F4E6C1" strokeWidth="2" opacity="0.45" />
            <path d="M15 105 C 75 26, 135 88, 198 53 S 310 8, 390 54" fill="none" stroke="#F65E01" strokeWidth="4" strokeLinecap="round" strokeDasharray="18 13" />
            <circle cx="390" cy="54" r="8" fill="#F65E01" />
          </svg>
          <div className="grid grid-cols-3 gap-3 text-center">
            {["Volcan", "Lago", "Comunidad"].map((item) => (
              <span key={item} className="rounded-md border border-white/10 bg-white/8 px-2 py-3 font-tech text-xs uppercase text-white/76">{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
