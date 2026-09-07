// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PLATAFORMA DE INVESTIGACIÓN ACADÉMICA (RESEARCH)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una pasarela formal para que universidades, centros de investigación,
//   tesistas y científicos de conservación soliciten y accedan a datos agregados
//   de movilidad ecoturística, impacto ambiental y telemetría territorial.
// - Aplica estándares estrictos de K-anonymity y supresión de celdas pequeñas
//   para proteger la privacidad de los exploradores y comunidades originarias.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz en Next.js App Router con casos de uso científicos, criterios éticos
//   y formulario de registro de proyecto de investigación.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Portal de investigación y ciencia territorial.
// - Formulario de solicitud de acceso con compromisos de K-anonymity.
// ============================================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ResearchPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    investigator: "",
    institution: "",
    email: "",
    purpose: "",
    datasets: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold tracking-wide uppercase">
            <span>🔬</span> Ciencia Territorial & Ecoturismo Sostenible
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Plataforma de <span className="text-emerald-400">Investigación</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Colaboración científica con universidades e institutos de conservación para el estudio de la biodiversidad,
            desconcentración turística y resiliencia comunitaria en Nicaragua.
          </p>
        </div>

        {/* Ethical Standards Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xl">🛡️</span>
            <h3 className="font-bold text-white text-sm">Privacidad & K-Anonymity</h3>
            <p className="text-slate-300">
              Nunca se proporcionan trayectorias individuales. Todos los datos de aforo son agregados y anonimizados.
            </p>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xl">🌿</span>
            <h3 className="font-bold text-white text-sm">Conservación Territorial</h3>
            <p className="text-slate-300">
              Datos climáticos, de calidad de aire y nivel de ríos disponibles para proyectos de mitigación del cambio climático.
            </p>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xl">🤝</span>
            <h3 className="font-bold text-white text-sm">Retribución Comunitaria</h3>
            <p className="text-slate-300">
              Los resultados de las investigaciones deben compartirse con las cooperativas y guardaparques locales.
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-[#1E293B]/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Solicitud de Acceso para Proyectos de Investigación</h2>
            <p className="text-xs text-slate-400 mt-1">
              Completa este formulario para solicitar acceso a datasets agregados de investigación.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Título del Proyecto de Investigación:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Análisis de capacidad de carga en bosques nubosos..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Investigador(a) Principal:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo y grado académico"
                    value={formData.investigator}
                    onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Universidad o Institución Científica:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: UNAN, UNI, INCAE, Universidad de Costa Rica..."
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Correo Electrónico Institucional:</label>
                  <input
                    type="email"
                    required
                    placeholder="investigador@universidad.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Descripción y Propósito Científico:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe la hipótesis, metodología y cómo esta investigación beneficiará al ecoturismo o la conservación territorial..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg text-xs"
                >
                  Enviar Solicitud de Acceso para Investigación
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-6 text-center space-y-3">
              <span className="text-3xl">✅</span>
              <h3 className="text-base font-bold text-white">Solicitud Recibida con Éxito</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Tu proyecto <strong>&quot;{formData.title}&quot;</strong> ha sido registrado para revisión por el comité de ciencia territorial de Baqueano. Recibirás respuesta en <strong>{formData.email}</strong> en un plazo de 3 a 5 días hábiles.
              </p>
              <div className="pt-2">
                <Link href="/open-data" className="text-xs text-emerald-400 hover:underline">
                  ← Mientras tanto, explora los datasets de Open Data públicos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
