/**
 * WHY
 * Keeps every planned administration module navigable from phase one.
 *
 * HOW
 * Renders a consistent workbench with CRUD, validation, audit, and Firestore readiness cues.
 *
 * WHAT
 * Reusable placeholder for modules awaiting specialized forms and tables.
 */
import { Database, FileCheck, LockKeyhole, ShieldCheck } from "lucide-react";

const checks = [
  { label: "Firestore collection", icon: Database },
  { label: "Zod validation", icon: FileCheck },
  { label: "RBAC route guard", icon: LockKeyhole },
  { label: "Audit trail", icon: ShieldCheck }
] as const;

export function ModulePlaceholder({ title, collection }: { title: string; collection: string }) {
  return (
    <div>
      <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">Modulo administrativo</p>
      <h1 className="mt-2 font-display text-3xl font-black text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
        Preparado para gestionar la coleccion `{collection}` con permisos por rol, validacion defensiva y registros de auditoria.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {checks.map((check) => (
          <article key={check.label} className="admin-surface p-5">
            <check.icon size={22} className="text-[#10B981]" />
            <h2 className="mt-4 font-display text-lg font-black text-white">{check.label}</h2>
            <p className="mt-2 text-xs leading-5 text-white/56">Pendiente de conectar a datos vivos en la siguiente fase de integracion.</p>
          </article>
        ))}
      </div>
    </div>
  );
}
