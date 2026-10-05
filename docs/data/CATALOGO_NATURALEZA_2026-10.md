# Catálogo de naturaleza protegida y paisajes de Nicaragua — octubre 2026

> 🎯 **POR QUÉ:** trazabilidad de `BAQUEANO_NATURALEZA.pdf`, que el propietario entregó el 2026-10-05 (39 registros con coordenadas, precisión y fuente).
> ⚙️ **CÓMO:** cargado con `tools/data/apply-nature-catalog-2026-10.mjs`. Son 23 lugares existentes con coordenadas y 9 nuevos. Los registros duplicados con el mismo punto se fusionaron: los cerros Datanlí, Kilambé y Musún con su reserva, y los miradores de Apaguají y Cueva del Duende con su cueva. Chocoyero y Zapatera conservan la coordenada del catálogo anterior.
> 📦 **QUÉ:** el texto original del catálogo, abajo. Regla aplicada en la web: solo un punto `exact` ofrece "Cómo llegar"; en los demás se ve el área general y se avisa que el acceso está por confirmar.

---

```text
BAQUEANO
CATÁLOGO DE NATURALEZA PROTEGIDA Y PAISAJES DE
NICARAGUA
Lagunas y lagos · Volcanes y cerros · Reservas naturales · Cuevas y cañones · Miradores · Parques y áreas
protegidas
Base geográfica para Supabase, mapa BAQUEANO y BAQUI • Verificación web: octubre 2026
Criterio: se incluyen únicamente lugares cuya existencia y carácter turístico/ambiental cuentan con respaldo
oficial o cartográfico verificable. Las coordenadas se identifican como punto exacto, centro geográfico o
punto de referencia. En áreas extensas no deben interpretarse como una entrada física.
Reglas para el mapa de BAQUEANO

Guardar latitud y longitud como double precision en Supabase.

Agregar location_precision: exact | centroid | reference | access_point.

No usar la coordenada central de una reserva, lago o parque como ruta de acceso. Para navegación se debe crear
access_points separados y verificados.

Mostrar en el mapa solamente registros con map_ready = true.

El check azul debe depender de verification_status = 'verified', no de que exista una coordenada.

BAQUI debe consultar esta base antes de responder y nunca inventar coordenadas, precios, horarios ni accesos.
Resumen del catálogo
Categoría
Registros
Mapa
LAGUNAS Y LAGOS
8
Preparado con coordenadas
VOLCANES Y CERROS
11
Preparado con coordenadas
RESERVAS NATURALES
8
Preparado con coordenadas
CUEVAS Y CAÑONES
3
Preparado con coordenadas
MIRADORES
4
Preparado con coordenadas
PARQUES Y ÁREAS PROTEGIDAS
5
Preparado con coordenadas
LAGUNAS Y LAGOS
Laguna de Apoyo
Departamento / región
Masaya / Granada
Municipio / zona
Catarina, San Juan de Oriente, Diriá y Diriomo
Latitud
11.923441
Longitud
-86.030882
Precisión del punto
centro geográfico del cuerpo de agua
Descripción verificada
Experiencias
Laguna cratérica de origen volcánico y reserva natural. Es uno de
los paisajes lacustres más emblemáticos del Pacífico de Nicaragua.
Kayak, natación en zonas habilitadas, senderismo, observación de
naturaleza, fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA - Plan de Manejo Reserva Natural Laguna de Apoyo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA - Plan de Manejo Reserva Natural Laguna de Apoyo |
Coordenadas: fuente cartográfica
Laguna de Tiscapa
Departamento / región
Managua
Municipio / zona
Managua
Latitud
12.139430
Longitud
-86.270340
Precisión del punto
centro del área protegida
Laguna cratérica ubicada dentro de Managua. La reserva
Descripción verificada
comprende la laguna y la Loma de Tiscapa y fue declarada área
protegida en 1991.
Experiencias
Paisaje urbano, fotografía, interpretación ambiental e histórica.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / MARENA
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / MARENA | Coordenadas: fuente
cartográfica
Laguna de Xiloá
Departamento / región
Managua
Municipio / zona
Mateare - Península de Chiltepe
Latitud
12.221510
Longitud
-86.321960
Precisión del punto
centro del cuerpo de agua
Descripción verificada
Laguna de cráter volcánico situada en la Península de Chiltepe,
dentro de un entorno protegido cercano a Managua.
Experiencias
Baño en sectores habilitados, paisaje, recreación, fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua / OpenStreetMap | Coordenadas: fuente cartográfica
Laguna de Apoyeque
Departamento / región
Managua
Municipio / zona
Mateare - Península de Chiltepe
Latitud
12.244931
Longitud
-86.341497
Precisión del punto
centro del cráter
Laguna ubicada en la caldera del volcán Apoyeque, rodeada de
Descripción verificada
vegetación y paisajes volcánicos. El acceso requiere planificación y
guía local.
Experiencias
Senderismo de aventura, geoturismo, observación panorámica.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua | Coordenadas: fuente cartográfica
Laguna de Asososca
Departamento / región
Managua
Municipio / zona
Managua
Latitud
12.137778
Longitud
-86.313611
Precisión del punto
centro del cuerpo de agua
Descripción verificada
Experiencias
Laguna cratérica y reserva natural al oeste de Managua. Es un
reservorio estratégico de agua para la ciudad.
Paisaje y educación ambiental; acceso condicionado por su
función de abastecimiento.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / MARENA
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / MARENA | Coordenadas: fuente
cartográfica
Lago de Apanás-Asturias
Departamento / región
Jinotega
Municipio / zona
Jinotega
Latitud
13.194444
Longitud
-85.976389
Precisión del punto
centro aproximado del lago
Descripción verificada
Experiencias
Lago artificial de gran importancia hidroeléctrica y ambiental en
Jinotega; reconocido como sitio Ramsar.
Paisaje, pesca recreativa donde esté autorizada, observación de
aves y turismo rural.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Wikidata / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Wikidata / OpenStreetMap
Lago Cocibolca / Lago de Nicaragua
Departamento / región
Varios departamentos
Municipio / zona
Granada, Rivas, Río San Juan, Chontales y otros
Latitud
11.687300
Longitud
-85.478630
Precisión del punto
centro geográfico del lago
El mayor lago de Centroamérica. Alberga islas, archipiélagos,
Descripción verificada
comunidades pesqueras y una amplia diversidad de paisajes y
actividades turísticas.
Experiencias
Navegación, islas, pesca, kayak, fotografía, turismo comunitario.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
OpenStreetMap / GeoNames
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: OpenStreetMap / GeoNames
Lago Xolotlán / Lago de Managua
Departamento / región
Managua / León
Municipio / zona
Managua y municipios ribereños
Latitud
12.339722
Longitud
-86.350556
Precisión del punto
centro geográfico del lago
Descripción verificada
Experiencias
Segundo gran lago de Nicaragua, ligado al paisaje de Managua y a
la cadena volcánica del Pacífico.
Paseos lacustres autorizados, fotografía, paisaje urbano y
volcánico.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / Geographic Names
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / Geographic Names | Coordenadas: fuente
cartográfica
VOLCANES Y CERROS
Volcán Masaya
Departamento / región
Masaya
Municipio / zona
Nindirí / Masaya
Latitud
11.982200
Longitud
-86.162100
Precisión del punto
cumbre/edificio volcánico
Caldera volcánica activa dentro del Parque Nacional Volcán
Descripción verificada
Masaya. INETER reporta actividad volcánica y monitoreo
permanente.
Experiencias
Geoturismo, observación volcánica bajo condiciones oficiales,
fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
INETER / Visit Nicaragua
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: INETER / Visit Nicaragua | Coordenadas: fuente cartográfica
Volcán Mombacho
Departamento / región
Granada
Municipio / zona
Granada / Nandaime
Latitud
11.827320
Longitud
-85.959950
Precisión del punto
cumbre
Volcán cubierto por bosque nuboso y reconocido como reserva
Descripción verificada
natural, con senderos y miradores hacia Granada y el Lago
Cocibolca.
Experiencias
Senderismo, bosque nuboso, observación de flora y fauna,
fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua / OpenStreetMap | Coordenadas: fuente cartográfica
Cerro Negro
Departamento / región
León
Municipio / zona
La Paz Centro / León
Latitud
12.507820
Longitud
-86.703290
Precisión del punto
cumbre/cráter
Descripción verificada
Experiencias
Volcán joven formado en 1850 y uno de los principales sitios de
turismo de aventura del occidente del país.
Senderismo, sandboarding con operador responsable, geoturismo,
fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA / OpenStreetMap | Coordenadas: fuente cartográfica
Volcán Telica
Departamento / región
León
Municipio / zona
Telica
Latitud
12.600000
Longitud
-86.870000
Precisión del punto
cumbre
Descripción verificada
Estratovolcán activo de la Cordillera de los Maribios, monitoreado
por INETER.
Experiencias
Senderismo con guía, geoturismo, paisaje volcánico.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
INETER
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: INETER
Volcán Cosigüina
Departamento / región
Chinandega
Municipio / zona
El Viejo - Península de Cosigüina
Latitud
12.983333
Longitud
-87.566667
Precisión del punto
cumbre/caldera
Descripción verificada
Experiencias
Macizo volcánico aislado en la Península de Cosigüina. Su gran
erupción histórica de 1835 transformó la morfología de la caldera.
Senderismo, observación de laguna cratérica, paisaje del Golfo de
Fonseca.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA / Geographic Names
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA / Geographic Names | Coordenadas: fuente cartográfica
Volcán Concepción
Departamento / región
Rivas
Municipio / zona
Isla de Ometepe
Latitud
11.539010
Longitud
-85.622580
Precisión del punto
cumbre
Descripción verificada
Uno de los dos grandes volcanes de Ometepe y uno de los volcanes
activos más representativos de Nicaragua.
Experiencias
Ascenso exigente con guía experimentado, fotografía, geoturismo.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua / OpenStreetMap | Coordenadas: fuente cartográfica
Volcán Maderas
Departamento / región
Rivas
Municipio / zona
Altagracia - Isla de Ometepe
Latitud
11.444520
Longitud
-85.511970
Precisión del punto
Descripción verificada
cumbre
Volcán cubierto por bosque húmedo y nuboso; su entorno forma
parte de la Reserva de Biosfera Isla de Ometepe.
Experiencias
Senderismo con guía, bosque nuboso, laguna cratérica, fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua / OpenStreetMap | Coordenadas: fuente cartográfica
Cerro Datanlí - El Diablo
Departamento / región
Jinotega
Municipio / zona
Jinotega
Latitud
13.119410
Longitud
-85.879480
Precisión del punto
cumbre Cerro El Diablo
Descripción verificada
Cumbre destacada de la Reserva Natural Cerro Datanlí-El Diablo,
un macizo de nebliselva de alta biodiversidad.
Experiencias
Senderismo, aves, paisaje, naturaleza.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Cerro Kilambé
Departamento / región
Jinotega
Municipio / zona
El Cuá / San José de Bocay / Wiwilí
Latitud
13.581780
Longitud
-85.693130
Precisión del punto
cumbre
Descripción verificada
Experiencias
Montaña de nebliselva en una reserva natural donde nacen
numerosos ríos y existe alta diversidad biológica.
Senderismo especializado, observación de aves, paisaje
montañoso.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Cerro Musún
Departamento / región
Matagalpa
Municipio / zona
Río Blanco
Latitud
12.985360
Longitud
-85.242210
Precisión del punto
cumbre
Descripción verificada
Experiencias
Macizo de bosque húmedo y nuboso, núcleo de la Reserva Natural
Cerro Musún y asociado a cascadas y senderos.
Senderismo, cascadas, flora y fauna, camping responsable.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Cerro Mogotón
Departamento / región
Nueva Segovia
Municipio / zona
Frontera Nicaragua-Honduras
Latitud
13.763062
Longitud
-86.399059
Precisión del punto
cumbre
Descripción verificada
Pico de 2,107 metros registrado por GeoNames, considerado el
punto de mayor elevación del territorio nicaragüense.
Experiencias
Montañismo y senderismo especializado con guía local.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
GeoNames
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: GeoNames
RESERVAS NATURALES
Reserva Natural Cerro Datanlí - El Diablo
Departamento / región
Jinotega
Municipio / zona
Jinotega
Latitud
13.119410
Longitud
-85.879480
Precisión del punto
punto de referencia en Cerro El Diablo
Descripción verificada
Área protegida de nebliselva ubicada a unos 15 km de Jinotega,
con elevaciones que alcanzan alrededor de 1,650 m.
Experiencias
Senderismo, aves, cascadas, paisaje, camping controlado.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Reserva Natural Cerro Kilambé
Departamento / región
Jinotega
Municipio / zona
El Cuá / San José de Bocay / Wiwilí
Latitud
13.581780
Longitud
-85.693130
Precisión del punto
punto de referencia en la cumbre
Descripción verificada
Reserva montañosa de origen volcánico, con bosque de nebliselva
y una importante red de nacientes y ríos.
Experiencias
Senderismo especializado, biodiversidad, aves, paisaje.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Reserva Natural Cerro Musún
Departamento / región
Matagalpa
Municipio / zona
Río Blanco / Matiguás / Paiwas
Latitud
12.985360
Longitud
-85.242210
Precisión del punto
punto de referencia en la cumbre
Descripción verificada
Área protegida de bosque húmedo tropical y bosque nuboso, con
cascadas y alta riqueza de flora y fauna.
Experiencias
Senderismo, cascadas, fotografía, camping y observación de fauna.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Reserva Natural Chocoyero - El Brujo
Departamento / región
Managua / Masaya
Municipio / zona
Ticuantepe
Latitud
11.981200
Longitud
-86.263300
Precisión del punto
centro aproximado del área protegida
Descripción verificada
Reserva de bosque tropical con dos saltos de agua de más de 20
metros y colonias de chocoyos; área protegida desde 1993.
Experiencias
Senderismo, aves, cascadas, ciclismo, camping controlado.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Reserva Natural Tisey - La Estanzuela
Departamento / región
Estelí / León
Municipio / zona
Estelí / San Nicolás / El Sauce
Latitud
13.022200
Longitud
-86.388400
Precisión del punto
centro de referencia de la reserva
Descripción verificada
Área protegida de pinares, robledales y elevaciones montañosas.
Incluye Salto La Estanzuela, miradores y expresiones de arte rural.
Experiencias
Senderismo, cascadas, miradores, arte en piedra, turismo rural.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / Wikidata
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / Wikidata | Coordenadas: fuente
cartográfica
Reserva Natural Estero Padre Ramos
Departamento / región
Chinandega
Municipio / zona
El Viejo
Latitud
12.780910
Longitud
-87.483210
Precisión del punto
centro del estero
Descripción verificada
Experiencias
Área protegida de manglar en la costa del Pacífico norte, de gran
importancia para biodiversidad y medios de vida comunitarios.
Kayak, observación de aves y fauna, recorridos por ramales del
estero.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
Reserva Natural Miraflor - Moropotente
Departamento / región
Estelí
Municipio / zona
Estelí
Latitud
13.210000
Longitud
-86.280000
Precisión del punto
centro aproximado del paisaje protegido
Descripción verificada
Paisaje protegido de montañas, fincas y bosques del norte de
Nicaragua, reconocido por turismo rural, biodiversidad y
producción sostenible.
Experiencias
Agroturismo, senderismo, aves, café, turismo comunitario.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
OpenStreetMap / Wikidata
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: OpenStreetMap / Wikidata
Reserva Natural Península de Chiltepe
Departamento / región
Managua
Municipio / zona
Mateare
Latitud
12.249280
Longitud
-86.350860
Precisión del punto
centro aproximado de la península
Descripción verificada
Área protegida cercana a Managua que integra las calderas y
lagunas de Apoyeque y Xiloá.
Experiencias
Senderismo, geoturismo, paisaje volcánico y lacustre.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo | Coordenadas: fuente cartográfica
CUEVAS Y CAÑONES
Monumento Nacional Cañón de Somoto
Departamento / región
Madriz
Municipio / zona
Somoto - Comunidad de Sonís
Latitud
13.455230
Longitud
-86.703770
Precisión del punto
punto turístico central del cañón
Cañón de aproximadamente 3 km modelado en roca volcánica por
Descripción verificada
el sistema fluvial que forma el río Coco. Es Monumento Nacional
desde 2006.
Experiencias
Senderismo, natación según condiciones, bote/neumático,
geoturismo, rappel con operadores autorizados.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / INETER
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / INETER | Coordenadas: fuente
cartográfica
Cuevas y Mirador de Apaguají
Departamento / región
Estelí / León
Municipio / zona
San Nicolás - Reserva Tisey-La Estanzuela
Latitud
12.968490
Longitud
-86.379140
Precisión del punto
mirador de acceso a la zona de cuevas
Sistema de cuevas y formaciones en la parte alta de Tisey-La
Descripción verificada
Estanzuela. Visit Nicaragua destaca su interés ecológico y la
presencia de murciélagos.
Experiencias
Senderismo, miradores, exploración guiada de cuevas, fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua | Coordenadas: fuente cartográfica
Cueva del Duende - Tisey
Departamento / región
Estelí / León
Municipio / zona
San Nicolás - Tisey-La Estanzuela
Latitud
12.971220
Longitud
-86.380870
Precisión del punto
mirador/punto de referencia próximo a la cueva
Descripción verificada
Experiencias
Cueva mencionada en el plan de manejo de Tisey-La Estanzuela y
asociada a los relieves montañosos de la reserva.
Senderismo y exploración únicamente con guía local y respeto a la
fauna de cuevas.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Plan de Manejo Tisey-La Estanzuela / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Plan de Manejo Tisey-La Estanzuela / OpenStreetMap | Coordenadas:
fuente cartográfica
MIRADORES
Mirador de Catarina
Departamento / región
Masaya
Municipio / zona
Catarina
Latitud
11.913180
Longitud
-86.069030
Precisión del punto
punto exacto del mirador
Descripción verificada
Experiencias
Uno de los miradores más visitados del país. Ofrece vistas hacia
Laguna de Apoyo, Lago Cocibolca, Granada y el Volcán Mombacho.
Paisaje, fotografía, artesanía, gastronomía, senderos y actividades
de aventura.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua | Coordenadas: fuente cartográfica
Mirador Apaguají
Departamento / región
Estelí / León
Municipio / zona
San Nicolás - Tisey-La Estanzuela
Latitud
12.968490
Longitud
-86.379120
Precisión del punto
punto exacto de mirador
Mirador de montaña en la zona alta de Tisey-La Estanzuela, con
Descripción verificada
vistas de bosques mixtos y, en condiciones despejadas, de la
cadena volcánica.
Experiencias
Senderismo, fotografía, paisaje y acceso a cuevas guiadas.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Visit Nicaragua / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Visit Nicaragua / OpenStreetMap | Coordenadas: fuente cartográfica
Mirador Cueva del Duende
Departamento / región
Estelí / León
Municipio / zona
San Nicolás - Tisey-La Estanzuela
Latitud
12.971220
Longitud
-86.380870
Precisión del punto
punto exacto de mirador
Descripción verificada
Punto panorámico en la zona montañosa de Tisey-La Estanzuela,
cercano al sector conocido como Cueva del Duende.
Experiencias
Paisaje, fotografía, senderismo.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: OpenStreetMap
Mirador El Ranchito
Departamento / región
Estelí / León
Municipio / zona
San Nicolás - Tisey-La Estanzuela
Latitud
12.972230
Longitud
-86.378490
Precisión del punto
punto exacto de mirador
Descripción verificada
Mirador rural dentro del conjunto de puntos panorámicos de la
zona de Apaguají/Tisey.
Experiencias
Senderismo, paisaje y fotografía.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: OpenStreetMap
PARQUES Y ÁREAS PROTEGIDAS
Parque Nacional Volcán Masaya
Departamento / región
Masaya
Municipio / zona
Nindirí / Masaya / entorno de la caldera
Latitud
11.983333
Longitud
-86.150000
Precisión del punto
centro aproximado del parque
Parque nacional creado en 1979 alrededor de la caldera volcánica
Descripción verificada
de Masaya y sus cráteres. El acceso depende de las disposiciones
de seguridad de MARENA e INETER.
Experiencias
Geoturismo, interpretación volcánica y fotografía bajo regulación
oficial.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA / Wikidata
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA / Wikidata | Coordenadas: fuente cartográfica
Parque Nacional Saslaya
Departamento / región
RACCN
Municipio / zona
Siuna / zona de Bosawás
Latitud
13.700000
Longitud
-84.860000
Precisión del punto
punto de referencia en zona de amortiguamiento
Descripción verificada
Experiencias
Parque nacional que forma parte del gran sistema de conservación
de Bosawás. Es una zona de bosque tropical y alta biodiversidad.
Turismo científico y de naturaleza altamente controlado; requiere
coordinación local y ambiental.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA - Plan de Manejo Parque Nacional Saslaya
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA - Plan de Manejo Parque Nacional Saslaya
Reserva de Biosfera Bosawás
Departamento / región
Jinotega / RACCN
Municipio / zona
Amplia región del norte y Caribe Norte
Latitud
13.443050
Longitud
-85.144040
Precisión del punto
centro cartográfico de referencia
Una de las áreas de conservación más extensas de Centroamérica y
Descripción verificada
parte central del Corredor Biológico Mesoamericano. Incluye
territorios indígenas y varias áreas núcleo.
Experiencias
Investigación, conservación y turismo de naturaleza únicamente
bajo condiciones y permisos adecuados.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
Mapa Nacional de Turismo / MARENA
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: Mapa Nacional de Turismo / MARENA | Coordenadas: fuente
cartográfica
Reserva Biológica Indio Maíz
Departamento / región
Río San Juan / RACCS
Municipio / zona
Sureste de Nicaragua
Latitud
12.913550
Longitud
-84.679870
Precisión del punto
centro cartográfico de referencia
Descripción verificada
Experiencias
Gran reserva de bosque húmedo tropical en el sureste de
Nicaragua, integrada a la Reserva de Biosfera Río San Juan.
Conservación, investigación y turismo de naturaleza regulado en
sectores autorizados.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA / OpenStreetMap
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA / OpenStreetMap | Coordenadas: fuente cartográfica
Parque Nacional Archipiélago Zapatera
Departamento / región
Granada
Municipio / zona
Lago Cocibolca - Isla Zapatera y archipiélago
Latitud
11.739000
Longitud
-85.835000
Precisión del punto
centro de referencia del archipiélago
Descripción verificada
Experiencias
Área protegida de carácter insular y volcánico en el Lago
Cocibolca, con alto valor natural y arqueológico.
Navegación autorizada, naturaleza, arqueología y turismo
comunitario con operadores locales.
Estado
VERIFICADO / MAP-READY
Fuente de contenido
MARENA - Plan de Manejo
Fecha de verificación
05/10/2026
Abrir mapa: Google Maps | Fuente principal: MARENA - Plan de Manejo
Estructura recomendada en Supabase
Campo
Tipo
Ejemplo
Regla
id
uuid
automático
PK
name
text
Laguna de Apoyo
Nombre canónico
slug
text
laguna-de-apoyo
UNIQUE
category
enum/text
laguna_lago
Catálogo controlado
department
text
Masaya / Granada
Normalizado
municipality
text
Catarina
Normalizado
latitude
double precision
11.923441
Obligatorio para mapa
longitude
double precision
-86.030882
Obligatorio para mapa
location_precision
enum
centroid
description_verified
text
…
Solo hechos respaldados
experiences
text[]
{senderismo,kayak}
Etiquetas
source_url
text
https://…
Obligatorio
coordinate_source_url
text
https://…
Trazabilidad geográfica
verified_at
timestamptz
2026-10-05
Obligatorio
verification_status
enum
verified
map_ready
boolean
true
Sólo con coordenadas válidas
is_published
boolean
true
Control Ops Center
exact | centroid | reference |
access_point
verified | partial | pending |
expired
Tabla adicional: access_points
Para parques, reservas, lagos, volcanes y cañones, BAQUEANO debe separar el punto geográfico del atractivo de los puntos
reales de acceso. Esto evita que 'Cómo llegar' envíe al turista al centro de un lago, bosque o cráter.
Campo
Ejemplo
Uso
Obligatorio
place_id
UUID del lugar
Relación con places
Sí
name
Entrada Catarina
Nombre del acceso
Sí
latitude / longitude
coordenadas exactas
Navegación
Sí
access_type
visitor_center / trailhead / dock
Tipo de acceso
Sí
road_condition
pavimentado / tierra / 4x4
Información vial
Recomendado
requires_guide
true/false
Seguridad
Recomendado
verified_at
fecha
Trazabilidad
Sí
Regla para BAQUI
BAQUI nunca debe decir “te llevo a este punto” usando el centro de un área protegida. Primero debe buscar un
access_point verificado. Si no existe, debe mostrar el atractivo en el mapa y responder: “La ubicación mostrada corresponde
al área general. El punto de acceso está por confirmar.”
BAQUEANO — DESCUBRE LO QUE NO SALE EN EL MAPA
```
