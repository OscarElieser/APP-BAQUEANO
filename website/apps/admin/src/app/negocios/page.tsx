/**
 * WHY
 * Gives hosts and admins a place to manage local business records.
 *
 * HOW
 * Provides module scaffolding aligned with role restrictions and Firestore collections.
 *
 * WHAT
 * Businesses administration route.
 */
import { AdminPanel } from "../../components/AdminCards";

export default function NegociosPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Negocios</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {["Hospedajes", "Comedores", "Guias", "Transporte", "Artesania", "Disponibilidad"].map((item) => (
          <AdminPanel key={item} title={item}>
            <p className="text-sm leading-6 text-white/60">Modulo listo para CRUD con permisos por propietario y validacion de administrador.</p>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
