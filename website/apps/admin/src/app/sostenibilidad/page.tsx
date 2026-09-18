"use client";

import { useState } from "react";
import { Search, TreePine, Recycle, Sun, CloudRain } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialSustainabilityProjects = [
  { id: "sost-reforestacion", project: "Reforestación Bosawás", impact: "Alto", metric: "+10,000 árboles", status: "active" },
  { id: "sost-limpieza-playas", project: "Limpieza San Juan del Sur", impact: "Medio", metric: "2 toneladas", status: "completed" },
  { id: "sost-energia-limpia", project: "Paneles Solares Ometepe", impact: "Alto", metric: "50 kW", status: "active" },
  { id: "sost-agua", project: "Conservación Cuenca Sur", impact: "Crítico", metric: "Plan en desarrollo", status: "planning" }
];

export default function SostenibilidadAdminPage() {
  const [projects] = useState(initialSustainabilityProjects);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Sostenibilidad e Impacto</h1>
          <p className="font-tech text-sm text-white/60">Gestión de proyectos medioambientales y métricas de impacto ecológico.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por proyecto, impacto o estado..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Proyecto</AdminTableHead>
              <AdminTableHead>Nivel de Impacto</AdminTableHead>
              <AdminTableHead>Métrica Principal</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {projects.map((proj) => (
              <AdminTableRow key={proj.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981]">
                      <TreePine size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{proj.project}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{proj.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={
                    proj.impact === "Crítico" ? "red" : 
                    proj.impact === "Alto" ? "orange" : "blue"
                  }>
                    {proj.impact}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Recycle size={14} className="text-[#10B981]" />
                    <span className="text-sm font-tech">{proj.metric}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={
                    proj.status === "active" ? "green" : 
                    proj.status === "completed" ? "blue" : "neutral"
                  }>
                    {proj.status === "active" ? "En Ejecución" : proj.status === "completed" ? "Completado" : "En Planificación"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <span className="text-xs text-[#F65E01] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    Editar
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
