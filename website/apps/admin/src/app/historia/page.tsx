/**
 * WHY
 * Lets editors publish national history content without changing app code.
 *
 * HOW
 * Uses the shared module scaffold until timeline editor forms are attached.
 *
 * WHAT
 * History content admin route.
 */
import { ModulePlaceholder } from "../../components/ModulePlaceholder";

export default function HistoriaAdminPage() {
  return <ModulePlaceholder title="Historia" collection="history" />;
}
