/**
 * WHY
 * Gives staging and production a small, non-sensitive readiness signal.
 *
 * HOW
 * Validates public runtime configuration and returns only version, environment, and status.
 *
 * WHAT
 * GET /api/health for uptime checks without exposing secrets or internal config values.
 */
import { validatePublicEnvironment } from "@baqueano/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validatePublicEnvironment();

  return NextResponse.json(
    {
      status: validation.ok ? "ok" : "degraded",
      version: process.env.NEXT_PUBLIC_BAQUEANO_VERSION ?? "0.4.0-rc1",
      environment: validation.environment,
      missing: validation.missing
    },
    {
      status: validation.ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
