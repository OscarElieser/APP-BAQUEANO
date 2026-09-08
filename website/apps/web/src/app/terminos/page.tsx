/**
 * POR QUE
 * Define condiciones claras para usar Baqueano sin ambiguedades entre exploracion publica, reservas y funciones privadas.
 *
 * COMO
 * Expone reglas esenciales en secciones legibles, separando informacion publica de funciones que requieren sesion y app Android.
 *
 * QUE
 * Pagina de terminos y condiciones disponible en la ruta /terminos.
 */
const terms = [
  {
    title: "Uso de la plataforma",
    body: "Puedes consultar destinos, mapas y contenidos publicos desde la website. Las funciones personales requieren una cuenta verificada."
  },
  {
    title: "Reservas y anfitriones",
    body: "Las solicitudes de reserva, mensajes directos y comprobantes deben gestionarse desde la app Android con sesion activa."
  },
  {
    title: "Informacion territorial",
    body: "Baqueano trabaja para mantener datos actualizados, pero horarios, clima, acceso vial y disponibilidad pueden cambiar en campo."
  },
  {
    title: "Responsabilidad del viajero",
    body: "Cada explorador debe respetar normas locales, areas protegidas, instrucciones de guias y medidas de seguridad vigentes."
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-28 text-[#F4E6C1] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F65E01]">Terminos y Condiciones</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">Condiciones de uso de Baqueano</h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Al usar Baqueano aceptas una experiencia de turismo responsable, seguridad territorial y relacion directa con anfitriones verificados.
        </p>

        <div className="mt-10 grid gap-4">
          {terms.map((term) => (
            <section key={term.title} className="rounded-md border border-white/10 bg-[#07131f] p-6">
              <h2 className="text-lg font-bold text-white">{term.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">{term.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
