// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — OPEN DATASET DOWNLOAD ENDPOINT (FASE 13)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer descargas directas de snapshots estáticos en JSON o CSV
//   para investigadores, estudiantes y desarrolladores cívicos.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Next.js Dynamic Route Handler con cabeceras Content-Disposition y caching.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - GET `/api/open/v1/datasets/[datasetId]/download?format=json|csv`
// ============================================================================

import { NextResponse } from "next/server";
import { OPEN_DATASETS_CATALOG } from "@baqueano/config";
import { getStaticDestinationPlaces } from "../../../../../../../services/static-destination.service";
import { getStaticTerritorySummaries } from "../../../../../../../services/static-territory.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const { datasetId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() || "json";

  const dataset = OPEN_DATASETS_CATALOG.find((d) => d.id === datasetId || d.slug === datasetId);

  if (!dataset) {
    return NextResponse.json(
      {
        error: "DATASET_NOT_FOUND",
        message: `El dataset solicitado '${datasetId}' no existe en el catálogo de datos abiertos.`
      },
      { status: 404 }
    );
  }

  let dataRecords: any[] = [];

  if (datasetId === "ds-destinations-public" || dataset.category === "destinations") {
    const envelope = getStaticDestinationPlaces();
    dataRecords = envelope.items.map((p) => ({
      id: p.placeId,
      name: p.name,
      category: p.categoryName,
      department: p.departmentName,
      municipality: p.municipalityName,
      latitude: p.latitude,
      longitude: p.longitude,
      rating: p.rating,
      verified: p.verified
    }));
  } else if (datasetId === "ds-territories-admin" || dataset.category === "territories") {
    const envelope = getStaticTerritorySummaries();
    dataRecords = envelope.items.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      capital: t.capital,
      municipalityCount: t.municipalityCount
    }));
  } else {
    dataRecords = [
      {
        id: "rec-001",
        title: "Güegüense & Tradición Teatral",
        category: "Patrimonio Inmaterial UNESCO",
        territory: "Carazo / Diriamba",
        yearDeclared: 2005
      },
      {
        id: "rec-002",
        title: "Palo de Mayo (Maypole)",
        category: "Danza & Tradición Afrocaribeña",
        territory: "RACCS / Bluefields",
        monthCelebrated: "Mayo"
      }
    ];
  }

  if (format === "csv") {
    if (dataRecords.length === 0) {
      return new NextResponse("", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${dataset.slug}.csv"`
        }
      });
    }

    const headers = Object.keys(dataRecords[0]).join(",");
    const rows = dataRecords
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csvContent = `${headers}\n${rows}`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${dataset.slug}.csv"`,
        "Cache-Control": "public, s-maxage=86400"
      }
    });
  }

  return NextResponse.json(
    {
      datasetId: dataset.id,
      title: dataset.title,
      license: dataset.license,
      attribution: "Baqueano Nicaragua",
      generatedAt: new Date().toISOString(),
      recordCount: dataRecords.length,
      records: dataRecords
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${dataset.slug}.json"`,
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
