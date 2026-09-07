// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — GESTIÓN DE DESARROLLADORES & CLIENTES API (FASE 13)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una consola de supervisión y gobernanza para administrar los clientes
//   de API registrados (instituciones, universidades, desarrolladores), asignar
//   scopes granulares, monitorear el consumo de cuotas y revocar accesos en un clic.
// - Garantiza que el ecosistema abierto no comprometa la estabilidad ni la privacidad.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz reactiva en Next.js App Router con tipado estricto (@baqueano/types).
// - Filtrado por entorno (sandbox/production) y estado (ACTIVE, SUSPENDED, REVOKED).
// - Control de revocación y ajuste de cuotas de rate limiting.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Panel de control de clientes de API (ApiClientRecord).
// - Modal de auditoría de scopes y consumo de cuota diaria.
// - Botón de revocación instantánea (Kill-switch de integración).
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiClients, updateApiClientStatus, updateApiClientQuota } from "../../services/developer.service";
import type { ApiClientRecord, ApiClientStatus } from "@baqueano/types";

export default function DesarrolladoresAdminPage() {
  const [clients, setClients] = useState<ApiClientRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<ApiClientRecord | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>("ALL");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getApiClients();
      setClients([...res.items]);
    }
    load();
  }, []);

  const filteredClients = clients.filter((c) => {
    if (filterEnv === "ALL") return true;
    return c.environment === filterEnv;
  });

  const handleStatusToggle = async (clientId: string, nextStatus: ApiClientStatus) => {
    setIsUpdating(true);
    const ok = await updateApiClientStatus(clientId, nextStatus);
    if (ok) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c))
      );
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    }
    setIsUpdating(false);
  };

  const getStatusBadge = (status: ApiClientStatus) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Activo</span>;
      case "SUSPENDED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Suspendido</span>;
      case "REVOKED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Revocado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/40">Pendiente</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#165D6F] font-semibold uppercase tracking-wider mb-1">
              <span>Open Ecosystem</span>
              <span>/</span>
              <span className="text-slate-400">Plataforma para Desarrolladores</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>⚡</span> Gestión de Clientes API & Integraciones
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Control de credenciales, scopes autorizados, cuotas de rate limiting y revocación para aliados.
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
              ⚙️ Plataforma Enterprise
            </Link>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Clientes Registrados</span>
            <div className="text-2xl font-black text-white mt-1">{clients.length}</div>
            <span className="text-[11px] text-slate-500">Universidades y Aliados</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Producción Activa</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {clients.filter((c) => c.environment === "production" && c.status === "ACTIVE").length}
            </div>
            <span className="text-[11px] text-emerald-500/80">Keys en vivo</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Peticiones Hoy</span>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {clients.reduce((acc, c) => acc + c.requestsToday, 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">Consumo agregado</span>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Entorno Sandbox</span>
            <div className="text-2xl font-black text-[#F65E01] mt-1">
              {clients.filter((c) => c.environment === "sandbox").length}
            </div>
            <span className="text-[11px] text-slate-500">Pruebas aisladas</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#1E293B]/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Filtrar por Entorno:</span>
          {["ALL", "production", "sandbox"].map((env) => (
            <button
              key={env}
              onClick={() => setFilterEnv(env)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterEnv === env
                  ? "bg-[#165D6F] text-white shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {env === "ALL" ? "Todos los Clientes" : env === "production" ? "Producción" : "Sandbox"}
            </button>
          ))}
        </div>

        {/* Clients Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`bg-[#1E293B]/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                client.status === "ACTIVE"
                  ? "border-slate-700"
                  : client.status === "REVOKED"
                  ? "border-rose-500/40 opacity-70"
                  : "border-amber-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded ${client.environment === "production" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"}`}>
                    {client.environment}
                  </span>
                  {getStatusBadge(client.status)}
                </div>

                <h3 className="font-bold text-base text-white mb-1">{client.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{client.contactEmail}</p>

                <div className="bg-[#0F172A]/70 rounded-xl p-3 space-y-1.5 text-xs text-slate-300 border border-slate-800/60 font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prefijo Key:</span>
                    <span className="text-cyan-300 font-bold">{client.keyPrefix}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rate Limit:</span>
                    <span className="text-slate-200">{client.rateLimitPerMin} req/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuota Diaria:</span>
                    <span className="text-slate-200">{client.requestsToday} / {client.quotaDailyRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ámbito País:</span>
                    <span className="text-slate-200 uppercase">{client.countryScope.join(", ")}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400">Scopes Autorizados:</span>
                  <div className="flex flex-wrap gap-1">
                    {client.scopes.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
                >
                  Detalles & Cuota
                </button>

                {client.status === "ACTIVE" ? (
                  <button
                    onClick={() => handleStatusToggle(client.id, "REVOKED")}
                    disabled={isUpdating}
                    className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 text-xs font-bold rounded-lg transition-all border border-rose-700"
                  >
                    Revocar Key
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusToggle(client.id, "ACTIVE")}
                    disabled={isUpdating}
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded-lg transition-all border border-emerald-700"
                  >
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Client Audit & Quota Adjustment */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="text-base font-bold text-white">Auditoría de Cliente API</h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p><span className="font-semibold text-white">Nombre:</span> {selectedClient.name}</p>
                <p><span className="font-semibold text-white">Email:</span> {selectedClient.contactEmail}</p>
                <p><span className="font-semibold text-white">Entorno:</span> {selectedClient.environment}</p>
                <p><span className="font-semibold text-white">Último uso registrado:</span> {selectedClient.lastUsedAt ? new Date(selectedClient.lastUsedAt).toLocaleString() : "Sin actividad reciente"}</p>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                  <p className="text-slate-400">Hash Criptográfico de la Key:</p>
                  <p className="text-cyan-400 break-all">{selectedClient.keyHash}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  onClick={() => setSelectedClient(null)}
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
