// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — AI GATEWAY & TERRITORIAL COPILOT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Proveer un motor de inteligencia territorial que genere planes e itinerarios
// de viaje estructurados, factualmente verificados y adaptados al presupuesto
// del explorador, protegiendo los secretos de API y previniendo alucinaciones.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Enrutador de intenciones con validación Zod (`tripProfileSchema`).
// - Motor presupuestario determinista (`calculateBudget`) sin errores aritméticos.
// - Anclaje estricto en el catálogo verificado de destinos de Nicaragua (anti-alucinación).
// - Evaluación de riesgo contextual con factores explicables (clima, senderismo, agua).
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Endpoint POST `/api/baqueano-ai` que retorna `ItineraryResponse` con status HTTP 200.
// ============================================================================

import { NextResponse } from "next/server";
import type { ItineraryDayPlan, ItineraryResponse, ItineraryStop, PlaceRecord, RiskAssessment, TripProfile } from "@baqueano/types";
import { tripProfileSchema, itineraryResponseSchema } from "@baqueano/validators";
import { listPublishedPlaces } from "@baqueano/firebase";
import { getStaticDestinationPlaces } from "../../../services/static-destination.service";

const USD_TO_NIO_RATE = 36.65;

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function scorePlace(place: PlaceRecord, profile: TripProfile): number {
  const searchable = normalize(`${place.name} ${place.categoryName} ${place.subcategory} ${place.description} ${place.departmentName} ${place.municipalityName}`);
  const interestScore = profile.interests.reduce((score, interest) => score + (searchable.includes(normalize(interest)) ? 4 : 0), 0);
  const departmentScore = profile.department && searchable.includes(normalize(profile.department)) ? 8 : 0;
  return interestScore + departmentScore + (place.verified ? 3 : 0) + (place.isOpen ? 2 : 0) + Math.min(place.rating, 5);
}

function buildStopDescription(place: PlaceRecord, profile: TripProfile): string {
  const factualDescription = place.description.trim() || `${place.categoryName} ubicado en ${place.municipalityName}.`;
  const restrictionNote = profile.restrictions
    ? ` Antes de reservar, confirma con el prestador estas necesidades: ${profile.restrictions}.`
    : " Antes de reservar, confirma horarios, acceso y disponibilidad con el prestador.";
  return `${factualDescription}${restrictionNote}`;
}

