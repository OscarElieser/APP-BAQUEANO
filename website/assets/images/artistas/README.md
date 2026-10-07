<!--
🎯 POR QUÉ: las fichas de artistas (historia.html y departamento.html) muestran el logo de BAQUEANO
   con "Foto pendiente" hasta que haya una foto real y autorizada de cada persona.
⚙️ CÓMO: la foto se guarda aquí y se declara en js/territory-artists-data.js; la prueba
   scripts/territory-artists.test.mjs bloquea fotos sin crédito, licencia, fuente o archivo.
📦 QUÉ: carpeta de retratos de artistas (<id>.webp, por ejemplo morales.webp).
-->
# Retratos de artistas

1. Usá solo fotos reales con permiso escrito, licencia libre (por ejemplo CC BY-SA) o de dominio público. Nunca uses imágenes generadas que simulen a la persona.
2. Guardá la foto como `<id>.webp` (unos 800 × 600 px, menos de 150 KB). El `id` es el del artista en `js/territory-artists-data.js`.
3. En ese archivo, agregá al artista:
   `photo: { src: 'assets/images/artistas/<id>.webp', credit: 'Autor o archivo', license: 'CC BY-SA 4.0', sourceUrl: 'https://…' }`
4. Ejecutá `npm run test:artistas` y verificá que pase.

Si la foto no carga, la ficha vuelve sola al logo con "Foto pendiente".
