/**
 * WHY
 * Gives super admins a controlled place for ecosystem configuration.
 *
 * HOW
 * Uses the shared module scaffold until protected settings forms are attached.
 *
 * WHAT
 * Settings admin route.
 */
import { ModulePlaceholder } from "../../components/ModulePlaceholder";

export default function ConfiguracionPage() {
  return <ModulePlaceholder title="Configuracion" collection="systemConfig" />;
}
