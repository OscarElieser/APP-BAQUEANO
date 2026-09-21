/**
 * POR QUE: La calidad de datos necesita trazabilidad y decision humana.
 * COMO: Presenta estados Firestore validados sin resolver contradicciones.
 * QUE: Panel de investigacion y revision.
 */
import { AdminPanel } from "../../components/AdminCards";
import { getSourceAdminSummary } from "../../services/source-verification.service";
export default async function SourcesAdminPage() {
  const summary = await getSourceAdminSummary();
  const cards = [["Verificadas",summary.verified],["Revisar",summary.needsReview],["Vencidas",summary.expired],["Contradictorias",summary.disputed]] as const;
  return <div><h1 className="text-3xl font-black">Fuentes y verificacion</h1><p className="mt-2 text-white/60">Las contradicciones nunca se resuelven automaticamente. Conexion: {summary.connected ? "activa" : "no disponible"}.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{cards.map(([name,value])=><AdminPanel key={name} title={name}><p className="text-3xl font-black text-[#F4E6C1]">{value}</p></AdminPanel>)}</div></div>;
}
