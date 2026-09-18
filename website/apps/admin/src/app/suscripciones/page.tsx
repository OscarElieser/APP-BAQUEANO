"use client";

import { useState } from "react";
import { Search, CreditCard, ShieldCheck, Crown, CalendarClock } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialSubscriptions = [
  { id: "sub-bus-001", business: "Hotel Selva Negra", tier: "Premium", status: "active", expiresAt: "2026-12-31" },
  { id: "sub-bus-002", business: "Restaurante El Timón", tier: "Pro", status: "active", expiresAt: "2026-10-15" },
  { id: "sub-bus-003", business: "Tour Operadora Volcán", tier: "Free", status: "active", expiresAt: "N/A" },
  { id: "sub-bus-004", business: "Hostal Ometepe", tier: "Pro", status: "suspended", expiresAt: "2026-08-01" }
];

export default function SuscripcionesAdminPage() {
  const [subs] = useState(initialSubscriptions);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Suscripciones B2B</h1>
          <p className="font-tech text-sm text-white/60">Monitoreo de membresías de negocios (Free, Pro, Premium) y estado de facturación.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por negocio o ID de suscripción..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Suscripción / Negocio</AdminTableHead>
              <AdminTableHead>Nivel (Tier)</AdminTableHead>
              <AdminTableHead>Vencimiento</AdminTableHead>
              <AdminTableHead>Estado Financiero</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {subs.map((sub) => (
              <AdminTableRow key={sub.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4E6C1]/10 text-[#F4E6C1]">
                      <CreditCard size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{sub.business}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{sub.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={
                    sub.tier === "Premium" ? "orange" :
                    sub.tier === "Pro" ? "blue" : "neutral"
                  }>
                    <div className="flex items-center gap-1">
                      {sub.tier === "Premium" ? <Crown size={12} /> : <ShieldCheck size={12} />}
                      {sub.tier}
                    </div>
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CalendarClock size={14} className="text-[#165D6F]" />
                    <span className="font-tech text-sm">{sub.expiresAt}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={sub.status === "active" ? "green" : "red"}>
                    {sub.status === "active" ? "Al Día (Activo)" : "Suspendida / Mora"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <span className="text-xs text-[#F65E01] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    Gestionar
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
