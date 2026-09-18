"use client";

import { useState } from "react";
import { Search, MapPin, ShieldCheck, Map, Image as ImageIcon } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

// Mock data (since Departments are mostly static or fetched from external APIs in some systems)
const initialDepartments = [
  { id: "dep-leon", name: "León", region: "Pacífico", status: "active", tourismPoints: 24, safeStatus: "high" },
  { id: "dep-managua", name: "Managua", region: "Pacífico", status: "active", tourismPoints: 45, safeStatus: "medium" },
  { id: "dep-granada", name: "Granada", region: "Pacífico", status: "active", tourismPoints: 31, safeStatus: "high" },
  { id: "dep-esteli", name: "Estelí", region: "Norte", status: "active", tourismPoints: 18, safeStatus: "high" },
  { id: "dep-rivas", name: "Rivas", region: "Pacífico", status: "active", tourismPoints: 29, safeStatus: "high" },
  { id: "dep-matagalpa", name: "Matagalpa", region: "Norte", status: "active", tourismPoints: 21, safeStatus: "high" },
  { id: "dep-racn", name: "RACN", region: "Caribe", status: "maintenance", tourismPoints: 8, safeStatus: "medium" }
];

export default function DepartamentosAdminPage() {
  const [departments] = useState(initialDepartments);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Departamentos & Regiones</h1>
          <p className="font-tech text-sm text-white/60">Administra la configuración territorial de 15 departamentos y 2 regiones autónomas.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o región..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Departamento</AdminTableHead>
              <AdminTableHead>Región</AdminTableHead>
              <AdminTableHead>Atractivos</AdminTableHead>
              <AdminTableHead>Seguridad Turística</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Media</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {departments.map((dep) => (
              <AdminTableRow key={dep.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165D6F]/20 text-[#165D6F]">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{dep.name}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{dep.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Map size={14} className="text-[#F65E01]" />
                    <span>{dep.region}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-tech text-sm text-[#F4E6C1]">{dep.tourismPoints} Destinos</span>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={dep.safeStatus === "high" ? "green" : "orange"}>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={12} />
                      {dep.safeStatus === "high" ? "Óptima" : "Precaución"}
                    </div>
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={dep.status === "active" ? "green" : "neutral"}>
                    {dep.status === "active" ? "Activo" : "Mantenimiento"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <button className="rounded p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                    <ImageIcon size={18} />
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
