// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — METODOLOGÍA DE CONFIANZA & TURISMO RESPONSABLE (FASE 14)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Publicar con total transparencia la metodología de verificación, catálogo de insignias
//   y el algoritmo del Índice Baqueano de Turismo Responsable (BRTI v1.0.0).
// - Explicar a la ciudadanía, exploradores y prestadores cómo se audita la información
//   y cómo se protege a los pequeños productores campesinos del greenwashing.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz Next.js 15 React Server Component con diseño Glassmorphism accesible,
//   paleta oficial (#165D6F, #F65E01, #F4E6C1, #0F172A), sin el término prohibido.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Explicación de los 7 tipos de verificación.
// - Matriz de las 6 dimensiones del BRTI.
// - Formulario interactivo de reporte ciudadano ético.
// ============================================================================

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Building2, Users, HeartHandshake, FileCheck2, AlertTriangle, ArrowLeft } from "lucide-react";
import { TRUST_BADGES_CATALOG, BRTI_CONFIG } from "@baqueano/config";

export const metadata = {
  title: "Metodología de Confianza & BRTI | Baqueano Nicaragua",
  description: "Conoce los criterios científicos, humanos y de equidad territorial con los que Baqueano verifica destinos, alojamientos y prácticas de turismo responsable."
};

export default function ConfianzaMetodologiaPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#F65E01] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-[#F4E6C1] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Inicio
          </Link>
          <span>/</span>
          <span className="text-slate-200">Confianza & Metodología</span>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#165D6F]/40 to-[#0F172A] border border-cyan-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#165D6F]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#F65E01]" />
              <span>BAQUEANO TRUST LAYER — VERIFICACIÓN TRANSPARENTE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Confía porque puedes <span className="text-[#F65E01]">verificarlo</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              En Baqueano no afirmamos que un destino o alojamiento es responsable solo porque alguien lo dice.
              Construimos un ecosistema sustentado en <strong className="text-white">evidencias auditables, procedencia de datos y salvaguardas de equidad</strong> para la economía campesina sin intermediarios.
            </p>
          </div>
        </div>

        {/* 1. Principios Fundamentales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">1. Cero Puntuación a Personas</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              No existen puntuaciones humanas ni rankings de personas. Solo evaluamos recursos territoriales, destinos, evidencias y prácticas de sostenibilidad comprobables.
            </p>
          </div>

          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">2. Equidad Rural Sin Sesgo</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Un comedor rural o guía comunitario no tiene desventaja por falta de papeleo corporativo. Admitimos visitas de campo, fotos geolocalizadas y avales comunales.
            </p>
          </div>

          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">3. Confianza ≠ Popularidad</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ni los likes ni las membresías de pago influyen en la verificación ni en la sostenibilidad. Las afirmaciones comerciales no sustentadas son rechazadas.
            </p>
          </div>
        </div>

        {/* 2. Catálogo Oficial de Insignias */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#F65E01]" /> Catálogo Oficial de Insignias Públicas
            </h2>
            <p className="text-xs text-slate-400">
              Cada insignia otorgada cuenta con criterios normativos de otorgamiento, emisor identificado y fecha de vencimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRUST_BADGES_CATALOG.map((badge) => (
              <div key={badge.badgeId} className="bg-[#1E293B]/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    <span>{badge.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Válido: {badge.validityMonths} meses</span>
                </div>
                <p className="text-xs text-slate-200">{badge.description}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">Emisor:</strong> {badge.issuer}</p>
                  <p><strong className="text-slate-300">Criterio:</strong> {badge.criteria}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. El Índice Baqueano de Turismo Responsable (BRTI) */}
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>ALGORITMO AUDITABLE</span>
            </div>
            <h2 className="text-2xl font-black text-white">Índice Baqueano de Turismo Responsable (BRTI v{BRTI_CONFIG.version})</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              El BRTI es un modelo cuantitativo y cualitativo que pondera 6 dimensiones territoriales clave, complementadas con un Factor de Confianza de Evidencia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-amber-400">Economía Local (25%)</span>
              <p className="text-[11px] text-slate-300">Compras directas a familias campesinas y contratación local sin intermediarios foráneos.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-emerald-400">Dimensión Ambiental (20%)</span>
              <p className="text-[11px] text-slate-300">Conservación de flora y fauna, manejo de residuos y reducción estricta de plásticos.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-cyan-400">Dimensión Social (20%)</span>
              <p className="text-[11px] text-slate-300">Condiciones de trabajo justas, inclusión comunitaria y bienestar familiar de los anfitriones.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-purple-400">Cultura y Patrimonio (15%)</span>
              <p className="text-[11px] text-slate-300">Respeto a tradiciones ancestrales, memoria viva y protección de saberes locales.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-blue-400">Accesibilidad (10%)</span>
              <p className="text-[11px] text-slate-300">Señalética clara, adaptaciones de movilidad y alternativas informativas digitales.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-rose-400">Gestión Responsable (10%)</span>
              <p className="text-[11px] text-slate-300">Monitoreo de aforo, capacidad de carga de senderos y protocolos de prevención de riesgos.</p>
            </div>
          </div>
        </div>

        {/* 4. Canal Ciudadano de Reportes */}
        <div className="bg-gradient-to-r from-slate-900 to-[#165D6F]/30 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#F65E01]" />
            <h2 className="text-xl font-bold text-white">Canal de Reporte Ético Ciudadano</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            ¿Detectaste un número de contacto que no funciona, coordenadas cartográficas inexactas o una afirmación que no corresponde a la realidad? Los reportes son revisados por nuestro equipo de confianza territorial sin penalizaciones automáticas injustas.
          </p>
          <div className="pt-2">
            <Link
              href="mailto:confianza@baqueano.app?subject=Reporte%20Etico%20Territorial"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F65E01] hover:bg-[#F65E01]/90 text-white text-xs font-bold transition-all shadow-lg"
            >
              <AlertTriangle className="w-4 h-4" /> Enviar Reporte de Inconsistencia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
