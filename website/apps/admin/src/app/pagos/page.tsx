/**
 * WHY
 * Keeps payment oversight visible without exposing unsafe client-side payment reads or writes.
 *
 * HOW
 * Presents a server-rendered operational scaffold for `payment_orders` and `payment_transactions`.
 *
 * WHAT
 * Payments admin route with honest integration status.
 */
import { AdminPanel } from "../../components/AdminCards";

export default function PagosPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black text-white">Pagos y liquidaciones</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        Lectura y conciliacion real pendientes de endpoints seguros. No se almacenan secretos ni datos bancarios en frontend.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AdminPanel title="Ordenes de pago">
          <p className="text-sm leading-6 text-white/60">Preparado para `payment_orders` con estados pending, paid, failed y refunded.</p>
        </AdminPanel>
        <AdminPanel title="Transacciones">
          <p className="text-sm leading-6 text-white/60">Preparado para `payment_transactions` con auditoria y conciliacion server-side.</p>
        </AdminPanel>
      </div>
    </div>
  );
}
