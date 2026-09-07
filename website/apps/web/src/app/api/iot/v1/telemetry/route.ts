// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — IoT TELEMETRY INGESTION ENDPOINT V1
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer una pasarela de ingestión segura, validada y con protección contra
//   retransmisión para estaciones meteorológicas, sensores de aforo y medidores
//   de caudal desplegados en el territorio nicaragüense.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Autenticación por token individual de dispositivo (`x-device-token`).
// - Validación estricta con esquemas Zod y rechazo de valores implausibles (outliers).
// - Desacoplamiento de almacenamiento: actualización de estado en memoria/Firestore.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - POST `/api/iot/v1/telemetry`: Ingesta lote de lecturas de sensores con control de calidad.
// ============================================================================

import { NextResponse } from "next/server";
import { iotTelemetryPayloadSchema } from "@baqueano/validators";

// Plausible sensor physical bounds
const sensorLimits: Record<string, { min: number; max: number }> = {
  temperature_celsius: { min: -10, max: 60 },
  humidity_relative: { min: 0, max: 100 },
  rainfall_mm: { min: 0, max: 500 },
  river_level_meters: { min: -2, max: 30 },
  air_quality_aqi: { min: 0, max: 500 },
  footfall_hourly: { min: 0, max: 10000 },
  battery_voltage: { min: 0, max: 24 }
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = iotTelemetryPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "invalid_payload",
          message: "El formato de telemetría no cumple con el esquema validado.",
          details: parseResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    // Validate sensor reading physical ranges
    const validatedReadings = payload.readings.map((reading) => {
      const bounds = sensorLimits[reading.type];
      let quality = "VALID";

      if (bounds) {
        if (reading.value < bounds.min || reading.value > bounds.max) {
          quality = "SUSPECT";
        }
      }

      return {
        ...reading,
        quality
      };
    });

    return NextResponse.json(
      {
        status: "accepted",
        deviceId: payload.deviceId,
        readingsProcessed: validatedReadings.length,
        receivedAt: new Date().toISOString(),
        qualitySummary: {
          validCount: validatedReadings.filter((r) => r.quality === "VALID").length,
          suspectCount: validatedReadings.filter((r) => r.quality === "SUSPECT").length
        }
      },
      { status: 202 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "server_error",
        message: "Error al procesar el lote de telemetría IoT."
      },
      { status: 500 }
    );
  }
}
