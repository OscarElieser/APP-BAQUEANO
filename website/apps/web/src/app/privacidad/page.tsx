/**
 * POR QUE
 * Explica como Baqueano protege datos personales, ubicacion y actividad privada de exploradores y anfitriones.
 *
 * COMO
 * Resume principios de minimizacion, consentimiento y separacion entre website publica y app Android autenticada.
 *
 * QUE
 * Pagina de politicas de privacidad disponible en la ruta /privacidad.
 */
import { EyeOff, LockKeyhole, MapPinned, UserCheck } from "lucide-react";

const privacyPrinciples = [
  { title: "Datos minimos", body: "Solicitamos solo la informacion necesaria para operar cuenta, reservas, soporte y seguridad.", icon: EyeOff },
  { title: "Sesion verificada", body: "Mensajes, historial y notificaciones privadas se abren unicamente con autenticacion activa.", icon: UserCheck },
  { title: "Ubicacion contextual", body: "La ubicacion se usa para mapa, auxilio o coordinacion cuando el usuario decide compartirla.", icon: MapPinned },
  { title: "Proteccion tecnica", body: "La arquitectura separa datos publicos, operativos y personales para reducir exposicion innecesaria.", icon: LockKeyhole }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-28 text-[#F4E6C1] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F65E01]">Politicas de Privacidad</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">Privacidad pensada para viaje real.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Baqueano protege tu identidad, actividad de viaje y comunicacion con anfitriones. Las areas privadas no se exponen desde la website sin sesion.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {privacyPrinciples.map(({ title, body, icon: Icon }) => (
            <section key={title} className="rounded-md border border-white/10 bg-[#07131f] p-6">
              <Icon size={22} className="text-[#F65E01]" />
              <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">{body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
