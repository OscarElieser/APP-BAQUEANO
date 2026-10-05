# 🧭 BAQUEANO — Manual de marca, moodboard y kit de assets

## 🎯 POR QUÉ (Propósito)
Que toda pieza (web, app, redes, impresos y presentación) se reconozca como BAQUEANO, sin importar quién la diseñe. Las fuentes de verdad técnicas son `website/css/baqueano-system.css` (tokens `--baqueano-*`) y `docs/design/DESIGN.md`. Este manual las traduce a reglas de marca.

## ⚙️ CÓMO (Sistema)

### 1. Esencia de marca

| Elemento | Definición |
|---|---|
| **Nombre** | BAQUEANO: en Nicaragua, la persona que conoce el camino y guía a otros por el territorio |
| **Promesa** | "Descubrí lo que no sale en el mapa" |
| **Propósito** | Transformar el turismo en una actividad responsable, distribuida, segura y beneficiosa para las comunidades locales |
| **Personalidad** | Cercana, orgullosa, confiable, curiosa y responsable |
| **Arquetipo** | El Explorador, con rasgos del Cuidador |
| **Mascota** | **BAQUI**, un guardabarranco (ave nacional) que guía al viajero (`website/assets/images/heroes/baqui.png`) |

### 2. Voz y tono
- **Voseo nicaragüense** en español: "descubrí", "contame", "planificá".
- Frases cortas y concretas. Se habla de personas y lugares, no de "productos".
- **Prohibido:** prometer precios o datos que no están verificados ("no los invento"), exagerar, usar superlativos vacíos y usar las palabras vetadas por la guía del proyecto.

| Situación | Sí | No |
|---|---|---|
| Invitación | "Contame a dónde querés ir y armamos la ruta." | "¡¡La mejor app del universo!!" |
| Error | "Se me enredó el camino con esa consulta. ¿Me la contás de otra forma?" | "Error 500" |
| Seguridad | "Ante una emergencia llamá al 118 (Policía) o al 128 (Cruz Roja)." | "No te preocupés por nada" |

### 3. Logotipo

| Versión | Archivo | Uso |
|---|---|---|
| Logo completo (blanco) | `website/assets/images/LOGOS/baqueano_logo-completo_2160x1669-blanco.png` | Sobre Noche `#0F172A` o fotografía oscura |
| Logo horizontal | `website/assets/images/LOGOS/baqueano_logo_horizontal.png` | Encabezados web y documentos |
| Ícono oficial | `website/assets/images/LOGOS/baqueano_icono_oficial.png` | Avatares de redes y favicon |
| Ícono blanco 2000 px | `website/assets/images/LOGOS/baqueano_icono_2000x2000-blanco.png` | Impresión y fondos oscuros |
| Launcher Android | `website/assets/images/LOGOS/baqueano_launcher_solid.png` | Ícono de la app |
| Imagen para compartir | `website/assets/images/LOGOS/og-image.jpg` | Open Graph (1200×630) |
| Propuestas (color, blanco, negro) | `website/assets/images/PROPUESTA/baqueano_propuesta_*` | Exploración y versiones monocromas |

**Reglas del logotipo:**
- Área de respeto igual a la altura de la "B" en todos los lados.
- Tamaño mínimo: 32 px digital o 15 mm impreso.
- No deformar, rotar, cambiar colores, poner sombras ni colocarlo sobre fondos sin contraste 4.5:1.

### 4. Color

| Nombre | HEX | Rol | Proporción sugerida |
|---|---|---|---|
| Petróleo Teal | `#165D6F` | Navegación, información, sello "Verificado" | 30 % |
| Naranja Terracota Fuego | `#F65E01` | **Solo** la acción principal (botón, enlace activo, foco) | 10 % |
| Crema Arena Pinolera | `#F4E6C1` | Acentos cálidos sobre Noche, etiquetas | 15 % |
| Noche Profunda | `#0F172A` | Portadas oscuras, footer, texto | 25 % |
| Selva (apoyo) | `#4A7A5A` | Naturaleza y estados de éxito | 5 % |
| Papel de mapa (apoyo) | `#F7F3EA` | Fondo general | 15 % |

