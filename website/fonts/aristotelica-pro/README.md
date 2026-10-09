# Aristotelica Pro — tipografía oficial de texto de BAQUEANO

Fuente comercial de Zetafonts. No se descarga de repositorios públicos: se copian aquí los archivos de la licencia web de BAQUEANO.

## Archivos esperados (web)

- `AristotelicaPro-Regular.woff2` (400)
- `AristotelicaPro-SemiBold.woff2` (600)
- `AristotelicaPro-Bold.woff2` (700)

## Activación

1. Copiar los `.woff2` en esta carpeta.
2. En `website/css/baqueano-system.css`, sección **0. TIPOGRAFÍAS OFICIALES**, descomentar los `@font-face` de Aristotelica Pro.
3. Android: copiar los `.ttf` en `assets/fonts/aristotelica-pro/` y descomentar el bloque `fonts:` de `pubspec.yaml`.

Hasta entonces, el texto se ve con Aristotelica Pro solo si está instalada en el equipo del visitante. Si no lo está, se usa Plus Jakarta Sans, con el mismo peso.
