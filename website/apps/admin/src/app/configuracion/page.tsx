"use client";

import { useState } from "react";
import { Search, Settings, ToggleLeft, Globe, Shield, Database } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialConfigKeys = [
  { id: "cfg-maintenance", key: "MAINTENANCE_MODE", value: "false", type: "boolean", category: "System" },
  { id: "cfg-api-version", key: "API_TARGET_VERSION", value: "v2.1", type: "string", category: "Network" },
  { id: "cfg-max-upload", key: "MAX_UPLOAD_SIZE_MB", value: "50", type: "number", category: "Storage" },
  { id: "cfg-auth-strict", key: "REQUIRE_2FA_ADMINS", value: "true", type: "boolean", category: "Security" }
];

export default function ConfiguracionAdminPage() {
  const [configs] = useState(initialConfigKeys);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "System": return <Settings size={14} className="text-[#165D6F]" />;
      case "Network": return <Globe size={14} className="text-[#F65E01]" />;
      case "Security": return <Shield size={14} className="text-[#10B981]" />;
      case "Storage": return <Database size={14} className="text-[#F4E6C1]" />;
      default: return <Settings size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Configuración del Sistema</h1>
          <p className="font-tech text-sm text-white/60">Variables de entorno dinámicas, toggles de mantenimiento y parámetros globales.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por clave de configuración o categoría..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Variable (Key)</AdminTableHead>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Tipo de Dato</AdminTableHead>
              <AdminTableHead>Valor Actual</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {configs.map((conf) => (
              <AdminTableRow key={conf.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white">
                      <Settings size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-tech font-bold text-white tracking-wider">{conf.key}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{conf.id}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    {getCategoryIcon(conf.category)}
                    <span className="text-sm">{conf.category}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant="neutral">
                    {conf.type}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  {conf.type === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <ToggleLeft size={18} className={conf.value === "true" ? "text-[#10B981]" : "text-slate-500"} />
                      <span className={conf.value === "true" ? "text-[#10B981] font-bold" : "text-slate-500"}>{conf.value}</span>
                    </div>
                  ) : (
                    <span className="font-mono text-[#F4E6C1] bg-black/50 px-2 py-1 rounded text-sm">{conf.value}</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <span className="text-xs text-[#F65E01] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    Modificar
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
