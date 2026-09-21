/**
 * POR QUE: Mi Viaje necesita entrada clara sin exponer datos ajenos.
 * COMO: Dirige a planificar o a abrir un viaje autenticado.
 * QUE: Portada sin datos de demostracion ni confirmaciones falsas.
 */
export default function MyTripIndexPage(){return <main className="min-h-screen bg-[#0F172A] px-4 pb-20 pt-28 text-white"><section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#165D6F]/20 p-8 shadow-2xl backdrop-blur-xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F65E01]">Centro operativo</p><h1 className="mt-3 text-4xl font-black">Mi aventura BAQUEANO</h1><p className="mt-4 text-white/70">Inicia sesion y abre un viaje confirmado. El QR solo aparece tras reservas y pago real.</p><a href="/baqueano-ai" className="mt-8 inline-flex rounded-xl bg-[#F65E01] px-6 py-3 font-black uppercase">Preparar mi aventura</a></section></main>}
