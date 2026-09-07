/**
 * WHY
 * Makes sensitive admin changes traceable across the ecosystem.
 *
 * HOW
 * Shows the intended audit fields required for every high-risk write.
 *
 * WHAT
 * Audit module route.
 */
import { AdminPanel } from "../../components/AdminCards";

export default function AuditoriaPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Auditoria</h1>
      <div className="mt-6">
        <AdminPanel title="Eventos criticos">
          <div className="grid gap-3 text-sm text-white/66">
            {["actorId", "actorRole", "action", "collection", "documentId", "createdAtIso", "summary"].map((field) => (
              <div key={field} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 font-tech uppercase">{field}</div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
