/**
 * WHY
 * Structures the home as a product narrative instead of a generic tourism landing.
 *
 * HOW
 * Alternates editorial bands, dense grids, map interaction, and operational signals.
 *
 * WHAT
 * Public home sections for exploration, destinations, local hosts, culture, AI, app, and impact.
 */
import Image from "next/image";
import Link from "next/link";
import { Bot, Leaf, Map, ShieldCheck, Smartphone, Users } from "lucide-react";
import { BaqueanoButton, MetricTile, SectionHeader, StatusChip } from "@baqueano/ui";
import { featuredDestinations, seedPlaces } from "../../data/catalog";
import { DestinationCard } from "../cards/DestinationCard";
import { InteractiveMap } from "../map/InteractiveMap";

const experienceSignals = [
  { title: "Explora Nicaragua", icon: Map, copy: "Rutas por paisaje, dificultad, comunidad y tiempo disponible." },
  { title: "Baqueanos locales", icon: Users, copy: "Anfitriones, guias y negocios que cuentan el territorio desde adentro." },
  { title: "Conservacion activa", icon: Leaf, copy: "Indicadores de impacto, carga responsable y comercio justo." },
  { title: "Baqueano AI", icon: Bot, copy: "Itinerarios visuales por presupuesto, gustos, distancias y ritmo." }
] as const;

export function HomeNarrative() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader kicker="01 / Plataforma de exploracion" title="Nicaragua se navega por capas, no por listas.">
          <p>
            Baqueano cruza destinos, memoria cultural, gastronomia, negocios campesinos, seguridad y sostenibilidad en una interfaz pensada para descubrir rutas menos saturadas.
          </p>
        </SectionHeader>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {experienceSignals.map((signal) => (
            <article key={signal.title} className="glass-panel p-5 transition hover:-translate-y-1">
              <signal.icon className="text-[#F65E01]" size={24} />
              <h3 className="mt-5 font-display text-xl font-black text-white">{signal.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{signal.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#F4E6C1] py-20 text-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">02 / Destinos destacados</p>
              <h2 className="mt-3 font-display text-4xl font-black leading-tight md:text-6xl">Rutas con territorio, contexto y cuidado.</h2>
              <p className="mt-5 text-base leading-7 text-[#0F172A]/70">Cada destino nace como registro vivo: historia, coordenadas, precio, dificultad, anfitriones, negocios cercanos y reglas de conservacion.</p>
              <Link href="/destinos" className="mt-7 inline-flex"><BaqueanoButton variant="primary">Ver destinos</BaqueanoButton></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredDestinations.slice(0, 4).map((destination) => <DestinationCard key={destination.slug} destination={destination} />)}
            </div>
          </div>
        </div>
      </section>

      <InteractiveMap places={seedPlaces} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="relative min-h-[440px] overflow-hidden rounded-md">
            <Image src="/assets/images/destinos/selva_negra.jpg" alt="Bosque y montanas de Nicaragua" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061018]/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <StatusChip tone="green">Impacto verificable</StatusChip>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-black text-white">Turismo que deja valor donde ocurre.</h2>
            </div>
          </div>
          <div className="grid gap-4">
            <MetricTile label="Territorios conectados" value="17" icon={<ShieldCheck size={22} />} />
            <MetricTile label="Indice objetivo de comercio local" value="85%" icon={<Users size={22} />} />
            <MetricTile label="Rutas listas para baja saturacion" value="42" icon={<Map size={22} />} />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.04] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionHeader kicker="12 / Baqueano AI" title="Un copiloto turistico con criterio local.">
              <p>Convierte presupuesto, dias, gustos y restricciones en rutas visuales, con alertas de conservacion y distancias realistas.</p>
            </SectionHeader>
            <Link href="/baqueano-ai" className="mt-8 inline-flex"><BaqueanoButton>Planificar viaje</BaqueanoButton></Link>
          </div>
          <div className="glass-panel p-5">
            {["Quiero viajar 3 dias", "Tengo $200", "Me gusta la montana", "Quiero evitar lugares saturados"].map((line) => (
              <div key={line} className="mb-3 rounded-md border border-white/10 bg-[#0F172A]/72 px-4 py-3 font-tech text-sm text-white/84">{line}</div>
            ))}
            <div className="rounded-md bg-[#10B981]/16 p-4 text-sm leading-6 text-white/78">Ruta sugerida: Matagalpa + Selva Negra + comunidad cafetalera, con presupuesto estimado y horarios de baja afluencia.</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="glass-panel grid gap-8 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8">
          <div className="flex aspect-[9/16] max-h-[520px] items-center justify-center rounded-[2rem] border border-white/16 bg-[#0F172A] p-5 shadow-2xl">
            <div className="h-full w-full rounded-[1.4rem] border border-white/10 bg-gradient-to-b from-[#165D6F] to-[#061018] p-5">
              <Smartphone size={26} className="text-[#F65E01]" />
              <p className="mt-8 font-display text-3xl font-black uppercase leading-none">Lleva Baqueano contigo</p>
              <p className="mt-4 text-sm text-white/66">Mapas, favoritos, alertas y pasaporte del explorador.</p>
            </div>
          </div>
          <div className="self-center">
            <StatusChip tone="orange">App Android</StatusChip>
            <h2 className="mt-4 font-display text-4xl font-black text-white md:text-6xl">Del mapa web al camino real.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">La web despierta el viaje. Android acompana en campo con rutas guardadas, contacto directo y funciones pensadas para conectividad limitada.</p>
          </div>
        </div>
      </section>
    </>
  );
}
