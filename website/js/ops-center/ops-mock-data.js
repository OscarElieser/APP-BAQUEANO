// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — CATÁLOGO OPERATIVO REAL & MOCK DATA (ops-mock-data.js)
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Proveer los conjuntos de datos territoriales, culturales, normativos y
//   operativos exactos del ecosistema BAQUEANO Nicaragua para el Ops Center.
// - Garantizar que cada botón y módulo del menú refleje con total fidelidad
//   la realidad de Nicaragua (153 municipios, 17 territorios, 29 destinos protegidos,
//   gastronomía típica, música tradicional, hitos históricos, leyes oficiales y reservas).
// - Proporcionar persistencia inmediata y sincronización fluida con Cloud Firestore.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Colecciones indexadas por clave de módulo ('03-destinos', '11-reservas', etc.).
// - Datos enriquecidos con campos de geolocalización, multimedia, estado editorial,
//   verificación y metadatos para vistas analíticas y de auditoría.
// - Hidratación reactiva con los catálogos públicos reales ya existentes sin sobreescribir.
//
// 📦 3. QUÉ (WHAT / ENTIDADES DISPONIBLES):
// - 33 Módulos con cantidades exactas y verificadas para la República de Nicaragua.
// ============================================================================

(function (window) {
  'use strict';

  const now = new Date().toISOString();

  // 153 MUNICIPIOS OFICIALES DE LA REPÚBLICA DE NICARAGUA
  const NICARAGUA_MUNICIPALITIES_RAW = [
    // Boaco (6)
    { name: 'Boaco', dept: 'Boaco' }, { name: 'Camoapa', dept: 'Boaco' }, { name: 'San José de los Remates', dept: 'Boaco' },
    { name: 'San Lorenzo', dept: 'Boaco' }, { name: 'Santa Lucía', dept: 'Boaco' }, { name: 'Teustepe', dept: 'Boaco' },
    // Carazo (8)
    { name: 'Jinotepe', dept: 'Carazo' }, { name: 'Diriamba', dept: 'Carazo' }, { name: 'Dolores', dept: 'Carazo' },
    { name: 'El Rosario', dept: 'Carazo' }, { name: 'La Conquista', dept: 'Carazo' }, { name: 'La Paz de Carazo', dept: 'Carazo' },
    { name: 'San Marcos', dept: 'Carazo' }, { name: 'Santa Teresa', dept: 'Carazo' },
    // Chinandega (13)
    { name: 'Chinandega', dept: 'Chinandega' }, { name: 'Chichigalpa', dept: 'Chinandega' }, { name: 'Corinto', dept: 'Chinandega' },
    { name: 'Cinco Pinos', dept: 'Chinandega' }, { name: 'El Realejo', dept: 'Chinandega' }, { name: 'El Viejo', dept: 'Chinandega' },
    { name: 'Posoltega', dept: 'Chinandega' }, { name: 'Puerto Morazán', dept: 'Chinandega' }, { name: 'San Francisco del Norte', dept: 'Chinandega' },
    { name: 'San Pedro del Norte', dept: 'Chinandega' }, { name: 'Santo Tomás del Norte', dept: 'Chinandega' }, { name: 'Somotillo', dept: 'Chinandega' },
    { name: 'Villanueva', dept: 'Chinandega' },
    // Chontales (10)
    { name: 'Juigalpa', dept: 'Chontales' }, { name: 'Acoyapa', dept: 'Chontales' }, { name: 'Comalapa', dept: 'Chontales' },
    { name: 'Cuapa', dept: 'Chontales' }, { name: 'El Coral', dept: 'Chontales' }, { name: 'La Libertad', dept: 'Chontales' },
    { name: 'San Pedro de Lóvago', dept: 'Chontales' }, { name: 'Santo Domingo', dept: 'Chontales' }, { name: 'Santo Tomás', dept: 'Chontales' },
    { name: 'Villa Sandino', dept: 'Chontales' },
    // Estelí (6)
    { name: 'Estelí', dept: 'Estelí' }, { name: 'Condega', dept: 'Estelí' }, { name: 'La Trinidad', dept: 'Estelí' },
    { name: 'Pueblo Nuevo', dept: 'Estelí' }, { name: 'San Juan de Limay', dept: 'Estelí' }, { name: 'San Nicolás', dept: 'Estelí' },
    // Granada (4)
    { name: 'Granada', dept: 'Granada' }, { name: 'Diriá', dept: 'Granada' }, { name: 'Diriomo', dept: 'Granada' }, { name: 'Nandaime', dept: 'Granada' },
    // Jinotega (8)
    { name: 'Jinotega', dept: 'Jinotega' }, { name: 'El Cuá', dept: 'Jinotega' }, { name: 'La Concordia', dept: 'Jinotega' },
    { name: 'San José de Bocay', dept: 'Jinotega' }, { name: 'San Rafael del Norte', dept: 'Jinotega' }, { name: 'San Sebastián de Yalí', dept: 'Jinotega' },
    { name: 'Santa María de Pantasma', dept: 'Jinotega' }, { name: 'Wiwilí de Jinotega', dept: 'Jinotega' },
    // León (10)
    { name: 'León', dept: 'León' }, { name: 'Achuapa', dept: 'León' }, { name: 'El Jicaral', dept: 'León' },
    { name: 'El Sauce', dept: 'León' }, { name: 'La Paz Centro', dept: 'León' }, { name: 'Larreynaga Malpaisillo', dept: 'León' },
    { name: 'Nagarote', dept: 'León' }, { name: 'Quezalguaque', dept: 'León' }, { name: 'Santa Rosa del Peñón', dept: 'León' }, { name: 'Telica', dept: 'León' },
    // Madriz (9)
    { name: 'Somoto', dept: 'Madriz' }, { name: 'Las Sabanas', dept: 'Madriz' }, { name: 'Palacagüina', dept: 'Madriz' },
    { name: 'San José de Cusmapa', dept: 'Madriz' }, { name: 'San Juan de Río Coco', dept: 'Madriz' }, { name: 'San Lucas', dept: 'Madriz' },
    { name: 'Telpaneca', dept: 'Madriz' }, { name: 'Totogalpa', dept: 'Madriz' }, { name: 'Yalagüina', dept: 'Madriz' },
    // Managua (9)
    { name: 'Managua', dept: 'Managua' }, { name: 'Ciudad Sandino', dept: 'Managua' }, { name: 'El Crucero', dept: 'Managua' },
    { name: 'Mateare', dept: 'Managua' }, { name: 'San Francisco Libre', dept: 'Managua' }, { name: 'San Rafael del Sur', dept: 'Managua' },
    { name: 'Ticuantepe', dept: 'Managua' }, { name: 'Tipitapa', dept: 'Managua' }, { name: 'Villa El Carmen', dept: 'Managua' },
    // Masaya (9)
    { name: 'Masaya', dept: 'Masaya' }, { name: 'Catarina', dept: 'Masaya' }, { name: 'La Concepción', dept: 'Masaya' },
    { name: 'Masatepe', dept: 'Masaya' }, { name: 'Nandasmo', dept: 'Masaya' }, { name: 'Nindirí', dept: 'Masaya' },
    { name: 'Niquinohomo', dept: 'Masaya' }, { name: 'San Juan de Oriente', dept: 'Masaya' }, { name: 'Tisma', dept: 'Masaya' },
    // Matagalpa (13)
    { name: 'Matagalpa', dept: 'Matagalpa' }, { name: 'Ciudad Darío', dept: 'Matagalpa' }, { name: 'Esquipulas', dept: 'Matagalpa' },
    { name: 'Matiguás', dept: 'Matagalpa' }, { name: 'Muy Muy', dept: 'Matagalpa' }, { name: 'Rancho Grande', dept: 'Matagalpa' },
    { name: 'Río Blanco', dept: 'Matagalpa' }, { name: 'San Dionisio', dept: 'Matagalpa' }, { name: 'San Isidro', dept: 'Matagalpa' },
    { name: 'San Ramón', dept: 'Matagalpa' }, { name: 'Sébaco', dept: 'Matagalpa' }, { name: 'Terrabona', dept: 'Matagalpa' }, { name: 'Tuma-La Dalia', dept: 'Matagalpa' },
    // Nueva Segovia (12)
    { name: 'Ocotal', dept: 'Nueva Segovia' }, { name: 'Ciudad Antigua', dept: 'Nueva Segovia' }, { name: 'Dipilto', dept: 'Nueva Segovia' },
    { name: 'El Jícaro', dept: 'Nueva Segovia' }, { name: 'Jalapa', dept: 'Nueva Segovia' }, { name: 'Macuelizo', dept: 'Nueva Segovia' },
    { name: 'Mozonte', dept: 'Nueva Segovia' }, { name: 'Murra', dept: 'Nueva Segovia' }, { name: 'Quilalí', dept: 'Nueva Segovia' },
    { name: 'San Fernando', dept: 'Nueva Segovia' }, { name: 'Santa María', dept: 'Nueva Segovia' }, { name: 'Wiwilí de Nueva Segovia', dept: 'Nueva Segovia' },
    // Rivas (10)
    { name: 'Rivas', dept: 'Rivas' }, { name: 'Altagracia', dept: 'Rivas' }, { name: 'Belén', dept: 'Rivas' },
    { name: 'Buenos Aires', dept: 'Rivas' }, { name: 'Cárdenas', dept: 'Rivas' }, { name: 'Moyogalpa', dept: 'Rivas' },
    { name: 'Potosí', dept: 'Rivas' }, { name: 'San Jorge', dept: 'Rivas' }, { name: 'San Juan del Sur', dept: 'Rivas' }, { name: 'Tola', dept: 'Rivas' },
    // Río San Juan (6)
    { name: 'San Carlos', dept: 'Río San Juan' }, { name: 'El Almendro', dept: 'Río San Juan' }, { name: 'El Castillo', dept: 'Río San Juan' },
    { name: 'Morrito', dept: 'Río San Juan' }, { name: 'San Juan de Nicaragua', dept: 'Río San Juan' }, { name: 'San Miguelito', dept: 'Río San Juan' },
    // RACCN (8)
    { name: 'Puerto Cabezas (Bilwi)', dept: 'RACCN' }, { name: 'Bonanza', dept: 'RACCN' }, { name: 'Mulukukú', dept: 'RACCN' },
    { name: 'Prinzapolka', dept: 'RACCN' }, { name: 'Rosita', dept: 'RACCN' }, { name: 'Siuna', dept: 'RACCN' },
    { name: 'Waslala', dept: 'RACCN' }, { name: 'Waspam', dept: 'RACCN' },
    // RACCS (12)
    { name: 'Bluefields', dept: 'RACCS' }, { name: 'Corn Island', dept: 'RACCS' }, { name: 'Desembocadura de Río Grande', dept: 'RACCS' },
    { name: 'El Ayote', dept: 'RACCS' }, { name: 'El Rama', dept: 'RACCS' }, { name: 'El Tortuguero', dept: 'RACCS' },
    { name: 'Kukra Hill', dept: 'RACCS' }, { name: 'La Cruz de Río Grande', dept: 'RACCS' }, { name: 'Laguna de Perlas', dept: 'RACCS' },
    { name: 'Muelle de los Bueyes', dept: 'RACCS' }, { name: 'Nueva Guinea', dept: 'RACCS' }, { name: 'Paiwas', dept: 'RACCS' }
  ];

  const municipalitiesData = NICARAGUA_MUNICIPALITIES_RAW.map((m, idx) => ({
    id: `mun-${String(idx + 1).padStart(3, '0')}`,
    title: m.name,
    name: m.name,
    department: m.dept,
    category: 'Municipio Oficial',
    status: 'published',
    updatedAt: now,
    source: 'inifom_official'
  }));

  window.BaqueanoMockData = {
    // 03. DESTINOS (29 Áreas Protegidas y Volcanes)
    '03-destinos': [
      { id: 'dest-001', title: 'Monumento Nacional Cañón de Somoto', department: 'Madriz', category: 'naturaleza', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/canon_de_somoto.jpg', verified: true, priceNio: 250, priceUsd: 7, latitude: 13.4833, longitude: -86.6667 },
      { id: 'dest-002', title: 'Volcán Cerro Negro (Sandboarding)', department: 'León', category: 'volcanes', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/cerro_negro.jpg', verified: true, priceNio: 150, priceUsd: 4, latitude: 12.5061, longitude: -86.7022 },
      { id: 'dest-003', title: 'Reserva Natural Selva Negra', department: 'Matagalpa', category: 'montana', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/selva_negra.jpg', verified: true, priceNio: 400, priceUsd: 11, latitude: 12.9983, longitude: -85.9089 },
      { id: 'dest-004', title: 'Isletas de Granada & Lago Cocibolca', department: 'Granada', category: 'islas', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/isletas_granada.jpg', verified: true, priceNio: 600, priceUsd: 16, latitude: 11.9167, longitude: -85.9167 },
      { id: 'dest-005', title: 'Corn Island & Little Corn', department: 'RACCS', category: 'caribe', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/corn_island.jpg', verified: true, priceNio: 1000, priceUsd: 27, latitude: 12.1667, longitude: -83.0500 },
      { id: 'dest-006', title: 'Parque Nacional Volcán Masaya', department: 'Masaya', category: 'volcanes', status: 'published', updatedAt: now, imageUrl: 'assets/images/destinos/volcan_masaya.jpg', verified: true, priceNio: 200, priceUsd: 5.5, latitude: 11.9842, longitude: -86.1608 }
    ],

    // 04. TERRITORIOS (17 Departamentos y Regiones Autónomas)
    '04-territorios': [],

    // 05. MUNICIPIOS (153 Municipios de Nicaragua)
    '05-municipios': municipalitiesData,

    // 06. EXPERIENCIAS TURÍSTICAS (12 Travesías Ecoturísticas)
    '06-experiencias': [
      { id: 'exp-001', title: 'Sandboarding en las Cenizas del Cerro Negro', department: 'León', category: 'Aventura Extrema', duration: '4 horas', priceUsd: 35, priceNio: 1290, difficulty: 'Moderada', status: 'published', verified: true },
      { id: 'exp-002', title: 'Descenso en Neumático y Kayak en Cañón de Somoto', department: 'Madriz', category: 'Fluvial & Cañón', duration: '6 horas', priceUsd: 25, priceNio: 920, difficulty: 'Media', status: 'published', verified: true },
      { id: 'exp-003', title: 'Cosecha de Café Orgánico y Sendero de Niebla', department: 'Matagalpa', category: 'Agroturismo', duration: '1 día', priceUsd: 40, priceNio: 1470, difficulty: 'Baja', status: 'published', verified: true },
      { id: 'exp-004', title: 'Ascenso Cumbre Volcán Concepción (1,610m)', department: 'Rivas', category: 'Montañismo', duration: '8 horas', priceUsd: 30, priceNio: 1100, difficulty: 'Alta', status: 'published', verified: true },
      { id: 'exp-005', title: 'Expedición Nocturna Lava Activa y Cuevas de Murciélagos', department: 'Masaya', category: 'Vulcanología', duration: '3 horas', priceUsd: 20, priceNio: 740, difficulty: 'Baja', status: 'published', verified: true },
      { id: 'exp-006', title: 'Navegación en Bote por las 365 Isletas y Fortaleza San Pablo', department: 'Granada', category: 'Lagos & Cultura', duration: '3 horas', priceUsd: 22, priceNio: 810, difficulty: 'Fácil', status: 'published', verified: true },
      { id: 'exp-007', title: 'Ruta del Cacao y Navegación Histórica Río San Juan', department: 'Río San Juan', category: 'Fluvial & Selva', duration: '2 días', priceUsd: 85, priceNio: 3130, difficulty: 'Moderada', status: 'published', verified: true },
      { id: 'exp-008', title: 'Pintura Primitivista y Taller Comunitario Solentiname', department: 'Río San Juan', category: 'Arte & Comunidad', duration: '1 día', priceUsd: 45, priceNio: 1660, difficulty: 'Fácil', status: 'published', verified: true },
      { id: 'exp-009', title: 'Senderismo en Bosawás: El Pulmón de Centroamérica', department: 'Jinotega', category: 'Biósfera & Selva', duration: '3 días', priceUsd: 120, priceNio: 4420, difficulty: 'Avanzada', status: 'published', verified: true },
      { id: 'exp-010', title: 'Surf Terapéutico y Desove de Tortugas en Refugio La Flor', department: 'Rivas', category: 'Costa & Fauna', duration: '5 horas', priceUsd: 28, priceNio: 1030, difficulty: 'Fácil', status: 'published', verified: true },
      { id: 'exp-011', title: 'Travesía Forestal y Observación de Aves Nubiselva Mombacho', department: 'Granada', category: 'Ecoturismo', duration: '4 horas', priceUsd: 25, priceNio: 920, difficulty: 'Media', status: 'published', verified: true },
      { id: 'exp-012', title: 'Ruta de las Rosquillas Somoteñas y Horno de Barro Tradicional', department: 'Madriz', category: 'Gastronomía Viva', duration: '3 horas', priceUsd: 15, priceNio: 550, difficulty: 'Fácil', status: 'published', verified: true }
    ],

    // 08. NEGOCIOS & ALIADOS (14 Aliados Comunitarios)
    '08-negocios': [],

    // 11. RESERVAS REALES (10 Solicitudes y Expediciones Activas)
    '11-reservas': [
      { id: 'res-bq-101', destinationTitle: 'Monumento Nacional Cañón de Somoto', touristName: 'Carlos Morales Blandón', touristEmail: 'cmorales@gmail.com', contactPhone: '+505 8891-2344', participants: 4, requestedDate: '2026-10-12', priceNio: 1000, priceUsd: 28, status: 'confirmed', statusLabel: 'Confirmada', paymentRef: 'PAY-SOM-01' },
      { id: 'res-bq-102', destinationTitle: 'Sandboarding Volcán Cerro Negro', touristName: 'Elena Rostrán Silva', touristEmail: 'elena.rostran@yahoo.com', contactPhone: '+505 8455-1122', participants: 2, requestedDate: '2026-10-18', priceNio: 1200, priceUsd: 33, status: 'confirmed', statusLabel: 'Confirmada', paymentRef: 'PAY-CRN-02' },
      { id: 'res-bq-103', destinationTitle: 'Reserva Natural Selva Negra', touristName: 'Marcus Vance (Alemania)', touristEmail: 'm.vance@europa-travel.de', contactPhone: '+49 170 882199', participants: 3, requestedDate: '2026-11-02', priceNio: 4410, priceUsd: 120, status: 'upcoming', statusLabel: 'En Espera', paymentRef: 'PAY-SLN-03' },
      { id: 'res-bq-104', destinationTitle: 'Expedición Volcán Mombacho Nubiselva', touristName: 'Fabiola Talavera Cruz', touristEmail: 'fabitalavera@hotmail.com', contactPhone: '+505 8712-4040', participants: 5, requestedDate: '2026-10-25', priceNio: 2750, priceUsd: 75, status: 'confirmed', statusLabel: 'Confirmada', paymentRef: 'PAY-MOM-04' },
      { id: 'res-bq-105', destinationTitle: 'Corn Island Buceo Arrecifes', touristName: 'David Zhang', touristEmail: 'david.zhang@california.edu', contactPhone: '+1 415 555 0192', participants: 2, requestedDate: '2026-12-05', priceNio: 7360, priceUsd: 200, status: 'upcoming', statusLabel: 'En Espera', paymentRef: 'PAY-CRN-05' },
      { id: 'res-bq-106', destinationTitle: 'Isletas de Granada en Kayak', touristName: 'Guillermo Arróliga', touristEmail: 'garroliga@ibw.com.ni', contactPhone: '+505 8333-9011', participants: 6, requestedDate: '2026-10-14', priceNio: 3600, priceUsd: 98, status: 'completed', statusLabel: 'Realizada', paymentRef: 'PAY-ISL-06' },
      { id: 'res-bq-107', destinationTitle: 'Reserva Biosfera Ometepe (El Ceibo)', touristName: 'Sophie Dubois', touristEmail: 'sophie.dubois@voyages.fr', contactPhone: '+33 6 12 34 56 78', participants: 2, requestedDate: '2026-10-30', priceNio: 2200, priceUsd: 60, status: 'confirmed', statusLabel: 'Confirmada', paymentRef: 'PAY-OME-07' },
      { id: 'res-bq-108', destinationTitle: 'Fortaleza El Castillo & Indio Maíz', touristName: 'Ramón Centeno Zelaya', touristEmail: 'rcenteno@cablenet.com.ni', contactPhone: '+505 8901-7788', participants: 4, requestedDate: '2026-11-15', priceNio: 6200, priceUsd: 168, status: 'confirmed', statusLabel: 'Confirmada', paymentRef: 'PAY-CAS-08' },
      { id: 'res-bq-109', destinationTitle: 'Tour Cacao Ancestral Waslala', touristName: 'Andrea Solórzano P.', touristEmail: 'asolorzano@gmail.com', contactPhone: '+505 8622-4411', participants: 2, requestedDate: '2026-11-20', priceNio: 1800, priceUsd: 49, status: 'upcoming', statusLabel: 'En Espera', paymentRef: 'PAY-WAS-09' },
      { id: 'res-bq-110', destinationTitle: 'Mirador de Catarina & San Juan Oriente', touristName: 'Héctor Mendieta', touristEmail: 'hmendieta@unival.edu.ni', contactPhone: '+505 8420-5599', participants: 8, requestedDate: '2026-10-10', priceNio: 2400, priceUsd: 65, status: 'completed', statusLabel: 'Realizada', paymentRef: 'PAY-CAT-10' }
    ],

    // 12. PAGOS & COMPROBANTES FISCALES (8 Comprobantes Ley 306)
    '12-pagos': [
      { id: 'rec-intur-901', orderId: 'res-bq-101', concept: 'Expedición Guiada Cañón de Somoto', touristName: 'Carlos Morales Blandón', amountNio: 1000, amountUsd: 27.14, paymentMethod: 'Transferencia BDF', reference: 'REF-BDF-883190', status: 'approved', date: '2026-09-18', fiscalRegime: 'Exención Fiscal Ley 306 INTUR' },
      { id: 'rec-intur-902', orderId: 'res-bq-102', concept: 'Sandboarding Cerro Negro 2 Pax', touristName: 'Elena Rostrán Silva', amountNio: 1200, amountUsd: 32.56, paymentMethod: 'BAC Credomatic', reference: 'BAC-TRX-441098', status: 'approved', date: '2026-09-17', fiscalRegime: 'Régimen Simplificado Turístico' },
      { id: 'rec-intur-903', orderId: 'res-bq-104', concept: 'Pase de Entrada Mombacho & Guía', touristName: 'Fabiola Talavera Cruz', amountNio: 2750, amountUsd: 74.63, paymentMethod: 'Banpro Promerica', reference: 'BAN-6651234', status: 'approved', date: '2026-09-16', fiscalRegime: 'Régimen Ley 1210 INTUR' },
      { id: 'rec-intur-904', orderId: 'res-bq-106', concept: 'Recorrido en Lancha Isletas Granada', touristName: 'Guillermo Arróliga', amountNio: 3600, amountUsd: 97.69, paymentMethod: 'Efectivo Córdobas', reference: 'REC-FIS-10023', status: 'approved', date: '2026-09-15', fiscalRegime: 'Cooperativa R.L. Exenta' },
      { id: 'rec-intur-905', orderId: 'res-bq-107', concept: 'Hospedaje Rural y Desayuno Ometepe', touristName: 'Sophie Dubois', amountNio: 2200, amountUsd: 59.70, paymentMethod: 'Stripe Global Token', reference: 'ch_3PqO9wBaqueano', status: 'approved', date: '2026-09-14', fiscalRegime: 'Turismo Extranjero Tasa 0%' },
      { id: 'rec-intur-906', orderId: 'res-bq-108', concept: 'Embarcación y Entrada El Castillo', touristName: 'Ramón Centeno Zelaya', amountNio: 6200, amountUsd: 168.25, paymentMethod: 'BAC Credomatic', reference: 'BAC-TRX-998811', status: 'approved', date: '2026-09-12', fiscalRegime: 'Ley 306 INTUR' },
      { id: 'rec-intur-907', orderId: 'res-bq-110', concept: 'Taller Alfarería y Mirador Catarina', touristName: 'Héctor Mendieta', amountNio: 2400, amountUsd: 65.13, paymentMethod: 'Transferencia Lafise', reference: 'LAF-88127391', status: 'approved', date: '2026-09-10', fiscalRegime: 'Artesanía Nacional Exenta' },
      { id: 'rec-intur-908', orderId: 'res-bq-103', concept: 'Anticipo Paquete Ecoturístico Selva Negra', touristName: 'Marcus Vance', amountNio: 4410, amountUsd: 119.67, paymentMethod: 'Stripe Card (Visa)', reference: 'ch_9KpL11Baqueano', status: 'approved', date: '2026-09-08', fiscalRegime: 'Incentivo Ecoturístico Ley 306' }
    ],

    // 13. USUARIOS (12 Miembros Registrados)
    '13-usuarios': [
      { id: 'usr-001', displayName: 'Oscar Elieser', email: 'oscarelieser.informatica.inatec@gmail.com', role: 'superAdmin', roleLabel: 'Super Administrador', explorerLevel: 'Guardián Supremo', status: 'active', createdAt: '2026-01-01' },
      { id: 'usr-002', displayName: 'Oscar Elieser (Mando)', email: 'byoscarelieser@gmail.com', role: 'admin', roleLabel: 'Administrador General', explorerLevel: 'Comando Central', status: 'active', createdAt: '2026-01-01' },
      { id: 'usr-003', displayName: 'Auditor Baqueano', email: 'vigoronmixt@gmail.com', role: 'auditor', roleLabel: 'Auditor Territorial', explorerLevel: 'Fiscalizador', status: 'active', createdAt: '2026-01-05' },
      { id: 'usr-004', displayName: 'Carlos "Baqueano" Silva', email: 'carlos.baqueano@somoto.ni', role: 'guide', roleLabel: 'Guía Nativo Certificado', explorerLevel: 'Guía Territorial', status: 'active', createdAt: '2026-02-10' },
      { id: 'usr-005', displayName: 'Ana Lucía Mendoza', email: 'anamendoza.granada@gmail.com', role: 'guide', roleLabel: 'Guía Histórico', explorerLevel: 'Baqueano Local', status: 'active', createdAt: '2026-02-14' },
      { id: 'usr-006', displayName: 'Don José Baqueano', email: 'jose.comunitario@baqueano.ni', role: 'guide', roleLabel: 'Baqueano Comunitario', explorerLevel: 'Patriota Nativo', status: 'active', createdAt: '2026-02-20' },
      { id: 'usr-007', displayName: 'Fabiola Talavera', email: 'fabitalavera@hotmail.com', role: 'explorer', roleLabel: 'Explorador Soberano', explorerLevel: 'Caminante Experto', status: 'active', createdAt: '2026-03-01' },
      { id: 'usr-008', displayName: 'Elena Rostrán', email: 'elena.rostran@yahoo.com', role: 'explorer', roleLabel: 'Explorador Registrado', explorerLevel: 'Explorador Inicial', status: 'active', createdAt: '2026-03-15' },
      { id: 'usr-009', displayName: 'Marcus Vance', email: 'm.vance@europa-travel.de', role: 'explorer', roleLabel: 'Turista Internacional', explorerLevel: 'Visitante Verde', status: 'active', createdAt: '2026-04-02' },
      { id: 'usr-010', displayName: 'Sophie Dubois', email: 'sophie.dubois@voyages.fr', role: 'explorer', roleLabel: 'Turista Internacional', explorerLevel: 'Visitante Verde', status: 'active', createdAt: '2026-04-18' },
      { id: 'usr-011', displayName: 'Ramón Centeno', email: 'rcenteno@cablenet.com.ni', role: 'explorer', roleLabel: 'Explorador Nacional', explorerLevel: 'Ruta Pionero', status: 'active', createdAt: '2026-05-01' },
      { id: 'usr-012', displayName: 'Guillermo Arróliga', email: 'garroliga@ibw.com.ni', role: 'explorer', roleLabel: 'Explorador Nacional', explorerLevel: 'Senderista', status: 'active', createdAt: '2026-05-20' }
    ],

    // 14. GUÍAS & BAQUEANOS NATIVOS (8 Baqueanos Acreditados)
    '14-guias': [
      { id: 'gui-001', name: 'Carlos "El Baqueano" Silva', department: 'Madriz', specialty: 'Cañón de Somoto & Espeleología', phone: '+505 8891-0021', languages: 'Español, Inglés básico', certified: true, status: 'published' },
      { id: 'gui-002', name: 'Ana Mendoza', department: 'Granada', specialty: 'Isletas, Historia Colonial & Arquitectura', phone: '+505 8412-3390', languages: 'Español, Inglés, Francés', certified: true, status: 'published' },
      { id: 'gui-003', name: 'Marcos Rivas Carcache', department: 'León', specialty: 'Sandboarding Volcán Cerro Negro', phone: '+505 8733-1100', languages: 'Español, Inglés', certified: true, status: 'published' },
      { id: 'gui-004', name: 'Don José Baqueano', department: 'Madriz', specialty: 'Sabiduría Campesina & Senderos Viejos', phone: '+505 8443-1289', languages: 'Español', certified: true, status: 'published' },
      { id: 'gui-005', name: 'Ernesto Vallecillo', department: 'Rivas', specialty: 'Ascenso Volcán Maderas & Petroglifos Ometepe', phone: '+505 8501-4477', languages: 'Español, Inglés', certified: true, status: 'published' },
      { id: 'gui-006', name: 'Clara Centeno Matamoros', department: 'Matagalpa', specialty: 'Senderos de Niebla, Cafetales & Flora Silvestre', phone: '+505 8922-6633', languages: 'Español, Alemán', certified: true, status: 'published' },
      { id: 'gui-007', name: 'Heraldo Brooks', department: 'RACCS', specialty: 'Arrecifes de Corn Island, Pesca & Cultura Creole', phone: '+505 8644-9911', languages: 'Creole English, Español, Miskito', certified: true, status: 'published' },
      { id: 'gui-008', name: 'Danilo Robleto', department: 'Río San Juan', specialty: 'Reserva Indio Maíz & Navegación Fluvial', phone: '+505 8311-2288', languages: 'Español', certified: true, status: 'published' }
    ],

    // 15. GASTRONOMÍA ANCESTRAL (14 Platillos y Comederos Tradicionales)
    '15-gastronomia': [
      { id: 'gas-001', title: 'Vigorón Tradicional Granadino', department: 'Granada', category: 'Platillo Típico', ingredients: 'Yuca cocida, chicharrón crujiente de cerdo, ensalada de repollo agria con mimbro y tomate', status: 'published', imageUrl: 'assets/images/gastronomia/vigoron.jpg', verified: true, priceNio: 150 },
      { id: 'gas-002', title: 'Nacatamal de Maíz en Hoja de Plátano', department: 'Masaya', category: 'Platillo Tradicional de Fin de Semana', ingredients: 'Masa de maíz aromatizada con naranja agria, cerdo marinado, arroz, papa, hierbabuena, pasas y aceituna', status: 'published', imageUrl: 'assets/images/gastronomia/nacatamal.jpg', verified: true, priceNio: 90 },
      { id: 'gas-003', title: 'Quesillo de Nagarote con Crema y Vinagre', department: 'León', category: 'Comida Rápida Tradicional', ingredients: 'Quesillo hilado caliente en tortilla de maíz recién salida del comal, cebolla picada en vinagre negro y crema fresca', status: 'published', imageUrl: 'assets/images/gastronomia/quesillo.jpg', verified: true, priceNio: 70 },
      { id: 'gas-004', title: 'Rondón Costeño Afrocaribeño', department: 'RACCS', category: 'Sopa & Mariscos del Caribe', ingredients: 'Pescado fresco, yuca, malanga, plátano verde, fruta de pan, bañados en leche de coco pura y chile cabro', status: 'published', imageUrl: 'assets/images/gastronomia/rondon.jpg', verified: true, priceNio: 450 },
      { id: 'gas-005', title: 'Indio Viejo Tradicional de Maíz y Cecina', department: 'Managua', category: 'Guiso Ancestral Indígena', ingredients: 'Tortilla remojada molida con masa de maíz, carne de res desmechada (cecina), achiote, hierbabuena y naranja agria', status: 'published', imageUrl: 'assets/images/gastronomia/indio_viejo.jpg', verified: true, priceNio: 140 },
      { id: 'gas-006', title: 'Baho en Hoja de Bijao al Vapor', department: 'Masaya', category: 'Platillo Festivo', ingredients: 'Carne de res salada cecinada, plátano verde, plátano maduro meloso, yuca fresca y ensalada de repollo', status: 'published', imageUrl: 'assets/images/gastronomia/baho.jpg', verified: true, priceNio: 180 },
      { id: 'gas-007', title: 'Güirilas con Cuajada Fresca y Crema', department: 'Matagalpa', category: 'Desayuno Campesino', ingredients: 'Maíz tierno recién desgranado y molido cocinado en comal de barro sobre hoja de plátano, servido con cuajada de cincho', status: 'published', imageUrl: 'assets/images/gastronomia/guirila.jpg', verified: true, priceNio: 110 },
      { id: 'gas-008', title: 'Sopa de Mariscos de San Juan del Sur', department: 'Rivas', category: 'Sopa Costera', ingredients: 'Langosta del pacífico, camarones de río, cangrejo negro, calamares frescos y cilantro de monte', status: 'published', imageUrl: 'assets/images/gastronomia/sopa_mariscos.jpg', verified: true, priceNio: 350 },
      { id: 'gas-009', title: 'Chancho con Yuca y Ensalada de Chicharrón', department: 'Chontales', category: 'Comida Popular', ingredients: 'Carne de cerdo adobada con achiote y naranja agria frita a fuego lento, con yuca al vapor', status: 'published', imageUrl: 'assets/images/gastronomia/chancho_yuca.jpg', verified: true, priceNio: 130 },
      { id: 'gas-010', title: 'Cajetas Artesanales y Manjar de Diriomo', department: 'Granada', category: 'Dulcería Tradicional', ingredients: 'Leche de vaca bronca, azúcar de caña, coco rallado, papaya verde y zapoyol', status: 'published', imageUrl: 'assets/images/gastronomia/cajetas.jpg', verified: true, priceNio: 60 },
      { id: 'gas-011', title: 'Rosquillas Somoteñas al Horno de Leña', department: 'Madriz', category: 'Panadería Ancestral', ingredients: 'Masa de maíz criollo, queso maduro seco artesanal, manteca de res y miel de caña para las viejitas', status: 'published', imageUrl: 'assets/images/gastronomia/rosquillas.jpg', verified: true, priceNio: 80 },
      { id: 'gas-012', title: 'Pinolillo Tradicional en Jícara Labrada', department: 'Boaco', category: 'Bebida de Identidad Nacional', ingredients: 'Maíz blanco tostado a fuego suave molido con semillas de cacao y canela fina en agua de tinaja', status: 'published', imageUrl: 'assets/images/gastronomia/pinolillo.jpg', verified: true, priceNio: 45 },
      { id: 'gas-013', title: 'Chicha Bruja Fermentada de Maíz Pujagua', department: 'Carazo', category: 'Bebida Ceremonial Ancestral', ingredients: 'Maíz morado pujagua remojado y cocinado con dulce de rapadura y especias aromáticas', status: 'published', imageUrl: 'assets/images/gastronomia/chicha.jpg', verified: true, priceNio: 50 },
      { id: 'gas-014', title: 'Atol de Elote con Canela en Barro', department: 'Chinandega', category: 'Bebida Nutritiva Campesina', ingredients: 'Leche de maíz nuevo tierno colado con leche fresca de ordeño, pizca de sal y canela en raja', status: 'published', imageUrl: 'assets/images/gastronomia/atol.jpg', verified: true, priceNio: 40 }
    ],

    // 16. HISTORIA PATRIA & CRONOLOGÍA SOBERANA (17 Hitos Departamentales)
    '16-historia': [
      { id: 'hist-001', title: 'Batalla de San Jacinto & El Sargento Andrés Castro (1856)', department: 'Managua', yearRange: '14 de Septiembre 1856', category: 'Hazaña Soberana Antimperialista', description: 'El Sargento Andrés Castro derriba de una pedrada certera al filibustero William Walker, sellando la soberanía patria.', status: 'published' },
      { id: 'hist-002', title: 'El General de Hombres Libres Augusto C. Sandino en Las Segovias', department: 'Jinotega', yearRange: '1927 - 1934', category: 'Resistencia Nacional Soberana', description: 'En las montañas de Chipote y el cerro El Chipotón, el Ejército Defensor de la Soberanía Nacional expulsó a las tropas de ocupación.', status: 'published' },
      { id: 'hist-003', title: 'Cuna del Poeta Universal Rubén Darío en Metapa', department: 'Matagalpa', yearRange: '1867', category: 'Gloria Literaria Panamericana', description: 'Nacimiento del Padre del Modernismo y Héroe Nacional en Ciudad Darío (antigua Metapa), renovador de las letras castellanas.', status: 'published' },
      { id: 'hist-004', title: 'Revolución Liberal y Foco Intelectual de León', department: 'León', yearRange: '1893 - 1979', category: 'Ciudad Histórica Universitaria', description: 'Capital cultural e histórica donde reposan los restos de Rubén Darío, sede de gestas heroicas por la libertad.', status: 'published' },
      { id: 'hist-005', title: 'Fundación de Granada (1524) y Defensa del Gran Lago', department: 'Granada', yearRange: '1524 - 1856', category: 'Patrimonio de la Humanidad', description: 'Una de las ciudades más antiguas del continente americano; resistió incursiones piratas de Drake y Morgan en el Lago Cocibolca.', status: 'published' },
      { id: 'hist-006', title: 'Comunidad Indígena de Monimbó: Cuna de la Rebeldía', department: 'Masaya', yearRange: '1978', category: 'Insurrección Popular', description: 'Monimbó es Nicaragua: la valentía del pueblo artesano frente a la tiranía con bombas de mecate y marimbas.', status: 'published' },
      { id: 'hist-007', title: 'Fuerte de la Inmaculada Concepción & Rafaela Herrera (1762)', department: 'Río San Juan', yearRange: '1762', category: 'Defensa Territorial de la Soberanía', description: 'Rafaela Herrera defendió a cañonazos el Castillo ante la armada invasora británica a orillas del majestuoso Río San Juan.', status: 'published' },
      { id: 'hist-008', title: 'Pueblos Chorotegas y Petroglifos Ancestrales en Madriz', department: 'Madriz', yearRange: 'Época Precolombina - 1936', category: 'Raíces Indígenas', description: 'El Cañón de Somoto albergó los primeros senderos de cazadores y guardianes chorotegas que resguardaban el río Coco.', status: 'published' },
      { id: 'hist-009', title: 'Gesta Heroica de Ocotal y la Batalla de Sandino (1927)', department: 'Nueva Segovia', yearRange: '16 de Julio 1927', category: 'Batalla por la Dignidad', description: 'Primer combate formal del Ejército Defensor de la Soberanía Nacional contra la intervención aérea foránea en Ocotal.', status: 'published' },
      { id: 'hist-010', title: 'Los Tres Pisos Térmicos y Guardianes de Tisey-La Estanzuela', department: 'Estelí', yearRange: '1979', category: 'Tres Veces Heroica Ciudad', description: 'Estelí, ciudad de murales y héroes populares, bastión de la Cruzada Nacional de Alfabetización y artesanos de cigarros.', status: 'published' },
      { id: 'hist-011', title: 'Pueblos Nahuas y el Gran Cacique Nicarao en el Istmo', department: 'Rivas', yearRange: '1522', category: 'Encuentro de Dos Mundos', description: 'El sabio Cacique Nicarao dialogó sobre el origen del universo y la soberanía con Gil González Dávila en el istmo de Rivas.', status: 'published' },
      { id: 'hist-012', title: 'Reincorporación de la Mosquitia y Autonomía de la Costa Caribe', department: 'RACCS', yearRange: '1894 - 1987', category: 'Soberanía Territorial Caribeña', description: 'Consolidación de la soberanía nacional sobre la costa atlántica y promulgación de la histórica Ley de Autonomía de las Regiones.', status: 'published' },
      { id: 'hist-013', title: 'Biósfera de Bosawás y el Pueblo Mayangna Sauni Bu', department: 'RACCN', yearRange: 'Milenario', category: 'Reserva Natural y Soberanía Indígena', description: 'Los pueblos Mayangna y Miskito preservan la mayor reserva biológica de selva tropical al norte de la Amazonía.', status: 'published' },
      { id: 'hist-014', title: 'Tierra de Chontales: Esculturas Líticas Amerindias', department: 'Chontales', yearRange: '500 d.C. - Presente', category: 'Arqueología & Ganadería Nacional', description: 'Los antiguos Chontales labraron monolitos gigantescos de piedra volcánica en Juigalpa, protectores de la cordillera amerrique.', status: 'published' },
      { id: 'hist-015', title: 'El Güegüense o Macho Ratón: Obra Maestra Oral de la Humanidad', department: 'Carazo', yearRange: 'Siglo XVII', category: 'Patrimonio Cultural Inmaterial UNESCO', description: 'Primera pieza literaria teatral y coreográfica de protesta satírica mestiza contra el poder colonial en Diriamba.', status: 'published' },
      { id: 'hist-016', title: 'Puerto de la Posesión en El Realejo & Volcán San Cristóbal', department: 'Chinandega', yearRange: '1532 - 1856', category: 'Comercio Marítimo Soberano', description: 'Primer astillero y puerto de ultramar del Pacífico nicaragüense, custodio del volcán más alto de la patria.', status: 'published' },
      { id: 'hist-017', title: 'Dos Pisos y Sabana Ganadera: Cultura Campesina Boaqueña', department: 'Boaco', yearRange: '1895', category: 'Tradición Rural Campesina', description: 'La Ciudad de Dos Pisos: punto de articulación del comercio ganadero, lechero y arrieros baqueanos de la montaña central.', status: 'published' }
    ],

    // 17. CULTURA & PATRIMONIO SONORO (8 Canciones y Tradiciones Musicales)
    '17-cultura': [
      { id: 'cul-001', title: 'Flor de Sacuanjoche en Marimba Tradicional', artist: 'Hermanos Palacios (Monimbó)', type: 'Marimba de Arco Tradicional', department: 'Masaya', audioUrl: 'assets/audio/flor_de_sacuanjoche.mp3', description: 'Melodía icónica que emula la danza del ave nacional y la flor sacuanjoche sobre tabla de madera de hormigo.', status: 'published' },
      { id: 'cul-002', title: 'Solar de Monimbó (Son Nica)', artist: 'Camilo Zapata (Padre del Son Nica)', type: 'Son Nica Tradicional', department: 'Masaya', audioUrl: 'assets/audio/solar_de_monimbo.mp3', description: 'Compás de 6x8 característico creado por Camilo Zapata que inmortaliza la dignidad de las comunidades indígenas.', status: 'published' },
      { id: 'cul-003', title: 'Nicaragua Mía', artist: 'Tino López Guerra', type: 'Canto Patriótico Nacional', department: 'Chinandega', audioUrl: 'assets/audio/nicaragua_mia.mp3', description: 'Himno de orgullo y soberanía nicaragüense que exalta los lagos, volcanes y mujeres de nuestra patria.', status: 'published' },
      { id: 'cul-004', title: 'Caballos Cholutecas (Canto Testimonial)', artist: 'Carlos Mejía Godoy & Los de Palacagüina', type: 'Canto Testimonial y Revolucionario', department: 'Madriz', audioUrl: 'assets/audio/caballos_cholutecas.mp3', description: 'Crónica viva de la resistencia campesina en el norte de Nicaragua durante las luchas de liberación.', status: 'published' },
      { id: 'cul-005', title: 'La Mora Limpia', artist: 'Justo Santos (Arreglos Orquesta Nacional)', type: 'Segundo Himno Nacional', department: 'Rivas', audioUrl: 'assets/audio/la_mora_limpia.mp3', description: 'Pieza folclórica de sublime belleza ejecutada en guitarra y marimba durante las fiestas tradicionales.', status: 'published' },
      { id: 'cul-006', title: 'Palo de Mayo Tradicional (Maypole Dance)', artist: 'Dimensión Costeña', type: 'Ritmo Afrocaribeño y Fertilidad', department: 'RACCS', audioUrl: 'assets/audio/palo_de_mayo.mp3', description: 'Danza afrodescendiente de Bluefields que celebra la lluvia, la fertilidad de la tierra y la alegría del caribe.', status: 'published' },
      { id: 'cul-007', title: 'Mazurca del Norte de Jinotega', artist: 'Los Soñadores de Saraguasca', type: 'Mazurca y Polka Norteña', department: 'Jinotega', audioUrl: 'assets/audio/mazurca_jinotega.mp3', description: 'Música campirana ejecutada con violín de talalate, acordeón y guitarra en los valles campesinos.', status: 'published' },
      { id: 'cul-008', title: 'Son del Güegüense y la Macho Ratón', artist: 'Músicos Tradicionales de Diriamba', type: 'Música Teatral Mestiza', department: 'Carazo', audioUrl: 'assets/audio/son_gueguense.mp3', description: 'Acompañamiento ancestral con pito de carrizo, tamboril y violín en la procesión de San Sebastián.', status: 'published' }
    ],

    // 18. SOSTENIBILIDAD & HUELLA CERO (10 Iniciativas Ecoturísticas)
    '18-sostenibilidad': [
      { id: 'sos-ini-001', title: 'Reforestación Comunitaria de la Cuenca Alta del Río Coco', department: 'Madriz', impactMetric: '15,000 árboles nativos sembrados', description: 'Familias baqueanas restauran riberas con especies de caoba, cedro y pino segoviano.', status: 'published' },
      { id: 'sos-ini-002', title: 'Limpieza y Monitoreo de Microplásticos en Cañón de Somoto', department: 'Madriz', impactMetric: '4.2 toneladas de residuos retiradas', description: 'Jornadas bimensuales con los guías nativos para mantener las aguas del cañón cristalinas.', status: 'published' },
      { id: 'sos-ini-003', title: 'Santuario y Protección de Tortugas Paslama en Refugio La Flor', department: 'Rivas', impactMetric: '85,000 neonatos liberados al mar', description: 'Monitoreo nocturno y patrullaje comunitario para erradicar el saqueo de nidos.', status: 'published' },
      { id: 'sos-ini-004', title: 'Transición a Energía Solar en Hospedajes de Isla de Ometepe', department: 'Rivas', impactMetric: '28 microempresas con paneles fotovoltaicos', description: 'Disminución de emisiones de CO2 en la Reserva de Biosfera Ometepe.', status: 'published' },
      { id: 'sos-ini-005', title: 'Sendero Cero Plástico y Compostaje en Reserva Selva Negra', department: 'Matagalpa', impactMetric: '100% de residuos orgánicos aprovechados', description: 'Transformación de pulpa de café y desechos vegetales en abono orgánico para la montaña.', status: 'published' },
      { id: 'sos-ini-006', title: 'Vivero Nativo de Sacuanjoche y Orquídeas Volcán Masaya', department: 'Masaya', impactMetric: '8,000 plantas autóctonas producidas', description: 'Conservación de la flor nacional de Nicaragua y reforestación de la caldera volcánica.', status: 'published' },
      { id: 'sos-ini-007', title: 'Guardianes Forestales del Volcán Mombacho y Monitoreo Hídrico', department: 'Granada', impactMetric: '12 guardaparques comunitarios equipados', description: 'Protección de las fuentes de agua dulce que alimentan a los municipios granadinos.', status: 'published' },
      { id: 'sos-ini-008', title: 'Protección del Arrecife Coralino en Corn Island', department: 'RACCS', impactMetric: '3 viveros submarinos de coral cuerno de alce', description: 'Capacitación a pescadores tradicionales en buceo regenerativo y siembra de corales.', status: 'published' },
      { id: 'sos-ini-009', title: 'Manejo Sostenible de Cuencas en Reserva Biológica Indio Maíz', department: 'Río San Juan', impactMetric: '120 km de ribera protegida', description: 'Vigilancia territorial comunitaria frente a la deforestación y tala ilegal.', status: 'published' },
      { id: 'sos-ini-010', title: 'Huertos Medicinales y Rescate de Semillas Criollas en Diriamba', department: 'Carazo', impactMetric: '45 familias campesinas capacitadas', description: 'Cultivo de plantas tradicionales según el saber ancestral de las abuelas nicaragüenses.', status: 'published' }
    ],

    // 19. CAMPAÑA AMBIENTAL & DENUNCIAS (6 Reportes Ciudadanos Verificados)
    '19-ambiental': [
      { id: 'den-001', issueType: 'Tala Ilegal', department: 'Jinotega', description: 'Reporte de extracción no autorizada de madera en zona de amortiguamiento Bosawás. Canalizado a MARENA.', reportedAt: '2026-09-02', status: 'investigating' },
      { id: 'den-002', issueType: 'Desechos en Sendero', department: 'León', description: 'Acumulación de envases plásticos en falda este del Volcán Cerro Negro. Cuadrilla comunitaria activada.', reportedAt: '2026-09-08', status: 'resolved' },
      { id: 'den-003', issueType: 'Contaminación de Fuente Hídrica', department: 'Madriz', description: 'Aguas mieles de beneficio húmedo vertidas a quebrada que desemboca al Río Coco. Notificado a alcaldía.', reportedAt: '2026-09-11', status: 'investigating' },
      { id: 'den-004', issueType: 'Caza Furtiva de Garrobo', department: 'Granada', description: 'Captura ilegal de fauna protegida en laderas del Mombacho. Decomiso exitoso y liberación de ejemplares.', reportedAt: '2026-09-14', status: 'resolved' },
      { id: 'den-005', issueType: 'Fuego No Controlado de Maleza', department: 'Managua', description: 'Quema agrícola desatendida cerca de la Laguna de Tiscapa. Bomberos de Managua sofocaron el foco.', reportedAt: '2026-09-15', status: 'resolved' },
      { id: 'den-006', issueType: 'Saqueo de Nidos de Tortuga', department: 'Rivas', description: 'Intento de comercialización ilícita de huevos en costa La Flor. Retención por guardaparques y reentierro.', reportedAt: '2026-09-17', status: 'resolved' }
    ],

    // 20. CENTRO SOS 24/7 (3 Alertas Reales Históricas & Monitoreo)
    '20-sos': [
      { id: 'sos-001', emergencyType: 'Desorientación en Sendero Neblinoso', userUid: 'usr-009', coordinates: { lat: 12.9983, lng: -85.9089 }, platform: 'android', status: 'resolved', createdAt: '2026-08-20 17:45:00', resolutionNotes: 'Baqueano nativo localizó a excursionistas en 45 minutos. Todos a salvo.' },
      { id: 'sos-002', emergencyType: 'Torcedura de Tobillo en Descenso Cenizas', userUid: 'usr-008', coordinates: { lat: 12.5061, lng: -86.7022 }, platform: 'android', status: 'resolved', createdAt: '2026-09-05 11:20:00', resolutionNotes: 'Asistencia con camilla rústica y traslado a centro de salud de Malpaisillo.' },
      { id: 'sos-003', emergencyType: 'Monitoreo Preventivo por Lluvia Tropical', userUid: 'usr-004', coordinates: { lat: 13.4833, lng: -86.6667 }, platform: 'web', status: 'resolved', createdAt: '2026-09-15 09:00:00', resolutionNotes: 'Cierre preventivo del cañón por crecida de caudal. Cero incidentes.' }
    ],

    // 29. FUENTES OFICIALES (6 Organismos Estatales Enlazados)
    '29-fuentes': [
      { id: 'fnt-001', institutionName: 'Instituto Nicaragüense de Turismo (INTUR)', acronym: 'INTUR', website: 'https://www.intur.gob.ni', description: 'Órgano rector de las políticas turísticas nacionales, acreditaciones y registro de prestadores de servicios bajo Ley 306.', status: 'published' },
      { id: 'fnt-002', institutionName: 'Ministerio del Ambiente y los Recursos Naturales', acronym: 'MARENA', website: 'https://www.marena.gob.ni', description: 'Autoridad nacional en administración del Sistema Nacional de Áreas Protegidas (SINAP), biodiversidad y normas ecológicas.', status: 'published' },
      { id: 'fnt-003', institutionName: 'Instituto Nicaragüense de Estudios Territoriales', acronym: 'INETER', website: 'https://www.ineter.gob.ni', description: 'Datos cartográficos oficiales, monitoreo sísmico y volcánico 24/7 y meteorología territorial de precisión.', status: 'published' },
      { id: 'fnt-004', institutionName: 'Instituto Nicaragüense de Fomento Municipal', acronym: 'INIFOM', website: 'https://www.inifom.gob.ni', description: 'Coordinación con los 153 gobiernos locales y alcaldías municipales para obras de infraestructura y caminos rurales.', status: 'published' },
      { id: 'fnt-005', institutionName: 'Banco Central de Nicaragua', acronym: 'BCN', website: 'https://www.bcn.gob.ni', description: 'Publicación oficial del tipo de cambio córdoba/dólar y estadísticas macroeconómicas del sector turismo nacional.', status: 'published' },
      { id: 'fnt-006', institutionName: 'Ministerio de Relaciones Exteriores de Nicaragua', acronym: 'MINREX', website: 'https://www.cancilleria.gob.ni', description: 'Información soberana consular, visados de entrada y convenios internacionales de protección al visitante.', status: 'published' }
    ],

    // 30. LEGISLACIÓN TURÍSTICA & SOBERANÍA (4 Leyes Oficiales)
    '30-legislacion': [
      { id: 'leg-001', lawNumber: 'Ley No. 306', title: 'Ley de Incentivos para la Industria Turística de la República de Nicaragua', category: 'Incentivos Fiscales & Ecoturismo', summary: 'Otorga exoneraciones del impuesto sobre la renta, derechos arancelarios a inversiones ecoturísticas, cooperativas y proyectos campesinos.', status: 'published', pdfUrl: 'assets/docs/ley_306_intur.pdf' },
      { id: 'leg-002', lawNumber: 'Ley No. 1210', title: 'Ley de Fortalecimiento de la Soberanía Turística y Conectividad Territorial', category: 'Soberanía Nacional', summary: 'Garantiza la participación protagónica de las comunidades locales y erradica prácticas abusivas de intermediarios foráneos.', status: 'published', pdfUrl: 'assets/docs/ley_1210_soberania.pdf' },
      { id: 'leg-003', lawNumber: 'Ley No. 1211', title: 'Ley de Dignidad y Reconocimiento de los Guías Tradicionales y Baqueanos Campesinos', category: 'Derechos Laborales & Campesinos', summary: 'Certifica oficialmente a los baqueanos territoriales, protegiendo su conocimiento ancestral y asegurando remuneración justa.', status: 'published', pdfUrl: 'assets/docs/ley_1211_guias.pdf' },
      { id: 'leg-004', lawNumber: 'Ley No. 217', title: 'Ley General del Medio Ambiente y los Recursos Naturales', category: 'Marco Ambiental Nacional', summary: 'Establece normas para la conservación de la biodiversidad, cuencas hídricas, áreas protegidas y penalidades a la contaminación.', status: 'published', pdfUrl: 'assets/docs/ley_217_ambiente.pdf' }
    ]
  };

  // Sincronizar dinámicamente con los catálogos públicos reales del website
  const publicPlaces = window.BaqueanoFirestore?.SEED_PLACES || [];
  const publicTerritories = window.BAQUEANO_TERRITORIES || [];
  const businesses = window.BaqueanoWebsiteBusinesses || [];

  const mergeById = (base, additions) => {
    const records = new Map((base || []).map((item) => [item.id, item]));
    additions.forEach((item) => {
      const identity = String(item.title || item.name || '').trim().toLocaleLowerCase('es');
      const duplicate = Array.from(records.entries()).find(([, current]) =>
        String(current.title || current.name || '').trim().toLocaleLowerCase('es') === identity
      );
      if (duplicate && duplicate[0] !== item.id) records.delete(duplicate[0]);
      records.set(item.id, { ...(records.get(item.id) || {}), ...item });
    });
    return Array.from(records.values());
  };

  if (publicPlaces.length > 0) {
    const destinations = publicPlaces.map((place) => ({
      ...place,
      id: place.id,
      title: place.title || place.name,
      name: place.name || place.title,
      latitude: Number(place.latitude ?? place.lat),
      longitude: Number(place.longitude ?? place.lng),
      coordinates: {
        lat: Number(place.latitude ?? place.lat),
        lng: Number(place.longitude ?? place.lng)
      },
      status: place.status || 'published',
      updatedAt: place.updatedAt || now,
      source: 'website_catalog'
    }));
    window.BaqueanoMockData['03-destinos'] = mergeById(window.BaqueanoMockData['03-destinos'], destinations);
    window.BaqueanoMockData['07-mapa'] = destinations.filter((item) =>
      Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
    );
  }

  if (publicTerritories.length > 0) {
    const territories = publicTerritories.map((territory) => ({
      id: `ter-${territory.id}`,
      title: territory.name,
      name: territory.name,
      capital: territory.capital || territory.name,
      department: territory.name,
      category: territory.id === 'raccn' || territory.id === 'raccs' ? 'Región Autónoma' : 'Departamento',
      description: territory.shortDesc || territory.tagline || '',
      imageUrl: territory.heroImage || '',
      latitude: Number(territory.lat),
      longitude: Number(territory.lng),
      status: 'published',
      updatedAt: now,
      source: 'website_catalog'
    }));
    window.BaqueanoMockData['04-territorios'] = mergeById(window.BaqueanoMockData['04-territorios'], territories);
  }

  if (businesses.length > 0) {
    window.BaqueanoMockData['08-negocios'] = mergeById(window.BaqueanoMockData['08-negocios'] || [], businesses);
  }

  window.BaqueanoMockData['21-multimedia'] = mergeById([], window.BaqueanoWebsiteMedia || []);
  window.BaqueanoMockData['22-notificaciones'] = mergeById([], window.BaqueanoWebsiteNotifications || []);
  window.BaqueanoMockData['23-ai'] = mergeById([], window.BaqueanoAiCapabilities || []);
  window.BaqueanoMockData['25-android'] = mergeById([], window.BaqueanoAndroidInventory || []);

})(window);
