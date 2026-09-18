"use client";

import { useState } from "react";
import { Search, ChefHat, MapPin, Star } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialPlates = [
  { id: "gastro-gallo-pinto", name: "Gallo Pinto", origin: "Nacional", type: "Plato Principal", status: "published" },
  { id: "gastro-nacatamal", name: "Nacatamal", origin: "Nacional", type: "Plato Principal", status: "published" },
  { id: "gastro-rondón", name: "Rondón", origin: "Caribe", type: "Plato Principal", status: "published" },
  { id: "gastro-quesillo", name: "Quesillo", origin: "León/Nagarote", type: "Comida Rápida", status: "draft" }
];

export default function GastronomiaAdminPage() {
  const [plates] = useState(initialPlates);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Directorio Gastronómico</h1>
          <p className="font-tech text-sm text-white/60">Gestión de platillos típicos, rutas culinarias y su origen geográfico.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por platillo, origen o tipo..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Platillo</AdminTableHead>
              <AdminTableHead>Origen / Región</AdminTableHead>
              <AdminTableHead>Clasificación</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {plates.map((plate) => (
              <AdminTableRow key={plate.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F65E01]/20 text-[#F65E01]">
                      <ChefHat size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{plate.name}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{plate.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={14} className="text-[#165D6F]" />
                    <span className="text-sm">{plate.origin}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Star size={14} className="text-[#F4E6C1]" />
                    <span className="font-tech text-sm">{plate.type}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={plate.status === "published" ? "green" : "neutral"}>
                    {plate.status === "published" ? "Publicado" : "Borrador"}
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
