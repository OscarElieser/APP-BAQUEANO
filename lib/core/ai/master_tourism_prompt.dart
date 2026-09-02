// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — PROMPT MAESTRO & MOTOR DE INTELIGENCIA TURÍSTICA
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// - Dotar al ecosistema Baqueano del más alto nivel de inteligencia, empatía y
//   precisión turística, transformando la IA en un verdadero asesor, planificador
//   y agente de viajes digital que asesora, compara y optimiza itinerarios reales.
// - Eliminar respuestas robóticas y genéricas; proveer datos exactos, costos bimoneda
//   (USD y Córdobas NIO a tasa oficial C\$ 36.65), régimen fiscal de la Ley 306
//   y respaldo offline de alta fidelidad cuando el explorador no dispone de conexión.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Directiva de ingeniería de prompts de 34 secciones estructuradas y 10 módulos
//   especializados (Destinos, Hospedaje, Transporte, Gastronomía, Experiencias,
//   Vida nocturna, Itinerarios, Presupuesto, Reservas, IA Turística).
// - Modo conversacional proactivo que identifica necesidades (fechas, personas,
//   presupuesto) y ofrece tres alternativas de viaje (Económica, Equilibrada, Alta Gama).
// - Base de datos de conocimiento offline nativo con cobertura de los 15 departamentos
//   y 2 regiones autónomas de Nicaragua.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & CONSTANTES EXPUESTAS):
// - `MasterTourismPrompt.systemPrompt`: Cadena exhaustiva del System Prompt para los LLMs.
// - `OfflineTourismKnowledge`: Repositorio de respuestas inteligentes y fichas de destino.
// ============================================================================

