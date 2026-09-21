/**
 * POR QUE: Se requiere la URL Mi Viaje sin duplicar el Trip Hub.
 * COMO: Redirige al centro operativo canonico existente.
 * QUE: Alias seguro /mi-viaje/[tripId].
 */
import { redirect } from "next/navigation";
export default async function MyTripPage({params}:{params:Promise<{tripId:string}>}){const {tripId}=await params;redirect(`/viaje/${encodeURIComponent(tripId)}`)}
