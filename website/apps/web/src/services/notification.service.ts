// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — NOTIFICATION SERVICE
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Centralizar el despacho y lectura de notificaciones operacionales críticas
// (solicitudes de reserva, confirmaciones de anfitriones, alertas de seguridad)
// asegurando que los usuarios y baqueanos se mantengan informados sin spam.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Tipado estricto bajo `NotificationRecord`.
// - Soporte de estados de lectura (`read: boolean`) con marcas temporales.
// - Compatible con Web Push futuro y canal de mensajería contextual.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - `getUserNotifications()`, `markNotificationAsRead()`.
// ============================================================================

import type { DataResult, NotificationRecord } from "@baqueano/types";

const SEED_NOTIFICATIONS: readonly NotificationRecord[] = [
  {
    id: "notif-001",
    recipientUid: "current-user",
    type: "reservation_confirmed",
    title: "Reserva confirmada en Cañón de Somoto",
    body: "Tu solicitud para el recorrido completo fue confirmada por el anfitrión comunitario.",
    read: false,
    resourcePath: "/perfil/reservas",
    createdAt: "2026-09-06T18:00:00.000Z"
  },
  {
    id: "notif-002",
    recipientUid: "current-user",
    type: "system_alert",
    title: "Recomendación ambiental",
    body: "Recuerda llevar cantimplora reutilizable para reducir residuos plásticos en el sendero.",
    read: true,
    resourcePath: "/sostenibilidad",
    createdAt: "2026-09-05T12:00:00.000Z"
  }
];

export async function getUserNotifications(userId: string): Promise<DataResult<NotificationRecord>> {
  const items = SEED_NOTIFICATIONS.filter((n) => !userId || n.recipientUid === userId || n.recipientUid === "current-user");
  return {
    source: "seed",
    isConnected: false,
    items,
    warning: "Notificaciones locales en modo desarrollo."
  };
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  // eslint-disable-next-line no-console
  console.debug(`[Baqueano Notifications] Marked notification as read: ${notificationId}`);
  return { success: true };
}