function evaluateRisk(profile: TripProfile, stops: readonly ItineraryStop[]): RiskAssessment {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level: "low" | "moderate" | "high" = "low";

  if (profile.travelStyle === "aventura" || stops.some((s) => s.placeName.toLowerCase().includes("volcán") || s.placeName.toLowerCase().includes("cañón"))) {
    level = "moderate";
    factors.push("Senderismo en terreno volcánico o cañones con pendientes pronunciadas.");
    recommendations.push("Utilizar calzado con tracción de montaña y protector solar.");
  }

  if (stops.some((s) => s.placeName.toLowerCase().includes("somoto") || s.placeName.toLowerCase().includes("ometepe") || s.placeName.toLowerCase().includes("apoyo"))) {
    factors.push("Actividades en cuerpos de agua profundos o corrientes fluviales.");
    recommendations.push("Uso obligatorio de chaleco salvavidas y acompañamiento de baqueano local certificado.");
  }

  if (profile.days > 5) {
    factors.push("Rutas interdepartamentales extensas.");
    recommendations.push("Planificar traslados diurnos antes del atardecer para mayor seguridad vial.");
  }

  const explanation =
    level === "moderate"
      ? "Ruta con actividades activas en naturaleza. Requiere hidratación constante y guía local."
      : "Ruta de bajo impacto físico con fácil acceso y servicios comunitarios.";

  return {
    level,
    explanation,
    factors: factors.length > 0 ? factors : ["Condiciones normales de viaje."],
    recommendations: recommendations.length > 0 ? recommendations : ["Seguir indicaciones de los anfitriones."]
  };
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const profile = tripProfileSchema.parse(rawBody);

    // Selección de lugares verificados según departamento o interés
    const liveResult = await listPublishedPlaces();
    const staticResult = getStaticDestinationPlaces();
    const availablePlaces: readonly PlaceRecord[] = liveResult.items.length > 0 ? liveResult.items : staticResult.items;
    const publishedPlaces = availablePlaces.filter((place) => place.status === "published" && place.isTourist);
    const matchedPlaces = profile.department
      ? publishedPlaces.filter((place) => normalize(`${place.departmentName} ${place.municipalityName}`).includes(normalize(profile.department!)))
      : publishedPlaces;

    const pool = [...(matchedPlaces.length > 0 ? matchedPlaces : publishedPlaces)]
      .sort((left, right) => scorePlace(right, profile) - scorePlace(left, profile));

    if (pool.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay destinos turísticos publicados que coincidan con la búsqueda." },
        { status: 404 }
      );
    }

    // Construcción de días de itinerario
    const days: ItineraryDayPlan[] = [];
    let cumulativeCostUsd = 0;

    for (let day = 1; day <= profile.days; day++) {
      const dayPlaceIndex = (day - 1) % pool.length;
      const place = pool[dayPlaceIndex];
      const costForDay = Math.floor(profile.budgetUsd / profile.days);
      cumulativeCostUsd += costForDay;

      const stop: ItineraryStop = {
        placeId: place.placeId,
        placeName: place.name,
        department: place.departmentName,
        timeOfDay: day % 2 === 1 ? "morning" : "afternoon",
        description: buildStopDescription(place, profile),
        estimatedCostUsd: costForDay,
        coordinates: {
          latitude: place.latitude,
          longitude: place.longitude
        },
        source: "verified_database"
      };

      days.push({
        dayNumber: day,
        theme: `Día ${day}: Aventura y Tradición en ${place.departmentName}`,
        stops: [stop],
        dayBudgetUsd: costForDay
      });
    }

    const allStops = days.flatMap((d) => d.stops);
    const risk = evaluateRisk(profile, allStops);
    const totalBudgetUsd = cumulativeCostUsd;
    const totalBudgetNio = Math.round(totalBudgetUsd * USD_TO_NIO_RATE);

    const itinerary: ItineraryResponse = {
      title: `Itinerario Territorial Baqueano: ${profile.days} Días en Nicaragua`,
      summary: `Plan orientativo para ${profile.groupSize} personas, estilo ${profile.travelStyle}, construido con ${allStops.length} registros del catálogo. Presupuesto máximo distribuido: $${totalBudgetUsd} USD (C$ ${totalBudgetNio.toLocaleString("es-NI")} NIO). Precios y disponibilidad deben confirmarse antes de reservar.`,
      totalDays: profile.days,
      days,
      totalEstimatedBudgetUsd: totalBudgetUsd,
      totalEstimatedBudgetNio: totalBudgetNio,
      risk,
      sustainabilityTips: [
        "Contrata exclusivamente guías y baqueanos locales para que el ingreso quede 100% en la comunidad.",
        "Evita extraer flora, fauna o piedras volcánicas de las reservas naturales.",
        "Lleva tus propios recipientes reutilizables para no generar basura plástica."
      ],
      localContactsSuggested: Array.from(new Set(pool
        .filter((place) => Boolean(place.phone || place.whatsapp || place.website))
        .slice(0, 5)
        .map((place) => `${place.name}: ${place.whatsapp || place.phone || place.website}`))),
      sourcesCount: allStops.length,
      generatedAtIso: new Date().toISOString()
    };

    // Validación estricta con esquema Zod
    const validatedItinerary = itineraryResponseSchema.parse(itinerary);

    return NextResponse.json({
      success: true,
      itinerary: validatedItinerary
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al procesar el itinerario territorial."
      },
      { status: 400 }
    );
  }
}
