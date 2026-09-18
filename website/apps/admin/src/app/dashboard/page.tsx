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
                <div key={log.id} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72 flex justify-between">
                  <span>
                    <strong className="text-white">{log.actorEmail}</strong> ({log.actorRole}) - {log.action} en {log.collection}
                  </span>
                  <span className="text-xs text-white/50">{new Date(log.createdAtIso).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No hay actividad reciente registrada.</p>
            )}
          </div>
        </AdminPanel>
        <AdminPanel title="RBAC activo">
          <div className="grid gap-2 text-sm text-white/70">
            {["super_admin: control completo", "admin: contenido y validaciones", "auditor: read-only total", "host: negocio propio", "explorer: datos personales"].map((item) => (
              <div key={item} className="rounded-md bg-[#10B981]/10 px-3 py-2 font-tech text-xs uppercase text-[#9EF1D2]">{item}</div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
