# Evolucion de BAQUEANO hacia el viaje inteligente

## 🎯 POR QUE

Conectar inspiracion, intencion en lenguaje natural, plan territorial, disponibilidad,
reserva transaccional, pago seguro, pase QR y viaje activo sin inventar datos operativos
ni crear una tercera arquitectura. Preservar la soberania de las comunidades locales y
garantizar transparencia absoluta frente al viajero nacional e internacional.

## ⚙️ COMO

La arquitectura moderna de website (`website/apps/web`, `website/apps/admin` y `website/packages`)
es la base principal de ejecucion. Firebase es la fuente primaria operacional.
La IA interpreta la intencion en lenguaje natural (origen, viajeros, presupuesto, movilidad,
intereses), pero el catalogo territorial, las fuentes documentales auditadas y los prestadores
locales deciden los datos operativos (precios, horarios, ubicaciones y disponibilidad).

## 📦 QUE

```text
/baqueano-ai -> trip_plans -> availability_slots -> reservations
  -> trip_bookings -> payment_orders -> trip_passes
  -> /mi-viaje/[tripId] -> /viaje/[tripId]
```

Colecciones existentes: `places`, `businesses`, `users`, `reservations` y `payment_orders`.
Colecciones nuevas: `trip_plans`, `trip_bookings`, `availability_slots`,
`vehicle_rental_companies`, `rental_vehicles`, `data_sources`, `source_verifications`
y `trip_passes`.

### Protocolo de fuentes y trazabilidad

1. **Nivel 1 Institucional**: Priorizar fuentes oficiales (INTUR, MARENA, MINSA, EAAI, Bomberos, Cruz Roja, Policia).
2. **Nivel 2 Negocio**: Confirmar datos comerciales en canales oficiales del negocio (sitio web oficial, Google Business Profile).
3. **Nivel 3 Validacion complementaria**: Usar redes sociales, fotos recientes y resenas solo para verificar vigencia.
4. **Regla TikTok**: No utilizar TikTok como fuente unica para temas legales, financieros, de seguridad o de precios contractuales.
5. **Metadatos obligatorios**: Almacenar URL, nombre, tipo, revisor, fechas de verificacion, confianza (`high`/`medium`/`low`) y estado (`verified`/`needs_review`/`expired`/`disputed`).
6. **Contradicciones**: Marcar datos en conflicto como `disputed` y exigir decision humana de un administrador.
7. **Caducidad**: Mostrar precios vencidos o no cotizados en fecha como *"Precio sujeto a confirmacion"*.
8. **Legalidad**: Cero scraping prohibido; solo APIs autorizadas o revision editorial humana.

### Movilidad y Rentadoras Verificadas

- **Investigacion Nivel 1 & 2**: Alamo Rent A Car, Avis Rent A Car y Directorio Aeroportuario EAAI (Dollar, Thrifty, Hertz) documentados con hechos corroborados.
- **Niveles Transparentes**:
  - *Directorio Baqueano*: Empresa con existencia e informacion publica verificada.
  - *Verificado ✓*: Empresa con identidad, flota y requisitos auditados documentalmente.
  - *Aliado Baqueano 🤝*: Empresa con relacion formal o coordinacion directa en el ecosistema.
- **Requisitos de Conduccion**: Turistas extranjeros pueden conducir hasta 90 dias con su licencia valida de origen, pasaporte con sello de entrada y tarjeta de credito para garantia.

### Seguridad requerida antes de produccion

- Viajes (`trip_plans`, `trip_bookings`): acceso exclusivo para el titular y administradores autenticados.
- Disponibilidad (`availability_slots`): modificacion solo por el prestador validado o administrador.
- Vehiculos (`rental_vehicles`): lectura publica solo si la empresa y la ficha estan publicadas.
- Fuentes (`data_sources`): escritura exclusiva para revisores y administradores.
- Pases (`trip_passes`): emision y validacion criptografica HMAC-SHA256 en tiempo constante (`/api/trip-pass`); nunca lectura publica por identificador predecible.
- Pagos: solo backend y webhooks bancarios alteran estados financieros; jamas se almacenan datos PAN, CVV o PIN.

### Offline y PWA segura

Se permite cachear itinerario, cultura, contactos de emergencia y datos preparados.
Queda estrictamente prohibido cachear credenciales, datos bancarios, secretos, tokens
o pasarelas de pago. Una copia offline nunca confirma disponibilidad actual.

### Mi Viaje y Centro Operativo

La ruta `/mi-viaje/[tripId]` (y su alias canonico `/viaje/[tripId]`) consulta el agrupador
real en Firestore y su `TripPlanRecord` asociado. Presenta la vista "Hoy en Ruta",
alertas contextuales, emergencias cercanas verificadas y el bloque cultural:
- Conoce tu destino (historia local)
- Que comer (gastronomia tipica verificada)
- Escucha tu destino (patrimonio sonoro sin reproduccion automatica)
- Boton de navegacion y SOS
