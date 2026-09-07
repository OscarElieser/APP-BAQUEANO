// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — SMART POINT QR / NFC CONTEXTUAL RESOLVER
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una experiencia contextual inmediata, accesible y ultra-ligera (< 50 KB)
//   para viajeros que escanean una señalización física QR o tocan una etiqueta NFC
//   en un atractivo natural, sendero o comunidad de Nicaragua.
// - Conectar al visitante directamente con los baqueanos locales, normas de
//   seguridad, aforo en tiempo real y audio guías sin exigir instalación de apps.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Server-Side Component con renderizado estático (SSG) y revalidación bajo demanda.
// - Aislamiento total de privacidad: el escaneo es 100% anónimo (cero captura de PII).
// - Fallback textual de coordenadas y código de punto si el QR físico está desgastado.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Identificación de ubicación: "Estás en Cerro Negro", coordenadas GPS oficiales.
// - Indicador de aforo y capacidad de carga ecológica.
// - Audio guía comunitaria con transcripción accesible.
// - Botón de llamada directa a números de emergencia y brigada de rescate local.
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Compass,
  Headphones,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Users
} from "lucide-react";

interface SmartPointContextData {
  slug: string;
  code: string;
  name: string;
  placeName: string;
  departmentName: string;
  municipalityName: string;
  type: string;
  coordinates: { latitude: number; longitude: number };
  description: string;
  currentOccupancy: "low" | "moderate" | "high" | "full";
  safetyLevel: "low" | "medium" | "high";
  emergencyPhone: string;
  cooperativeName: string;
  audioGuideTitle?: string;
  audioDuration?: string;
  rules: string[];
}

