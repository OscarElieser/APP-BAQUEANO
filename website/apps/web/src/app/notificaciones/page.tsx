// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — NOTIFICATION CENTER (/notificaciones)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Centraliza las notificaciones de viaje, reservas confirmadas, alertas territoriales
//   y sellos de pasaporte verificados en un único buzón respetuoso y contextual.
// - Elimina tácticas oscuras de urgencia artificial ('urgency theater') priorizando
//   únicamente avisos operativos reales y de seguridad para el explorador.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Filtro multicategoría (Todos, Reservas, Viajes, Alertas de Seguridad, Pasaporte).
// - Sincronización de estado de lectura persistido en la nube / local con deep links
//   canónicos a los recursos afectados (/reservas, /viaje/[tripId], etc.).
// - Renderizado adaptativo responsive compatible con Web, PWA y lectores de pantalla.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Página Next.js con lista interactiva de notificaciones, badge de severidad y enlace directo.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlertSeverity } from "@baqueano/types";

interface ExperienceNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: "RESERVATION" | "TRIP" | "SAFETY" | "PASSPORT" | "SYSTEM";
  targetUrl: string;
  createdAt: string;
  read: boolean;
}

const mockNotifications: ExperienceNotification[] = [
  {
    id: "notif-1",
    title: "Reserva Confirmada: Taller de Café",
    message: "Finca Santa Maura ha confirmado tu reserva para mañana a las 09:00 AM.",
    severity: "info",
    category: "RESERVATION",
    targetUrl: "/reservas",
    createdAt: "2026-09-08T07:30:00Z",
    read: false
  },
  {
    id: "notif-2",
    title: "Alerta de Ruta: Tramo San Ramón",
    message: "Lluvias moderadas en el tramo km 142. Se recomienda vehículo 4x4 o transitar con precaución.",
    severity: "warning",
    category: "SAFETY",
    targetUrl: "/viaje/trip-matagalpa-2026",
    createdAt: "2026-09-08T06:15:00Z",
    read: false
  },
  {
    id: "notif-3",
    title: "Nuevo Sello en tu Pasaporte",
    message: "Has completado la visita verificada a Cascada Blanca. ¡Tu bitácora territorial ha sido actualizada!",
    severity: "info",
    category: "PASSPORT",
    targetUrl: "/pasaporte",
    createdAt: "2026-09-07T16:45:00Z",
    read: true
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ExperienceNotification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "ALL") return true;
    return n.category === activeFilter;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30">Crítico</span>;
      case "warning":
        return <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded border border-amber-500/30">Precaución</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-500/30">Informativo</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F4E6C1] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#F65E01] font-bold">
              <span>Centro de Notificaciones</span>
              <span>•</span>
              <span>Experience OS</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Avisos y Continuidad</h1>
            <p className="text-sm text-slate-400 mt-1">
              Mantén el pulso de tu viaje, reservas y seguridad territorial sin distracciones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs bg-white/5 hover:bg-white/10 text-[#F4E6C1] px-3 py-2 rounded-lg border border-white/10 transition-colors"
              >
                Marcar todas como leídas ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 overflow-x-auto py-4 border-b border-white/5">
          {[
            { id: "ALL", label: "Todas" },
            { id: "RESERVATION", label: "Reservas" },
            { id: "TRIP", label: "Viaje" },
            { id: "SAFETY", label: "Seguridad Territorial" },
            { id: "PASSPORT", label: "Pasaporte" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? "bg-[#165D6F] text-white shadow"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="mt-6 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-sm">No tienes notificaciones en esta categoría.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-5 rounded-2xl border transition-all ${
                  notification.read
                    ? "bg-white/[0.02] border-white/5 opacity-80"
                    : "bg-[#165D6F]/20 border-[#165D6F]/40 shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(notification.severity)}
                      <span className="text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{notification.title}</h3>
                    <p className="text-sm text-slate-300">{notification.message}</p>
                  </div>

                  <Link
                    href={notification.targetUrl}
                    className="shrink-0 bg-[#F65E01] hover:bg-[#F65E01]/90 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
