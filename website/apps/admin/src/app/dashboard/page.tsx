"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, Leaf, MapPinned, Users } from "lucide-react";
import { AdminMetric, AdminPanel } from "../../components/AdminCards";
import { listPlacesForAdmin, listBusinessesForAdmin, listPaymentOrdersForAdmin, listAuditLogs } from "@baqueano/firebase";
import type { PlaceRecord, BusinessRecord, PaymentOrderRecord, AuditLog } from "@baqueano/types";

export default function DashboardPage() {
  const [places, setPlaces] = useState<readonly PlaceRecord[]>([]);
  const [businesses, setBusinesses] = useState<readonly BusinessRecord[]>([]);
  const [payments, setPayments] = useState<readonly PaymentOrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<readonly AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [placesRes, businessesRes, paymentsRes, auditLogsRes] = await Promise.all([
          listPlacesForAdmin(),
          listBusinessesForAdmin(),
          listPaymentOrdersForAdmin(),
          listAuditLogs(10)
        ]);
        setPlaces(placesRes.items);
        setBusinesses(businessesRes.items);
        setPayments(paymentsRes.items);
        setAuditLogs(auditLogsRes.items);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const publishedPlaces = places.filter((p) => p.status === "published").length;
  const draftPlaces = places.filter((p) => p.status === "draft").length;
  const totalRevenue = payments.reduce((acc, p) => acc + p.amountUsd, 0);

  return (
    <div>
      <div className="mb-6">
        <p className="font-tech text-xs font-bold uppercase text-[#F65E01]">Vista general</p>
        <h1 className="font-display text-3xl font-black text-white">Operacion viva del ecosistema</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminMetric 
          label="Destinos" 
          value={loading ? "..." : places.length.toString()} 
          detail={`${publishedPlaces} publicados, ${draftPlaces} en borrador`} 
          icon={<MapPinned size={22} />} 
        />
        <AdminMetric 
          label="Negocios" 
          value={loading ? "..." : businesses.length.toString()} 
          detail={`${businesses.filter((b) => b.status === "published").length} publicados, ${businesses.filter((b) => b.status === "pending_review").length} en revision`} 
          icon={<Users size={22} />} 
        />
        <AdminMetric 
          label="Pagos" 
          value={loading ? "..." : `$${totalRevenue.toLocaleString()}`} 
          detail="Reservas y suscripciones totales" 
          icon={<CreditCard size={22} />} 
        />
        <AdminMetric 
          label="Impacto" 
          value="87%" 
          detail="Indice compuesto de sostenibilidad" 
          icon={<Leaf size={22} />} 
        />
        <AdminMetric 
          label="Incidencias SOS" 
          value="0" 
          detail="Alertas activas recientes" 
          icon={<AlertTriangle size={22} />} 
        />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel title="Actividad reciente">
          <div className="grid gap-3">
            {loading ? (
              <p className="text-white/50 text-sm">Cargando actividad...</p>
            ) : auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-xs">{log.actorEmail}</span>
                    <span>{log.action} en {log.collection}</span>
                  </div>
                  <span className="text-xs text-[#F65E01] font-tech">{new Date(log.createdAtIso).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No hay actividad reciente registrada.</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Cola de Auditoría (Requiere Acción)">
          <div className="grid gap-3">
            {loading ? (
              <p className="text-white/50 text-sm">Cargando pendientes...</p>
            ) : businesses.filter(b => b.status === "pending_review").length > 0 ? (
              businesses.filter(b => b.status === "pending_review").slice(0, 5).map((biz) => (
                <a key={biz.id} href={`/negocios/${biz.id}`} className="block group">
                  <div className="rounded-md border border-amber-900/50 bg-amber-900/10 hover:bg-amber-900/20 px-4 py-3 text-sm text-white transition-colors flex justify-between items-center">
                    <div className="flex flex-col">
                      <strong className="text-amber-400 group-hover:text-amber-300">{biz.name}</strong>
                      <span className="text-xs text-white/50 mt-0.5">Correo: {biz.email || "N/A"}</span>
                    </div>
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-2 py-1 rounded">REVISAR</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="flex items-center justify-center p-6 border border-dashed border-white/10 rounded-lg">
                <p className="text-white/50 text-sm">No hay negocios pendientes de revisión. 🎉</p>
              </div>
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
