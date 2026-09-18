import { listPlacesForAdmin } from "@baqueano/firebase";
import type { PlaceRecord } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { AdminButton } from "../../components/ui/AdminButton";
import { MapPinned, Search, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DestinosPage() {
  const result = await listPlacesForAdmin();
  const destinos = result.items;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 drop-shadow-md">Directorio de Destinos</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Administra los territorios, polígonos y lugares geográficos de la plataforma Baqueano.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton variant="secondary" icon={<Search className="w-4 h-4" />}>
            Buscar Destino
          </AdminButton>
        </div>
      </div>

      {/* WARNING DE CONEXIÓN */}
      {!result.isConnected && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
          <MapPinned className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Atención: El sistema está operando en modo local (sin conexión a Firebase). {result.warning}
          </p>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Destino</AdminTableHead>
              <AdminTableHead>Categoría</AdminTableHead>
              <AdminTableHead>Ubicación</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {destinos.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <MapPinned className="w-12 h-12 opacity-20" />
                    <p>No se encontraron destinos registrados.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              destinos.map((destino: PlaceRecord) => {
                const isPublished = destino.status === "published";
                
                return (
                  <AdminTableRow key={destino.id} className="group hover:bg-slate-800/50 transition-colors">
                    <AdminTableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {destino.images && destino.images.length > 0 ? (
                            <img src={destino.images[0]} alt={destino.name} className="w-full h-full object-cover" />
                          ) : (
                            <MapPinned className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{destino.name}</span>
                          <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">ID: {destino.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-slate-300">
                      <span className="capitalize">{destino.category.replace(/_/g, " ")}</span>
                    </AdminTableCell>
                    <AdminTableCell className="text-slate-300 flex flex-col">
                      <span className="text-sm">{destino.location.department}</span>
                      <span className="text-xs text-slate-500">{destino.location.latitude.toFixed(4)}, {destino.location.longitude.toFixed(4)}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={isPublished ? "green" : "orange"} className="flex items-center gap-1.5 w-max">
                        {isPublished ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isPublished ? "Publicado" : "Borrador"}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Link href={`/destinos/${destino.id}`}>
                        <AdminButton variant="outline" size="sm">
                          Administrar
                        </AdminButton>
                      </Link>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
