"use client";
/**
 * POR QUE: El viajero necesita comparar movilidad con datos verificables.
 * COMO: El formulario consulta Firestore y nunca muestra datos semilla.
 * QUE: Buscador responsive con estados honestos y requisitos por vehiculo.
 */
import { type FormEvent, useState } from "react";
import type { RentalVehicleRecord, VehicleCategory } from "@baqueano/types";
import { searchVehicles } from "../../services/vehicle-rental.service";
const categories: readonly VehicleCategory[] = ["economy","compact","sedan","suv","4x4","pickup","van","minibus"];
export default function VehicleRentalPage() {
  const [results,setResults]=useState<readonly RentalVehicleRecord[]>([]);
  const [message,setMessage]=useState("Consulta el catalogo verificado. No publicamos tarifas sin fuente vigente.");
  const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setLoading(true); const data=new FormData(event.currentTarget);
    const response=await searchVehicles({pickupLocation:String(data.get("pickupLocation")??""),category:String(data.get("category")??"") as VehicleCategory,passengers:Number(data.get("passengers")??1),luggage:Number(data.get("luggage")??0)});
    setResults(response.items); setMessage(response.items.length?"Opciones verificadas encontradas.":"No hay vehiculos verificados para estos criterios. Solicita confirmacion."); setLoading(false);
  }
  return <main className="min-h-screen bg-[#0F172A] px-4 pb-20 pt-28 text-white"><section className="mx-auto max-w-6xl">
    <p className="font-tech text-xs font-bold uppercase tracking-[0.24em] text-[#F65E01]">Movilidad BAQUEANO</p>
    <h1 className="mt-3 font-display text-4xl font-black sm:text-6xl">Alquila tu vehiculo en Nicaragua</h1>
    <p className="mt-4 max-w-3xl text-white/70">Compara unidades publicadas por rentadoras revisadas. Licencia, deposito, seguro y disponibilidad dependen de cada empresa.</p>
    <form onSubmit={submit} className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl md:grid-cols-4">
      <label className="text-sm">Lugar de recogida<input required name="pickupLocation" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3" placeholder="Managua"/></label>
      <label className="text-sm">Fecha y hora<input required name="pickupAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3"/></label>
      <label className="text-sm">Lugar de devolucion<input required name="dropoffLocation" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3" placeholder="Leon"/></label>
      <label className="text-sm">Fecha y hora<input required name="dropoffAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3"/></label>
      <label className="text-sm">Pasajeros<input min="1" name="passengers" type="number" defaultValue="2" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3"/></label>
      <label className="text-sm">Equipaje<input min="0" name="luggage" type="number" defaultValue="2" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3"/></label>
      <label className="text-sm">Tipo<select name="category" className="mt-2 w-full rounded-xl border border-white/15 bg-[#08111f] p-3">{categories.map((item)=><option key={item} value={item}>{item.toUpperCase()}</option>)}</select></label>
      <button disabled={loading} className="self-end rounded-xl bg-[#F65E01] p-3 font-black uppercase disabled:opacity-50">{loading?"Consultando":"Buscar vehiculos"}</button>
    </form>
    <p role="status" className="mt-5 rounded-xl border border-[#F4E6C1]/20 bg-[#F4E6C1]/10 p-4 text-sm text-[#F4E6C1]">{message}</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{results.map((vehicle)=><article key={vehicle.id} className="rounded-2xl border border-white/10 bg-[#165D6F]/20 p-5"><p className="text-xs font-bold uppercase text-[#10B981]">{vehicle.verificationStatus}</p><h2 className="mt-2 text-2xl font-black">{vehicle.brand} {vehicle.model}</h2><p className="mt-2 text-sm text-white/70">{vehicle.category.toUpperCase()} - {vehicle.passengerCapacity} pasajeros - {vehicle.luggageCapacity} equipajes</p><p className="mt-4 font-bold">{vehicle.dailyPriceUsd!==undefined?`USD $${vehicle.dailyPriceUsd}/dia`:"Precio sujeto a confirmacion."}</p><p className="mt-3 text-xs text-white/60">Licencia extranjera: {vehicle.foreignLicenseAccepted===undefined?"consultar":vehicle.foreignLicenseAccepted?"aceptada por esta rentadora":"no declarada como aceptada"}</p></article>)}</div>
  </section></main>;
}
