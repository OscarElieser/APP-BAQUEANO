// ============================================================================
// 🧭 BAQUEANO — INTERRUPTORES DE FUNCIONES (lib/config/feature_flags.dart)
// ============================================================================
// 🎯 POR QUÉ:
// - Regla del propietario (2026-10-14): BAQUEANO no ofrece reservas; el viajero
//   contacta directamente al local o propietario. Otra regla: no se borra nada
//   de lo construido. Un interruptor apaga lo que ya no se muestra sin eliminar
//   su código ni sus datos (Supabase `reservations` y la Edge Function siguen).
//
// ⚙️ CÓMO:
// - Constantes `const`: el compilador descarta las ramas apagadas, sin costo en
//   tiempo de ejecución. Para reactivar una función basta cambiar el valor.
//
// 📦 QUÉ:
// - `kReservationRequestsEnabled`: botones «Solicitar reserva» / «Reservar» y la
//   sección «Mis reservas». Apagado: se muestra contacto directo con el propietario.
// ============================================================================

/// Solicitudes de reserva (flujo `ReservationRequestSheet`). Apagado por la regla
/// del propietario del 2026-10-14: en su lugar, contacto directo con el negocio.
const bool kReservationRequestsEnabled = false;

/// Chat con anfitriones dentro de la app. Apagado el 2026-10-22: la lista de
/// anfitriones era inventada (nombres y teléfonos) y los mensajes nunca salían del
/// teléfono, aunque la app decía que estaban «en la cola». Se conserva el código:
/// se reactiva cuando exista un canal real con negocios verificados.
const bool kHostMessagingEnabled = false;