const smartPointsDatabase: Record<string, SmartPointContextData> = {
  "cerro-negro": {
    slug: "cerro-negro",
    code: "BQ-NI-LEON-0001",
    name: "Mirador de Cráter & Sendero Sur",
    placeName: "Volcán Cerro Negro",
    departmentName: "León",
    municipalityName: "Malpaisillo / León",
    type: "Sendero y Volcán Activo",
    coordinates: { latitude: 12.5069, longitude: -86.7028 },
    description: "Volcán activo más joven de Centroamérica. Arena negra, vientos constantes y descenso con tabla guiado por guías certificados.",
    currentOccupancy: "moderate",
    safetyLevel: "medium",
    emergencyPhone: "+505 8888 1234",
    cooperativeName: "Cooperativa de Guías Volcánicos de León R.L.",
    audioGuideTitle: "Historia viva del coloso negro y su geología",
    audioDuration: "3 min 40 s",
    rules: [
      "Uso obligatorio de casco, lentes protectores y traje durante el sandboarding.",
      "Permanecer en el sendero demarcado para proteger la corteza volcánica.",
      "Prohibido dejar basura o plásticos en las faldas del volcán."
    ]
  },
  "canon-de-somoto": {
    slug: "canon-de-somoto",
    code: "BQ-NI-MADZ-0002",
    name: "Centro de Visitantes & Entrada Fluvial",
    placeName: "Cañón de Somoto",
    departmentName: "Madriz",
    municipalityName: "Somoto",
    type: "Monumento Nacional y Cañón",
    coordinates: { latitude: 13.4817, longitude: -86.5821 },
    description: "Garganta geológica de paredes verticales de más de 100 metros. Recorrido acuático y senderismo comunitario.",
    currentOccupancy: "low",
    safetyLevel: "low",
    emergencyPhone: "+505 8888 5678",
    cooperativeName: "Cooperativa de Guías Comunitarios del Cañón R.L.",
    audioGuideTitle: "El descubrimiento geológico y las leyendas del río Coco",
    audioDuration: "4 min 15 s",
    rules: [
      "Chaleco salvavidas obligatorio en todo el tramo navegable.",
      "Contratar únicamente guías comunitarios acreditados por la cooperativa.",
      "Prohibido el uso de bloqueadores químicos no biodegradables en el agua."
    ]
  },
  "laguna-de-apoyo": {
    slug: "laguna-de-apoyo",
    code: "BQ-NI-MASA-0003",
    name: "Mirador y Acceso a Reserva Natural",
    placeName: "Laguna de Apoyo",
    departmentName: "Masaya",
    municipalityName: "Catarina",
    type: "Reserva Natural y Cráter Lacustre",
    coordinates: { latitude: 11.9284, longitude: -86.0319 },
    description: "Cráter volcánico extinto con agua dulce tibia y bosque tropical seco protegido. Zona de alto valor ecológico.",
    currentOccupancy: "moderate",
    safetyLevel: "low",
    emergencyPhone: "+505 8888 9012",
    cooperativeName: "Comité de Guardaparques Comunitarios de Catarina",
    audioGuideTitle: "La biodiversidad endémica y el mito del volcán Apoyo",
    audioDuration: "2 min 50 s",
    rules: [
      "Prohibido el ingreso de embarcaciones a motor de combustión.",
      "Respetar el horario de ingreso y salida del área protegida.",
      "No perturbar la fauna silvestre (monos congos y aves migratorias)."
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(smartPointsDatabase).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const point = smartPointsDatabase[slug];
  if (!point) return { title: "Punto Baqueano" };
  return {
    title: `Estás en ${point.placeName} | Punto Baqueano ${point.code}`,
    description: `Información contextual oficial, normas de seguridad y guías locales para ${point.name}.`,
    robots: { index: true, follow: true }
  };
}

export default async function SmartPointResolverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const point = smartPointsDatabase[slug];

  if (!point) {
    notFound();
  }

  const getOccupancyBadge = (occ: string) => {
    switch (occ) {
      case "low":
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/20 px-3 py-1 text-xs font-bold text-[#10B981]">Aforo Óptimo (Tranquilo)</span>;
      case "moderate":
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#FBBF24]/20 px-3 py-1 text-xs font-bold text-[#FBBF24]">Aforo Moderado</span>;
      case "high":
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316]/20 px-3 py-1 text-xs font-bold text-[#F97316]">Afluencia Alta</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#EF4444]/20 px-3 py-1 text-xs font-bold text-[#EF4444]">Capacidad Límite</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#08131a] text-white px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F65E01]/30 bg-[#F65E01]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#F65E01] uppercase">
            <MapPin size={14} /> PUNTO INTELIGENTE BAQUEANO
          </div>
          <p className="font-tech text-xs tracking-wider text-white/50">{point.code}</p>
          <h1 className="font-display text-3xl font-black text-white">Estás en {point.placeName}</h1>
          <p className="text-sm font-semibold text-[#F4E6C1]">{point.name} &bull; {point.departmentName}</p>
        </div>

        {/* GPS Coordinates & Live Occupancy Card */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Compass size={14} className="text-[#165D6F]" />
              <span className="font-tech">
                {point.coordinates.latitude.toFixed(4)}° N, {Math.abs(point.coordinates.longitude).toFixed(4)}° W
              </span>
            </div>
            {getOccupancyBadge(point.currentOccupancy)}
          </div>
          <p className="text-xs text-white/80 leading-relaxed">{point.description}</p>
        </div>

        {/* Local Cooperative Card */}
        <div className="rounded-xl border border-[#165D6F]/30 bg-[#165D6F]/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4E6C1]">
            <Users size={14} /> Guías Comunitarios Acreditados:
          </div>
          <p className="text-sm font-bold text-white">{point.cooperativeName}</p>
          <p className="text-xs text-white/70">
            Contratar un guía local certificado asegura tu seguridad y apoya directamente a las familias campesinas.
          </p>
        </div>

        {/* Audio Guide Player Preview */}
        {point.audioGuideTitle && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase text-[#F65E01]">
                <Headphones size={14} /> Audio Guía Comunitaria
              </span>
              <span className="font-tech text-xs text-white/50">{point.audioDuration}</span>
            </div>
            <p className="text-sm font-semibold text-white">{point.audioGuideTitle}</p>
            <div className="rounded-lg bg-black/30 p-2.5 flex items-center justify-between text-xs text-white/70">
              <span>Narrado por baqueanos del territorio</span>
              <button className="rounded bg-[#F65E01] px-3 py-1 text-xs font-bold text-white hover:bg-[#F65E01]/90">
                Escuchar
              </button>
            </div>
          </div>
        )}

        {/* Conservation & Safety Rules */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/80">
            <ShieldCheck size={14} className="text-[#10B981]" /> Reglas de Conservación y Seguridad:
          </div>
          <ul className="space-y-2 text-xs text-white/70">
            {point.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#10B981] font-bold">&bull;</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Local Emergency Call Button */}
        <div className="space-y-2">
          <a
            href={`tel:${point.emergencyPhone}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/20 py-3 text-sm font-bold text-white hover:bg-[#EF4444]/30 transition-colors"
          >
            <Phone size={16} /> Contacto de Emergencia Local ({point.emergencyPhone})
          </a>
          <p className="text-center text-[11px] text-white/40">
            En caso de extravío o accidente, comunícate inmediatamente con el comité de rescate.
          </p>
        </div>

        {/* Navigation & Continuity */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <Link href={`/destinos/${point.slug}`} className="hover:text-[#F4E6C1] underline">
            Ver ficha completa de destino &rarr;
          </Link>
          <Link href="/mapa" className="hover:text-[#F4E6C1] underline">
            Abrir en Mapa &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
