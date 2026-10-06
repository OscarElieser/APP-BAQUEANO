# Fuentes de datos de terceros

> 🎯 POR QUÉ: los 153 municipios necesitan un contorno verificable para calcular su área y su caja envolvente sin inventar datos.
> ⚙️ CÓMO: copia sin modificar del archivo publicado por geoBoundaries. La lee `tools/data/build-municipalities.mjs`. No se sirve al navegador.
> 📦 QUÉ: `geoBoundaries-NIC-ADM2_simplified.geojson`, con 153 contornos municipales de Nicaragua.

- Origen: https://github.com/wmgeolab/geoBoundaries/tree/main/releaseData/gbOpen/NIC/ADM2 (boundaryID NIC-ADM2-1004716, buildDate 2023-12-12). Descargado el 2026-10-06.
- sha256: `2a77bdfd3fc8917d0fb38128ea64413cb920f3a6b8cf09f9366182336120058d`
- Fuente primaria: OpenStreetMap (Wambacher). Licencia: **Open Data Commons Open Database License 1.0 (ODbL)**. Atribución obligatoria: "© OpenStreetMap contributors · geoBoundaries (William & Mary geoLab)". La web la muestra al pie de la sección de municipios.
- Limitaciones conocidas:
  - Algunos nombres traen erratas ("Dipilito", "Ciudad Darco"…). Se corrigen con los ALIAS revisados del script.
  - En municipios lacustres o costeros el contorno incluye agua.
