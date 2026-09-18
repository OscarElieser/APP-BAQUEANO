"use client";

import { useState } from "react";
import { Search, Music, Users, Camera, Palette } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialCultureRecords = [
  { id: "cult-gueguense", title: "El Güegüense", type: "Patrimonio", region: "Diriamba", status: "published" },
  { id: "cult-mayo-ya", title: "Palo de Mayo", type: "Danza", region: "Bluefields", status: "published" },
  { id: "cult-griteria", title: "La Gritería", type: "Tradición", region: "Nacional", status: "published" },
  { id: "cult-artesania", title: "Cerámica Negra", type: "Artesanía", region: "Jinotega", status: "draft" }
];

export default function CulturaAdminPage() {
  const [records] = useState(initialCultureRecords);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Cultura y Tradiciones</h1>
          <p className="font-tech text-sm text-white/60">Gestión de patrimonio inmaterial, mitos, leyendas y expresiones folclóricas.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por título, tipo o región..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Registro Cultural</AdminTableHead>
              <AdminTableHead>Clasificación</AdminTableHead>
              <AdminTableHead>Origen / Región</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {records.map((rec) => (
              <AdminTableRow key={rec.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E6C1]/20 text-[#F4E6C1]">
                      <Palette size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{rec.title}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{rec.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Music size={14} className="text-[#165D6F]" />
                    <span>{rec.type}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users size={14} className="text-slate-500" />
                    <span>{rec.region}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={rec.status === "published" ? "green" : "neutral"}>
                    {rec.status === "published" ? "Publicado" : "Borrador"}
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
