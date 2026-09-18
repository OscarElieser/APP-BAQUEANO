"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlace } from "@baqueano/firebase";
import { AdminButton } from "../../../components/ui/AdminButton";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevoDestinoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simplified form state matching the core of PlaceRecordInput
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "natural",
    categoryName: "Naturaleza",
    departmentId: "leon",
    departmentName: "León",
    municipalityId: "leon_city",
    municipalityName: "León",
    description: "",
    address: "",
    latitude: 12.4333,
    longitude: -86.8833,
    status: "draft" as "draft" | "published" | "archived"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      const newPlaceId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      
      await createPlace({
        ...formData,
        placeId: newPlaceId,
        subcategory: "",
        geohash: "",
        imageUrl: "",
        imageUrls: [],
        rating: 5,
        reviewCount: 0,
        is24Hours: false,
        isOpen: true,
        isEmergency: false,
        isTourist: true,
        isCommercial: false,
        verified: true,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      router.push("/destinos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el destino");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-white">Nuevo Destino</h1>
          <p className="font-tech text-sm text-white/60">Completa la ficha técnica del nuevo atractivo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-white/10 bg-[#08111f] p-6 lg:p-8">
        
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Sección: Identidad */}
        <div className="space-y-4">
          <h2 className="font-tech text-xs font-bold uppercase tracking-wider text-[#F65E01]">1. Identidad</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Nombre Oficial</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
                placeholder="Ej. Volcán Cerro Negro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06] [&>option]:bg-[#08111f]"
              >
                <option value="draft">Borrador (Draft)</option>
                <option value="published">Publicado (Published)</option>
                <option value="archived">Archivado (Archived)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección: Ubicación Geográfica */}
        <div className="space-y-4">
          <h2 className="font-tech text-xs font-bold uppercase tracking-wider text-[#F65E01]">2. Ubicación Geográfica</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Departamento</label>
              <input
                required
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Municipio</label>
              <input
                required
                type="text"
                name="municipalityName"
                value={formData.municipalityName}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Latitud</label>
              <input
                required
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Longitud</label>
              <input
                required
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Dirección Física</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full resize-none rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
            />
          </div>
        </div>

        {/* Sección: Descripción */}
        <div className="space-y-4">
          <h2 className="font-tech text-xs font-bold uppercase tracking-wider text-[#F65E01]">3. Descripción</h2>
          <div className="space-y-2">
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descripción completa del atractivo turístico..."
              className="w-full resize-none rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <AdminButton type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" disabled={loading}>
            {loading ? "Guardando..." : <><Save size={18} className="mr-2" /> Guardar Destino</>}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
