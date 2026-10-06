<!--
POR QUÉ: los PDF oficiales de BAQUEANO deben ser documentos con texto real (seleccionable y
buscable), no capturas ni la impresión del navegador. Además deben funcionar aunque una CDN falle.
CÓMO: copia local revisada de jsPDF; se carga solo cuando alguien pide un PDF.
QUÉ: inventario de librerías de terceros guardadas en el sitio.
-->
# Librerías de terceros guardadas en el sitio

| Archivo | Proyecto | Versión | Licencia | Integridad (npm `dist.integrity`) | Revisión |
|---|---|---|---|---|---|
| `jspdf-4.2.1.umd.min.js` | [jsPDF](https://github.com/parallax/jsPDF) | 4.2.1 | MIT (`jspdf-LICENSE.txt`) | `sha512-YyAXyvnmjTbR4bHQRLzex3CuINCDlQnBqoSYyjJwTP2x9jDLuKDzy7aKUl0hgx3uhcl7xzg32agn5vlie6HIlQ==` | 2026-10-06 |

**Revisión del 2026-10-06:**
- El hash del paquete descargado coincide con el publicado en npm.
- El paquete no hace peticiones de red por sí solo. La única URL externa (`pdfobject` en cdnjs) se usa solo en el modo de salida `pdfobjectnewwindow`, que BAQUEANO no usa.
- `html2canvas`, `canvg` y `dompurify` son opcionales y no se cargan: BAQUEANO no usa `doc.html()`.
- El uso queda acotado a `js/baqueano-pdf.js`.
