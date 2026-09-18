"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPlaceById, updatePlace } from "@baqueano/firebase";
import { AdminButton } from "../../../components/ui/AdminButton";
import { ArrowLeft, Check, X, MapPin, Compass, DollarSign, Image as ImageIcon } from "lucide-react";
import type { PlaceRecord } from "@baqueano/types";
import { AdminBadge } from "../../../components/ui/AdminBadge";

export default function AdministrarDestinoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [place, setPlace] = useState<PlaceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlaceById(id);
        if (data) setPlace(data);
        else setError("No se encontró el destino.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de lectura.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleVerify = async () => {
    if (!place) return;
    setSaving(true);
    try {
      await updatePlace(id, { status: "published" });
      router.push("/destinos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar.");
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!place) return;
    setSaving(true);
    try {
      await updatePlace(id, { status: "archived" });
      router.push("/destinos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al archivar.");
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400 p-8 text-center">Cargando datos del destino...</div>;
  if (!place) return <div className="text-red-400 p-8 text-center">{error}</div>;

  const isPublished = place.status === "published";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AdminButton variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
            Volver
          </AdminButton>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Destino: {place.name}</h1>
            <p className="text-sm text-slate-400 font-mono mt-1">ID: {place.id}</p>
          </div>
        </div>
        <AdminBadge variant={isPublished ? "green" : place.status === "archived" ? "red" : "orange"}>
          {isPublished ? "Publicado" : place.status === "archived" ? "Archivado" : "Borrador"}
        </AdminBadge>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* AI RECOMMENDATION HINT */}
      {place.status === "draft" && (
        <div className="bg-[#165D6F]/20 border border-[#165D6F]/50 text-slate-200 p-4 rounded-xl text-sm flex items-start gap-3">
          <div className="text-[#F65E01] mt-0.5">✨</div>
          <p>
            <strong className="text-white">Tip de Curatoría:</strong> Abre el <strong>Copiloto IA</strong> y pide una evaluación SEO y cultural para este destino. El orquestador analizará sus metadatos e imágenes para sugerir mejoras antes de publicarlo.
          </p>
        </div>
      )}

      {/* DETALLES DEL DESTINO */}
      <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-8">
        
        {/* GALERÍA PRINCIPAL */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Galería Visual
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {place.images && place.images.length > 0 ? (
              place.images.map((img, i) => (
                <div key={i} className="w-64 h-40 flex-shrink-0 snap-center rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-64 h-40 flex-shrink-0 flex items-center justify-center rounded-xl border border-dashed border-slate-700 text-slate-500">
                Sin imágenes
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{place.description}</p>
        </div>

        <hr className="border-slate-700/50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UBICACIÓN */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Ubicación (GIS)</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-[#F65E01]" />
                <span className="text-sm">{place.location.department}, {place.location.municipality}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Compass className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-mono text-slate-400">Lat: {place.location.latitude} / Lng: {place.location.longitude}</span>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN PRÁCTICA */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Contexto del Destino</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-4 h-4 text-slate-500 flex items-center justify-center font-bold text-xs">C</span>
                <span className="text-sm capitalize">Categoría: {place.category.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono">Costo Est.: {place.estimatedCost} USD</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="w-4 h-4 text-slate-500 flex items-center justify-center font-bold text-xs">D</span>
                <span className="text-sm capitalize">Dificultad: {place.difficulty}</span>
              </div>
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
          disabled={saving || place.status === "archived"}
        >
          Retirar / Archivar
        </AdminButton>
        <AdminButton 
          variant="primary" 
          icon={<Check className="w-4 h-4" />} 
          onClick={handleVerify} 
          disabled={saving || isPublished}
        >
          Publicar Destino
        </AdminButton>
      </div>

    </div>
  );
}
