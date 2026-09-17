// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPERACIONES DE CAMPO & MANTENIMIENTO IOT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proporcionar una consola operativa móvil-first para guardaparques, técnicos
//   y baqueanos locales encargados del mantenimiento físico y preventivo
//   de la infraestructura de Smart Points y nodos de sensores IoT.
// - Asegura la resiliencia territorial, el reemplazo rápido de baterías y la
//   reparación de señalética QR/NFC dañada en reservas naturales sin intermediarios.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz reactiva en Next.js App Router optimizada para pantallas táctiles y móviles de campo.
// - Filtrado por estado (OPEN, ASSIGNED, IN_PROGRESS, DONE) y niveles de severidad/prioridad.
// - Registro de acciones de resolución con soporte para notas técnicas y geolocalización.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Panel de gestión de tareas de campo (FieldMaintenanceTask).
// - Botón de cambio de estado en un toque para personal en territorio.
// - Indicadores visuales de urgencia y acceso a guías de diagnóstico de hardware.
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getFieldTasks, completeFieldTask } from "../../services/smart-tourism.service";
import type { FieldMaintenanceTask } from "@baqueano/types";

export default function OperacionesCampoPage() {
  const [tasks, setTasks] = useState<FieldMaintenanceTask[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [selectedTask, setSelectedTask] = useState<FieldMaintenanceTask | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      const result = await getFieldTasks();
      setTasks([...result.items]);
    }
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchPriority = filterPriority === "ALL" || t.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const handleResolve = async (taskId: string) => {
    setIsResolving(true);
    const success = await completeFieldTask(taskId, resolutionNotes || "Completado exitosamente durante inspección en terreno.");
    if (success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "DONE",
                resolutionNotes: resolutionNotes || "Completado exitosamente durante inspección en terreno.",
                completedAt: new Date().toISOString()
              }
            : t
        )
      );
      setSelectedTask(null);
      setResolutionNotes("");
    }
    setIsResolving(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">Urgente</span>;
      case "high":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">Alta</span>;
      case "medium":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Media</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/40">Baja</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Resuelto</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">En Proceso</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/40">Asignado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Abierto</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 md:p-8">
      {/* Header & Breadcrumb */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#165D6F] font-semibold uppercase tracking-wider mb-1">
              <Link href="/smart-points" className="hover:underline">Smart Tourism</Link>
              <span>/</span>
              <span className="text-slate-400">Operaciones de Campo</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🛠️</span> Operaciones de Campo & Mantenimiento Territorial
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gestión de tickets técnicos, mantenimiento de nodos de telemetría y reposición de señalética física.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/smart-points"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              📍 Smart Points
            </Link>
            <Link
              href="/dispositivos"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              📡 Dispositivos IoT
            </Link>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Tareas Abiertas</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {tasks.filter((t) => t.status === "OPEN").length}
            </div>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">En Proceso / Campo</span>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length}
            </div>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Prioridad Urgente</span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {tasks.filter((t) => t.priority === "urgent" && t.status !== "DONE").length}
            </div>
          </div>
          <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Resueltas (Histórico)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {tasks.filter((t) => t.status === "DONE").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1E293B]/50 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Estado:</span>
            {["ALL", "OPEN", "IN_PROGRESS", "DONE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === st
                    ? "bg-[#165D6F] text-white"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "ALL" ? "Todos" : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 ml-auto">
            <span className="font-semibold text-slate-400">Prioridad:</span>
            {["ALL", "urgent", "high", "medium", "low"].map((pr) => (
              <button
                key={pr}
                onClick={() => setFilterPriority(pr)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterPriority === pr
                    ? "bg-[#F65E01] text-white"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {pr === "ALL" ? "Todas" : pr.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-[#1E293B]/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                task.status === "DONE"
                  ? "border-slate-800 opacity-70"
                  : task.priority === "urgent"
                  ? "border-rose-500/50 shadow-lg shadow-rose-950/20"
                  : "border-slate-700/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{task.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {task.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                <h3 className="font-bold text-base text-white mb-2">{task.title}</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">{task.description}</p>

                <div className="bg-[#0F172A]/70 rounded-xl p-3 space-y-1.5 text-xs text-slate-300 border border-slate-800/60 font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Smart Point:</span>
                    <span className="text-slate-200 font-sans">{task.smartPointCode} ({task.smartPointId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Territorio:</span>
                    <span className="text-slate-200 font-sans">{task.territoryId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asignado a:</span>
                    <span className="text-slate-200 font-sans">{task.assignedToName ? `${task.assignedToName} (${task.assignedToRole ?? "Técnico"})` : "Sin asignar"}</span>
                  </div>
                  {task.completedAt && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Resuelto el:</span>
                      <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Creado: {new Date(task.createdAt).toLocaleDateString()}
                </span>

                {task.status !== "DONE" ? (
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>✓</span> Resolver Tarea
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">Completada con éxito</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 bg-[#1E293B]/30 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No se encontraron tareas con los filtros seleccionados.</p>
          </div>
        )}

        {/* Modal / Dialog for Resolution */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Completar Tarea de Mantenimiento</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p><span className="font-semibold text-white">Tarea:</span> {selectedTask.title}</p>
                <p><span className="font-semibold text-white">Punto:</span> {selectedTask.smartPointCode}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Notas de inspección y evidencia técnica:
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Ej: Batería LiFePO4 reemplazada. Firmware calibrado a v1.4.2. Voltaje verificado en 3.75V..."
                  rows={4}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleResolve(selectedTask.id)}
                  disabled={isResolving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isResolving ? "Guardando..." : "Confirmar Resolución"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
