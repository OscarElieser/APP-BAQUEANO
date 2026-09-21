/**
 * POR QUE
 * Los proveedores sugeridos necesitan revision humana antes de entrar al
 * catalogo operativo o recibir una insignia de verificacion.
 *
 * COMO
 * Conserva solo hechos respaldados por fuentes publicas consultadas el
 * 2026-09-21. Las contradicciones y tarifas no verificadas quedan explicitas.
 *
 * QUE
 * Cola editorial de Lugo, LAGO y Payless; no crea registros Firestore.
 */
export interface RentalResearchCandidate {
  readonly id: string;
  readonly name: string;
  readonly status: "ready_for_admin_review" | "disputed";
  readonly verifiedFacts: readonly string[];
  readonly unresolvedFacts: readonly string[];
  readonly sources: readonly { name: string; url: string; type: "official_website" | "corporate_directory" | "secondary_directory" }[];
  readonly lastCheckedAt: string;
}

export const RENTAL_RESEARCH_CANDIDATES: readonly RentalResearchCandidate[] = [
  {
    id: "research-lugo-rent-a-car",
    name: "Lugo Rent a Car",
    status: "ready_for_admin_review",
    verifiedFacts: [
      "Oficina central al costado norte de ENEL Central y sucursal declarada en el aeropuerto de Managua.",
      "Flota publicada: Hyundai Tucson y Creta; Toyota Agya, Yaris, Hilux 4x4 y Prado.",
      "Requisitos publicados: identificacion, licencia vigente, edad mayor de 23 y deposito con tarjeta.",
      "Sillas para bebe, conductores y asistencia tecnica y legal 24 horas."
    ],
    unresolvedFacts: [
      "Tarifas de USD 30 a 60 no verificadas para fechas concretas.",
      "Disponibilidad de modelos requiere consulta en tiempo real."
    ],
    sources: [
      { name: "Lugo Rent a Car", url: "https://www.lugorentacar.com.ni/", type: "official_website" },
      { name: "Contacto Lugo", url: "https://www.lugorentacar.com.ni/contacto/", type: "official_website" }
    ],
    lastCheckedAt: "2026-09-21"
  },
  {
    id: "research-lago-rent-a-car",
    name: "LAGO Rent a Car",
    status: "disputed",
    verifiedFacts: [
      "Direccion oficial: SINSA Carretera Norte, 2 cuadras abajo, 1 al lago y 25 varas abajo.",
      "El sitio declara entrega en aeropuerto, seguro basico incluido y deposito de seguridad.",
      "El catalogo anunciado cubre compactos y minivanes."
    ],
    unresolvedFacts: [
      "El sitio oficial publica +505 7555-8666; un directorio secundario publica +505 8864-4093.",
      "Pagos NFC y tarifas de USD 25 a 50 no fueron corroborados en la fuente oficial.",
      "Modelos y disponibilidad requieren confirmacion."
    ],
    sources: [
      { name: "LAGO Rent a Car", url: "https://lagorentacar.com/en/", type: "official_website" },
      { name: "Directorio social LAGO", url: "https://www.autoyas.com/NI/Managua/623872321754965/Lago-Rent-a-Car", type: "secondary_directory" }
    ],
    lastCheckedAt: "2026-09-21"
  },
  {
    id: "research-payless-nicaragua",
    name: "Payless Car Rental Nicaragua",
    status: "disputed",
    verifiedFacts: [
      "La operacion nacional publica asistencia tecnica y legal 24 horas.",
      "Telefonos de emergencia publicados: 8856 1509 y 2255 9008.",
      "El directorio corporativo mantiene ubicaciones nicaraguenses fuera del aeropuerto."
    ],
    unresolvedFacts: [
      "El directorio corporativo marca la oficina del aeropuerto como cerrada desde 2026-04-28.",
      "Tarifas de USD 9 a 46 y disponibilidad de modelos no fueron verificadas para fechas concretas.",
      "Depositos y coberturas varian por reserva y deben cotizarse."
    ],
    sources: [
      { name: "Payless Nicaragua", url: "https://dev.payless.com.ni/", type: "official_website" },
      { name: "Directorio corporativo Payless Nicaragua", url: "https://www.paylesscar.com/en/locations/ni", type: "corporate_directory" }
    ],
    lastCheckedAt: "2026-09-21"
  }
] as const;
