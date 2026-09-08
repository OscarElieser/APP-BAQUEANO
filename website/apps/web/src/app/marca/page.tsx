/**
 * POR QUE
 * Presenta la identidad publica de Baqueano como una promesa cultural, territorial y comunitaria.
 *
 * COMO
 * Organiza mision, vision, manifiesto y sistema visual en una pagina editorial responsive de Next.js.
 *
 * QUE
 * Pagina institucional de marca y manifiesto disponible en la ruta /marca.
 */
import { Compass, Leaf, Palette, ShieldCheck } from "lucide-react";

const manifesto = [
  "Creemos en una Nicaragua que se descubre caminando con respeto, no consumiendo lugares de paso.",
  "Cada ruta debe acercar al viajero con la comunidad anfitriona, su memoria y su economia local.",
  "La tecnologia debe orientar, proteger y verificar sin reemplazar la voz de quienes habitan el territorio.",
  "Baqueano existe para que el mapa vuelva a tener rostro humano."
];

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-28 text-[#F4E6C1] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-tech text-xs font-bold uppercase tracking-normal text-[#F65E01]">Nuestra Marca</p>
          <h1 className="mt-3 font-display text-4xl font-black text-white lg:text-6xl">Baqueano es guia, territorio y confianza.</h1>
          <p className="mt-5 text-base leading-8 text-white/72">
            Somos una plataforma de exploracion responsable para conectar viajeros con destinos, saberes y anfitriones locales de Nicaragua.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { label: "Petroleo Teal", value: "#165D6F", icon: Compass },
            { label: "Terracota Vivo", value: "#F65E01", icon: Leaf },
            { label: "Arena Pinolera", value: "#F4E6C1", icon: Palette },
            { label: "Azul Profundo", value: "#0F172A", icon: ShieldCheck }
          ].map(({ label, value, icon: Icon }) => (
            <div key={value} className="rounded-md border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <Icon size={20} className="text-[#F4E6C1]" />
                <span className="h-8 w-8 rounded-md border border-white/20" style={{ backgroundColor: value }} />
              </div>
              <h2 className="mt-4 text-sm font-bold text-white">{label}</h2>
              <p className="mt-1 font-mono text-xs text-white/54">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-2xl font-black text-white">Manifiesto</h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Una declaracion breve para mantener alineado el producto, la experiencia y la relacion con comunidades.
            </p>
          </div>
          <div className="grid gap-3">
            {manifesto.map((item, index) => (
              <p key={item} className="rounded-md border border-white/10 bg-[#07131f] p-5 text-sm leading-7 text-white/78">
                <span className="mr-3 font-tech text-[#F65E01]">0{index + 1}</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
