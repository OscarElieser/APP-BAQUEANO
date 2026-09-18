"use client";

import { useState } from "react";
import { Bot, X, FileSearch, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { getAuth } from "firebase/auth";

type AgentReport = {
  agentRole: string;
  status: "PASS" | "WARNING" | "FAIL";
  message: string;
};

type OrchestratorResponse = {
  success: boolean;
  actionRecommended: "APPROVE" | "REJECT" | "REQUIRES_FIXES";
  summary: string;
  agentReports: AgentReport[];
};

export function AdminCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [taskType, setTaskType] = useState<"REVIEW_DESTINATION" | "REVIEW_BUSINESS">("REVIEW_BUSINESS");
  const [result, setResult] = useState<OrchestratorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("No estás autenticado.");

      const res = await fetch("/api/ai/orchestrator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ taskType, resourceId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de red.");
      
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-[#165D6F] hover:bg-[#124d5c] text-white rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Bot className="text-[#F65E01]" size={20} />
          <h3 className="font-semibold text-slate-200">BAQUEANO AI Orchestrator</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <div className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          Hola, soy tu copiloto administrativo. Puedo auditar contenidos verificando coherencia, SEO, métricas y seguridad usando múltiples agentes.
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider">Tipo de Tarea</label>
          <select 
            className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as any)}
          >
            <option value="REVIEW_BUSINESS">Auditar Negocio</option>
            <option value="REVIEW_DESTINATION">Auditar Destino</option>
          </select>

          <label className="text-xs text-slate-400 uppercase tracking-wider mt-2">ID del Recurso</label>
          <input 
            type="text" 
            placeholder="Ej. biz_12345"
            className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
          />

          <button 
            onClick={handleAnalyze}
            disabled={loading || !resourceId}
            className="mt-2 flex items-center justify-center gap-2 bg-[#F65E01] hover:bg-[#d95301] disabled:bg-slate-700 disabled:text-slate-400 text-white p-2 rounded text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <FileSearch size={16} />}
            {loading ? "Analizando Contexto..." : "Ejecutar Análisis Multiagente"}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 p-3 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4 mt-2 border-t border-slate-800 pt-4">
            <div className={`p-3 rounded-lg text-sm border flex flex-col gap-1 ${
              result.actionRecommended === "APPROVE" ? "bg-green-900/20 border-green-900/50 text-green-300" :
              result.actionRecommended === "REQUIRES_FIXES" ? "bg-amber-900/20 border-amber-900/50 text-amber-300" :
              "bg-red-900/20 border-red-900/50 text-red-300"
            }`}>
              <span className="font-semibold uppercase text-xs opacity-70">Decisión Sugerida</span>
              <span className="font-bold">{result.actionRecommended}</span>
              <p className="mt-1 opacity-90">{result.summary}</p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Reporte de Agentes</span>
              {result.agentReports.map((report, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="mt-0.5">
                    {report.status === "PASS" ? <CheckCircle className="text-green-500" size={16} /> :
                     report.status === "WARNING" ? <AlertTriangle className="text-amber-500" size={16} /> :
                     <XCircle className="text-red-500" size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">{report.agentRole.replace("_AI", " AI")}</span>
                    <span className="text-xs text-slate-400 leading-tight mt-0.5">{report.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
