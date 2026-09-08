# 🧭 BAQUEANO — CHANGELOG

Todas las modificaciones notables del proyecto Baqueano están documentadas en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0-rc.1] - 2026-09-08

### Añadido (Added)
- **Fase 18 (Experience OS)**: Contexto unificado de sesión, Trip Hub contextual `/viaje/[tripId]`, Pasaporte Digital `/pasaporte`, Centro de Notificaciones `/notificaciones` y Centro de Ayuda `/ayuda`.
- **Fase 19 (Strategic Intelligence)**: Executive Cockpit en `/admin/strategic`, Simulador de escenarios `/admin/strategic/scenarios`, Cuadro de Mando Integral `/admin/strategic/scorecard`, Resumen Ejecutivo `/admin/strategic/briefing` y motor de señales estratégicas.
- **Fase 20 (Production Certification)**: Certificación maestra de producción, auditoría cruzada Android/Web, suites de pruebas E2E y runbooks de despliegue/rollback.

### Corregido (Fixed)
- Normalización de rutas relativas para prevenir Open Redirects en enlaces QR.
- Supresión de muestras pequeñas en analítica estratégica para proteger la privacidad comunitaria.
- Degradación elegante en caso de indisponibilidad temporal de mapas o proveedores de IA.

### Seguridad (Security)
- Auditoría completa de reglas de Cloud Firestore y Storage bajo política Default Deny.
- Bloqueo de Prompt Injection y salvaguardas éticas en Function Calling.
- Cero almacenamiento de números de tarjeta bancaria ni CVV.
