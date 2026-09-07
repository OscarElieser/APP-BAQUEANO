# ADR 0008: PROYECCIÓN Y SANITIZACIÓN DE MODELOS PARA DATOS ABIERTOS

## Estado
Aprobado

## Contexto
Se requiere exponer atractivos y puntos territoriales para el portal de datos abiertos y la API pública sin revelar identificadores internos de propietarios, notas de moderación, números de teléfono privados ni campos de auditoría interna de Firestore.

## Decisión
1. Implementar la capa de transformación `OpenDataPlaceDTO` y `OpenDataSmartPointDTO` que opera como allowlist estricta de campos públicos.
2. Soportar nativamente GeoJSON (RFC 7946) para integración directa en software GIS y mapas (Leaflet, Mapbox, QGIS).
3. Publicar bajo licencia Creative Commons Atribución 4.0 (`CC-BY-4.0`).

## Consecuencias
- Cero fugas de información privada o metadatos de moderación interna.
- Alta interoperabilidad con la comunidad científica e internacional.
