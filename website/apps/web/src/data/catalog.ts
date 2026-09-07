/**
 * WHY
 * Provides safe local content while Firebase collections are connected.
 *
 * HOW
 * Keeps records shaped like shared Firestore contracts, so migration to live data is direct.
 *
 * WHAT
 * Featured destinations, territories, dishes, history periods, and impact metrics.
 */
import type { Destination, Territory } from "@baqueano/types";

export const featuredDestinations: readonly Destination[] = [
  {
    id: "dest-canon-somoto",
    slug: "canon-de-somoto",
    name: "Canon de Somoto",
    department: "Madriz",
    municipality: "Somoto",
    category: "Canon y rio",
    coordinates: { latitude: 13.4817, longitude: -86.5821 },
    summary: "Paredes antiguas, agua clara y caminata guiada por comunidades del norte.",
    story: "Una ruta de roca viva donde el agua ha escrito lentamente una geografia profunda. La experiencia se trabaja con guias locales y grupos controlados para cuidar el cauce.",
    priceUsd: 28,
    difficulty: "media",
    durationHours: 5,
    rating: 4.9,
    sustainabilityScore: 94,
    heroImage: "/assets/images/destinos/canon_de_somoto.jpg",
    gallery: ["/assets/images/destinos/canon_de_somoto.jpg"],
    tags: ["rio", "geologia", "comunidad"],
    status: "published",
    updatedAtIso: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "dest-ometepe",
    slug: "isla-de-ometepe",
    name: "Isla de Ometepe",
    department: "Rivas",
    municipality: "Moyogalpa",
    category: "Reserva de biosfera",
    coordinates: { latitude: 11.5384, longitude: -85.6224 },
    summary: "Dos volcanes, senderos, petroglifos y fincas sostenibles en el Gran Lago.",
    story: "Ometepe combina memoria arqueologica, agricultura familiar, volcanes y comunidades que viven alrededor del lago. Baqueano prioriza rutas desconcentradas y anfitriones verificados.",
    priceUsd: 35,
    difficulty: "alta",
    durationHours: 8,
    rating: 4.8,
    sustainabilityScore: 91,
    heroImage: "/assets/images/destinos/isla_de_ometepe.jpg",
    gallery: ["/assets/images/destinos/isla_de_ometepe.jpg"],
    tags: ["volcan", "lago", "petroglifos"],
    status: "published",
    updatedAtIso: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "dest-cerro-negro",
    slug: "cerro-negro",
    name: "Cerro Negro",
    department: "Leon",
    municipality: "Leon",
    category: "Volcan activo",
    coordinates: { latitude: 12.5069, longitude: -86.7028 },
    summary: "Arena volcanica, horizonte abierto y descenso controlado con guias certificados.",
    story: "El volcan mas joven de Centroamerica exige respeto operativo: casco, gafas, rutas delimitadas y horarios adecuados para proteger visitantes y terreno.",
    priceUsd: 30,
    difficulty: "media",
    durationHours: 4,
    rating: 4.7,
    sustainabilityScore: 87,
    heroImage: "/assets/images/destinos/cerro_negro.jpg",
    gallery: ["/assets/images/destinos/cerro_negro.jpg"],
    tags: ["volcan", "aventura", "arena"],
    status: "published",
    updatedAtIso: "2026-09-07T00:00:00.000Z"
  },
  {
    id: "dest-apoyo",
    slug: "laguna-de-apoyo",
    name: "Laguna de Apoyo",
    department: "Masaya",
    municipality: "Catarina",
    category: "Laguna volcanica",
    coordinates: { latitude: 11.9222, longitude: -86.0294 },
    summary: "Agua de crater, miradores, kayak y conservacion entre Masaya y Granada.",
    story: "La laguna invita a bajar el ritmo. Sus actividades deben respetar zonas de vida silvestre, carga turistica y comercios familiares cercanos.",
    priceUsd: 22,
    difficulty: "suave",
    durationHours: 6,
    rating: 4.8,
    sustainabilityScore: 90,
    heroImage: "/assets/images/destinos/laguna_de_apoyo.jpg",
    gallery: ["/assets/images/destinos/laguna_de_apoyo.jpg"],
    tags: ["laguna", "kayak", "mirador"],
    status: "published",
    updatedAtIso: "2026-09-07T00:00:00.000Z"
  }
];

