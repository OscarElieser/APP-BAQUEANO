/**
 * WHY
 * Centralizes destination oversight without pretending CRUD is secure before Auth/RBAC.
 *
 * HOW
 * Reads through the admin place service, labels seed fallback, and disables write actions
 * until authenticated server-side authorization is implemented.
 *
 * WHAT
 * Control Center destination list for Android-compatible `places` records.
 */
import { AdminPanel } from "../../components/AdminCards";
import { getAdminDestinationPlaces } from "../../services/destination.service";

export default async function AdminDestinosPage() {
  const result = await getAdminDestinationPlaces();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white">Catalogo Nacional de Destinos</h1>
        <p className="mt-1 text-sm text-white/60">
          Supervision centralizada de atractivos, coordenadas WGS84, categorias, estado de publicacion y compatibilidad con Android.
        </p>
      </div>

      <div className="rounded-md border border-[#F65E01]/30 bg-[#F65E01]/10 px-4 py-3 text-sm text-white/70">
        <strong className="font-tech uppercase text-[#F4E6C1]">Fuente:</strong> {result.source === "firestore" ? "Firestore `places`." : "Semilla administrativa; CRUD real pendiente de Auth/RBAC."}
        {result.warning ? <span className="block pt-1 text-xs text-white/50">{result.warning}</span> : null}
      </div>

      <AdminPanel title="Registros compartidos">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-tech text-xs uppercase text-white/48">
              <tr><th className="py-3">Destino</th><th>Ubicacion</th><th>Categoria</th><th>Verificacion</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {result.items.map((place) => (
                <tr key={place.placeId} className="border-t border-white/10 text-white/72">
                  <td className="py-4 font-bold text-white">{place.name}</td>
                  <td>{place.departmentName}, {place.municipalityName}</td>
                  <td>{place.categoryName}</td>
                  <td>{place.verified ? "verificado" : "pendiente"}</td>
                  <td>{place.status}</td>
                  <td><span className="rounded-md border border-white/10 px-2 py-1 font-tech text-xs uppercase text-white/45">CRUD pendiente</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
