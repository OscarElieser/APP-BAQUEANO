# 🧭 BAQUEANO — EXPERIENCE DEEP LINKING ARCHITECTURE

## 🎯 1. POR QUÉ (WHY)
Permitir que enlaces compartidos, códigos QR, etiquetas NFC y notificaciones lleven directamente al contenido exacto de forma segura e instantánea.

## ⚙️ 2. CÓMO (HOW)
- **Rutas Canónicas Permitidas**:
  - `/destinos/[slug]`
  - `/negocios/[id]`
  - `/viaje/[tripId]`
  - `/pasaporte`
  - `/reservas/[id]`
  - `/territorios/[slug]`
  - `/rutas/[id]`
  - `/kiosk/[smartPointId]`
- **Prevención de Open Redirect**: `DeepLinkResolverService` valida estrictamente que la ruta comience con `/` y rechaza prefijos maliciosos como `//` o esquemas `javascript:`, `data:`, `https://externo.com`.
- **Protección de Recursos Privados**: Viajes no compartidos públicamente y detalles de reservas exigen sesión autenticada activa antes de mostrar datos confidenciales.

## 📦 3. QUÉ (WHAT)
- Resolución universal de links con soporte para parámetros de contexto seguro (`?ref=qr`, `?sp=point-123`).
