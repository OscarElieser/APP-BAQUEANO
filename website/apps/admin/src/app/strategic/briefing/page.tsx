// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — RESUMEN EJECUTIVO SEMANAL (EXECUTIVE BRIEFING) (page.tsx)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Sintetizar de forma concisa y priorizada el estado semanal del ecosistema Baqueano.
// - Evitar la saturación de tableros ("Dashboard Overload"): responder en 2 minutos
//   qué cambió, qué amerita atención y qué oportunidades o riesgos se proyectan.
// - Asegurar que el borrador narrativo distinga rigurosamente entre hechos, modelos y sugerencias.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Estructura en 6 Bloques Ejecutivos normalizados.
// - Botón de Exportación Inmutable (CSV / JSON) con sanitización de privacidad.
// - Flujo de Aprobación Humana (Human Review Sign-off).
//
// 📦 3. QUÉ (WHAT / COMPONENTES EXPUESTOS):
// - Vista de Lectura del Informe Semanal.
// - Controles de Descarga y Copia de Resumen.
// - Registro de Auditoría y Estado de Firma.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  Share2,
  Sparkles
} from "lucide-react";
import { strategicReportingService } from "../../../../../../apps/web/src/services/strategic/strategic-reporting.service";

export default function StrategicBriefingPage() {
  const [snapshot, setSnapshot] = useState(() => {
    return strategicReportingService.generateReportSnapshot({
      reportType: "WEEKLY_EXECUTIVE_BRIEF",
      userRole: "super_admin"
    });
  });

  const [isReviewed, setIsReviewed] = useState<boolean>(snapshot.isHumanReviewed);
  const [reviewerName, setReviewerName] = useState<string>("Director de Operaciones & Territorio");

  const handleSignOff = () => {
    strategicReportingService.markReportAsReviewed(snapshot.reportId, reviewerName);
    setIsReviewed(true);
  };

  const handleDownloadCsv = () => {
    const csvContent = strategicReportingService.exportReportCsv(snapshot.reportId);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `baqueano-briefing-semana-36-2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER DE CABECERA — BRIEFING SEMANAL */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center rounded-2xl border border-white/10 bg-gradient-to-r from-[#06151f] via-[#091b24] to-[#165D6F]/30 p-6 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#F65E01]/20 px-2.5 py-0.5 font-tech text-xs font-bold uppercase tracking-wider text-[#F65E01]">
              Informe Ejecutivo &middot; Semana 36
            </span>
            <span className="rounded bg-white/10 px-2.5 py-0.5 font-tech text-xs text-[#F4E6C1]">
              Versión: {snapshot.dataVersion}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-white">
            {snapshot.title}
          </h1>
          <p className="mt-1 text-xs text-white/70">
            {snapshot.period} &middot; Generado: {new Date(snapshot.generatedAt).toLocaleString("es-NI")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <Download size={15} /> Exportar CSV
          </button>
          <Link
            href="/strategic"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft size={16} /> Volver al Cockpit
          </Link>
        </div>
      </div>

      {/* CUERPO DEL INFORME ESTRUCTURADO EN 6 BLOQUES */}
      <div className="rounded-2xl border border-white/10 bg-[#07131f]/90 p-6 lg:p-8 space-y-8 shadow-xl">
        {/* BLOQUE 1: QUÉ CAMBIÓ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#165D6F] text-xs font-bold text-white">1</span>
            <h2 className="font-display text-base font-bold text-white">¿Qué cambió esta semana?</h2>
          </div>
          <p className="text-xs leading-relaxed text-white/80">
            El interés de los viajeros aumentó un <strong>+28% en el Corredor Volcánico de Occidente</strong>, especialmente en Cerro Negro y Hervideros de San Jacinto. La cantidad de negocios locales activos alcanzó <strong>342 emprendimientos comunitarios</strong> con una tasa de respuesta de los anfitriones del <strong>91.4%</strong>.
          </p>
        </section>

        {/* BLOQUE 2: QUÉ REQUIERE ATENCIÓN */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F65E01] text-xs font-bold text-white">2</span>
            <h2 className="font-display text-base font-bold text-white">¿Qué requiere atención estratégica?</h2>
          </div>
          <p className="text-xs leading-relaxed text-white/80">
            Existen <strong>14 fichas en la Meseta de Carazo</strong> que superaron los 180 días sin re-auditoría presencial. Se registraron <strong>2 casos de integridad</strong> en proceso de resolución relacionados con horarios no actualizados de cooperativas de lanchas en Solentiname.
          </p>
        </section>

        {/* BLOQUE 3: PRONÓSTICO (FORECAST) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">3</span>
            <h2 className="font-display text-base font-bold text-white">Pronóstico de Modelos (Próximos 7 Días)</h2>
          </div>
          <p className="text-xs leading-relaxed text-white/80">
            Los modelos predictivos anticipan alta afluencia el sábado por la mañana en Cerro Negro. Se proyecta que <strong>3 destinos</strong> alcancen niveles elevados de capacidad si no se diversifica la demanda hacia circuitos gastronómicos secundarios.
          </p>
        </section>

        {/* BLOQUE 4: OPORTUNIDADES TERRITORIALES */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">4</span>
            <h2 className="font-display text-base font-bold text-white">Oportunidades de Inclusión y Documentación</h2>
          </div>
          <p className="text-xs leading-relaxed text-white/80">
            Oportunidad prioritaria de coordinar misiones de campo en <strong>Matagalpa (San Ramón y Yasica Sur)</strong> para relevar 14 fincas agroecológicas y artesanales actualmente no representadas en el mapa digital.
          </p>
        </section>

        {/* BLOQUE 5: RIESGOS MITIGABLES */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">5</span>
            <h2 className="font-display text-base font-bold text-white">Riesgos Identificados</h2>
          </div>
          <p className="text-xs leading-relaxed text-white/80">
            Riesgo de congestión vehicular en accesos a miradores de Catarina durante las tardes de domingo. Se sugiere sugerir rutas peatonales y estacionamientos periféricos en las recomendaciones del Concierge.
          </p>
        </section>

        {/* BLOQUE 6: DECISIONES PENDIENTES & FIRMA HUMANA */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">6</span>
            <h2 className="font-display text-base font-bold text-white">Gobernanza & Firma de Revisión</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white">Estado de Revisión Humana:</span>
              <p className="text-xs text-white/60">
                {isReviewed ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Aprobado por: {reviewerName}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">Pendiente de Aprobación por Autoridad Responsable</span>
                )}
              </p>
            </div>

            {!isReviewed && (
              <button
                onClick={handleSignOff}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[#165D6F] px-4 py-2 text-xs font-bold text-white hover:bg-[#165D6F]/80 transition-colors"
              >
                <FileCheck size={16} /> Firmar y Aprobar Informe
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
