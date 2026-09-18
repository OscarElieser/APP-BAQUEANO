import { listBusinessesForAdmin } from "@baqueano/firebase";
import type { BusinessRecord } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { AdminButton } from "../../components/ui/AdminButton";
import { Briefcase, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function NegociosPage() {
  const result = await listBusinessesForAdmin();
  const negocios = result.items;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 drop-shadow-md">Directorio de Negocios</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Administra los emprendimientos registrados, fiscaliza su estado y aprueba nuevas solicitudes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton variant="secondary" icon={<Search className="w-4 h-4" />}>
            Buscar
          </AdminButton>
        </div>
      </div>

      {/* WARNING DE CONEXIÓN */}
      {!result.isConnected && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
          <Briefcase className="w-5 h-5 flex-shrink-0" />
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
              <AdminTableHead>Negocio</AdminTableHead>
              <AdminTableHead>Tipo</AdminTableHead>
              <AdminTableHead>Departamento</AdminTableHead>
              <AdminTableHead>Estado de Verificación</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {negocios.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Briefcase className="w-12 h-12 opacity-20" />
                    <p>No se encontraron negocios registrados.</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              negocios.map((negocio: BusinessRecord) => {
                const getStatusConfig = (status: string, verified: boolean) => {
                  if (verified) {
                    return { label: "Verificado", color: "green", icon: <CheckCircle className="w-3 h-3" /> } as const;
                  }
                  switch (status) {
                    case "published":
                      return { label: "Publicado (No verif.)", color: "orange", icon: <CheckCircle className="w-3 h-3" /> } as const;
                    case "archived":
                      return { label: "Archivado", color: "red", icon: <XCircle className="w-3 h-3" /> } as const;
                    case "pending_review":
                    default:
                      return { label: "Pendiente", color: "orange", icon: <Clock className="w-3 h-3" /> } as const;
                  }
                };
                
                const statusConfig = getStatusConfig(negocio.status, negocio.verified);
                
                return (
                  <AdminTableRow key={negocio.id} className="group hover:bg-slate-800/50 transition-colors">
                    <AdminTableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {negocio.imageUrl ? (
                            <img src={negocio.imageUrl} alt={negocio.name} className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{negocio.name}</span>
                          <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">ID: {negocio.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-slate-300">
                      <span className="capitalize">{negocio.category.replace(/_/g, " ")}</span>
                    </AdminTableCell>
                    <AdminTableCell className="text-slate-300">
                      {negocio.department}
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={statusConfig.color} className="flex items-center gap-1.5 w-max">
                        {statusConfig.icon}
                        {statusConfig.label}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Link href={`/negocios/${negocio.id}`}>
                        <AdminButton variant="outline" size="sm">
                          Fiscalizar
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
