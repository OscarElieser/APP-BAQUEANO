// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PORTAL DE DESARROLLADORES (DEVELOPER PORTAL)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia de desarrollo integral para ingenieros, socios
//   institucionales y creadores de software que deseen integrar las capacidades
//   territoriales de Baqueano mediante APIs seguras y contratos abiertos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz en Next.js App Router con guía de Quick Start, especificación de
//   scopes, sandbox de pruebas, snippets de código y explorador interactivo.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Portal de documentación y guías de inicio rápido.
// - Simulador de llamadas cURL / JavaScript.
// - Catálogo de scopes y directrices de rate limiting.
// ============================================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AVAILABLE_API_SCOPES } from "@baqueano/config";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"quickstart" | "auth" | "scopes" | "explorer">("quickstart");
  const [explorerEndpoint, setExplorerEndpoint] = useState("/api/open/v1/places");
  const [explorerResponse, setExplorerResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const runExplorer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(explorerEndpoint);
      const data = await res.json();
      setExplorerResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setExplorerResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#165D6F]/30 border border-[#165D6F]/60 text-xs text-cyan-300 font-semibold tracking-wide uppercase">
            <span>⚡</span> Plataforma para Desarrolladores & Aliados
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Baqueano <span className="text-[#F65E01]">Developer Platform</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Construye aplicaciones, mapas interactivos e integraciones territoriales utilizando las APIs REST y GeoJSON de Baqueano.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/open-data"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700"
            >
              ← Explorar Catálogo Open Data
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2 text-xs">
          {[
            { id: "quickstart", label: "🚀 Inicio Rápido" },
            { id: "auth", label: "🔑 Autenticación & Sandbox" },
            { id: "scopes", label: "🛡️ Scopes & Permisos" },
            { id: "explorer", label: "🧪 Explorador de API en Vivo" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#165D6F] text-white shadow-lg"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Quickstart */}
        {activeTab === "quickstart" && (
          <div className="space-y-6">
            <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">1. Consumo Directo sin Autenticación (Open Data)</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Los endpoints de datos abiertos son públicos y accesibles directamente sin tokens ni registro:
              </p>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-2">
                <p className="text-slate-500">// Consulta en cURL:</p>
                <p>curl -X GET &quot;https://baqueano.app/api/open/v1/places?format=geojson&limit=10&quot;</p>
              </div>
            </div>

            <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">2. Consumo en JavaScript / TypeScript</h2>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
                <p><span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> fetch(<span className="text-amber-300">&quot;https://baqueano.app/api/open/v1/places&quot;</span>);</p>
                <p><span className="text-purple-400">const</span> {`{ data }`} = <span className="text-purple-400">await</span> response.json();</p>
                <p>console.log(<span className="text-amber-300">&quot;Destinos cargados:&quot;</span>, data);</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Auth & Sandbox */}
        {activeTab === "auth" && (
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs text-slate-300">
            <h2 className="text-xl font-bold text-white">Autenticación para APIs de Aliados (Partner APIs)</h2>
            <p className="leading-relaxed">
              Las APIs que requieren permisos especiales (como propuestas de destinos comunitarios o integración de reservas institucionales) utilizan autenticación mediante cabecera <code className="text-cyan-300 bg-[#0F172A] px-2 py-0.5 rounded">x-api-key</code>:
            </p>
            <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
              curl -X GET &quot;https://baqueano.app/api/v1/places&quot; \<br />
              &nbsp;&nbsp;-H &quot;x-api-key: bq_live_your_partner_key_here&quot;
            </div>

            <div className="bg-[#0F172A]/80 border border-slate-700 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-white text-sm">Entorno Sandbox</h3>
              <p>
                Para pruebas de integración disponemos de claves prefijadas con <code className="text-amber-300">bq_test_...</code> que operan contra una réplica sanitizada sin afectar datos en producción.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Scopes */}
        {activeTab === "scopes" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Catálogo de Scopes de Permisos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_API_SCOPES.map((scope) => (
                <div key={scope.id} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{scope.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${scope.tier === "public" ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "bg-purple-950 text-purple-300 border border-purple-800"}`}>
                      {scope.tier}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{scope.name}</h4>
                  <p className="text-xs text-slate-300">{scope.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: API Explorer */}
        {activeTab === "explorer" && (
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Explorador de API en Vivo (Sandbox)</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={explorerEndpoint}
                onChange={(e) => setExplorerEndpoint(e.target.value)}
                className="bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="/api/open/v1/places">GET /api/open/v1/places</option>
                <option value="/api/open/v1/places?format=geojson">GET /api/open/v1/places?format=geojson</option>
                <option value="/api/open/v1/territories">GET /api/open/v1/territories</option>
                <option value="/api/open/v1/smart-points">GET /api/open/v1/smart-points</option>
                <option value="/api/open/v1/datasets">GET /api/open/v1/datasets</option>
              </select>

              <button
                onClick={runExplorer}
                disabled={isLoading}
                className="px-5 py-2 bg-[#F65E01] hover:bg-[#d85301] text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isLoading ? "Ejecutando..." : "Ejecutar Consulta"}
              </button>
            </div>

            {explorerResponse && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400">Respuesta HTTP 200 OK:</span>
                <pre className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 max-h-96 overflow-y-auto">
                  {explorerResponse}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
