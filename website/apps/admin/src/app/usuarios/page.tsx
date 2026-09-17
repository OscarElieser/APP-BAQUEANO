/**
 * WHY
 * Supports secure role assignment and user oversight.
 *
 * HOW
 * Presents the four required roles and their operational limits.
 *
 * WHAT
 * Users and roles administration route.
 */
import { roleAccess } from "@baqueano/config";
import { AdminPanel } from "../../components/AdminCards";

export default function UsuariosPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Usuarios y roles</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Object.entries(roleAccess).map(([role, modules]) => (
          <AdminPanel key={role} title={role}>
            <p className="text-sm text-white/60">{modules.length} modulos autorizados segun minimo privilegio.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {modules.slice(0, 8).map((module) => <span key={module} className="rounded-full bg-white/10 px-3 py-1 font-tech text-xs uppercase text-white/70">{module}</span>)}
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
