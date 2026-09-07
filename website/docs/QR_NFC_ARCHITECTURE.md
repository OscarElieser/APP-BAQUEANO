# ARQUITECTURA DE SEÑALÉTICA FÍSICA: QR & NFC CONTEXTUAL

## 1. Especificaciones de Señalética Física de Campo

Para soportar las condiciones climáticas del trópico nicaragüense (alta radiación solar, humedad de hasta 95%, lluvias torrenciales y niebla en bosques nubosos), las placas de señalética Baqueano siguen especificaciones técnicas rigurosas:

- **Material Base**: Aluminio anodizado marino de 2.0 mm o policarbonato industrial resistente a rayos UV.
- **Grabado**: Láser de alta resolución con contraste oscuro mate antirreflejo.
- **Módulo NFC Integrado**: Chip NXP NTAG213 / NTAG215 encapsulado en resina epóxica (IP68) con aislamiento antimagnético (anti-metal layer) para montaje sobre postes metálicos o madera tratada.

---

## 2. Estructura de URLs y Códigos QR

- **Estructura Canónica de URL**: `https://baqueano.app/p/{slug}` (ejemplo: `https://baqueano.app/p/miraflor-entrada`).
- **Nivel de Corrección de Errores en QR**: Nivel **Q (25%)** o **H (30%)** según estándar ISO/IEC 18004, permitiendo legibilidad incluso con rayones, suciedad parcial o deterioro físico.
- **Tamaño Mínimo Recomendado**:
  - Tótems peatonales a corta distancia (0.5m): 4.0 x 4.0 cm.
  - Carteles informativos a media distancia (1.5m): 8.0 x 8.0 cm.

---

## 3. Resolver Contextual Ultrarrápido (`/p/[slug]`)

1. **Carga en Menos de 500 ms**: Cero librerías pesadas bloqueantes; HTML/CSS optimizado con SSR/Edge Caching para responder de inmediato en redes 3G/EDGE.
2. **Componentes en Pantalla**:
   - Encabezado con estado del punto y semáforo de aforo en vivo (`LOW`, `MODERATE`, `HIGH`).
   - Alertas ambientales y de seguridad activas emitidas por guardaparques.
   - Reproductor nativo de audioguía multilingüe (con soporte offline en PWA).
   - Lista de facilidades y servicios disponibles en el punto (agua, baños, primeros auxilios).
   - Botón directo de llamada de emergencia al puesto de control territorial.
