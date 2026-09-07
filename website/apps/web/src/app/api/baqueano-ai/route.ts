/**
 * WHY
 * Reserves the AI Gateway API path without simulating model output as real intelligence.
 *
 * HOW
 * Returns a clear 501 response until a secure server-side gateway is configured.
 *
 * WHAT
 * Placeholder route for future Baqueano AI integration.
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      status: "pending",
      message: "Baqueano AI Gateway is not connected. Provider keys must remain server-side."
    },
    { status: 501 }
  );
}
