/**
 * POR QUE: Rentadoras y flotas requieren moderacion separada.
 * COMO: Presenta conteos Firestore validados sin promover estados.
 * QUE: Panel de empresas, vehiculos y disponibilidad.
 */
import { AdminPanel } from "../../components/AdminCards";
import { getMobilityAdminSummary } from "../../services/mobility.service";
import { RENTAL_RESEARCH_CANDIDATES } from "../../data/vehicle-rental-research";
export default async function MobilityAdminPage() {
  const summary = await getMobilityAdminSummary();
  const cards = [
    ["Rentadoras", summary.companies.length], ["Pendientes", summary.pendingCompanies],
    ["Vehiculos", summary.vehicles.length], ["Vehiculos verificados", summary.verifiedVehicles],
    ["Slots", summary.slots.length]
  ] as const;
  return <div><h1 className="text-3xl font-black">Movilidad</h1><p className="mt-2 text-white/60">Directorio, verificacion y alianza son estados independientes. Conexion: {summary.connected ? "activa" : "no disponible"}.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{cards.map(([name,value])=><AdminPanel key={name} title={name}><p className="text-3xl font-black text-[#F4E6C1]">{value}</p></AdminPanel>)}</div><section className="mt-10"><h2 className="text-xl font-black">Candidatos investigados</h2><p className="mt-2 text-sm text-white/60">Esta cola editorial no publica empresas ni las convierte en aliados.</p><div className="mt-5 grid gap-4 lg:grid-cols-3">{RENTAL_RESEARCH_CANDIDATES.map((candidate)=><AdminPanel key={candidate.id} title={candidate.name}><p className={candidate.status === "disputed" ? "text-amber-300" : "text-emerald-300"}>{candidate.status === "disputed" ? "Datos contradictorios" : "Lista para revision administrativa"}</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/60">{candidate.unresolvedFacts.map((fact)=><li key={fact}>{fact}</li>)}</ul><div className="mt-4 flex flex-wrap gap-2">{candidate.sources.map((source)=><a className="text-xs text-cyan-300 underline" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name}</a>)}</div></AdminPanel>)}</div></section></div>;
}
