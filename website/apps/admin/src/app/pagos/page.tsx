/**
 * WHY
 * Tracks payment state without exposing secret gateway data to the browser.
 *
 * HOW
 * Uses the shared module scaffold until secure server endpoints are attached.
 *
 * WHAT
 * Payments admin route.
 */
import { ModulePlaceholder } from "../../components/ModulePlaceholder";

export default function PagosPage() {
  return <ModulePlaceholder title="Pagos" collection="payments" />;
}
