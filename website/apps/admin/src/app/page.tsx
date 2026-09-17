/**
 * WHY
 * Sends operators to the main dashboard entry point.
 *
 * HOW
 * Uses a server redirect to avoid duplicate dashboard shells.
 *
 * WHAT
 * Root admin route redirect.
 */
import { redirect } from "next/navigation";

export default function AdminRootPage() {
  redirect("/dashboard");
}
