"use client";

import { useEffect, useState } from "react";
import { listAuditLogs } from "@baqueano/firebase";
import type { AuditLog } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { Search, Activity, ShieldAlert, FileCode2, Clock } from "lucide-react";

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<readonly AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await listAuditLogs(100);
      setLogs(res.items);
      setLoading(false);
    }
    load();
  }, []);

  const getActionConfig = (action: string) => {
    switch (action) {
      case "CREATE": return { color: "green", label: "Creación" } as const;
      case "UPDATE": return { color: "blue", label: "Actualización" } as const;
      case "DELETE": return { color: "red", label: "Eliminación" } as const;
      case "PUBLISH": return { color: "orange", label: "Publicación" } as const;
      case "ARCHIVE": return { color: "neutral", label: "Archivado" } as const;
      default: return { color: "neutral", label: action } as const;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Control Tower & Auditoría</h1>
          <p className="font-tech text-sm text-white/60">Monitoreo global de actividad, logs inmutables y trazabilidad del sistema.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por Actor, ID o Colección..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Fecha / Hora</AdminTableHead>
              <AdminTableHead>Actor</AdminTableHead>
              <AdminTableHead>Acción</AdminTableHead>
              <AdminTableHead>Recurso Afectado</AdminTableHead>
              <AdminTableHead className="text-right">Detalles</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  Cargando bitácora de auditoría...
                </AdminTableCell>
              </AdminTableRow>
            ) : logs.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  No hay eventos de auditoría registrados.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              logs.map((log) => {
                const actionConfig = getActionConfig(log.action);
                const date = new Date(log.createdAtIso);

                return (
                  <AdminTableRow key={log.id} className="group hover:bg-slate-800/50 transition-colors">
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white">
                          <Activity size={14} className="text-[#165D6F]" />
                          <span className="font-tech text-sm">{date.toLocaleDateString("es-NI")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <span className="font-tech text-xs">{date.toLocaleTimeString("es-NI")}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{log.actorEmail}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <ShieldAlert size={12} className={log.actorRole === "super_admin" ? "text-red-400" : "text-blue-400"} />
                          <span className="font-tech text-xs text-slate-400 capitalize">{log.actorRole.replace("_", " ")}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={actionConfig.color}>
                        {actionConfig.label}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <span className="font-tech text-sm text-[#F65E01] uppercase tracking-wider">{log.collection}</span>
                        <span className="font-tech text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={log.documentId}>
                          {log.documentId}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <div className="flex justify-end text-slate-400 group-hover:text-white transition-colors cursor-pointer">
                        <FileCode2 size={18} />
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