export const territories: readonly Territory[] = [
  { slug: "boaco", name: "Boaco", type: "departamento", capital: "Boaco", culturalSignal: "Ganaderia y montanas", landscape: "Cordillera central" },
  { slug: "carazo", name: "Carazo", type: "departamento", capital: "Jinotepe", culturalSignal: "Danzas y cafetales", landscape: "Meseta del Pacifico" },
  { slug: "chinandega", name: "Chinandega", type: "departamento", capital: "Chinandega", culturalSignal: "Volcanes y playas", landscape: "Pacifico volcanico" },
  { slug: "chontales", name: "Chontales", type: "departamento", capital: "Juigalpa", culturalSignal: "Tradicion ganadera", landscape: "Rios y serranias" },
  { slug: "esteli", name: "Esteli", type: "departamento", capital: "Esteli", culturalSignal: "Muralismo y tabaco", landscape: "Altiplano fresco" },
  { slug: "granada", name: "Granada", type: "departamento", capital: "Granada", culturalSignal: "Ciudad colonial", landscape: "Lago e isletas" },
  { slug: "jinotega", name: "Jinotega", type: "departamento", capital: "Jinotega", culturalSignal: "Cafe y nebliselva", landscape: "Montanas del norte" },
  { slug: "leon", name: "Leon", type: "departamento", capital: "Leon", culturalSignal: "Universidad y poesia", landscape: "Volcanes y costa" },
  { slug: "madriz", name: "Madriz", type: "departamento", capital: "Somoto", culturalSignal: "Artesania y canyon", landscape: "Norte seco" },
  { slug: "managua", name: "Managua", type: "departamento", capital: "Managua", culturalSignal: "Capital y memoria urbana", landscape: "Lago Xolotlan" },
  { slug: "masaya", name: "Masaya", type: "departamento", capital: "Masaya", culturalSignal: "Artesania y marimba", landscape: "Volcan y pueblos blancos" },
  { slug: "matagalpa", name: "Matagalpa", type: "departamento", capital: "Matagalpa", culturalSignal: "Cafe y reservas", landscape: "Bosque nuboso" },
  { slug: "nueva-segovia", name: "Nueva Segovia", type: "departamento", capital: "Ocotal", culturalSignal: "Pinares y frontera", landscape: "Altas montanas" },
  { slug: "rio-san-juan", name: "Rio San Juan", type: "departamento", capital: "San Carlos", culturalSignal: "Fortalezas y selva", landscape: "Rio historico" },
  { slug: "rivas", name: "Rivas", type: "departamento", capital: "Rivas", culturalSignal: "Lago, playa y volcan", landscape: "Istmo lacustre" },
  { slug: "raccn", name: "RACCN", type: "region_autonoma", capital: "Bilwi", culturalSignal: "Pueblos originarios y Caribe Norte", landscape: "Costa, rios y bosques" },
  { slug: "raccs", name: "RACCS", type: "region_autonoma", capital: "Bluefields", culturalSignal: "Caribe Sur multicultural", landscape: "Lagunas y cayos" }
];

export const dishes = [
  { name: "Vigoron", region: "Granada", image: "/assets/images/comida/vigoron.jpg", ingredients: "Yuca, chicharron, repollo y vinagre criollo" },
  { name: "Nacatamal", region: "Todo el pais", image: "/assets/images/comida/nacatamal.jpg", ingredients: "Maiz, cerdo, achiote, arroz y hoja de platano" },
  { name: "Indio Viejo", region: "Pacifico", image: "/assets/images/comida/indio_viejo.jpg", ingredients: "Masa de maiz, carne, hierbabuena y naranja agria" },
  { name: "Baho", region: "Managua y Granada", image: "/assets/images/comida/baho.jpg", ingredients: "Carne, platano verde, maduro, yuca y ensalada" }
] as const;

export const historyPeriods = [
  "Pueblos originarios y cosmovision del maiz",
  "Encuentro, resistencia y mestizaje",
  "Ciudades coloniales y rutas del lago",
  "Independencia y republica temprana",
  "Cultura, literatura y soberania",
  "Memoria contemporanea",
  "Nicaragua viva y comunidades del presente"
] as const;
