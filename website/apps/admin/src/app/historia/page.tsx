"use client";

import { useState } from "react";
import { Search, BookOpen, Clock, MapPin, Milestone } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialHistoryRecords = [
  { id: "hist-independencia", event: "Firma Acta de Independencia", year: "1821", category: "Independencia", status: "published" },
  { id: "hist-batalla-sanjacinto", event: "Batalla de San Jacinto", year: "1856", category: "Conflictos", status: "published" },
  { id: "hist-ruben-dario", event: "Nacimiento de Rubén Darío", year: "1867", category: "Literatura", status: "published" },
  { id: "hist-revolucion", event: "Revolución Popular", year: "1979", category: "Política", status: "draft" }
];

export default function HistoriaAdminPage() {
  const [records] = useState(initialHistoryRecords);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Historia y Línea de Tiempo</h1>
          <p className="font-tech text-sm text-white/60">Gestión de la línea de tiempo nacional y eventos históricos clave.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por evento, año o categoría..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Evento Histórico</AdminTableHead>
              <AdminTableHead>Año / Período</AdminTableHead>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {records.map((rec) => (
              <AdminTableRow key={rec.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E6C1]/10 text-[#F4E6C1]">
                      <BookOpen size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{rec.event}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{rec.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={14} className="text-[#F65E01]" />
                    <span className="font-mono text-sm">{rec.year}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Milestone size={14} className="text-[#165D6F]" />
                    <span className="text-sm">{rec.category}</span>
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
