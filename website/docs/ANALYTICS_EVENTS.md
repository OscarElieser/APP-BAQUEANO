# ANALYTICS EVENTS

## Why

Medir uso real sin recolectar datos personales innecesarios.

## How

Solo implementar analytics cuando exista autorizacion. Los prompts privados, correos, telefonos y ubicacion GPS precisa no deben enviarse.

## What

| Event name | Purpose | Properties | PII risk | Source |
|---|---|---|---|---|
| destination_view | Entender interes por destino | `placeId`, `departmentId`, `categoryId` | Bajo | Web |
| destination_save | Medir valor de favoritos | `placeId` | Bajo | Web/Auth |
| map_open | Evaluar uso del mapa | `route` | Bajo | Web |
| map_marker_click | Medir exploracion geografica | `placeId` | Bajo | Web |
| business_contact | Medir contacto autorizado | `businessId`, `method` | Medio | Web |
| ai_started | Medir demanda de IA | `route` | Bajo | Web |
| ai_itinerary_generated | Medir exito gateway | `durationMs`, `status` | Medio | API |
| android_download_click | Medir conversion hacia app | `sourceRoute` | Bajo | Web |
| search | Mejorar descubrimiento | `queryLength`, `resultCount` | Medio | Web |
| filter_used | Mejorar filtros | `filterType`, `valueId` | Bajo | Web |
