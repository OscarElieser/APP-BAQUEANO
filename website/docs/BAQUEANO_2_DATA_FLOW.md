# 🧭 BAQUEANO 2.0 — DATA FLOW & LIFECYCLE

## 1. Flujo de Datos Transaccional y de Experiencia
```text
[ Explorador / Anfitrión ]
          │
          ▼  (HTTPS / TLS 1.3)
[ Next.js Edge / Cloud Functions ] ──► [ Firebase Auth Token Verification ]
          │
          ▼
[ Cloud Firestore (Security Rules Engine) ]
          ├─► Colección `places` (Lectura Pública)
          ├─► Colección `user_saved_places` (Privado: auth.uid)
          ├─► Colección `reservations` (Aislamiento: travelerId / hostId)
          └─► Colección `audit_logs` (Solo Escritura / Solo Admin)
```

## 2. Flujo de Inteligencia Artificial y Herramientas (Function Calling)
```text
[ Prompt de Usuario ]
          │
          ▼
[ AI Gateway / Guardrails Filter ]
          │
          ▼
[ RAG Retrieval & Tool Policy Engine ]
          │ (Evalúa permisos de la herramienta solicitada)
          ▼
[ StrategicMetricsService / ToolRegistry ] ──► (Devuelve métrica real grounded)
          │
          ▼
[ Formateo de Respuesta Narrativa ] ──► [ Explorador / Administrador ]
```
