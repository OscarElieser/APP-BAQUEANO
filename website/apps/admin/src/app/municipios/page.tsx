"use client";

import { useState } from "react";
import { Search, MapPin, Building, Flag, ShieldAlert } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialMunicipios = [
  { id: "mun-somoto", name: "Somoto", department: "Madriz", isCapital: true, status: "active" },
  { id: "mun-san-juan", name: "San Juan del Sur", department: "Rivas", isCapital: false, status: "active" },
  { id: "mun-granada", name: "Granada", department: "Granada", isCapital: true, status: "active" },
  { id: "mun-el-castillo", name: "El Castillo", department: "Río San Juan", isCapital: false, status: "warning" },
  { id: "mun-corn-island", name: "Corn Island", department: "RACN", isCapital: false, status: "active" }
];

export default function MunicipiosAdminPage() {
  const [municipios] = useState(initialMunicipios);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Municipios</h1>
          <p className="font-tech text-sm text-white/60">Gestión de 153 municipios, cabeceras departamentales y micro-territorios.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar municipio o departamento..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Municipio</AdminTableHead>
              <AdminTableHead>Departamento</AdminTableHead>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Estado General</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {municipios.map((mun) => (
              <AdminTableRow key={mun.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F65E01]/20 text-[#F65E01]">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{mun.name}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{mun.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building size={14} className="text-[#165D6F]" />
                    <span>{mun.department}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  {mun.isCapital ? (
                    <AdminBadge variant="blue">
                      <div className="flex items-center gap-1">
                        <Flag size={12} />
                        Cabecera
                      </div>
                    </AdminBadge>
                  ) : (
                    <span className="text-slate-400 text-sm">Municipio Regular</span>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={mun.status === "active" ? "green" : "red"}>
                    <div className="flex items-center gap-1">
                      {mun.status === "active" ? "Activo" : <><ShieldAlert size={12} /> Alerta</>}
                    </div>
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
