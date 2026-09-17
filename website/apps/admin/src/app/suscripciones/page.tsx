/**
 * WHY
 * Shows host subscription readiness without unsafe client-side billing changes.
 *
 * HOW
 * Uses a server-rendered scaffold aligned with `business_subscriptions`.
 *
 * WHAT
 * Subscriptions admin route.
 */
import { ModulePlaceholder } from "../../components/ModulePlaceholder";

export default function SuscripcionesPage() {
  return <ModulePlaceholder title="Suscripciones" collection="business_subscriptions" />;
}
