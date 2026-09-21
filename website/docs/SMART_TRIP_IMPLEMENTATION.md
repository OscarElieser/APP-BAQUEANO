# Evolucion de BAQUEANO hacia el viaje inteligente

## POR QUE

Conectar inspiracion, plan, disponibilidad, reserva, pago, pase y viaje activo
sin inventar datos operativos ni crear una tercera arquitectura.

## COMO

La arquitectura moderna de website es la principal. Firebase es la fuente
primaria. La IA interpreta intencion, pero el catalogo, las fuentes y los
prestadores deciden datos operativos.

## QUE

```text
/baqueano-ai -> trip_plans -> availability_slots -> reservations
  -> trip_bookings -> payment_orders -> trip_passes
  -> /mi-viaje/[tripId] -> /viaje/[tripId]
```

Colecciones existentes: places, businesses, users, reservations y payment_orders.
Colecciones nuevas: trip_plans, trip_bookings, availability_slots,
vehicle_rental_companies, rental_vehicles, data_sources, source_verifications
y trip_passes.

### Protocolo de fuentes

1. Priorizar instituciones y documentos oficiales.
2. Confirmar datos comerciales en canales oficiales del negocio.
3. Usar mapas, redes, fotos y resenas solo como validacion complementaria.
4. No usar TikTok como unica fuente legal, financiera o de seguridad.
5. Guardar URL, nombre, tipo, revisor, fechas, confianza y estado.
6. Marcar contradicciones como disputed y exigir decision humana.
7. Mostrar precios vencidos como sujetos a confirmacion.
8. No hacer scraping prohibido.

### Seguridad requerida antes de produccion

- Viajes: solo propietario y administradores.
- Disponibilidad: escritura de propietario validado o administrador.
- Vehiculos: lectura publica solo si empresa y dato estan publicados.
- Fuentes: escritura solo para revisores.
- Pases: nunca lectura publica por identificador predecible.
- Pagos: solo backend cambia estados financieros.

Las reglas Firestore raiz no se modificaron porque el alcance acordado es
exclusivamente website. El despliegue queda bloqueado hasta aplicar y probar
esas reglas.

### Offline

Se permite cachear itinerario, cultura, contactos y datos preparados. No se
cachean credenciales, datos bancarios, secretos, tokens ni respuestas de pago.
Una copia offline nunca confirma disponibilidad actual.

### Mi Viaje

La ruta /viaje/[tripId] consulta el agrupador real y su TripPlan asociado. No
usa viajes semilla, IDs fijos, alertas inventadas ni contactos de emergencia
incrustados. Si falta una fuente, la interfaz declara que no hay dato verificado.

### Limites externos

- BAC, LAFISE y BANPRO permanecen pendientes de contrato y credenciales.
- No hay APIs autorizadas de redes sociales configuradas.
- No hay proveedor cartografico vial configurado.
- Rentadoras, vehiculos, precios, horarios, emergencias y Day Pass requieren
  investigacion y validacion humana antes de publicarse.