**Contraste medido (WCAG 2.1):**

| Texto / fondo | Relación | Uso permitido |
|---|---|---|
| Noche `#0F172A` / Papel `#F7F3EA` | 16.12:1 | Todo texto (AAA) |
| Arena `#F4E6C1` / Noche `#0F172A` | 14.40:1 | Todo texto (AAA) |
| Blanco / Teal `#165D6F` | 7.42:1 | Todo texto (AAA) |
| Noche / Naranja `#F65E01` | 5.54:1 | Todo texto (AA) |
| Blanco / Naranja `#F65E01` | 3.22:1 | **Solo texto grande** (≥ 18.66 px en negrita o ≥ 24 px) o íconos |

| Blanco / Relleno de botón `#C54B01` (`--baqueano-primary-fill`) | 4.79:1 | Botones con texto blanco (AA) |
| Blanco / Relleno hover `#A74001` | 6.22:1 | Estado hover (AA) |

El naranja no se usa como fondo de bloques de texto. Por eso el sitio pinta los botones con el relleno oscurecido `#C54B01`, no con `#F65E01`.

### 5. Tipografía
- **Montserrat** (600–900) para títulos, con mayúsculas en titulares de impacto ("DESTINOS QUE / Inspiran").
- **Plus Jakarta Sans** (400–700) para texto y botones.
- Escala fluida con `clamp()` entre 320 y 1440 px. Interlineado 1.5–1.7 en párrafos.

### 6. Forma, profundidad y movimiento
- **Radios:** 8, 14 y 22 px, y píldora para botones.
- **Sombras:** 3 niveles (sm, md y lg). Glassmorphism con desenfoque sutil sobre fotografía.
- **Movimiento:** animaciones a 60 fps con curvas suaves. Se respeta `prefers-reduced-motion`.
- **Iconografía:** Font Awesome 6 sólido, siempre acompañada de texto o de `aria-label`.

### 7. Fotografía
- Personas reales del territorio con su permiso, luz natural y paisajes con escala humana.
- Sin poses de catálogo ni filtros que alteren los colores reales.
- Crédito al autor cuando corresponda.

## 📦 QUÉ (Moodboard y kit)

### 8. Moodboard (dirección visual)

| Concepto | Referencia en el repositorio | Qué transmite |
|---|---|---|
| Volcán y fuego | `website/assets/images/heroes/` | Energía (naranja terracota) |
| Selva y reservas | `website/assets/images/destinos/` | Naturaleza profunda (Teal y Selva) |
| Pueblos y adobe | `website/assets/images/madriz/`, `departamentos/` | Calidez (Arena) |
| Noche y estrellas | Footer `footer-nicaragua-panorama.png` | Profundidad (Noche) |
| Sabores | `website/assets/images/comida/` | Tradición y mesa compartida |
| Mapa territorial | `mapa-nicaragua-territorial.png` | Orientación y "baqueano" |
| Mascota BAQUI | `heroes/baqui.png`, `baqui-bird.png` | Cercanía y guía |

**Palabras clave del moodboard:** auténtico · territorio · cálido · seguro · comunidad · volcán · selva · camino.

### 9. Kit de assets (entregables listos)

| Activo | Ubicación |
|---|---|
| Logos (PNG transparente, blanco y color) | `website/assets/images/LOGOS/` |
| Mascota BAQUI | `website/assets/images/heroes/baqui*.png`, `website/assets/images/assistant/` |
| Fotografías por territorio | `website/assets/images/departamentos/`, `destinos/`, `madriz/` |
| Tokens de diseño (CSS) | `website/css/baqueano-system.css` |
| Tokens Flutter | `lib/` (`AppColors` y `AppGradients`) |
| Plantillas de piezas de campaña | `05_BRIEF_CREATIVO_Y_CAMPANA.md` (textos y formatos) |
| APK Android | `website/assets/BaqueanoNicaragua.apk` |
