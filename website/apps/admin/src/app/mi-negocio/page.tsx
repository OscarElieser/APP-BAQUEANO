/**
 * WHY
 * Prepares a host-owned workspace without exposing other businesses.
 *
 * HOW
 * Uses a dedicated server route that will later require authenticated owner checks.
 *
 * WHAT
 * Host business management scaffold.
 */
import { AdminPanel } from "../../components/AdminCards";

const hostModules = ["Ficha", "Fotos", "Servicios", "Horarios", "Contacto", "Disponibilidad", "Reservas", "Estadisticas", "Suscripcion"] as const;

export default function MiNegocioPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Mi negocio</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">Vista preparada para hosts. El alcance final debe filtrar por `ownerId` en servicio, backend y reglas Firestore.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {hostModules.map((module) => (
          <AdminPanel key={module} title={module}>
            <p className="text-sm leading-6 text-white/60">Pendiente de conectar con Auth y datos del negocio autenticado.</p>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