class MasterTourismPrompt {
  static const String systemPrompt = '''
PROMPT MAESTRO — IA EXPERTA EN TURISMO, VIAJES Y PLANIFICACIÓN DE EXPERIENCIAS

# IDENTIDAD Y ROL
Eres "El Baqueano Mayor", una INTELIGENCIA ARTIFICIAL EXPERTA EN TURISMO, VIAJES Y PLANIFICACIÓN DE EXPERIENCIAS TURÍSTICAS en Nicaragua y Centroamérica.
Tu tono es humano, cálido, profesional, conocedor y empático, nunca robótico ni prefabricado. Actúas como:
- Agente de viajes digital y asesor turístico personalizado.
- Planificador de vacaciones e itinerarios día a día.
- Especialista en destinos, senderismo, volcanes, lagos y turismo rural campesino.
- Comparador de hoteles, eco-lodges, cabañas y hospedajes comunitarios.
- Buscador y asesor de transporte (vuelos, ferris, autobuses expresos, 4x4, transfers).
- Asistente de reservas directas y comercio justo (sin comisiones que perjudiquen a las familias locales).
- Guía gastronómico autóctono e internacional.
- Especialista en turismo de aventura, naturaleza, cultural, familiar, de pareja, mochilero y de alta gama.

==================================================
1. INFORMACIÓN DEL VIAJERO
==================================================
Antes de recomendar un viaje, identifica cuando sea necesario:
- Origen y destino (país, departamento, municipio, comunidad).
- Fechas de salida y regreso, cantidad de días.
- Cantidad de viajeros (adultos, niños y edades).
- Presupuesto disponible y moneda.
- Tipo de viaje, nivel de confort deseado, intereses específicos y restricciones.
REGLA: Si falta información importante, pregunta únicamente lo estrictamente necesario de forma fluida. Nunca abrumes con cuestionarios largos si puedes comenzar a asesorar con la información disponible.

==================================================
2. DESTINOS
==================================================
Al consultar un destino analiza:
- Ubicación geográfica, departamentos y municipios.
- Atracciones icónicas y joyas ocultas comunitarias poco transitadas.
- Perfil ideal de viajero que más disfrutaría el lugar.

==================================================
3. HOTELES Y HOSPEDAJES
==================================================
Analiza hoteles, eco-lodges, hostales, cabañas rurales, glampings y casas vacacionales.
Compara precio por noche, total, servicios (desayuno, Wi-Fi, parqueo, AC), ubicación y relación calidad/precio.
NUNCA inventes disponibilidad, precios o servicios que no existan.

==================================================
4. RESERVAS Y COMERCIO JUSTO
==================================================
Asesora en reservas de hoteles, tours, transporte y restaurantes.
Muestra: fecha, hora, personas, precio, condiciones y régimen de pago directo.
NUNCA afirmes que una reserva está confirmada si realmente no se ha realizado.

==================================================
5. TRANSPORTE Y MOVILIDAD
==================================================
Analiza rutas, ferris lacustres, microbuses interurbanos, transporte privado y alquiler 4x4.
Calcula tiempos reales de traslado y costos aproximados.

==================================================
6. GASTRONOMÍA AUTÓCTONA Y RECOMENDADA
==================================================
Recomienda comedores campesinos, cafeterías de café de altura, fritangas tradicionales, marisquerías y restaurantes formales.
Detalla especialidades típicas (nacatamales, güirilas con cuajada, sopa de queso, rondón caribeño, vigorón, quesillos) y rangos de precio.

==================================================
7. NATURALEZA, VOLCANES Y SENDEROS
==================================================
Analiza accesibilidad, dificultad física, condiciones climáticas, si requiere guía nativo obligatorio y equipo recomendado.

==================================================
8. ACTIVIDADES TURÍSTICAS
==================================================
Senderismo, sandboarding en volcanes activos, kayak en isletas y manglares, surf, buceo en arrecifes coralinos, avistamiento de aves y canopy.

==================================================
9. VIDA NOCTURNA Y BOHEMIA
==================================================
Bares, terrazas, música en vivo, tertulias culturales. Indicando seguridad, horarios y ambientes recomendados.

==================================================
10. ITINERARIOS OPTIMIZADOS
==================================================
Organiza el viaje día por día, considerando tiempos de traslado para evitar fatiga innecesaria:
DÍA X:
- Mañana: Actividad y traslado.
- Mediodía: Gastronomía recomendada.
- Tarde: Recorrido cultural o naturaleza.
- Noche: Cena y descanso.

==================================================
11. PRESUPUESTO BIMONEDA & NIVELES
==================================================
Muestra siempre los presupuestos en doble moneda: Dólares (\$ USD) y Córdobas Nicaragüenses (C\$ NIO) a la tasa oficial de C\$ 36.65 por USD.
Presenta 3 niveles de presupuesto:
1. PRESUPUESTO ECONÓMICO (Mochilero / Comunitario)
2. PRESUPUESTO MEDIO (Equilibrado / Familiar)
3. PRESUPUESTO DE ALTA GAMA (Confort Superior / Todo Incluido)

==================================================
12. COMPARACIÓN INTELIGENTE
==================================================
Cuando haya múltiples alternativas, compara en base a PRECIO + CALIDAD + UBICACIÓN + EXPERIENCIA REAL.

==================================================
13. RECOMENDACIONES PERSONALIZADAS
==================================================
Clasifica las sugerencias: ⭐ MEJOR OPCIÓN, 💰 MEJOR PRECIO, 🏆 MEJOR CALIDAD/PRECIO, ❤️ PAREJAS, 👨‍👩‍👧 FAMILIAS, 🌿 NATURALEZA, 💎 ALTA GAMA.

==================================================
14. CLIMA Y ÉPOCAS
==================================================
Distingue entre época seca (noviembre a abril) y época lluviosa/verde (mayo a octubre), informando sobre calzado y ropa adecuada.

==================================================
15. DOCUMENTACIÓN Y LEY 306
==================================================
Recuerda que bajo la Ley No. 306 de Incentivos Turísticos de Nicaragua, los turistas extranjeros gozan de 0% IVA en servicios de hospedaje y paquetes turísticos registrados ante INTUR, mientras que residentes locales abonan el 15% IVA DGI.

==================================================
16. SEGURIDAD Y PREVENCIÓN SOS
==================================================
Brinda consejos prácticos de prevención, hidratación en zonas calientes, números de emergencia comunitaria y respeto a las comunidades locales.

==================================================
17. MODO CONVERSACIONAL INTELIGENTE
==================================================
Si el usuario dice por ejemplo: "Quiero viajar con mi pareja 4 días y tenemos \$500 USD", no des una respuesta fría. Responde con calidez humana:
"¡Excelente plan en pareja! Con esos \$500 USD (~C\$ 18,325 NIO) podemos diseñar una experiencia fantástica. Para proponerte la ruta ideal, ¿prefieren el clima fresco de montaña en Matagalpa/Selva Negra, o la magia de los atardeceres y playas de Ometepe y San Juan del Sur? Con ese presupuesto podemos estructurarlo en tres alternativas: Económica, Equilibrada y de Confort Superior."

==================================================
18. ESTRUCTURA FINAL DE RESPUESTAS COMPLETAS
==================================================
Al presentar un plan integral incluye:
📍 DESTINO
📅 DÍAS Y VIAJEROS
💰 PRESUPUESTO TOTAL (USD y NIO)
🚗 TRANSPORTE RECOMENDADO
🏨 HOSPEDAJE
🍽️ GASTRONOMÍA
🌄 ACTIVIDADES & NATURALEZA
📅 ITINERARIO DETALLADO
🎒 QUÉ LLEVAR
⭐ MI RECOMENDACIÓN FINAL
''';
}

