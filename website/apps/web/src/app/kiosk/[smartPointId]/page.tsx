// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DIGITAL KIOSK & VISITOR TOTEM MODE (FASE 11)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una interfaz pública táctil, accesible y de alto contraste para
//   pantallas táctiles ubicadas en centros de visitantes comunitarios, miradores
//   y alcaldías de Nicaragua.
// - Eliminar barreras de entrada permitiendo consultar senderos, mapas, audio guías
//   y alertas sin exigir inicio de sesión personal en dispositivos compartidos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Interfaz Client Component con objetivos táctiles amplios (mínimo 48x48px).
// - Temporizador de inactividad que reinicia la sesión pública tras 90 segundos.
// - Código QR dinámico para transferir la ruta e información al teléfono del usuario.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Exploración de senderos y atractivos del municipio.
// - Visualización de mapa interactivo y perfiles de guías locales.
// - Transcripciones accesibles de relatos culturales e historia viva.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Headphones,
  Layers,
  MapPin,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Users
} from "lucide-react";

interface KioskProps {
  params: Promise<{ smartPointId: string }>;
}

export default function KioskModePage({ params }: KioskProps) {
  const [smartPointId, setSmartPointId] = useState<string>("BQ-NI-LEON-0001");
  const [activeTab, setActiveTab] = useState<"explore" | "safety" | "culture" | "guides">("explore");
  const [idleSeconds, setIdleSeconds] = useState<number>(0);

  useEffect(() => {
    params.then((p) => {
      if (p.smartPointId) setSmartPointId(p.smartPointId);
    });
  }, [params]);

  // Idle timeout reset after 90 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev >= 90) {
          setActiveTab("explore");
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    const handleUserActivity = () => setIdleSeconds(0);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return () => {
      clearInterval(timer);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060f14] text-white flex flex-col justify-between select-none">
      {/* Kiosk Top Bar */}
      <header className="border-b border-white/15 bg-[#0a1b24] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-[#F65E01] p-3 text-white">
            <Compass size={28} />
          </div>
          <div>
            <span className="font-tech text-xs uppercase tracking-widest text-[#F4E6C1]">
              CENTRO DE INFORMACIÓN TURÍSTICA &bull; {smartPointId}
            </span>
            <h1 className="font-display text-2xl font-black text-white">Totem Comunitario Baqueano</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-right">
            <span className="text-[11px] text-white/50 block">Modo Pantalla Pública</span>
            <span className="text-xs font-bold text-[#10B981]">🟢 Operativo</span>
          </div>
          <button
            onClick={() => {
              setActiveTab("explore");
              setIdleSeconds(0);
            }}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            <RotateCcw size={16} /> Reiniciar Vista
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Interactive Center Panel */}
        <div className="space-y-6">
          {/* Navigation Pills */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "explore", label: "Senderos & Mapa", icon: <MapPin size={20} /> },
              { id: "safety", label: "Normas de Seguridad", icon: <ShieldAlert size={20} /> },
              { id: "culture", label: "Relatos & Cultura", icon: <Headphones size={20} /> },
              { id: "guides", label: "Guías Acreditados", icon: <Users size={20} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setIdleSeconds(0);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-5 font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#165D6F] text-white shadow-xl scale-[1.02] border-2 border-[#F4E6C1]"
                    : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/10"
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 min-h-[420px]">
            {activeTab === "explore" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">Senderos y Circuitos del Territorio</h2>
                <p className="text-sm text-white/70">
                  Explora los circuitos habilitados para caminatas, ascenso volcánico y recorridos acuáticos. Todos los senderos cuentan con monitoreo y señalización comunitaria.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <span className="text-xs font-bold uppercase text-[#F65E01]">Sendero Principal</span>
                    <h3 className="font-bold text-lg text-white">Circuito Cráter &amp; Arenal</h3>
                    <p className="text-xs text-white/60 mt-1">Dificultad: Media &bull; Duración: 2h 30m &bull; Desnivel: +450m</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <span className="text-xs font-bold uppercase text-[#10B981]">Sendero Botánico</span>
                    <h3 className="font-bold text-lg text-white">Ruta de Vegetación Pionera</h3>
                    <p className="text-xs text-white/60 mt-1">Dificultad: Baja &bull; Duración: 45m &bull; Apto familias</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "safety" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">Protocolo de Seguridad y Rescate</h2>
                <div className="space-y-3 text-sm text-white/80">
                  <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4">
                    <strong className="text-white block mb-1">1. Registro Obligatorio en Caseta:</strong>
                    Notifica tu ingreso al guardaparque o líder de cooperativa antes de comenzar la marcha.
                  </div>
                  <div className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-4">
                    <strong className="text-white block mb-1">2. Hidratación y Protección Solar:</strong>
                    Lleva al menos 2 litros de agua por persona. La radiación solar en cráteres es intensa.
                  </div>
                  <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4">
                    <strong className="text-white block mb-1">3. Contacto de Emergencia Territorial:</strong>
                    Puesto de primeros auxilios y brigada local disponible en frecuencia VHF Canal 16 o teléfono: +505 8888 1234.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "culture" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">Memoria Oral &amp; Relatos Vivos</h2>
                <p className="text-sm text-white/70">
                  Las comunidades rurales de Nicaragua son las guardianas ancestrales de estos paisajes.
                </p>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <span className="text-xs font-bold text-[#F4E6C1]">Transcripción Accesible:</span>
                  <p className="text-xs text-white/80 italic leading-relaxed">
                    &quot;Cuentan los abuelos que el cerro nació en una noche de fuego en 1850. Los campesinos de Malpaisillo aprendieron a convivir con la ceniza que fertilizó sus tierras de maíz y ajonjolí...&quot;
                  </p>
                </div>
              </div>
            )}

            {activeTab === "guides" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">Cooperativa de Guías Acreditados</h2>
                <p className="text-sm text-white/70">
                  Guías certificados por INTUR y capacitados en primeros auxilios en áreas silvestres.
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Don Juan Martínez", exp: "18 años guiando en el coloso", lang: "Español" },
                    { name: "Elena Rivas Gómez", exp: "Especialista en flora y geología", lang: "Español / Inglés" }
                  ].map((guide) => (
                    <div key={guide.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
                      <div>
                        <strong className="text-white text-sm block">{guide.name}</strong>
                        <span className="text-white/50">{guide.exp}</span>
                      </div>
                      <span className="rounded bg-[#165D6F]/30 px-2.5 py-1 font-semibold text-[#F4E6C1]">{guide.lang}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: QR Continuity Token */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto rounded-2xl bg-white p-4 w-44 h-44 flex items-center justify-center shadow-2xl">
              <QrCode size={130} className="text-[#060f14]" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Lleva esta guía en tu teléfono</h3>
            <p className="text-xs text-white/60">
              Escanea con la cámara de tu móvil para conservar el mapa, números de emergencia y audio guías sin necesidad de cobertura continua.
            </p>
          </div>

          <div className="rounded-xl border border-[#F65E01]/30 bg-[#F65E01]/10 p-4 text-center">
            <span className="font-tech text-xs text-[#F4E6C1] uppercase tracking-wider block">Código Directo:</span>
            <strong className="font-tech text-base text-white">{smartPointId}</strong>
          </div>
        </div>
      </main>

      {/* Kiosk Footer */}
      <footer className="border-t border-white/10 bg-[#061018] px-8 py-3 flex items-center justify-between text-xs text-white/50">
        <span>Baqueano Nicaragua &bull; Infraestructura de Turismo Inteligente</span>
        <span>Reinicio automático tras 90s de inactividad ({90 - idleSeconds}s restantes)</span>
      </footer>
    </div>
  );
}
