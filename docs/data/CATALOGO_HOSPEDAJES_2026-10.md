# Catálogo Verificado de Hospedajes de Nicaragua — Octubre 2026

> 🎯 **POR QUÉ:** Trazabilidad documental del catálogo de hospedajes verificado entregado por el propietario el 2026-10-05 (13 establecimientos con fuentes primarias oficiales, coordenadas, contactos y servicios auditados).
> ⚙️ **CÓMO:** Cargado mediante `tools/data/apply-lodging-catalog-2026-10.mjs` hacia `website/js/territories-data.js`, migración Supabase `supabase/migrations/20261005070000_verified_lodgings_catalog.sql`, mapa interactivo y sincronización de datos con la App Android.
> 📦 **QUÉ:** Texto íntegro del catálogo, reglas cartográficas, esquema Supabase y fichas de hospedaje.

---

```text
BAQUEANO
CATÁLOGO VERIFICADO DE HOSPEDAJES DE NICARAGUA
Hoteles · Hostales · Eco-lodges · Resorts · Hospedajes de naturaleza
Preparado para Supabase, mapa BAQUEANO y BAQUI • Verificación web: 05/10/2026

Criterio aplicado: se priorizan fuentes primarias de los propios establecimientos (sitios oficiales) y fuentes cartográficas abiertas para ubicación. No se fijan precios, porque cambian por fecha, habitación, impuestos y disponibilidad. Cuando la coordenada exacta no está suficientemente respaldada, la ficha queda marcada para validación antes de habilitar navegación.

Reglas para que salgan correctamente en el mapa de BAQUEANO:
1. Cada hospedaje debe guardar latitude y longitude como double precision en Supabase.
2. Usar map_ready = true solamente cuando el punto geográfico sea suficientemente preciso.
3. Usar location_precision = exact | reference | pending.
4. El botón 'Cómo llegar' debe usar el pin verificado del alojamiento, no el centro del municipio.
5. Los precios deben consultarse en tiempo real o mostrarse como 'Consultar disponibilidad y tarifa'.
6. El check azul de BAQUEANO debe depender de verification_status='verified' y de una fuente identificable.
7. BAQUI no debe inventar habitaciones disponibles, precios, teléfonos ni servicios que no estén en la ficha verificada.

Resumen:
Tipo                       Cantidad  Estado
Hotel                             6  Verificado / revisado
Hostal                            1  Verificado / revisado
Hotel boutique                    1  Verificado / revisado
Eco-lodge / resort                1  Verificado / revisado
Hostal / casas árbol              1  Verificado / revisado
Eco-lodge / finca cafetalera      1  Verificado / revisado
Eco-resort                        1  Verificado / revisado
Resort / hotel boutique           1  Verificado / revisado

Fichas de hospedaje:

1. InterContinental Managua at Metrocentro Mall
Tipo: Hotel
Departamento: Managua
Municipio / zona: Managua
Dirección verificada: Frente al Centro Comercial Metrocentro, Managua
Latitud: 12.126600
Longitud: -86.264880
Precisión del mapa: exacta (OpenStreetMap/GeoNames)
Contacto verificado: +505 2276-8989 • inter.mga@r-hr.com
Descripción: Hotel urbano de la cadena InterContinental. Su sitio oficial confirma alojamiento, piscina, restaurantes, gimnasio, estacionamiento y servicios de negocios.
Servicios comprobados: Habitaciones y suites, piscina, restaurantes, gimnasio, estacionamiento, accesibilidad.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: IHG / InterContinental (sitio oficial) (https://www.ihg.com/intercontinental/hotels/es/es/managua/mgahb/hoteldetail)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/es/32287560)
Mapa: https://www.google.com/maps?q=12.1266,-86.26488

2. Hyatt Place Managua
Tipo: Hotel
Departamento: Managua
Municipio / zona: Managua
Dirección verificada: Carretera Masaya km 8.2, Managua
Latitud: 12.101730
Longitud: -86.248280
Precisión del mapa: exacta (OpenStreetMap)
Contacto verificado: +505 2252-7000
Descripción: Hotel de la marca Hyatt Place. Hyatt confirma habitaciones modernas, desayuno, Wi-Fi, piscina exterior y espacios para viajeros de negocios y ocio.
Servicios comprobados: Habitaciones y suites, desayuno, Wi-Fi, piscina, bar, espacios de trabajo.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Hyatt (sitio oficial) (https://www.hyatt.com/hyatt-place/es-ES/mgazm-hyatt-place-managua)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/W286996213)
Mapa: https://www.google.com/maps?q=12.10173,-86.24828

3. Hotel Plaza Colón
Tipo: Hotel
Departamento: Granada
Municipio / zona: Granada
Dirección verificada: Parque Central, Granada, Nicaragua
Latitud: 11.929820
Longitud: -85.954510
Precisión del mapa: exacta (OpenStreetMap)
Contacto verificado: +505 2552-8489 • WhatsApp +505 8590-4062 • reservaciones@hotelplazacolon.com
Descripción: Hotel ubicado frente al Parque Central de Granada. Su web oficial confirma habitaciones, balcones, servicios hoteleros y prácticas de sostenibilidad certificadas.
Servicios comprobados: Habitaciones, Wi-Fi, balcones, servicios turísticos, enfoque de sostenibilidad.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Hotel Plaza Colón (sitio oficial) (https://hotelplazacolon.com/es/inicio/)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/34348452)
Mapa: https://www.google.com/maps?q=11.92982,-85.95451

4. Hotel Darío
Tipo: Hotel
Departamento: Granada
Municipio / zona: Granada
Dirección verificada: Calle La Calzada, Granada
Latitud: 11.930270
Longitud: -85.951610
Precisión del mapa: exacta (OpenStreetMap/GeoNames)
Contacto verificado: Contacto comercial: confirmar en el sitio oficial antes de publicar.
Descripción: Establecimiento hotelero identificado cartográficamente en el centro histórico de Granada, sobre el corredor turístico de Calle La Calzada.
Servicios comprobados: Alojamiento urbano en el centro histórico.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: OpenStreetMap / GeoNames / Wikidata (https://mapcarta.com/es/32290446)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/es/32290446)
Mapa: https://www.google.com/maps?q=11.93027,-85.95161

5. Hotel El Convento
Tipo: Hotel
Departamento: León
Municipio / zona: León
Dirección verificada: Centro histórico de León, Nicaragua
Latitud: 12.435610
Longitud: -86.881900
Precisión del mapa: exacta (OpenStreetMap/GeoNames)
Contacto verificado: Contacto comercial: confirmar en el canal oficial antes de publicar.
Descripción: Hotel ubicado en el centro histórico de León, registrado como alojamiento en OpenStreetMap y GeoNames, a pocos minutos caminando de la Catedral de León.
Servicios comprobados: Alojamiento urbano y patrimonial.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: OpenStreetMap / GeoNames / Wikidata (https://mapcarta.com/es/32808130)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/es/32808130)
Mapa: https://www.google.com/maps?q=12.43561,-86.8819

6. Poco a Poco Hostel
Tipo: Hostal
Departamento: León
Municipio / zona: León
Dirección verificada: 2da calle NO, Iglesia Bautista 1/2 calle arriba, León
Latitud: 12.437010
Longitud: -86.881820
Precisión del mapa: exacta (OpenStreetMap)
Contacto verificado: Hostel +505 8295-5534 • Junior +505 7631-8789
Descripción: Hostal real en León con dormitorios y habitaciones privadas. Su web oficial confirma piscina, cocina, jardín, bar, rooftop, espacios de trabajo y tour desk.
Servicios comprobados: Dormitorios, habitaciones privadas, piscina, cocina, bar, rooftop, espacios de trabajo.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Poco a Poco Hostel (sitio oficial) (https://www.pocoapocohostel.com/)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/N4595638290)
Mapa: https://www.google.com/maps?q=12.43701,-86.88182

7. Hotel Victoriano
Tipo: Hotel boutique
Departamento: Rivas
Municipio / zona: San Juan del Sur
Dirección verificada: Paseo del Rey, San Juan del Sur, Nicaragua
Latitud: 11.250690
Longitud: -85.872710
Precisión del mapa: exacta (OpenStreetMap)
Contacto verificado: +505 8679-0261 • reservaciones@hotelvictoriano.com
Descripción: Hotel frente a la playa de San Juan del Sur. El sitio oficial confirma 25 habitaciones, piscina, restaurante, spa/masajes y alojamiento con Wi-Fi.
Servicios comprobados: Habitaciones, piscina, restaurante, spa, gimnasio, Wi-Fi, frente a la playa.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Hotel Victoriano (sitio oficial) (https://www.hotelvictoriano.com/nosotros.php)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/es/W415533338)
Mapa: https://www.google.com/maps?q=11.25069,-85.87271

8. Morgan's Rock Reserve & Ecolodge
Tipo: Eco-lodge / resort
Departamento: Rivas
Municipio / zona: San Juan del Sur
Dirección verificada: Playa Ocotal, San Juan del Sur, Rivas, Nicaragua
Latitud: 11.305520
Longitud: -85.920490
Precisión del mapa: exacta (Wikidata)
Contacto verificado: WhatsApp +505 8988-7176 • Tel. +505 8670-7676 • reservations@morgansrock.com
Descripción: Eco-lodge y reserva privada en Playa Ocotal. Su web oficial confirma alojamiento y ubicación en San Juan del Sur, además de actividades y experiencias de naturaleza.
Servicios comprobados: Bungalows/villas, naturaleza, playa, gastronomía, actividades de reserva.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Morgan's Rock (sitio oficial) (https://www.morgansrock.com/stay/)
Fuente cartográfica: Wikidata (https://www.wikidata.org/wiki/Q125863965)
Mapa: https://www.google.com/maps?q=11.30552,-85.92049

9. Treehouse Nicaragua
Tipo: Hostal / casas árbol
Departamento: Granada
Municipio / zona: Granada / Comarca Poste Rojo
Dirección verificada: Km 57.5 carretera Granada-Nandaime, Comarca Poste Rojo, Granada
Latitud: Pendiente
Longitud: Pendiente
Precisión del mapa: dirección verificada; coordenada exacta pendiente de validación OSM
Contacto verificado: WhatsApp +505 8550-3093 • hello@treehousenicaragua.com
Descripción: Hostal de selva con casas árbol, habitaciones privadas y dormitorio compartido. Su web oficial confirma su ubicación en km 57.5 de la carretera Granada-Nandaime.
Servicios comprobados: Casas árbol, habitaciones privadas, dormitorio, áreas comunes y eventos.
Estado de verificación: VERIFICADO / PIN PENDIENTE
Map ready: FALSE hasta validar coordenada exacta
Fuente principal: Treehouse Nicaragua (sitio oficial) (https://www.treehousenicaragua.com/hostel)
Fuente cartográfica: Dirección oficial / Google Hotels (https://www.treehousenicaragua.com/find-us)
Mapa: https://www.google.com/maps/search/?api=1&query=Km+57.5+carretera+Granada-Nandaime,+Comarca+Poste+Rojo,+Granada

10. Selva Negra Ecolodge
Tipo: Eco-lodge / finca cafetalera
Departamento: Matagalpa
Municipio / zona: Matagalpa
Dirección verificada: Km 140 carretera Matagalpa-Jinotega, Matagalpa, Nicaragua
Latitud: 12.999080
Longitud: -85.909280
Precisión del mapa: exacta de referencia en el hotel (fuente geográfica)
Contacto verificado: +505 8100-9100 • info@selvanegra.com
Descripción: Hotel y finca cafetalera histórica en las montañas de Matagalpa. Su sitio oficial confirma senderismo, aviturismo, tours de café y cacao y experiencias de naturaleza.
Servicios comprobados: Hotel, cabañas, senderismo, aviturismo, café, cacao, finca, restaurante.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Selva Negra (sitio oficial) (https://www.selvanegra.com/)
Fuente cartográfica: AntWeb / referencia geográfica de Selva Negra Hotel (https://www.antweb.org/locality.do?code=loc12.9990835%2C-85.90928)
Mapa: https://www.google.com/maps?q=12.99908,-85.90928

11. Hotel San José Matagalpa
Tipo: Hotel
Departamento: Matagalpa
Municipio / zona: Matagalpa
Dirección verificada: Detrás de la Iglesia San José, Matagalpa
Latitud: 12.921630
Longitud: -85.918770
Precisión del mapa: exacta (OpenStreetMap)
Contacto verificado: +505 2772-2544 • Móvil +505 8534-9559
Descripción: Hotel urbano en el centro de Matagalpa. Su sitio oficial confirma habitaciones y su ubicación detrás de la Iglesia San José.
Servicios comprobados: Habitaciones, desayuno, Wi-Fi y alojamiento urbano.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Hotel San José Matagalpa (sitio oficial) (https://hotelsanjosematagalpa.com/)
Fuente cartográfica: Mapcarta / OpenStreetMap (https://mapcarta.com/es/N1780589783)
Mapa: https://www.google.com/maps?q=12.92163,-85.91877

12. TOTOCO Eco Resort
Tipo: Eco-resort
Departamento: Rivas
Municipio / zona: Altagracia / Balgüe, Isla de Ometepe
Dirección verificada: Callejón de la Palmera, 800 m arriba, Balgüe, Nicaragua
Latitud: 11.480420
Longitud: -85.521830
Precisión del mapa: coordenada de referencia corroborada con directorios cartográficos; dirección oficial
Contacto verificado: +505 5815-0757 • info@totoco-resort.com
Descripción: Eco resort de Ometepe con cabañas de selva y enfoque regenerativo. Su sitio oficial confirma la dirección, teléfono y experiencias en la isla.
Servicios comprobados: Cabañas, naturaleza, piscina, excursiones, experiencias de Ometepe.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: TOTOCO Eco Resort (sitio oficial) (https://www.totoco-resort.com/contact)
Fuente cartográfica: Near-Place / referencia cartográfica (https://ni.near-place.com/totoco-eco-lodge-callejon-de-la-palmera-800m-arriba-balgue)
Mapa: https://www.google.com/maps?q=11.48042,-85.52183

13. Yemaya Reefs
Tipo: Resort / hotel boutique
Departamento: RACCS
Municipio / zona: Little Corn Island
Dirección verificada: Northern End, Little Corn Island, Nicaragua
Latitud: 12.301950
Longitud: -82.985020
Precisión del mapa: punto de referencia inmediato al hotel; validar pin exacto antes de navegación
Contacto verificado: Reservas Nicaragua +505 5830-2200 • Recepción/WhatsApp +505 8415-5543 • reservations.yemaya@colibriboutiquehotels.com
Descripción: Hotel boutique frente al mar en Little Corn Island. Su web oficial confirma habitaciones frente a la playa, actividades acuáticas, wellness y prácticas de sostenibilidad.
Servicios comprobados: Habitaciones frente al mar, spa/wellness, kayak, snorkel, paddleboard, restaurante.
Estado de verificación: VERIFICADO
Map ready: TRUE
Fuente principal: Yemaya Reefs (sitio oficial) (https://yemayalittlecorn.com/es/inicio/)
Fuente cartográfica: OpenStreetMap / punto turístico inmediato al hotel (https://mapcarta.com/es/N8694728217)
Mapa: https://www.google.com/maps?q=12.30195,-82.98502

Estructura recomendada en Supabase:
Campo                  Tipo              Ejemplo               Regla
id                     uuid              automático            Primary key
name                   text              Poco a Poco Hostel    Nombre canónico
slug                   text              poco-a-poco-hostel    UNIQUE
lodging_type           text              hostel                hotel | hostel | ecolodge | resort | guesthouse | cabin
department             text              León                  Normalizado
municipality           text              León                  Normalizado
address                text              2da calle NO...       Dirección oficial
latitude               double precision  12.43701              Mapa
longitude              double precision  -86.88182             Mapa
location_precision     text              exact                 exact | reference | pending
phone                  text              +505...               Solo verificado
whatsapp               text              +505...               Separado de phone
email                  text              ...                   Solo fuente oficial
website                text              https://...           Sitio oficial
amenities              text[]            {wifi,pool}           Servicios comprobados
price_mode             text              dynamic               dynamic | fixed | contact
verification_status    text              verified              verified | partial | pending | expired
source_url             text              https://...           Obligatorio
coordinate_source_url  text              https://...           Obligatorio si map_ready
verified_at            timestamptz       2026-10-05            Obligatorio
map_ready              boolean           true                  Solo con pin válido
is_published           boolean           true                  Control Ops Center

Recomendación para BAQUI y el mapa:
- BAQUI debe filtrar hospedajes por destino, tipo, rango de presupuesto, servicios y disponibilidad, pero nunca afirmar disponibilidad sin consultar una fuente actual.
- El mapa debe permitir filtros: Hoteles, Hostales, Eco-lodges, Resorts y Otros hospedajes.
- En el popup del marcador mostrar: nombre, tipo, municipio, servicios principales, estado verificado, teléfono/WhatsApp si existe, 'Ver ficha' y 'Cómo llegar'.
- Para precios: usar 'desde' únicamente si proviene de una fuente actual y guardar checked_at. Si no, mostrar 'Consultar tarifa'.
- Los negocios que soliciten aparecer en BAQUEANO deben pasar por Ops Center antes de recibir check azul.
```
