"use client";

import { useEffect, useState } from "react";
import { listReservationsForAdmin, updateReservationStatus } from "@baqueano/firebase";
import type { Reservation, ReservationStatus } from "@baqueano/types";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";
import { Search, Calendar, Users, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ReservasPage() {
  const [reservations, setReservations] = useState<readonly Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await listReservationsForAdmin();
    setReservations(res.items);
    setLoading(false);
  }

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    setUpdatingId(reservationId);
    try {
      await updateReservationStatus(reservationId, newStatus);
      setReservations(reservations.map(r => r.id === reservationId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Error al actualizar la reserva.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmada", color: "green", icon: <CheckCircle className="w-3 h-3" /> } as const;
      case "cancelled":
        return { label: "Cancelada", color: "red", icon: <XCircle className="w-3 h-3" /> } as const;
      case "completed":
        return { label: "Completada", color: "blue", icon: <CheckCircle className="w-3 h-3" /> } as const;
      case "pending":
      case "requested":
      case "pending_confirmation":
      default:
        return { label: "Pendiente", color: "orange", icon: <Clock className="w-3 h-3" /> } as const;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Reservas</h1>
          <p className="font-tech text-sm text-white/60">Gestiona y concilia las reservas de experiencias y destinos.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar reserva por ID o Destino..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Detalles del Servicio</AdminTableHead>
              <AdminTableHead>Fecha / Personas</AdminTableHead>
              <AdminTableHead>Total</AdminTableHead>
              <AdminTableHead>Estado</AdminTableHead>
              <AdminTableHead className="text-right">Acciones</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {loading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  Cargando reservas...
                </AdminTableCell>
              </AdminTableRow>
            ) : reservations.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="py-8 text-center text-white/50">
                  No hay reservas registradas en el sistema.
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              reservations.map((reservation) => {
                const statusConfig = getStatusConfig(reservation.status);

                return (
                  <AdminTableRow key={reservation.id} className="group hover:bg-slate-800/50 transition-colors">
                    <AdminTableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{reservation.serviceName || "Servicio Turístico"}</span>
                        <span className="font-tech text-xs text-slate-400">ID: {reservation.id.split("-")[0]}</span>
                        <span className="font-tech text-xs text-slate-500">Destino: {reservation.destinationId.split("-")[0]}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar size={14} className="text-[#165D6F]" />
                          <span className="text-sm">{new Date(reservation.dateIso).toLocaleDateString("es-NI")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users size={14} className="text-[#165D6F]" />
                          <span className="text-sm">{reservation.people} personas</span>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1 text-slate-300 font-mono">
                        <DollarSign size={14} className="text-[#165D6F]" />
                        <span>{reservation.totalPrice?.toFixed(2) || "0.00"} {reservation.currency}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant={statusConfig.color}>
                        <div className="flex items-center gap-1.5">
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <select
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-[#165D6F] focus:border-[#165D6F] block w-full p-2 outline-none cursor-pointer disabled:opacity-50 transition-all"
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value as ReservationStatus)}
                        disabled={updatingId === reservation.id}
                      >
                        <option value="requested">Solicitada</option>
                        <option value="pending_confirmation">Pendiente Confirmación</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
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