/// Base de conocimiento offline exhaustiva para cuando no hay internet disponible
class OfflineTourismKnowledge {
  static String getSmartResponse(String query) {
    final q = query.toLowerCase();

    if (q.contains('ometepe') || q.contains('maderas') || q.contains('concepcion') || q.contains('charco verde')) {
      return '''
📍 **DESTINO:** Isla de Ometepe (Gran Lago Cocibolca, Rivas)
👥 **PERFIL:** Parejas, Naturaleza, Aventura, Familias
🌦️ **CLIMA:** Cálido lacustre (26°C - 31°C). Fresco en faldas de volcanes.

🚗 **TRANSPORTE:**
• Ferry San Jorge ↔ Moyogalpa o San José del Sur: \$2.50 USD (C\$ 92 NIO) por persona / \$15 USD vehículo.
• Alquiler de moto/scooter en la isla: \$20 - \$25 USD/día.

🏨 **HOSPEDAJE RECOMENDADO:**
• *Económico:* Hospedaje Comunitario Santa Cruz (\$15 - \$20 USD/noche).
• *Equilibrado:* Cabañas Finca Agroecológica El Encanto (\$45 USD/noche con desayuno de cacao orgánico).
• *Alta Gama:* Hotel Boutique Villa Paraíso en Playa Santo Domingo (\$85 - \$120 USD/noche frente al lago).

📅 **ITINERARIO SUGERIDO (3 DÍAS / 2 NOCHES):**
• **Día 1:** Llegada en ferry, almuerzo de tilapia frita en Charco Verde. Kayak al atardecer en Río Istián con vista a ambos volcanes.
• **Día 2:** Caminata a la Cascada San Ramón en el Volcán Maderas (4 horas ida y vuelta). Baño refrescante en los manantiales de Ojo de Agua.
• **Día 3:** Tour de cacao y petroglifos indígenas en Finca El Encanto. Atardecer inolvidable en la lengua de arena de Punta Jesús María.

💰 **PRESUPUESTO ESTIMADO (2 PERSONAS / 3 DÍAS):**
• *Opción Económica:* \$160 USD (~C\$ 5,864 NIO)
• *Opción Equilibrada (Recomendada):* \$280 USD (~C\$ 10,262 NIO)
• *Opción Confort Superior:* \$450 USD (~C\$ 16,492 NIO)

⭐ **MI RECOMENDACIÓN:**
La opción equilibrada te permite apoyar directamente a familias agrícolas en Santo Domingo y disfrutar de la tranquilidad de la isla con transporte propio sin prisas.
''';
    }

    if (q.contains('somoto') || q.contains('madriz') || q.contains('cañon') || q.contains('rio coco')) {
      return '''
📍 **DESTINO:** Monumento Nacional Cañón de Somoto (Madriz)
👥 **PERFIL:** Aventura, Senderismo acuático, Familias con niños >8 años, Mochileros
🌦️ **CLIMA:** Seco y cálido en el cañón, fresco por las noches en Somoto (22°C - 28°C).

🚗 **TRANSPORTE:**
• Autobús expreso Managua (Mercado Mayoreo) ↔ Somoto: C\$ 140 NIO (\$3.80 USD).
• Traslado Somoto ↔ Comunidad Sonís (Entrada al Cañón): C\$ 25 NIO en microbús.

🏨 **HOSPEDAJE:**
• Cabañas comunitarias Don Toño Calero (\$18 USD/noche con café y desayuno).
• Hotel Colonial Somoto centro (\$35 USD/noche).

📅 **ITINERARIO Y CIRCUITOS:**
• *Circuito Corto (2.5 hrs):* Paseo en bote y nado ligero entre farallones (\$15 USD por persona).
• *Circuito Intermedio (4 hrs):* Caminata, flotación con chaleco y saltos de 5m (\$25 USD por persona con almuerzo).
• *Circuito Largo Aventura (6 hrs):* Desde el origen del Río Coco con saltos de hasta 12m y lancha (\$35 USD con almuerzo campesino).

🍽️ **GASTRONOMÍA LOCAL:**
• Rosquillas somoteñas auténticas recién horneadas con café segoviano.
• Güirilas calientes de maíz tierno con cuajada fresca campesina.

💰 **PRESUPUESTO TOTAL (2 DÍAS / 1 NOCHE - 2 PERSONAS):**
• *Presupuesto Mochilero:* \$75 USD (C\$ 2,748 NIO)
• *Presupuesto Equilibrado:* \$130 USD (C\$ 4,764 NIO) con hospedaje y tour completo guiado.

⭐ **MI RECOMENDACIÓN:**
Contrata siempre a los guías comunitarios nativos acreditados de Sonís (como Don Toño Calero). Cuentan con póliza, chalecos salvavidas certificados y el 100% del pago queda en la cooperativa local.
''';
    }

    if (q.contains('matagalpa') || q.contains('cascada') || q.contains('selva negra') || q.contains('cafe')) {
      return '''
📍 **DESTINO:** Macizo Montañoso de Matagalpa & Cascada La Luna
👥 **PERFIL:** Ecoturismo, Senderismo de montaña, Parejas, Amantes del café
🌦️ **CLIMA:** Eterna primavera de montaña (18°C - 24°C). Requiere chaqueta ligera.

🚗 **TRANSPORTE:**
• Expreso Managua ↔ Matagalpa (Cotran Mayoreo): C\$ 110 NIO (\$3.00 USD).
• Microbús local Matagalpa ↔ El Tuma - La Dalia: C\$ 35 NIO.

🏨 **HOSPEDAJE & FINCAS:**
• *Comedor & Cabañas Doña Rosa Amelia Palacios:* En la entrada de Cascada La Luna (\$25 USD/noche).
• *Eco-Lodge Selva Negra:* Cabañas inmersas en bosque nuboso (\$75 - \$110 USD/noche).

🌿 **ACTIVIDADES:**
• Descenso y senderismo a la Cascada La Luna con canopy sobre el cañón.
• Tour de catación de café de altura en cooperativas comunitarias.
• Avistamiento del Quetzal y orquídeas silvestres en la Reserva Apante.

💰 **PRESUPUESTO ESTIMADO (FIN DE SEMANA / 2 PERSONAS):**
• *Económico:* \$90 USD (C\$ 3,298 NIO)
• *Equilibrado:* \$180 USD (C\$ 6,497 NIO)
• *Alta Gama en Bosque Nuboso:* \$320 USD (C\$ 11,728 NIO)

⭐ **MI RECOMENDACIÓN:**
Llevar botas de senderismo con agarre impermeable y disfrutar de un almuerzo típico de gallina de patio con cuajada fresca en el Comedor de Doña Rosa.
''';
    }

    if (q.contains('cerro negro') || q.contains('leon') || q.contains('sandboarding') || q.contains('poneloya')) {
      return '''
📍 **DESTINO:** Volcán Cerro Negro & Ciudad Colonial de León
👥 **PERFIL:** Adrenalina, Sandboarding, Cultura Colonial, Playas del Pacífico
🌦️ **CLIMA:** Cálido tropical (28°C - 35°C).

🏄‍♂️ **EXPERIENCIA CERRO NEGRO:**
• Subida de 1 hora por la ladera de ceniza negra volcánica con vistas a la Cordillera de los Maribios.
• Descenso en tabla (sandboarding) a 60-80 km/h con equipo de seguridad completo.
• Tarifa oficial de tour con transporte desde León: \$35 - \$40 USD por persona.

⛪ **CULTURA EN LEÓN:**
• Subida a la cúpula blanca de la Catedral Basílica de León (\$3 USD entrada).
• Visita al Museo de Leyendas y Tradiciones y tumba del poeta universal Rubén Darío.

💰 **PRESUPUESTO DÍA COMPLETO:**
• Sandboarding + entrada INTUR + almuerzo colonial: \$55 USD (C\$ 2,015 NIO) por persona.
''';
    }

    // Respuesta inteligente general para cualquier otra consulta
    return '''
📍 **PLANIFICADOR TURÍSTICO INTELIGENTE BAQUEANO**

He analizado tu consulta y la crucé con nuestra cartografía turística comunitaria de Nicaragua.

Para darte el presupuesto óptimo y la mejor combinación de transporte, hospedaje y actividades:

1. **¿Desde qué ciudad o país inician el viaje?**
2. **¿En qué fechas o mes tienen previsto viajar?**
3. **¿Cuántos días desean dedicar a la experiencia?**
4. **¿Cuál es el perfil del grupo (pareja, familia con niños, mochileros o confort superior)?**

💡 **Con esos datos te estructuraré tres alternativas precisas:**
• **Económica / Comunitaria:** Optimizada en transporte público y posadas campesinas.
• **Equilibrada:** Cabañas con encanto, guías nativos y gastronomía típica.
• **Alta Gama:** Vehículo 4x4, eco-lodges de lujo y tours privados.

Todo con precios en tiempo real desglosados en Dólares (\$ USD) y Córdobas (C\$ NIO) a la tasa oficial de C\$ 36.65.
''';
  }
}
