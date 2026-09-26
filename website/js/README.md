# Organización JavaScript

## POR QUÉ

Separar el comportamiento por responsabilidad y evitar controladores duplicados sobre
el mismo formulario, botón o componente.

## CÓMO

- `navigation.js` administra navegación, footer y utilidades públicas compartidas.
- `ops-center/` contiene exclusivamente el centro operativo.
- Los demás archivos representan una capacidad concreta del portal.
- `../app.js` permanece en la raíz por compatibilidad con las páginas existentes.

## QUÉ

Cada módulo debe tener encabezado `POR QUÉ`, `CÓMO` y `QUÉ`, validación nula,
manejo defensivo de errores y una sola inicialización por componente.

