"use client";

import { useEffect, useState } from "react";
import { listPaymentOrdersForAdmin } from "@baqueano/firebase";
import type { PaymentOrderRecord } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { Search, DollarSign, Calendar, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export default function PagosPage() {
  const [orders, setOrders] = useState<readonly PaymentOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await listPaymentOrdersForAdmin();
    setOrders(res.items);
    setLoading(false);
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Pagada", color: "green", icon: <CheckCircle className="w-3 h-3" /> } as const;
      case "failed":
        return { label: "Fallida", color: "red", icon: <AlertTriangle className="w-3 h-3" /> } as const;
      case "refunded":
        return { label: "Reembolsada", color: "neutral", icon: <XCircle className="w-3 h-3" /> } as const;
      case "pending":
      default:
        return { label: "Pendiente", color: "orange", icon: <Clock className="w-3 h-3" /> } as const;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Ã“rdenes de Pago y Liquidaciones</h1>
          <p className="font-tech text-sm text-white/60">Monitoreo de transacciones y estado de pagos en la plataforma.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por ID de orden o de transacciÃ³n..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Orden</AdminTableHead>
              <AdminTableHead>Usuario</AdminTableHead>
              <AdminTableHead>Monto</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">TransacciÃ³n</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  Cargando Ã³rdenes de pago...
                </AdminTableCell>
              </AdminTableRow>
            ) : orders.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  No hay Ã³rdenes registradas en el sistema.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);

                return (
                  <AdminTableRow key={order.id} className="group hover:bg-slate-800/50 transition-colors">
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[#165D6F]" />
                          <span className="font-semibold text-white">ID: {order.id.split("-")[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={12} />
                          <span className="text-xs">{new Date(order.createdAt).toLocaleDateString("es-NI")}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="font-tech text-xs text-slate-300">
                        {order.createdByUid.split("-")[0] || "Guest"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1 text-slate-200 font-mono text-base">
                        <DollarSign size={14} className="text-[#165D6F]" />
                        <span>{order.amountUsd.toFixed(2)} USD</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={statusConfig.color}>
                        <div className="flex items-center gap-1.5">
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-tech text-xs text-slate-400">
                          { "Sin TransacciÃ³n"}
                        </span>
                        <span className="text-xs text-[#F65E01] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          Ver Detalles
                        </span>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
