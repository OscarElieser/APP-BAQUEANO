/**
 * POR QUE: La calidad de datos necesita trazabilidad y decision humana.
 * COMO: Separa fuente, vigencia, confianza y contradicciones.
 * QUE: Panel de investigacion y revision.
 */
import { AdminPanel } from "../../components/AdminCards";
export default function SourcesAdminPage(){return <div><h1 className="text-3xl font-black">Fuentes y verificacion</h1><p className="mt-2 text-white/60">Las contradicciones nunca se resuelven automaticamente.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><AdminPanel title="Cola de revision"><p className="text-sm text-white/60">Verificado, revisar, vencido y contradictorio.</p></AdminPanel><AdminPanel title="Procedencia"><p className="text-sm text-white/60">Fuentes oficiales, web, mapas, redes y revision manual.</p></AdminPanel></div></div>}
