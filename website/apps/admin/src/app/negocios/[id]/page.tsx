"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getBusinessById, updateBusiness } from "@baqueano/firebase";
import { AdminButton } from "../../../components/ui/AdminButton";
import { ArrowLeft, Check, X, Building, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import type { BusinessRecord } from "@baqueano/types";
import { AdminBadge } from "../../../components/ui/AdminBadge";

export default function FiscalizarNegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBusinessById(id);
        if (data) setBusiness(data);
        else setError("No se encontró el negocio.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de lectura.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleVerify = async () => {
    if (!business) return;
    setSaving(true);
    try {
      await updateBusiness(id, { verified: true, status: "published" });
      router.push("/negocios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar.");
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!business) return;
    setSaving(true);
    try {
      await updateBusiness(id, { status: "archived" });
      router.push("/negocios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al rechazar.");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400 p-8 text-center">Cargando datos del negocio...</div>;
  if (!business) return <div className="text-red-400 p-8 text-center">{error}</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AdminButton variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
            Volver
          </AdminButton>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Fiscalización: {business.name}</h1>
            <p className="text-sm text-slate-400 font-mono mt-1">ID: {business.id}</p>
          </div>
        </div>
        <AdminBadge variant={business.verified ? "green" : business.status === "archived" ? "red" : "orange"}>
          {business.verified ? "Verificado" : business.status === "archived" ? "Archivado" : "Pendiente de Revisión"}
        </AdminBadge>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* DETALLES DEL NEGOCIO */}
      <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-8">
        
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {business.imageUrl ? (
              <img src={business.imageUrl} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">{business.name}</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{business.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium capitalize border border-slate-700">
                {business.category.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-slate-700/50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UBICACIÓN */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Ubicación y Territorio</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{business.department}, {business.municipality}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Building className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{business.address || "Sin dirección específica"}</span>
              </div>
            </div>
          </div>

          {/* CONTACTO */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Información de Contacto</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-mono">{business.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-mono">{business.phone || "No registrado"}</span>
              </div>
              {business.website && (
                <div className="flex items-center gap-3 text-blue-400">
                  <ExternalLink className="w-4 h-4" />
                  <a href={business.website} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                    {business.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <AdminButton 
          variant="danger" 
          icon={<X className="w-4 h-4" />} 
          onClick={handleReject} 
          disabled={saving || business.status === "archived"}
        >
          Rechazar y Archivar
        </AdminButton>
        <AdminButton 
          variant="primary" 
          icon={<Check className="w-4 h-4" />} 
          onClick={handleVerify} 
          disabled={saving || business.verified}
        >
          Aprobar y Publicar
        </AdminButton>
      </div>

    </div>
  );
}
