# 🧭 BAQUEANO — EXPERIENCE CONTEXT MODEL

## 🎯 1. POR QUÉ (WHY)
Mantener la continuidad entre páginas, dispositivos y modalidades de uso sin necesidad de rastrear cada movimiento del usuario ni violar su privacidad.

## ⚙️ 2. CÓMO (HOW)
Estructura de datos del contexto unificado:
```typescript
interface ExperienceContextRecord {
  userId?: string;
  sessionId: string;
  channel: "WEB" | "PWA" | "ANDROID" | "KIOSK" | "QR" | "NFC" | "SMART_POINT";
  countryId: string;
  locale: string;
  currency: string;
  activeTripId?: string;
  currentPlaceId?: string;
  currentSmartPointId?: string;
  lastIntent?: string;
  journeyState: "DISCOVERING" | "PLANNING" | "BOOKING" | "UPCOMING" | "ACTIVE" | "COMPLETED";
  updatedAt: string;
}
```

## 📦 3. QUÉ (WHAT)
- **Session Continuity**: Preservación de la ruta de intención tras autenticación exitosa (ej. `/destinos/cerro-negro` -> Login -> `/destinos/cerro-negro`).
- **Contexto Anónimo**: Soporte total de navegación, búsquedas y lectura sin exigir inicio de sesión.
- **Transparencia**: Contexto volátil o local; no se persisten rutas completas de navegación personal en bases de datos analíticas.
