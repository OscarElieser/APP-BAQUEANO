/**
 * WHY
 * Shows audit readiness without exposing client-side privileged operations.
 *
 * HOW
 * Reads audit logs through the shared service and labels disconnected states.
 *
 * WHAT
 * Read-only audit log screen for Control Center.
 */
import { listAuditLogs } from "@baqueano/firebase";
import { AdminPanel } from "../../components/AdminCards";

export default async function AdminAuditoriaPage() {
  const result = await listAuditLogs(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white">Bitacora Oficial de Auditoria</h1>
        <p className="mt-1 text-sm text-white/60">
          Trazabilidad de operaciones criticas: creacion de atractivos, modificaciones territoriales y publicaciones.
        </p>
      </div>

      <div className="rounded-md border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-3 text-sm text-white/70">
        <strong className="font-tech uppercase text-[#F4E6C1]">Fuente:</strong> {result.source === "firestore" ? "Firestore `audit_logs`." : "Sin conexion Firebase; no hay eventos reales que mostrar."}
        {result.warning ? <span className="block pt-1 text-xs text-white/50">{result.warning}</span> : null}
      </div>

      <AdminPanel title="Eventos criticos">
        {result.items.length === 0 ? (
          <p className="text-sm text-white/58">No hay eventos de auditoria disponibles en esta sesion.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="font-tech text-xs uppercase text-white/48">
                <tr><th className="py-3">Fecha</th><th>Actor</th><th>Rol</th><th>Accion</th><th>Documento</th></tr>
              </thead>
              <tbody>
                {result.items.map((log) => (
                  <tr key={log.id} className="border-t border-white/10 text-white/72">
                    <td className="py-4">{log.createdAtIso}</td>
                    <td>{log.actorEmail}</td>
                    <td>{log.actorRole}</td>
                    <td>{log.action}</td>
                    <td>{log.collection}/{log.documentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
