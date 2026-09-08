// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PASAPORTE DIGITAL (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una bitácora editorial de recuerdos, sellos y visitas culturales verificadas
//   para el explorador en Nicaragua.
// - Proteger la privacidad: el pasaporte es opt-in y no revela ubicaciones en tiempo real ni reservas privadas.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Visualización de sellos territoriales verificados mediante QR, NFC y balizas Smart Points.
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Galería de Sellos y Logros de Exploración Comunitaria.
// - Registro de Memorias Culturales.
// ============================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Calendar,
  Compass,
  MapPin,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { passportService } from "../../services/experience/passport.service";

export default function PassportPage() {
  const entries = passportService.getPassportEntries("user-demo-explorador");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* CABECERA DEL PASAPORTE */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#06151f] via-[#091b24] to-[#165D6F]/30 p-6 lg:p-8 backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#10B981]/20 px-2.5 py-0.5 font-tech text-xs font-bold uppercase tracking-wider text-[#10B981]">
                Pasaporte Baqueano &middot; Activo
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-tech text-xs text-[#F4E6C1]">
                {entries.length} Sellos Verificados
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black text-white lg:text-3xl">
              Bitácora de Exploración Territorial
            </h1>
            <p className="mt-1 text-xs text-white/70">
              Registro personal de atractivos, cooperativas y saberes comunitarios validados en territorio.
            </p>
          </div>

          <Link
            href="/destinos"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft size={15} /> Descubrir más
          </Link>
        </div>
      </div>

      {/* GALERÍA DE SELLOS */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-black text-white">Sellos & Memorias Registradas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <div
              key={entry.entryId}
              className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-tech text-[10px] font-bold uppercase text-[#F65E01]">
                    {entry.verificationType} &middot; {entry.territoryId}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{entry.placeName}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#165D6F]/30 border border-[#165D6F] text-[#F4E6C1]">
                  <ShieldCheck size={20} />
                </div>
              </div>

              {entry.memoryNote && (
                <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                  &ldquo;{entry.memoryNote}&rdquo;
                </p>
              )}

              {entry.badgeUnlocked && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-2 text-xs font-semibold text-emerald-300">
                  <Award size={16} /> {entry.badgeUnlocked}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-white/40 font-mono">
                <span>Fecha: {new Date(entry.verifiedAt).toLocaleDateString("es-NI")}</span>
                <span>ID: {entry.entryId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
