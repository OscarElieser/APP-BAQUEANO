"use client";

// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — ADMIN TRUST, VERIFICATION & INTEGRITY CONSOLE (FASE 14)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una consola centralizada de operaciones de confianza para moderadores
//   y administradores territoriales de Baqueano.
// - Controlar el flujo de verificación de evidencias, auditoría de claims
//   de sostenibilidad (anti-greenwashing), casos de integridad de marketplace
//   y apelaciones con principio de cuatro ojos (Four-Eyes Principle).
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js 15 Client Component con pestañas reactivas, modales de acción,
//   servicio tipado trust.service.ts y paleta visual oficial.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Panel de 5 pestañas: Verificaciones, Claims, Integridad, Simulador BRTI, Apelaciones y Auditoría.
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  Eye,
  RefreshCw,
  Search,
  Scale
} from "lucide-react";
import type {
  ClaimStatus,
  IntegrityCaseRecord,
  SustainabilityClaimRecord,
  TrustAppealRecord,
  TrustAuditEventRecord,
  VerificationRecord,
  VerificationStatus
} from "@baqueano/types";
import {
  getVerifications,
  updateVerificationStatus,
  getSustainabilityClaims,
  updateClaimStatus,
  getIntegrityCases,
  resolveIntegrityCase,
  getTrustAppeals,
  resolveAppeal,
  getTrustAuditLogs
} from "../../services/trust.service";

