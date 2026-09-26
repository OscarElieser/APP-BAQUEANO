# Organización de recursos

## POR QUÉ

Mantener imágenes, videos, audio, iconos y datos fuera del código de interfaz, con
rutas predecibles y sin archivos multimedia sueltos en la raíz pública.

## CÓMO

- `images/`: fotografías e ilustraciones agrupadas por tema o página.
- `videos/`: archivos audiovisuales locales con poster y carga de metadatos.
- `audio/`: música y narraciones.
- `icons/`: iconografía y recursos PWA.
- `data/`: catálogos estáticos consumidos por la interfaz.

## QUÉ

No agregar capturas de pruebas en `assets/`; deben ir a `docs/audits/`. Verificar siempre
que el recurso exista, tenga un nombre descriptivo y esté referenciado mediante una ruta
relativa válida.

