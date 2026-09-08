# 🧭 BAQUEANO — OMNICHANNEL CONTINUITY BLUEPRINT

## 🎯 1. POR QUÉ (WHY / PROPÓSITO)
Garantizar que una persona que descubre un destino en su computadora portátil pueda continuar la planificación en su teléfono móvil, interactuar con un Punto Inteligente en el territorio mediante código QR y registrar su visita en su Pasaporte Digital sin interrupciones.

## ⚙️ 2. CÓMO (HOW / ARQUITECTURA)
```text
           ┌──────────────────────────────────────┐
           │          EXPLORADOR EN WEB           │
           │  (Descubrimiento, Planificación)     │
           └──────────────────┬───────────────────┘
                              │ QR Handoff / Login
                              ▼
           ┌──────────────────────────────────────┐
           │          EXPLORADOR EN PWA           │
           │  (Itinerario Offline, Vista Hoy)     │
           └──────────────────┬───────────────────┘
                              │ Llegada a Territorio
                              ▼
           ┌──────────────────────────────────────┐
           │        SMART POINT / KIOSK           │
           │   (Escaneo QR, Check-in Físico)      │
           └──────────────────┬───────────────────┘
                              │ Visita Verificada
                              ▼
           ┌──────────────────────────────────────┐
           │      PASAPORTE DIGITAL BAQUEANO      │
           │   (Sello Territorial, Bitácora)      │
           └──────────────────────────────────────┘
```

## 📦 3. QUÉ (WHAT / PRINCIPIOS CLAVE)
1. **Identidad Continua**: El estado de autenticación y la lista de lugares guardados se mantienen unificados.
2. **Kiosco Seguro**: Un kiosco público genera un código QR para que el usuario abra la ficha en su móvil sin transferir credenciales de sesión.
3. **Android Contract Ready**: La arquitectura deja los contratos listos para su adopción transparente en Android sin haber modificado una sola línea del código Flutter (`/lib`, `/android`).