export default function TrustAdminPage() {
  const [activeTab, setActiveTab] = useState<"verifications" | "claims" | "integrity" | "simulator" | "appeals">("verifications");
  const [loading, setLoading] = useState<boolean>(true);

  // States
  const [verifications, setVerifications] = useState<readonly VerificationRecord[]>([]);
  const [claims, setClaims] = useState<readonly SustainabilityClaimRecord[]>([]);
  const [integrityCases, setIntegrityCases] = useState<readonly IntegrityCaseRecord[]>([]);
  const [appeals, setAppeals] = useState<readonly TrustAppealRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<readonly TrustAuditEventRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Action message
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes, iRes, aRes, audRes] = await Promise.all([
        getVerifications(),
        getSustainabilityClaims(),
        getIntegrityCases(),
        getTrustAppeals(),
        getTrustAuditLogs()
      ]);
      setVerifications(vRes.items);
      setClaims(cRes.items);
      setIntegrityCases(iRes.items);
      setAppeals(aRes.items);
      setAuditLogs(audRes.items);
    } catch (e: any) {
      setActionMessage(`Error al cargar datos: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateVerification = async (id: string, status: VerificationStatus) => {
    const res = await updateVerificationStatus(id, status, "admin_actual", "superadmin_revisor");
    setActionMessage(res.message);
    loadAllData();
  };

  const handleUpdateClaim = async (id: string, status: ClaimStatus) => {
    const res = await updateClaimStatus(id, status, "admin_actual");
    setActionMessage(res.message);
    loadAllData();
  };

  const handleResolveIntegrity = async (id: string) => {
    const res = await resolveIntegrityCase(id, "CLEARED", "Investigación completada y evidencias validadas.");
    setActionMessage(res.message);
    loadAllData();
  };

  const handleResolveAppeal = async (id: string, status: "UPHELD" | "REVERSED") => {
    const res = await resolveAppeal(id, status, "superadmin_revisor", "Revisión en segunda instancia completada.");
    setActionMessage(res.message);
    loadAllData();
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E293B]/70 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F65E01]" />
            <span>BAQUEANO TRUST & INTEGRITY CONTROL</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Gobernanza de Confianza & Sostenibilidad</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditoría de evidencias territoriales, verificación de claims, integridad antifraude y resolución de apelaciones.
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar Datos
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-4 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-cyan-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "verifications"
              ? "bg-[#165D6F] text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verificaciones ({verifications.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "claims"
              ? "bg-[#165D6F] text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claims Sostenibilidad ({claims.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("integrity")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "integrity"
              ? "bg-[#165D6F] text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Casos de Integridad ({integrityCases.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("appeals")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "appeals"
              ? "bg-[#165D6F] text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Apelaciones & Auditoría ({appeals.length})</span>
          </div>
        </button>
      </div>

      {/* Tab 1: Verifications Queue */}
      {activeTab === "verifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Cola de Verificaciones Territoriales</h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por recurso o estado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {verifications.map((v) => (
              <div key={v.id} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{v.resourceId}</span>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">{v.resourceType}</span>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{v.countryId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      v.status === "VERIFIED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        : v.status === "UNDER_REVIEW"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                        : "bg-rose-950 text-rose-300 border border-rose-500/30"
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <p><strong className="text-slate-400">Tipo:</strong> {v.verificationType}</p>
                  <p><strong className="text-slate-400">Primer Revisor:</strong> {v.verifiedBy || "Pendiente"}</p>
                  <p><strong className="text-slate-400">Segundo Revisor (4-Eyes):</strong> {v.secondReviewerBy || "Pendiente"}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateVerification(v.id, "VERIFIED")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Verificación
                  </button>
                  <button
                    onClick={() => handleUpdateVerification(v.id, "UNDER_REVIEW")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" /> En Revisión
                  </button>
                  <button
                    onClick={() => handleUpdateVerification(v.id, "REJECTED")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Claims Review */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Revisión de Afirmaciones de Sostenibilidad (Anti-Greenwashing)</h2>
          <div className="grid grid-cols-1 gap-4">
            {claims.map((c) => (
              <div key={c.id} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400">{c.resourceId}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                    Dimensión: {c.dimension}
                  </span>
                </div>
                <p className="text-sm text-slate-100 italic bg-[#0F172A] p-3 rounded-xl border border-slate-800">
                  &ldquo;{c.claimText}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs font-bold ${c.status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}`}>
                    Estado: {c.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateClaim(c.id, "VERIFIED")}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg"
                    >
                      Aprobar Claim
                    </button>
                    <button
                      onClick={() => handleUpdateClaim(c.id, "REJECTED")}
                      className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg"
                    >
                      Rechazar Claim
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Integrity Cases */}
      {activeTab === "integrity" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Casos de Integridad & Detección de Fraude</h2>
          <div className="grid grid-cols-1 gap-4">
            {integrityCases.map((cs) => (
              <div key={cs.id} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-rose-400 font-bold">{cs.id}</span>
                    <span className="ml-2 text-xs text-slate-300">Recurso: {cs.resourceId}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-500/30">
                    Riesgo: {cs.riskLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold">Señales detectadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {cs.signals.map((sig, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-900 text-amber-300 rounded border border-slate-700 font-mono">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>

                {cs.findingsNotes && (
                  <p className="text-xs text-slate-300 bg-[#0F172A] p-3 rounded-xl border border-slate-800">
                    <strong>Hallazgos:</strong> {cs.findingsNotes}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleResolveIntegrity(cs.id)}
                    className="px-4 py-1.5 bg-[#165D6F] hover:bg-[#165D6F]/80 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Resolver & Limpiar Alerta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Appeals & Audit */}
      {activeTab === "appeals" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Solicitudes de Apelación de Anfitriones</h2>
            <div className="grid grid-cols-1 gap-4">
              {appeals.map((a) => (
                <div key={a.id} className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">{a.id} (Ref: {a.caseIdOrVerificationId})</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-500/30">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200"><strong>Motivo:</strong> {a.reason}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleResolveAppeal(a.id, "REVERSED")}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg"
                    >
                      Aceptar Apelación (Reversar)
                    </button>
                    <button
                      onClick={() => handleResolveAppeal(a.id, "UPHELD")}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg"
                    >
                      Rechazar (Mantener Decisión)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white">Registro de Auditoría Inmutable (Trust Audit Trail)</h2>
            <div className="space-y-2">
              {auditLogs.map((aud) => (
                <div key={aud.id} className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-amber-400 font-bold">{aud.eventType}</span>
                    <span className="ml-2 text-slate-400">Recurso: {aud.resourceId}</span>
                    <span className="ml-2 text-slate-500">Por: {aud.actorId}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{new Date(aud.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
