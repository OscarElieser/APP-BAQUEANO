"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPlacesForAdmin } from "@baqueano/firebase";
import type { PlaceRecord } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { AdminButton } from "../../components/ui/AdminButton";
import { MapPin, Plus, Search } from "lucide-react";

export default function DestinosPage() {
  const [places, setPlaces] = useState<readonly PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await listPlacesForAdmin();
      setPlaces(res.items);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Destinos y Puntos de Interés</h1>
          <p className="font-tech text-sm text-white/60">Gestiona los lugares que los exploradores pueden visitar.</p>
        </div>
        <Link href="/destinos/nuevo">
          <AdminButton>
            <Plus size={18} className="mr-2" /> Nuevo Destino
          </AdminButton>
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar destino por nombre o ID..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Destino</AdminTableHead>
              <AdminTableHead>Ubicación</AdminTableHead>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  Cargando red de destinos...
                </AdminTableCell>
              </AdminTableRow>
            ) : places.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  No hay destinos registrados en el sistema.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              places.map((place) => (
                <AdminTableRow key={place.placeId}>
                  <AdminTableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{place.name}</span>
                      <span className="font-tech text-xs text-white/40">{place.placeId}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin size={14} className="text-[#F65E01]" />
                      <span>{place.municipalityName}, {place.departmentName}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <span className="text-white/80">{place.categoryName}</span>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge 
                      variant={place.status === "published" ? "success" : place.status === "draft" ? "warning" : "neutral"}
                    >
                      {place.status}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <Link href={`/destinos/${place.placeId}`}>
                      <AdminButton variant="outline" size="sm">Editar</AdminButton>
                    </Link>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
