import { listUsersForAdmin } from "@baqueano/firebase";
import type { BaqueanoUser, UserRole } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { Users, Search, ShieldAlert, ShieldCheck } from "lucide-react";

export default async function UsuariosPage() {
  const result = await listUsersForAdmin();
  const usuarios = result.items;

  const roleColors: Record<UserRole, "green" | "orange" | "red" | "default"> = {
    super_admin: "red",
    admin: "orange",
    host: "green",
    auditor: "default",
    explorer: "default"
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 drop-shadow-md">Gestión de Usuarios (RBAC)</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Administra identidades, otorga roles de seguridad (Custom Claims) y fiscaliza los accesos al sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md bg-[#061018] border border-white/10 px-3 py-2 text-white/50 text-sm">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Buscar email..." className="bg-transparent outline-none w-48 text-white placeholder:text-white/30" />
          </div>
        </div>
      </div>

      {/* WARNING DE CONEXIÓN */}
      {!result.isConnected && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Atención: Operando en modo local. Las mutaciones de RBAC no impactarán en Firebase Auth. {result.warning}
          </p>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Usuario</AdminTableHead>
              <AdminTableHead>Rol (RBAC)</AdminTableHead>
              <AdminTableHead>Entidad Asociada</AdminTableHead>
              <AdminTableHead>Fecha de Registro</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {usuarios.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={4} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Users className="w-12 h-12 opacity-20" />
                    <p>No se encontraron usuarios registrados.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              usuarios.map((usuario: BaqueanoUser) => (
                <AdminTableRow key={usuario.id} className="group hover:bg-slate-800/50 transition-colors">
                  <AdminTableCell className="font-medium text-slate-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{usuario.displayName || "Usuario sin nombre"}</span>
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{usuario.email}</span>
                      <span className="text-[10px] text-slate-500 font-mono">UID: {usuario.id}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={roleColors[usuario.role]} className="flex items-center gap-1.5 w-max">
                      <ShieldCheck className="w-3 h-3" />
                      {usuario.role.toUpperCase()}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell className="text-slate-300">
                    {usuario.businessId ? (
                      <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono border border-slate-700">
                        {usuario.businessId}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Ninguna</span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="text-slate-400 text-sm">
                    {new Date(usuario.createdAtIso).toLocaleDateString()}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
