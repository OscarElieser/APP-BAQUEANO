<!--
🎯 POR QUÉ: quien lee BAQUEANO en coreano o chino debe reconocer un lugar o un pueblo
  siempre con el mismo nombre; los catálogos ko/zh (2026-10-09) se tradujeron por lotes.
⚙️ CÓMO: forma fija en `scripts/i18n-glossary-ko-zh.json`, verificada en la puerta
  `npm run i18n` y en CI por `scripts/i18n-cjk-glossary.test.mjs`.
📦 QUÉ: la regla, la tabla vigente y cómo agregar nombres.
-->
# Glosario coreano / chino (ko, zh)

## Regla

1. **Departamentos, regiones y ciudades** se escriben transliterados, con la forma del glosario (그라나다 / 格拉纳达).
2. **Pueblos originarios** también se transliteran (초로테가족 / 乔罗特加人), igual que ya se hacía con 미스키토족 / 米斯基托人.
3. **Nombres propios compuestos** de sitios, negocios, obras o personas quedan en alfabeto latino, porque así aparecen en mapas, letreros y reservas: *Cañón de Somoto*, *León Viejo*, *Finca Magdalena & Ometepe*, *Gallo Pinto*.
4. **Ejemplos de formularios** (placeholder, «예:», «例如») quedan en latín: la persona escribe el nombre real en español.
5. **Marcas** (BAQUEANO, BAQUI, Baqueano AI) nunca se traducen ni transliteran.

## Tabla vigente

| Español | Coreano | Chino |
| --- | --- | --- |
| Managua | 마나과 | 马那瓜 |
| Granada | 그라나다 | 格拉纳达 |
| León | 레온 | 莱昂 |
| Masaya | 마사야 | 马萨亚 |
| Ometepe | 오메테페 | 奥梅特佩 |
| Matagalpa | 마타갈파 | 马塔加尔帕 |
| Jinotega | 히노테가 | 希诺特加 |
| Estelí | 에스텔리 | 埃斯特利 |
| Chinandega | 치난데가 | 奇南德加 |
| Rivas | 리바스 | 里瓦斯 |
| Bluefields | 블루필즈 | 布卢菲尔兹 |
| Boaco | 보아코 | 博阿科 |
| Carazo | 카라소 | 卡拉索 |
| Chontales | 촌탈레스 | 琼塔莱斯 |
| Nueva Segovia | 누에바세고비아 | 新塞哥维亚 |
| Madriz | 마드리스 | 马德里斯 |
| Río San Juan | 리오산후안 | 圣胡安河 |
| Somoto | 소모토 | 索莫托 |
| Chorotegas | 초로테가족 | 乔罗特加人 |
| Nicaraos | 니카라오족 | 尼加拉奥人 |
| Matagalpas | 마타갈파족 | 马塔加尔帕人 |
| Miskitos | 미스키토족 | 米斯基托人 |
| Mayangnas | 마양나족 | 马扬纳人 |

Las formas se tomaron de las que ya predominaban en los catálogos. Siguen pendientes de revisión por hablantes nativos, como el resto de ko/zh.

## Agregar un nombre

1. Añadilo a `scripts/i18n-glossary-ko-zh.json` (`places` o `peoples`) con su forma ko y zh.
2. Corré `npm run test:i18n:glossary`: lista cada texto que use otra forma.
3. Corregí esos textos en `locales/ko.json` y `locales/zh.json`, y luego `npm run export:app-locales` para la app Android.
