/**
 * WHY
 * Lets admins review business areas without exposing unsecured write actions.
 *
 * HOW
 * Uses server-rendered operational panels until Auth/RBAC-scoped CRUD is ready.
 *
 * WHAT
 * Businesses administration route.
 */
import { AdminPanel } from "../../components/AdminCards";

export default function NegociosPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Negocios y anfitriones</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">CRUD real pendiente de Auth, RBAC, reglas Firestore y auditoria server-side. No hay escrituras cliente habilitadas.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {["Hospedajes", "Comedores", "Guias", "Transporte", "Artesania", "Disponibilidad"].map((item) => (
          <AdminPanel key={item} title={item}>
            <p className="text-sm leading-6 text-white/60">Modulo listo para conectarse a `businesses` con permisos por propietario.</p>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
