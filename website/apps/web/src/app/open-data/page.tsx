// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PORTAL DE DATOS ABIERTOS (OPEN DATA)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia web pública para que la ciudadanía, investigadores,
//   universidades y programadores exploren y descarguen datasets territoriales
//   verificados de Nicaragua bajo licencias abiertas (CC-BY-4.0).
// - Fomentar la investigación del ecoturismo, la conservación de reservas
//   y el desarrollo de aplicaciones cívicas sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Página en Next.js App Router con búsqueda de datasets, vista previa de campos,
//   descargas en JSON / GeoJSON / CSV y snippets de consumo con cURL y fetch.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Catálogo interactivo de datasets abiertos.
// - Modal de previsualización de esquema y metadatos.
// - Enlaces directos a endpoints de Open Data API v1.
// ============================================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OPEN_DATASETS_CATALOG, type OpenDatasetCatalogItem } from "@baqueano/config";

export default function OpenDataPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDataset, setActiveDataset] = useState<OpenDatasetCatalogItem | null>(null);

  const filteredDatasets = OPEN_DATASETS_CATALOG.filter((d) => {
    const matchCategory = selectedCategory === "ALL" || d.category === selectedCategory;
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#165D6F]/30 border border-[#165D6F]/60 text-xs text-cyan-300 font-semibold tracking-wide uppercase">
            <span>🌐</span> Portal de Datos Abiertos & Ciencia Territorial
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Datos Abiertos de <span className="text-[#F65E01]">Baqueano</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Accede libremente a información geoespacial, atractivos turísticos verificados,
            red de tótems inteligentes y patrimonio cultural de Nicaragua bajo licencia abierta Creative Commons.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/developers"
              className="px-5 py-2.5 bg-[#165D6F] hover:bg-[#134e5e] text-white text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              Documentación para Desarrolladores →
            </Link>
            <Link
              href="/research"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700"
            >
              Plataforma de Investigación Académica
            </Link>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar dataset (ej: volcanes, municipios, smart points, cultura)..."
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-[#165D6F]"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
              {["ALL", "destinations", "territories", "smart_points", "culture"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#F65E01] text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat === "ALL"
                    ? "Todos"
                    : cat === "destinations"
                    ? "Destinos"
                    : cat === "territories"
                    ? "Territorios"
                    : cat === "smart_points"
                    ? "Smart Tourism"
                    : "Cultura"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-[#1E293B]/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40">
                    {dataset.license}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Actualización: <strong className="text-slate-200">{dataset.updateFrequency}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{dataset.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{dataset.description}</p>

                <div className="bg-[#0F172A]/70 rounded-xl p-3 text-xs text-slate-400 font-mono space-y-1 border border-slate-800/60">
                  <div className="flex justify-between">
                    <span>Registros:</span>
                    <span className="text-emerald-400 font-bold">{dataset.recordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuente:</span>
                    <span className="text-slate-300 font-sans truncate max-w-[200px]">{dataset.sourceOfTruth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formatos:</span>
                    <span className="text-cyan-300 uppercase">{dataset.formats.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/api/open/v1/datasets/${dataset.id}/download?format=json`}
                    download
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all"
                  >
                    JSON
                  </a>
                  {dataset.formats.includes("geojson") && (
                    <a
                      href={`${dataset.endpointUrl}?format=geojson`}
                      download
                      className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-lg transition-all"
                    >
                      GeoJSON
                    </a>
                  )}
                  {dataset.formats.includes("csv") && (
                    <a
                      href={`/api/open/v1/datasets/${dataset.id}/download?format=csv`}
                      download
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all"
                    >
                      CSV
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setActiveDataset(dataset)}
                  className="px-3 py-1.5 bg-[#165D6F]/30 hover:bg-[#165D6F]/60 text-cyan-300 text-xs font-bold rounded-lg transition-all border border-[#165D6F]/50"
                >
                  Ver API
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for API Endpoint Preview */}
        {activeDataset && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="text-base font-bold text-white">{activeDataset.title} — API Endpoint</h3>
                <button
                  onClick={() => setActiveDataset(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>Puedes consultar este dataset directamente vía HTTP GET sin autenticación:</p>
                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-[11px] overflow-x-auto">
                  curl -X GET &quot;https://baqueano.app{activeDataset.endpointUrl}&quot;
                </div>

                <p className="text-[11px] text-slate-400">
                  Licencia: <strong className="text-slate-200">{activeDataset.license}</strong>. Atribución requerida: &quot;Datos provistos por Baqueano Nicaragua y comunidades locales&quot;.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveDataset(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
