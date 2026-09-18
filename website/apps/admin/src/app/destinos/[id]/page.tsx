"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPlaceById, updatePlace } from "@baqueano/firebase";
import { AdminButton } from "../../../components/ui/AdminButton";
import { ArrowLeft, Save } from "lucide-react";

export default function EditarDestinoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    departmentName: "",
    municipalityName: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    status: "draft" as "draft" | "published" | "archived"
  });

  useEffect(() => {
    async function load() {
      try {
        const place = await getPlaceById(id);
        if (!place) {
          setError("Destino no encontrado.");
          setLoading(false);
          return;
        }

        setFormData({
          name: place.name,
          departmentName: place.departmentName,
          municipalityName: place.municipalityName,
          description: place.description,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          status: place.status as "draft" | "published" | "archived"
        });
      } catch (err) {
        setError("Error al cargar el destino.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updatePlace(id, formData);
      router.push("/destinos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el destino");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white/50">Cargando destino...</div>;
  }

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
          <h1 className="font-display text-2xl font-black text-white">Editar Destino</h1>
          <p className="font-tech text-sm text-white/60">Modifica la información de {formData.name}</p>
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
              className="w-full resize-none rounded-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#F65E01] focus:bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <AdminButton type="button" variant="ghost" onClick={() => router.back()} disabled={saving}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Guardando..." : <><Save size={18} className="mr-2" /> Guardar Cambios</>}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
