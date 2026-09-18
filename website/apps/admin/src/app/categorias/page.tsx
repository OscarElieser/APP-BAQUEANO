"use client";

import { useState } from "react";
import { Search, Tags, Compass, Mountain, Utensils, Hotel } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialCategories = [
  { id: "cat-adventure", name: "Aventura", type: "Destino", icon: Compass, count: 45, status: "active" },
  { id: "cat-nature", name: "Naturaleza", type: "Destino", icon: Mountain, count: 120, status: "active" },
  { id: "cat-food", name: "Gastronomía", type: "Negocio", icon: Utensils, count: 85, status: "active" },
  { id: "cat-lodging", name: "Hospedaje", type: "Negocio", icon: Hotel, count: 64, status: "active" }
];

export default function CategoriasAdminPage() {
  const [categories] = useState(initialCategories);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Categorías y Taxonomía</h1>
          <p className="font-tech text-sm text-white/60">Gestión de etiquetas y categorías maestras del ecosistema.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar categoría o tipo..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Tipo (Entidad)</AdminTableHead>
              <AdminTableHead>Elementos</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {categories.map((cat) => (
              <AdminTableRow key={cat.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165D6F]/20 text-[#165D6F]">
                      <cat.icon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{cat.name}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{cat.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Tags size={14} className="text-[#F65E01]" />
                    <span className="text-sm">{cat.type}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-tech text-sm text-[#F4E6C1]">{cat.count} indexados</span>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={cat.status === "active" ? "green" : "neutral"}>
                    {cat.status === "active" ? "Activa" : "Inactiva"}
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
