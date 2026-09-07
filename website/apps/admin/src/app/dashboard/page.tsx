/**
 * WHY
 * Gives administrators an immediate health view of content, users, money, and impact.
 *
 * HOW
 * Uses dense KPI tiles and recent activity prepared for Firestore-backed snapshots.
 *
 * WHAT
 * Main dashboard for Baqueano Control Center.
 */
import { AlertTriangle, CreditCard, Leaf, MapPinned, Users } from "lucide-react";
import { AdminMetric, AdminPanel } from "../../components/AdminCards";

const activity = [
  "Destino Canon de Somoto actualizado para revision.",
  "Host Posada del Sol subio 6 fotografias nuevas.",
  "Usuario con rol host solicita validacion de negocio.",
  "Regla de conservacion agregada a Laguna de Apoyo."
] as const;

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">Vista general</p>
        <h1 className="font-display text-3xl font-black text-white">Operacion viva del ecosistema</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminMetric label="Destinos" value="42" detail="31 publicados, 8 en revision" icon={<MapPinned size={22} />} />
        <AdminMetric label="Usuarios" value="1.8k" detail="Exploradores, hosts y equipo interno" icon={<Users size={22} />} />
        <AdminMetric label="Pagos" value="$12.4k" detail="Reservas y suscripciones del mes" icon={<CreditCard size={22} />} />
        <AdminMetric label="Impacto" value="87%" detail="Indice compuesto de sostenibilidad" icon={<Leaf size={22} />} />
        <AdminMetric label="Incidencias" value="3" detail="Requieren seguimiento operativo" icon={<AlertTriangle size={22} />} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel title="Actividad reciente">
          <div className="grid gap-3">
            {activity.map((item) => <div key={item} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">{item}</div>)}
          </div>
        </AdminPanel>
        <AdminPanel title="RBAC activo">
          <div className="grid gap-2 text-sm text-white/70">
            {["super_admin: control completo", "admin: contenido y validaciones", "host: negocio propio", "explorer: datos personales"].map((item) => (
              <div key={item} className="rounded-md bg-[#10B981]/10 px-3 py-2 font-tech text-xs uppercase text-[#9EF1D2]">{item}</div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
