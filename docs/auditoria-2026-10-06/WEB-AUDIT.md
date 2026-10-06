# WEB-AUDIT — baqueanonicaragua.com · 2026-10-06

> 🎯 **POR QUÉ:** el propietario pidió que todos los botones funcionen y que las páginas que falten se creen, sin inventar contenido.
> ⚙️ **CÓMO:**
> - `website/scripts/button-audit.mjs` recorre 30 páginas en Chromium real, a 1366 y 390 px. En cada página revisa los enlaces y hace clic en cada botón para observar si navega, abre una ventana o diálogo, o cambia el DOM.
> - El dominio de producción está bloqueado por la red de este entorno (403 del proxy). Por eso se audita el build de `main` (`dist-hostinger`, mismo código que publica el autodeploy) y el código fuente.
> - Cada arreglo se volvió a probar con clic real.
> 📦 **QUÉ:** inventario, problemas, causa, cambio, prueba y estado.

## 1. Resultado del rastreo

- **Cobertura:** 4900 enlaces y 899 botones probados.
- **Problemas consolidados:** 69.
  - 40 en Ops Center (`<a>` sin href).
  - 13 enlaces en páginas públicas.
  - 16 botones.
- **Detalle:** `docs/production-audit/button-audit.{json,md}`.

## 2. Correcciones verificadas

| Problema | Causa | Archivo | Cambio | Prueba | Estado |
|---|---|---|---|---|---|
| Ops Center: el menú lateral no funciona con teclado ni con enlace directo | `<a class="ops-nav-item">` sin href | `js/ops-center/ops-engine.js` | `href="#<tab>"`, pushState y hashchange (atrás y adelante), `aria-current` | Clic y hash en navegador | 🟢 |
| Crónicas: los 6 filtros no hacían nada | `<a href="#">` sin manejador | `cronicas.html`, `js/cronicas-filter.js` | `<button aria-pressed>`, filtro por temas tomados del propio texto y tema en la URL (`#tema=`) | Café → 1 crónica; Caribe → aviso "sin crónica completa" | 🟢 |
| Crónicas: "12 / 18 / 15 / 9 / 14 relatos" | Contadores sin fuente (la página tiene 3 crónicas) | `cronicas.html` | "Explorar territorio" (i18n ×6) | Inspección | 🟢 |
| Crónicas: "Lo Más Leído" | No hay datos de lectura que lo respalden | `cronicas.html` | "Lecturas recomendadas" | Inspección | 🟢 |
| Crónicas: "Corn Island & Bluefields" abría Madriz | `?id=caribe-sur` no existe y cae al territorio por defecto | `cronicas.html` | `?id=raccs` | Inspección | 🟢 |
| Historia: "Ver más pueblos / personajes / fuentes" sin destino | Anclas inexistentes | `js/historia-enlaces.js`, `js/historia-audioguia.js` | Abren el capítulo de la audioguía, la lista de 17 personas citadas y las 10 fuentes oficiales reales | Diálogos abiertos y capítulo cargado | 🟢 |
| Experiencias: "Explorar experiencias" no bajaba al catálogo | `global-injector.js` pisaba el `id` del `<main>` | `js/global-injector.js` | Respeta el id existente; el salto de navegación usa ese id | `#catalogoExperiencias` existe | 🟢 |
| Mi Viaje: "Imprimir itinerario" salía en blanco | Misma causa: el CSS de impresión apunta a `#printableItinerary` | ídem | ídem | `#printableItinerary` existe | 🟢 |
| Música en celular: play, siguiente, lista, corazón y minimizar no se podían tocar | La barra quedaba debajo de la barra de accesos y los controles se tapaban entre sí | `css/baqueano-identity.css`, `css/pages/musica-exact.css` | La barra sube sobre la de accesos y en móvil usa 2 filas | 7/7 controles alcanzables (`elementFromPoint`) | 🟢 |
| Municipios: solo nombre y una frase | Sin datos verificables | `js/territory-municipalities.js` | Área del contorno, lugares BAQUEANO, mapa, BAQUI y pendientes (i18n ×6) | 4 territorios × 4 anchos: sin desborde, sin errores | 🟢 |
| Textos dinámicos en español con la página en otro idioma | La carga inicial del idioma no avisa a los componentes | `js/global-language.js` | Evento `baqueano:i18nReady`; municipios y destinos verificados se repintan | Inglés completo tras cargar | 🟢 |

## 3. Falsos positivos descartados con evidencia

- **Historia, los 7 "Conocer más":** abren su ficha en un `<dialog>` (`historia-epocas.js`).
- **`offline.html`, "Probar conexión":** recarga a los 600 ms cuando hay red; el rastreador midió después de la recarga.
- **"No clicable" en `#saveTripBtn`, `#purgeStorageBtn`, `#iaBtnPersonalizar` y `.bq-suggestion-close`:**
  - Son elementos dentro de pestañas o secciones que no estaban visibles en ese momento.
  - Se revisan en la siguiente pasada con interacción previa.
  - Estado: 🟡 sin cerrar.

## 4. Pendientes reales (no se resuelven inventando)

- **Crónicas:**
  - Autor "Martín Morales", cita de "Don Silvio Gutiérrez" y "Verificado en territorio".
  - El propietario debe confirmarlos. No se tocaron.
- **Mi Viaje:**
  - Tarjeta "Hotel Boutique Adela · Verificado BAQUEANO · C$ 1,800 / noche".
  - Es un dato de ejemplo con sello y precio, ya listado en el pendiente 6 del traspaso.
- **`offline.html`:** mensajes del script en línea sin i18n.
- **Producción:**
  - La VM Azure sigue sin autodeploy, así que estos arreglos no llegan a la web pública hasta que el propietario lo desbloquee.
  - Comandos: `sudo journalctl -u baqueano-autodeploy -n 100`, `df -h`.

## 5. Repetir

```bash
cd website && node scripts/build-hostinger-static.mjs
python3 -m http.server 8790 --directory dist-hostinger &
BASE_URL=http://127.0.0.1:8790/ QA_WORKERS=4 node scripts/button-audit.mjs
```
