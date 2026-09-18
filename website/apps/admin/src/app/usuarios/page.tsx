"use client";

import { useEffect, useState } from "react";
import { listUsersForAdmin, updateUserRole } from "@baqueano/firebase";
import type { BaqueanoUser, UserRole } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { Search, Shield, User, Building, ShieldAlert } from "lucide-react";

export default function UsuariosPage() {
  const [users, setUsers] = useState<readonly BaqueanoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await listUsersForAdmin();
    setUsers(res.items);
    setLoading(false);
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error al actualizar el rol del usuario.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin": return <ShieldAlert size={14} className="text-red-400" />;
      case "admin": return <Shield size={14} className="text-[#F65E01]" />;
      case "host": return <Building size={14} className="text-blue-400" />;
      default: return <User size={14} className="text-slate-400" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin": return "red";
      case "admin": return "orange";
      case "host": return "blue";
      default: return "neutral";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Usuarios y Roles</h1>
          <p className="font-tech text-sm text-white/60">Gestiona los accesos, permisos y perfiles de los usuarios de Baqueano.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar usuario por correo, nombre o ID..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Usuario</AdminTableHead>
              <AdminTableHead>ID de Registro</AdminTableHead>
              <AdminTableHead>Rol Actual</AdminTableHead>
              <AdminTableHead>Fecha de Creación</AdminTableHead>
              <AdminTableHead className="text-right">Cambiar Rol</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  Cargando red de usuarios...
                </AdminTableCell>
              </AdminTableRow>
            ) : users.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  No hay usuarios registrados en el sistema.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              users.map((user) => (
                <AdminTableRow key={user.id} className="group hover:bg-slate-800/50 transition-colors">
                  <AdminTableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{user.displayName || "Usuario sin nombre"}</span>
                      <span className="font-tech text-xs text-slate-400">{user.email}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="font-tech text-xs text-slate-500">{user.id}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge variant={getRoleBadgeVariant(user.role)}>
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role.replace("_", " ")}</span>
                      </div>
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="text-sm text-slate-400">
                      {new Date(user.createdAtIso).toLocaleDateString("es-NI")}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <select
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-[#165D6F] focus:border-[#165D6F] block w-full p-2 outline-none cursor-pointer disabled:opacity-50 transition-all"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updatingId === user.id}
                    >
                      <option value="explorer">Explorer</option>
                      <option value="host">Host</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
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
