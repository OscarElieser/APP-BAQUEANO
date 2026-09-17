// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTIÓN REGIONAL & PAÍSES CENTROAMÉRICA (FASE 12)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centralizar la administración del ecosistema multi-país de Baqueano en Centroamérica.
// - Garantizar que la expansión territorial se ejecute con estricta gobernanza,
//   verificación de capacidades activas y aislamiento de seguridad por país.
// - Mantener a Nicaragua como mercado nuclear activo mientras se monitorea
//   el avance de configuración de Costa Rica, Guatemala y otros países.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Consola reactiva en Next.js App Router con tipado estricto (@baqueano/types).
// - Matriz visual de capacidades (Destinos, Negocios, Reservas, Pagos, AI, IoT).
// - Control de ciclo de vida de país y switch de emergencia (Kill-switch / Pausa de país).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Tablero de Países Centroamericanos (CountryRecord).
// - Modal de auditoría y configuración de capacidades territoriales.
// - Indicadores de readiness y estadísticas de contenido verificado por país.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCountries, updateCountryStatus } from "../../services/country.service";
import type { CountryRecord, CountryStatus } from "@baqueano/types";

export default function PaisesAdminPage() {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getCountries();
      setCountries([...res.items]);
    }
    load();
  }, []);

  const filteredCountries = countries.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  const handleStatusChange = async (code: string, nextStatus: CountryStatus) => {
    setIsUpdating(true);
    const ok = await updateCountryStatus(code, nextStatus);
    if (ok) {
      setCountries((prev) =>
        prev.map((c) => (c.code === code ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c))
      );
      if (selectedCountry && selectedCountry.code === code) {
        setSelectedCountry((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    }
    setIsUpdating(false);
  };

  const getStatusBadge = (status: CountryStatus) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Activo (En Producción)</span>;
      case "PILOT":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">Piloto Territorial</span>;
      case "CONFIGURING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">En Configuración</span>;
      case "PAUSED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Pausado (Kill-Switch)</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/40">Planificado</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#165D6F] font-semibold uppercase tracking-wider mb-1">
              <span>Ecosistema Regional</span>
              <span>/</span>
              <span className="text-slate-400">Centroamérica</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🌎</span> Gestión de Países & Expansión Regional
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Control de mercado, matriz de capacidades, monedas locales y aislamiento multi-tenant para Centroamérica.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/control-tower"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              🗼 Control Tower
            </Link>
            <Link
              href="/plataforma"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              ⚙️ Plataforma
            </Link>
          </div>
        </div>

        {/* Regional KPI Rollup */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Países en Plataforma</span>
            <div className="text-2xl font-black text-white mt-1">{countries.length}</div>
            <span className="text-[11px] text-slate-500">7 Países Centroamericanos</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Mercados Activos</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {countries.filter((c) => c.status === "ACTIVE").length}
            </div>
            <span className="text-[11px] text-emerald-500/80">Nicaragua (Núcleo)</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">En Configuración / Piloto</span>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {countries.filter((c) => c.status === "CONFIGURING" || c.status === "PILOT").length}
            </div>
            <span className="text-[11px] text-sky-500/80">Costa Rica & Guatemala</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Destinos Verificados</span>
            <div className="text-2xl font-black text-[#F65E01] mt-1">
              {countries.reduce((acc, c) => acc + c.verifiedDestinationsCount, 0)}
            </div>
            <span className="text-[11px] text-slate-500">Con gobernanza regional</span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-[#1E293B]/50 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Filtrar por Estado:</span>
          {["ALL", "ACTIVE", "CONFIGURING", "PILOT", "PLANNED", "PAUSED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterStatus === st
                  ? "bg-[#165D6F] text-white shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st === "ALL" ? "Todos los Países" : st}
            </button>
          ))}
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCountries.map((country) => (
            <div
              key={country.code}
              className={`bg-[#1E293B]/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                country.status === "ACTIVE"
                  ? "border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                  : country.status === "CONFIGURING"
                  ? "border-amber-500/40"
                  : "border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {country.code}
                    </span>
                    <h3 className="font-bold text-lg text-white">{country.name}</h3>
                  </div>
                  {getStatusBadge(country.status)}
                </div>

                <p className="text-xs text-slate-400 mb-4">{country.officialName}</p>

                {/* Territorial Config & Currencies */}
                <div className="bg-[#0F172A]/70 rounded-xl p-3 space-y-1.5 text-xs text-slate-300 border border-slate-800/60 font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Moneda Principal:</span>
                    <span className="text-emerald-400 font-bold">{country.defaultCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Idioma Base:</span>
                    <span className="text-slate-200">{country.defaultLocale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nivel 1:</span>
                    <span className="text-slate-200 font-sans">{country.territorialStructure.level1Label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nivel 2:</span>
                    <span className="text-slate-200 font-sans">{country.territorialStructure.level2Label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zona Horaria:</span>
                    <span className="text-slate-400">{country.timezone}</span>
                  </div>
                </div>

                {/* Capability Matrix Badges */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Capacidades Habilitadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className={`px-2 py-0.5 rounded ${country.capabilities.destinations ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                      Destinos {country.capabilities.destinations ? "✓" : "✗"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${country.capabilities.businesses ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                      Negocios {country.capabilities.businesses ? "✓" : "✗"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${country.capabilities.reservations ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                      Reservas {country.capabilities.reservations ? "✓" : "✗"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${country.capabilities.onlinePayments ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-500"}`}>
                      Pagos {country.capabilities.onlinePayments ? "✓" : "✗"}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${country.capabilities.aiAssistant ? "bg-sky-950/60 text-sky-300 border border-sky-800" : "bg-slate-800 text-slate-500"}`}>
                      Baqueano AI {country.capabilities.aiAssistant ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCountry(country)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
                >
                  Configuración & SOS
                </button>

                {country.code !== "NI" ? (
                  <div className="flex items-center gap-1.5">
                    {country.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleStatusChange(country.code, "PAUSED")}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 text-xs font-bold rounded-lg transition-all border border-rose-700"
                        title="Pausar tráfico público de este país inmediatamente"
                      >
                        Pausar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(country.code, "ACTIVE")}
                        disabled={isUpdating}
                        className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded-lg transition-all border border-emerald-700"
                      >
                        Activar
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-bold">Núcleo Central</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Dialog for Country Detail & Emergency Info */}
        {selectedCountry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {selectedCountry.code}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedCountry.name} — Parámetros Territoriales</h3>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">📞 Protocolos de Emergencia & SOS País:</h4>
                  <p><span className="text-slate-400">Emergencia Nacional:</span> <span className="font-mono font-bold text-rose-400">{selectedCountry.emergencyInfo.nationalEmergencyPhone}</span></p>
                  <p><span className="text-slate-400">Policía:</span> <span className="font-mono">{selectedCountry.emergencyInfo.policePhone}</span></p>
                  <p><span className="text-slate-400">Cruz Roja / Paramédicos:</span> <span className="font-mono">{selectedCountry.emergencyInfo.redCrossPhone}</span></p>
                  <p><span className="text-slate-400">Fecha de Verificación de Datos:</span> {new Date(selectedCountry.emergencyInfo.verifiedAt).toLocaleDateString()}</p>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">📍 Coordenadas y Límites Cartográficos:</h4>
                  <p><span className="text-slate-400">Centro del Mapa:</span> {selectedCountry.mapCenterCoordinates.latitude}° N, {selectedCountry.mapCenterCoordinates.longitude}° W</p>
                  <p><span className="text-slate-400">Zoom Inicial:</span> Nivel {selectedCountry.mapCenterCoordinates.defaultZoom}</p>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">🏷️ Estructura Administrativa Territorial:</h4>
                  <p><span className="text-slate-400">Nivel 1:</span> {selectedCountry.territorialStructure.level1Label}</p>
                  <p><span className="text-slate-400">Nivel 2:</span> {selectedCountry.territorialStructure.level2Label}</p>
                  {selectedCountry.territorialStructure.hasIndigenousTerritories && (
                    <p><span className="text-slate-400">Reconocimiento Indígena:</span> {selectedCountry.territorialStructure.indigenousTerritoryLabel || "Sí"}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
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
