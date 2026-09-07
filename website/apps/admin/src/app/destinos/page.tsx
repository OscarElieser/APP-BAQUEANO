/**
 * WHY
 * Creates the operational entry for destination content that feeds web and Android.
 *
 * HOW
 * Lists Firestore-shaped records and exposes validation-ready status controls.
 *
 * WHAT
 * Destinations administration module.
 */
import { AdminPanel } from "../../components/AdminCards";

const destinationRows = [
  { id: "dest-canon-somoto", name: "Canon de Somoto", department: "Madriz", difficulty: "media", impact: 94, status: "published" },
  { id: "dest-ometepe", name: "Isla de Ometepe", department: "Rivas", difficulty: "alta", impact: 91, status: "published" },
  { id: "dest-cerro-negro", name: "Cerro Negro", department: "Leon", difficulty: "media", impact: 87, status: "review" },
  { id: "dest-apoyo", name: "Laguna de Apoyo", department: "Masaya", difficulty: "suave", impact: 90, status: "published" }
] as const;

export default function AdminDestinosPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Destinos</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">Gestiona destinos publicados, borradores, coordenadas, precios, dificultad, anfitriones y reglas de conservacion.</p>
      <div className="mt-6">
        <AdminPanel title="Registros compartidos">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="font-tech text-xs uppercase text-white/48">
                <tr><th className="py-3">Destino</th><th>Departamento</th><th>Dificultad</th><th>Impacto</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {destinationRows.map((destination) => (
                  <tr key={destination.id} className="border-t border-white/10 text-white/72">
                    <td className="py-4 font-bold text-white">{destination.name}</td>
                    <td>{destination.department}</td>
                    <td>{destination.difficulty}</td>
                    <td>{destination.impact}%</td>
                    <td>{destination.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
