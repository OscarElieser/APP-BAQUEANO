# 🧭 MODELO DE NOTIFICACIONES Y EVENTOS OPERACIONALES — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Mantener a exploradores y anfitriones comunicados oportunamente respecto a estados críticos de reservas, alertas de seguridad territorial y verificaciones oficiales, erradicando el spam y respetando las preferencias de contacto del usuario.

---

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA & CANALES)

- **Despacho Multicanal**: Soporte para notificaciones dentro de la aplicación web (Notification Center en `/notificaciones`), enlaces contextuales a WhatsApp y preparación para Web Push.
- **Jerarquía de Prioridad**:
  - `CRÍTICA`: Confirmaciones de reserva, cancelaciones, alertas climáticas/SOS.
  - `INFORMATIVA`: Novedades de territorios, sugerencias de sostenibilidad, recordatorios de viaje.

---

## 📦 3. QUÉ (WHAT / MATRIZ DE EVENTOS DE NOTIFICACIÓN)

| Tipo de Evento | Destinatario | Canal Principal | Propósito |
| --- | --- | --- | --- |
| `reservation_requested` | Anfitrión (Host) | Web + WhatsApp | Notificar nueva solicitud de visita. |
| `reservation_confirmed` | Explorador | Web + WhatsApp | Confirmar itinerario y punto de encuentro. |
| `reservation_cancelled` | Explorador / Host | Web | Informar cancelación justificada. |
| `business_verified` | Anfitrión | Web | Notificar otorgamiento del sello Baqueano Verificado. |
| `subscription_expiring` | Anfitrión | Web | Recordatorio previo a vencimiento de plan comercial. |
| `review_received` | Anfitrión | Web | Notificar nueva reseña recibida para moderación/respuesta. |
| `system_alert` | Todos | Web | Alertas ambientales o mantenimiento programado. |
