# Estructura del sitio web Baqueano

## POR QUÉ

Este documento mantiene ordenado `website/` sin alterar las URLs públicas, el caché
offline, Firebase Hosting ni las aplicaciones Next.js. Sirve como mapa para encontrar
rápidamente páginas, estilos, comportamiento, imágenes, videos, tipografías y colores.

## CÓMO

La organización diferencia entre archivos públicos que deben permanecer en la raíz y
módulos que sí viven en carpetas especializadas. Los nombres y rutas consumidos por el
navegador se conservan para evitar regresiones.

## QUÉ

```text
website/
├── *.html                  Entradas públicas conservadas en la raíz
├── styles.css             Compatibilidad visual global
├── app.js                 Arranque histórico compartido
├── manifest.json          Configuración PWA
├── service-worker.js      Caché y experiencia offline
├── css/                   Estilos por responsabilidad y página
├── js/                    Controladores y módulos JavaScript
├── assets/
│   ├── images/            Imágenes organizadas por contenido
│   ├── videos/            Videos locales
│   ├── audio/             Música y recursos sonoros
│   ├── icons/             Iconografía local
│   └── data/              Catálogos estáticos
├── apps/                  Aplicaciones Next.js web y administración
├── packages/              Paquetes compartidos del workspace
├── docs/
│   ├── audits/            Evidencia gráfica de auditorías
│   └── visual-audit/      Informes responsive automatizados
├── scripts/               Construcción, pruebas y auditorías
├── tests/                 Pruebas de interfaz
└── test-results/logs/     Logs locales no desplegables
```

## HTML y rutas públicas

Los HTML permanecen en la raíz deliberadamente. Moverlos a `html/` cambiaría las rutas,
rompería enlaces relativos y afectaría el `service-worker`. Su organización se consulta
en la tabla "Páginas del portal estático" del `README.md`.

## CSS, tipografía y colores

- `styles.css`: capa global que se mantiene en la raíz por compatibilidad.
- `css/colors.css`: variables y decisiones cromáticas.
- `css/typography.css`: familias, pesos y escalas tipográficas.
- `css/layout.css`: estructura adaptable.
- `css/components.css` y `css/modules.css`: piezas reutilizables.
- `css/pages/`: ajustes exclusivos por página.

Paleta oficial:

| Rol | Valor |
|---|---|
| Petróleo | `#165D6F` |
| Terracota | `#F65E01` |
| Arena | `#F4E6C1` |
| Tinta | `#0F172A` |

Las tipografías web se cargan desde Google Fonts en los HTML que las necesitan. Antes
de agregar una familia nueva se debe comprobar que no exista ya en `css/typography.css`.

## Imágenes y videos

- Toda imagen nueva se guarda bajo `assets/images/<tema>/`.
- Todo video local se guarda en `assets/videos/`.
- Los nombres deben describir el contenido y evitar duplicados.
- Las imágenes HTML requieren `alt`, dimensiones cuando sea posible y carga diferida
  fuera del primer viewport.
- Los videos requieren `poster`, `preload="metadata"` y controles accesibles.

## JavaScript

- `js/navigation.js`: navegación y comportamiento institucional compartido.
- `js/ops-center/`: funciones exclusivas del centro operativo.
- `js/*.js`: módulos funcionales del portal estático.
- `app.js`: compatibilidad histórica; no debe moverse sin migrar todos sus consumidores.

## Documentación del código

Cada archivo nuevo o modificado debe explicar `POR QUÉ`, `CÓMO` y `QUÉ` en su
encabezado. Las funciones complejas deben documentar decisiones, entradas, salidas y
casos defensivos. No se comenta literalmente cada línea: eso oculta la lógica y vuelve
obsoletos los comentarios. Se documentan bloques y decisiones que aportan contexto real.

## Archivos que no se despliegan

Capturas de auditoría, reportes y logs pertenecen a `docs/audits/`,
`docs/visual-audit/` o `test-results/logs/`. Nunca deben volver a la raíz pública.

