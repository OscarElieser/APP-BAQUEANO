// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — INVESTIGACION DE MOVILIDAD Y RENTADORAS (ADMIN DATA)
// ============================================================================
//
// 🎯 1. POR QUE (WHY / PROPOSITO):
// Evitar la inclusion de proveedores o vehiculos ficticios en el catalogo
// operativo. Garantiza que solo hechos documentados mediante fuentes oficiales
// (Nivel 1 EAAI) y sitios directos de operadores (Nivel 2 Alamo, Avis, Lugo)
// pasen a revision editorial antes de recibir insignias o estado verificado.
//
// ⚙️ 2. COMO (HOW / ARQUITECTURA & IMPLEMENTACION):
// Estructura inmutable en TypeScript que almacena hechos verificados, datos no
// resueltos, enlaces a fuentes publicas auditadas y estado editorial.
//
// 📦 3. QUE (WHAT / ENTREGABLES & FUNCIONALIDAD):
// Exporta la interfaz `RentalResearchCandidate` y el catalogo `RENTAL_RESEARCH_CANDIDATES`.
// ============================================================================

export interface RentalResearchCandidate {
  readonly id: string;
  readonly name: string;
  readonly status: "ready_for_admin_review" | "disputed";
  readonly verifiedFacts: readonly string[];
  readonly unresolvedFacts: readonly string[];
  readonly sources: readonly {
    name: string;
    url: string;
    type: "official_institution" | "official_website" | "corporate_directory" | "secondary_directory";
  }[];
  readonly lastCheckedAt: string;
}

export const RENTAL_RESEARCH_CANDIDATES: readonly RentalResearchCandidate[] = [
  {
    id: "research-alamo-nicaragua",
    name: "Alamo Rent A Car Nicaragua",
    status: "ready_for_admin_review",
    verifiedFacts: [
      "Operacion activa con oficinas en Aeropuerto Internacional Augusto C. Sandino (Managua), Managua Centro y sucursal de asistencia turistica en San Juan del Sur.",
      "Flota verificada en catalogo oficial: sedanes compactos e intermedios, SUV, camionetas pickup 4x4 y vans familiares para grupos.",
      "Requisitos de conduccion: licencia de conducir vigente del pais de origen, pasaporte valido con sello de entrada y tarjeta de credito fisica para deposito de garantia.",
      "Politica de edad: edad minima de 21 anos con recargos documentados para menores de 25 segun condiciones contractuales."
    ],
    unresolvedFacts: [
      "Tarifas diarias y disponibilidad exacta de modelos varian por temporada y demandan cotizacion fechada.",
      "Costos de coberturas opcionales (CDW/TPL) se cotizan al momento de la reserva."
    ],
    sources: [
      { name: "Alamo Nicaragua Oficial", url: "https://www.alamonicaragua.com/", type: "official_website" },
      { name: "Directorio Global Alamo", url: "https://www.alamo.com/en/car-rental-locations/ni.html", type: "corporate_directory" }
    ],
    lastCheckedAt: "2026-09-21"
  },
  {
    id: "research-avis-nicaragua",
    name: "Avis Rent A Car Nicaragua",
    status: "ready_for_admin_review",
    verifiedFacts: [
      "Mostrador oficial de retiro y devolucion en Aeropuerto Internacional Augusto C. Sandino (MGA) con seleccion de horario y reserva en linea.",
      "Flota publicada: vehiculos compactos, sedanes intermedios, camionetas SUV y vehiculos 4x4 para terreno interdepartamental.",
      "Requisitos documentados: documento de identidad o pasaporte, licencia de conducir valida y tarjeta de credito a nombre del titular de la reserva para el deposito de garantia."
    ],
    unresolvedFacts: [
      "Las tarifas diarias no se consideran fijas; dependen de cotizacion web directa y disponibilidad por fecha.",
      "Politicas de kilometraje y seguro adicional deben validarse con contrato previo."
    ],
    sources: [
      { name: "Avis Nicaragua Oficial", url: "https://www.avis.com.ni/", type: "official_website" },
      { name: "Avis Ubicaciones Nicaragua", url: "https://www.avis.com/en/locations/ni", type: "corporate_directory" }
    ],
    lastCheckedAt: "2026-09-21"
  },
  {
    id: "research-eaai-directorio-aeropuerto",
    name: "Directorio de Rentadoras Aeropuerto EAAI",
    status: "ready_for_admin_review",
    verifiedFacts: [
      "Fuente institucional Nivel 1: Empresa Administradora de Aeropuertos Internacionales (EAAI) publica el directorio oficial de servicios comerciales en terminal.",
      "Establecimientos autorizados con presencia fisica de mostrador en la terminal de llegadas: Dollar Rent A Car, Thrifty Car Rental y Hertz Rent A Car.",
      "Ubicacion verificada: Sala de llegadas internacionales del Aeropuerto Internacional Augusto C. Sandino."
    ],
    unresolvedFacts: [
      "Disponibilidad de vehiculos para pasajeros sin reserva previa en vuelos nocturnos debe confirmarse directamente en mostrador.",
      "Las tarifas, tipos de cobertura y politicas de deposito de cada franquicia operadora requieren consulta directa."
    ],
    sources: [
      { name: "Portal Oficial EAAI Nicaragua", url: "https://eaai.com.ni/", type: "official_institution" }
    ],
    lastCheckedAt: "2026-09-21"
  },
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
