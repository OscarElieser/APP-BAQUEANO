# Sprint 3 — Integración, autonomía y correspondencia con GitHub

<!--
🎯 POR QUÉ: probar que un usuario navega sin ajustes y que Azure persiste datos reales.
⚙️ CÓMO: valida rutas públicas, APK, commit desplegado y un CRUD efímero protegido por RLS.
📦 QUÉ: índice privado de la demostración final y sus resultados reproducibles.
-->

## Flujo automático

`tools/verify-sprints.mjs` comprueba:

1. Home → destinos → mapa → mi viaje → perfil.
2. Descarga del APK en `/downloads/baqueano-android.apk`.
3. Crear → leer → actualizar → eliminar mediante Azure y Supabase.
4. Limpieza automática del registro de evidencia.
5. Igualdad entre commit esperado, GitHub `main` y `/health`.

La grabación final debe guardarse como `resultados/navegacion-final.mp4`; no se
incluye en el build público.

