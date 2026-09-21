/**
 * POR QUE: Rentadoras y flotas requieren moderacion separada.
 * COMO: Mantiene directorio, verificacion y alianza como estados distintos.
 * QUE: Panel de empresas, vehiculos, tarifas, seguros y disponibilidad.
 */
import { AdminPanel } from "../../components/AdminCards";
const modules=["Rentadoras pendientes","Flota","Tarifas","Seguros","Disponibilidad","Condiciones","Imagenes"];
export default function MobilityAdminPage(){return <div><h1 className="text-3xl font-black">Movilidad</h1><p className="mt-2 text-white/60">Directorio, verificacion y alianza son estados independientes.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{modules.map((name)=><AdminPanel key={name} title={name}><p className="text-sm text-white/60">Sin registros semilla. Moderacion pendiente de backend seguro.</p></AdminPanel>)}</div></div>}
