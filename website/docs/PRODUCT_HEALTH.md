# 🧭 MATRIZ DE SALUD DE PRODUCTO (PRODUCT HEALTH) — BAQUEANO

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Monitorear de forma holística y continua el estado operacional, la estabilidad técnica, la experiencia de usuario y la viabilidad de costos del ecosistema Baqueano, permitiendo identificar degradaciones tempranas antes de que impacten a los exploradores o anfitriones en territorio.

---

## ⚙️ 2. CÓMO (HOW / CRITERIOS DE CLASIFICACIÓN)
- ✅ **SALUDABLE**: Operación conforme a presupuestos de rendimiento, cero bloqueos, contratos estables y pruebas 100% aprobadas.
- 🟡 **ATENCIÓN**: Funcionalidad operativa pero con dependencias en curso o pendientes de validación en tráfico de campo.
- 🔴 **CRÍTICO**: Bloqueo funcional o falla de seguridad que requiere atención inmediata.
- ⚪ **SIN DATOS**: Dimensión pendiente de telemetría de campo tras lanzamiento público formal.

---

## 📦 3. QUÉ (WHAT / TABLA DE SALUD POR ÁREA)

| Área / Dimensión | Estado | Tendencia | Evidencia / Diagnóstico | Próxima Acción |
|---|---|---|---|---|
| **Portal Web Público** | ✅ SALUDABLE | Estable | Renderizado estático y dinámico operativo en puerto 3000 y hosting. Smoke tests 100% OK. | Monitorear Core Web Vitals en campo |
| **Panel de Control (Admin)** | ✅ SALUDABLE | Estable | Autenticación y navegación operativa en puerto 3001 con gates de seguridad. | Implementar paginación con cursores |
| **Base de Datos Firestore** | 🟡 ATENCIÓN | Estable | Contratos tipados y reglas de seguridad desplegadas; sin pruebas de carga masiva en producción. | Validar índices compuestos en Google Cloud Console |
| **Mapas y Geolocalización** | 🟡 ATENCIÓN | Estable | Visualización y agrupamiento funcional; pendiente configuración de cuotas de API externa. | Configurar alertas de consumo en Cloud Console |
| **Baqueano AI Assistant** | 🟡 ATENCIÓN | Estable | Enrutador seguro con respuesta 501 / Fallback de contingencia activo. | Conectar AI Gateway autenticado en Cloud Functions |
| **Almacenamiento Cloud Storage** | ✅ SALUDABLE | Estable | Reglas de seguridad implementadas con validación de tipo MIME y tamaño máximo de 5 MB. | Automatizar pipeline de transcodificación WebP |
| **Telemetría y Analítica** | 🟡 ATENCIÓN | Positiva | Taxonomía formal definida sin PII; servicio TypeScript listo para capturar eventos de valor. | Activar despacho de eventos al SDK oficial de GA4 |
| **Rendimiento Web (LCP/CLS)** | ✅ SALUDABLE | Estable | LCP < 2.0s y CLS = 0.00 en pruebas sintéticas en 16 viewports. | Auditar en conexiones móviles 3G rurales |
| **Accesibilidad (a11y)** | ✅ SALUDABLE | Estable | Contraste de color verificado, soporte de teclado y compatibilidad con `prefers-reduced-motion`. | Ejecutar pruebas con lectores de pantalla (TalkBack/NVDA) |
| **SEO y Metadatos Territoriales** | ✅ SALUDABLE | Positiva | OpenGraph, Twitter Cards, Sitemap XML y Robots.txt estructurados para los 15 departamentos + regiones. | Monitorear indexación en Google Search Console |
| **Compatibilidad Android** | ✅ SALUDABLE | Intacta | Directorios `/lib`, `/android`, `/test` y `pubspec.yaml` sin modificaciones. | Ejecutar pruebas de regresión en emulador nativo |
