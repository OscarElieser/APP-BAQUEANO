# 🧭 REGLA: Franja viva de lugares y ficha informativa en TODOS los territorios

## 🎯 POR QUÉ
Directiva del propietario (2026-10-05). Ningún territorio es de segunda: los 15 departamentos y las 2 regiones autónomas (RACCN y RACCS), y cualquier territorio que se agregue, ofrecen la misma experiencia bajo su mapa. Cada lugar se explica con información propia, nunca con la de otro lugar.

## ⚙️ CÓMO (obligatorio)
1. **Franja en movimiento automático** bajo el mapa del territorio (`js/madriz-territory-map.js`, módulo único para las tres plantillas):
   - Avance continuo y suave.
   - Pausa al pasar el mouse, al enfocar, al tocar o desplazar, con la ficha abierta, fuera de pantalla o con la pestaña oculta.
   - Desactivado con `prefers-reduced-motion`.
   - Se detiene y limpia al cambiar de territorio.
2. **Ficha informativa** al tocar una tarjeta **o** un pin. Muestra:
   - Nombre y tipo.
   - Ubicación: precisa (etiqueta OSM) o "aproximada".
   - Descripción propia.
   - Mejor época y cómo llegar del territorio.
   - Botones "Cómo llegar" y "Planificar con BAQUI".

   Se cierra con ✕ o Escape. No se duplica con globos emergentes.
3. **Datos:** cada lugar de `website/js/territories-data.js` debe tener:
   - `name`
   - `type`
   - `icon` (`fa-*`)
   - `desc`: descripción propia y verificable de 40 caracteres o más, sin cifras ni datos inventados.

   Cada territorio debe tener `bestSeason` y `howToReach`.
4. **Prohibido** deducir la descripción por coincidencia de palabras con otras secciones: eso mostraba datos de otro lugar.
5. Todo territorio nuevo se agrega a la lista `REQUIRED` de la prueba.

## 📦 QUÉ (cumplimiento verificable)
- Prueba: `website/scripts/territory-places-rule.test.mjs` (`npm run test:territorios`).
- Corre en CI en `deploy-production.yml`, en el job "Validación de scripts". Si un territorio o lugar no cumple, el despliegue falla.
