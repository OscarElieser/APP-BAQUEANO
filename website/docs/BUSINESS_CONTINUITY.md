# 🧭 BUSINESS CONTINUITY — CONTINUIDAD OPERATIVA & DEGRADACIÓN ELEGANTE

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)

Garantizar que Baqueano continúe prestando servicio a exploradores, cooperativas y anfitriones incluso cuando uno o varios proveedores externos experimenten interrupciones prolongadas.

---

## ⚙️ 2. CÓMO (HOW / MATRIZ DE CONTINUIDAD & FALLBACKS)

| Servicio / Dependencia | Impacto Potencial de Caída | Protocolo de Degradación / Fallback | RTO Objetivo | Responsable |
| --- | --- | --- | :---: | --- |
| **Baqueano AI Gateway** | Generador de itinerarios no responde | Desactivación de IA; la web muestra rutas verificadas estáticas por departamento | &lt; 5 min | AI Lead |
| **Google Maps API** | Pines interactivos no renderizan | Visualización en modo texto de coordenadas GPS, rutas de acceso y referencias | &lt; 1 min | Web Lead |
| **Pasarela de Pagos** | Error en confirmación bancaria | Órdenes se marcan como `pending_confirmation` para validación manual | &lt; 15 min | Admin Finanzas |
| **Servicio de Notificaciones** | Retraso en correos o alertas | Eventos encolados en Firestore para reintento automático con backoff exponencial | &lt; 30 min | Ops Lead |
| **Panel de Administración** | Inaccesibilidad temporal | Aplicación móvil Android y web pública continúan 100% operativas | &lt; 1 hora | SRE / DevOps |

---

## 📦 3. QUÉ (WHAT / PROCEDIMIENTOS DE OPERACIÓN MANUAL)

1. **Procedimiento de Validación Manual de Reservas**: Si la pasarela de pagos se degrada, el anfitrión y el explorador reciben confirmación preliminar vía WhatsApp con referencia de orden.
2. **Procedimiento de Contingencia Territorial**: Los comités locales de baqueanos conservan copias físicas o descargadas en app Android de las bitácoras de reservas del día.
