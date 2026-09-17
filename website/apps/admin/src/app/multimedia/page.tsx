/**
 * WHY
 * Centralizes images and video metadata without coupling files to page code.
 *
 * HOW
 * Uses the shared module scaffold until Firebase Storage workflows are attached.
 *
 * WHAT
 * Multimedia admin route.
 */
import { ModulePlaceholder } from "../../components/ModulePlaceholder";

export default function MultimediaPage() {
  return <ModulePlaceholder title="Multimedia" collection="media" />;
}
