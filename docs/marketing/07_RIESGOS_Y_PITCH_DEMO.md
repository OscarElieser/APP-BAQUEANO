# 🧭 BAQUEANO — Matriz de riesgos, pitch y guion de demo

## 🎯 POR QUÉ (Propósito)
Anticipar lo que puede salir mal (técnico, legal, de contenido y de negocio) con un plan de respuesta, y llegar al jurado con un pitch y una demo ensayados que muestran funciones reales, no maquetas.

## ⚙️ CÓMO (Matriz de riesgos)
- **Probabilidad (P)** e **impacto (I)** de 1 a 3. Severidad = P × I.
- Cada riesgo tiene un control **ya implementado** y su evidencia.

| # | Riesgo | P | I | Sev. | Control implementado | Evidencia |
|---|---|:-:|:-:|:-:|---|---|
| R1 | Fuga o borrado de datos por la clave pública | 2 | 3 | 6 | RLS sin políticas abiertas; tablas solo de servidor; escritura del navegador apagada | `supabase/migrations/20261004235000_rls_hardening.sql`, pruebas pgTAP y pruebas negativas en vivo en CI |
| R2 | Escalada de privilegios | 1 | 3 | 3 | El rol lo decide el servidor (claim o `staff_roles` con correo verificado) | `docs/security/ROLES_Y_PERMISOS.md` |
| R3 | Contenido ofensivo, falso o con datos personales | 2 | 2 | 4 | Moderación previa, denuncias y retiro automático con 3 denuncias; verificación del tipo real de archivo | `supabase/functions/baqueano-community` |
| R4 | BAQUI inventa precios o datos | 2 | 3 | 6 | Solo suma precios verificados; pregunta días y viajeros; prueba automática 17/17 | `docs/evidencias/BAQUI_CASOS_DEMO.md` |
| R5 | Información de un territorio aparece en otro | 2 | 2 | 4 | Plantilla restaurada por territorio; datos por `dept.id`; prueba E2E de los 17 | SESSION_LOG 2026-10-04 |
| R6 | Caída del sitio | 1 | 3 | 3 | Azure con autodespliegue; Firebase Hosting de respaldo; verificación de `/health` en CI | `.github/workflows/deploy-production.yml` |
| R7 | Pocos anfitriones al inicio (huevo y gallina) | 3 | 2 | 6 | Piloto con 10 anfitriones; contenido territorial curado que da valor sin negocios | `06_PLAN_LANZAMIENTO…` |
| R8 | Baja adopción de usuarios | 2 | 2 | 4 | BAQUI como gancho; galería de experiencias; campaña por territorio | `02_OBJETIVOS_SMART…` |
| R9 | Uso de imágenes sin derechos | 2 | 2 | 4 | Fotos propias o con permiso; crédito al autor | `03_MANUAL_DE_MARCA…` §7 |
| R10 | Información de emergencia desactualizada | 1 | 3 | 3 | Solo números nacionales oficiales (118, 128 y 115) y hospital de referencia | `website/js/territory-rich-sections.js` |
| R11 | Fallo de CI o del análisis de seguridad | 1 | 2 | 2 | CodeQL (JS/TS, Java/Kotlin y C/C++) y CI de Flutter en verde | GitHub Actions |

## 📦 QUÉ

### 1. Pitch de 3 minutos

| Tiempo | Bloque | Guion |
|---|---|---|
| 0:00–0:25 | **Gancho** | "¿Cuántos de ustedes planificaron su último paseo en un grupo de Facebook? En Nicaragua los mejores lugares te los cuenta alguien que ya fue. Ese alguien es un baqueano." |
| 0:25–0:55 | **Problema** | Información dispersa y desactualizada; viajeros que llegan y encuentran todo cerrado; comunidades rurales invisibles o dependientes de intermediarios. |
| 0:55–1:40 | **Solución** | BAQUEANO cubre los 17 territorios, cada uno con su mapa, su historia, sus sabores, sus rutas y su SOS. BAQUI planifica entendiendo "somos 2 adultos y 3 niños con 500 dólares". La comunidad comparte experiencias reales moderadas. Los anfitriones se verifican y se contactan directo. Todo en 6 idiomas. |
| 1:40–2:15 | **Por qué funciona** | Arquitectura real y segura: Azure, Firebase Auth, Firestore con espejo verificado en Supabase, RLS con pruebas negativas, roles con Auditor de solo lectura y CI en verde. |
| 2:15–2:45 | **Modelo y metas** | Gratis para viajeros; visibilidad para negocios en fase 2. Metas a 6 meses: 300 experiencias, 120 negocios verificados y los 17 territorios con contenido de la comunidad. |
| 2:45–3:00 | **Cierre** | "BAQUEANO no existe para llevar más turistas a los mismos lugares. Existe para que descubrás lo que no sale en el mapa." |

### 2. Guion de demo en vivo (5 minutos)

1. **Inicio** (`baqueanonicaragua.com`): cambiar el idioma a English y volver a Español. Se ve la persistencia y el `lang` del documento.
2. **Departamento:** tocar la píldora **Rivas**. El mapa muestra solo Rivas con sus pines; las secciones (línea de tiempo, sabores, rutas y SOS) son de Rivas. Repetir con **Madriz** para mostrar la diferencia.
3. **BAQUI** (`baqueano-ia.html`): escribir "Somos 2 adultos y 3 niños, tenemos 500 dólares y queremos ir a Granada, Masaya y León". BAQUI resume y **pregunta los días**. Responder "4 días": aparecen el itinerario de 4 días, el mapa y el presupuesto.
4. **Comunidad** (`testimonios.html`): iniciar sesión con Google, publicar una experiencia con foto. Queda "en revisión".
5. **Ops Center** (`admin.html`):
   - Con la cuenta Admin, aprobar la experiencia; aparece en la galería del inicio.
   - Con la cuenta Auditor, se ve el banner de solo lectura. Al intentar moderar sale el aviso, y el servidor responde 403.
6. **Evidencia técnica** (pestaña de GitHub): pruebas negativas en vivo, pgTAP de RLS, CodeQL en verde y `/health` con el commit desplegado.

### 3. Preguntas probables del jurado

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué Supabase Auth tiene 0 usuarios? | La identidad es Firebase Auth por decisión de arquitectura; Supabase verifica el token de Firebase en las Edge Functions. |
| ¿Cómo evitan que BAQUI invente? | Solo usa datos del catálogo y precios verificados, y pregunta lo que falta. Hay una prueba automática de 17 casos. |
| ¿Cómo ganan dinero? | Visibilidad para negocios verificados en fase 2; los viajeros no pagan. |
| ¿Qué pasa si se cae Azure? | Firebase Hosting sirve un respaldo y el CI verifica `/health` en cada despliegue. |
